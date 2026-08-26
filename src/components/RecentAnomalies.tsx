import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  Thermometer,
  Gauge,
  Droplets,
  WifiOff
} from 'lucide-react';
import { AnomalyRecord, AnomalySeverity } from '../types';

interface RecentAnomaliesProps {
  anomalies: AnomalyRecord[];
  onSelectAnomaly: (anomaly: AnomalyRecord) => void;
  onViewAllAnomalies: () => void;
}

export const RecentAnomalies: React.FC<RecentAnomaliesProps> = ({
  anomalies,
  onSelectAnomaly,
  onViewAllAnomalies,
}) => {
  const getSeverityBadge = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {severity}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {severity}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-400">
            {severity}
          </span>
        );
    }
  };

  const getParamIcon = (param: string) => {
    switch (param) {
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-rose-400" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-amber-400" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div 
      id="recent-anomalies-section"
      className="bg-[#131E32] rounded-xl border border-slate-800/90 shadow-lg shadow-black/40 p-5 flex flex-col justify-between"
    >
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                RECENT ANOMALIES
              </h2>
              <p className="text-xs text-slate-400">
                AI sensor validation alerts & data distrust flags
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {anomalies.length} Active
          </span>
        </div>

        {/* Anomaly Cards List */}
        <div className="space-y-2.5">
          {anomalies.map((anomaly) => {
            const isCritical = anomaly.severity === 'CRITICAL' || anomaly.severity === 'HIGH';

            return (
              <div
                key={anomaly.id}
                id={`anomaly-card-${anomaly.stationId}`}
                onClick={() => onSelectAnomaly(anomaly)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                  isCritical 
                    ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-500/60 hover:bg-rose-950/30' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90'
                }`}
              >
                {/* Accent line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCritical ? 'bg-rose-500' : 'bg-amber-400'
                  }`} 
                />

                <div className="pl-1">
                  {/* Top line: Station ID, Location, Severity, Time */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                        {anomaly.stationId}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        ({anomaly.location})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getSeverityBadge(anomaly.severity)}
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {anomaly.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Title & Classification */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getParamIcon(anomaly.parameter)}
                      <span className="text-sm font-semibold text-slate-100">
                        {anomaly.title}
                      </span>
                    </div>

                    {/* AI Confidence badge */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {anomaly.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic preview snippet */}
                  <div className="text-xs text-slate-400 line-clamp-1 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60 font-mono text-[11px]">
                    <span className="text-rose-400 font-bold">Observed: {anomaly.actualValue}</span>
                    <span className="mx-2 text-slate-600">vs</span>
                    <span className="text-emerald-400">Expected: {anomaly.expectedValue}</span>
                  </div>

                  {/* Reason snippet */}
                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                    <p className="truncate max-w-[85%]">
                      {anomaly.reason}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Anomalies CTA */}
      <div className="pt-4 mt-3 border-t border-slate-800/80">
        <button
          id="view-all-anomalies-btn"
          onClick={onViewAllAnomalies}
          className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 group"
        >
          <span>View all anomalies & AI diagnostics</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
