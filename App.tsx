import Papa from 'papaparse';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { AppScreen, Station, Vehicle, Booking } from './types';
import Onboarding      from './screens/Onboarding';
import Auth            from './screens/Auth';
import Home            from './screens/Home';
import StationDetail   from './screens/StationDetail';
import BookingFlow     from './screens/BookingFlow';
import ActiveCharging  from './screens/ActiveCharging';
import Profile         from './screens/Profile';
import MyVehicles      from './screens/MyVehicles';
import NavigationScreen from './screens/NavigationScreen';
import QRScanner       from './screens/QRScanner';
import AdminDashboard  from './screens/AdminDashboard';
import ChargerScreen   from './screens/ChargerScreen';
import { AuthProvider } from './services/AuthContext';
import { KERALA_DUMMY_STATIONS } from './constants';

interface AppContextType {
  currentScreen: AppScreen;
  setScreen: (s: AppScreen) => void;
  selectedStation: any | null;
  setSelectedStation: (s: any) => void;
  stations: any[];
  setStations: (s: any[]) => void;
  users: any[];
  userVehicles: Vehicle[];
  setUserVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  activeSession: any;
  setActiveSession: (s: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

const STATIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQP8ltJjZf-_drm11Ngn7pPDoYxY-tT1OitG-Ovriu6sWM3c_u6XWfPTFnZ2eyWrheCAU6YwL9xww7G/pub?gid=0&single=true&output=csv";
const USERS_CSV    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWebti2OB0bkqFZ0GJ01CGozsobfQXSomorofw4LMvOLrXKtHsj9chjoLvkSRyeJkYQKJoBvMEGiL9/pub?gid=868149118&single=true&output=csv";
const OCM_KEY      = "82a1e1da-0000-47e4-b391-3364aac2f867";

const App: React.FC = () => {
  const [currentScreen, setScreen]         = useState<AppScreen>(AppScreen.ONBOARDING);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [userVehicles, setUserVehicles]    = useState<Vehicle[]>([]);
  const [bookings, setBookings]            = useState<Booking[]>([]);
  const [activeSession, setActiveSession]  = useState<any>(null);
  const [stations, setStations]            = useState<any[]>([]);
  const [users, setUsers]                  = useState<any[]>([]);

  useEffect(() => {
    // Load sheet stations
    Papa.parse(STATIONS_CSV, {
      download: true, header: true, skipEmptyLines: true,
      complete: async (r) => {
        const sheet = (r.data as any[])
          .filter(s => s.lat && s.lng)
          .map(s => ({ ...s, source: 'sheet', numSlots: Number(s.numSlots||s.numslots||1) }));
        try {
          const ocmRes  = await fetch(`https://api.openchargemap.io/v3/poi/?key=${OCM_KEY}&latitude=10.8302&longitude=76.0234&distance=50&countrycode=IN&compact=false&verbose=false`);
          const ocmData = await ocmRes.json();
          const ocm = ocmData.map((poi: any) => ({
            id: `ocm-${poi.ID}`, name: poi.AddressInfo.Title,
            address: poi.AddressInfo.AddressLine1,
            lat: String(poi.AddressInfo.Latitude), lng: String(poi.AddressInfo.Longitude),
            connections: poi.Connections || [], numSlots: poi.Connections?.length || 0,
            source: 'ocm', isPublic: true
          }));
          setStations([...KERALA_DUMMY_STATIONS, ...sheet, ...ocm]);
        } catch { setStations([...KERALA_DUMMY_STATIONS, ...sheet]); }
      }
    });

    // Load users (normalise all keys to lowercase)
    Papa.parse(USERS_CSV, {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => {
        const norm = (r.data as any[]).map(u => {
          const n: any = {};
          Object.keys(u).forEach(k => { n[k.toLowerCase().replace(/[\s_]/g,'')] = u[k]; });
          return n;
        });
        setUsers(norm);
      }
    });
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.ONBOARDING:       return <Onboarding />;
      case AppScreen.AUTH:             return <Auth />;
      case AppScreen.HOME:             return <Home />;
      case AppScreen.STATION_DETAIL:   return <StationDetail />;
      case AppScreen.BOOKING:          return <BookingFlow />;
      case AppScreen.CHARGING_STATUS:  return <ActiveCharging />;
      case AppScreen.PROFILE:          return <Profile />;
      case AppScreen.MY_VEHICLES:      return <MyVehicles />;
      case AppScreen.NAVIGATION:       return <NavigationScreen />;
      case AppScreen.QR_SCAN:          return <QRScanner />;
      case AppScreen.ADMIN:            return <AdminDashboard />;
      case AppScreen.CHARGER_LIST:     return <ChargerScreen />;
      default:                         return <Home />;
    }
  };

  return (
    <AuthProvider>
      <AppContext.Provider value={{
        currentScreen, setScreen,
        selectedStation, setSelectedStation,
        stations, setStations,
        users, userVehicles, setUserVehicles,
        bookings, setBookings,
        activeSession, setActiveSession
      }}>
        <div className="max-w-md mx-auto h-screen bg-white relative overflow-hidden shadow-2xl">
          {renderScreen()}
        </div>
      </AppContext.Provider>
    </AuthProvider>
  );
};

export default App;
