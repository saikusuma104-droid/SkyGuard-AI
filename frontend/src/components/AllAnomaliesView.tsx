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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Anomalies Matrix
          </h1>
        </div>

        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-slate-700 border border-[#E2DCCE] transition-all shadow-2xs flex items-center gap-1.5"
        >
          ← Dashboard
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#E2DCCE] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anomalies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E2DCCE] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E2DCCE] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={filterParam}
            onChange={(e) => setFilterParam(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E2DCCE] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Parameters</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
          </select>
        </div>
      </div>

      {/* Anomaly Table */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#E2DCCE] text-center space-y-2 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="text-base font-semibold text-slate-800">No Anomalies</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2DCCE] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-[#E8E2D8]">
                <tr>
                  <th className="p-3.5 pl-4">Station</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Observed vs Baseline</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">ML Score</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {filtered.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectAnomaly(item)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                        }`} />
                        <div>
                          <div className="font-mono font-bold text-slate-900 text-xs">{item.stationId}</div>
                          <div className="text-[11px] text-slate-500">{item.location}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="text-rose-700 font-bold">Obs: {item.actualValue}</div>
                      <div className="text-emerald-700 text-[11px]">Exp: {item.expectedValue}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                        item.severity === 'CRITICAL' || item.severity === 'HIGH' 
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.severity}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="text-xs text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.anomalyScore !== undefined ? item.anomalyScore.toFixed(3) : 'Flagged'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {item.timestamp}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnomaly(item);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Diagnostic
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
