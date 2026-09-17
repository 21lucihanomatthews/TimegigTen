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
import { MapPin, Users, Settings, UserCircle, Star, AlertCircle, LogOut, Sparkles, Clock, Maximize2 } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { FullScreenLogoModal } from './components/FullScreenLogoModal';

export default function App() {
  const { currentTenant, isLoadingTenant, tenantError, isPlatformMode } = useTenant();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Use tenant branding or user branding if available
  const appName = currentTenant?.name || localStorage.getItem('tenant_app_name') || 'TimeGiG';
  const appLogo = currentTenant?.logoUrl || localStorage.getItem('tenant_app_logo');
  const primaryColor = currentTenant?.primaryColor || '#4f46e5';

  // Tenant's decision to display the logo for 5 seconds
  const tenantWantsLogo5s = currentTenant?.displayLogo5s !== undefined
    ? currentTenant.displayLogo5s
    : (localStorage.getItem('tenant_display_logo_5s') !== null
        ? localStorage.getItem('tenant_display_logo_5s') === 'true'
        : true);

  const [showSplash, setShowSplash] = useState(() => {
    const storedChoice = localStorage.getItem('tenant_display_logo_5s');
    return storedChoice !== 'false';
  });
  const [splashSecondsRemaining, setSplashSecondsRemaining] = useState(5);
  const [splashProgress, setSplashProgress] = useState(0);

  const [fullScreenLogo, setFullScreenLogo] = useState<{
    isOpen: boolean;
    logoUrl?: string | null;
    name?: string;
    subtitle?: string;
    isVerified?: boolean;
  }>({
    isOpen: false
  });

  // Dynamically sync if tenant changes decision
  useEffect(() => {
    if (currentTenant && currentTenant.displayLogo5s === false) {
      setShowSplash(false);
    }
  }, [currentTenant?.displayLogo5s]);

  useEffect(() => {
    // Inject dynamic theme color
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoadingAuth(false);
    });

    if (!tenantWantsLogo5s) {
      setShowSplash(false);
      return () => unsubscribeAuth();
    }

    const startTime = Date.now();
    const totalDurationMs = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / totalDurationMs) * 100);
      setSplashProgress(pct);
      const remaining = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      setSplashSecondsRemaining(remaining);
      if (elapsed >= totalDurationMs) {
        clearInterval(interval);
        setShowSplash(false);
      }
    }, 40);

    return () => {
      unsubscribeAuth();
      clearInterval(interval);
    };
  }, [primaryColor, tenantWantsLogo5s]);

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
        if (data.facePhotoUrl) {
          localStorage.setItem('timegig_user_photo', data.facePhotoUrl);
        }
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

  // Real-time synchronization of created gigs & seekers from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribeGigs = onSnapshot(collection(db, 'gigs'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudGigs: Gig[] = snapshot.docs.map(d => ({
          ...(d.data() as Gig),
          id: d.id
        }));

        setGigs(prev => {
          const cloudIds = new Set(cloudGigs.map(g => g.id));
          const localOnly = prev.filter(g => !cloudIds.has(g.id));
          return [...cloudGigs, ...localOnly];
        });
      }
    }, (err) => {
      console.warn('Gigs Firestore listener note:', err);
    });

    const unsubscribeSeekers = onSnapshot(collection(db, 'seekers'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudSeekers: Seeker[] = snapshot.docs.map(d => ({
          ...(d.data() as Seeker),
          id: d.id
        }));

        setSeekers(prev => {
          const cloudIds = new Set(cloudSeekers.map(s => s.id));
          const localOnly = prev.filter(s => !cloudIds.has(s.id));
          return [...cloudSeekers, ...localOnly];
        });
      }
    }, (err) => {
      console.warn('Seekers Firestore listener note:', err);
    });

    return () => {
      unsubscribeGigs();
      unsubscribeSeekers();
    };
  }, [isAuthenticated]);

  const handleOpenFullScreenLogo = (customUrl?: string, customName?: string, customSubtitle?: string) => {
    const targetUrl = customUrl || appLogo || profile.facePhotoUrl || localStorage.getItem('timegig_user_photo');
    const isTenantLogo = Boolean(targetUrl && (targetUrl === appLogo || targetUrl === currentTenant?.logoUrl || targetUrl === localStorage.getItem('tenant_app_logo')));
    const fullName = customName || (isTenantLogo ? appName : ([profile.firstName, profile.surname].filter(Boolean).join(' ') || appName));
    const subtitle = customSubtitle || (isTenantLogo ? 'Uploaded Tenant Logo (5s Display)' : (profile.accountType === 'TenantOwner' ? 'Tenant Owner & Venue Partner' : 'Verified Identity & Profile Logo'));
    setFullScreenLogo({
      isOpen: true,
      logoUrl: targetUrl,
      name: fullName,
      subtitle,
      isVerified: profile.isTenantApproved || isTenantLogo
    });
  };

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

  const handleCreateGig = async (newGig: Gig) => {
    // 1. Immediately update UI state and local storage
    setGigs(prev => [newGig, ...prev]);

    // 2. Persist to Firestore cloud database
    if (auth.currentUser) {
      try {
        const gigDocRef = doc(db, 'gigs', newGig.id);
        await setDoc(gigDocRef, {
          ...newGig,
          createdBy: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not save gig to Firestore cloud:', err);
      }
    }
  };

  const handleCreateSeeker = async (newSeeker: Seeker) => {
    // 1. Immediately update UI state and local storage
    setSeekers(prev => [newSeeker, ...prev]);

    // 2. Persist to Firestore cloud database
    if (auth.currentUser) {
      try {
        const seekerDocRef = doc(db, 'seekers', newSeeker.id);
        await setDoc(seekerDocRef, {
          ...newSeeker,
          uid: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not save seeker to Firestore cloud:', err);
      }
    }
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

  if (!tenantWantsLogo5s || !showSplash) {
    if (isLoadingAuth || isLoadingTenant) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Loading {appName}...</p>
        </div>
      );
    }
  } else if (showSplash || isLoadingAuth || isLoadingTenant) {
    const activeLogo = appLogo || profile.facePhotoUrl || localStorage.getItem('timegig_user_photo');

    return (
      <AnimatePresence>
        {(showSplash || isLoadingAuth || isLoadingTenant) && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setShowSplash(false)}
            className="fixed inset-0 z-[99999] bg-black w-screen h-screen select-none overflow-hidden cursor-pointer"
          >
            {activeLogo ? (
              <img 
                src={activeLogo} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <span className="text-8xl sm:text-9xl font-black text-white tracking-tight">
                  {appName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
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
      <TopHeader 
        appName={appName} 
        currentTab={currentTab} 
        onSelectTab={handleSelectTab} 
        onToggleSettings={handleToggleSettings} 
        profilePhoto={appLogo || profile.facePhotoUrl}
        onViewLogo={() => handleOpenFullScreenLogo(appLogo || profile.facePhotoUrl)} 
      />

      <main className="max-w-xl mx-auto">
        {currentTab === 'gigs' && (
          <GiGsView 
            gigs={currentTenant ? gigs.filter(g => g.tenantId === currentTenant.id) : gigs.filter(g => !g.tenantId)} 
            onToggleSave={handleToggleSave} 
            onApplyGig={handleApplyGig} 
            userProfile={profile}
            onCreateGig={handleCreateGig}
          />
        )}
        {currentTab === 'seekers' && (
          <SeekersView
            seekers={currentTenant ? seekers.filter(s => s.tenantId === currentTenant.id) : seekers.filter(s => !s.tenantId)}
            onHireSeeker={handleHireSeeker}
            onOpenProfile={() => handleSelectTab('profile')}
            userProfilePhoto={profile.facePhotoUrl}
            userProfile={profile}
            onCreateSeeker={handleCreateSeeker}
          />
        )}
        {currentTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile}
            onViewFullScreenLogo={handleOpenFullScreenLogo}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsView profile={profile} onViewFullScreenLogo={handleOpenFullScreenLogo} />
        )}
        {currentTab === 'admin' && profile.accountType === 'MainAdmin' && (
          <MainAdminDashboard />
        )}
        {currentTab === 'tenant-admin' && (profile.accountType === 'TenantOwner' || profile.accountType === 'MainAdmin') && currentTenant && (
          <TenantOwnerDashboard 
            tenant={currentTenant} 
            profile={profile} 
            onViewFullScreenLogo={handleOpenFullScreenLogo}
          />
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

      {/* Full Screen User Logo Display Modal (5 Seconds) */}
      <FullScreenLogoModal
        isOpen={fullScreenLogo.isOpen}
        onClose={() => setFullScreenLogo(prev => ({ ...prev, isOpen: false }))}
        logoUrl={fullScreenLogo.logoUrl}
        name={fullScreenLogo.name}
        subtitle={fullScreenLogo.subtitle}
        isVerified={fullScreenLogo.isVerified}
        durationSeconds={5}
      />
    </div>
  );
}
