import React from 'react';
import { 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon
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
      borderColor: 'border-[#E2DCCE] hover:border-amber-400',
      activeBorder: 'border-amber-600 ring-1 ring-amber-500/20 bg-[#FDFBF7]',
      stripeBg: 'bg-slate-400',
      numberColor: 'text-slate-900',
      icon: Radio,
      iconColor: 'text-slate-600',
      indicatorColor: 'bg-slate-500',
    },
    {
      id: 'healthy' as const,
      label: 'NORMAL FEEDS',
      value: stats.healthyCount,
      borderColor: 'border-[#E2DCCE] hover:border-emerald-400',
      activeBorder: 'border-emerald-600 ring-1 ring-emerald-500/20 bg-[#FDFBF7]',
      stripeBg: 'bg-emerald-500',
      numberColor: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      indicatorColor: 'bg-emerald-500',
    },
    {
      id: 'suspicious' as const,
      label: 'SUSPICIOUS',
      value: stats.suspiciousCount,
      borderColor: 'border-[#E2DCCE] hover:border-amber-400',
      activeBorder: 'border-amber-600 ring-1 ring-amber-500/20 bg-[#FDFBF7]',
      stripeBg: 'bg-amber-500',
      numberColor: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
      indicatorColor: 'bg-amber-500',
    },
    {
      id: 'anomaly' as const,
      label: 'ACTIVE ANOMALIES',
      value: stats.anomalyCount,
      borderColor: 'border-[#E2DCCE] hover:border-rose-400',
      activeBorder: 'border-rose-600 ring-1 ring-rose-500/20 bg-[#FDFBF7]',
      stripeBg: 'bg-rose-500',
      numberColor: 'text-rose-800',
      icon: AlertOctagon,
      iconColor: 'text-rose-700',
      indicatorColor: 'bg-rose-500',
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
            className={`text-left p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs relative overflow-hidden group ${
              isSelected ? card.activeBorder : `${card.borderColor} hover:bg-[#FAF8F5]`
            }`}
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.stripeBg}`} />

            {/* Header: Label & Icon */}
            <div className="flex items-center justify-between mb-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${card.indicatorColor}`} />
                <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase font-['Plus_Jakarta_Sans']">
                  {card.label}
                </span>
              </div>
              <div className={`p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Number */}
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${card.numberColor}`}>
                {card.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {stats.totalStations}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
};
