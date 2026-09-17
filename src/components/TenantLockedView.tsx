import React from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ExternalLink } from 'lucide-react';
import { Tenant } from '../types';

interface TenantLockedViewProps {
  tenant: Tenant;
}

export const TenantLockedView: React.FC<TenantLockedViewProps> = ({ tenant }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xs w-full"
      >
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100">
          <Lock className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-3">{tenant.name} is Locked</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The subscription for this application has expired. Please contact the platform administrator or the app owner to reactivate access.
        </p>

        <div className="space-y-3">
          <a 
            href="mailto:support@timegig.com"
            className="w-full py-4 bg-black text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </a>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl text-sm border border-slate-200 active:scale-95 transition-all"
          >
            Return to Home
          </button>
        </div>

        <p className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Powered by TimeGiG Platform
        </p>
      </motion.div>
    </div>
  );
};
