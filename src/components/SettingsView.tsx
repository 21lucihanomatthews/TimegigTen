import React, { useState } from 'react';
import { Building2, Info, HelpCircle, LogOut, X, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'tenant' | 'about' | 'help' | 'logout' | null>(null);
  const [tenantUnit, setTenantUnit] = useState('');
  const [tenantSubmitting, setTenantSubmitting] = useState(false);
  const [tenantSuccess, setTenantSuccess] = useState(false);

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantUnit.trim()) return;
    setTenantSubmitting(true);
    setTimeout(() => {
      setTenantSubmitting(false);
      setTenantSuccess(true);
      setTimeout(() => {
        setTenantSuccess(false);
        setActiveModal(null);
        setTenantUnit('');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-slate-100 text-slate-900 pb-28 pt-4 px-3 max-w-lg mx-auto overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <span>Settings & Portal</span>
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">Manage your TimeGiG account, venue access, and system preferences</p>
      </div>

      {/* Settings Features in Separated Bubbles */}
      <div className="space-y-3 text-xs">
        {/* Tenant Portal Bubble */}
        <button
          onClick={() => setActiveModal('tenant')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-red-600 transition-colors">
                  Tenant Portal
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                  Venue
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage venue lease, billing & workspace access</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors shrink-0">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

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
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tenant Portal</h3>
                <p className="text-[11px] text-slate-500">Venue & Workspace Management</p>
              </div>
            </div>

            <form onSubmit={handleTenantSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Tenant Unit / Venue Code</label>
                <input
                  type="text"
                  required
                  value={tenantUnit}
                  onChange={e => setTenantUnit(e.target.value)}
                  placeholder="e.g. VENUE-JHB-04"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={tenantSubmitting}
                className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {tenantSubmitting ? 'Verifying Tenant...' : 'Access Tenant Portal'}
              </button>

              {tenantSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tenant lease active & verified!
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeModal === 'about' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900 text-center">
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
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
