import React from 'react';
import { Clock, ShieldAlert, LogOut, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface AwaitingApprovalViewProps {
  appName: string;
  userEmail: string;
}

export const AwaitingApprovalView: React.FC<AwaitingApprovalViewProps> = ({ appName, userEmail }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full space-y-8"
      >
        <div className="relative">
          <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-amber-100 shadow-sm relative overflow-hidden">
            <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
            <div className="absolute top-0 right-0 p-1 bg-amber-500 rounded-bl-xl border-l border-b border-amber-200">
               <ShieldAlert className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Account Pending Approval
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your profile for <span className="font-bold text-slate-900">{appName}</span> has been submitted. The platform administrators are currently reviewing your documents.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <LogOut className="w-5 h-5 rotate-180" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
              <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
             <div className="flex items-start gap-3">
               <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-current" />
               </div>
               <p className="text-xs text-slate-600">You will receive an email once your account is verified.</p>
             </div>
             <div className="flex items-start gap-3">
               <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-current" />
               </div>
               <p className="text-xs text-slate-600">Full access to Gigs and Seekers will be enabled upon approval.</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-black text-white font-bold rounded-2xl text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            Check Status
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 text-slate-500 font-bold rounded-2xl text-sm hover:bg-slate-100 transition-all"
          >
            Sign Out
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-medium">
          If you have been waiting for more than 48 hours, please contact support.
        </p>
      </motion.div>
    </div>
  );
};
