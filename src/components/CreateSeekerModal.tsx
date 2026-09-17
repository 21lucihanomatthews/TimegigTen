import React, { useState } from 'react';
import { 
  X, UserPlus, User, Award, DollarSign, MapPin, 
  FileText, Sparkles, Plus, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Seeker, UserProfile } from '../types';
import { LocationPinpointPicker } from './LocationPinpointPicker';

interface CreateSeekerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (seeker: Seeker) => Promise<void> | void;
  userProfile?: UserProfile;
  tenantId?: string;
}

const COMMON_TRADES = [
  'Live Sound & FOH Engineer',
  'Lighting & Stage Technician',
  'Lead Vocalist & Performer',
  'Session Guitarist & Bassist',
  'DJ & Electronic Producer',
  'Full-Stack Software Engineer',
  'UI/UX & Brand Designer',
  'Event Videographer & Editor',
  'Stage Manager & Production Lead'
];

const SA_LOCATIONS = [
  'Johannesburg, Gauteng',
  'Cape Town, Western Cape',
  'Durban, KwaZulu-Natal',
  'Pretoria, Gauteng',
  'Sandton, Johannesburg',
  'Centurion, Gauteng',
  'Gqeberha, Eastern Cape'
];

export const CreateSeekerModal: React.FC<CreateSeekerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userProfile,
  tenantId
}) => {
  const initialName = userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.surname || ''}`.trim() 
    : '';

  const [name, setName] = useState(initialName);
  const [trade, setTrade] = useState('');
  const [rate, setRate] = useState('R500 / hr');
  const [location, setLocation] = useState(
    userProfile?.city && userProfile?.province 
      ? `${userProfile.city}, ${userProfile.province}` 
      : 'Johannesburg, Gauteng'
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -26.2041,
    lng: 28.0473
  });
  const [bio, setBio] = useState('');
  
  // Skill tags
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([
    'Live Mixing',
    'Stage Management',
    'Acoustic Tuning'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedTrade = trade.trim();
    const trimmedRate = rate.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name or stage name.');
      return;
    }

    if (!trimmedTrade) {
      setErrorMessage('Please specify your professional trade or primary talent.');
      return;
    }

    if (!trimmedRate) {
      setErrorMessage('Please specify your hourly or daily rate.');
      return;
    }

    if (!trimmedLocation) {
      setErrorMessage('Please specify your base location.');
      return;
    }

    // Generate avatar initials
    const words = trimmedName.split(' ').filter(Boolean);
    let avatar = 'SK';
    if (words.length >= 2) {
      avatar = `${words[0][0]}${words[1][0]}`.toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      avatar = words[0].substring(0, 2).toUpperCase();
    }

    const newSeeker: Seeker = {
      id: `seek-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...(tenantId ? { tenantId } : {}),
      name: trimmedName,
      trade: trimmedTrade,
      rate: trimmedRate.startsWith('R') ? trimmedRate : `R${trimmedRate}`,
      location: trimmedLocation,
      bio: bio.trim() || `Dedicated ${trimmedTrade} available for live events, production contracts, and gigs across ${trimmedLocation}.`,
      avatar,
      skills: skills.length > 0 ? skills : ['Professional Experience', 'Punctual & Dedicated'],
      hired: false,
      uid: userProfile?.uid,
      lat: coords.lat,
      lng: coords.lng
    };

    try {
      setIsSubmitting(true);
      await onSubmit(newSeeker);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create seeker profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="create-seeker-modal-backdrop"
      className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="create-seeker-modal-card"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 shrink-0">
              <UserPlus className="w-5 h-5 stroke-[2.2] text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Create Seeker Profile</h2>
              <p className="text-[11px] text-slate-500">List yourself or a pro in the available talent directory</p>
            </div>
          </div>
          <button
            id="close-create-seeker-modal-btn"
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

          {/* Seeker Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name / Stage Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="seeker-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thabo Ndlovu"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
              />
            </div>
          </div>

          {/* Professional Trade & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Professional Trade / Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="seeker-trade-input"
                  type="text"
                  required
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  placeholder="e.g. FOH Sound Engineer"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Rate (Hourly / Daily) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="seeker-rate-input"
                  type="text"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. R550 / hr or R3,500 / gig"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Quick Trade Suggestions */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Quick Trade Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TRADES.slice(0, 5).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrade(t)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {t}
                </button>
              ))}
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
              themeColor="dark"
              label="Pinpoint Base Location"
              placeholder="e.g. 73 Juta St, Braamfontein, Johannesburg"
              helperText="Click or tap anywhere on the map or drag the pin to set your exact base location."
            />
          </div>

          {/* Bio / Background */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Professional Bio & Experience
            </label>
            <textarea
              id="seeker-bio-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell gig posters about your years of experience, gear, past events, and strengths..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-normal resize-none"
            />
          </div>

          {/* Skills & Tools */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Skills, Gear & Certifications
            </label>
            <div className="flex gap-2">
              <input
                id="seeker-skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. DiGiCo, Dante, Adobe Premiere, Pro Tools..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-xs"
              />
              <button
                id="add-seeker-skill-btn"
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Rendered Skill Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-[11px] font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              id="cancel-create-seeker-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-create-seeker-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-black/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Listing Seeker...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>List in Talent Directory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
