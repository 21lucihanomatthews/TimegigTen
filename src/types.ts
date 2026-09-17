export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  ownerUid: string;
  status: 'active' | 'expired' | 'suspended';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  trialStartDate: any; // Firestore Timestamp
  trialEndDate: any; // Firestore Timestamp
  subscriptionStartDate?: any;
  subscriptionEndDate?: any;
  subscriptionPrice: number;
  currency: string;
  createdAt: any;
  updatedAt: any;
}

export interface Gig {
  id: string;
  tenantId?: string; // Optional for global gigs, mandatory for tenant-specific ones
  title: string;
  company: string;
  location: string;
  budget: string;
  category: 'Live Music' | 'Tech & Dev' | 'Design' | 'Production' | 'Events';
  date: string;
  description: string;
  requirements: string[];
  applied: boolean;
  saved: boolean;
  urgent?: boolean;
  lat: number;
  lng: number;
  avatar: string;
}

export type NavTab = 'gigs' | 'seekers' | 'profile' | 'settings' | 'admin' | 'tenant-admin';

export interface UserProfile {
  uid?: string;
  tenantId?: string; // The tenant this user belongs to
  firstName: string;
  middleName?: string;
  surname: string;
  dob: string;
  address: string;
  city: string;
  province: string;
  contactNumber: string;
  socialLinks: { platform: string; url: string }[];
  facePhotoUrl?: string;
  idDocumentName?: string;
  accountType?: 'User' | 'TenantOwner' | 'MainAdmin';
  isTenantApproved?: boolean;
}

export interface Seeker {
  id: string;
  tenantId?: string;
  name: string;
  trade: string;
  rate: string;
  location: string;
  bio: string;
  avatar: string;
  skills: string[];
  hired: boolean;
}
