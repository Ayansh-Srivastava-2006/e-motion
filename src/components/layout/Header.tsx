import React from 'react';
import { ViewTab } from './Sidebar';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  activeView: ViewTab;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const titles: Record<ViewTab, { title: string; badge: string }> = {
    dashboard: { title: 'Load Distribution Analyzer', badge: 'STATIC ANALYSIS' },
    inputs: { title: 'Project Inputs & Configuration', badge: 'SETUP MODE' },
    simulation: { title: 'Load Distribution Analyzer', badge: 'STATIC ANALYSIS' },
    analysis: { title: 'Detailed Engineering Analysis', badge: 'TELEMETRY' },
    reports: { title: 'EV Chassis Report', badge: 'CAE EXPORT' },
  };

  const current = titles[activeView] || titles.dashboard;

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 flex items-center justify-between px-8 border-b border-outline-variant/20 font-mono">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-on-surface">{current.title}</span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
          <span className="text-xs text-secondary-fixed uppercase tracking-wider font-semibold">
            {current.badge}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-on-surface transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-container rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
