import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Radio, 
  AlertTriangle, 
  BarChart3, 
  HeartPulse, 
  Settings, 
  ShieldAlert, 
  CheckCircle2,
  Server
} from 'lucide-react';
import { NavigationSection } from '../types';

interface SidebarProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  anomalyCount: number;
  suspiciousCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  anomalyCount,
  suspiciousCount,
}) => {
  const navItems: Array<{
    id: NavigationSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live_monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'stations', label: 'Stations', icon: Radio, badge: 48 },
    { 
      id: 'anomalies', 
      label: 'Anomalies', 
      icon: AlertTriangle, 
      badge: anomalyCount + suspiciousCount,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' 
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sensor_health', label: 'Sensor Health', icon: HeartPulse },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-64 bg-[#0F172A] border-r border-slate-800/80 flex flex-col flex-shrink-0 select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/30">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
              SkyGuard
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            AWS Trust & Operations
          </span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operations Center
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-950/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Network Status Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">AWS Telemetry Hub</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
          <span>Active Ingestion</span>
          <span className="font-mono text-slate-300">1.2 Hz Stream</span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>AI Engine</span>
          <span className="font-mono text-sky-400">v2.4 SIH-Core</span>
        </div>
      </div>
    </aside>
  );
};
