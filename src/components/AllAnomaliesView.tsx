import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Thermometer, 
  Gauge, 
  Droplets,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AnomalyRecord, AWSStation } from '../types';

interface AllAnomaliesViewProps {
  anomalies: AnomalyRecord[];
  stations: AWSStation[];
  onSelectAnomaly: (anomaly: AnomalyRecord) => void;
  onBackToDashboard: () => void;
}

export const AllAnomaliesView: React.FC<AllAnomaliesViewProps> = ({
  anomalies,
  stations,
  onSelectAnomaly,
  onBackToDashboard,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterParam, setFilterParam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterParam !== 'all' && a.parameter !== filterParam) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        a.stationId.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Anomaly Operations Center
              </h1>
              <p className="text-xs text-slate-400">
                Active sensor trustworthiness flags, spatial discrepancy detections & diagnostic logs
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

      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anomaly by station ID, location, or parameter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={filterParam}
            onChange={(e) => setFilterParam(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono"
          >
            <option value="all">All Transducers</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
            <option value="signal_loss">Signal Loss</option>
          </select>
        </div>
      </div>

      {/* Anomaly Table */}
      <div className="bg-[#131E32] rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Station</th>
                <th className="p-3.5">Anomaly Type</th>
                <th className="p-3.5">Observed vs Expected</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">AI Confidence</th>
                <th className="p-3.5">Time (UTC)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => onSelectAnomaly(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <div className="font-mono font-bold text-white">{item.stationId}</div>
                        <div className="text-[11px] text-slate-400">{item.location}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.classification}</div>
                  </td>

                  <td className="p-3.5 font-mono">
                    <div className="text-rose-400 font-bold">Obs: {item.actualValue}</div>
                    <div className="text-emerald-400 text-[11px]">Exp: {item.expectedValue}</div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.severity === 'CRITICAL' || item.severity === 'HIGH' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.severity}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${item.confidence}%` }}
                          className="h-full bg-sky-400 rounded-full"
                        />
                      </div>
                      <span className="font-mono font-bold text-sky-400">{item.confidence}%</span>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-slate-400">
                    {item.timestamp}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnomaly(item);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      AI Diagnosis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
