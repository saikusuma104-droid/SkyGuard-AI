import React, { useState, useEffect } from 'react';
import { fetchWeatherHistory, downloadHistoricalData, WeatherReadingRecord } from '../services/api';
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

  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'csv' | 'psv' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setHasQueried(true);
    setDownloadError(null);
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

  const handleExecuteDownload = async (format: 'csv' | 'psv') => {
    setDownloadError(null);
    setDownloadingFormat(format);
    try {
      await downloadHistoricalData(selectedStationId, fromDate, toDate, format);
      setIsDownloadMenuOpen(false);
    } catch (err: any) {
      setDownloadError(err.message || 'Unable to generate download.');
    } finally {
      setDownloadingFormat(null);
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2DCCE] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-[#FAF8F5] rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Historical Telemetry Logs
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-2 bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#E2DCCE]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Log Store Active</span>
        </div>
      </div>

      {/* Query Filter Form */}
      <form onSubmit={handleQuery} className="bg-white border border-[#E2DCCE] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Station
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:outline-none focus:border-amber-600 transition-colors"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 font-mono"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Query Logs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {downloadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>{downloadError}</span>
          </div>
          <button
            onClick={() => setDownloadError(null)}
            className="text-rose-600 hover:text-rose-900 text-xs transition-colors"
          >
            Dismiss ×
          </button>
        </div>
      )}

      {/* Database Table */}
      <div className="bg-white border border-[#E2DCCE] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E8E2D8] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Query Results</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-100 text-amber-900 border border-amber-200">
              {historyRecords.length} records
            </span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                id="historical-download-btn"
                type="button"
                onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] text-amber-900 border border-[#E2DCCE] text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download ▼</span>
              </button>

              {isDownloadMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2DCCE] rounded-xl shadow-lg p-3 z-30 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider px-1">
                    Download Data
                  </p>
                  <p className="text-[10px] text-slate-500 px-1 leading-tight">
                    Only NORMAL records will be downloaded
                  </p>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      id="download-csv-btn"
                      type="button"
                      disabled={downloadingFormat !== null}
                      onClick={() => handleExecuteDownload('csv')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-800 bg-[#FAF8F5] hover:bg-amber-50 hover:text-amber-900 border border-[#E2DCCE] transition-all flex items-center justify-between disabled:opacity-50"
                    >
                      <span>CSV</span>
                      {downloadingFormat === 'csv' ? (
                        <span className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-[10px] text-slate-400">.csv</span>
                      )}
                    </button>
                    <button
                      id="download-psv-btn"
                      type="button"
                      disabled={downloadingFormat !== null}
                      onClick={() => handleExecuteDownload('psv')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-800 bg-[#FAF8F5] hover:bg-amber-50 hover:text-amber-900 border border-[#E2DCCE] transition-all flex items-center justify-between disabled:opacity-50"
                    >
                      <span>PSV</span>
                      {downloadingFormat === 'psv' ? (
                        <span className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-[10px] text-slate-400">.psv</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Fetching historical logs...</p>
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-800">No data available for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-slate-600 uppercase tracking-wider font-semibold border-b border-[#E8E2D8]">
                  <th className="p-3.5 pl-5">Timestamp</th>
                  <th className="p-3.5">Station</th>
                  <th className="p-3.5 text-right">Temp (°C)</th>
                  <th className="p-3.5 text-right">Humidity (%)</th>
                  <th className="p-3.5 text-right">Pressure (hPa)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Score</th>
                  <th className="p-3.5 pr-5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1] font-mono">
                {historyRecords.map((record) => {
                  const isAnomaly = record.anomaly || record.status === 'ANOMALY' || record.severity === 'CRITICAL' || record.severity === 'HIGH';
                  const isWarning = !isAnomaly && (record.status === 'WARNING' || record.severity === 'MEDIUM');

                  return (
                    <tr key={record.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3.5 pl-5 text-slate-700 whitespace-nowrap">
                        {record.timestamp ? String(record.timestamp).replace('T', ' ') : 'N/A'}
                      </td>
                      <td className="p-3.5 text-amber-900 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{record.stationId}</span>
                          {record.dataSource === 'DEMO' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right text-slate-800">
                        {record.temperature !== undefined && record.temperature !== null ? record.temperature.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-800">
                        {record.relativeHumidity !== undefined && record.relativeHumidity !== null ? record.relativeHumidity.toFixed(0) : '-'}
                      </td>
                      <td className="p-3.5 text-right text-slate-800">
                        {record.stationLevelPressure !== undefined && record.stationLevelPressure !== null ? record.stationLevelPressure.toFixed(1) : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold border ${
                            isAnomaly
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : isWarning
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isAnomaly ? 'ANOMALY' : isWarning ? 'WARNING' : 'NORMAL'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-700">
                        {record.anomalyScore !== undefined && record.anomalyScore !== null ? record.anomalyScore.toFixed(3) : '-'}
                      </td>
                      <td className="p-3.5 pr-5 text-slate-600 font-sans max-w-xs truncate" title={record.reason}>
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
