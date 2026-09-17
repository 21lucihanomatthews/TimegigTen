import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, DollarSign, Calendar, X, CheckCircle2, Bookmark, Sparkles, 
  Layers, Search, ZoomIn, ZoomOut, Navigation, Loader2, List, Orbit, 
  LocateFixed, AlertCircle, RefreshCw, PlusCircle, Plus 
} from 'lucide-react';
import { Gig, UserProfile } from '../types';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { CreateGigModal } from './CreateGigModal';

interface GiGsViewProps {
  gigs: Gig[];
  onToggleSave: (id: string) => void;
  onApplyGig: (id: string) => void;
  userProfile?: UserProfile;
  onCreateGig?: (gig: Gig) => Promise<void> | void;
  tenantId?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
  isExactGps: boolean;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
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

// Common SA location coordinates dictionary for instant search zooming and location fallback
const LOCATION_COORDS: Record<string, [number, number]> = {
  // Provinces
  gauteng: [-26.2708, 28.1123],
  'western cape': [-33.2278, 22.4736],
  'kwazulu-natal': [-29.6099, 30.3874],
  kzn: [-29.6099, 30.3874],
  'eastern cape': [-32.2968, 26.4194],
  'free state': [-28.4541, 26.7968],
  limpopo: [-23.4013, 29.4179],
  mpumalanga: [-25.5653, 30.5279],
  'north west': [-26.6639, 25.2838],
  'northern cape': [-29.0467, 21.8569],

  // Major Cities and Metro Suburbs
  johannesburg: [-26.2041, 28.0473],
  joburg: [-26.2041, 28.0473],
  sandton: [-26.1076, 28.0567],
  soweto: [-26.2678, 27.8584],
  pretoria: [-25.7479, 28.2293],
  tshwane: [-25.7479, 28.2293],
  centurion: [-25.8603, 28.1894],
  midrand: [-25.9984, 28.1263],
  rosebank: [-26.1458, 28.0435],
  randburg: [-26.0936, 27.9947],
  roodepoort: [-26.1625, 27.8725],
  'kempton park': [-26.1000, 28.2333],
  benoni: [-26.1883, 28.3206],
  boksburg: [-26.2128, 28.2575],
  germiston: [-26.2239, 28.1678],
  fourways: [-26.0157, 28.0069],
  
  'cape town': [-33.9249, 18.4241],
  stellenbosch: [-33.9321, 18.8602],
  paarl: [-33.7342, 18.9621],
  bellville: [-33.8943, 18.6294],
  'green point': [-33.9056, 18.4111],
  'sea point': [-33.9189, 18.3889],
  'camps bay': [-33.9507, 18.3776],
  'somerset west': [-34.0757, 18.8433],
  george: [-33.9630, 22.4617],
  knysna: [-34.0363, 23.0471],
  'mossel bay': [-34.1831, 22.1460],

  durban: [-29.8587, 31.0218],
  umhlanga: [-29.7285, 31.0826],
  ballito: [-29.5390, 31.2144],
  pietermaritzburg: [-29.6168, 30.3928],
  pinetown: [-29.8167, 30.8500],
  'richards bay': [-28.7807, 32.0383],

  'port elizabeth': [-33.9608, 25.6022],
  gqeberha: [-33.9608, 25.6022],
  'east london': [-33.0153, 27.8916],

  bloemfontein: [-29.0852, 26.1596],
  mangaung: [-29.0852, 26.1596],
  welkom: [-27.9774, 26.7328],

  nelspruit: [-25.4753, 30.9693],
  mbombela: [-25.4753, 30.9693],
  witbank: [-25.8728, 29.2332],
  emalahleni: [-25.8728, 29.2332],

  polokwane: [-23.9045, 29.4688],
  tzaneen: [-23.8332, 30.1635],

  rustenburg: [-25.6676, 27.2421],
  potchefstroom: [-26.7145, 27.0970],
  klerksdorp: [-26.8667, 26.6667],
  mahikeng: [-25.8594, 25.6444],

  kimberley: [-28.7282, 24.7499],
  upington: [-28.4478, 21.2561]
};

function resolveLocationFromText(text: string): { coords: [number, number]; label: string } | null {
  if (!text || !text.trim()) return null;
  const clean = text.toLowerCase().trim();
  
  if (LOCATION_COORDS[clean]) {
    const formatted = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { coords: LOCATION_COORDS[clean], label: formatted };
  }

  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (clean.includes(key)) {
      const formatted = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { coords, label: formatted };
    }
  }

