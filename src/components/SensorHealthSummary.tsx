import React from 'react';
import { 
  HeartPulse, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck,
  Thermometer,
  Gauge,
  Droplets,
  Activity
} from 'lucide-react';
import { NetworkOverviewStats } from '../types';

interface SensorHealthSummaryProps {
  stats: NetworkOverviewStats;
  onViewSensorHealth: () => void;
}

export const SensorHealthSummary: React.FC<SensorHealthSummaryProps> = ({
  stats,
  onViewSensorHealth,
}) => {
  return (
    <div 
      id="sensor-health-summary-section"
      className="bg-[#131E32] rounded-xl border border-slate-800/90 shadow-lg shadow-black/40 p-5 flex flex-col justify-between"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HeartPulse className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                SENSOR HEALTH
              </h2>
              <p className="text-xs text-slate-400">
                Network-wide sensor trustworthiness & calibration index
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stats.networkSensorHealthPercent}% Index
          </span>
        </div>

        {/* Primary Health Score & Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Network Sensor Health
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {stats.networkSensorHealthPercent}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Nominal Trust</span>
            </div>
          </div>

          {/* Clean Horizontal Progress Indicator */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 flex gap-1">
            <div 
              style={{ width: `${(stats.healthyCount / stats.totalStations) * 100}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              title={`Healthy: ${stats.healthyCount} stations`}
            />
            <div 
              style={{ width: `${(stats.suspiciousCount / stats.totalStations) * 100}%` }}
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              title={`Degraded / Suspicious: ${stats.suspiciousCount} stations`}
            />
            <div 
              style={{ width: `${(stats.anomalyCount / stats.totalStations) * 100}%` }}
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              title={`Critical Anomalies: ${stats.anomalyCount} stations`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Prototype telemetry validation index</span>
            <span className="font-mono text-slate-400">48 Transducers</span>
          </div>
        </div>

        {/* 3-Tier Breakdown: Healthy (42), Degraded (4), Critical (2) */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Healthy
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.healthyCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Normal Operation
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Degraded
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {stats.suspiciousCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Drift / Warning
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <AlertOctagon className="w-3.5 h-3.5" />
              Critical
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {stats.anomalyCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Spike / Fault
            </div>
          </div>
        </div>

        {/* Subsystem Transducer Status Bars */}
        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Transducer Subsystem Reliability
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 w-44">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Temp RTD Sensors</span>
            </div>
            <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${stats.sensorTypeHealth.temperature.healthyPercent}%` }} 
                className="h-full bg-emerald-500 rounded-full" 
              />
            </div>
            <span className="font-mono text-slate-300 text-xs w-12 text-right">
              {stats.sensorTypeHealth.temperature.healthyPercent}%
            </span>
          </div>

          {/* Pressure */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 w-44">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Barometers</span>
            </div>
            <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${stats.sensorTypeHealth.pressure.healthyPercent}%` }} 
                className="h-full bg-emerald-500 rounded-full" 
              />
            </div>
            <span className="font-mono text-slate-300 text-xs w-12 text-right">
              {stats.sensorTypeHealth.pressure.healthyPercent}%
            </span>
          </div>

          {/* Humidity */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 w-44">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>RH Hygrometers</span>
            </div>
            <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${stats.sensorTypeHealth.humidity.healthyPercent}%` }} 
                className="h-full bg-amber-500 rounded-full" 
              />
            </div>
            <span className="font-mono text-slate-300 text-xs w-12 text-right">
              {stats.sensorTypeHealth.humidity.healthyPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* View Sensor Health Action */}
      <div className="pt-4 mt-3 border-t border-slate-800/80">
        <button
          id="view-sensor-health-btn"
          onClick={onViewSensorHealth}
          className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 group"
        >
          <span>View sensor health & calibration diagnostics</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
