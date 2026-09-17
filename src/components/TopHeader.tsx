import React from 'react';
import { Settings, Maximize2 } from 'lucide-react';
import { NavTab } from '../types';

interface TopHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onToggleSettings: () => void;
  profilePhoto?: string;
  appName?: string;
  onViewLogo?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ 
  currentTab, 
  onSelectTab, 
  onToggleSettings, 
  profilePhoto, 
  appName = 'TimeGiG',
  onViewLogo
}) => {
  return (
    <header className="sticky top-0 z-[400] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User / App Logo Button with 5s Full Screen Trigger */}
          <button
            onClick={onViewLogo}
            className="relative group w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-xs ring-2 ring-brand/10 hover:ring-brand hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 bg-slate-900"
            title="Display user logo full screen for 5 seconds"
            aria-label="Display user logo full screen for 5 seconds"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt={appName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-brand to-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </button>

          <div>
            <h1 className="text-xs font-bold text-slate-900 leading-tight">{appName}</h1>
            <p className="text-[10px] text-slate-500">Live Gigs & Professional Talent</p>
          </div>
        </div>

        <button
          onClick={onToggleSettings}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-brand/10 border-brand/20 text-brand shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
          aria-label="Settings"
          title={currentTab === 'settings' ? 'Close Settings' : 'Settings'}
        >
          <Settings className="w-4 h-4 stroke-[2]" />
          <span className="text-[11px] font-semibold hidden sm:inline">
            {currentTab === 'settings' ? 'Close' : 'Settings'}
          </span>
        </button>
      </div>
    </header>
  );
};
