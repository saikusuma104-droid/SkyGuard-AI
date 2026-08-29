import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Wind, 
  AlertOctagon
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
  const [activeTab, setActiveTab] = useState<'telemetry' | 'history'>('telemetry');

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
        className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
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
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
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
            Current Telemetry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'history' 
                ? 'border-sky-400 text-sky-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent History
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Active Anomaly Banner */}
          {(isAnomaly || isSuspicious) && station.activeAnomaly && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-rose-300">
                    Active Anomaly: {station.activeAnomaly.title}
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
                  View Details
                </button>
              )}
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Core Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Temperature */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-rose-400" />
                      Temperature
                    </span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isAnomaly && station.activeAnomaly?.parameter === 'temperature' ? 'text-rose-400' : 'text-white'
                  }`}>
                    {station.currentReadings.temperature}°C
                  </div>
                </div>

                {/* Pressure */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      Station Level Pressure
                    </span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isSuspicious && station.activeAnomaly?.parameter === 'pressure' ? 'text-amber-400' : 'text-white'
                  }`}>
                    {station.currentReadings.pressure} hPa
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      Relative Humidity
                    </span>
                  </div>
                  <div className={`text-2xl font-mono font-black ${
                    isSuspicious && station.activeAnomaly?.parameter === 'humidity' ? 'text-amber-400' : 'text-white'
                  }`}>
                    {station.currentReadings.humidity}%
                  </div>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {station.currentReadings.windSpeed} m/s
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Telemetry Log
              </div>

              {station.recentHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No telemetry logs available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="p-2">Time</th>
                        <th className="p-2">Temperature</th>
                        <th className="p-2">Pressure</th>
                        <th className="p-2">Humidity</th>
                        <th className="p-2">Status</th>
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
                          <td className="p-2 font-mono text-slate-300">{point.observedPressure} hPa</td>
                          <td className="p-2 font-mono text-slate-300">{point.observedHumidity}%</td>
                          <td className="p-2">
                            {point.isAnomaly ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                ANOMALY
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10">
                                NORMAL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
