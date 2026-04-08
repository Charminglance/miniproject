
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';

const ActiveCharging: React.FC = () => {
  const { setScreen } = useApp();
  const [progress, setProgress] = useState(80);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 0.1 : 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white p-6 pt-12">
      <div className="flex items-center justify-between mb-10">
         <div className="w-12"></div>
         <h1 className="text-xl font-bold">Charging Session</h1>
         <div className="w-12"></div>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto pb-10">
        {/* Progress Circle */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
           <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" stroke="#F1F5F9" strokeWidth="6" 
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" stroke="#22C55E" strokeWidth="6" 
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
           </svg>
           <div className="absolute text-center">
              <span className="text-5xl font-black text-gray-900">{Math.floor(progress)} %</span>
              <p className="text-xs text-green-500 font-bold tracking-widest mt-1">CHARGING</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Duration', value: '60 min' },
             { label: 'Range', value: '250 KM' },
             { label: 'Energy deliver', value: '15.5 KWH' },
             { label: 'Charging ID', value: '125871' },
           ].map(stat => (
              <div key={stat.label} className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-1">
                 <p className="text-[10px] text-gray-400 font-bold uppercase">{stat.label}</p>
                 <p className="text-lg font-black text-gray-800">{stat.value}</p>
              </div>
           ))}
        </div>

        {/* Fees */}
        <div className="space-y-3 pt-4">
           <div className="flex justify-between items-center px-2">
              <span className="text-gray-400 font-bold">Charging fees</span>
              <span className="text-gray-900 font-black">$15.00</span>
           </div>
           <div className="flex justify-between items-center px-2">
              <span className="text-gray-400 font-bold">Idle fees</span>
              <span className="text-gray-900 font-black">$00.00</span>
           </div>
           <div className="h-px bg-gray-100 my-2"></div>
           <div className="flex justify-between items-center px-2">
              <span className="text-gray-900 font-black">Total</span>
              <span className="text-green-500 font-black text-xl">$15.00</span>
           </div>
        </div>
      </div>

      <button 
        onClick={() => setScreen(AppScreen.HOME)}
        className="w-full bg-green-500 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-600 transition-all mb-4"
      >
        Back to home
      </button>
    </div>
  );
};

export default ActiveCharging;
