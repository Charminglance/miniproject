import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { AppScreen } from '../types';
import { useApp } from '../App';

// ── Config ───────────────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'voltquest2025';

const GAS_URL       = "https://script.google.com/macros/s/AKfycbx0X0lQubkUsql-E-v5sim-RdRzGcr7OOakfsPgA5_0ihbIM-25h33OevtDNaghUDDTVw/exec";
const STATIONS_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQP8ltJjZf-_drm11Ngn7pPDoYxY-tT1OitG-Ovriu6sWM3c_u6XWfPTFnZ2eyWrheCAU6YwL9xww7G/pub?gid=0&single=true&output=csv";
const USERS_CSV     = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWebti2OB0bkqFZ0GJ01CGozsobfQXSomorofw4LMvOLrXKtHsj9chjoLvkSRyeJkYQKJoBvMEGiL9/pub?gid=868149118&single=true&output=csv";
const BOOKINGS_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQP8ltJjZf-_drm11Ngn7pPDoYxY-tT1OitG-Ovriu6sWM3c_u6XWfPTFnZ2eyWrheCAU6YwL9xww7G/pub?gid=bookings&single=true&output=csv";

const CONNECTOR_TYPES = ['AC Type-1','AC Type-2','CCS-1','CCS-2','CHAdeMO','GB/T','Tesla'];
const AVAIL_OPTIONS   = ['Available','Occupied','Maintenance'];

type Tab = 'overview' | 'stations' | 'users' | 'bookings';

interface SheetStation {
  id?: string; name: string; address: string;
  lat: string; lng: string; cost: string;
  openingHours: string; connectorType: string;
  numSlots: string; availability: string; imageUrl?: string;
}

interface SheetUser {
  name: string; email: string; phone?: string;
  vehicletype?: string; vehiclemodel?: string;
  porttype?: string; licenseplate?: string;
  registeredat?: string;
}

interface SheetBooking {
  bookingid?: string; useremail?: string; username?: string;
  stationname?: string; date?: string; starttime?: string;
  duration?: string; totalcost?: string; status?: string; bookedat?: string;
}

const emptyStation = (): SheetStation => ({
  name:'', address:'', lat:'', lng:'', cost:'',
  openingHours:'', connectorType:'AC Type-2', numSlots:'1',
  availability:'Available', imageUrl:''
});

const ic = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 transition-all";

