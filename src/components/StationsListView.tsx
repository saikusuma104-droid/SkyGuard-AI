import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Thermometer, 
  Gauge, 
  Droplets, 
  ArrowUpRight,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { AWSStation, StationStatus } from '../types';

interface StationsListViewProps {
  stations: AWSStation[];
  onSelectStation: (station: AWSStation) => void;
  onBackToDashboard: () => void;
}

export const StationsListView: React.FC<StationsListViewProps> = ({
  stations,
  onSelectStation,
  onBackToDashboard,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'all'>('all');

  const filtered = stations.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Automatic Weather Stations Directory
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry feeds, hardware health, and sensor diagnostics for 7 AWS nodes
            </p>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex items-center gap-1.5"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-3.5 rounded-xl bg-[#131E32] border border-slate-800/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by AWS-ID, location, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs select-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'healthy'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Healthy
          </button>
          <button
            onClick={() => setStatusFilter('suspicious')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'suspicious'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Suspicious
          </button>
          <button
            onClick={() => setStatusFilter('anomaly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'anomaly'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Anomaly
          </button>
        </div>
      </div>

      {/* Grid of AWS Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((station) => {
          const isAnomaly = station.status === 'anomaly';
          const isSuspicious = station.status === 'suspicious';

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`p-5 rounded-xl bg-[#131E32] border transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                isAnomaly
                  ? 'border-rose-500/50 hover:border-rose-400 hover:shadow-rose-950/20'
                  : isSuspicious
                  ? 'border-amber-500/40 hover:border-amber-400'
                  : 'border-slate-800/90 hover:border-sky-500/50 hover:shadow-sky-950/20'
              }`}
            >
              {/* Top Accent Stripe */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isAnomaly ? 'bg-rose-500' : isSuspicious ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
              />

              {/* Station Card Header */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-base group-hover:text-sky-300 transition-colors tracking-tight">
                      {station.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate">
                      • {station.location}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{station.name} ({station.state})</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5 ${
                  isAnomaly ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                  isSuspicious ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isAnomaly ? 'bg-rose-500 animate-ping' :
                    isSuspicious ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`} />
                  {station.status}
                </span>
              </div>

              {/* Telemetry Metric Cards (3 Columns) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                    <Thermometer className="w-3 h-3 text-rose-400" />
                    Temp
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-100">
                    {station.currentReadings.temperature}°C
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                    <Gauge className="w-3 h-3 text-amber-400" />
                    Pressure
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-100">
                    {station.currentReadings.pressure}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">hPa</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    RH
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-100">
                    {station.currentReadings.humidity}%
                  </div>
                </div>
              </div>

              {/* Station Card Footer */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-slate-400">Trust:</span>
                  <span className={`font-bold ${
                    station.trustScore > 80 ? 'text-emerald-400' :
                    station.trustScore > 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {station.trustScore}%
                  </span>
                </div>

                <span className="text-sky-400 font-semibold group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all flex items-center gap-1 text-xs">
                  Telemetry <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

