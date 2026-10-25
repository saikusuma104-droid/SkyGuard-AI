import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  AlertOctagon, 
  Thermometer, 
  Gauge, 
  Droplets,
  ShieldAlert,
  Compass,
  ArrowUpRight
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

  const bounds = {
    minLat: 7.0,
    maxLat: 36.5,
    minLng: 67.5,
    maxLng: 96.5,
  };

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
      className="bg-white rounded-2xl border border-[#E2DCCE] shadow-xs overflow-hidden flex flex-col"
    >
      {/* Map Header */}
      <div className="p-4 sm:px-6 py-3.5 border-b border-[#E8E2D8] flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
            <Crosshair className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Live Station Network
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2DCCE] text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeFilter === 'all'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            onClick={() => onFilterChange('healthy')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'healthy'
                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Normal
          </button>
          <button
            onClick={() => onFilterChange('suspicious')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'suspicious'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Suspicious
          </button>
          <button
            onClick={() => onFilterChange('anomaly')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'anomaly'
                ? 'bg-rose-100 text-rose-900 font-bold border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Anomaly
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] bg-[#FAF8F5] overflow-hidden flex items-center justify-center select-none">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {showRadarSweep && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-20">
            <div className="w-full h-full rounded-full border border-amber-600/30 animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(180,83,9,0.25)_360deg)]" />
          </div>
        )}

        <svg
          viewBox="0 0 800 760"
          className="w-full h-full max-w-[800px] max-h-[760px] transform transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <radialGradient id="anomaly-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="suspicious-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="opacity-95">
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
              fill="#F3EFEA"
              stroke="#D4CEBF"
              strokeWidth="2"
              strokeLinejoin="round"
              className="drop-shadow-xs"
            />

            <path
              d="M 260 190 Q 350 220 480 220 M 230 410 Q 340 430 500 440 M 185 320 Q 300 340 450 330 M 340 120 L 340 220 M 430 150 L 430 260 M 325 500 Q 380 520 450 540"
              fill="none"
              stroke="#E2DCCE"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          </g>

          <g className="station-mesh-lines opacity-30">
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
                    stroke="#b45309"
                    strokeWidth="0.8"
                    strokeDasharray="2,4"
                  />
                );
              });
            })}
          </g>

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
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                      strokeOpacity="0.6"
                    />
                  );
                })}
            </g>
          )}

          {filteredStations.map((station) => {
            const { x, y } = projectCoordinates(station.lat, station.lng);
            const isSelected = selectedStation?.id === station.id;
            const isHovered = hoveredStation?.id === station.id;
            const isAnomaly = station.status === 'anomaly';
            const isSuspicious = station.status === 'suspicious';

            let markerFill = '#16a34a'; // green
            let markerStroke = '#15803d';

            if (isSuspicious) {
              markerFill = '#d97706'; // amber
              markerStroke = '#b45309';
            } else if (isAnomaly) {
              markerFill = '#dc2626'; // red
              markerStroke = '#991b1b';
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
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  </>
                )}

                {isSuspicious && (
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill="url(#suspicious-glow)"
                    className="animate-pulse"
                  />
                )}

                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="13"
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isAnomaly ? 7.5 : 6}
                  fill={markerFill}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-transform duration-200 group-hover:scale-125 shadow-xs"
                />

                <text
                  x={x + 10}
                  y={y + 3}
                  fill={isAnomaly ? '#991b1b' : isSuspicious ? '#92400e' : '#0f172a'}
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-2xs select-none"
                >
                  {station.location}
                </text>
                <text
                  x={x + 10}
                  y={y + 13}
                  fill="#64748b"
                  fontSize="8.5"
                  fontFamily="'JetBrains Mono', monospace"
                  className="pointer-events-none select-none opacity-80"
                >
                  {station.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Station Hover Popup */}
        {(hoveredStation || selectedStation) && (
          <div
            id="map-station-popup"
            className="absolute bottom-4 left-4 max-w-xs sm:max-w-sm bg-white border border-[#E2DCCE] rounded-xl p-4 shadow-lg z-20 pointer-events-auto"
          >
            {(() => {
              const active = hoveredStation || selectedStation!;
              const isAnomaly = active.status === 'anomaly';
              const isSuspicious = active.status === 'suspicious';

              return (
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#E8E2D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          active.status === 'healthy' ? 'bg-emerald-500' :
                          active.status === 'suspicious' ? 'bg-amber-500' :
                          active.status === 'anomaly' ? 'bg-rose-600' : 'bg-slate-400'
                        }`} />
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {active.id}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {active.location}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      active.status === 'healthy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      active.status === 'suspicious' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      active.status === 'anomaly' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {active.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2.5 text-center">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8]">
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-700" />
                        Temp
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {active.currentReadings.temperature !== null && active.currentReadings.temperature !== undefined ? `${active.currentReadings.temperature}°C` : 'Unavailable'}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8]">
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3 text-amber-700" />
                        Press
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {active.currentReadings.pressure !== null && active.currentReadings.pressure !== undefined ? `${active.currentReadings.pressure} hPa` : 'Unavailable'}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8]">
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-amber-700" />
                        Hum
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {active.currentReadings.humidity !== null && active.currentReadings.humidity !== undefined ? `${active.currentReadings.humidity}%` : 'Unavailable'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {(isAnomaly || isSuspicious) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAnomalyModal(active);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Diagnostic</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectStation(active)}
                      className="py-1.5 px-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4EFE6] text-slate-800 text-xs font-medium border border-[#E2DCCE] transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="flex flex-col bg-white border border-[#E2DCCE] rounded-lg overflow-hidden shadow-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#FAF8F5] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-[#E8E2D8]" />
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#FAF8F5] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              showRadarSweep
                ? 'bg-amber-100 text-amber-900 border-amber-200 font-bold'
                : 'bg-white text-slate-600 border-[#E2DCCE]'
            }`}
            title="Toggle Radar Sweep Effect"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend */}
        <div 
          id="map-legend"
          className="absolute bottom-4 right-4 bg-white border border-[#E2DCCE] rounded-lg px-3.5 py-2.5 shadow-xs text-xs space-y-1.5 z-10"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">Suspicious</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-slate-700 font-medium">Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
