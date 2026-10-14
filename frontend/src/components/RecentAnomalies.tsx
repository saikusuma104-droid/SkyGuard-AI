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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            {severity}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {severity}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
            {severity}
          </span>
        );
    }
  };

  const getParamIcon = (param: string) => {
    switch (param) {
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-rose-600 flex-shrink-0" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-sky-600 flex-shrink-0" />;
      default:
        return <WifiOff className="w-4 h-4 text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <div 
      id="recent-anomalies-section"
      className="bg-white rounded-2xl border border-[#E2DCCE] shadow-xs p-5 flex flex-col justify-between"
    >
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D8] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Recent Anomalies
            </h2>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
            anomalies.length > 0
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {anomalies.length} Flagged
          </span>
        </div>

        {/* Anomaly List or Empty State */}
        {anomalies.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center space-y-2 my-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No Active Anomalies</div>
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
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300 shadow-2xs' 
                      : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCritical ? 'bg-rose-600' : 'bg-amber-500'
                    }`} 
                  />

                  <div className="pl-1.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                          {anomaly.stationId}
                        </span>
                        <span className="text-xs text-slate-600 font-medium truncate">
                          ({anomaly.location}, {anomaly.state})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getSeverityBadge(anomaly.severity)}
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 hidden sm:flex">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {anomaly.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getParamIcon(anomaly.parameter)}
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {anomaly.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                        <span className="text-slate-500 font-mono text-[10px]">Score:</span>
                        <span className="font-mono font-bold text-rose-800 text-[11px] bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                          {anomaly.anomalyScore !== undefined ? anomaly.anomalyScore.toFixed(3) : 'Flagged'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-white px-3 py-2 rounded-lg border border-[#E2DCCE] font-mono flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-rose-700 font-bold">Observed: {anomaly.actualValue}</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-emerald-700">Baseline: {anomaly.expectedValue}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-3 border-t border-[#E8E2D8]">
        <button
          id="view-all-anomalies-btn"
          onClick={onViewAllAnomalies}
          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] text-xs font-semibold text-slate-800 border border-[#E2DCCE] transition-all flex items-center justify-center gap-2 group shadow-2xs"
        >
          <span>View All Anomalies</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
