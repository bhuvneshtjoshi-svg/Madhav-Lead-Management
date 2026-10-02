import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  PlusCircle,
  Printer,
  Settings,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { storage, getTodayDateString } from '../../services/storage';

export type NavItem =
  | 'dashboard'
  | 'target-setter'
  | 'new-lead'
  | 'leads'
  | 'today'
  | 'teams'
  | 'team-work'
  | 'executive-work'
  | 'reports'
  | 'print-files'
  | 'masters'
  | 'backup'
  | 'settings'
  | 'overdue';

interface SidebarProps {
  currentTab: NavItem;
  onNavigate: (tab: NavItem) => void;
  todayCount?: number;
  overdueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  todayCount = 0,
  overdueCount = 0,
}) => {
  const menuItems: Array<{
    id: NavItem;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'target-setter', label: 'Target Setter', icon: Target },
    { id: 'new-lead', label: 'New Lead', icon: PlusCircle },
    { id: 'leads', label: 'All Leads', icon: Users },
    {
      id: 'today',
      label: "Today's Follow-ups",
      icon: Calendar,
      badge: todayCount,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'overdue',
      label: 'Overdue Follow-ups',
      icon: Clock,
      badge: overdueCount,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    { id: 'teams', label: 'Teams & Executives', icon: UserCheck },
    { id: 'team-work', label: 'Team Work', icon: Users },
    { id: 'executive-work', label: 'Executive Work', icon: Layers },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'print-files', label: 'Print / Lead Files', icon: Printer },
    { id: 'masters', label: 'Masters', icon: FolderOpen },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="no-print w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Branding Area */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-xs">
              BM
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                BM SALES
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
                Lead Manager
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 font-medium flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Single-User Desktop Edition</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/40 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-700">Office Workstation</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Physical File Ready &bull; A4 Print</div>
      </div>
    </aside>
  );
};
