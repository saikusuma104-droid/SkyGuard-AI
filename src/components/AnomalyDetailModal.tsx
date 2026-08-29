import React from 'react';
import { X, AlertOctagon } from 'lucide-react';
import { AnomalyRecord, AWSStation } from '../types';

interface AnomalyDetailModalProps {
  anomaly: AnomalyRecord | null;
  station?: AWSStation | null;
  onClose: () => void;
  onActionComplete?: (message: string) => void;
}

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({
  anomaly,
  onClose,
}) => {
  if (!anomaly) return null;

  return (
    <div 
      id="anomaly-detail-modal"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Anomaly Detected
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {anomaly.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Station</span>
              <span className="font-bold text-white font-mono">{anomaly.location || anomaly.stationId}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Parameter</span>
              <span className="font-bold text-white">{anomaly.parameter}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Observed Value</span>
              <span className="font-bold text-rose-400 font-mono">{anomaly.actualValue}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Status</span>
              <span className="font-bold text-rose-400 font-mono">{anomaly.status || 'ANOMALY'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Reason
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {anomaly.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
