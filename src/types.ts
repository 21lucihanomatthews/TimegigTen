export interface Gig {
  id: string;
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

export type NavTab = 'gigs' | 'seekers' | 'profile' | 'settings';

export interface UserProfile {
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
  accountType?: 'User' | 'Tenant';
  isTenantApproved?: boolean;
}

export interface Seeker {
  id: string;
  name: string;
  trade: string;
  rate: string;
  location: string;
  bio: string;
  avatar: string;
  skills: string[];
  hired: boolean;
}
