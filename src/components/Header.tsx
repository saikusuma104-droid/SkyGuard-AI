import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  LogOut,
  ShieldCheck,
  Radio,
  Play
} from 'lucide-react';
import { AWSStation, AuthUser } from '../types';

interface HeaderProps {
  onSearchStation?: (query: string) => void;
  onSelectStation?: (station: AWSStation) => void;
  stations: AWSStation[];
  anomalyCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  lastRefreshedAt?: string;
  onTriggerHourlyRefresh?: () => void;
  onOpenDemoModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectStation,
  stations,
  currentUser,
  onLogout,
  lastRefreshedAt,
  onTriggerHourlyRefresh,
  onOpenDemoModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      setTimeStr(istString);
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
      className="h-16 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 gap-4"
    >
      {/* Left: Branding & Station Counter Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-base text-white tracking-tight font-['Plus_Jakarta_Sans'] whitespace-nowrap">
            SkyGuard <span className="text-sky-400">AI</span>
          </span>
          <span className="hidden xl:inline-block text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            7 Weather Stations
          </span>
        </div>
      </div>

      {/* Center: Search / Quick Station Lookup */}
      <div className="flex-1 max-w-sm relative hidden sm:block mx-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="station-search-input"
            type="text"
            placeholder="Search station (e.g. station_01)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && filteredStations.length > 0 && (
          <div 
            id="station-search-results"
            className="absolute top-full left-0 right-0 mt-1.5 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-xl"
          >
            {filteredStations.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  if (onSelectStation) onSelectStation(station);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    station.status === 'healthy' ? 'bg-emerald-400' :
                    station.status === 'suspicious' ? 'bg-amber-400' :
                    station.status === 'anomaly' ? 'bg-rose-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-white group-hover:text-sky-300 transition-colors">
                      {station.id} <span className="font-sans font-normal text-slate-400">({station.location})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {station.currentReadings.temperature}°C • {station.currentReadings.pressure} hPa • {station.currentReadings.humidity}% RH
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  station.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  station.status === 'suspicious' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  station.status === 'anomaly' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {station.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Sync Pill */}
        {lastRefreshedAt && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sync: {lastRefreshedAt}</span>
          </div>
        )}

        {/* Refresh Action */}
        {onTriggerHourlyRefresh && (
          <button
            onClick={onTriggerHourlyRefresh}
            title="Refresh Telemetry Feed"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Demo Mode Action */}
        {onOpenDemoModal && (
          <button
            id="header-demo-btn"
            onClick={onOpenDemoModal}
            title="Open Demo Mode"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
            <span className="hidden sm:inline">Demo</span>
          </button>
        )}

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        {/* System Active Indicator Badge */}
        <div 
          id="header-live-indicator"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800"
        >
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold font-mono tracking-wider text-emerald-400 hidden sm:inline">
            SYSTEM ACTIVE
          </span>
        </div>

        {/* Current User Badge & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-[11px] font-bold font-mono text-white leading-tight">
                  {currentUser.username}
                </div>
                <div className="text-[9px] font-mono text-emerald-400 font-semibold leading-none">
                  {currentUser.role}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                id="header-logout-btn"
                onClick={onLogout}
                title="Logout of SkyGuard AI"
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

