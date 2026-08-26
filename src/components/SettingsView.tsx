import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  Bell, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Save 
} from 'lucide-react';

interface SettingsViewProps {
  onBackToDashboard: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToDashboard }) => {
  const [tempThreshold, setTempThreshold] = useState(5.0); // °C / 10min
  const [pressureThreshold, setPressureThreshold] = useState(8.0); // hPa / 30min
  const [humidityThreshold, setHumidityThreshold] = useState(30.0); // % drift
  const [autoIsolateNWP, setAutoIsolateNWP] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                System & AI Engine Configuration
              </h1>
              <p className="text-xs text-slate-400">
                Anomaly detection thresholds, NWP feed firewall rules, and notification webhooks
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

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Operational configuration thresholds updated successfully.</span>
        </div>
      )}

      {/* Thresholds Card */}
      <div className="p-6 rounded-xl bg-[#131E32] border border-slate-800 space-y-5">
        <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Anomaly Detection Sensitivity Thresholds</span>
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Temperature Gradient Spike Trigger (ΔT / 10 min)</span>
              <span className="font-mono font-bold text-sky-400">{tempThreshold}°C</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="15.0"
              step="0.5"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>High Sensitivity (2.0°C)</span>
              <span>Low Sensitivity (15.0°C)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Barometric Step Depression (ΔP / 30 min)</span>
              <span className="font-mono font-bold text-sky-400">{pressureThreshold} hPa</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="20.0"
              step="0.5"
              value={pressureThreshold}
              onChange={(e) => setPressureThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">RH Hygrometer Sustained Pegging Threshold</span>
              <span className="font-mono font-bold text-sky-400">{humidityThreshold}% RH</span>
            </div>
            <input
              type="range"
              min="10.0"
              max="50.0"
              step="5.0"
              value={humidityThreshold}
              onChange={(e) => setHumidityThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Protective Rules */}
      <div className="p-6 rounded-xl bg-[#131E32] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Automated NWP Ingestion Safeguards</span>
        </h2>

        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 cursor-pointer">
          <div>
            <div className="text-xs font-semibold text-white">Auto-isolate Anomaly Channels</div>
            <div className="text-[11px] text-slate-400">Automatically block readings with AI confidence &gt; 90% from numerical weather forecast models</div>
          </div>
          <input
            type="checkbox"
            checked={autoIsolateNWP}
            onChange={(e) => setAutoIsolateNWP(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-sky-400"
          />
        </label>
      </div>

      {/* Save Button */}
      <div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950/50 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </div>
    </div>
  );
};
