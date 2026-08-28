import React from 'react';
import { 
  AlertOctagon, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {severity}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
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
        return <Thermometer className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-sky-400 flex-shrink-0" />;
      default:
        return <WifiOff className="w-4 h-4 text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <div 
      id="recent-anomalies-section"
      className="bg-[#131E32] rounded-xl border border-slate-800/90 shadow-lg p-5 flex flex-col justify-between"
    >
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                RECENT ANOMALIES & DIAGNOSTICS
              </h2>
              <p className="text-xs text-slate-400">
                Rule Engine & Isolation Forest AI detection logs
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
            anomalies.length > 0
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            {anomalies.length} Active Flag(s)
          </span>
        </div>

        {/* Anomaly Cards List or Empty State */}
        {anomalies.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3 my-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-90" />
            <div className="text-sm font-semibold text-slate-200">No Active Anomalies Detected</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              All 7 AWS station readings align with physical thermodynamic limits and trained ML baselines.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => {
              const isCritical = anomaly.severity === 'CRITICAL' || anomaly.severity === 'HIGH';

              return (
                <div
                  key={anomaly.id}
                  id={`anomaly-card-${anomaly.stationId}`}
                  onClick={() => onSelectAnomaly(anomaly)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                    isCritical 
                      ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-500/60 hover:bg-rose-950/30 shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 shadow-sm'
                  }`}
                >
                  {/* Accent bar */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-400'
                    }`} 
                  />

                  <div className="pl-1.5 space-y-2">
                    {/* Top Row: Station ID, Location, Severity, Time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                          {anomaly.stationId}
                        </span>
                        <span className="text-xs text-slate-300 font-medium truncate">
                          ({anomaly.location}, {anomaly.state})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getSeverityBadge(anomaly.severity)}
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 hidden sm:flex">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {anomaly.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Anomaly Title & Parameter */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getParamIcon(anomaly.parameter)}
                        <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                          {anomaly.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                        <span className="text-slate-400 font-mono text-[10px]">ML Score:</span>
                        <span className="font-mono font-bold text-rose-400 text-[11px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          {anomaly.anomalyScore !== undefined ? anomaly.anomalyScore.toFixed(3) : 'Flagged'}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic telemetry comparison snippet */}
                    <div className="text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80 font-mono flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-rose-400 font-bold">Observed: {anomaly.actualValue}</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-emerald-400">Baseline: {anomaly.expectedValue}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-3 border-t border-slate-800/80">
        <button
          id="view-all-anomalies-btn"
          onClick={onViewAllAnomalies}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          <span>View Detailed Anomaly Matrix & Diagnostic Logs</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};

