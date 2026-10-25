import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Thermometer, 
  Gauge, 
  Droplets, 
  ArrowUpRight,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
            <Radio className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Automatic Weather Stations
          </h1>
        </div>

        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-slate-700 border border-[#E2DCCE] transition-all shadow-2xs flex items-center gap-1.5"
        >
          ← Dashboard
        </button>
      </div>

      {/* Controls Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#E2DCCE] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search stations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E2DCCE] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs select-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                : 'bg-white text-slate-600 border border-[#E2DCCE]'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'healthy'
                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-200'
                : 'bg-white text-slate-600 border border-[#E2DCCE]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Normal
          </button>
          <button
            onClick={() => setStatusFilter('suspicious')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'suspicious'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                : 'bg-white text-slate-600 border border-[#E2DCCE]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Suspicious
          </button>
          <button
            onClick={() => setStatusFilter('anomaly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'anomaly'
                ? 'bg-rose-100 text-rose-900 font-bold border border-rose-200'
                : 'bg-white text-slate-600 border border-[#E2DCCE]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Anomaly
          </button>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((station) => {
          const isAnomaly = station.status === 'anomaly';
          const isSuspicious = station.status === 'suspicious';

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                isAnomaly
                  ? 'border-rose-300 hover:border-rose-400'
                  : isSuspicious
                  ? 'border-amber-300 hover:border-amber-400'
                  : 'border-[#E2DCCE] hover:border-amber-400'
              }`}
            >
              <div 
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isAnomaly ? 'bg-rose-600' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base group-hover:text-amber-800 transition-colors tracking-tight">
                      {station.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      • {station.location}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{station.name} ({station.state})</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5 ${
                  isAnomaly ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  isSuspicious ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isAnomaly ? 'bg-rose-600 animate-ping' :
                    isSuspicious ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                  {station.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1 mb-1">
                    <Thermometer className="w-3 h-3 text-amber-700" />
                    Temp
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {station.currentReadings.temperature}°C
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1 mb-1">
                    <Gauge className="w-3 h-3 text-amber-700" />
                    Press
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {station.currentReadings.pressure}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-amber-700" />
                    Hum
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {station.currentReadings.humidity}%
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span>Trust: {station.trustScore}%</span>
                </div>

                <span className="text-amber-800 font-semibold group-hover:translate-x-0.5 transition-all flex items-center gap-1 text-xs">
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
