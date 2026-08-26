import React, { useState } from 'react';
import { 
  Activity, 
  Radio, 
  RefreshCw, 
  ArrowUpRight, 
  Wifi, 
  ShieldAlert, 
  Thermometer, 
  Gauge, 
  Droplets,
  Clock
} from 'lucide-react';
import { AWSStation } from '../types';

interface LiveMonitoringViewProps {
  stations: AWSStation[];
  onSelectStation: (station: AWSStation) => void;
  onBackToDashboard: () => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
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
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Live High-Frequency Telemetry Ingestion
              </h1>
              <p className="text-xs text-slate-400">
                Continuous real-time data stream arriving from 48 automatic meteorological stations
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

      {/* Stream Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800">
          <div className="text-xs text-slate-400">Ingestion Frequency</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">1.2 Hz</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Continuous buffer</div>
        </div>

        <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800">
          <div className="text-xs text-slate-400">Packet Integrity</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">99.98%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">CRC checksum pass</div>
        </div>

        <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800">
          <div className="text-xs text-slate-400">Latency</div>
          <div className="text-2xl font-mono font-bold text-sky-400 mt-1">320 ms</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Edge to AI core</div>
        </div>

        <div className="p-4 rounded-xl bg-[#131E32] border border-slate-800">
          <div className="text-xs text-slate-400">Packets Ingested Today</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">138,240</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Synoptic cycles</div>
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="bg-[#131E32] rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Inbound Telemetry Packet Feed
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Auto-refreshing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-3">Station</th>
                <th className="p-3">Location</th>
                <th className="p-3">Temperature</th>
                <th className="p-3">Pressure</th>
                <th className="p-3">Humidity</th>
                <th className="p-3">Wind / Solar</th>
                <th className="p-3">Last Packet</th>
                <th className="p-3">AI Trust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stations.map((station) => (
                <tr 
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className="hover:bg-slate-800/40 cursor-pointer font-mono"
                >
                  <td className="p-3 font-bold text-white">{station.id}</td>
                  <td className="p-3 font-sans text-slate-300">{station.location}</td>
                  <td className={`p-3 font-bold ${
                    station.status === 'anomaly' && station.activeAnomaly?.parameter === 'temperature'
                      ? 'text-rose-400' : 'text-slate-200'
                  }`}>
                    {station.currentReadings.temperature}°C
                  </td>
                  <td className={`p-3 ${
                    station.status === 'suspicious' && station.activeAnomaly?.parameter === 'pressure'
                      ? 'text-amber-400 font-bold' : 'text-slate-300'
                  }`}>
                    {station.currentReadings.pressure} hPa
                  </td>
                  <td className={`p-3 ${
                    station.status === 'suspicious' && station.activeAnomaly?.parameter === 'humidity'
                      ? 'text-amber-400 font-bold' : 'text-slate-300'
                  }`}>
                    {station.currentReadings.humidity}%
                  </td>
                  <td className="p-3 text-slate-400">
                    {station.currentReadings.windSpeed}m/s • {station.currentReadings.solarRadiation}W
                  </td>
                  <td className="p-3 text-slate-400">{station.lastPacketReceivedAgo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      station.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                      station.status === 'suspicious' ? 'bg-amber-500/20 text-amber-400' :
                      station.status === 'anomaly' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {station.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
