
import React from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';

interface BottomNavProps {
  active: 'home' | 'charger' | 'battery' | 'profile';
}

const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { setScreen } = useApp();

  const items = [
    { id: 'home', label: 'Home', screen: AppScreen.HOME, icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'charger', label: 'Charger', screen: AppScreen.HOME, icon: (
       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14H11V21L20 10H13Z" />
       </svg>
    )},
    { id: 'battery', label: 'Battery', screen: AppScreen.CHARGING_STATUS, icon: (
       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
       </svg>
    )},
    { id: 'profile', label: 'Profile', screen: AppScreen.PROFILE, icon: (
       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
       </svg>
    )},
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md px-6 py-4 pb-10 flex justify-between border-t border-gray-50 z-40 rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
       {items.map(item => (
          <button 
            key={item.id}
            onClick={() => setScreen(item.screen)}
            className={`flex flex-col items-center gap-1 transition-all ${active === item.id ? 'text-green-500' : 'text-gray-300'}`}
          >
             <div className={`${active === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
               {item.icon}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
             {active === item.id && <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"></div>}
          </button>
       ))}
    </div>
  );
};

export default BottomNav;
