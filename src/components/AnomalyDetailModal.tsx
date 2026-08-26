import React, { useState } from 'react';
import { 
  X, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Network, 
  Cpu, 
  Wrench, 
  Download, 
  Sliders, 
  Thermometer, 
  Gauge, 
  Droplets,
  Share2,
  FileCheck
} from 'lucide-react';
import { AnomalyRecord, AWSStation } from '../types';

interface AnomalyDetailModalProps {
  anomaly: AnomalyRecord | null;
  station?: AWSStation | null;
  onClose: () => void;
  onActionComplete?: (message: string) => void;
}

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({
  anomaly,
  station,
  onClose,
  onActionComplete,
}) => {
  const [isolatedChannel, setIsolatedChannel] = useState(false);
  const [maintenanceRequested, setMaintenanceRequested] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!anomaly) return null;

  const handleIsolateChannel = () => {
    setIsolatedChannel(true);
    const msg = `Channel isolated: ${anomaly.stationId} (${anomaly.parameter}) excluded from Regional NWP model feeds.`;
    setActionNotice(msg);
    if (onActionComplete) onActionComplete(msg);
  };

  const handleRequestMaintenance = () => {
    setMaintenanceRequested(true);
    const msg = `Field Service Ticket #TCK-${Math.floor(1000 + Math.random() * 9000)} generated for ${anomaly.stationId} (${anomaly.location}).`;
    setActionNotice(msg);
    if (onActionComplete) onActionComplete(msg);
  };

  return (
    <div 
      id="anomaly-detail-modal"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:px-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  {anomaly.severity} SEVERITY
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {anomaly.id}
                </span>
                <span className="text-xs text-slate-400">
                  • {anomaly.timestamp} UTC
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] mt-0.5">
                {anomaly.stationId} ({anomaly.location}) — {anomaly.title}
              </h2>
            </div>
          </div>

          <button
            id="close-anomaly-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Banner if triggered */}
        {actionNotice && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Metric Comparison Card (The Core Question: Can I trust this data?) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Observed */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Observed Sensor Value
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                {anomaly.actualValue}
              </div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                Telemetric step jump (+23.7°C)
              </div>
            </div>

            {/* Expected baseline */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                AI Expected Model Baseline
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {anomaly.expectedValue}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                Spatial & thermodynamic model
              </div>
            </div>

            {/* Confidence & Score */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Distrust & Confidence
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-sky-400">
                  {anomaly.confidence}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Score: {anomaly.anomalyScore})
                </span>
              </div>
              <div className="text-[11px] text-sky-300/80 mt-1">
                Classification: {anomaly.classification}
              </div>
            </div>
          </div>

          {/* AI Automated Reasoning / Why is this suspicious? */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>AI Meteorological Diagnosis & Anomaly Rationale</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {anomaly.reason}
            </p>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Root Cause Hypothesis:
              </div>
              <div className="text-xs text-slate-300">
                {anomaly.rootCauseHypothesis}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Physical Law Consistency Check:
              </div>
              <div className="text-xs text-slate-300">
                {anomaly.physicalLawValidation}
              </div>
            </div>
          </div>

          {/* Spatial Cross-Validation with Nearest Neighbors */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Network className="w-4 h-4 text-sky-400" />
                <span>Spatial Cross-Validation (Nearest AWS Regional Neighbors)</span>
              </div>
              <span className="text-xs text-slate-400">
                Within 150–600 km synoptic zone
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {anomaly.nearestNeighbors.map((neighbor) => (
                <div 
                  key={neighbor.stationId}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-left"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-white">
                      {neighbor.stationId}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {neighbor.distanceKm} km
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium truncate">
                    {neighbor.location}
                  </div>
                  <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-800/60">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {neighbor.observedValue}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">
                      Δ {neighbor.deviation}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              💡 <strong>Spatial Consensus:</strong> All adjacent regional stations report nominal temperatures of 26°C – 33°C. The +22°C departure at AWS-003 is mathematically inconsistent with horizontal advection or meso-scale front passage.
            </div>
          </div>

          {/* Actionable Recommendations & Control Center Controls */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Operator Remediation & Protective Actions</span>
            </div>

            <p className="text-xs text-slate-300">
              <strong>Recommendation:</strong> {anomaly.recommendation}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                id="isolate-channel-btn"
                onClick={handleIsolateChannel}
                disabled={isolatedChannel}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  isolatedChannel
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isolatedChannel ? 'Channel Isolated (Safe Mode)' : 'Isolate Channel from NWP Feed'}</span>
              </button>

              <button
                id="request-maintenance-btn"
                onClick={handleRequestMaintenance}
                disabled={maintenanceRequested}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  maintenanceRequested
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{maintenanceRequested ? 'Field Ticket Dispatched' : 'Dispatch Field Inspection Ticket'}</span>
              </button>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(anomaly, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `SkyGuard_${anomaly.stationId}_Diagnostic.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors ml-auto"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Diagnostic JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
