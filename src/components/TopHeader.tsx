import React from 'react';
import { Settings } from 'lucide-react';
import { NavTab } from '../types';

interface TopHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onToggleSettings: () => void;
  profilePhoto?: string;
  appName?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTab, onSelectTab, onToggleSettings, profilePhoto, appName = 'TimeGiG' }) => {
  return (
    <header className="sticky top-0 z-[400] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between max-w-xl mx-auto shadow-xs">
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-xs font-bold text-slate-900 leading-tight">{appName}</h1>
          <p className="text-[10px] text-slate-500">Live Gigs & Professional Talent</p>
        </div>
      </div>
      <button
        onClick={onToggleSettings}
        className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
          currentTab === 'settings'
            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
        aria-label="Settings"
        title={currentTab === 'settings' ? 'Close Settings' : 'Settings'}
      >
        <Settings className="w-4 h-4 stroke-[2]" />
        <span className="text-[11px] font-semibold hidden sm:inline">
          {currentTab === 'settings' ? 'Close' : 'Settings'}
        </span>
      </button>
    </header>
  );
};
