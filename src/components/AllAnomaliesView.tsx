import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  CheckCircle2
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Anomaly Operations Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-parameter anomaly records, rule triggers, and Isolation Forest ML logs
            </p>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-3.5 rounded-xl bg-[#131E32] border border-slate-800/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by AWS ID, city, or parameter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={filterParam}
            onChange={(e) => setFilterParam(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Parameters</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
          </select>
        </div>
      </div>

      {/* Anomaly Operations Table */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#131E32] border border-slate-800/90 text-center space-y-3 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
          <div className="text-base font-semibold text-slate-200">No Anomalies Match Active Filters</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All monitored telemetry parameters align with expected physical boundaries and Isolation Forest baselines.
          </p>
        </div>
      ) : (
        <div className="bg-[#131E32] rounded-xl border border-slate-800/90 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="p-3.5 pl-4">Station Node</th>
                  <th className="p-3.5">Anomaly Title & Rule</th>
                  <th className="p-3.5">Observed vs Baseline</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">ML Detection Score</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filtered.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectAnomaly(item)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                        }`} />
                        <div>
                          <div className="font-mono font-bold text-white text-xs">{item.stationId}</div>
                          <div className="text-[11px] text-slate-400">{item.location}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.classification}</div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="text-rose-400 font-bold">Obs: {item.actualValue}</div>
                      <div className="text-emerald-400 text-[11px]">Exp: {item.expectedValue}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                        item.severity === 'CRITICAL' || item.severity === 'HIGH' 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.severity}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {item.anomalyScore !== undefined ? item.anomalyScore.toFixed(3) : 'Flagged'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {item.timestamp}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnomaly(item);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        AI Diagnostic
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

