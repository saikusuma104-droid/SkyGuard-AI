import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  AlertTriangle, 
  Info,
  ShieldAlert, 
  LogOut
} from 'lucide-react';
import { NavigationSection, AuthUser } from '../types';

interface SidebarProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  totalStationsCount: number;
  anomalyCount: number;
  suspiciousCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  totalStationsCount,
  anomalyCount,
  suspiciousCount,
  currentUser,
  onLogout,
}) => {
  const navItems: Array<{
    id: NavigationSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stations', label: 'Stations', icon: Radio, badge: totalStationsCount },
    { 
      id: 'anomalies', 
      label: 'Anomalies', 
      icon: AlertTriangle, 
      badge: anomalyCount + suspiciousCount,
      badgeColor: (anomalyCount + suspiciousCount) > 0 
        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    { id: 'about', label: 'About / System', icon: Info },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-64 bg-[#0F172A] border-r border-slate-800/80 flex flex-col flex-shrink-0 select-none z-30 shadow-xl"
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-950/50 border border-sky-400/30 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
              SkyGuard
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium truncate">
            AWS Real Telemetry
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-950/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-400" />
              )}

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
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Box */}
      {currentUser && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 font-mono font-bold text-xs">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs text-white truncate">
                  {currentUser.username}
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {currentUser.name}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-button"
              onClick={onLogout}
              title="Logout session"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 transition-all flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* System Status Footer */}
      <div className="p-3.5 m-3 mt-0 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-200">AWS Telemetry Hub</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono">
          <span>Sync Cycle</span>
          <span className="text-emerald-400 font-bold">1 Hour</span>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>AI Model</span>
          <span className="text-sky-400 font-bold">v2.4 SIH</span>
        </div>
      </div>
    </aside>
  );
};

