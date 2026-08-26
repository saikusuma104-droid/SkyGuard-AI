import React from 'react';
import { 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowUpRight,
  TrendingDown,
  Percent
} from 'lucide-react';
import { NetworkOverviewStats, StationStatus } from '../types';

interface NetworkStatsProps {
  stats: NetworkOverviewStats;
  selectedFilter: StationStatus | 'all';
  onSelectFilter: (filter: StationStatus | 'all') => void;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all' as const,
      label: 'TOTAL STATIONS',
      value: stats.totalStations,
      subtext: '47 Online • 1 Offline',
      accent: 'blue',
      borderColor: 'border-slate-800 hover:border-sky-500/40',
      activeBorder: 'border-sky-500 ring-1 ring-sky-500/30 bg-sky-950/20',
      numberColor: 'text-white',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: Radio,
      iconColor: 'text-sky-400',
      indicatorColor: 'bg-sky-400',
    },
    {
      id: 'healthy' as const,
      label: 'HEALTHY',
      value: stats.healthyCount,
      subtext: '87.5% nominal trust score',
      accent: 'green',
      borderColor: 'border-slate-800 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-950/20',
      numberColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      indicatorColor: 'bg-emerald-400',
    },
    {
      id: 'suspicious' as const,
      label: 'SUSPICIOUS',
      value: stats.suspiciousCount,
      subtext: 'Sensor drift / variance',
      accent: 'orange',
      borderColor: 'border-slate-800 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-950/20',
      numberColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      indicatorColor: 'bg-amber-400',
    },
    {
      id: 'anomaly' as const,
      label: 'ANOMALIES',
      value: stats.anomalyCount,
      subtext: 'Critical spike / fault',
      accent: 'red',
      borderColor: 'border-slate-800 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500/30 bg-rose-950/20',
      numberColor: 'text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: AlertOctagon,
      iconColor: 'text-rose-400',
      indicatorColor: 'bg-rose-400',
    },
  ];

  return (
    <section id="network-overview-stats" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <button
            key={card.id}
            id={`stat-card-${card.id}`}
            onClick={() => onSelectFilter(card.id)}
            className={`text-left p-5 rounded-xl bg-[#131E32] border transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group ${
              isSelected ? card.activeBorder : `${card.borderColor} hover:bg-[#16233B]`
            }`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${card.indicatorColor}`} />
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-['Plus_Jakarta_Sans']">
                  {card.label}
                </span>
              </div>
              <div className={`p-2 rounded-lg bg-slate-900/60 border border-slate-800 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Big Metric Number */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${card.numberColor}`}>
                {card.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {stats.totalStations}
              </span>
            </div>

            {/* Bottom: Subtitle / Supporting text */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/70 pt-2.5 mt-1">
              <span className="truncate">{card.subtext}</span>
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                {isSelected ? 'Filtered' : 'Filter →'}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
};
