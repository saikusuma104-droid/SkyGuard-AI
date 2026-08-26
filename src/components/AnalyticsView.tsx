import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  Zap, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';

interface AnalyticsViewProps {
  onBackToDashboard: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                AI Anomaly Analytics & Model Precision
              </h1>
              <p className="text-xs text-slate-400">
                Evaluation metrics for spatial cross-validation, temporal gradient filters, and thermodynamic physical checks
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

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Model Precision
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            99.4%
          </div>
          <div className="text-xs text-slate-400">Validated against ground truth</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mean Time to Detect (MTTD)
          </div>
          <div className="text-3xl font-mono font-black text-sky-400">
            1.8 sec
          </div>
          <div className="text-xs text-slate-400">From packet arrival at edge</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            False Positive Rate
          </div>
          <div className="text-3xl font-mono font-black text-white">
            0.6%
          </div>
          <div className="text-xs text-slate-400">Spatial multi-station consensus</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            NWP Corrupt Ingestions Prevented
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            428
          </div>
          <div className="text-xs text-slate-400">In past 30 days</div>
        </div>
      </div>

      {/* Algorithmic Pipeline Architecture */}
      <div className="p-6 rounded-xl bg-[#131E32] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
          SkyGuard AI Multi-Stage Anomaly Detection Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <span>Stage 1</span>
              <span>• Physical Law Gate</span>
            </div>
            <p className="text-xs text-slate-300">
              Validates Clausius-Clapeyron equation, dry-adiabatic lapse limits, and hydrostatic equilibrium on incoming single-station observations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>Stage 2</span>
              <span>• Spatial Cross-Check</span>
            </div>
            <p className="text-xs text-slate-300">
              Performs Inverse-Distance Weighted (IDW) interpolation and Kriging across neighboring regional stations within synoptic radii (100–500 km).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Stage 3</span>
              <span>• Temporal Gradient ML</span>
            </div>
            <p className="text-xs text-slate-300">
              Analyzes step-function variance, stuck sensor pegging, and diurnal curve deviations to classify hardware vs meteorological events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
