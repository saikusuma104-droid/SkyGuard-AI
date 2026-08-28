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
      subtext: `${stats.totalStations} Monitored AWS Nodes`,
      borderColor: 'border-slate-800 hover:border-sky-500/40',
      activeBorder: 'border-sky-500 ring-1 ring-sky-500/30 bg-sky-950/20',
      stripeBg: 'bg-sky-500',
      numberColor: 'text-white',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: Radio,
      iconColor: 'text-sky-400',
      indicatorColor: 'bg-sky-400',
    },
    {
      id: 'healthy' as const,
      label: 'NORMAL FEEDS',
      value: stats.healthyCount,
      subtext: `${stats.healthyCount} Nominal Telemetry Feeds`,
      borderColor: 'border-slate-800 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-950/20',
      stripeBg: 'bg-emerald-500',
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
      subtext: `${stats.suspiciousCount} Minor Variance Flag(s)`,
      borderColor: 'border-slate-800 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-950/20',
      stripeBg: 'bg-amber-400',
      numberColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      indicatorColor: 'bg-amber-400',
    },
    {
      id: 'anomaly' as const,
      label: 'ACTIVE ANOMALIES',
      value: stats.anomalyCount,
      subtext: `${stats.anomalyCount} AI Anomaly Alert(s)`,
      borderColor: 'border-slate-800 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500/30 bg-rose-950/20',
      stripeBg: 'bg-rose-500',
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
            className={`text-left p-5 rounded-xl bg-[#131E32] border transition-all duration-200 cursor-pointer shadow-md relative overflow-hidden group ${
              isSelected ? card.activeBorder : `${card.borderColor} hover:bg-[#16233B]`
            }`}
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.stripeBg}`} />

            {/* Header: Label & Icon */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${card.indicatorColor}`} />
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-['Plus_Jakarta_Sans']">
                  {card.label}
                </span>
              </div>
              <div className={`p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Number */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${card.numberColor}`}>
                {card.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {stats.totalStations}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5 mt-1">
              <span className="truncate text-[11px]">{card.subtext}</span>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors whitespace-nowrap pl-2">
                {isSelected ? '● Active' : 'Filter →'}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
};

