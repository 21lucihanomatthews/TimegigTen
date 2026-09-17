import React, { useState } from 'react';
import { User, Camera, FileText, Plus, Trash2, CheckCircle2, Save, Maximize2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onViewFullScreenLogo?: (photoUrl?: string) => void;
}

const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, onViewFullScreenLogo }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newPlatform, setNewPlatform] = useState('LinkedIn');
  const [newUrl, setNewUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isLocked = profile.isTenantApproved;

  const handleAddSocial = () => {
    if (!newUrl.trim() || isLocked) return;
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: newPlatform, url: newUrl }]
    });
    setNewUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    if (isLocked) return;
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== index)
    });
  };

  const handleFacePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setFormData(prev => ({ ...prev, facePhotoUrl: photoUrl }));
        onViewFullScreenLogo?.(photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, idDocumentName: file.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const isTenantApproved = formData.accountType === 'Tenant';
    onUpdateProfile({ ...formData, isTenantApproved });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-transparent text-slate-900 pb-28 pt-4 px-3 max-w-lg mx-auto overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>Profile Settings</span>
            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${isLocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isLocked ? 'Approved & Locked' : 'Verified'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isLocked ? 'Your profile is locked because you are an approved tenant.' : 'Manage your credentials, photo, and identity documents'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Face Photo & ID Verification Upload Section */}
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Identity & Face Verification</h3>
          
          <div className="flex items-center gap-3.5">
            {/* Face Photo Preview / Upload */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => {
                  if (formData.facePhotoUrl) {
                    onViewFullScreenLogo?.(formData.facePhotoUrl);
                  }
                }}
                className={`w-16 h-16 rounded-xl bg-transparent border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-xs ${
                  formData.facePhotoUrl ? 'cursor-pointer hover:border-brand hover:scale-105 transition-all' : ''
                }`}
                title={formData.facePhotoUrl ? "Click to display logo full screen for 5 seconds" : "Face photo"}
              >
                {formData.facePhotoUrl ? (
                  <img src={formData.facePhotoUrl} alt="Face photo" className={`w-full h-full object-cover ${isLocked ? 'opacity-80' : ''}`} />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
                {formData.facePhotoUrl && (
                  <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4 drop-shadow-md" />
                  </span>
                )}
              </div>
              {profile.isTenantApproved && (
                <div className="absolute -top-1.5 -left-1.5 bg-black border-2 border-white text-white p-0.5 rounded-full z-10" title="Tenant Approved">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              {!isLocked && (
                <label className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg cursor-pointer shadow-xs transition-transform hover:scale-105 z-20" title="Upload face only picture">
                  <Camera className="w-3 h-3" />
                  <input type="file" accept="image/*" onChange={handleFacePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">Face-Only Profile Picture</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isLocked ? 'Profile picture is verified and locked.' : 'Clear front-facing face photo for venue badge and check-in.'}
              </p>
              {formData.facePhotoUrl && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewFullScreenLogo?.(formData.facePhotoUrl)}
                    className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline font-bold bg-brand/10 hover:bg-brand/20 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
                    title="Display user logo full screen for 5 seconds"
                  >
                    <Maximize2 className="w-2.5 h-2.5" /> View Full Screen (5s)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ID Document Upload */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Government ID Document (ID / Passport)</label>
            <div className="flex items-center gap-2">
              <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-medium transition-all truncate ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-transparent cursor-pointer text-slate-700'}`}>
                <FileText className={`w-3.5 h-3.5 shrink-0 ${isLocked ? 'text-slate-300' : 'text-red-600'}`} />
                <span className="truncate">{formData.idDocumentName ? formData.idDocumentName : 'Choose ID Document from device...'}</span>
                {!isLocked && <input type="file" accept=".pdf,image/*" onChange={handleIdDocUpload} className="hidden" />}
              </label>
              {formData.idDocumentName && (
                <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-0.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Personal Information</h3>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Account Type *</label>
            <select
              required
              disabled={isLocked}
              value={formData.accountType || 'User'}
              onChange={e => setFormData({ ...formData, accountType: e.target.value as 'User' | 'Tenant' })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-semibold disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="User">Regular User</option>
              <option value="Tenant">Tenant (Earn Passive Income)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">First Name *</label>
              <input
                type="text"
                required
                disabled={isLocked}
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Middle Name (Opt.)</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.middleName || ''}
                onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Surname *</label>
              <input
                type="text"
                required
                disabled={isLocked}
                value={formData.surname}
                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Date of Birth *</label>
              <input
                type="date"
                required
                disabled={isLocked}
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Contact Number *</label>
              <input
                type="tel"
                required
                disabled={isLocked}
                value={formData.contactNumber}
                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+27 82 123 4567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location & Province</h3>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Street Address *</label>
            <input
              type="text"
              required
              disabled={isLocked}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 42 Juta Street, Braamfontein"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">City / Location *</label>
              <input
                type="text"
                required
                disabled={isLocked}
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Johannesburg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Province *</label>
              <select
                disabled={isLocked}
                value={formData.province}
                onChange={e => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {PROVINCES.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Social Media Links (Dynamic Add / Remove) */}
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Social Media & Portfolio Links</h3>

          <div className="space-y-2">
            {(formData.socialLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-red-600">{link.platform}:</span>
                  <a href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-red-600 hover:underline truncate">
                    {link.url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className={`transition-colors p-1 ${isLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600'}`}
                  aria-label="Remove link"
                  disabled={isLocked}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <select
              disabled={isLocked}
              value={newPlatform}
              onChange={e => setNewPlatform(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="GitHub">GitHub</option>
              <option value="Instagram">Instagram</option>
              <option value="SoundCloud">SoundCloud</option>
              <option value="Website">Website</option>
              <option value="Twitter / X">Twitter / X</option>
            </select>
            <input
              type="url"
              disabled={isLocked}
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button
              type="button"
              disabled={isLocked}
              onClick={handleAddSocial}
              className="px-3 py-2 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        {!isLocked && (
          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save & Submit Profile
          </button>
        )}

        {submitted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-[11px] font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile successfully saved and verified!
          </div>
        )}
      </form>
    </div>
  );
};
