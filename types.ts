export interface Companion {
  id: string;
  name: string;
  avatarColor: string;
}

export interface FlightInfo {
  id: string;
  type: 'departure' | 'return' | 'other';
  flightNumber: string;
  bookingRef?: string; // New: Booking Reference (訂位代碼)
  origin?: string;      // e.g. TPE
  destination?: string; // e.g. NRT
  departureTime: string;
  arrivalTime: string;
  terminal: string;
  date: string;
}

export interface HotelInfo {
  name: string;
  address: string;
  originalAddress?: string; // New: Address in local language
  phone?: string;           // New: Phone number
  checkIn: string;
  checkOut: string;
  bookingRef: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  involvedIds: string[]; // IDs of people splitting this cost
  date: string;
  category: 'food' | 'transport' | 'stay' | 'shopping' | 'other';
}

export interface DailyWeather {
  date: string;
  weather: string;
  temp: string;
}

export interface ItineraryItem {
  id: string;
  date: string; // YYYY/MM/DD
  time: string; // HH:MM
  title: string;
  category: 'flight' | 'transport' | 'food' | 'sightseeing' | 'stay' | 'other';
  description?: string;
  isReserved?: boolean;
  location?: string;
}

export enum AppTab {
  INFO = 'INFO',       // Renamed from TRIP
  ITINERARY = 'ITINERARY', // New Tab
  EXPENSES = 'EXPENSES',
  WEATHER = 'WEATHER',
  ASSISTANT = 'ASSISTANT'
}

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#F87171',      // Red 400
  transport: '#60A5FA', // Blue 400
  stay: '#34D399',      // Emerald 400
  shopping: '#A78BFA',  // Violet 400
  other: '#9CA3AF'      // Gray 400
};

export const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
];