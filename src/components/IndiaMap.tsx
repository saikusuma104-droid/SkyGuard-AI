import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Layers, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowUpRight, 
  Thermometer, 
  Gauge, 
  Droplets,
  ExternalLink,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { AWSStation, StationStatus } from '../types';

interface IndiaMapProps {
  stations: AWSStation[];
  selectedStation: AWSStation | null;
  onSelectStation: (station: AWSStation) => void;
  onOpenAnomalyModal: (station: AWSStation) => void;
  activeFilter: StationStatus | 'all';
  onFilterChange: (filter: StationStatus | 'all') => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenAnomalyModal,
  activeFilter,
  onFilterChange,
}) => {
  const [hoveredStation, setHoveredStation] = useState<AWSStation | null>(null);
  const [showRadarSweep, setShowRadarSweep] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Geographic bounds for India projection
  const bounds = {
    minLat: 7.0,
    maxLat: 36.5,
    minLng: 67.5,
    maxLng: 96.5,
  };

  // Convert (lat, lng) to SVG viewBox percentages (width: 800, height: 760)
  const projectCoordinates = (lat: number, lng: number) => {
    const svgWidth = 800;
    const svgHeight = 760;
    
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (svgWidth - 160) + 80;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (svgHeight - 120) + 60;
    
    return { x, y };
  };

  const filteredStations = useMemo(() => {
    if (activeFilter === 'all') return stations;
    return stations.filter((s) => s.status === activeFilter);
  }, [stations, activeFilter]);

  const activeAnomalyStation = stations.find((s) => s.status === 'anomaly') || stations.find((s) => s.status === 'suspicious') || null;

  return (
    <div 
      id="live-aws-map-section"
      className="bg-[#131E32] rounded-xl border border-slate-800/90 shadow-lg shadow-black/40 overflow-hidden flex flex-col"
    >
      {/* Map Header */}
      <div className="p-4 sm:px-6 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner">
            <Crosshair className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            LIVE AWS SPATIAL MONITORING (7 NODES)
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeFilter === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            onClick={() => onFilterChange('healthy')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'healthy'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Normal
          </button>
          <button
            onClick={() => onFilterChange('suspicious')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'suspicious'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Suspicious
          </button>
          <button
            onClick={() => onFilterChange('anomaly')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'anomaly'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Anomaly
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] bg-[#0A101D] overflow-hidden flex items-center justify-center select-none">
        {/* Background Coordinate Grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Radar Sweep Effect */}
        {showRadarSweep && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-20">
            <div className="w-full h-full rounded-full border border-sky-500/30 animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(56,189,248,0.25)_360deg)]" />
          </div>
        )}

        {/* Map SVG */}
        <svg
          viewBox="0 0 800 760"
          className="w-full h-full max-w-[800px] max-h-[760px] transform transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <radialGradient id="anomaly-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="suspicious-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* India Regional Map Outline */}
          <g className="opacity-90">
            <path
              d="M 330 65 
                 C 340 50, 360 45, 380 50 
                 C 400 55, 410 75, 425 85 
                 C 440 95, 435 110, 420 120 
                 C 410 130, 415 145, 430 150 
                 C 450 155, 480 160, 520 165 
                 C 550 170, 590 170, 620 160 
                 C 650 150, 690 145, 715 165 
                 C 740 185, 750 210, 735 235 
                 C 720 255, 680 270, 650 280 
                 C 630 290, 625 315, 600 330 
                 C 580 340, 560 330, 545 350 
                 C 530 370, 520 400, 510 430 
                 C 500 460, 480 500, 450 540 
                 C 430 570, 400 610, 380 645 
                 C 365 670, 350 690, 340 705 
                 C 335 710, 330 705, 325 690 
                 C 310 650, 290 600, 275 550 
                 C 260 500, 240 450, 230 410 
                 C 220 370, 205 340, 185 320 
                 C 160 300, 140 280, 150 260 
                 C 160 240, 190 235, 210 230 
                 C 230 225, 250 210, 260 190 
                 C 270 170, 280 140, 295 115 
                 Z"
              fill="#0F1B2E"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeLinejoin="round"
              className="drop-shadow-md"
            />

            {/* Subtle Division Guides */}
            <path
              d="M 260 190 Q 350 220 480 220 M 230 410 Q 340 430 500 440 M 185 320 Q 300 340 450 330 M 340 120 L 340 220 M 430 150 L 430 260 M 325 500 Q 380 520 450 540"
              fill="none"
              stroke="#18304E"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          </g>

          {/* Inter-Station Synoptic Network Link Mesh */}
          <g className="station-mesh-lines opacity-20">
            {stations.map((st1, i) => {
              const p1 = projectCoordinates(st1.lat, st1.lng);
              return stations.slice(i + 1).map((st2) => {
                const p2 = projectCoordinates(st2.lat, st2.lng);
                return (
                  <line
                    key={`mesh-${st1.id}-${st2.id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    strokeDasharray="2,4"
                  />
                );
              });
            })}
          </g>

          {/* Spatial Correlation Highlight Lines for Active Anomaly Station */}
          {activeAnomalyStation && (
            <g className="spatial-correlation-links">
              {stations
                .filter((s) => s.id !== activeAnomalyStation.id)
                .map((neighbor) => {
                  const p1 = projectCoordinates(activeAnomalyStation.lat, activeAnomalyStation.lng);
                  const p2 = projectCoordinates(neighbor.lat, neighbor.lng);
                  return (
                    <line
                      key={`link-anom-${neighbor.id}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                      strokeOpacity="0.6"
                    />
                  );
                })}
            </g>
          )}

          {/* Render 7 Station Markers */}
          {filteredStations.map((station) => {
            const { x, y } = projectCoordinates(station.lat, station.lng);
            const isSelected = selectedStation?.id === station.id;
            const isHovered = hoveredStation?.id === station.id;
            const isAnomaly = station.status === 'anomaly';
            const isSuspicious = station.status === 'suspicious';

            let markerFill = '#22c55e'; // green
            let markerStroke = '#15803d';

            if (isSuspicious) {
              markerFill = '#f59e0b'; // orange
              markerStroke = '#b45309';
            } else if (isAnomaly) {
              markerFill = '#ef4444'; // red
              markerStroke = '#b91c1c';
            }

            return (
              <g
                key={station.id}
                id={`map-marker-${station.id}`}
                className="cursor-pointer group"
                onClick={() => onSelectStation(station)}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                {/* Radar ping ring for Anomaly station */}
                {isAnomaly && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="26"
                      fill="url(#anomaly-glow)"
                      className="animate-ping opacity-60"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  </>
                )}

                {/* Suspicious halo */}
                {isSuspicious && (
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill="url(#suspicious-glow)"
                    className="animate-pulse"
                  />
                )}

                {/* Selection ring */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="13"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Main Station Marker Node */}
                <circle
                  cx={x}
                  cy={y}
                  r={isAnomaly ? 7.5 : 6}
                  fill={markerFill}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-transform duration-200 group-hover:scale-125"
                />

                {/* Station ID & City Label */}
                <text
                  x={x + 10}
                  y={y + 3}
                  fill={isAnomaly ? '#fca5a5' : isSuspicious ? '#fcd34d' : '#e2e8f0'}
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {station.location}
                </text>
                <text
                  x={x + 10}
                  y={y + 13}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="'JetBrains Mono', monospace"
                  className="pointer-events-none drop-shadow-sm select-none opacity-80"
                >
                  {station.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Station Hover / Quick Tooltip Popup */}
        {(hoveredStation || selectedStation) && (
          <div
            id="map-station-popup"
            className="absolute bottom-4 left-4 max-w-xs sm:max-w-sm bg-[#0F172A]/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20 pointer-events-auto"
          >
            {(() => {
              const active = hoveredStation || selectedStation!;
              const isAnomaly = active.status === 'anomaly';
              const isSuspicious = active.status === 'suspicious';

              return (
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          active.status === 'healthy' ? 'bg-emerald-400' :
                          active.status === 'suspicious' ? 'bg-amber-400 animate-pulse' :
                          active.status === 'anomaly' ? 'bg-rose-500 animate-ping' : 'bg-slate-500'
                        }`} />
                        <span className="font-mono font-bold text-sm text-white">
                          {active.id}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          {active.location}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {active.name} ({active.state})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        active.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        active.status === 'suspicious' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        active.status === 'anomaly' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {active.status}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-3 gap-2 my-2.5 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-sky-400" />
                        Temp
                      </div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${
                        isAnomaly && active.activeAnomaly?.parameter === 'temperature' ? 'text-rose-400 font-extrabold' : 'text-slate-200'
                      }`}>
                        {active.currentReadings.temperature}°C
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3 text-sky-400" />
                        Pressure
                      </div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${
                        isSuspicious && active.activeAnomaly?.parameter === 'pressure' ? 'text-amber-400 font-extrabold' : 'text-slate-200'
                      }`}>
                        {active.currentReadings.pressure} hPa
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-400" />
                        Humidity
                      </div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${
                        isSuspicious && active.activeAnomaly?.parameter === 'humidity' ? 'text-amber-400 font-extrabold' : 'text-slate-200'
                      }`}>
                        {active.currentReadings.humidity}%
                      </div>
                    </div>
                  </div>

                  {/* Anomaly Callout */}
                  {isAnomaly || isSuspicious ? (
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[11px] font-medium text-rose-300">
                          {active.activeAnomaly?.title || 'Extreme Anomaly Flagged'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-rose-400">
                        Score: {active.activeAnomaly?.anomalyScore ? active.activeAnomaly.anomalyScore.toFixed(3) : 'Flagged'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 mb-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Data Trust Score</span>
                      <span className="font-mono font-bold text-emerald-400">{active.trustScore}% Nominal</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {(isAnomaly || isSuspicious) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAnomalyModal(active);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>AI Diagnostic</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectStation(active)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Telemetry</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-md">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-800" />
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-800" />
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px] font-mono text-center"
              title="Reset Zoom"
            >
              1x
            </button>
          </div>

          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              showRadarSweep
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Radar Sweep Effect"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend */}
        <div 
          id="map-legend"
          className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800/90 rounded-lg px-3.5 py-2.5 shadow-md backdrop-blur-sm text-xs space-y-1.5 z-10"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Status Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Suspicious</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
