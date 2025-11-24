import React, { useState, useEffect } from 'react';
import TripInfo from './components/TripInfo';
import ExpenseTracker from './components/ExpenseTracker';
import Assistant from './components/Assistant';
import WeatherForecast from './components/WeatherForecast';
import Itinerary from './components/Itinerary';
import { 
  AppTab, 
  FlightInfo, 
  HotelInfo, 
  Companion, 
  Expense, 
  ItineraryItem,
  AVATAR_COLORS
} from './types';
import { getTripTitle } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INFO);
  
  // Trip Data
  const [tripTitle, setTripTitle] = useState('My Trip');
  const [location, setLocation] = useState('Japan');
  
  const [flights, setFlights] = useState<FlightInfo[]>([]);
  const [hotel, setHotel] = useState<HotelInfo>({
    name: '尚未設定飯店',
    address: '請點擊編輯設定地址',
    checkIn: '15:00',
    checkOut: '11:00',
    bookingRef: ''
  });
  
  const [companions, setCompanions] = useState<Companion[]>([
    { id: '1', name: 'Me', avatarColor: 'bg-blue-500' }
  ]);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);

  // Update Trip Title when flights change
  useEffect(() => {
    const updateTitle = async () => {
      if (flights.length > 0) {
        const info = await getTripTitle(flights);
        if (info) {
          setTripTitle(info.title);
          setLocation(info.location);
        }
      }
    };
    updateTitle();
  }, [flights]);

  // Leaflet Resource Injection (for Map View in Itinerary)
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    // Check if L is defined, if not, load the script
    if (!(window as any).L && !document.getElementById('leaflet-script')) {
      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handlers
  const handleAddCompanion = (name: string) => {
    const newCompanion: Companion = {
      id: Date.now().toString(),
      name,
      avatarColor: AVATAR_COLORS[companions.length % AVATAR_COLORS.length]
    };
    setCompanions([...companions, newCompanion]);
  };

  const handleRemoveCompanion = (id: string) => {
    setCompanions(companions.filter(c => c.id !== id));
  };

  // Context for Assistant
  const getContextData = () => {
    return JSON.stringify({
      trip: tripTitle,
      location,
      flights,
      hotel,
      companions: companions.map(c => c.name),
      itinerary: itineraryItems.map(i => `${i.date} ${i.time} ${i.title}`)
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      
      {/* Header */}
      <div className="bg-white pt-12 pb-6 px-6 shadow-sm rounded-b-[2.5rem] z-10 relative">
        <div className="flex justify-between items-start mb-2">
           <div>
             <h1 className="text-2xl font-black text-gray-800 leading-tight">{tripTitle}</h1>
             <p className="text-sm font-bold text-gray-400 mt-1 flex items-center gap-1">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               {location}
             </p>
           </div>
           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-lg">✈️</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        {activeTab === AppTab.INFO && (
          <TripInfo 
            flights={flights}
            onUpdateFlights={setFlights}
            hotel={hotel}
            onUpdateHotel={setHotel}
            companions={companions}
            onAddCompanion={handleAddCompanion}
            onRemoveCompanion={handleRemoveCompanion}
          />
        )}

        {activeTab === AppTab.ITINERARY && (
          <Itinerary 
            items={itineraryItems} 
            onUpdateItems={setItineraryItems}
            flights={flights}
          />
        )}

        {activeTab === AppTab.EXPENSES && (
          <ExpenseTracker 
            companions={companions}
            expenses={expenses}
            onAddExpense={(e) => setExpenses([...expenses, e])}
            onDeleteExpense={(id) => setExpenses(expenses.filter(e => e.id !== id))}
          />
        )}

        {activeTab === AppTab.WEATHER && (
          <WeatherForecast flights={flights} />
        )}

        {activeTab === AppTab.ASSISTANT && (
          <Assistant contextData={getContextData()} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[380px] bg-white rounded-full shadow-2xl p-2 flex justify-between items-center z-50 border border-gray-100">
         {[
           { id: AppTab.INFO, icon: '🎫', label: '資訊' },
           { id: AppTab.ITINERARY, icon: '📅', label: '行程' },
           { id: AppTab.EXPENSES, icon: '💰', label: '記帳' },
           { id: AppTab.WEATHER, icon: '🌤️', label: '天氣' },
           { id: AppTab.ASSISTANT, icon: '🤖', label: '助理' },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300 ${
               activeTab === tab.id ? 'bg-gray-800 text-white shadow-lg transform -translate-y-2' : 'text-gray-400 hover:bg-gray-50'
             }`}
           >
             <span className="text-xl mb-0.5">{tab.icon}</span>
             {activeTab === tab.id && <span className="text-[9px] font-bold">{tab.label}</span>}
           </button>
         ))}
      </div>

    </div>
  );
};

export default App;