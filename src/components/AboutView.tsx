import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, GitMerge, ArrowRight, Radio } from 'lucide-react';

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
              SYSTEM ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4 SIH Production Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            SkyGuard AI Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time weather telemetry validation & unsupervised anomaly detection engine.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-md"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Hybrid Detection Architecture Flow */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <GitMerge className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">Hybrid Anomaly Detection Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
            <Database className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-200">Weather Telemetry</div>
            <div className="text-[11px] text-slate-400">7 Official AWS Stations</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
            <Activity className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-200">Feature Engineering</div>
            <div className="text-[11px] text-slate-400">Lapse Rate & Diurnal Adjust</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 bg-sky-950/20 text-center space-y-1">
            <Cpu className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-200">Hybrid Engine</div>
            <div className="text-[11px] text-slate-400">Rules + Isolation Forest</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Rule-Based Engine
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Validates observations against physical atmospheric boundaries, diurnal night/day baselines, spatial neighbor lapse rates, and sudden multi-slot rate of change.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Isolation Forest ML
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unsupervised machine learning model trained on historical observations to detect unusual historical patterns in multi-parameter weather observations.
            </p>
          </div>
        </div>
      </div>

      {/* Station Coverage */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Monitored AWS Stations</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SkyGuard AI actively validates live weather data from 7 official Automatic Weather Stations (AWS):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'AWS-001', name: 'Thiruvananthapuram Observatory', type: 'Coastal Observatory' },
            { id: 'AWS-002', name: 'Tirupati Temple AWS', type: 'Primary Synoptic' },
            { id: 'AWS-003', name: 'Bhadrachalam Godavari AWS', type: 'River Basin AWS' },
            { id: 'AWS-004', name: 'Nalgonda Deccan AWS', type: 'Semi-Arid AWS' },
            { id: 'AWS-005', name: 'Tuni Coastal AWS', type: 'Coastal AWS' },
            { id: 'AWS-006', name: 'Kurnool Rayalaseema AWS', type: 'Rayalaseema AWS' },
            { id: 'AWS-007', name: 'Coonoor Nilgiris Hill AWS', type: 'High-Altitude Hill AWS' },
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
