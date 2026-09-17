import React, { useState, useEffect } from 'react';
import { Tenant, UserProfile } from '../types';
import { LayoutDashboard, Users, FileText, Settings, Upload, X, DollarSign, Image as ImageIcon, Copy, Check, Share2, CreditCard, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { PLATFORM_CONFIG } from '../config';

interface TenantOwnerDashboardProps {
  tenant: Tenant;
  profile: UserProfile;
}

export const TenantOwnerDashboard: React.FC<TenantOwnerDashboardProps> = ({ tenant, profile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'billing'>('overview');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [appName, setAppName] = useState(tenant.name);
  const [appLogo, setAppLogo] = useState(tenant.logoUrl || null);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor || '#4f46e5');

  const shareLink = `https://${tenant.slug}.${PLATFORM_CONFIG.mainDomain}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appName,
          text: `Check out our app ${appName} on TimeGiG!`,
          url: shareLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', tenant.id), {
        name: appName,
        logoUrl: appLogo,
        primaryColor,
        updatedAt: serverTimestamp()
      });
      alert('Branding updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tenants/${tenant.id}`);
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="p-4 space-y-6 pb-20 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
            {appLogo ? (
              <img src={appLogo} alt="" className="w-10 h-10 object-contain" />
            ) : (
              <LayoutDashboard className="w-6 h-6 text-indigo-500" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{appName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant Owner Portal</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          tenant.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
          tenant.subscriptionStatus === 'trial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {tenant.subscriptionStatus}
        </div>
      </div>

      <div className="bg-white p-1 rounded-2xl border border-slate-100 flex shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'branding', label: 'Branding', icon: ImageIcon },
          { id: 'billing', label: 'Subscription', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <p className="text-xs font-medium text-indigo-100 uppercase tracking-widest mb-1">Your App Link</p>
            <h3 className="text-lg font-bold mb-4 break-all opacity-90">{shareLink}</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleCopyLink}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Share2 className="w-3.5 h-3.5" /> Share App
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Users</p>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <p className="text-[10px] text-emerald-500 font-medium mt-1">+2 this week</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Gigs</p>
              <div className="text-2xl font-bold text-slate-900">8</div>
              <p className="text-[10px] text-indigo-500 font-medium mt-1">Tenant exclusive</p>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-3xl text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Quick Tips</h3>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                Share your branded link on WhatsApp groups to find workers.
              </li>
              <li className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                Keep your app name professional to build trust with users.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Custom App Name</label>
            <input 
              type="text" 
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">App Logo</label>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group cursor-pointer hover:border-indigo-400 transition-colors">
              {appLogo ? (
                <img src={appLogo} alt="" className="w-20 h-20 object-contain rounded-xl mb-3" />
              ) : (
                <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-indigo-500" />
              )}
              <p className="text-xs font-bold text-slate-500">Tap to upload</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Theme Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-none p-0"
              />
              <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600">
                {primaryColor.toUpperCase()}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveBranding}
            disabled={isSaving}
            className="w-full py-4 bg-black text-white font-bold rounded-2xl text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Save Branding'}
          </button>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <CreditCard className="w-12 h-12 text-slate-50" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Subscription</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900">R299.99</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="text-slate-500">Next billing date</span>
                <span className="font-bold text-slate-900">
                  {tenant.trialEndDate?.toDate ? tenant.trialEndDate.toDate().toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-900">Trial Period</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600 uppercase">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl">
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
              Payment processing is coming soon! During the 30-day trial, you can use all white-label features for free. We will notify you when it is time to connect your card.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
