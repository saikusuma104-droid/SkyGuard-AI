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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#E2DCCE] rounded-2xl w-full max-w-lg shadow-xl text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E2D8] bg-[#FAF8F5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                Anomaly Diagnostic
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {anomaly.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D8]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Station</span>
              <span className="font-bold text-slate-900 font-mono">{anomaly.location || anomaly.stationId}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Parameter</span>
              <span className="font-bold text-slate-900 capitalize">{anomaly.parameter}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Observed Value</span>
              <span className="font-bold text-rose-700 font-mono">{anomaly.actualValue}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Status</span>
              <span className="font-bold text-rose-700 font-mono">{anomaly.status || 'ANOMALY'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E2D8] space-y-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Reason
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {anomaly.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