  return null;
}

function getNearestLocationName(lat: number, lng: number): string {
  let closestDist = Infinity;
  let closestName = 'Gauteng';
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, coords[0], coords[1]);
    if (dist < closestDist) {
      closestDist = dist;
      closestName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  if (closestDist < 15) {
    return closestName;
  }
  return `Near ${closestName}`;
}

export const GiGsView: React.FC<GiGsViewProps> = ({ gigs, onToggleSave, onApplyGig, userProfile, onCreateGig, tenantId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gigLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('light');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showAllGigsModal, setShowAllGigsModal] = useState(false);
  const [showCreateGigModal, setShowCreateGigModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [applicationState, setApplicationState] = useState<'idle' | 'waiting' | 'accepted'>('idle');
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitRef = useRef<number>();

  // Exact User Location States
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const filteredGigs = gigs.filter(gig =>
    gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render or update the custom user pinpoint marker and accuracy halo on the map
  const renderUserMarker = useCallback((lat: number, lng: number, accuracy: number, address?: string, isExact: boolean = true) => {
    if (!mapInstanceRef.current || !userLayerGroupRef.current) return;
    if (isNaN(lat) || isNaN(lng)) return;
    const group = userLayerGroupRef.current;
    group.clearLayers();

    // High accuracy GPS accuracy perimeter
    if (isExact && accuracy) {
      const circle = L.circle([lat, lng], {
        radius: Math.max(accuracy, 12),
        color: '#2563eb',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#3b82f6',
        fillOpacity: 0.12
      }).addTo(group);
      userCircleRef.current = circle;
    }

    const photo = userProfile?.facePhotoUrl;
    const initial = (userProfile?.firstName || 'U')[0].toUpperCase();
    const userName = userProfile?.firstName ? `${userProfile.firstName} ${userProfile.surname || ''}`.trim() : 'You';

    const avatarHtml = photo
      ? `<img src="${photo}" alt="You" class="w-full h-full object-cover rounded-full" />`
      : `<div class="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center">${initial}</div>`;

    const userHtml = `
      <div class="relative flex flex-col items-center group cursor-pointer select-none">
        <!-- High-tech pulsating radar waves -->
        <span class="absolute -top-1 w-12 h-12 rounded-full bg-blue-500/35 animate-ping"></span>
        <span class="absolute -top-0.5 w-10 h-10 rounded-full bg-indigo-500/25 animate-pulse"></span>

        <!-- Center marker avatar bubble -->
        <div class="relative w-10 h-10 rounded-full bg-white shadow-2xl border-2 border-blue-600 flex items-center justify-center p-0.5 z-10 ring-4 ring-blue-500/20 hover:scale-110 transition-transform">
          ${avatarHtml}
          <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
            <span class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        </div>

        <!-- Pointer cone pointing down directly to exact coordinate -->
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 -mt-0.5 z-10 drop-shadow-sm"></div>

        <!-- Pinpoint center target dot -->
        <div class="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white -mt-0.5 z-20 shadow-md"></div>

        <!-- Label pill -->
        <div class="mt-1 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          You are here
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-pinpoint-marker',
      html: userHtml,
      iconSize: [48, 72],
      iconAnchor: [24, 46],
      popupAnchor: [0, -48]
    });

    const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(group);
    userMarkerRef.current = marker;

    const popupContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
            📍
          </div>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${userName}</div>
            <div style="font-size: 10px; color: #16a34a; font-weight: 600;">${isExact ? `Exact GPS (±${Math.round(accuracy)}m accuracy)` : 'Profile Location'}</div>
          </div>
        </div>
        ${address ? `<div style="font-size: 11px; color: #334155; background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 6px; line-height: 1.35;">${address}</div>` : ''}
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">
          Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { closeButton: true, className: 'user-location-popup' });
  }, [userProfile]);

  // Fallback to user's profile location if GPS is denied or unavailable
  const fallbackToProfileLocation = useCallback((fly: boolean = false) => {
    if (!userProfile) return;

    const city = (userProfile.city || '').trim();
    const address = (userProfile.address || '').trim();
    const province = (userProfile.province || '').trim();

    // Check city first, then address text, then province, or default to Gauteng
    const match = 
      (city && resolveLocationFromText(city)) ||
      (address && resolveLocationFromText(address)) ||
      (province && resolveLocationFromText(province)) ||
      resolveLocationFromText('gauteng');

    if (match) {
      const displayAddress = [city, province].filter(Boolean).join(', ') || `${match.label}, South Africa`;
      setUserLocation({
        lat: match.coords[0],
        lng: match.coords[1],
        accuracy: 1500,
        address: displayAddress,
        isExactGps: false
      });
      renderUserMarker(match.coords[0], match.coords[1], 1500, displayAddress, false);
      if (fly && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(match.coords, 13, { duration: 1.2 });
      }
    }
  }, [userProfile, renderUserMarker]);

  // Locate the user's exact coordinates using HTML5 Geolocation
  const locateExactUser = useCallback((fly: boolean = true) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      fallbackToProfileLocation(fly);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setIsLocating(false);

        const newLoc: UserLocation = {
          lat: latitude,
          lng: longitude,
          accuracy,
          isExactGps: true
        };
        setUserLocation(newLoc);

        renderUserMarker(latitude, longitude, accuracy, undefined, true);

        if (fly && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, {
            duration: 1.4
          });
          setTimeout(() => {
            userMarkerRef.current?.openPopup();
          }, 1500);
        }

        // Reverse geocode safely to show street/suburb name without blocking or unhandled errors
        let resolvedAddress: string | undefined;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          ).catch(() => null);
          clearTimeout(timer);

          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.display_name) {
              resolvedAddress = [
                data.address?.road || data.address?.pedestrian || data.address?.suburb,
                data.address?.city || data.address?.town || data.address?.municipality || data.address?.county
              ].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(',');
            }
          }
        } catch {
          // Network fetch blocked or offline
        }

        if (!resolvedAddress) {
          resolvedAddress = getNearestLocationName(latitude, longitude);
        }

        setUserLocation(prev => prev ? { ...prev, address: resolvedAddress } : null);
        renderUserMarker(latitude, longitude, accuracy, resolvedAddress, true);
      },
      (error) => {
        console.warn('Exact geolocation error:', error.message);
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('GPS permission was denied. Tap to retry or use profile area.');
        } else {
          setLocationError('GPS search timed out. Falling back to profile area.');
        }
        fallbackToProfileLocation(fly);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }, [renderUserMarker, fallbackToProfileLocation]);

  // Initialize Map
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

      // Layer groups to keep gig markers and user location cleanly separate
      const gigLayerGroup = L.layerGroup().addTo(map);
      const userLayerGroup = L.layerGroup().addTo(map);
      gigLayerGroupRef.current = gigLayerGroup;
      userLayerGroupRef.current = userLayerGroup;

      mapInstanceRef.current = map;

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);
      setTimeout(() => map.invalidateSize(), 200);

      // Pinpoint user's exact position on startup
      locateExactUser(true);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (watchIdRef.current !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      };
    }
  }, [locateExactUser]);

  // Live Position Tracking to update pin when user moves
  useEffect(() => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation(prev => {
            if (!prev) {
              return { lat: latitude, lng: longitude, accuracy, isExactGps: true };
            }
            const dist = calculateDistanceKm(prev.lat, prev.lng, latitude, longitude);
            if (dist > 0.005) { // Updated if moved more than 5 meters
              renderUserMarker(latitude, longitude, accuracy, prev.address, true);
              return { ...prev, lat: latitude, lng: longitude, accuracy, isExactGps: true };
            }
            return prev;
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      watchIdRef.current = id;
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [renderUserMarker]);

  // Switch Tile Layer on Map Style Change
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

  // Update gig markers (isolated in gigLayerGroup so user pin is never removed)
  useEffect(() => {
    if (!mapInstanceRef.current || !gigLayerGroupRef.current) return;
    const map = mapInstanceRef.current;
    const gigLayer = gigLayerGroupRef.current;

    gigLayer.clearLayers();

    filteredGigs.forEach((gig) => {
      const lat = Number(gig.lat);
      const lng = Number(gig.lng);

      if (isNaN(lat) || isNaN(lng)) return;

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

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(gigLayer);

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
      } else {
        const matchingGig = filteredGigs.find(g => g.location.toLowerCase().includes(query) && !isNaN(Number(g.lat)) && !isNaN(Number(g.lng)));
        if (matchingGig) {
          map.flyTo([Number(matchingGig.lat), Number(matchingGig.lng)], 16, { duration: 1.2 });
        } else {
          // Fallback to OpenStreetMap Nominatim for exact locations if network is available
          timeoutId = setTimeout(async () => {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2500);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
              { signal: controller.signal }
            ).catch(() => null);
            clearTimeout(timer);

            if (res && res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.length > 0) {
                map.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 16, { duration: 1.2 });
              }
            }
          } catch {
            // Silently fallback without logging unhandled errors
          }
        }, 800);
        }
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchQuery, filteredGigs]);

  useEffect(() => {
    if (!isOrbiting || !mapInstanceRef.current) {
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
      return;
    }
    const map = mapInstanceRef.current;
    let angle = 0;
    const speed = 0.8; // pixels per frame

    const orbitStep = () => {
      angle += 0.01;
      const x = Math.cos(angle) * speed;
      const y = Math.sin(angle) * speed;
      map.panBy([x, y], { animate: false });
      orbitRef.current = requestAnimationFrame(orbitStep);
    };
    
    orbitRef.current = requestAnimationFrame(orbitStep);
    
    return () => {
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
    };
  }, [isOrbiting]);

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

  const handleOpenNavigation = (gig: Gig) => {
    let mapsUrl = '';
    const hasValidGigCoords = gig.lat !== undefined && gig.lng !== undefined && !isNaN(Number(gig.lat)) && !isNaN(Number(gig.lng));
    if (userLocation && hasValidGigCoords) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${gig.lat},${gig.lng}`;
    } else {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gig.location)}`;
    }
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-transparent relative overflow-hidden">
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

        {/* Create Gig Feature Button Icon */}
        <button
          id="open-create-gig-modal-btn"
          onClick={() => setShowCreateGigModal(true)}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-2 rounded-xl shadow-xs text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          title="Create & Post New Gig"
          aria-label="Create Gig"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Create Gig</span>
        </button>

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
            className="bg-slate-50 hover:bg-transparent text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-xs text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
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

      {/* Floating Exact Location Pill Banner */}
      {userLocation && (
        <div className="absolute top-14 left-3 right-3 sm:left-auto sm:right-4 z-[320] pointer-events-auto max-w-sm">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-200 shadow-md flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="truncate text-[11px]">
                {userLocation.address || 'Exact GPS Pinpointed'}
              </span>
              <span className="text-[10px] text-blue-500 font-normal shrink-0">
                (±{Math.round(userLocation.accuracy)}m)
              </span>
            </div>
            <button
              onClick={() => {
                if (mapInstanceRef.current && userLocation) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });
                  userMarkerRef.current?.openPopup();
                }
              }}
              className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Center
            </button>
          </div>
        </div>
      )}

      {isLocating && !userLocation && (
        <div className="absolute top-14 left-3 right-3 sm:left-auto sm:right-4 z-[320] pointer-events-auto max-w-xs">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-200 shadow-md flex items-center gap-2 text-xs text-blue-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
            <span className="text-[11px] font-medium">Pinpointing your exact GPS location...</span>
          </div>
        </div>
      )}

      {locationError && !userLocation && (
        <div className="absolute top-14 left-3 right-3 sm:left-auto sm:right-4 z-[320] pointer-events-auto max-w-xs">
          <button
            onClick={() => locateExactUser(true)}
            className="bg-amber-50/95 hover:bg-amber-100 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-md flex items-center gap-1.5 text-xs text-amber-900 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] font-medium truncate">Allow GPS for exact location</span>
            <RefreshCw className="w-3 h-3 text-amber-600 shrink-0 ml-0.5" />
          </button>
        </div>
      )}

      {/* Real Leaflet Map Filling Remaining Screen */}
      <div ref={mapRef} className="w-full flex-1 z-10" />

      {/* Exact Locate, Zoom & Orbit Features in the center right */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-[400] flex flex-col gap-2 pointer-events-auto">
        {/* Exact GPS Pinpoint Button */}
        <button
          onClick={() => locateExactUser(true)}
          disabled={isLocating}
          className={`p-2.5 rounded-xl border shadow-lg transition-all flex items-center justify-center cursor-pointer group relative ${
            isLocating 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : userLocation?.isExactGps
              ? 'bg-white/95 backdrop-blur-md border-blue-400 text-blue-600 hover:bg-blue-50 ring-2 ring-blue-500/20'
              : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="Pinpoint Exact Location"
          title={userLocation?.isExactGps ? `Center on exact GPS position (±${Math.round(userLocation.accuracy)}m)` : 'Pinpoint your exact location'}
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <LocateFixed className={`w-5 h-5 ${userLocation?.isExactGps ? 'text-blue-600' : 'text-slate-700'}`} />
          )}
          {userLocation?.isExactGps && !isLocating && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
          )}
        </button>

        <div className="flex flex-col bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-transparent text-slate-700 transition-colors cursor-pointer"
            aria-label="Zoom in"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200"></div>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-transparent text-slate-700 transition-colors cursor-pointer"
            aria-label="Zoom out"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsOrbiting(!isOrbiting)}
          className={`p-2 rounded-xl border shadow-lg transition-all flex items-center justify-center cursor-pointer ${
            isOrbiting 
              ? 'bg-black border-black text-white' 
              : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="Toggle Orbit"
          title="Toggle Orbit Mode"
        >
          <Orbit className={`w-5 h-5 ${isOrbiting ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
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
            <div className="bg-white text-slate-900 w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
                  className="p-2 rounded-xl bg-transparent text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Close All Gigs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content / Gigs List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {gigs.map((gig) => {
                  const distanceKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, gig.lat, gig.lng) : null;
                  return (
                    <div
                      key={gig.id}
                      className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
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
                            {distanceKm !== null && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                <Navigation className="w-2.5 h-2.5" /> {formatDistance(distanceKm)}
                              </span>
                            )}
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
                  );
                })}
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
              className="bg-white text-slate-900 border border-slate-200 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-5 relative text-slate-900"
            >
              <button
                onClick={() => setSelectedGig(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
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
                  <p className="text-slate-700 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-600" /> {selectedGig.location}
                  </p>
                  {userLocation && (
                    <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 mt-1.5 w-fit">
                      <Navigation className="w-3 h-3" />
                      <span>{formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedGig.lat, selectedGig.lng))} from your exact location</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 block">Description</span>
                  <p className="text-slate-600 leading-relaxed text-xs">{selectedGig.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 block">Requirements</span>
                  <ul className="space-y-1">
                    {(selectedGig.requirements || []).map((req, idx) => (
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
                  className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    onClick={() => handleOpenNavigation(selectedGig)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* Create Gig Modal */}
      <CreateGigModal
        isOpen={showCreateGigModal}
        onClose={() => setShowCreateGigModal(false)}
        onSubmit={async (newGig) => {
          if (onCreateGig) {
            await onCreateGig(newGig);
          }
          setSelectedGig(newGig);
          if (mapInstanceRef.current && !isNaN(Number(newGig.lat)) && !isNaN(Number(newGig.lng))) {
            mapInstanceRef.current.flyTo([Number(newGig.lat), Number(newGig.lng)], 15, { duration: 1.2 });
          }
        }}
        userProfile={userProfile}
        defaultLocation={userLocation?.address}
        tenantId={tenantId}
      />
    </div>
  );
};

