import React from 'react';
import { Compass, Network, UserCheck, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profilePhoto?: string;
  isTenantApproved?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab, profilePhoto, isTenantApproved }) => {
  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-[500] bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-around">
        {/* Seekers Tab */}
        <button
          onClick={() => onSelectTab('seekers')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'seekers' ? 'text-indigo-600 scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-indigo-600'
          }`}
          aria-label="Seekers Feature"
        >
          <Network className="w-6 h-6 stroke-[2.2] mb-1" />
          <span className="text-[11px] tracking-tight font-bold">
            Seekers
          </span>
        </button>

        {/* GiGs Tab (Middle) */}
        <button
          onClick={() => onSelectTab('gigs')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'gigs' ? 'text-indigo-600 scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-indigo-600'
          }`}
          aria-label="GiGs Feature"
        >
          <Compass className="w-6 h-6 stroke-[2.2] mb-1" />
          <span className="text-[11px] tracking-tight font-bold">
            GiGs
          </span>
          <span className={`absolute top-0 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white transition-transform ${currentTab === 'gigs' ? 'scale-110' : 'scale-90'}`}></span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'profile' ? 'text-indigo-600 scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-indigo-600'
          }`}
          aria-label="Profile Feature"
        >
          <div className="relative mb-1">
            {profilePhoto ? (
              <div className={`w-7 h-7 rounded-full overflow-hidden transition-all ${
                currentTab === 'profile' ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white' : 'ring-2 ring-slate-200'
              }`}>
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            )}
            {isTenantApproved && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 border-[2px] border-white text-white p-[1px] rounded-full z-10 shadow-sm" title="Tenant Approved">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            )}
          </div>
          <span className="text-[11px] tracking-tight font-bold">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
