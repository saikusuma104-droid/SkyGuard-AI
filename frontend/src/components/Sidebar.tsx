import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  AlertTriangle, 
  Database,
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
    { id: 'stations', label: 'Live Monitoring', icon: Radio, badge: totalStationsCount },
    { 
      id: 'anomalies', 
      label: 'Anomalies', 
      icon: AlertTriangle, 
      badge: anomalyCount + suspiciousCount,
      badgeColor: (anomalyCount + suspiciousCount) > 0 
        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    },
    { id: 'history', label: 'Historical Telemetry', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  const displayName = currentUser?.username || currentUser?.name || 'Duty Operator';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <aside 
      id="main-sidebar"
      className="w-60 bg-[#FBF9F5] border-r border-[#E8E2D8] flex flex-col flex-shrink-0 select-none z-30 shadow-2xs"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E8E2D8] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-700 flex items-center justify-center shadow-xs border border-amber-800 flex-shrink-0">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
              SkyGuard
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              AI
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#F2ECE1] text-amber-900 font-semibold border border-[#E2D6C3] shadow-2xs'
                  : 'text-slate-600 hover:bg-[#F4EFE6] hover:text-slate-900'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-700" />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
