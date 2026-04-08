import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- ICONS ---
const GreenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});

const UserIcon = L.divIcon({
  className: 'user-icon',
  html: `<div class="relative"><div class="absolute -inset-3 bg-green-500/20 rounded-full animate-ping"></div><div class="w-5 h-5 bg-green-600 rounded-full border-2 border-white shadow-lg"></div></div>`,
  iconSize: [20, 20]
});

const Home: React.FC = () => {
  const { setScreen, setSelectedStation, stations } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPos, setUserPos] = useState<L.LatLng | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [hasCenteredInitial, setHasCenteredInitial] = useState(false);

  // Default fallback only if GPS is totally disabled
  const fallbackCoords: [number, number] = [10.8302, 76.0234];

  const getBirdDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleAction = async (s: any, targetScreen: AppScreen | 'MAP') => {
    setSelectedStation(s);
    if (targetScreen !== 'MAP') setScreen(targetScreen);
  };

  const processedStations = stations
    .map(s => ({ ...s, birdDist: userPos ? getBirdDistance(userPos.lat, userPos.lng, parseFloat(s.lat), parseFloat(s.lng)) : 0 }))
    .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (a.birdDist || 0) - (b.birdDist || 0));

  // --- NEW: THE GOOGLE MAPS STYLE CONTROLLER ---
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      setMapInstance(map);
      // Immediate high-accuracy location request
      map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true, watch: true });
    }, [map]);

    useMapEvents({
      locationfound(e) {
        setUserPos(e.latlng);
        // Only "Fly To" automatically the very first time the app opens
        if (!hasCenteredInitial) {
          map.flyTo(e.latlng, 15);
          setHasCenteredInitial(true);
        }
      },
      locationerror() {
        // If GPS fails, then we go to Kuttipuram as a backup
        if (!hasCenteredInitial) {
            map.setView(fallbackCoords, 13);
            setHasCenteredInitial(true);
        }
      }
    });

    return userPos ? <Marker position={userPos} icon={UserIcon} zIndexOffset={1000} /> : null;
  };

  const centerOnUser = () => {
    if (mapInstance && userPos) mapInstance.flyTo(userPos, 16);
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white font-sans text-gray-900">
      
      {/* SEARCH BAR */}
      <div className="absolute top-14 left-0 right-0 z-[100] px-6">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for a charger..." 
            className="w-full bg-white border border-gray-100 shadow-xl p-4 pl-12 rounded-2xl outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* MAP */}
      <div className="absolute inset-0 z-0 bg-gray-100">
        <MapContainer center={fallbackCoords} zoom={13} zoomControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapController />
          {processedStations.map((s: any, i) => (
            <Marker 
                key={i} 
                position={[parseFloat(s.lat), parseFloat(s.lng)]} 
                icon={GreenIcon} 
                eventHandlers={{ click: () => handleAction(s, 'MAP') }} 
            />
          ))}
        </MapContainer>
      </div>

      {/* LOCATE ME BUTTON */}
      <button 
        onClick={centerOnUser}
        style={{ bottom: isDrawerOpen ? 'calc(50vh + 24px)' : '185px' }}
        className="absolute right-6 z-[160] w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-500"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </button>

      {/* DRAWER */}
      <div className={`absolute left-0 right-0 z-[150] bg-white rounded-t-[2.5rem] shadow-2xl transition-all duration-500 ${isDrawerOpen ? 'bottom-0 h-[50vh]' : 'bottom-[72px] h-24'}`}>
        <div className="w-full py-4 flex justify-center cursor-pointer" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full"></div>
        </div>
        <div className="px-6 overflow-y-auto h-full pb-32">
          <div className="space-y-3">
            {processedStations.map((s: any, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm uppercase">{s.name}</h3>
                    <p className="text-[10px] text-gray-400 truncate w-44">{s.address}</p>
                  </div>
                  <span className="text-[10px] font-black text-green-600 bg-white px-2 py-1 rounded-lg border border-gray-100">
                    {s.birdDist?.toFixed(1)} km
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(s, AppScreen.STATION_DETAIL)} className="flex-1 bg-white border border-green-200 py-2.5 rounded-xl text-[9px] font-black text-green-600 uppercase">Details</button>
                  <button onClick={() => handleAction(s, AppScreen.BOOKING)} className="flex-[1.5] bg-green-500 text-white py-2.5 rounded-xl text-[9px] font-black uppercase shadow-lg">Reserve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[200]">
        <BottomNav active="home" />
      </div>
    </div>
  );
};

export default Home;