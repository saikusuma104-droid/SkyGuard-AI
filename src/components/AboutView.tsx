import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, GitMerge, Radio } from 'lucide-react';

interface AboutViewProps {
  onBackToDashboard: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              SYSTEM OVERVIEW
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            SkyGuard AI Platform
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Meteorological anomaly detection system for weather station telemetry.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-md"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Detection Pipeline Flow */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <GitMerge className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">Anomaly Detection Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Physical Range Validation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Validates observations against physical atmospheric bounds (temperature, pressure, humidity, wind, visibility).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Isolation Forest Model
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Machine learning model trained on weather observations to evaluate multi-parameter anomaly scores on a 0-100 scale.
            </p>
          </div>
        </div>
      </div>

      {/* Station Coverage */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Monitored Weather Stations</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SkyGuard AI actively monitors weather data across 7 weather stations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'station_01', name: 'Thiruvananthapuram', type: 'Coastal Observatory' },
            { id: 'station_02', name: 'Tirupati', type: 'Primary Synoptic' },
            { id: 'station_03', name: 'Bhadrachalam', type: 'River Basin AWS' },
            { id: 'station_04', name: 'Nalgonda', type: 'Semi-Arid AWS' },
            { id: 'station_05', name: 'Tuni', type: 'Coastal AWS' },
            { id: 'station_06', name: 'Kurnool', type: 'Rayalaseema AWS' },
            { id: 'station_07', name: 'Coonoor', type: 'High-Altitude Hill AWS' },
          ].map((st) => (
            <div key={st.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-sky-400 font-bold">{st.id}</span>
                <span className="text-[10px] font-mono text-slate-400">{st.type}</span>
              </div>
              <div className="text-xs font-semibold text-white mt-1">{st.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
