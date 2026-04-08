
import React from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';

const QRScanner: React.FC = () => {
  const { setScreen } = useApp();

  return (
    <div className="flex flex-col h-full bg-black/90 p-6 pt-12 relative overflow-hidden">
      <div className="flex items-center justify-between text-white mb-10">
         <button onClick={() => setScreen(AppScreen.HOME)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
         </button>
         <h1 className="text-xl font-bold">Qr code</h1>
         <div className="w-12"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-10">
         <p className="text-white/60 text-center px-10 text-sm">Scan the QR code of the Charger to start charging</p>
         
         {/* QR Scanner Frame */}
         <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl"></div>
            
            <div className="absolute inset-4 bg-white rounded-xl flex items-center justify-center p-4">
               {/* Mock QR Code */}
               <div className="grid grid-cols-5 gap-1 w-full h-full p-2 opacity-80">
                  {Array.from({length: 25}).map((_, i) => (
                    <div key={i} className={`rounded-[2px] ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                  ))}
               </div>
            </div>
            
            {/* Scanning Line */}
            <div className="absolute top-0 left-4 right-4 h-1 bg-green-500/50 shadow-[0_0_15px_#22C55E] animate-scan rounded-full"></div>
         </div>

         <div className="w-full space-y-4">
            <div className="flex items-center gap-4 text-white/40">
               <div className="h-px bg-white/10 flex-1"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest">Or</span>
               <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="space-y-2">
               <label className="text-white/40 text-xs font-bold ml-1">Enter charger ID</label>
               <input 
                 type="text" 
                 placeholder="Enter charger ID" 
                 className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
               />
            </div>
         </div>
      </div>

      <button 
        onClick={() => setScreen(AppScreen.CHARGING_STATUS)}
        className="w-full bg-green-500 text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-green-500/20 mb-10 hover:bg-green-600 transition-all"
      >
        Proceed
      </button>
    </div>
  );
};

export default QRScanner;
