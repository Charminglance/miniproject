
import { Station, Vehicle } from './types';

export const COLORS = {
  primary: '#22C55E',
  secondary: '#4ADE80',
  accent: '#16A34A',
  background: '#F8FAFC',
};

export const MOCK_STATIONS: Station[] = [
  {
    id: '1',
    name: 'Pulse Station',
    address: '1901 Thornridge Cir. Shiloh, Hawaii 81063',
    distance: '4.5 km',
    cost: '$15.00 / hour',
    openingHours: 'Open 24 hours',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    chargers: [
      { id: 'c1', name: 'Charger A', type: 'AC type-2', capacity: '60KW', isAvailable: true },
      { id: 'c2', name: 'Charger B', type: 'CSS-2', capacity: '60KW', isAvailable: true },
    ],
    // Correcting property name from 'amenities' to 'attractions' to match Station type definition
    attractions: ['WiFi', 'Gym', 'Park', 'Parking'],
    imageUrl: 'https://picsum.photos/seed/pulse/800/400'
  },
  {
    id: '2',
    name: 'Greenspeed Station',
    address: '4140 Parker Rd. Allentown, New Mexico 31134',
    distance: '2.5 km',
    cost: '$12.00 / hour',
    openingHours: '08:00 AM - 10:00 PM',
    coordinates: { lat: 37.7849, lng: -122.4094 },
    chargers: [
      { id: 'c3', name: 'Charger A', type: 'AC type-2', capacity: '50KW', isAvailable: true },
      { id: 'c4', name: 'Charger B', type: 'DC Fast', capacity: '120KW', isAvailable: false },
    ],
    // Correcting property name from 'amenities' to 'attractions' to match Station type definition
    attractions: ['Cafe', 'WiFi', 'Parking'],
    imageUrl: 'https://picsum.photos/seed/green/800/400'
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    batteryLevel: 50,
    chargingPort: 'Type-2, CCS-2',
    imageUrl: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=1000&auto=format&fit=crop'
  }
];

export const ONBOARDING_SLIDES = [
  {
    title: "Get your smart life with smart bike",
    description: "The future of transportation is electric, and we're here to help you get there.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop"
  },
  {
    title: "The perfect solution for long road trips",
    description: "The future of transportation is electric, and we're here to help you get there.",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000&auto=format&fit=crop"
  },
  {
    title: "We're here to help you power your journey",
    description: "The future of transportation is electric, and we're here to help you get there.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop"
  }
];