export enum AppScreen {
  ONBOARDING      = 'ONBOARDING',
  AUTH            = 'AUTH',
  HOME            = 'HOME',
  STATION_DETAIL  = 'STATION_DETAIL',
  BOOKING         = 'BOOKING',
  NAVIGATION      = 'NAVIGATION',
  CHARGING_STATUS = 'CHARGING_STATUS',
  PROFILE         = 'PROFILE',
  MY_VEHICLES     = 'MY_VEHICLES',
  QR_SCAN         = 'QR_SCAN',
  ADMIN           = 'ADMIN',
  CHARGER_LIST    = 'CHARGER_LIST'
}

export interface Charger {
  id: string; name: string; type: string; capacity: string; isAvailable: boolean;
}

export interface Station {
  id: string; name: string; address: string;
  lat: string; lng: string; distance: string; roadDistance?: string;
  cost: string; openingHours: string;
  coordinates: { lat: number; lng: number };
  chargers: Charger[];
  attractions: string | string[];
  imageUrl: string;
  source?: 'sheet' | 'ocm';
  connections?: any[];
  numSlots?: number;
}

export interface Vehicle {
  id: string; brand: string; model: string; trim: string;
  batteryLevel: number; chargingPort: string; imageUrl: string;
}

export interface Booking {
  id: string; stationId: string; stationName: string;
  date: string; startTime: string; endTime: string;
  duration: number; totalCost: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
}
