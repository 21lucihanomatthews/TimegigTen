import React, { useState } from 'react';
import { Search, MapPin, DollarSign, CheckCircle2, UserPlus, Sparkles, X, User } from 'lucide-react';
import { Seeker } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SeekersViewProps {
  seekers: Seeker[];
  onHireSeeker: (id: string) => void;
  onOpenProfile: () => void;
  userProfilePhoto?: string;
}

export const SeekersView: React.FC<SeekersViewProps> = ({ seekers, onHireSeeker, onOpenProfile, userProfilePhoto }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null);
  const [hireSuccessId, setHireSuccessId] = useState<string | null>(null);

  const filteredSeekers = seekers.filter(seeker =>
    seeker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seeker.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seeker.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seeker.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleHire = (id: string) => {
    onHireSeeker(id);
    setHireSuccessId(id);
    setTimeout(() => setHireSuccessId(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-slate-100 text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto overflow-y-auto">
      {/* Sticky Header & Search Bar (always visible) */}
      <div className="sticky top-0 z-30 bg-slate-100/95 backdrop-blur-md pt-3 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold mb-0.5">
              <Sparkles className="w-3 h-3 text-red-600" /> Talent Pool
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Available Seekers
            </h1>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-slate-700 shadow-xs">
            {filteredSeekers.length} Ready
          </span>
        </div>

        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seekers by trade, skill, or location..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Seekers List View in Compact Bubbles */}
      <div className="space-y-2.5 mt-1">
        {filteredSeekers.map((seeker, index) => {
          const displayPhoto = (index === 0 && userProfilePhoto) ? userProfilePhoto : null;

          return (
            <motion.div
              key={seeker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Profile Picture Logo Bubble - Clicking directs to profile feature */}
                <button
                  onClick={onOpenProfile}
                  className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-black to-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden shadow-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  title="Click to view profile"
                >
                  {displayPhoto ? (
                    <img src={displayPhoto} alt={seeker.name} className="w-full h-full object-cover" />
                  ) : (
                    seeker.avatar
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></span>
                </button>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-900">{seeker.name}</h3>
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.2 rounded-md border border-red-100">
                      {seeker.trade}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-600" /> {seeker.location}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{seeker.bio}</p>

                  {/* Skills tags */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {seeker.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Rate</span>
                  <span className="text-xs font-bold text-emerald-600">{seeker.rate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedSeeker(seeker)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleHire(seeker.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shadow-xs flex items-center gap-1 ${
                      seeker.hired
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {seeker.hired ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Hired
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" /> Hire
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredSeekers.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
            <p className="text-xs font-medium text-slate-500">No seekers found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Seeker Detail Modal */}
      <AnimatePresence>
        {selectedSeeker && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-xl p-5 relative text-slate-900"
            >
              <button
                onClick={() => setSelectedSeeker(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <button
                  onClick={() => {
                    setSelectedSeeker(null);
                    onOpenProfile();
                  }}
                  className="w-12 h-12 rounded-xl bg-black text-white font-bold flex items-center justify-center overflow-hidden text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                  title="View Profile"
                >
                  {userProfilePhoto ? (
                    <img src={userProfilePhoto} alt={selectedSeeker.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedSeeker.avatar
                  )}
                </button>
                <div>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {selectedSeeker.trade}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">{selectedSeeker.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rate</span>
                  <span className="font-semibold text-emerald-600 text-sm block">{selectedSeeker.rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-800 text-xs block">{selectedSeeker.location}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Biography</span>
                  <p className="text-slate-600 leading-relaxed text-xs">{selectedSeeker.bio}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Verified Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeeker.skills.map((skill, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-medium text-[10px] border border-red-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    handleHire(selectedSeeker.id);
                    setSelectedSeeker(null);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    selectedSeeker.hired ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {selectedSeeker.hired ? 'Hired Successfully' : `Hire ${selectedSeeker.name} (${selectedSeeker.rate})`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {hireSuccessId && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg font-medium text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Seeker hired successfully!
        </div>
      )}
    </div>
  );
};
