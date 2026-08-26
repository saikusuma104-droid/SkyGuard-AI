import React from 'react';
import { 
  HeartPulse, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Wrench, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AWSStation, NetworkOverviewStats } from '../types';

interface SensorHealthViewProps {
  stats: NetworkOverviewStats;
  stations: AWSStation[];
  onSelectStation: (station: AWSStation) => void;
  onBackToDashboard: () => void;
}

export const SensorHealthView: React.FC<SensorHealthViewProps> = ({
  stats,
  stations,
  onSelectStation,
  onBackToDashboard,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HeartPulse className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Sensor Network Health & Calibration Center
              </h1>
              <p className="text-xs text-slate-400">
                Network-wide transducer drift detection, recalibration schedules, and hardware telemetry
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

      {/* Main Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Health Index
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            {stats.networkSensorHealthPercent}%
          </div>
          <div className="text-xs text-slate-400">42/48 stations nominal</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            Temp RTD Sensors
          </div>
          <div className="text-3xl font-mono font-black text-white">
            {stats.sensorTypeHealth.temperature.healthyPercent}%
          </div>
          <div className="text-xs text-slate-400">1 Critical Spike Flagged</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            Barometric Sensors
          </div>
          <div className="text-3xl font-mono font-black text-white">
            {stats.sensorTypeHealth.pressure.healthyPercent}%
          </div>
          <div className="text-xs text-slate-400">3 Drift Warnings</div>
        </div>

        <div className="p-5 rounded-xl bg-[#131E32] border border-slate-800 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            RH Hygrometers
          </div>
          <div className="text-3xl font-mono font-black text-amber-400">
            {stats.sensorTypeHealth.humidity.healthyPercent}%
          </div>
          <div className="text-xs text-slate-400">7 Drift Warnings (Arid Zones)</div>
        </div>
      </div>

      {/* Stations Sensor Health Matrix */}
      <div className="bg-[#131E32] rounded-xl border border-slate-800 shadow-md p-5 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Transducer Calibration & Trust Registry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/50 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{station.id}</span>
                    <span className="text-xs text-slate-300 font-medium">{station.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{station.name}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  station.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                  station.status === 'suspicious' ? 'bg-amber-500/10 text-amber-400' :
                  station.status === 'anomaly' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {station.status}
                </span>
              </div>

              {/* Sub-sensor bars */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Temperature RTD</span>
                  <span className="font-mono text-slate-300">{station.sensorHealth.tempSensorHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${station.sensorHealth.tempSensorHealth}%` }}
                    className={`h-full ${station.sensorHealth.tempSensorHealth < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Barometer</span>
                  <span className="font-mono text-slate-300">{station.sensorHealth.pressureSensorHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${station.sensorHealth.pressureSensorHealth}%` }}
                    className={`h-full ${station.sensorHealth.pressureSensorHealth < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Hygrometer RH</span>
                  <span className="font-mono text-slate-300">{station.sensorHealth.humiditySensorHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${station.sensorHealth.humiditySensorHealth}%` }}
                    className={`h-full ${station.sensorHealth.humiditySensorHealth < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Calib: {station.sensorHealth.lastCalibrationDate}</span>
                <span className="text-sky-400 font-medium">Inspect →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
