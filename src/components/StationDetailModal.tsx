import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Wind, 
  Sun, 
  BatteryCharging, 
  Signal, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Layers, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { AWSStation } from '../types';

interface StationDetailModalProps {
  station: AWSStation | null;
  onClose: () => void;
  onOpenAnomalyDetail?: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onOpenAnomalyDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'health' | 'history'>('telemetry');

  if (!station) return null;

  const isAnomaly = station.status === 'anomaly';
  const isSuspicious = station.status === 'suspicious';

  return (
    <div 
      id="station-detail-modal"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">
                  {station.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  station.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  station.status === 'suspicious' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  station.status === 'anomaly' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {station.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Elev: {station.elevationM}m MSL
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] mt-0.5">
                {station.name} — {station.location}, {station.state}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex border-b border-slate-800 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'telemetry' 
                ? 'border-sky-400 text-sky-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Real-time Telemetry
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'health' 
                ? 'border-sky-400 text-sky-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sensor Transducer Health
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'history' 
                ? 'border-sky-400 text-sky-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Observed vs Expected History
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* If there's an active anomaly on this station, show alert banner */}
          {(isAnomaly || isSuspicious) && station.activeAnomaly && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-rose-300">
                    Active AI Flag: {station.activeAnomaly.title} ({station.activeAnomaly.classification})
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {station.activeAnomaly.reason}
                  </div>
                </div>
              </div>

              {onOpenAnomalyDetail && (
                <button
                  onClick={onOpenAnomalyDetail}
                  className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold whitespace-nowrap shadow-sm"
                >
                  Full AI Diagnosis
                </button>
              )}
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Primary 3 Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Temperature */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-rose-400" />
                      Temperature
                    </span>
                    <span className="font-mono text-[11px]">Pt100 RTD</span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isAnomaly && station.activeAnomaly?.parameter === 'temperature' ? 'text-rose-400' : 'text-white'
                  }`}>
                    {station.currentReadings.temperature}°C
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Baseline Expected:</span>
                    <span className="font-mono text-emerald-400">{station.expectedReadings.temperature}°C</span>
                  </div>
                </div>

                {/* Pressure */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      Pressure
                    </span>
                    <span className="font-mono text-[11px]">Piezoresistive</span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isSuspicious && station.activeAnomaly?.parameter === 'pressure' ? 'text-amber-400' : 'text-white'
                  }`}>
                    {station.currentReadings.pressure} hPa
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Baseline Expected:</span>
                    <span className="font-mono text-emerald-400">{station.expectedReadings.pressure} hPa</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      Relative Humidity
                    </span>
                    <span className="font-mono text-[11px]">Capacitive</span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isSuspicious && station.activeAnomaly?.parameter === 'humidity' ? 'text-amber-400' : 'text-white'
                  }`}>
                    {station.currentReadings.humidity}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Baseline Expected:</span>
                    <span className="font-mono text-emerald-400">{station.expectedReadings.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Secondary Auxiliary Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    Wind Velocity
                  </div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-1">
                    {station.currentReadings.windSpeed} m/s
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Solar Flux
                  </div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-1">
                    {station.currentReadings.solarRadiation} W/m²
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    Battery MPPT
                  </div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-1">
                    {station.currentReadings.batteryVoltage} V
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Signal className="w-3.5 h-3.5 text-sky-400" />
                    RF Signal
                  </div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-1">
                    {station.currentReadings.signalDbm} dBm
                  </div>
                </div>
              </div>

              {/* Station Specs Info */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider">
                  Station Hardware Configuration
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                  <div>Classification: <span className="text-slate-200 font-mono">{station.stationType}</span></div>
                  <div>Commission Year: <span className="text-slate-200 font-mono">{station.installYear}</span></div>
                  <div>Coords: <span className="text-slate-200 font-mono">{station.lat.toFixed(4)}°N, {station.lng.toFixed(4)}°E</span></div>
                  <div>Last Ping: <span className="text-slate-200 font-mono">{station.lastPing} ({station.lastPacketReceivedAgo})</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Transducer Health Status
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Temperature RTD Transducer</span>
                        <span className={`font-mono font-bold ${
                          station.sensorHealth.tempSensorHealth < 50 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {station.sensorHealth.tempSensorHealth}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${station.sensorHealth.tempSensorHealth}%` }}
                          className={`h-full ${station.sensorHealth.tempSensorHealth < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Barometric Pressure Sensor</span>
                        <span className={`font-mono font-bold ${
                          station.sensorHealth.pressureSensorHealth < 50 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {station.sensorHealth.pressureSensorHealth}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${station.sensorHealth.pressureSensorHealth}%` }}
                          className={`h-full ${station.sensorHealth.pressureSensorHealth < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Relative Humidity Element</span>
                        <span className={`font-mono font-bold ${
                          station.sensorHealth.humiditySensorHealth < 50 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {station.sensorHealth.humiditySensorHealth}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${station.sensorHealth.humiditySensorHealth}%` }}
                          className={`h-full ${station.sensorHealth.humiditySensorHealth < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Calibration & Field Service Schedule
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Certified Calibration:</span>
                      <span className="font-mono text-slate-200">{station.sensorHealth.lastCalibrationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Scheduled Audit:</span>
                      <span className={`font-mono font-bold ${
                        station.sensorHealth.calibrationDueDays < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {station.sensorHealth.calibrationDueDays < 0 
                          ? `OVERDUE (${Math.abs(station.sensorHealth.calibrationDueDays)} days)` 
                          : `Due in ${station.sensorHealth.calibrationDueDays} days`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Modem Link Quality:</span>
                      <span className="font-mono text-emerald-400">{station.sensorHealth.commsHealth}% RSSI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Recent 8-Cycle Telemetry (Observed vs Model Baseline)</span>
                <span className="text-slate-400 font-normal">Hourly synoptic reporting</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2">Time (UTC)</th>
                      <th className="p-2">Observed Temp</th>
                      <th className="p-2">Model Expected</th>
                      <th className="p-2">Observed Press</th>
                      <th className="p-2">Observed Humidity</th>
                      <th className="p-2">AI Trust Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {station.recentHistory.map((point) => (
                      <tr 
                        key={point.time} 
                        className={point.isAnomaly ? 'bg-rose-950/30' : 'hover:bg-slate-800/40'}
                      >
                        <td className="p-2 font-mono text-slate-300">{point.time}</td>
                        <td className={`p-2 font-mono font-bold ${point.isAnomaly ? 'text-rose-400' : 'text-slate-200'}`}>
                          {point.observedTemp}°C
                        </td>
                        <td className="p-2 font-mono text-emerald-400">{point.expectedTemp}°C</td>
                        <td className="p-2 font-mono text-slate-300">{point.observedPressure} hPa</td>
                        <td className="p-2 font-mono text-slate-300">{point.observedHumidity}%</td>
                        <td className="p-2">
                          {point.isAnomaly ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              ANOMALY
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10">
                              NOMINAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
