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
import { fetchDirectOpenMeteoDataFor7Stations, checkAnomaly, checkBackendStatus } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NetworkStats } from './components/NetworkStats';
import { IndiaMap } from './components/IndiaMap';
import { RecentAnomalies } from './components/RecentAnomalies';
import { AnomalyDetailModal } from './components/AnomalyDetailModal';
import { StationDetailModal } from './components/StationDetailModal';
import { DemoModal } from './components/DemoModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Active View Components
import { AllAnomaliesView } from './components/AllAnomaliesView';
import { StationsListView } from './components/StationsListView';
import { HistoricalDataView } from './components/HistoricalDataView';
import { AboutView } from './components/AboutView';

const DEFAULT_OPERATOR: AuthUser = {
  id: 'usr-admin',
  name: 'Duty Operator',
  username: 'operator',
  role: 'OPERATOR',
  email: 'operator@skyguard.gov.in',
};

export default function App() {
  const [currentUser] = useState<AuthUser>(DEFAULT_OPERATOR);
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [stations, setStations] = useState<AWSStation[]>(STATIONS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [stats, setStats] = useState<NetworkOverviewStats>(NETWORK_STATS);

  // App lifecycle & error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Last Refreshed Time tracking
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => 
    new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST'
  );

  // Interactive Modals
  const [selectedStation, setSelectedStation] = useState<AWSStation | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Demo Simulation Result state
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

  const initSystem = async () => {
    setIsLoading(true);
    setBackendError(null);

    const status = await checkBackendStatus();
    if (!status.online) {
      setBackendError('Unable to connect to SkyGuard backend service. Please verify Spring Boot (Port 8080) or Python ML Engine (Port 8000) is active.');
      setIsLoading(false);
      return;
    }

    await handleTriggerHourlyRefresh(false);
    setIsLoading(false);
  };

  useEffect(() => {
    initSystem();

    // 1-Hour automated refresh cycle
    const interval = setInterval(() => {
      handleTriggerHourlyRefresh(true);
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

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

          const elevation = origStation.elevationM || 0;
          const seaLevelPress = (elevation > 0 && press !== null)
            ? Math.round(press * Math.pow(1 - (0.0065 * elevation) / 288.15, -5.255) * 10) / 10
            : press;

          let mlResult = null;
          try {
            if (temp !== null && press !== null && hum !== null) {
              mlResult = await checkAnomaly({
                stationId: origStation.id,
                timestamp: timeNow,
                temperature: temp,
                dewPointTemperature: Math.round((temp - (100 - hum) / 5) * 10) / 10,
                stationLevelPressure: press,
                seaLevelPressure: seaLevelPress ?? press,
                relativeHumidity: hum,
                windSpeed: live.windSpeed || 2.5,
                visibility: 10.0,
              });
            }
          } catch (err) {
            console.warn(`ML check skipped for ${origStation.id}:`, err);
          }

          const isAnomaly = mlResult ? (mlResult.status === 'ANOMALY' || (mlResult.anomaly === true && mlResult.status !== 'WARNING' && mlResult.status !== 'NORMAL')) : false;
          const isSuspicious = mlResult ? (!isAnomaly && (mlResult.status === 'WARNING' || mlResult.severity === 'MEDIUM')) : false;
          const status: StationStatus = isAnomaly ? 'anomaly' : isSuspicious ? 'suspicious' : 'healthy';

          let anomalyRecord: AnomalyRecord | undefined = undefined;
          if (isAnomaly && mlResult) {
            anomalyRecord = {
              id: `ANOM-${origStation.id}-${Date.now()}`,
              stationId: origStation.id,
              stationName: origStation.name,
              location: origStation.location,
              state: origStation.state,
              parameter: (temp && (temp > 45 || temp < -10)) ? 'temperature' : (press && (press < 800 || press > 1080)) ? 'pressure' : 'multi_sensor',
              title: 'Weather Parameter Anomaly',
              classification: 'Isolation Forest Anomaly Detection',
              actualValue: `${temp ?? '--'}°C / ${press ?? '--'} hPa / ${hum ?? '--'}% RH`,
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
        handleActionComplete(`Refreshed telemetry for 7 AWS stations (${timeNow}).`);
      }
    } catch (e) {
      console.error('Hourly live refresh error:', e);
    } finally {
      isRefreshingRef.current = false;
    }
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

    handleActionComplete(`Demo simulation evaluated for ${data.stationId}`);
  };

  // State 1: Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h1 className="text-base font-bold text-slate-900 font-serif">SkyGuard AI</h1>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">
              Initializing AWS Monitoring System...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Connection Error
  if (backendError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
        <div className="bg-white border border-rose-200 shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">Unable to connect to SkyGuard backend</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {backendError}
            </p>
          </div>
          <button 
            onClick={initSystem}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // State 3: Success Dashboard
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        totalStationsCount={stations.length}
        anomalyCount={stats.anomalyCount}
        suspiciousCount={stats.suspiciousCount}
        currentUser={currentUser}
        onLogout={() => {}}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header
          stations={stations}
          onSelectStation={handleSelectStation}
          anomalyCount={stats.anomalyCount}
          currentUser={currentUser}
          onLogout={() => {}}
          lastRefreshedAt={lastRefreshedAt}
          onTriggerHourlyRefresh={() => handleTriggerHourlyRefresh(true)}
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
        />

        {/* Action Toast */}
        {notificationToast && (
          <div className="absolute top-20 right-6 z-40 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-4 py-2.5 rounded-xl shadow-md transition-all animate-fade-in flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>{notificationToast}</span>
          </div>
        )}

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentSection === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* DEMO MODE Result Card */}
              {demoResult && (
                <div id="demo-mode-result-card" className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs relative animate-fade-in space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                        DEMO SIMULATION RESULT
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        Saved in DB ({demoResult.timestamp})
                      </span>
                    </div>
                    <button
                      onClick={() => setDemoResult(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Dismiss ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Station</span>
                      <span className="text-amber-900 font-bold text-sm">{demoResult.stationId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Temperature</span>
                      <span className="text-slate-900 text-sm font-semibold">{demoResult.temperature} °C</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Pressure</span>
                      <span className="text-slate-900 text-sm font-semibold">{demoResult.pressure} hPa</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Humidity</span>
                      <span className="text-slate-900 text-sm font-semibold">{demoResult.humidity} %</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Status</span>
                      <span className={`font-bold px-2.5 py-1 rounded text-xs uppercase inline-block mt-0.5 ${
                        demoResult.status === 'ANOMALY' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        demoResult.status === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {demoResult.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Score</span>
                      <span className="text-slate-900 font-bold text-sm">{demoResult.anomalyScore.toFixed(1)}/100</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D8]">
                    <span className="text-slate-500 block uppercase text-[10px]">Reason</span>
                    <p className="text-slate-800 font-sans text-xs mt-0.5 leading-relaxed">{demoResult.reason}</p>
                  </div>
                </div>
              )}

              {/* 1. Network Stats */}
              <NetworkStats
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={(filter) => setSelectedFilter(filter)}
              />

              {/* 2. Map */}
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

      {/* Anomaly Modal */}
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

      {/* Station Modal */}
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

      {/* Demo Modal */}
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
