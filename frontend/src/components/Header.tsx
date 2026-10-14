import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  LogOut,
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

  const displayName = currentUser?.username || currentUser?.name || 'Duty Operator';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header 
      id="main-app-header" 
      className="h-16 bg-[#FDFBF7] backdrop-blur-md border-b border-[#E8E2D8] px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 gap-4 shadow-xs"
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-base text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] whitespace-nowrap">
            SkyGuard <span className="text-amber-700">AI</span>
          </span>
          <span className="hidden xl:inline-block text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F0E8] text-slate-700 border border-[#E2DCCE]">
            7 AWS Stations
          </span>
        </div>
      </div>

      {/* Center: Search / Station Lookup */}
      <div className="flex-1 max-w-sm relative hidden sm:block mx-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="station-search-input"
            type="text"
            placeholder="Search station..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-1.5 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-[#E2DCCE] focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && filteredStations.length > 0 && (
          <div 
            id="station-search-results"
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E2DCCE] rounded-xl shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-[#F0EBE1]"
          >
            {filteredStations.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  if (onSelectStation) onSelectStation(station);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    station.status === 'healthy' ? 'bg-emerald-500' :
                    station.status === 'suspicious' ? 'bg-amber-500' :
                    station.status === 'anomaly' ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {station.id} <span className="font-sans font-normal text-slate-500">({station.location})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {station.currentReadings.temperature !== null && station.currentReadings.temperature !== undefined ? `${station.currentReadings.temperature}°C` : '--'} • {station.currentReadings.pressure !== null && station.currentReadings.pressure !== undefined ? `${station.currentReadings.pressure} hPa` : '--'} • {station.currentReadings.humidity !== null && station.currentReadings.humidity !== undefined ? `${station.currentReadings.humidity}% RH` : '--'}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  station.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  station.status === 'suspicious' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  station.status === 'anomaly' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-slate-100 text-slate-600'
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
        {lastRefreshedAt && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sync: {lastRefreshedAt}</span>
          </div>
        )}

        {onTriggerHourlyRefresh && (
          <button
            onClick={onTriggerHourlyRefresh}
            title="Refresh Feed"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-[#FAF8F5] text-slate-700 border border-[#E2DCCE] transition-all flex items-center gap-1.5 text-xs font-mono shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {onOpenDemoModal && (
          <button
            id="header-demo-btn"
            onClick={onOpenDemoModal}
            title="Open Demo Mode"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/60 text-amber-900 border border-amber-200 transition-all flex items-center gap-1.5 text-xs font-mono shadow-2xs font-bold"
          >
            <Play className="w-3.5 h-3.5 fill-current text-amber-700" />
            <span className="hidden sm:inline">Demo</span>
          </button>
        )}

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2DCCE] text-[11px] font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        
      </div>
    </header>
  );
};
