import React, { useState } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import { useAuth } from '../services/AuthContext';

const GAS_URL = "https://script.google.com/macros/s/AKfycby8abM-gqYCuIWwMduASnE4wsl30AXZDyK-K2l2mds0lPf15gYsXDmb_VZvh8qjas5ERA/exec";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM'];

const BookingFlow: React.FC = () => {
  const { selectedStation, setScreen, setBookings } = useApp();
  const { user } = useAuth();

  const today = new Date();
  const [dayOffset, setDayOffset] = useState(0);   // 0 = today, 1 = tomorrow, etc.
  const [startTime, setStartTime] = useState('09:00 AM');
  const [duration, setDuration] = useState(2);
  const [saving, setSaving] = useState(false);

  if (!selectedStation) return null;
  const s = selectedStation as any;

  // Cost per hour: parse from string like "₹12/kWh" or "₹15.00 / hour"
  const rawCost = parseFloat(String(s.cost || '15').replace(/[^0-9.]/g, '')) || 15;
  const totalCost = Math.round(rawCost * duration);

  const selectedDate = new Date(today);
  selectedDate.setDate(today.getDate() + dayOffset);
  const dateLabel = selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleBook = async () => {
    setSaving(true);
    const bookingId = `B-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      stationId: s.id || s.name,
      stationName: s.name,
      date: dateLabel,
      startTime,
      endTime: '', // derived on display
      duration,
      totalCost,
      status: 'Pending' as const,
    };

    // Save to Google Sheet via GAS
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addBooking',
          bookingId,
          userEmail: user?.email || 'guest',
          userName: user?.name || 'Guest',
          stationId: s.id || s.name,
          stationName: s.name,
          date: dateLabel,
          startTime,
          duration,
          totalCost,
          status: 'Pending'
        })
      });
    } catch {
      // Booking still saved locally even if GAS fails
    }

    setBookings(prev => [...prev, newBooking]);
    setSaving(false);
    setScreen(AppScreen.NAVIGATION);
  };

  // Next 7 days selector
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { offset: i, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAYS[d.getDay()], date: d.getDate() };
  });

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">

      {/* Header */}
      <div className="p-6 pt-14 flex items-center justify-between">
        <button onClick={() => setScreen(AppScreen.STATION_DETAIL)} className="text-2xl font-bold text-gray-700">←</button>
        <h1 className="text-sm font-black uppercase tracking-widest">Reserve a Slot</h1>
        <div className="w-8" />
      </div>

      <div className="px-6 space-y-8 pb-12">

        {/* Station summary */}
        <div className="bg-green-50 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-green-200">⚡</div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 truncate">{s.name}</p>
            <p className="text-xs text-gray-400 font-semibold truncate">{s.address}</p>
          </div>
        </div>

        {/* Date picker */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Date</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {nextDays.map(d => (
              <button key={d.offset} onClick={() => setDayOffset(d.offset)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all active:scale-95 ${dayOffset === d.offset
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                    : 'bg-gray-50 text-gray-700'
                  }`}>
                <span className="text-[10px] font-bold uppercase">{d.label}</span>
                <span className="text-xl font-black">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start time */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Start Time</p>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-green-500 transition-all">
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {/* Duration slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
            <span className="text-green-600 font-black text-sm">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
          </div>
          <input type="range" min={1} max={12} step={1} value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-1">
            <span>1h</span><span>12h</span>
          </div>
        </div>

        {/* Cost summary */}
        <div className="bg-gray-50 rounded-3xl p-6 flex justify-between items-center border border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Amount</p>
            <h2 className="text-4xl font-black text-gray-900 mt-1">₹{totalCost}</h2>
            <p className="text-xs text-gray-400 font-semibold mt-1">{dateLabel} · {startTime} · {duration}h</p>
          </div>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-green-100">⚡</div>
        </div>

        {/* User info confirmation */}
        {user && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Booking for</p>
            <p className="text-sm font-black text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 font-semibold">{user.email} · {user.licensePlate || 'No plate'}</p>
          </div>
        )}

        <button onClick={handleBook} disabled={saving}
          className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Confirm Booking'}
        </button>

      </div>
    </div>
  );
};

export default BookingFlow;
