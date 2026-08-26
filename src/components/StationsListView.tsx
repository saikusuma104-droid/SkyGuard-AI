import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  MapPin, 
  Thermometer, 
  Gauge, 
  Droplets, 
  ArrowUpRight,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Automatic Weather Stations Directory
              </h1>
              <p className="text-xs text-slate-400">
                Network topology, sensor hardware specifications, and live station status
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by AWS-ID, city, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-900 text-slate-400'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'healthy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Healthy
          </button>
          <button
            onClick={() => setStatusFilter('suspicious')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'suspicious' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Suspicious
          </button>
          <button
            onClick={() => setStatusFilter('anomaly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'anomaly' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Anomaly
          </button>
        </div>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((station) => (
          <div
            key={station.id}
            onClick={() => onSelectStation(station)}
            className="p-5 rounded-xl bg-[#131E32] border border-slate-800/90 hover:border-sky-500/50 cursor-pointer transition-all shadow-sm space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    station.status === 'healthy' ? 'bg-emerald-400' :
                    station.status === 'suspicious' ? 'bg-amber-400' :
                    station.status === 'anomaly' ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'
                  }`} />
                  <span className="font-mono font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                    {station.id}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    ({station.location})
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{station.name}</div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                station.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                station.status === 'suspicious' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                station.status === 'anomaly' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-slate-800 text-slate-400'
              }`}>
                {station.status}
              </span>
            </div>

            {/* Parameter mini cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  Temp
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {station.currentReadings.temperature}°C
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" />
                  Press
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {station.currentReadings.pressure} hPa
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  RH
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {station.currentReadings.humidity}%
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{station.stationType}</span>
              <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Telemetry <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
