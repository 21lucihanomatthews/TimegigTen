import React from 'react';
import { Compass, Network, UserCheck, CheckCircle2, Shield, LayoutDashboard } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profilePhoto?: string;
  isTenantApproved?: boolean;
  accountType?: 'User' | 'TenantOwner' | 'MainAdmin';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab, profilePhoto, isTenantApproved, accountType }) => {
  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-[500] bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-md mx-auto px-2 h-18 flex items-center justify-around">
        {/* Seekers Tab */}
        <button
          onClick={() => onSelectTab('seekers')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 flex-1 ${
            currentTab === 'seekers' ? 'text-brand scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-brand'
          }`}
        >
          <Network className="w-5 h-5 stroke-[2.2] mb-1" />
          <span className="text-[9px] tracking-tight font-bold">Seekers</span>
        </button>

        {/* GiGs Tab */}
        <button
          onClick={() => onSelectTab('gigs')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 flex-1 ${
            currentTab === 'gigs' ? 'text-brand scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-brand'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[2.2] mb-1" />
          <span className="text-[9px] tracking-tight font-bold">GiGs</span>
        </button>

        {/* Admin Tab (Main Admin Only) */}
        {accountType === 'MainAdmin' && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`relative flex flex-col items-center justify-center group transition-all duration-200 flex-1 ${
              currentTab === 'admin' ? 'text-brand scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-brand'
            }`}
          >
            <Shield className="w-5 h-5 stroke-[2.2] mb-1" />
            <span className="text-[9px] tracking-tight font-bold">Admin</span>
          </button>
        )}

        {/* Tenant Admin Tab (Tenant Owners or Main Admin) */}
        {(accountType === 'TenantOwner' || accountType === 'MainAdmin') && (
          <button
            onClick={() => onSelectTab('tenant-admin')}
            className={`relative flex flex-col items-center justify-center group transition-all duration-200 flex-1 ${
              currentTab === 'tenant-admin' ? 'text-brand scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-brand'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[2.2] mb-1" />
            <span className="text-[9px] tracking-tight font-bold text-center">My App</span>
          </button>
        )}

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center group transition-all duration-200 flex-1 ${
            currentTab === 'profile' ? 'text-brand scale-110 drop-shadow-sm' : 'text-slate-500 hover:scale-105 hover:text-brand'
          }`}
        >
          <div className="relative mb-1">
            {profilePhoto ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
                currentTab === 'profile' ? 'ring-2 ring-brand ring-offset-2 ring-offset-white' : 'ring-2 ring-slate-200'
              }`}>
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            )}
            {isTenantApproved && (
              <div className="absolute -bottom-1 -right-1 bg-brand border-[1px] border-white text-white p-[0.5px] rounded-full z-10 shadow-sm">
                <CheckCircle2 className="w-2 h-2" />
              </div>
            )}
          </div>
          <span className="text-[9px] tracking-tight font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
};
