import React from 'react';
import { Compass, Network, UserCheck } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profilePhoto?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab, profilePhoto }) => {
  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-[500] bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-around">
        {/* Seekers Tab */}
        <button
          onClick={() => onSelectTab('seekers')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'seekers' ? 'text-black scale-110' : 'text-black hover:text-black'
          }`}
          aria-label="Seekers Feature"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
            currentTab === 'seekers'
              ? 'bg-gradient-to-tr from-black to-slate-900 text-white shadow-black/20 shadow-md ring-2 ring-black/50'
              : 'bg-slate-100 border border-slate-200 text-black group-hover:bg-slate-200'
          }`}>
            <Network className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight font-bold">
            Seekers
          </span>
        </button>

        {/* GiGs Tab (Middle) */}
        <button
          onClick={() => onSelectTab('gigs')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'gigs' ? 'text-black scale-110' : 'text-black hover:text-black'
          }`}
          aria-label="GiGs Feature"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
            currentTab === 'gigs'
              ? 'bg-gradient-to-tr from-black to-slate-900 text-white shadow-black/20 shadow-md ring-2 ring-black/50'
              : 'bg-slate-100 border border-slate-200 text-black group-hover:bg-slate-200'
          }`}>
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight font-bold">
            GiGs
          </span>
          <span className={`absolute -top-1 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white transition-transform ${currentTab === 'gigs' ? 'scale-110' : 'scale-90'}`}></span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 ${
            currentTab === 'profile' ? 'text-black scale-110' : 'text-black hover:text-black'
          }`}
          aria-label="Profile Feature"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-all shadow-xs ${
            currentTab === 'profile'
              ? 'ring-2 ring-black ring-offset-2 ring-offset-white bg-gradient-to-tr from-black to-slate-900 text-white'
              : 'border border-slate-200 bg-slate-100 group-hover:border-slate-300 text-black'
          }`}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight font-bold">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
