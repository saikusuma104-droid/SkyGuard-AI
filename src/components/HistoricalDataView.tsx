import React, { useState, useEffect } from 'react';
import { fetchWeatherHistory, WeatherReadingRecord } from '../services/api';
import { AWSStation } from '../types';

interface HistoricalDataViewProps {
  stations: AWSStation[];
  onBackToDashboard: () => void;
}

export const HistoricalDataView: React.FC<HistoricalDataViewProps> = ({ stations, onBackToDashboard }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState<string>(todayStr);

  const [historyRecords, setHistoryRecords] = useState<WeatherReadingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasQueried, setHasQueried] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setHasQueried(true);
    try {
      const records = await fetchWeatherHistory(selectedStationId, fromDate, toDate);
      setHistoryRecords(records);
    } catch (err) {
      console.error('Failed to load historical data:', err);
      setHistoryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-100">Historical Telemetry Data Logs</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Query actual historical meteorological telemetry records and anomaly detection results.
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Vault: <strong className="text-slate-200 font-mono">Telemetry Log Store</strong></span>
        </div>
      </div>

      {/* Query Filter Controls */}
      <form onSubmit={handleQuery} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Station
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all">All Stations</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id} - {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Querying Logs...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Get Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Database Records Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Query Results</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              {historyRecords.length} records
            </span>
          </h3>
          <span className="text-xs text-slate-400">Source: Historical Telemetry Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Fetching historical telemetry records...</p>
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base font-semibold text-slate-300">No data available for the selected period.</p>
            <p className="text-xs text-slate-500">Run live anomaly checks or select a different station / date range to populate historical data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="p-3.5 pl-5">Timestamp</th>
                  <th className="p-3.5">Station</th>
                  <th className="p-3.5 text-right">Temp (°C)</th>
                  <th className="p-3.5 text-right">Humidity (%)</th>
                  <th className="p-3.5 text-right">Pressure (hPa)</th>
                  <th className="p-3.5 text-right">Wind (m/s)</th>
                  <th className="p-3.5 text-right">Vis (km)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Score</th>
                  <th className="p-3.5 pr-5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {historyRecords.map((record) => {
                  const isAnomaly = record.anomaly || record.status === 'ANOMALY' || record.severity === 'CRITICAL' || record.severity === 'HIGH';
                  const isWarning = !isAnomaly && (record.status === 'WARNING' || record.severity === 'MEDIUM');

                  return (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 pl-5 text-slate-300 whitespace-nowrap">
                        {record.timestamp ? String(record.timestamp).replace('T', ' ') : 'N/A'}
                      </td>
                      <td className="p-3.5 text-cyan-400 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{record.stationId}</span>
                          {record.dataSource === 'DEMO' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 uppercase tracking-wider">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right text-slate-200">
                        {record.temperature !== undefined && record.temperature !== null ? record.temperature.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-200">
                        {record.relativeHumidity !== undefined && record.relativeHumidity !== null ? record.relativeHumidity.toFixed(0) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-200">
                        {record.stationLevelPressure !== undefined && record.stationLevelPressure !== null ? record.stationLevelPressure.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-200">
                        {record.windSpeed !== undefined && record.windSpeed !== null ? record.windSpeed.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-200">
                        {record.visibility !== undefined && record.visibility !== null ? record.visibility.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold border ${
                            isAnomaly
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                              : isWarning
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          }`}
                        >
                          {isAnomaly ? 'ANOMALY' : isWarning ? 'WARNING' : 'NORMAL'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-300">
                        {record.anomalyScore !== undefined && record.anomalyScore !== null ? record.anomalyScore.toFixed(3) : '-'}
                      </td>
                      <td className="p-3.5 pr-5 text-slate-400 font-sans max-w-xs truncate" title={record.reason}>
                        {record.reason || 'Nominal telemetry reading saved.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
