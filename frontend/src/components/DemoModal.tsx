import React, { useState } from 'react';
import { X, Play, AlertTriangle } from 'lucide-react';
import { AWSStation } from '../types';

interface DemoModalProps {
  stations: AWSStation[];
  onClose: () => void;
  onSimulate: (data: { stationId: string; temperature: number; pressure: number; humidity: number }) => Promise<void>;
}

export const DemoModal: React.FC<DemoModalProps> = ({ stations, onClose, onSimulate }) => {
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

    if (!selectedStationId) {
      setErrorMessage('Please select a station.');
      return;
    }

    if (temperatureStr.trim() === '') {
      setErrorMessage('Temperature is required.');
      return;
    }
    const tempVal = Number(temperatureStr);
    if (isNaN(tempVal)) {
      setErrorMessage('Temperature must be numeric.');
      return;
    }

    if (pressureStr.trim() === '') {
      setErrorMessage('Pressure is required.');
      return;
    }
    const pressVal = Number(pressureStr);
    if (isNaN(pressVal)) {
      setErrorMessage('Pressure must be numeric.');
      return;
    }

    if (humidityStr.trim() === '') {
      setErrorMessage('Humidity is required.');
      return;
    }
    const humVal = Number(humidityStr);
    if (isNaN(humVal) || humVal < 0 || humVal > 100) {
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
      setErrorMessage(err.message || 'Service unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        id="demo-mode-modal"
        className="w-full max-w-lg bg-white border border-[#E2DCCE] rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Demo Simulation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Station
            </label>
            <select
              id="demo-station-select"
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            >
              {uniqueStations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id} - {st.name} ({st.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Temperature (°C)
            </label>
            <input
              id="demo-temp-input"
              type="number"
              step="any"
              placeholder="e.g. 28.5"
              value={temperatureStr}
              onChange={(e) => setTemperatureStr(e.target.value)}
              className="w-full bg-white border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pressure (hPa)
            </label>
            <input
              id="demo-pressure-input"
              type="number"
              step="any"
              placeholder="e.g. 1011.2"
              value={pressureStr}
              onChange={(e) => setPressureStr(e.target.value)}
              className="w-full bg-white border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Humidity (%)
            </label>
            <input
              id="demo-humidity-input"
              type="number"
              step="any"
              placeholder="e.g. 65"
              value={humidityStr}
              onChange={(e) => setHumidityStr(e.target.value)}
              className="w-full bg-white border border-[#E2DCCE] text-slate-900 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D8]">
            <button
              id="demo-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#FAF8F5] transition-colors"
            >
              Cancel
            </button>
            <button
              id="demo-simulate-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all flex items-center gap-2 font-mono shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
