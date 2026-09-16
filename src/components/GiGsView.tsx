import React, { useEffect, useRef, useState } from 'react';
import { MapPin, DollarSign, Calendar, X, CheckCircle2, Bookmark, Sparkles, Layers, Search, ZoomIn, ZoomOut, Navigation, Loader2, List } from 'lucide-react';
import { Gig } from '../types';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';

interface GiGsViewProps {
  gigs: Gig[];
  onToggleSave: (id: string) => void;
  onApplyGig: (id: string) => void;
}

type MapStyle = 'light' | 'voyager' | 'streets' | 'dark' | 'satellite';

const TILE_URLS: Record<MapStyle, { url: string; name: string; attribution: string }> = {
  light: { 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
    name: 'Clean Light',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  voyager: { 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', 
    name: 'World Street',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  },
  streets: { 
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    name: 'OpenStreetMap',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: { 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
    name: 'Dark Canvas',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    name: 'Satellite View',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Common SA location coordinates dictionary for instant search zooming
const LOCATION_COORDS: Record<string, [number, number]> = {
  johannesburg: [-26.2041, 28.0473],
  'cape town': [-33.9249, 18.4241],
  durban: [-29.8587, 31.0218],
  pretoria: [-25.7479, 28.2293],
  gauteng: [-26.2708, 28.1123],
  'western cape': [-33.2278, 22.4736],
  'kwazulu-natal': [-29.6099, 30.3874],
  soweto: [-26.2678, 27.8584],
  sandton: [-26.1076, 28.0567],
  stellenbosch: [-33.9321, 18.8602],
  umhlanga: [-29.7285, 31.0826],
  'port elizabeth': [-33.9608, 25.6022],
  gqeberha: [-33.9608, 25.6022],
  bloemfontein: [-29.0852, 26.1596],
  nelspruit: [-25.4753, 30.9693],
  mbombela: [-25.4753, 30.9693],
  polokwane: [-23.9045, 29.4688],
  kimberley: [-28.7282, 24.7499]
};

export const GiGsView: React.FC<GiGsViewProps> = ({ gigs, onToggleSave, onApplyGig }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('light');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showAllGigsModal, setShowAllGigsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [applicationState, setApplicationState] = useState<'idle' | 'waiting' | 'accepted'>('idle');

  const filteredGigs = gigs.filter(gig =>
    gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView([-30.5595, 22.9375], 6);

      const tileLayer = L.tileLayer(TILE_URLS[mapStyle].url, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: TILE_URLS[mapStyle].attribution
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);
      setTimeout(() => map.invalidateSize(), 200);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(TILE_URLS[mapStyle].url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: TILE_URLS[mapStyle].attribution
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update markers and center map directly to searched location, area, street, or province
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    filteredGigs.forEach((gig) => {
      const customHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <span class="absolute -inset-1 rounded-full bg-red-500/40 animate-ping opacity-75"></span>
          <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr from-black to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform duration-200">
            ${gig.avatar}
            ${gig.urgent ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full"></span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-profile-marker',
        html: customHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([gig.lat, gig.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedGig(gig);
        setApplicationState(gig.applied ? 'accepted' : 'idle');
      });
    });

    // If search query matches a known location/area/street/province or matching gig, fly to exact coordinates
    const query = searchQuery.trim().toLowerCase();
    let timeoutId: NodeJS.Timeout;

    if (query) {
      let foundCoords: [number, number] | null = null;
      for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
        if (query.includes(key)) {
          foundCoords = coords;
          break;
        }
      }

      if (foundCoords) {
        map.flyTo(foundCoords, 14, { duration: 1.2 });
      } else if (filteredGigs.length > 0 && filteredGigs.some(g => g.location.toLowerCase().includes(query))) {
        map.flyTo([filteredGigs[0].lat, filteredGigs[0].lng], 16, { duration: 1.2 });
      } else {
        // Fallback to OpenStreetMap Nominatim for exact locations
        timeoutId = setTimeout(async () => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
              // Zoom level 18 provides exact street/house level visibility
              map.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 18, { duration: 1.2 });
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
        }, 800);
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchQuery, filteredGigs]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleApplyWorkflow = (gig: Gig) => {
    setApplicationState('waiting');
    setTimeout(() => {
      onApplyGig(gig.id);
      setApplicationState('accepted');
    }, 2500);
  };

  const handleOpenNavigation = (location: string) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-100 relative overflow-hidden">
      {/* Search Bar & All Gigs button placed directly under the top bar */}
      <div className="sticky top-0 z-[350] bg-white/95 backdrop-blur-md px-3 py-2 border-b border-slate-200 flex items-center gap-2 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street, location, area, or province..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
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

        {/* All Gigs Full Screen Button */}
        <button
          onClick={() => setShowAllGigsModal(true)}
          className="bg-black hover:bg-slate-800 text-white px-3 py-2 rounded-xl shadow-xs text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          title="View All Available Gigs"
        >
          <List className="w-3.5 h-3.5 stroke-[2.2]" />
          <span className="hidden sm:inline">All Gigs</span>
          <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">{gigs.length}</span>
        </button>

        {/* Map Style Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-xs text-xs font-medium flex items-center gap-1.5 transition-all"
            aria-label="Change map style"
          >
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">{TILE_URLS[mapStyle].name}</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-[500]">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Map Style
              </div>
              {(Object.keys(TILE_URLS) as MapStyle[]).map((styleKey) => (
                <button
                  key={styleKey}
                  onClick={() => {
                    setMapStyle(styleKey);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    mapStyle === styleKey ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{TILE_URLS[styleKey].name}</span>
                  {mapStyle === styleKey && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real Leaflet Map Filling Remaining Screen */}
      <div ref={mapRef} className="w-full flex-1 z-10" />

      {/* Zoom Feature in the center */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-[400] flex flex-col gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-lg pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          aria-label="Zoom in"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-full h-px bg-slate-200"></div>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          aria-label="Zoom out"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full Screen All Available Gigs Modal */}
      <AnimatePresence>
        {showAllGigsModal && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6"
          >
            <div className="bg-white w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-black text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    <List className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">All Available Gigs</h2>
                    <p className="text-[11px] text-slate-500">{gigs.length} live professional opportunities</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllGigsModal(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Close All Gigs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content / Gigs List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {gigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-black to-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {gig.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {gig.category}
                          </span>
                          <span className="text-[11px] text-slate-500">{gig.company}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 mt-1">{gig.title}</h3>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-red-600" /> {gig.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Budget</span>
                        <span className="text-xs font-bold text-emerald-600">{gig.budget}</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowAllGigsModal(false);
                          setSelectedGig(gig);
                          setApplicationState(gig.applied ? 'accepted' : 'idle');
                        }}
                        className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        View & Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gig Details Modal */}
      <AnimatePresence>
        {selectedGig && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 relative text-slate-900"
            >
              <button
                onClick={() => setSelectedGig(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-11 h-11 rounded-xl bg-black text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {selectedGig.avatar}
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {selectedGig.category}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedGig.company}</p>
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900">{selectedGig.title}</h2>

              <div className="grid grid-cols-2 gap-2.5 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Compensation</span>
                  <span className="font-semibold text-emerald-600 text-xs mt-0.5 block">{selectedGig.budget}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Schedule</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedGig.date}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 block">Location</span>
                  <p className="text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" /> {selectedGig.location}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 block">Description</span>
                  <p className="text-slate-600 leading-relaxed text-xs">{selectedGig.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 block">Requirements</span>
                  <ul className="space-y-1">
                    {selectedGig.requirements.map((req, idx) => (
                      <li key={idx} className="text-slate-700 flex items-center gap-1.5 text-xs">
                        <span className="w-1 h-1 rounded-full bg-red-600"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                <button
                  onClick={() => onToggleSave(selectedGig.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    selectedGig.saved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${selectedGig.saved ? 'fill-rose-500' : ''}`} />
                  {selectedGig.saved ? 'Saved' : 'Save'}
                </button>

                {selectedGig.applied || applicationState === 'accepted' ? (
                  <button
                    onClick={() => handleOpenNavigation(selectedGig.location)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate to Destination
                  </button>
                ) : applicationState === 'waiting' ? (
                  <button
                    disabled
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white bg-black/80 cursor-wait flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Waiting...
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyWorkflow(selectedGig)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    Apply for Gig
                  </button>
                )}
              </div>

              {applicationState === 'waiting' && (
                <div className="absolute inset-0 bg-white/95 text-slate-900 rounded-2xl flex flex-col items-center justify-center gap-3 font-medium text-xs backdrop-blur-xs z-20">
                  <div className="w-16 h-16 rounded-full border-4 border-red-600 border-t-transparent animate-spin flex items-center justify-center">
                    <span className="text-[10px] font-bold text-red-600 animate-pulse">⏳</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">Waiting for gig owner response...</p>
                  <p className="text-[11px] text-slate-400">Reviewing your profile and credentials</p>
                </div>
              )}

              {applicationState === 'accepted' && selectedGig.applied && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Gig Owner Accepted! Ready to Navigate.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
