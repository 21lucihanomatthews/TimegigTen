import React, { useState, useEffect } from 'react';
import { NavTab, Gig, UserProfile, Seeker } from './types';
import { INITIAL_GIGS, INITIAL_SEEKERS } from './data';
import { GiGsView } from './components/GiGsView';
import { SeekersView } from './components/SeekersView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { TopHeader } from './components/TopHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { useTenant } from './TenantContext';
import { MainAdminDashboard } from './components/MainAdminDashboard';
import { TenantOwnerDashboard } from './components/TenantOwnerDashboard';
import { TenantLockedView } from './components/TenantLockedView';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Users, Settings, UserCircle, Star, AlertCircle, LogOut } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function App() {
  const { currentTenant, isLoadingTenant, tenantError, isPlatformMode } = useTenant();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [showSplash, setShowSplash] = useState(true);
  
  // Use tenant branding if available
  const appName = currentTenant?.name || localStorage.getItem('tenant_app_name') || 'TimeGiG';
  const appLogo = currentTenant?.logoUrl || localStorage.getItem('tenant_app_logo');
  const primaryColor = currentTenant?.primaryColor || '#4f46e5';

  useEffect(() => {
    // Inject dynamic theme color
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoadingAuth(false);
    });

    const timer = setTimeout(() => setShowSplash(false), 5000);
    
    return () => {
      unsubscribeAuth();
      clearTimeout(timer);
    };
  }, [primaryColor]);

  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('timegig_welcome_shown'));
  const [showTenantPopup, setShowTenantPopup] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    return (localStorage.getItem('timegig_current_tab') as NavTab) || 'gigs';
  });

  const [previousTab, setPreviousTab] = useState<NavTab>('gigs');

  const [gigs, setGigs] = useState<Gig[]>(() => {
    const saved = localStorage.getItem('timegig_gigs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_GIGS;
  });

  const [seekers, setSeekers] = useState<Seeker[]>(() => {
    const saved = localStorage.getItem('timegig_seekers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SEEKERS;
  });

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    surname: '',
    dob: '',
    address: '',
    city: '',
    province: 'Gauteng',
    contactNumber: '',
    socialLinks: [],
    accountType: 'User'
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocPath = `users/${auth.currentUser.uid}`;
    const unsubscribeProfile = onSnapshot(doc(db, userDocPath), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(prev => ({
          ...prev,
          ...data,
          socialLinks: data.socialLinks || prev.socialLinks || []
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, userDocPath);
    });

    return () => unsubscribeProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentTab !== 'settings') {
      localStorage.setItem('timegig_current_tab', currentTab);
    }
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('timegig_gigs', JSON.stringify(gigs));
  }, [gigs]);

  useEffect(() => {
    localStorage.setItem('timegig_seekers', JSON.stringify(seekers));
  }, [seekers]);

  const handleUpdateProfile = async (updated: UserProfile) => {
    if (!auth.currentUser) return;
    const userDocPath = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, userDocPath), {
        ...updated,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userDocPath);
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab !== 'settings' && currentTab !== 'settings') {
      setPreviousTab(tab);
    }
    setCurrentTab(tab);
  };

  const handleToggleSettings = () => {
    if (currentTab === 'settings') {
      setCurrentTab(previousTab);
    } else {
      if (currentTab !== 'settings') {
        setPreviousTab(currentTab);
      }
      setCurrentTab('settings');
    }
  };

  const handleToggleSave = (id: string) => {
    setGigs(gigs.map(g => g.id === id ? { ...g, saved: !g.saved } : g));
  };

  const handleApplyGig = (id: string) => {
    setGigs(gigs.map(g => g.id === id ? { ...g, applied: true } : g));
  };

  const handleHireSeeker = (id: string) => {
    setSeekers(seekers.map(s => s.id === id ? { ...s, hired: true } : s));
  };

  const finishWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('timegig_welcome_shown', 'true');
    setTimeout(() => {
      setShowTenantPopup(true);
    }, 400);
  };

  const acceptTenant = () => {
    setShowTenantPopup(false);
    handleSelectTab('profile');
  };

  const declineTenant = () => {
    setShowTenantPopup(false);
  };

  if (showSplash || isLoadingAuth || isLoadingTenant) {
    return (
      <AnimatePresence>
        {(showSplash || isLoadingAuth || isLoadingTenant) && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center"
          >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            {appLogo ? (
              <img src={appLogo} alt={appName} className="w-24 h-24 rounded-3xl object-cover shadow-2xl mb-6 border border-slate-700" />
            ) : (
              <div className="w-24 h-24 bg-white text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 font-black text-4xl shadow-2xl">
                {appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-3xl font-bold text-white tracking-tight">{appName}</h1>
            <div className="mt-8 flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (tenantError) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{tenantError}</h1>
        <p className="text-slate-500 text-sm mb-6">We couldn't find the application you're looking for.</p>
        <button 
          onClick={() => window.location.href = 'https://timegig.com'}
          className="px-6 py-3 bg-black text-white font-bold rounded-2xl text-sm"
        >
          Return to TimeGiG
        </button>
      </div>
    );
  }

  if (currentTenant?.subscriptionStatus === 'expired' && profile.accountType !== 'MainAdmin') {
    return <TenantLockedView tenant={currentTenant} />;
  }

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white pb-16 relative">
      <TopHeader appName={appName} currentTab={currentTab} onSelectTab={handleSelectTab} onToggleSettings={handleToggleSettings} profilePhoto={profile.facePhotoUrl} />

      <main className="max-w-xl mx-auto">
        {currentTab === 'gigs' && (
          <GiGsView 
            gigs={currentTenant ? gigs.filter(g => g.tenantId === currentTenant.id) : gigs.filter(g => !g.tenantId)} 
            onToggleSave={handleToggleSave} 
            onApplyGig={handleApplyGig} 
          />
        )}
        {currentTab === 'seekers' && (
          <SeekersView
            seekers={currentTenant ? seekers.filter(s => s.tenantId === currentTenant.id) : seekers.filter(s => !s.tenantId)}
            onHireSeeker={handleHireSeeker}
            onOpenProfile={() => handleSelectTab('profile')}
            userProfilePhoto={profile.facePhotoUrl}
          />
        )}
        {currentTab === 'profile' && (
          <ProfileView profile={profile} onUpdateProfile={handleUpdateProfile} />
        )}
        {currentTab === 'settings' && (
          <SettingsView profile={profile} />
        )}
        {currentTab === 'admin' && profile.accountType === 'MainAdmin' && (
          <MainAdminDashboard />
        )}
        {currentTab === 'tenant-admin' && (profile.accountType === 'TenantOwner' || profile.accountType === 'MainAdmin') && currentTenant && (
          <TenantOwnerDashboard tenant={currentTenant} profile={profile} />
        )}
      </main>

      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        profilePhoto={profile.facePhotoUrl}
        isTenantApproved={profile.isTenantApproved}
        accountType={profile.accountType}
      />

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-lg">TG</div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome to TimeGiG</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Your platform for discovering live gigs and hiring professional local talent instantly.</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 p-2 rounded-xl text-red-600 shrink-0"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">GiGs Feature</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">Explore a real-time interactive map showing gigs and job opportunities around you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-600 shrink-0"><Users className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Seekers Feature</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">Browse verified professionals, review their portfolios, and hire them instantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 shrink-0"><UserCircle className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Profile & Identity</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">Manage your credentials, upload verification documents, and showcase your links.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={finishWelcome}
                className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        )}

        {showTenantPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-6 text-center">
                <Star className="w-12 h-12 text-yellow-300 mx-auto drop-shadow-md mb-3" fill="currentColor" />
                <h2 className="text-xl font-bold text-white leading-tight">Become a Tenant</h2>
                <p className="text-indigo-100 text-xs mt-2 leading-relaxed">
                  Earn a passive income monthly by participating in our exclusive Tenant program.
                </p>
              </div>
              <div className="p-5 flex flex-col gap-3 bg-white">
                <button
                  onClick={acceptTenant}
                  className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  Yes, Sign Me Up!
                </button>
                <button
                  onClick={declineTenant}
                  className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-sm transition-all border border-slate-200"
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
