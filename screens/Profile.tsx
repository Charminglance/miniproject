import React from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../services/AuthContext';

const Profile: React.FC = () => {
  const { setScreen, bookings } = useApp();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); setScreen(AppScreen.AUTH); };

  const infoRows = [
    { icon: '📞', label: 'Phone',         value: user?.phone        || '—' },
    { icon: '🚗', label: 'Vehicle Type',  value: user?.vehicleType  || '—' },
    { icon: '🏷️', label: 'Vehicle Model', value: user?.vehicleModel || '—' },
    { icon: '🔌', label: 'Charging Port', value: user?.portType     || '—' },
    { icon: '🪪', label: 'License Plate', value: user?.licensePlate || '—' },
  ];

  const pendingCount   = bookings.filter(b => b.status === 'Pending').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="overflow-y-auto pb-28">

        {/* Header */}
        <div className="bg-gradient-to-b from-green-50 to-white px-6 pt-14 pb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-200 mb-4">
            <span className="text-4xl font-black text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-xl font-black text-gray-900">{user?.name || 'Guest'}</h2>
          <p className="text-sm text-gray-400 font-medium">{user?.email || '—'}</p>

          {/* Stats */}
          <div className="flex gap-4 mt-5">
            {[
              { label: 'Total Trips', value: bookings.length },
              { label: 'Pending',     value: pendingCount },
              { label: 'Completed',   value: completedCount },
            ].map(s => (
              <div key={s.label} className="text-center bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                <p className="text-2xl font-black text-green-500">{s.value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info rows */}
        <div className="px-6 mt-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Account & Vehicle</p>
          <div className="space-y-2">
            {infoRows.map(row => (
              <div key={row.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{row.icon}</span>
                  <span className="text-xs font-bold text-gray-500">{row.label}</span>
                </div>
                <span className="text-sm font-black text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        {bookings.length > 0 && (
          <div className="px-6 mt-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Bookings</p>
            <div className="space-y-2">
              {[...bookings].reverse().slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-900">{b.stationName}</p>
                    <p className="text-xs text-gray-400 font-semibold">{b.date} · {b.duration}h · ₹{b.totalCost}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                    b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 mt-6 space-y-3">
          <button onClick={() => setScreen(AppScreen.MY_VEHICLES)}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-all active:scale-95">
            <span className="text-lg">🚗</span>
            <span className="text-sm font-black text-gray-700">My Vehicle</span>
            <span className="ml-auto text-gray-300 font-bold">›</span>
          </button>
          <button onClick={() => setScreen(AppScreen.ADMIN)}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all active:scale-95">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-black text-gray-700">Admin Dashboard</span>
            <span className="ml-auto text-gray-300 font-bold">›</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-95">
            <span className="text-lg">🚪</span>
            <span className="text-sm font-black text-red-500">Log Out</span>
          </button>
        </div>

      </div>
      <BottomNav active="profile" />
    </div>
  );
};

export default Profile;
