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

  const formatTemp = (val: number | null | undefined) => (val !== null && val !== undefined ? `${val}°C` : 'Unavailable');
  const formatPress = (val: number | null | undefined) => (val !== null && val !== undefined ? `${val} hPa` : 'Unavailable');
  const formatHum = (val: number | null | undefined) => (val !== null && val !== undefined ? `${val}%` : 'Unavailable');
  const formatWind = (val: number | null | undefined) => (val !== null && val !== undefined ? `${val} m/s` : 'Unavailable');

  return (
    <div 
      id="station-detail-modal"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#E2DCCE] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-[#E8E2D8] flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {station.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  station.status === 'healthy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  station.status === 'suspicious' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  station.status === 'anomaly' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {station.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5 font-['Plus_Jakarta_Sans']">
                {station.name} — {station.location}, {station.state}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex border-b border-[#E8E2D8] gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'telemetry' 
                ? 'border-amber-700 text-amber-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Current Telemetry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'history' 
                ? 'border-amber-700 text-amber-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recent History
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {(isAnomaly || isSuspicious) && station.activeAnomaly && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-rose-900">
                    Active Anomaly: {station.activeAnomaly.title}
                  </div>
                  <div className="text-xs text-rose-800 mt-1">
                    {station.activeAnomaly.reason}
                  </div>
                </div>
              </div>

              {onOpenAnomalyDetail && (
                <button
                  onClick={onOpenAnomalyDetail}
                  className="py-1.5 px-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold whitespace-nowrap shadow-2xs"
                >
                  Details
                </button>
              )}
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-amber-700" />
                      Temperature
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900">
                    {formatTemp(station.currentReadings.temperature)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-700" />
                      Pressure
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900">
                    {formatPress(station.currentReadings.pressure)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-amber-700" />
                      Humidity
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900">
                    {formatHum(station.currentReadings.humidity)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Wind className="w-4 h-4 text-amber-700" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900">
                  {formatWind(station.currentReadings.windSpeed)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
              {station.recentHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No history available for this station.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white text-slate-600 font-mono text-[11px] border-b border-[#E8E2D8]">
                      <tr>
                        <th className="p-2">Time</th>
                        <th className="p-2">Temperature</th>
                        <th className="p-2">Pressure</th>
                        <th className="p-2">Humidity</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE1]">
                      {station.recentHistory.map((point) => (
                        <tr 
                          key={point.time} 
                          className={point.isAnomaly ? 'bg-rose-50' : 'hover:bg-white'}
                        >
                          <td className="p-2 font-mono text-slate-700">{point.time}</td>
                          <td className={`p-2 font-mono font-bold ${point.isAnomaly ? 'text-rose-700' : 'text-slate-900'}`}>
                            {formatTemp(point.observedTemp)}
                          </td>
                          <td className="p-2 font-mono text-slate-700">{formatPress(point.observedPressure)}</td>
                          <td className="p-2 font-mono text-slate-700">{formatHum(point.observedHumidity)}</td>
                          <td className="p-2">
                            {point.isAnomaly ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                ANOMALY
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-200">
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
