import React, { useState } from 'react';
import { 
  X, Briefcase, MapPin, DollarSign, Calendar, Tag, AlertCircle, 
  CheckCircle2, Sparkles, Building2, Flame, Plus, Trash2
} from 'lucide-react';
import { Gig, UserProfile } from '../types';
import { LocationPinpointPicker } from './LocationPinpointPicker';

interface CreateGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gig: Gig) => Promise<void> | void;
  userProfile?: UserProfile;
  tenantId?: string;
  defaultLocation?: string;
}

const CATEGORIES: Gig['category'][] = [
  'Live Music',
  'Tech & Dev',
  'Design',
  'Production',
  'Events'
];

const SA_CITIES = [
  { name: 'Johannesburg, Gauteng', coords: [-26.2041, 28.0473] as [number, number] },
  { name: 'Braamfontein, Johannesburg', coords: [-26.1929, 28.0341] as [number, number] },
  { name: 'Sandton, Johannesburg', coords: [-26.1076, 28.0567] as [number, number] },
  { name: 'Rosebank, Johannesburg', coords: [-26.1467, 28.0436] as [number, number] },
  { name: 'Pretoria, Gauteng', coords: [-25.7479, 28.2293] as [number, number] },
  { name: 'Cape Town, Western Cape', coords: [-33.9249, 18.4241] as [number, number] },
  { name: 'Waterfront, Cape Town', coords: [-33.9036, 18.4207] as [number, number] },
  { name: 'Durban, KwaZulu-Natal', coords: [-29.8587, 31.0218] as [number, number] },
  { name: 'Umhlanga, Durban', coords: [-29.7289, 31.0777] as [number, number] },
  { name: 'Gqeberha, Eastern Cape', coords: [-33.9608, 25.6022] as [number, number] }
];

export const CreateGigModal: React.FC<CreateGigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userProfile,
  tenantId,
  defaultLocation
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(
    userProfile?.firstName ? `${userProfile.firstName}'s Production` : 'TimeGiG Productions'
  );
  const [category, setCategory] = useState<Gig['category']>('Live Music');
  const [location, setLocation] = useState(defaultLocation || 'Braamfontein, Johannesburg');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -26.1929,
    lng: 28.0341
  });
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('Immediate / Flexible');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);
  
  // Requirements / skills list
  const [requirementInput, setRequirementInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Professional attitude & punctuality',
    'Own equipment / tools'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    const trimmed = requirementInput.trim();
    if (!trimmed) return;
    if (requirements.includes(trimmed)) {
      setRequirementInput('');
      return;
    }
    setRequirements([...requirements, trimmed]);
    setRequirementInput('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedCompany = company.trim();
    const trimmedLocation = location.trim();
    const trimmedBudget = budget.trim();

    if (!trimmedTitle) {
      setErrorMessage('Please provide a gig title.');
      return;
    }

    if (!trimmedCompany) {
      setErrorMessage('Please specify the company, venue, or host name.');
      return;
    }

    if (!trimmedLocation) {
      setErrorMessage('Please enter the gig location.');
      return;
    }

    if (!trimmedBudget) {
      setErrorMessage('Please specify the budget or pay rate (e.g. R3,500 / night or R500 / hr).');
      return;
    }

    // Generate avatar initials
    const words = trimmedCompany.split(' ').filter(Boolean);
    let avatar = 'TG';
    if (words.length >= 2) {
      avatar = `${words[0][0]}${words[1][0]}`.toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      avatar = words[0].substring(0, 2).toUpperCase();
    }

    const newGig: Gig = {
      id: `gig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...(tenantId ? { tenantId } : {}),
      title: trimmedTitle,
      company: trimmedCompany,
      location: trimmedLocation,
      budget: trimmedBudget.startsWith('R') ? trimmedBudget : `R${trimmedBudget}`,
      category,
      date: date.trim() || 'Flexible timeline',
      description: description.trim() || `Gig opportunity for ${category} in ${trimmedLocation}.`,
      requirements: requirements.length > 0 ? requirements : ['Professional experience', 'Punctual & reliable'],
      applied: false,
      saved: false,
      urgent,
      lat: coords.lat,
      lng: coords.lng,
      avatar,
      createdBy: userProfile?.uid
    };

    try {
      setIsSubmitting(true);
      await onSubmit(newGig);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to post gig. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="create-gig-modal-backdrop"
      className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="create-gig-modal-card"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Create New Gig</h2>
              <p className="text-[11px] text-slate-500">Post an opportunity to the live interactive map</p>
            </div>
          </div>
          <button
            id="close-create-gig-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Gig Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Gig Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="gig-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Sound Engineer for Weekend Festival"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Company / Venue / Host & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Venue / Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="gig-company-input"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. The Orbit Jazz Club"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="gig-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Gig['category'])}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Budget / Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="gig-budget-input"
                  type="text"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. R4,500 / gig or R650 / hr"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Date & Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="gig-date-input"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Fri, Nov 14 • 7:00 PM"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Pinpoint Location Interactive Map */}
          <div className="pt-1">
            <LocationPinpointPicker
              lat={coords.lat}
              lng={coords.lng}
              onChange={({ lat, lng, locationName }) => {
                setCoords({ lat, lng });
                if (locationName) {
                  setLocation(locationName);
                }
              }}
              locationText={location}
              onLocationTextChange={setLocation}
              themeColor="red"
              label="Pinpoint Exact Gig Venue / Location"
              placeholder="e.g. 73 Juta St, Braamfontein, Johannesburg"
              helperText="Click or tap anywhere on the map or drag the pin to set the exact meeting or venue spot."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Gig Description
            </label>
            <textarea
              id="gig-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, responsibilities, and schedule..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-normal resize-none"
            />
          </div>

          {/* Requirements / Needed Skills */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Key Requirements
            </label>
            <div className="flex gap-2">
              <input
                id="gig-requirement-input"
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="e.g. Own DJ Gear, 3+ yrs experience..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-xs"
              />
              <button
                id="add-requirement-btn"
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Rendered Requirement Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] font-medium"
                >
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="hover:text-red-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Urgent Priority Checkbox */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${urgent ? 'text-red-600 fill-red-600 animate-pulse' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-slate-800 text-xs">Mark as Urgent Gig</span>
                <p className="text-[10px] text-slate-500">Adds an animated radar beacon on the live map</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="gig-urgent-toggle"
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              id="cancel-create-gig-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-create-gig-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing Gig...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Gig to Map</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
