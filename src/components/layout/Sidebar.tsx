import React from 'react';
import { LayoutDashboard, Sliders, Play, LineChart, FileText, RotateCcw } from 'lucide-react';

export type ViewTab = 'dashboard' | 'inputs' | 'simulation' | 'analysis' | 'reports';

interface SidebarProps {
  activeView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  onOpenResetModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView, onOpenResetModal }) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { id: 'inputs', label: 'Project Inputs', icon: <Sliders className="w-5 h-5 mr-3" /> },
    { id: 'simulation', label: 'Simulation', icon: <Play className="w-5 h-5 mr-3" /> },
    { id: 'analysis', label: 'Analysis', icon: <LineChart className="w-5 h-5 mr-3" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5 mr-3" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col pt-6 pb-8 border-r border-outline-variant/20 font-mono">
      <div className="px-6 mb-8">
        <div className="text-sm font-bold text-primary uppercase tracking-wider">EV Chassis Analyzer</div>
        <div className="text-xs text-on-surface-variant mt-1">Project: EV Chassis</div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant">
        <span>v2.4.1-CAE</span>
        <button
          onClick={onOpenResetModal}
          className="text-secondary-fixed hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Project
        </button>
      </div>
    </aside>
  );
};