const AdminDashboard: React.FC = () => {
  const { setScreen } = useApp();

  // Auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [uInput, setUInput]     = useState('');
  const [pInput, setPInput]     = useState('');
  const [authErr, setAuthErr]   = useState('');

  // Data
  const [stations, setStations]   = useState<SheetStation[]>([]);
  const [users, setUsers]         = useState<SheetUser[]>([]);
  const [bookings, setBookings]   = useState<SheetBooking[]>([]);
  const [loading, setLoading]     = useState(false);

  // UI
  const [tab, setTab]               = useState<Tab>('overview');
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<SheetStation | null>(null);
  const [form, setForm]             = useState<SheetStation>(emptyStation());
  const [saving, setSaving]         = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [toast, setToast]           = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const normalise = (obj: any) => {
    const n: any = {};
    Object.keys(obj).forEach(k => { n[k.toLowerCase().replace(/[\s_]/g,'')] = obj[k]; });
    return n;
  };

  const fetchCSV = <T,>(url: string, setter: (d: T[]) => void) =>
    new Promise<void>(res => {
      Papa.parse(url, {
        download: true, header: true, skipEmptyLines: true,
        complete: (r) => { setter((r.data as any[]).map(normalise) as T[]); res(); }
      });
    });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchCSV<SheetStation>(STATIONS_CSV, setStations),
      fetchCSV<SheetUser>(USERS_CSV, setUsers),
      fetchCSV<SheetBooking>(BOOKINGS_CSV, setBookings).catch(() => {}),
    ]);
    setLoading(false);
  }, []);

  useEffect(() => { if (loggedIn) fetchAll(); }, [loggedIn]);

  const handleLogin = () => {
    if (uInput === ADMIN_USER && pInput === ADMIN_PASS) { setLoggedIn(true); setAuthErr(''); }
    else setAuthErr('Invalid username or password');
  };

  const gasPost = async (payload: object) => {
    await fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) });
  };

  const handleSaveStation = async () => {
    if (!form.name || !form.lat || !form.lng) return alert('Name, Latitude, Longitude are required');
    setSaving(true);
    try {
      if (editing) {
        await gasPost({ action: 'updateStation', ...form, id: (editing as any).id || editing.name });
        showToast('✅ Station updated');
      } else {
        await gasPost({ action: 'addStation', ...form, id: 'S-' + Date.now() });
        showToast('✅ Station added');
      }
      setShowForm(false); setEditing(null); setForm(emptyStation());
      setTimeout(fetchAll, 1800);
    } catch { showToast('❌ Save failed — check GAS URL'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (st: SheetStation) => {
    if (!window.confirm(`Delete "${st.name}"?`)) return;
    setSaving(true);
    try {
      await gasPost({ action: 'deleteStation', id: (st as any).id || st.name, name: st.name });
      showToast('🗑️ Station deleted');
      setTimeout(fetchAll, 1800);
    } catch { showToast('❌ Delete failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (st: SheetStation) => {
    const next = st.availability === 'Available' ? 'Occupied' : 'Available';
    setSaving(true);
    try {
      await gasPost({ action: 'updateStation', ...st, id: (st as any).id || st.name, availability: next });
      showToast(`✅ Marked ${next}`);
      setTimeout(fetchAll, 1800);
    } catch { showToast('❌ Update failed'); }
    finally { setSaving(false); }
  };

  // Derived
  const availCount = stations.filter(s => s.availability === 'Available').length;
  const occCount   = stations.filter(s => s.availability === 'Occupied').length;
  const maintCount = stations.filter(s => s.availability === 'Maintenance').length;

  const filteredStations = stations.filter(s =>
    (statusFilter === 'All' || s.availability === statusFilter) &&
    s.name?.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── LOGIN ────────────────────────────────────────────────
  if (!loggedIn) return (
    <div className="flex flex-col h-full bg-gray-950 justify-center p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white italic">VOLT<span className="text-green-400">QUEST</span></h1>
        <p className="text-green-400 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Admin Portal</p>
      </div>
      <div className="bg-gray-900 rounded-3xl p-7 border border-gray-800 space-y-4">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">Administrator Login</p>
        <input type="text" placeholder="Username" value={uInput}
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm font-semibold focus:outline-none focus:border-green-400 transition-all"
          onChange={(e) => setUInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <input type="password" placeholder="Password" value={pInput}
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm font-semibold focus:outline-none focus:border-green-400 transition-all"
          onChange={(e) => setPInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        {authErr && <p className="text-red-400 text-xs font-bold text-center">{authErr}</p>}
        <button onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-2xl font-black uppercase tracking-wide transition-all active:scale-95">
          Enter Dashboard
        </button>
      </div>
      <button onClick={() => setScreen(AppScreen.PROFILE)} className="mt-6 text-gray-600 text-xs font-bold text-center">
        ← Back to Profile
      </button>
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-950 px-5 pt-12 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-black text-white italic">VOLT<span className="text-green-400">QUEST</span></h1>
          <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.15em]">Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="bg-gray-800 text-white text-[11px] font-black px-3 py-2 rounded-xl active:scale-95 transition-all">
            {loading ? '⟳' : '↺ Sync'}
          </button>
          <button onClick={() => { setLoggedIn(false); setScreen(AppScreen.PROFILE); }}
            className="bg-red-500/20 text-red-400 text-[11px] font-black px-3 py-2 rounded-xl active:scale-95 transition-all">
            Exit Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-950 px-4 pb-3 flex gap-2 shrink-0 overflow-x-auto">
        {(['overview','stations','users','bookings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
              tab === t ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Total Stations', value: stations.length, bg:'bg-blue-500',   icon:'⚡' },
              { label:'Available',      value: availCount,      bg:'bg-green-500',  icon:'✅' },
              { label:'Occupied',       value: occCount,        bg:'bg-orange-500', icon:'🔴' },
              { label:'Total Users',    value: users.length,    bg:'bg-purple-500', icon:'👤' },
              { label:'Maintenance',    value: maintCount,      bg:'bg-red-500',    icon:'🔧' },
              { label:'Bookings',       value: bookings.length, bg:'bg-teal-500',   icon:'📅' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className={`${c.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>{c.icon}</div>
                <p className="text-3xl font-black text-gray-900">{c.value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Availability bars */}
          {stations.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Station Health</p>
              {[
                { label:'Available',  count: availCount, color:'bg-green-500' },
                { label:'Occupied',   count: occCount,   color:'bg-orange-500' },
                { label:'Maintenance',count: maintCount, color:'bg-red-500' },
              ].map(row => (
                <div key={row.label} className="mb-3">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600">{row.label}</span>
                    <span className="text-gray-400">{row.count}/{stations.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${row.color} h-2 rounded-full`}
                      style={{ width: `${stations.length ? (row.count/stations.length)*100 : 0}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent registrations */}
          {users.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Users</p>
              {[...users].reverse().slice(0,4).map((u, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center font-black text-green-700 text-sm">
                    {u.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 shrink-0">{u.vehicletype || '—'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent bookings summary */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Bookings</p>
              {[...bookings].reverse().slice(0,4).map((b, i) => (
                <div key={i} className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{b.username || b.useremail}</p>
                    <p className="text-[10px] text-gray-400">{b.stationname} · {b.date}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                    b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{b.status || 'Pending'}</span>
                </div>
              ))}
            </div>
          )}
        </>}

        {/* ── STATIONS ── */}
        {tab === 'stations' && <>
          <div className="flex gap-2">
            <input className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500"
              placeholder="Search stations..." value={stationSearch}
              onChange={(e) => setStationSearch(e.target.value)} />
            <select className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              {AVAIL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <button onClick={() => { setForm(emptyStation()); setEditing(null); setShowForm(true); }}
              className="bg-green-500 text-white px-4 py-3 rounded-xl text-xs font-black uppercase active:scale-95 transition-all shadow-lg shadow-green-200">
              + Add
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-gray-700 uppercase tracking-wide">{editing ? 'Edit Station' : 'New Station'}</p>
                <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyStation()); }}
                  className="text-gray-400 text-lg font-bold leading-none">✕</button>
              </div>
              <input className={ic} placeholder="Station name *" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} />
              <input className={ic} placeholder="Full address *" value={form.address} onChange={(e) => setForm({...form,address:e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className={ic} placeholder="Latitude *" value={form.lat} onChange={(e) => setForm({...form,lat:e.target.value})} />
                <input className={ic} placeholder="Longitude *" value={form.lng} onChange={(e) => setForm({...form,lng:e.target.value})} />
              </div>
              <input className={ic} placeholder="Cost (e.g. ₹12/kWh)" value={form.cost} onChange={(e) => setForm({...form,cost:e.target.value})} />
              <input className={ic} placeholder="Opening hours (e.g. 24 Hours)" value={form.openingHours} onChange={(e) => setForm({...form,openingHours:e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <select className={ic} value={form.connectorType} onChange={(e) => setForm({...form,connectorType:e.target.value})}>
                  {CONNECTOR_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input className={ic} placeholder="Slots" type="number" min="1" value={form.numSlots} onChange={(e) => setForm({...form,numSlots:e.target.value})} />
              </div>
              <select className={ic} value={form.availability} onChange={(e) => setForm({...form,availability:e.target.value})}>
                {AVAIL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <input className={ic} placeholder="Image URL (optional)" value={form.imageUrl||''} onChange={(e) => setForm({...form,imageUrl:e.target.value})} />
              <button onClick={handleSaveStation} disabled={saving}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase tracking-wide active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Station' : 'Add Station'}
              </button>
            </div>
          )}

          {loading ? <p className="text-center text-gray-400 text-sm font-bold py-8">Loading...</p>
          : filteredStations.length === 0 ? <p className="text-center text-gray-400 text-sm font-bold py-8">No stations found</p>
          : filteredStations.map((st, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <p className="font-black text-gray-900 text-sm">{st.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{st.address}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                  st.availability === 'Available'   ? 'bg-green-100 text-green-700' :
                  st.availability === 'Occupied'    ? 'bg-orange-100 text-orange-700' :
                                                      'bg-red-100 text-red-700'
                }`}>{st.availability}</span>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-400 font-semibold mb-3">
                <span>⚡ {st.connectortype || st.connectorType}</span>
                <span>🔢 {st.numslots || st.numSlots} slots</span>
                <span>💰 {st.cost}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(st)} disabled={saving}
                  className="flex-1 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95">
                  Toggle
                </button>
                <button onClick={() => { setForm({...st}); setEditing(st); setShowForm(true); }}
                  className="px-4 bg-blue-50 text-blue-600 py-2 rounded-xl text-[10px] font-black uppercase active:scale-95">
                  Edit
                </button>
                <button onClick={() => handleDelete(st)} disabled={saving}
                  className="px-4 bg-red-50 text-red-500 py-2 rounded-xl text-[10px] font-black uppercase active:scale-95">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>}

        {/* ── USERS ── */}
        {tab === 'users' && <>
          <input className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500"
            placeholder="Search by name or email..." value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)} />
          <p className="text-[10px] text-gray-400 font-bold uppercase">{filteredUsers.length} users</p>
          {loading ? <p className="text-center text-gray-400 text-sm font-bold py-8">Loading...</p>
          : filteredUsers.length === 0 ? <p className="text-center text-gray-400 text-sm font-bold py-8">No users found</p>
          : filteredUsers.map((u, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black">
                  {u.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { l:'Phone',   v: u.phone },
                  { l:'Vehicle', v: u.vehiclemodel },
                  { l:'Type',    v: u.vehicletype },
                  { l:'Port',    v: u.porttype },
                  { l:'Plate',   v: u.licenseplate },
                ].filter(f => f.v).map(f => (
                  <div key={f.l} className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase">{f.l}</p>
                    <p className="text-xs font-bold text-gray-700">{f.v}</p>
                  </div>
                ))}
              </div>
              {u.registeredat && (
                <p className="text-[9px] text-gray-300 font-semibold mt-2">
                  Joined {new Date(u.registeredat).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          ))}
        </>}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && <>
          <p className="text-[10px] text-gray-400 font-bold uppercase">{bookings.length} bookings</p>
          {loading ? <p className="text-center text-gray-400 text-sm font-bold py-8">Loading...</p>
          : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <span className="text-4xl">📅</span>
              <p className="font-black text-gray-600 mt-3 text-sm">No bookings yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Make sure your GAS script has the <span className="font-black">addBooking</span> action and your sheet has a <span className="font-black">Bookings</span> tab.
              </p>
            </div>
          ) : [...bookings].reverse().map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-black text-gray-900 text-sm">{b.username || '—'}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{b.useremail}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                  b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                             'bg-yellow-100 text-yellow-700'
                }`}>{b.status || 'Pending'}</span>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-500 font-semibold">
                <span>📍 {b.stationname}</span>
                <span>📅 {b.date}</span>
                <span>⏱️ {b.duration}h</span>
                <span>💰 ₹{b.totalcost}</span>
              </div>
            </div>
          ))}
        </>}

      </div>
    </div>
  );
};

export default AdminDashboard;
