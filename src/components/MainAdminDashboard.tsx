import React, { useState, useEffect } from 'react';
import { Tenant, UserProfile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { Plus, Users, Globe, CreditCard, Check, AlertCircle, Search, Link as LinkIcon, Copy } from 'lucide-react';
import { motion } from 'motion/react';

import { PLATFORM_CONFIG } from '../config';

export const MainAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTenant, setNewTenant] = useState({
    name: '',
    ownerEmail: '',
    slug: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'tenants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenantData: Tenant[] = [];
      snapshot.forEach((doc) => {
        tenantData.push({ id: doc.id, ...doc.data() } as Tenant);
      });
      setTenants(tenantData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tenants');
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);

    const reservedSlugs = PLATFORM_CONFIG.reservedSubdomains;

    try {
      // 1. Sanitize slug (lowercase, no spaces, numbers/hyphens only)
      let slug = newTenant.slug.toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // spaces to hyphens
        .replace(/[^a-z0-9-]/g, '') // remove unsupported characters
        .replace(/-+/g, '-'); // collapse multiple hyphens

      if (slug.length < 3) throw new Error('Slug must be at least 3 characters');
      if (reservedSlugs.includes(slug)) throw new Error('This subdomain is reserved and cannot be used');
      
      const existing = tenants.find(t => t.slug === slug);
      if (existing) throw new Error('Subdomain already taken. Please choose another name.');

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialStartDate.getDate() + PLATFORM_CONFIG.trialDays);

      const subdomain = `${slug}.${PLATFORM_CONFIG.mainDomain}`;

      // 2. Create tenant document
      await addDoc(collection(db, 'tenants'), {
        name: newTenant.name,
        slug: slug,
        subdomain: subdomain,
        ownerEmail: newTenant.ownerEmail,
        status: 'active',
        subscriptionStatus: 'trial',
        trialStartDate,
        trialEndDate,
        subscriptionPrice: PLATFORM_CONFIG.subscriptionPrice,
        currency: PLATFORM_CONFIG.currency,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      setNewTenant({ name: '', ownerEmail: '', slug: '' });
      setShowCreateModal(false);
      alert('Tenant created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create tenant');
    } finally {
      setIsCreating(false);
    }
  };

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.subscriptionStatus === 'trial').length,
    expired: tenants.filter(t => t.subscriptionStatus === 'expired').length
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main Admin</h1>
          <p className="text-sm text-slate-500">Platform Management</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> New Tenant
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-600', icon: Globe },
          { label: 'Active', value: stats.active, color: 'bg-emerald-50 text-emerald-600', icon: Check },
          { label: 'Trial', value: stats.trial, color: 'bg-amber-50 text-amber-600', icon: CreditCard },
          { label: 'Expired', value: stats.expired, color: 'bg-rose-50 text-rose-600', icon: AlertCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-3">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  {tenant.logoUrl ? (
                    <img src={tenant.logoUrl} alt="" className="w-8 h-8 object-contain" />
                  ) : (
                    <Globe className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{tenant.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tenant.slug}.{PLATFORM_CONFIG.mainDomain}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tenant.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                      tenant.subscriptionStatus === 'trial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tenant.subscriptionStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const isPreviewEnvironment = window.location.hostname.includes('run.app');
                    const url = isPreviewEnvironment 
                      ? `${window.location.origin}?tenant=${tenant.slug}`
                      : `https://${tenant.slug}.${PLATFORM_CONFIG.mainDomain}`;
                    navigator.clipboard.writeText(url);
                    alert('Link copied!');
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Copy Tenant Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <div className="text-right ml-4">
                  <div className="text-xs font-bold text-slate-900">R{tenant.subscriptionPrice}</div>
                  <div className="text-[10px] text-slate-400">Monthly</div>
                </div>
              </div>
            </div>
          ))}

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No tenants found</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Tenant</h2>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Tenant Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Mike Jobs"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Owner Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="owner@example.com"
                  value={newTenant.ownerEmail}
                  onChange={(e) => setNewTenant({...newTenant, ownerEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Subdomain Slug</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    placeholder="john"
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="w-full pr-24 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">.{PLATFORM_CONFIG.mainDomain}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Example: john.{PLATFORM_CONFIG.mainDomain}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
