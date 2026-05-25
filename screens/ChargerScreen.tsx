import React, { useState } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';

const CHARGER_TYPES = [
  {
    id: 'ccs2',
    label: 'CCS2',
    fullName: 'Combined Charging System 2',
    icon: '⚡',
    powerRange: '50 – 350 kW',
    currentType: 'DC Fast Charge',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    compatible: ['MG ZS EV', 'Tata Nexon EV', 'Hyundai Ioniq 5', 'Kia EV6', 'Ather 450X'],
    stationsInKerala: 38,
    description: 'The most widespread DC fast charging standard in India. Ideal for long-distance travel and quick top-ups.'
  },
  {
    id: 'type2',
    label: 'Type 2',
    fullName: 'Type 2 (Mennekes) AC',
    icon: '🔋',
    powerRange: '7.4 – 22 kW',
    currentType: 'AC Charging',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    compatible: ['Tata Nexon EV', 'MG ZS EV', 'BMW iX', 'Mercedes EQC', 'All EVs'],
    stationsInKerala: 64,
    description: 'Universal AC charging port available at most public stations and home charger setups in Kerala.'
  },
  {
    id: 'chademo',
    label: 'CHAdeMO',
    fullName: 'CHAdeMO DC Fast',
    icon: '🔌',
    powerRange: '50 – 100 kW',
    currentType: 'DC Fast Charge',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    compatible: ['Nissan Leaf', 'Mitsubishi Outlander PHEV', 'Kia Soul EV'],
    stationsInKerala: 12,
    description: 'Japanese DC standard supported by select EV brands. Available at major urban stations across Kerala.'
  },
  {
    id: 'type1',
    label: 'Type 1',
    fullName: 'Type 1 (J1772) AC',
    icon: '🔆',
    powerRange: '3.3 – 7.4 kW',
    currentType: 'AC Slow Charge',
    color: 'bg-orange-400',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    compatible: ['Chevrolet Bolt', 'Nissan Leaf (older)', 'Mitsubishi i-MiEV'],
    stationsInKerala: 8,
    description: 'Single-phase AC charger. Slower but widely compatible with older EVs. Best suited for overnight charging.'
  },
];

const NEARBY_CHARGERS = [
  { station: 'Charge+Zone Kuttipuram', type: 'CCS2', power: '60 kW', status: 'Available', distance: '2.1 km', slots: 2 },
  { station: 'SunFuel EV Tirur', type: 'Type 2', power: '22 kW', status: 'Available', distance: '12.3 km', slots: 1 },
  { station: 'BPCL EV Point Guruvayur', type: 'CCS2', power: '30 kW', status: 'Available', distance: '19.1 km', slots: 1 },
  { station: 'KSEB EV Hub Ponnani', type: 'CCS2', power: '50 kW', status: 'In Use', distance: '10.2 km', slots: 0 },
  { station: 'Fortum EV Hub Malappuram', type: 'Type 2', power: '22 kW', status: 'Available', distance: '23.4 km', slots: 2 },
  { station: 'KSEB EV Hub Thrissur', type: 'CCS2', power: '60 kW', status: 'Available', distance: '28.3 km', slots: 3 },
  { station: 'ChargeZone Palakkad', type: 'CCS2', power: '50 kW', status: 'Available', distance: '54.1 km', slots: 1 },
];

const ChargerScreen: React.FC = () => {
  const { setScreen } = useApp();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredChargers = selectedType
    ? NEARBY_CHARGERS.filter(c => c.type === CHARGER_TYPES.find(t => t.id === selectedType)?.label)
    : NEARBY_CHARGERS;

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900 overflow-hidden">

      {/* HEADER */}
      <div className="px-6 pt-14 pb-4 bg-white z-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Kerala EV Network</p>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Charger Types</h1>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-green-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] font-black text-green-500 uppercase">Active Stations</p>
            <p className="text-xl font-black text-gray-900">122</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] font-black text-gray-400 uppercase">Available Now</p>
            <p className="text-xl font-black text-gray-900">89</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] font-black text-gray-400 uppercase">Connector Types</p>
            <p className="text-xl font-black text-gray-900">4</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 space-y-6">

        {/* CHARGER TYPE CARDS */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Supported Standards</p>
          <div className="grid grid-cols-2 gap-3">
            {CHARGER_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(selectedType === type.id ? null : type.id);
                  setExpandedCard(expandedCard === type.id ? null : type.id);
                }}
                className={`text-left p-4 rounded-3xl border transition-all ${
                  selectedType === type.id
                    ? `${type.lightColor} ${type.borderColor} border-2`
                    : 'bg-gray-50 border-gray-100 border'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className={`text-sm font-black uppercase ${selectedType === type.id ? type.textColor : 'text-gray-900'}`}>
                  {type.label}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{type.powerRange}</p>
                <div className={`mt-2 px-2 py-0.5 rounded-full inline-block ${type.lightColor}`}>
                  <p className={`text-[8px] font-black uppercase ${type.textColor}`}>{type.stationsInKerala} Stations</p>
                </div>
              </button>
            ))}
          </div>

          {/* Expanded info */}
          {expandedCard && (() => {
            const t = CHARGER_TYPES.find(x => x.id === expandedCard)!;
            return (
              <div className={`mt-3 p-5 rounded-3xl border-2 ${t.lightColor} ${t.borderColor}`}>
                <p className="font-black text-gray-900 text-sm uppercase">{t.fullName}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
                <div className="mt-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Compatible Vehicles</p>
                  <div className="flex flex-wrap gap-1">
                    {t.compatible.map(v => (
                      <span key={v} className="bg-white px-2 py-1 rounded-lg text-[9px] font-bold text-gray-600 border border-gray-100">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* NEARBY CHARGERS LIST */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {selectedType ? `${CHARGER_TYPES.find(t => t.id === selectedType)?.label} Stations Nearby` : 'All Nearby Chargers'}
            </p>
            {selectedType && (
              <button
                onClick={() => { setSelectedType(null); setExpandedCard(null); }}
                className="text-[9px] font-black text-green-500 uppercase"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredChargers.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-3xl text-center">
                <p className="text-sm font-bold text-gray-400">No stations found for this filter</p>
              </div>
            ) : filteredChargers.map((c, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-xs uppercase truncate">{c.station}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{c.type}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{c.power}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-[9px] font-bold text-gray-400">{c.distance}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  <div className={`px-2 py-0.5 rounded-full ${c.status === 'Available' ? 'bg-green-100' : 'bg-red-50'}`}>
                    <p className={`text-[8px] font-black uppercase ${c.status === 'Available' ? 'text-green-600' : 'text-red-400'}`}>
                      {c.status}
                    </p>
                  </div>
                  {c.slots > 0 && (
                    <p className="text-[8px] font-bold text-gray-400">{c.slots} free</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK TIP */}
        <div className="p-5 bg-gray-900 rounded-3xl">
          <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Pro Tip</p>
          <p className="text-xs font-bold text-white leading-relaxed">
            CCS2 chargers offer the fastest charging speeds in Kerala. Most modern EVs support both CCS2 and Type 2 standards.
          </p>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 z-[200]">
        <BottomNav active="charger" />
      </div>
    </div>
  );
};

export default ChargerScreen;
