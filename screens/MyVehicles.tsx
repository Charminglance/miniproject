import React from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../services/AuthContext';

const MyVehicles: React.FC = () => {
  const { setScreen } = useApp();
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="overflow-y-auto pb-28">
        <div className="p-6 pt-14 flex items-center gap-4">
          <button onClick={() => setScreen(AppScreen.PROFILE)} className="text-2xl font-bold text-gray-700">←</button>
          <h1 className="text-xl font-black">My Vehicle</h1>
        </div>

        <div className="px-6 space-y-4">
          {user?.vehicleModel ? (
            <>
              {/* Vehicle card */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-7 text-white shadow-xl shadow-green-200">
                <p className="text-green-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Registered EV</p>
                <h2 className="text-2xl font-black leading-tight">{user.vehicleModel}</h2>
                <p className="text-green-200 text-sm font-semibold mt-1">{user.vehicleType}</p>
                <div className="mt-6 inline-block bg-white/25 backdrop-blur rounded-xl px-4 py-2">
                  <p className="font-black text-white tracking-[0.2em] text-sm">{user.licensePlate}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {[
                  { icon: '🚗', label: 'Vehicle Type',  value: user.vehicleType },
                  { icon: '🏷️', label: 'Model',         value: user.vehicleModel },
                  { icon: '🔌', label: 'Charging Port', value: user.portType },
                  { icon: '🪪', label: 'License Plate', value: user.licensePlate },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{row.icon}</span>
                      <span className="text-xs font-bold text-gray-500">{row.label}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{row.value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-xs font-bold text-green-700 text-center">
                  💡 To update vehicle details, contact support or create a new account.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <span className="text-6xl">🔌</span>
              <p className="text-gray-400 font-black mt-5">No vehicle registered</p>
              <p className="text-gray-300 text-sm mt-1">Vehicle details are added during registration</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav active="profile" />
    </div>
  );
};

export default MyVehicles;
