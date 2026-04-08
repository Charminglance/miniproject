import React from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';

const StationDetail: React.FC = () => {
  const { selectedStation, setScreen } = useApp();
  if (!selectedStation) return null;
  const s = selectedStation as any;

  const stationImage = s.imageUrl || `https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800`;

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900 overflow-y-auto">
      
      {/* 1. HERO IMAGE SECTION */}
      <div className="relative h-80 w-full shrink-0">
        <img src={stationImage} alt={s.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
        <button 
          onClick={() => setScreen(AppScreen.HOME)} 
          className="absolute top-12 left-6 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-2xl text-xl shadow-xl active:scale-90 transition-all"
        >
          ←
        </button>

        {/* Real Slot Count Badge */}
        <div className="absolute bottom-6 left-8 bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
          {s.numSlots || 1} {s.numSlots === 1 ? 'Slot' : 'Slots'} Available
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="px-8 pt-8 space-y-10 pb-12">
        
        {/* Name & Source Tag */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-black leading-tight tracking-tighter text-gray-900 uppercase">
              {s.name}
            </h1>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">
              {s.source === 'ocm' ? '● Live Public Station' : '● Private Station'}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-2 italic leading-relaxed">{s.address}</p>
          </div>
        </div>

        {/* REAL CONNECTORS SECTION (The Big Change) */}
        

[Image of electric vehicle charging connector types]

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Technical Specifications</h3>
          <div className="grid grid-cols-1 gap-3">
            {s.connections && s.connections.length > 0 ? (
              s.connections.map((conn: any, i: number) => (
                <div key={i} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-black text-gray-900 text-sm uppercase">
                      {conn.ConnectionType?.Title || "Universal Port"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {conn.PowerKW ? `${conn.PowerKW} kW` : 'Standard'} • {conn.CurrentType?.Title || 'Fast Charge'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${conn.StatusType?.IsOperational !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
              ))
            ) : (
              // Fallback if no connection data exists
              <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                <p className="font-black text-gray-900 text-sm uppercase">Standard Connector</p>
                <p className="text-[10px] font-bold text-gray-400">Information not verified</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex justify-between items-center">
          <div>
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pricing</p>
             <p className="text-2xl font-black text-gray-900">₹{s.cost || '15'}<span className="text-xs text-gray-400 font-bold">/kWh</span></p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Road Distance</p>
             <p className="text-xl font-black text-green-600">{s.roadDistance || 'Nearby'}</p>
          </div>
        </div>

        {/* Bottom Booking Button */}
        <div className="pt-4">
            <button 
                onClick={() => setScreen(AppScreen.BOOKING)}
                className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all"
            >
                START BOOKING
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;