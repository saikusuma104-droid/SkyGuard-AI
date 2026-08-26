import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  RefreshCw, 
  Play, 
  Pause, 
  ShieldCheck, 
  Clock, 
  BellRing, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { AWSStation } from '../types';

interface HeaderProps {
  onSearchStation?: (query: string) => void;
  onSelectStation?: (station: AWSStation) => void;
  stations: AWSStation[];
  isLiveSimulation: boolean;
  onToggleSimulation: () => void;
  onRefreshData: () => void;
  anomalyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectStation,
  stations,
  isLiveSimulation,
  onToggleSimulation,
  onRefreshData,
  anomalyCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().slice(17, 25) + ' UTC';
      const istString = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      setTimeStr(`${istString} (${utcString})`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredStations = searchQuery.trim() === '' 
    ? [] 
    : stations.filter(s => 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.state.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header 
      id="main-app-header" 
      className="h-16 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/80 px-6 flex items-center justify-between z-20 sticky top-0"
    >
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              SkyGuard AI
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <span className="text-xs font-medium text-slate-400">
              AWS Monitoring & Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Center Search / Quick Station Lookup */}
      <div className="hidden md:flex relative w-72 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="station-search-input"
            type="text"
            placeholder="Search AWS-ID or city (e.g. AWS-003, Hyderabad)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-400 rounded-lg border border-slate-800 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && filteredStations.length > 0 && (
          <div 
            id="station-search-results"
            className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl shadow-black/60 overflow-hidden z-50 max-h-72 overflow-y-auto"
          >
            {filteredStations.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  if (onSelectStation) onSelectStation(station);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    station.status === 'healthy' ? 'bg-emerald-400' :
                    station.status === 'suspicious' ? 'bg-amber-400' :
                    station.status === 'anomaly' ? 'bg-rose-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      {station.id}
                      <span className="text-slate-400 font-sans font-normal">({station.location})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {station.currentReadings.temperature}°C • {station.currentReadings.pressure} hPa • {station.currentReadings.humidity}% RH
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                    station.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    station.status === 'suspicious' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    station.status === 'anomaly' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {station.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls & Live Indicator */}
      <div className="flex items-center gap-3.5">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '10:30:00 IST'}</span>
        </div>

        {/* Live Simulation Controls */}
        <button
          id="toggle-simulation-btn"
          onClick={onToggleSimulation}
          title={isLiveSimulation ? "Pause live telemetry simulation" : "Resume live telemetry simulation"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isLiveSimulation 
              ? 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isLiveSimulation ? (
            <>
              <Pause className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Stream Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Stream Paused</span>
            </>
          )}
        </button>

        {/* Refresh button */}
        <button
          id="refresh-telemetry-btn"
          onClick={onRefreshData}
          title="Force telemetry cycle refresh"
          className="p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Subtle LIVE Indicator as specified */}
        <div 
          id="header-live-indicator"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/90 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold font-mono tracking-wider text-emerald-400">
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
};
