import React, { useState, useEffect, useRef } from 'react';
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
import { DemoModal } from './components/DemoModal';

// Active View Components
import { AllAnomaliesView } from './components/AllAnomaliesView';
import { StationsListView } from './components/StationsListView';
import { HistoricalDataView } from './components/HistoricalDataView';
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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Demo Simulation Result state to display on Dashboard UI
  const [demoResult, setDemoResult] = useState<{
    stationId: string;
    temperature: number;
    pressure: number;
    humidity: number;
    status: string;
    anomalyScore: number;
    reason: string;
    timestamp: string;
  } | null>(null);
  
  // Filter on Dashboard Map & Stats
  const [selectedFilter, setSelectedFilter] = useState<StationStatus | 'all'>('all');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Guard against concurrent duplicate refresh triggers
  const isRefreshingRef = useRef<boolean>(false);

  const handleTriggerHourlyRefresh = async (showToast = true) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

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

          // Calculate Sea Level Pressure based on station elevation for high-altitude nodes like Coonoor (1850m)
          const elevation = origStation.elevationM || 0;
          const seaLevelPress = elevation > 0 
            ? Math.round(press * Math.pow(1 - (0.0065 * elevation) / 288.15, -5.255) * 10) / 10
            : press;

          // Perform backend / ML anomaly check for live telemetry
          const mlResult = await checkAnomaly({
            stationId: origStation.id,
            timestamp: timeNow,
            temperature: temp,
            dewPointTemperature: Math.round((temp - (100 - hum) / 5) * 10) / 10,
            stationLevelPressure: press,
            seaLevelPressure: seaLevelPress,
            relativeHumidity: hum,
            windSpeed: live.windSpeed || 2.5,
            visibility: 10.0,
          });

          const isAnomaly = mlResult.anomaly === true || mlResult.status === 'ANOMALY';
          const isSuspicious = !isAnomaly && mlResult.status === 'WARNING';
          const status: StationStatus = isAnomaly ? 'anomaly' : isSuspicious ? 'suspicious' : 'healthy';

          let anomalyRecord: AnomalyRecord | undefined = undefined;
          if (isAnomaly) {
            anomalyRecord = {
              id: `ANOM-${origStation.id}-${Date.now()}`,
              stationId: origStation.id,
              stationName: origStation.name,
              location: origStation.location,
              state: origStation.state,
              parameter: temp > 45 || temp < -10 ? 'temperature' : press < 800 || press > 1080 ? 'pressure' : 'multi_sensor',
              title: 'Weather Parameter Anomaly',
              classification: 'Isolation Forest Anomaly Detection',
              actualValue: `${temp}°C / ${press} hPa / ${hum}% RH`,
              expectedValue: 'Expected Station Baseline',
              anomalyScore: mlResult.anomaly_score !== undefined ? mlResult.anomaly_score : 50.0,
              confidence: 95,
              severity: 'CRITICAL',
              timestamp: timeNow,
              reason: mlResult.reason || `Anomaly score: ${mlResult.anomaly_score?.toFixed(1)}/100`,
              rootCauseHypothesis: 'Parameter departure from expected operating range.',
              physicalLawValidation: 'Physical parameter check.',
              recommendation: 'Inspect station reading and sensor accuracy.',
              status: 'active',
              nearestNeighbors: [],
              historicalContext: 'Isolation Forest Model Detection',
            };
            newAnomalies.push(anomalyRecord);
          }

          if (status === 'anomaly') anomalyCnt++;
          else if (status === 'suspicious') suspiciousCnt++;
          else healthyCnt++;

          return {
            ...origStation,
            status,
            trustScore: status === 'anomaly' ? 25 : status === 'suspicious' ? 70 : 100,
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
    } finally {
      isRefreshingRef.current = false;
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

  const handleSimulateDemo = async (data: {
    stationId: string;
    temperature: number;
    pressure: number;
    humidity: number;
  }) => {
    const result = await checkAnomaly({
      stationId: data.stationId,
      temperature: data.temperature,
      stationLevelPressure: data.pressure,
      relativeHumidity: data.humidity,
      dataSource: 'DEMO',
    });

    const statusStr = result.status || (result.anomaly ? 'ANOMALY' : 'NORMAL');
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';

    setDemoResult({
      stationId: data.stationId,
      temperature: data.temperature,
      pressure: data.pressure,
      humidity: data.humidity,
      status: statusStr,
      anomalyScore: result.anomaly_score !== undefined ? result.anomaly_score : (result.anomaly ? 85.0 : 0.0),
      reason: result.reason || 'Hybrid Detector evaluation complete.',
      timestamp: timeNow,
    });

    setIsDemoModalOpen(false);

    setStations((prevStations) =>
      prevStations.map((st) => {
        if (st.id === data.stationId) {
          const isAnomaly = statusStr === 'ANOMALY' || result.anomaly;
          const isWarning = !isAnomaly && statusStr === 'WARNING';
          const stStatus: StationStatus = isAnomaly ? 'anomaly' : isWarning ? 'suspicious' : 'healthy';

          return {
            ...st,
            status: stStatus,
            trustScore: isAnomaly ? 25 : isWarning ? 70 : 100,
            currentReadings: {
              ...st.currentReadings,
              temperature: data.temperature,
              pressure: data.pressure,
              humidity: data.humidity,
            },
          };
        }
        return st;
      })
    );

    handleActionComplete(`Demo simulation stored in PostgreSQL for ${data.stationId}`);
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
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
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
              {/* DEMO MODE Active Result Banner */}
              {demoResult && (
                <div id="demo-mode-result-card" className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative animate-fade-in space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                        DEMO MODE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        Persisted in PostgreSQL ({demoResult.timestamp})
                      </span>
                    </div>
                    <button
                      onClick={() => setDemoResult(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      title="Dismiss Demo Result Card"
                    >
                      Dismiss ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Station</span>
                      <span className="text-cyan-300 font-bold text-sm">{demoResult.stationId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Temperature</span>
                      <span className="text-slate-200 text-sm font-semibold">{demoResult.temperature} °C</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Pressure</span>
                      <span className="text-slate-200 text-sm font-semibold">{demoResult.pressure} hPa</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Humidity</span>
                      <span className="text-slate-200 text-sm font-semibold">{demoResult.humidity} %</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Status</span>
                      <span className={`font-bold px-2.5 py-1 rounded text-xs uppercase inline-block mt-0.5 ${
                        demoResult.status === 'ANOMALY' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        demoResult.status === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {demoResult.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Anomaly Score</span>
                      <span className="text-slate-200 font-bold text-sm">{demoResult.anomalyScore.toFixed(1)}/100</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-slate-500 block uppercase text-[10px]">Reason</span>
                    <p className="text-slate-200 font-sans text-xs mt-1 leading-relaxed">{demoResult.reason}</p>
                  </div>
                </div>
              )}

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

          {currentSection === 'history' && (
            <div className="max-w-7xl mx-auto">
              <HistoricalDataView
                stations={stations}
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

      {/* Demo Mode Modal */}
      {isDemoModalOpen && (
        <DemoModal
          stations={stations}
          onClose={() => setIsDemoModalOpen(false)}
          onSimulate={handleSimulateDemo}
        />
      )}
    </div>
  );
}
