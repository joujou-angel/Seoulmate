import React, { useState, useEffect } from 'react';
import TripInfo from './components/TripInfo';
import ExpenseTracker from './components/ExpenseTracker';
import Assistant from './components/Assistant';
import WeatherForecast from './components/WeatherForecast';
import { Companion, FlightInfo, HotelInfo, Expense, AppTab, AVATAR_COLORS } from './types';
import { getTripTitle } from './services/geminiService';

// Mock Initial Data
const INITIAL_FLIGHTS: FlightInfo[] = [
  {
    id: 'f1',
    type: 'departure',
    flightNumber: 'JX800',
    origin: 'TPE (Taipei)',
    destination: 'NRT (Tokyo)',
    departureTime: '10:40',
    arrivalTime: '14:00',
    terminal: 'T2',
    date: '2025/06/15'
  },
  {
    id: 'f2',
    type: 'return',
    flightNumber: 'JX801',
    origin: 'NRT (Tokyo)',
    destination: 'TPE (Taipei)',
    departureTime: '15:30',
    arrivalTime: '18:50',
    terminal: 'T1',
    date: '2025/06/20'
  }
];

const INITIAL_HOTEL: HotelInfo = {
  name: 'Shinjuku Washington Hotel',
  address: '3-2-9 Nishi-Shinjuku, Shinjuku-ku, Tokyo, Japan',
  checkIn: '15:00',
  checkOut: '11:00',
  bookingRef: 'RES-998877'
};

const INITIAL_COMPANIONS: Companion[] = [
  { id: '1', name: '我 (Me)', avatarColor: AVATAR_COLORS[0] },
  { id: '2', name: 'Alex', avatarColor: AVATAR_COLORS[1] },
  { id: '3', name: 'Jamie', avatarColor: AVATAR_COLORS[2] },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRIP);
  const [flights, setFlights] = useState<FlightInfo[]>(INITIAL_FLIGHTS);
  const [hotel, setHotel] = useState<HotelInfo>(INITIAL_HOTEL);
  const [companions, setCompanions] = useState<Companion[]>(INITIAL_COMPANIONS);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Trip Summary State
  const [tripHeader, setTripHeader] = useState("日本東京之旅 (2025/06)");
  const [tripLocation, setTripLocation] = useState("Tokyo, Japan");
  const [tripDateStr, setTripDateStr] = useState("2025/06");

  // Effect to update trip summary when flights change
  useEffect(() => {
    const updateSummary = async () => {
      if (flights.length > 0) {
        const summary = await getTripTitle(flights);
        if (summary) {
          setTripHeader(summary.title);
          setTripLocation(summary.location);
          
          // Extract date roughly
          const match = summary.title.match(/\((.*?)\)/);
          if (match) setTripDateStr(match[1]);
        }
      }
    };
    updateSummary();
  }, [flights]);

  // Helpers
  const handleAddCompanion = (name: string) => {
    const newComp: Companion = {
      id: Date.now().toString(),
      name,
      avatarColor: AVATAR_COLORS[companions.length % AVATAR_COLORS.length]
    };
    setCompanions([...companions, newComp]);
  };

  const handleRemoveCompanion = (id: string) => {
    if (id === '1') {
      alert("不能刪除自己");
      return;
    }
    setCompanions(companions.filter(c => c.id !== id));
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Build context string for AI assistant
  const getAiContext = () => {
    return `
      Trip to: ${hotel.address} or ${tripLocation}.
      Flights: ${flights.map(f => `${f.type}: ${f.flightNumber} (${f.date})`).join(', ')}.
      Companions: ${companions.map(c => c.name).join(', ')}.
      Total Expenses so far: ${expenses.reduce((s,e) => s + e.amount, 0)}.
    `;
  };

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfc] font-sans max-w-md mx-auto relative shadow-2xl text-gray-800 overflow-hidden">
      
      {/* Header - Fixed at top */}
      <header className="flex-none bg-white/90 pt-10 pb-4 px-6 z-10 backdrop-blur-md border-b border-gray-50">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
          Travel<span className="text-[#ffb7b2]">Buddy</span>
        </h1>
        <p className="text-gray-400 text-xs mt-1 font-bold tracking-widest uppercase truncate">{tripHeader}</p>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === AppTab.TRIP && (
          <TripInfo 
            flights={flights}
            onUpdateFlights={setFlights}
            hotel={hotel}
            companions={companions}
            onUpdateHotel={setHotel}
            onAddCompanion={handleAddCompanion}
            onRemoveCompanion={handleRemoveCompanion}
          />
        )}
        
        {activeTab === AppTab.WEATHER && (
          <WeatherForecast 
            location={tripLocation}
            tripDates={tripDateStr}
          />
        )}

        {activeTab === AppTab.EXPENSES && (
          <ExpenseTracker 
            companions={companions}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === AppTab.ASSISTANT && (
          <Assistant contextData={getAiContext()} />
        )}
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="flex-none px-4 pb-6 pt-2 bg-gradient-to-t from-[#fcfcfc] to-transparent">
        <nav className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-2 flex justify-between items-center">
          
          {/* Trip Tab - Map Icon - Peach */}
          <button 
            onClick={() => setActiveTab(AppTab.TRIP)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.TRIP 
                ? 'bg-[#FFDAC1] text-[#8a6a54] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeDasharray="2 2" />
            </svg>
            <span className="text-[10px] font-black tracking-wider">行程</span>
          </button>
          
          {/* Weather Tab - Sun Icon - Yellow */}
          <button 
            onClick={() => setActiveTab(AppTab.WEATHER)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.WEATHER 
                ? 'bg-[#FFF59D] text-[#F57F17] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span className="text-[10px] font-black tracking-wider">天氣</span>
          </button>

          {/* Expense Tab - Mint */}
          <button 
            onClick={() => setActiveTab(AppTab.EXPENSES)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.EXPENSES 
                ? 'bg-[#B5EAD7] text-[#4a7c72] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[10px] font-black tracking-wider">記帳</span>
          </button>

          {/* Assistant Tab - Lavender */}
          <button 
            onClick={() => setActiveTab(AppTab.ASSISTANT)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.ASSISTANT 
                ? 'bg-[#E2DBF5] text-[#6a5a9e] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
             <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             <span className="text-[10px] font-black tracking-wider">助手</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;