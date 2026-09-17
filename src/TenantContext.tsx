import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from './types';
import { db } from './firebase';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { PLATFORM_CONFIG } from './config';

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoadingTenant: boolean;
  tenantError: string | null;
  isPlatformMode: boolean; // True if browsing the root URL without a tenant
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [isPlatformMode, setIsPlatformMode] = useState(false);

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;
      const path = window.location.pathname.split('/').filter(Boolean);
      const searchParams = new URLSearchParams(window.location.search);
      
      const reservedSubdomains = PLATFORM_CONFIG.reservedSubdomains;

      let tenantSlug = null;
      
      // 1. Subdomain Detection (Primary)
      // Check if we are on a subdomain of the main domain
      if (hostname.endsWith(PLATFORM_CONFIG.mainDomain)) {
        const parts = hostname.split('.');
        // Check for <slug>.<mainDomain> or <slug>.www.<mainDomain> (though www is usually reserved)
        if (hostname !== PLATFORM_CONFIG.mainDomain && hostname !== `www.${PLATFORM_CONFIG.mainDomain}`) {
          const firstPart = parts[0].toLowerCase();
          if (!reservedSubdomains.includes(firstPart)) {
            tenantSlug = firstPart;
          }
        }
      } 
      
      // 2. Fallback for Dev/Testing (Path or Query Param)
      if (!tenantSlug) {
        // Support /t/slug (from previous implementation)
        if (path[0] === 't' && path[1]) {
          tenantSlug = path[1];
        } else {
          // Support ?tenant=id (legacy)
          const tenantIdParam = searchParams.get('tenant');
          if (tenantIdParam) {
            // If we have an ID directly, we handle it separately below
            setIsLoadingTenant(true);
            try {
              const docSnap = await getDocs(query(collection(db, 'tenants'), where('id', '==', tenantIdParam))); // Adjust if needed
              // Actually onSnapshot is better for legacy support if it was used
            } catch (e) {}
          }
        }
      }

      if (!tenantSlug && !searchParams.get('tenant')) {
        setIsPlatformMode(true);
        setIsLoadingTenant(false);
        return;
      }

      setIsLoadingTenant(true);
      setTenantError(null);

      try {
        if (tenantSlug) {
          const q = query(collection(db, 'tenants'), where('slug', '==', tenantSlug.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const tenantDoc = querySnapshot.docs[0];
            setCurrentTenant({ id: tenantDoc.id, ...tenantDoc.data() } as Tenant);
          } else {
            setTenantError('Application not found');
          }
        } else {
          const tenantIdParam = searchParams.get('tenant');
          if (tenantIdParam) {
            const unsubscribe = onSnapshot(doc(db, 'tenants', tenantIdParam), (docSnap) => {
              if (docSnap.exists()) {
                setCurrentTenant({ id: docSnap.id, ...docSnap.data() } as Tenant);
              } else {
                setTenantError('Application not found');
              }
              setIsLoadingTenant(false);
            }, (err) => {
              console.error(err);
              setTenantError('Unable to load this application');
              setIsLoadingTenant(false);
            });
            return () => unsubscribe();
          }
        }
      } catch (err) {
        console.error(err);
        setTenantError('Unable to load this application');
      } finally {
        setIsLoadingTenant(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ currentTenant, isLoadingTenant, tenantError, isPlatformMode }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
