import React, { useState } from 'react';
import { Building2, Info, HelpCircle, LogOut, X, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { UserProfile } from '../types';
import { TenantPortalView } from './TenantPortalView';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SettingsViewProps {
  profile: UserProfile;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile }) => {
  const [activeModal, setActiveModal] = useState<'tenant' | 'about' | 'help' | 'logout' | null>(null);
  const [showTenantPortal, setShowTenantPortal] = useState(false);
  const [popFile, setPopFile] = useState<File | null>(null);
  const [tenantSubmitting, setTenantSubmitting] = useState(false);
  const [tenantSuccess, setTenantSuccess] = useState(false);

  const handleTenantAccess = () => {
    // If the profile already shows they are an approved tenant, open portal
    if (profile.isTenantApproved) {
      setShowTenantPortal(true);
    } else {
      setActiveModal('tenant');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clean up UI local storage if any specific UI state needs reset
      localStorage.removeItem('timegig_current_tab');
      window.location.reload();
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!popFile) return;
    setTenantSubmitting(true);
    setTimeout(() => {
      setTenantSubmitting(false);
      setTenantSuccess(true);
      localStorage.setItem('tenant_paid', 'true');
      setTimeout(() => {
        setTenantSuccess(false);
        setActiveModal(null);
        setPopFile(null);
        setShowTenantPortal(true);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-transparent text-slate-900 pb-28 pt-4 px-3 max-w-lg mx-auto overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <span>Settings & Portal</span>
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">Manage your TimeGiG account, venue access, and system preferences</p>
      </div>

      {/* Settings Features in Separated Bubbles */}
      <div className="space-y-3 text-xs">
        {/* Tenant Portal Bubble (Only shown if approved) */}
        {profile.isTenantApproved && (
          <button
            onClick={handleTenantAccess}
            className="w-full bg-black border border-slate-800 rounded-2xl p-4 shadow-xl shadow-black/10 hover:shadow-2xl transition-all flex items-center justify-between text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:bg-gradient-to-br group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all"></div>
            
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform border border-indigo-400/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-xs sm:text-sm transition-colors">
                    Tenant Portal
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20">
                    Boss Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">Run the app like your own boss, earn passive income</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0 relative z-10">
              <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        )}

        {/* About the App Bubble */}
        <button
          onClick={() => setActiveModal('about')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-600 transition-colors">
                  About the App
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">TimeGiG platform info, version & release notes</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Help Guide Bubble */}
        <button
          onClick={() => setActiveModal('help')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-slate-900 transition-colors">
                  Help Guide
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-transparent text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  FAQs
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Booking tutorials, safety, and support questions</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-200 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Logout Bubble */}
        <button
          onClick={() => setActiveModal('logout')}
          className="w-full bg-white border border-red-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-red-300 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-red-600 text-xs sm:text-sm group-hover:text-red-700 transition-colors">
                  Logout
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Sign Out
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">End active session securely</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      </div>

      {/* Modals for Settings Items */}
      {activeModal === 'tenant' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-transparent text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tenant Portal</h3>
                <p className="text-[11px] text-slate-500">Manage & Earn from your App</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 mt-2">
              <p className="text-[11px] text-indigo-800 font-medium mb-2 leading-relaxed">
                All tenants must pay a monthly subscription fee of <strong>R299,99</strong> to access management features.
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs text-slate-700 space-y-1 shadow-xs">
                <div className="flex justify-between"><span>Bank:</span> <strong className="text-slate-900">Capitec</strong></div>
                <div className="flex justify-between"><span>Account Name:</span> <strong className="text-slate-900">Matthews</strong></div>
                <div className="flex justify-between"><span>Account Number:</span> <strong className="text-slate-900">1334067366</strong></div>
                <div className="flex justify-between"><span>Reference:</span> <strong className="text-slate-900">Sub299</strong></div>
              </div>
            </div>

            <form onSubmit={handleTenantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Upload Proof of Payment</label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={e => setPopFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={tenantSubmitting || !popFile}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {tenantSubmitting ? 'Uploading & Verifying...' : 'Submit Payment Proof'}
              </button>

              {tenantSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Subscription updated successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeModal === 'about' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-transparent text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
                <Info className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">About TimeGiG</h3>
                <p className="text-[11px] text-slate-500">Version 2.4.0 (Build SA-PRO)</p>
              </div>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 mt-3 leading-relaxed">
              <p>
                TimeGiG is the premier platform connecting live performance artists, event producers, technicians, and venues across South Africa.
              </p>
              <p>
                Built with robust security, real-time map discovery, verified professional profiles, and seamless instant booking.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'help' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-transparent text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Help Guide & FAQ</h3>
                <p className="text-[11px] text-slate-500">Everything you need to know</p>
              </div>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 mt-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="block text-slate-900 mb-0.5">How do I apply for gigs?</strong>
                Browse the interactive map, click any gig profile bubble, and tap "Apply for Gig".
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="block text-slate-900 mb-0.5">How do I hire talent?</strong>
                Switch to the Seekers tab, search by trade or skill, and tap "Hire" or view full credentials.
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to log out of your TimeGiG session? Your activities and settings are securely remembered.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-transparent hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showTenantPortal && (
        <TenantPortalView onClose={() => setShowTenantPortal(false)} profile={profile} />
      )}
    </div>
  );
};
