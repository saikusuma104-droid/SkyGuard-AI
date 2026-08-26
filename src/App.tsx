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
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { NetworkStats } from './components/NetworkStats';
import { IndiaMap } from './components/IndiaMap';
import { RecentAnomalies } from './components/RecentAnomalies';
import { SensorHealthSummary } from './components/SensorHealthSummary';
import { AnomalyDetailModal } from './components/AnomalyDetailModal';
import { StationDetailModal } from './components/StationDetailModal';

// Additional views
import { AllAnomaliesView } from './components/AllAnomaliesView';
import { SensorHealthView } from './components/SensorHealthView';
import { StationsListView } from './components/StationsListView';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [stations, setStations] = useState<AWSStation[]>(STATIONS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [stats, setStats] = useState<NetworkOverviewStats>(NETWORK_STATS);
  
  // Interactive Modals
  const [selectedStation, setSelectedStation] = useState<AWSStation | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  
  // Filter on Dashboard Map & Stats
  const [selectedFilter, setSelectedFilter] = useState<StationStatus | 'all'>('all');
  
  // Live Simulation state
  const [isLiveSimulation, setIsLiveSimulation] = useState(true);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

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

  // Live simulation tick (subtle periodic sensor stream jitter to indicate continuous live monitoring)
  useEffect(() => {
    if (!currentUser || !isLiveSimulation) return;

    const interval = setInterval(() => {
      setStations((prevStations) =>
        prevStations.map((station) => {
          if (station.status === 'offline') return station;
          
          // Subtle realistic micro-fluctuation in decimal places
          const tempDelta = (Math.random() - 0.5) * 0.1;
          const pressDelta = (Math.random() - 0.5) * 0.05;
          const humDelta = Math.floor((Math.random() - 0.5) * 0.4);

          // For the anomaly station AWS-003, keep it anomalous at ~55°C
          const newTemp = station.id === 'AWS-003' 
            ? Number((55.2 + (Math.random() - 0.5) * 0.2).toFixed(1))
            : Number((station.currentReadings.temperature + tempDelta).toFixed(1));

          return {
            ...station,
            lastPacketReceivedAgo: `${Math.floor(Math.random() * 8) + 1}s ago`,
            currentReadings: {
              ...station.currentReadings,
              temperature: newTemp,
              pressure: Number((station.currentReadings.pressure + pressDelta).toFixed(1)),
              humidity: Math.min(100, Math.max(10, station.currentReadings.humidity + humDelta)),
            },
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser, isLiveSimulation]);

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

  // If not authenticated, present the SkyGuard AI Demo Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B111E] text-slate-100 font-sans">
      {/* 1. Persistent Left Navigation Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        anomalyCount={stats.anomalyCount}
        suspiciousCount={stats.suspiciousCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 2. Top Header Bar with Live Indicator & User Controls */}
        <Header
          stations={stations}
          onSelectStation={handleSelectStation}
          isLiveSimulation={isLiveSimulation}
          onToggleSimulation={() => setIsLiveSimulation(!isLiveSimulation)}
          onRefreshData={() => {
            handleActionComplete('Telemetry cycle refreshed from 48 automatic weather stations.');
          }}
          anomalyCount={stats.anomalyCount}
          currentUser={currentUser}
          onLogout={handleLogout}
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
              {/* 2. Network Overview Statistics (4 Cards) */}
              <NetworkStats
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={(filter) => setSelectedFilter(filter)}
              />

              {/* 3. Live AWS Map (Centerpiece) */}
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

              {/* 4. Recent Anomalies & 5. Sensor Health Summary (2-Column Balanced Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Anomalies Section */}
                <RecentAnomalies
                  anomalies={anomalies}
                  onSelectAnomaly={handleOpenAnomaly}
                  onViewAllAnomalies={() => setCurrentSection('anomalies')}
                />

                {/* Sensor Health Summary Section */}
                <SensorHealthSummary
                  stats={stats}
                  onViewSensorHealth={() => setCurrentSection('sensor_health')}
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

          {currentSection === 'sensor_health' && (
            <div className="max-w-7xl mx-auto">
              <SensorHealthView
                stats={stats}
                stations={stations}
                onSelectStation={handleSelectStation}
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

          {currentSection === 'live_monitoring' && (
            <div className="max-w-7xl mx-auto">
              <LiveMonitoringView
                stations={stations}
                onSelectStation={handleSelectStation}
                onBackToDashboard={() => setCurrentSection('dashboard')}
              />
            </div>
          )}

          {currentSection === 'analytics' && (
            <div className="max-w-7xl mx-auto">
              <AnalyticsView
                onBackToDashboard={() => setCurrentSection('dashboard')}
              />
            </div>
          )}

          {currentSection === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <SettingsView
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
