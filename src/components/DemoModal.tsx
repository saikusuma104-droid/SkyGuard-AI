import React, { useState } from 'react';
import { X, Play, AlertTriangle } from 'lucide-react';
import { AWSStation } from '../types';

interface DemoModalProps {
  stations: AWSStation[];
  onClose: () => void;
  onSimulate: (data: { stationId: string; temperature: number; pressure: number; humidity: number }) => Promise<void>;
}

export const DemoModal: React.FC<DemoModalProps> = ({ stations, onClose, onSimulate }) => {
  // Only display the actual 7 stations used by the application (deduplicated by station id)
  const uniqueStations = Array.from(
    new Map(stations.map((st) => [st.id, st])).values()
  );

  const [selectedStationId, setSelectedStationId] = useState<string>(
    uniqueStations.length > 0 ? uniqueStations[0].id : 'station_01'
  );
  const [temperatureStr, setTemperatureStr] = useState<string>('');
  const [pressureStr, setPressureStr] = useState<string>('');
  const [humidityStr, setHumidityStr] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!selectedStationId) {
      setErrorMessage('Please select a station.');
      return;
    }

    if (temperatureStr.trim() === '') {
      setErrorMessage('Temperature field is required.');
      return;
    }
    const tempVal = Number(temperatureStr);
    if (isNaN(tempVal)) {
      setErrorMessage('Temperature must be a valid numeric value.');
      return;
    }

    if (pressureStr.trim() === '') {
      setErrorMessage('Pressure field is required.');
      return;
    }
    const pressVal = Number(pressureStr);
    if (isNaN(pressVal)) {
      setErrorMessage('Pressure must be a valid numeric value.');
      return;
    }

    if (humidityStr.trim() === '') {
      setErrorMessage('Humidity field is required.');
      return;
    }
    const humVal = Number(humidityStr);
    if (isNaN(humVal)) {
      setErrorMessage('Humidity must be a valid numeric value.');
      return;
    }
    if (humVal < 0 || humVal > 100) {
      setErrorMessage('Humidity must be between 0 and 100%.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSimulate({
        stationId: selectedStationId,
        temperature: tempVal,
        pressure: pressVal,
        humidity: humVal,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Anomaly detection service is currently unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        id="demo-mode-modal"
        className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Demo Mode
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Enter weather conditions to simulate a station observation and see how SkyGuard AI detects it.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Station Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Station
            </label>
            <select
              id="demo-station-select"
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
            >
              {uniqueStations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id} - {st.name} ({st.location})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Temperature (°C)
            </label>
            <input
              id="demo-temp-input"
              type="number"
              step="any"
              placeholder="e.g. 28.5 or 48.0"
              value={temperatureStr}
              onChange={(e) => setTemperatureStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors placeholder-slate-600"
            />
          </div>

          {/* Pressure */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Pressure (hPa)
            </label>
            <input
              id="demo-pressure-input"
              type="number"
              step="any"
              placeholder="e.g. 1011.2 or 950.0"
              value={pressureStr}
              onChange={(e) => setPressureStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors placeholder-slate-600"
            />
          </div>

          {/* Humidity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Humidity (%)
            </label>
            <input
              id="demo-humidity-input"
              type="number"
              step="any"
              placeholder="e.g. 65 or 95"
              value={humidityStr}
              onChange={(e) => setHumidityStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors placeholder-slate-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              id="demo-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              id="demo-simulate-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 font-mono"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
