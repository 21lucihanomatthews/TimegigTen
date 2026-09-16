import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LayoutDashboard, Users, FileText, Settings, Upload, X, DollarSign, Image as ImageIcon, Copy, Check, Share2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TenantPortalViewProps {
  onClose: () => void;
  profile: UserProfile;
}

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({ onClose, profile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pop' | 'settings'>('overview');
  const [subscriptionFee, setSubscriptionFee] = useState('29.99');
  
  const [appName, setAppName] = useState(() => localStorage.getItem('tenant_app_name') || 'TimeGiG');
  const [appLogo, setAppLogo] = useState<string | null>(() => localStorage.getItem('tenant_app_logo') || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const customDomain = `https://${appName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}.tg.com`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customDomain);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Mock Active Verified Users
  const activeUsers = [
    { id: 1, name: 'Sarah Jenkins', role: 'Premium Seeker', earnings: 450, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 2, name: 'Mike Ross', role: 'Verified Gig Worker', earnings: 820, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { id: 3, name: 'Jessica Alba', role: 'Premium Seeker', earnings: 120, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAppLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    setIsSaving(true);
    localStorage.setItem('tenant_app_name', appName);
    if (appLogo) {
      localStorage.setItem('tenant_app_logo', appLogo);
    } else {
      localStorage.removeItem('tenant_app_logo');
    }
    
    // Simulate API delay, then force reload to show splash screen with new branding
    setTimeout(() => {
      setIsSaving(false);
      window.location.reload();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col"
    >
      {/* Top Menu Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {appLogo ? (
            <img src={appLogo} alt="App Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              TP
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Tenant Portal</h1>
            <p className="text-[10px] text-slate-500">Management & Earnings</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <div className="bg-white px-2 py-2 flex items-center gap-1 overflow-x-auto border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'Verified Users', icon: Users },
            { id: 'pop', label: 'Proof of Payment', icon: FileText },
            { id: 'settings', label: 'App Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Total Earnings</p>
                  <h3 className="text-2xl font-bold text-slate-900">R1,390.00</h3>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">+12% this month</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Active Users</p>
                  <h3 className="text-2xl font-bold text-slate-900">{activeUsers.length}</h3>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">Verified & Subscribed</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Welcome to your Portal!</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Your tenant subscription of R299,99/month is active. Use this dashboard to manage your own application, track user earnings, set your subscription fees, and customize your app's branding.
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    Your App Link
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 truncate overflow-hidden">
                      {customDomain}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center justify-center min-w-[36px]"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Share this link to direct users to your branded experience.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VERIFIED USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Active Verified Users</h3>
              {activeUsers.map((user) => (
                <div key={user.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Earnings</p>
                    <p className="text-sm font-bold text-emerald-600">R{user.earnings.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROOF OF PAYMENT TAB */}
          {activeTab === 'pop' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Subscription Active</h3>
                  <p className="text-xs text-slate-500">Your R299,99 monthly payment is verified.</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Latest Document</p>
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Proof_of_Payment_Sept.pdf</p>
                    <p className="text-[10px] text-slate-500">Uploaded recently</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* APP SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  Subscription Fee Changer
                </h3>
                <p className="text-xs text-slate-500">Set the monthly fee your users must pay to access premium features in your app.</p>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">User Subscription Fee (ZAR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">R</span>
                    <input 
                      type="number" 
                      value={subscriptionFee}
                      onChange={(e) => setSubscriptionFee(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">
                  Update Fee
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  App Branding
                </h3>
                <p className="text-xs text-slate-500">Personalize your app with a custom name and logo. Changes will apply immediately.</p>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom App Name</label>
                  <input 
                    type="text" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. My Custom Gig App"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">App Logo</label>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden group hover:border-indigo-400 transition-colors">
                    {appLogo ? (
                      <img src={appLogo} alt="Preview" className="w-20 h-20 object-cover rounded-2xl mb-3 shadow-md" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                    )}
                    <p className="text-xs font-semibold text-slate-600 text-center">
                      {appLogo ? 'Click to change logo' : 'Tap to upload logo'}
                    </p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveBranding}
                  disabled={isSaving || !appName.trim()}
                  className="w-full py-2.5 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors shadow-sm mt-2 flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving & Reloading...' : 'Save Branding Changes'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};
