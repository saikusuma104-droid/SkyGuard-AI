import React, { useState, useEffect } from 'react';
import { 
  NavigationSection, 
  AWSStation, 
  AnomalyRecord, 
  StationStatus, 
  NetworkOverviewStats,
  AuthUser
} from './types';
import { STATIONS, INITIAL_ANOMALIES, NETWORK_STATS } from './data/mockData';
import { authService } from './auth/authService';
import { fetchDirectOpenMeteoDataFor7Stations, checkAnomaly } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { NetworkStats } from './components/NetworkStats';
import { IndiaMap } from './components/IndiaMap';
import { RecentAnomalies } from './components/RecentAnomalies';
import { AnomalyDetailModal } from './components/AnomalyDetailModal';
import { StationDetailModal } from './components/StationDetailModal';

// Active View Components
import { AllAnomaliesView } from './components/AllAnomaliesView';
import { StationsListView } from './components/StationsListView';
import { AboutView } from './components/AboutView';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [stations, setStations] = useState<AWSStation[]>(STATIONS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [stats, setStats] = useState<NetworkOverviewStats>(NETWORK_STATS);
  
  // Last Refreshed Time tracking for 1-Hour live data interval
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => 
    new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST'
  );

  // Interactive Modals
  const [selectedStation, setSelectedStation] = useState<AWSStation | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  
  // Filter on Dashboard Map & Stats
  const [selectedFilter, setSelectedFilter] = useState<StationStatus | 'all'>('all');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleTriggerHourlyRefresh = async (showToast = true) => {
    try {
      const liveReadings = await fetchDirectOpenMeteoDataFor7Stations(stations);
      const timeNow = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      
      const newAnomalies: AnomalyRecord[] = [];
      let healthyCnt = 0;
      let suspiciousCnt = 0;
      let anomalyCnt = 0;

      const updatedStations = await Promise.all(
        stations.map(async (origStation) => {
          const live = liveReadings.find((r) => r.stationId === origStation.id);
          if (!live) return origStation;

          const temp = live.temperature;
          const press = live.pressure;
          const hum = live.humidity;

          // Perform backend / ML anomaly check for live telemetry
          const mlResult = await checkAnomaly({
            stationId: origStation.id,
            timestamp: timeNow,
            temperature: temp,
            dewPointTemperature: Math.round((temp - (100 - hum) / 5) * 10) / 10,
            pressure: press,
            relativeHumidity: hum,
            windSpeed: live.windSpeed || 2.5,
          });

          const isAnomaly = mlResult.anomaly || mlResult.severity === 'CRITICAL' || mlResult.severity === 'HIGH';
          const isSuspicious = !isAnomaly && (mlResult.severity === 'MEDIUM' || temp > 43.0 || press < 970.0 || press > 1035.0);

          const status: StationStatus = isAnomaly ? 'anomaly' : isSuspicious ? 'suspicious' : 'healthy';

          let anomalyRecord: AnomalyRecord | undefined = undefined;
          if (isAnomaly || isSuspicious) {
            anomalyRecord = {
              id: `ANOM-${origStation.id}-${Date.now()}`,
              stationId: origStation.id,
              stationName: origStation.name,
              location: origStation.location,
              state: origStation.state,
              parameter: temp > 43 ? 'temperature' : press < 970 ? 'pressure' : 'multi_sensor',
              title: mlResult.severity === 'CRITICAL' ? 'Thermodynamic Limit Violation' : 'Telemetry Variance Flag',
              classification: 'Hybrid Rule + Isolation Forest Detection',
              actualValue: `${temp}°C / ${press} hPa / ${hum}%`,
              expectedValue: `Normal Range: 15-42°C | 980-1030hPa`,
              anomalyScore: mlResult.anomaly_score || (isAnomaly ? -0.15 : 0.10),
              confidence: isAnomaly ? 95 : 85,
              severity: (mlResult.severity as any) || (isAnomaly ? 'CRITICAL' : 'MEDIUM'),
              timestamp: timeNow,
              reason: mlResult.reason || `Telemetry check at ${timeNow}.`,
              rootCauseHypothesis: 'Environmental boundary shift or sensor calibration drift.',
              physicalLawValidation: 'Validated against thermodynamic reference limits.',
              recommendation: 'Inspect station telemetry and run physical transducer audit.',
              status: 'active',
              nearestNeighbors: [],
              historicalContext: 'Evaluated against hybrid Rule Engine and Isolation Forest model.',
            };
            newAnomalies.push(anomalyRecord);
          }

          if (status === 'anomaly') anomalyCnt++;
          else if (status === 'suspicious') suspiciousCnt++;
          else healthyCnt++;

          return {
            ...origStation,
            status,
            trustScore: isAnomaly ? 25 : isSuspicious ? 70 : 100,
            lastPing: timeNow,
            lastPacketReceivedAgo: 'Just now',
            currentReadings: {
              ...origStation.currentReadings,
              temperature: temp,
              pressure: press,
              humidity: hum,
              windSpeed: live.windSpeed || origStation.currentReadings.windSpeed,
            },
            activeAnomaly: anomalyRecord,
          };
        })
      );

      setStations(updatedStations);
      setAnomalies(newAnomalies);
      setLastRefreshedAt(timeNow);

      setStats({
        totalStations: updatedStations.length,
        healthyCount: healthyCnt,
        suspiciousCount: suspiciousCnt,
        anomalyCount: anomalyCnt,
        offlineCount: 0,
        networkSensorHealthPercent: Math.round((healthyCnt / updatedStations.length) * 100),
        sensorTypeHealth: {
          temperature: { healthyPercent: Math.round(((updatedStations.length - anomalyCnt) / updatedStations.length) * 100), count: updatedStations.length, degraded: suspiciousCnt, critical: anomalyCnt },
          pressure: { healthyPercent: 100, count: updatedStations.length, degraded: 0, critical: 0 },
          humidity: { healthyPercent: 100, count: updatedStations.length, degraded: 0, critical: 0 },
        },
        totalPacketsProcessedToday: 17071 + updatedStations.length,
        anomaliesDetectedToday: newAnomalies.length,
      });

      if (showToast) {
        handleActionComplete(`Refreshed real telemetry for 7 AWS stations (${timeNow}).`);
      }
    } catch (e) {
      console.error('Hourly live refresh error:', e);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    handleTriggerHourlyRefresh(false);

    // 1-Hour automated refresh cycle (3,600,000ms = 1 Hour)
    const interval = setInterval(() => {
      handleTriggerHourlyRefresh(true);
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setSelectedStation(null);
    setSelectedAnomaly(null);
    setIsStationModalOpen(false);
    setIsAnomalyModalOpen(false);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    handleActionComplete(`Authenticated as ${user.name} (${user.role})`);
  };

  const handleOpenAnomaly = (anomaly: AnomalyRecord) => {
    setSelectedAnomaly(anomaly);
    const station = stations.find((s) => s.id === anomaly.stationId) || null;
    setSelectedStation(station);
    setIsAnomalyModalOpen(true);
  };

  const handleSelectStation = (station: AWSStation) => {
    setSelectedStation(station);
    setIsStationModalOpen(true);
  };

  const handleActionComplete = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => setNotificationToast(null), 5000);
  };

  // If not authenticated, present Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B111E] text-slate-100 font-sans">
      {/* 1. Persistent Left Navigation Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        totalStationsCount={stations.length}
        anomalyCount={stats.anomalyCount}
        suspiciousCount={stats.suspiciousCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 2. Top Header Bar */}
        <Header
          stations={stations}
          onSelectStation={handleSelectStation}
          anomalyCount={stats.anomalyCount}
          currentUser={currentUser}
          onLogout={handleLogout}
          lastRefreshedAt={lastRefreshedAt}
          onTriggerHourlyRefresh={() => handleTriggerHourlyRefresh(true)}
        />

        {/* Action / Notification Toast */}
        {notificationToast && (
          <div className="absolute top-20 right-6 z-40 bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 text-xs px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md transition-all animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{notificationToast}</span>
          </div>
        )}

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentSection === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* 1. Network Overview Statistics (4 Cards) */}
              <NetworkStats
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={(filter) => setSelectedFilter(filter)}
              />

              {/* 2. Live AWS Map */}
              <IndiaMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
                onOpenAnomalyModal={(station) => {
                  if (station.activeAnomaly) {
                    handleOpenAnomaly(station.activeAnomaly);
                  } else {
                    handleSelectStation(station);
                  }
                }}
                activeFilter={selectedFilter}
                onFilterChange={(filter) => setSelectedFilter(filter)}
              />

              {/* 3. Recent Anomalies */}
              <div className="max-w-7xl mx-auto">
                <RecentAnomalies
                  anomalies={anomalies}
                  onSelectAnomaly={handleOpenAnomaly}
                  onViewAllAnomalies={() => setCurrentSection('anomalies')}
                />
              </div>
            </div>
          )}

          {currentSection === 'anomalies' && (
            <div className="max-w-7xl mx-auto">
              <AllAnomaliesView
                anomalies={anomalies}
                stations={stations}
                onSelectAnomaly={handleOpenAnomaly}
                onBackToDashboard={() => setCurrentSection('dashboard')}
              />
            </div>
          )}

          {currentSection === 'stations' && (
            <div className="max-w-7xl mx-auto">
              <StationsListView
                stations={stations}
                onSelectStation={handleSelectStation}
                onBackToDashboard={() => setCurrentSection('dashboard')}
              />
            </div>
          )}

          {currentSection === 'about' && (
            <div className="max-w-7xl mx-auto">
              <AboutView
                onBackToDashboard={() => setCurrentSection('dashboard')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Anomaly Diagnostic Modal */}
      {isAnomalyModalOpen && selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          station={selectedStation}
          onClose={() => {
            setIsAnomalyModalOpen(false);
            setSelectedAnomaly(null);
          }}
          onActionComplete={handleActionComplete}
        />
      )}

      {/* Full Station Telemetry Modal */}
      {isStationModalOpen && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => {
            setIsStationModalOpen(false);
            setSelectedStation(null);
          }}
          onOpenAnomalyDetail={() => {
            if (selectedStation.activeAnomaly) {
              setIsStationModalOpen(false);
              setSelectedAnomaly(selectedStation.activeAnomaly);
              setIsAnomalyModalOpen(true);
            }
          }}
        />
      )}
    </div>
  );
}
