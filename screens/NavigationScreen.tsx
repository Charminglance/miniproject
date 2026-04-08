import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// FIX: Use web-based icons so you don't need local image files
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const NavigationScreen: React.FC = () => {
  const { setScreen, selectedStation } = useApp();
  const [arrived, setArrived] = useState(false);

  // Position logic: uses selected station coordinates or defaults to a city center
  const stationPos: [number, number] = selectedStation?.coordinates 
    ? [selectedStation.coordinates.lat, selectedStation.coordinates.lng] 
    : [51.505, -0.09];

  // Simulate arrival after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setArrived(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* 1. THE REAL MAP INTERFACE */}
      {/* Note: We removed the "radial-gradient" dots here */}
      <div className="flex-1 relative z-10 bg-slate-200">
        <MapContainer 
          center={stationPos} 
          zoom={15} 
          zoomControl={false} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <Marker position={stationPos} />
        </MapContainer>

        {/* Floating User Indicator (The Moving Car/User) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
          <div className="relative">
             <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-ping"></div>
             <div className="absolute inset-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION INFO CARD */}
      <div className="bg-white p-6 pb-10 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative z-20 -mt-12">
          <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {selectedStation?.name || "Target Station"}
               </h2>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">
                2.5 Km away • 8 mins
               </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-100">
               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
               </svg>
            </div>
          </div>

          <button 
            onClick={() => setScreen(AppScreen.HOME)}
            className="w-full border-2 border-gray-100 text-gray-400 py-4 rounded-3xl font-black hover:bg-gray-50 transition-all uppercase text-xs tracking-widest"
          >
            Cancel Trip
          </button>
      </div>

      {/* 3. ARRIVAL OVERLAY */}
      {arrived && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-8 animate-fade-in">
            <div className="bg-white rounded-[3rem] p-8 text-center space-y-6 shadow-2xl w-full max-w-sm animate-scale-up">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <div>
                 <h2 className="text-3xl font-black text-gray-900">Arrived!</h2>
                 <p className="text-gray-400 text-sm mt-2 font-medium">Plug in your vehicle to begin.</p>
               </div>
               <button 
                 onClick={() => setScreen(AppScreen.QR_SCAN)}
                 className="w-full bg-green-500 text-white py-5 rounded-3xl font-black shadow-lg shadow-green-200 uppercase tracking-widest text-sm active:scale-95 transition-all"
               >
                 Start Charging
               </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default NavigationScreen;