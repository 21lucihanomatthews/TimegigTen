import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, LocateFixed, Search, Loader2, Check, Crosshair, 
  Maximize2, Minimize2, Sparkles, Navigation, Layers
} from 'lucide-react';

interface LocationPinpointPickerProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number; locationName?: string }) => void;
  locationText: string;
  onLocationTextChange: (text: string) => void;
  themeColor?: 'red' | 'dark';
  label?: string;
  placeholder?: string;
  helperText?: string;
}

// Major SA Metros & Suburbs for quick jumps
const QUICK_REGIONS = [
  { name: 'Braamfontein, JHB', coords: [-26.1929, 28.0341] as [number, number] },
  { name: 'Sandton, JHB', coords: [-26.1076, 28.0567] as [number, number] },
  { name: 'Pretoria CBD', coords: [-25.7479, 28.2293] as [number, number] },
  { name: 'Cape Town CBD', coords: [-33.9249, 18.4241] as [number, number] },
  { name: 'Durban Central', coords: [-29.8587, 31.0218] as [number, number] },
  { name: 'Umhlanga, KZN', coords: [-29.7289, 31.0777] as [number, number] },
  { name: 'Gqeberha (PE)', coords: [-33.9608, 25.6022] as [number, number] }
];

export const LocationPinpointPicker: React.FC<LocationPinpointPickerProps> = ({
  lat,
  lng,
  onChange,
  locationText,
  onLocationTextChange,
  themeColor = 'red',
  label = 'Pinpoint Exact Location',
  placeholder = 'e.g. 73 Juta St, Braamfontein, Johannesburg',
  helperText = 'Click anywhere on the map or drag the pin to set the exact meeting or venue spot.'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);

  const [currentLat, setCurrentLat] = useState<number>(lat || -26.2041);
  const [currentLng, setCurrentLng] = useState<number>(lng || 28.0473);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCoordsInputs, setShowCoordsInputs] = useState(false);
  const [reverseGeoLoading, setReverseGeoLoading] = useState(false);

  // Synchronize internal state when props change externally
  useEffect(() => {
    if (lat && lng && (lat !== currentLat || lng !== currentLng)) {
      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentLat(lat);
        setCurrentLng(lng);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        if (pulseCircleRef.current) {
          pulseCircleRef.current.setLatLng([lat, lng]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
        }
      }
    }
  }, [lat, lng]);

  // Reverse geocode coordinates to human readable address
  const reverseGeocode = useCallback(async (targetLat: number, targetLng: number) => {
    try {
      setReverseGeoLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const parts: string[] = [];
          
          // Build concise, clean address
          const road = addr.road || addr.street || addr.pedestrian;
          const houseNumber = addr.house_number;
          if (road) {
            parts.push(houseNumber ? `${houseNumber} ${road}` : road);
          }
          const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
          if (suburb && !parts.includes(suburb)) {
            parts.push(suburb);
          }
          const city = addr.city || addr.town || addr.municipality;
          if (city && !parts.includes(city)) {
            parts.push(city);
          }
          const province = addr.state || addr.province;
          if (province && !parts.includes(province)) {
            parts.push(province);
          }

          const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
          onLocationTextChange(formattedAddress);
          onChange({ lat: targetLat, lng: targetLng, locationName: formattedAddress });
          return;
        }
      }
    } catch {
      // Fallback silent
    } finally {
      setReverseGeoLoading(false);
    }
  }, [onChange, onLocationTextChange]);

  // Create custom marker icon
  const createPinIcon = useCallback(() => {
    const isRed = themeColor === 'red';
    const mainColor = isRed ? '#dc2626' : '#0f172a';
    const accentColor = isRed ? '#ef4444' : '#334155';

    const html = `
      <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing select-none" style="transform: translate3d(0, 0, 0);">
        <!-- Floating badge label -->
        <div class="mb-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/20 whitespace-nowrap flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full ${isRed ? 'bg-red-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}"></span>
          <span>Target Pin</span>
        </div>

        <!-- Pin Head SVG -->
        <div class="relative flex items-center justify-center transition-transform group-hover:scale-110">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${mainColor}"/>
            <circle cx="17" cy="16" r="9" fill="white"/>
            <circle cx="17" cy="16" r="5" fill="${accentColor}"/>
          </svg>
        </div>

        <!-- Target shadow dot on the ground -->
        <div class="w-3 h-1.5 bg-black/40 rounded-full blur-[1px] -mt-0.5"></div>
      </div>
    `;

    return L.divIcon({
      className: 'exact-pinpoint-marker',
      html,
      iconSize: [40, 58],
      iconAnchor: [20, 56], // Anchored right at the bottom tip
      popupAnchor: [0, -56]
    });
  }, [themeColor]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = currentLat || -26.2041;
    const initialLng = currentLng || 28.0473;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Add High-Quality Clean Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Accuracy Pulse Circle at pinpoint ground
    const circle = L.circle([initialLat, initialLng], {
      radius: 25,
      color: themeColor === 'red' ? '#ef4444' : '#0ea5e9',
      weight: 1.5,
      fillColor: themeColor === 'red' ? '#f87171' : '#38bdf8',
      fillOpacity: 0.15
    }).addTo(map);
    pulseCircleRef.current = circle;

    // Create Draggable Pinpoint Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true,
      zIndexOffset: 1000
    }).addTo(map);
    markerRef.current = marker;

    // Marker Dragging Events
    marker.on('drag', () => {
      const pos = marker.getLatLng();
      setCurrentLat(pos.lat);
      setCurrentLng(pos.lng);
      circle.setLatLng(pos);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCurrentLat(pos.lat);
      setCurrentLng(pos.lng);
      circle.setLatLng(pos);
      onChange({ lat: pos.lat, lng: pos.lng });
      reverseGeocode(pos.lat, pos.lng);
    });

    // Map Click Event: Click anywhere to jump pin to that exact spot
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setCurrentLat(clickLat);
      setCurrentLng(clickLng);
      marker.setLatLng([clickLat, clickLng]);
      circle.setLatLng([clickLat, clickLng]);
      map.panTo([clickLat, clickLng], { animate: true, duration: 0.3 });
      onChange({ lat: clickLat, lng: clickLng });
      reverseGeocode(clickLat, clickLng);
    });

    // Invalidate map size after animation/DOM layout
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map layout when expanded toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.panTo([currentLat, currentLng]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded, currentLat, currentLng]);

  // Handle GPS Locate Me
  const handleGpsPinpoint = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported on this device');
      return;
    }

    setIsLocatingGps(true);
    setGpsStatus('Pinpointing satellite GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        if (pulseCircleRef.current) {
          pulseCircleRef.current.setLatLng([latitude, longitude]);
          pulseCircleRef.current.setRadius(Math.max(20, accuracy));
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
        }

        setIsLocatingGps(false);
        setGpsStatus(`Exact GPS locked (±${Math.round(accuracy)}m)`);
        onChange({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);

        setTimeout(() => setGpsStatus(null), 4000);
      },
      (err) => {
        setIsLocatingGps(false);
        setGpsStatus(`GPS signal not available (${err.message}). Using manual pin.`);
        setTimeout(() => setGpsStatus(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle Search for address or venue
  const handleSearchAddress = async () => {
    if (!locationText.trim()) return;
    setIsSearchingAddress(true);
    try {
      const query = encodeURIComponent(`${locationText.trim()}, South Africa`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const matchLat = parseFloat(results[0].lat);
          const matchLng = parseFloat(results[0].lon);
          
          if (!isNaN(matchLat) && !isNaN(matchLng)) {
            setCurrentLat(matchLat);
            setCurrentLng(matchLng);

            if (markerRef.current) {
              markerRef.current.setLatLng([matchLat, matchLng]);
            }
            if (pulseCircleRef.current) {
              pulseCircleRef.current.setLatLng([matchLat, matchLng]);
            }
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([matchLat, matchLng], 16, { duration: 1.2 });
            }
            onChange({ lat: matchLat, lng: matchLng });
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle Jump to Quick Region
  const handleJumpToRegion = (region: typeof QUICK_REGIONS[0]) => {
    const [targetLat, targetLng] = region.coords;
    setCurrentLat(targetLat);
    setCurrentLng(targetLng);
    onLocationTextChange(region.name);

    if (markerRef.current) {
      markerRef.current.setLatLng([targetLat, targetLng]);
    }
    if (pulseCircleRef.current) {
      pulseCircleRef.current.setLatLng([targetLat, targetLng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 15, { duration: 1 });
    }
    onChange({ lat: targetLat, lng: targetLng, locationName: region.name });
  };

  const isRed = themeColor === 'red';

  return (
    <div className="space-y-2 text-slate-800">
      {/* Label and GPS Quick Button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className={`w-3.5 h-3.5 ${isRed ? 'text-red-600' : 'text-slate-900'}`} />
          <span>{label}</span>
          <span className="text-red-500">*</span>
        </label>
        
        {/* GPS Pinpoint Button */}
        <button
          type="button"
          onClick={handleGpsPinpoint}
          disabled={isLocatingGps}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isLocatingGps 
              ? 'bg-slate-100 text-slate-400' 
              : isRed 
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
          }`}
          title="Detect your exact GPS coordinates right now"
        >
          {isLocatingGps ? (
            <Loader2 className="w-3 h-3 animate-spin text-red-600" />
          ) : (
            <LocateFixed className="w-3 h-3 text-red-600" />
          )}
          <span>{isLocatingGps ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {/* Address / Location Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={locationText}
          onChange={(e) => onLocationTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchAddress();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-8 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all shadow-xs"
        />
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {reverseGeoLoading && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            </span>
          )}
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={isSearchingAddress || !locationText.trim()}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Locate address on map"
          >
            {isSearchingAddress ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
            <span>Locate</span>
          </button>
        </div>
      </div>

      {/* GPS Status Message Toast */}
      {gpsStatus && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {/* Interactive Pinpoint Map Card */}
      <div className={`border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-inner relative transition-all duration-300 ${
        isExpanded ? 'h-72 sm:h-96' : 'h-48 sm:h-56'
      }`}>
        {/* Map Container Element */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Control Bar inside Map */}
        <div className="absolute top-2 left-2 right-2 z-[500] flex items-center justify-between pointer-events-none">
          {/* Exact Coordinates Pill */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-mono font-medium shadow-md border border-white/15 flex items-center gap-1.5">
            <Crosshair className={`w-3 h-3 ${isRed ? 'text-red-400' : 'text-emerald-400'}`} />
            <span>{currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
          </div>

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="pointer-events-auto bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-xl shadow-md transition-all cursor-pointer"
            title={isExpanded ? 'Minimize map' : 'Expand map for precise pinpointing'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bottom Banner Hint */}
        <div className="absolute bottom-2 left-2 z-[500] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Tap map or drag pin to pinpoint</span>
          </div>
        </div>
      </div>

      {/* Quick Region Snap Chips */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-slate-500">Quick region jump:</span>
          <button
            type="button"
            onClick={() => setShowCoordsInputs(!showCoordsInputs)}
            className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            {showCoordsInputs ? 'Hide coords' : 'Edit coords manually'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {QUICK_REGIONS.map((region, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleJumpToRegion(region)}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200 transition-all cursor-pointer"
            >
              {region.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Coordinates Input Fields (Optional Toggle) */}
      {showCoordsInputs && (
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Latitude</label>
            <input
              type="number"
              step="0.00001"
              value={currentLat}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setCurrentLat(val);
                  if (markerRef.current) markerRef.current.setLatLng([val, currentLng]);
                  if (pulseCircleRef.current) pulseCircleRef.current.setLatLng([val, currentLng]);
                  onChange({ lat: val, lng: currentLng });
                }
              }}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Longitude</label>
            <input
              type="number"
              step="0.00001"
              value={currentLng}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setCurrentLng(val);
                  if (markerRef.current) markerRef.current.setLatLng([currentLat, val]);
                  if (pulseCircleRef.current) pulseCircleRef.current.setLatLng([currentLat, val]);
                  onChange({ lat: currentLat, lng: val });
                }
              }}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-[10px] text-slate-500 leading-tight">
        {helperText}
      </p>
    </div>
  );
};
