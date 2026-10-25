import React from 'react';
import { ShieldCheck, Cpu, GitMerge, Radio } from 'lucide-react';

interface AboutViewProps {
  onBackToDashboard: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2DCCE] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Platform Overview
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mt-2">
            SkyGuard AI
          </h1>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] text-slate-800 text-xs font-semibold border border-[#E2DCCE] transition-all"
        >
          ← Dashboard
        </button>
      </div>

      {/* Detection Pipeline */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2DCCE] shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D8]">
          <GitMerge className="w-5 h-5 text-amber-700" />
          <h2 className="text-base font-bold text-slate-900">Detection Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1.5">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" /> Rule Engine
            </h3>
            <p className="text-xs text-slate-600">
              Deterministic quality control checking range, freeze, and elevation limits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1.5">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-700" /> Isolation Forest Model
            </h3>
            <p className="text-xs text-slate-600">
              Unsupervised ML model evaluating multi-parameter anomaly scores.
            </p>
          </div>
        </div>
      </div>

      {/* Monitored AWS Stations */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2DCCE] shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D8]">
          <Radio className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">Monitored AWS Stations</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'station_01', name: 'Thiruvananthapuram', type: 'Coastal Observatory' },
            { id: 'station_02', name: 'Tirupati', type: 'Primary Synoptic' },
            { id: 'station_03', name: 'Bhadrachalam', type: 'River Basin AWS' },
            { id: 'station_04', name: 'Nalgonda', type: 'Semi-Arid AWS' },
            { id: 'station_05', name: 'Tuni', type: 'Coastal AWS' },
            { id: 'station_06', name: 'Kurnool', type: 'Rayalaseema AWS' },
            { id: 'station_07', name: 'Coonoor', type: 'High-Altitude Hill AWS' },
          ].map((st) => (
            <div key={st.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-900 font-bold">{st.id}</span>
                <span className="text-[10px] font-mono text-slate-500">{st.type}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">{st.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
