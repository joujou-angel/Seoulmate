import React, { useState } from 'react';
import TripInfo from './components/TripInfo';
import ExpenseTracker from './components/ExpenseTracker';
import Assistant from './components/Assistant';
import WeatherForecast from './components/WeatherForecast';
import Itinerary from './components/Itinerary';
import { Companion, FlightInfo, HotelInfo, Expense, AppTab, AVATAR_COLORS, ItineraryItem } from './types';

// Mock Initial Data
const INITIAL_FLIGHTS: FlightInfo[] = [
  {
    id: 'f1',
    type: 'departure',
    flightNumber: 'JX800',
    bookingRef: '6X2P9A',
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
    bookingRef: '6X2P9A',
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
  originalAddress: '東京都新宿区西新宿3-2-9',
  phone: '+81-3-3343-3111',
  checkIn: '15:00',
  checkOut: '11:00',
  bookingRef: 'RES-998877'
};

const INITIAL_COMPANIONS: Companion[] = [
  { id: '1', name: '我 (Me)', avatarColor: AVATAR_COLORS[0] },
  { id: '2', name: 'Alex', avatarColor: AVATAR_COLORS[1] },
  { id: '3', name: 'Jamie', avatarColor: AVATAR_COLORS[2] },
];

const INITIAL_ITINERARY: ItineraryItem[] = [
  {
    id: 'i1',
    date: '2025/06/15',
    time: '07:30',
    title: '出發 (JX800)',
    category: 'flight',
    description: '【啟程資訊】搭乘星宇航空 JX800 班機，預計從台北桃園 (TPE) 直飛東京成田 (NRT)。',
    isReserved: true
  },
  {
    id: 'i2',
    date: '2025/06/15',
    time: '14:00',
    title: '抵達東京 & 取車',
    category: 'transport',
    description: '【接駁位置】領完行李出關後，請往左手邊走，尋找「レンタカー (Rent a Car)」的綜合櫃檯。',
    isReserved: true,
    location: 'Narita Airport T2'
  },
  {
    id: 'i3',
    date: '2025/06/15',
    time: '16:30',
    title: 'Check-in 飯店',
    category: 'stay',
    description: '前往新宿華盛頓飯店辦理入住手續，放置行李。',
    location: 'Shinjuku Washington Hotel'
  },
  {
    id: 'i4',
    date: '2025/06/15',
    time: '18:00',
    title: '晚餐：燒肉敘敘苑',
    category: 'food',
    description: '享受東京著名的高級燒肉，欣賞新宿夜景。',
    isReserved: true,
    location: 'Opera City 53F'
  },
  {
    id: 'i5',
    date: '2025/06/16',
    time: '09:00',
    title: '淺草寺參拜',
    category: 'sightseeing',
    description: '參觀雷門，仲見世通商店街吃人形燒。',
    location: 'Asakusa'
  },
   {
    id: 'i6',
    date: '2025/06/16',
    time: '13:00',
    title: '午餐：淺草今半',
    category: 'food',
    description: '百年老店壽喜燒。',
    isReserved: true
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INFO);
  const [flights, setFlights] = useState<FlightInfo[]>(INITIAL_FLIGHTS);
  const [hotel, setHotel] = useState<HotelInfo>(INITIAL_HOTEL);
  const [companions, setCompanions] = useState<Companion[]>(INITIAL_COMPANIONS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>(INITIAL_ITINERARY);

  // Trip Summary State (Manual Input)
  const [tripHeader, setTripHeader] = useState("我的旅行");
  const [tripLocation, setTripLocation] = useState("Tokyo, Japan");
  const [tripDateStr, setTripDateStr] = useState("2025/06");
  
  const [isEditingHeader, setIsEditingHeader] = useState(false);

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
      Trip: ${tripHeader} to ${tripLocation} (${tripDateStr}).
      Accommodation: ${hotel.name} at ${hotel.address}.
      Flights: ${flights.map(f => `${f.type}: ${f.flightNumber} (${f.date})`).join(', ')}.
      Companions: ${companions.map(c => c.name).join(', ')}.
      Total Expenses so far: ${expenses.reduce((s,e) => s + e.amount, 0)}.
      Itinerary items: ${itineraryItems.length}.
    `;
  };

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfc] font-sans max-w-md mx-auto relative shadow-2xl text-gray-800 overflow-hidden">
      
      {/* Header - Fixed at top with Manual Edit Mode */}
      <header className="flex-none bg-white/90 pt-10 pb-4 px-6 z-10 backdrop-blur-md border-b border-gray-50">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
          Travel<span className="text-[#ffb7b2]">Buddy</span>
        </h1>
        
        {isEditingHeader ? (
          <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase">旅程名稱</label>
                 <input 
                   type="text" 
                   value={tripHeader} 
                   onChange={(e) => setTripHeader(e.target.value)}
                   className="w-full text-sm font-bold bg-white border border-gray-200 rounded px-2 py-1"
                 />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase">日期</label>
                 <input 
                   type="text" 
                   value={tripDateStr} 
                   onChange={(e) => setTripDateStr(e.target.value)}
                   className="w-full text-sm font-bold bg-white border border-gray-200 rounded px-2 py-1"
                 />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">地點 (用於天氣)</label>
               <input 
                 type="text" 
                 value={tripLocation} 
                 onChange={(e) => setTripLocation(e.target.value)}
                 placeholder="例如: Tokyo, Japan"
                 className="w-full text-sm font-bold bg-white border border-gray-200 rounded px-2 py-1"
               />
            </div>
            <button 
              onClick={() => setIsEditingHeader(false)}
              className="w-full bg-[#ffb7b2] text-white text-xs font-bold py-2 rounded-lg mt-1"
            >
              完成編輯
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-1 group">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase truncate max-w-[85%]">
              {tripHeader} ({tripDateStr})
            </p>
            <button 
              onClick={() => setIsEditingHeader(true)}
              className="p-1 text-gray-300 hover:text-[#ffb7b2] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === AppTab.INFO && (
          <div className="p-4">
            <TripInfo 
              flights={flights}
              onUpdateFlights={setFlights}
              hotel={hotel}
              companions={companions}
              onUpdateHotel={setHotel}
              onAddCompanion={handleAddCompanion}
              onRemoveCompanion={handleRemoveCompanion}
            />
          </div>
        )}

        {activeTab === AppTab.ITINERARY && (
          <Itinerary 
            items={itineraryItems}
            onUpdateItems={setItineraryItems}
            flights={flights}
          />
        )}
        
        {activeTab === AppTab.WEATHER && (
          <div className="p-4">
            <WeatherForecast 
              flights={flights}
              location={tripLocation}
            />
          </div>
        )}

        {activeTab === AppTab.EXPENSES && (
          <div className="p-4">
            <ExpenseTracker 
              companions={companions}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        )}

        {activeTab === AppTab.ASSISTANT && (
          <div className="p-4">
            <Assistant contextData={getAiContext()} />
          </div>
        )}
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="flex-none px-4 pb-6 pt-2 bg-gradient-to-t from-[#fcfcfc] to-transparent">
        <nav className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-2 flex justify-between items-center">
          
          {/* Info Tab (Was Trip) - Peach */}
          <button 
            onClick={() => setActiveTab(AppTab.INFO)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.INFO 
                ? 'bg-[#FFDAC1] text-[#8a6a54] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            <span className="text-[10px] font-black tracking-wider">資訊</span>
          </button>

          {/* Itinerary Tab (New) - Blue */}
          <button 
            onClick={() => setActiveTab(AppTab.ITINERARY)}
            className={`flex-1 flex flex-col items-center py-4 px-2 rounded-3xl transition-all duration-300 ${
              activeTab === AppTab.ITINERARY 
                ? 'bg-[#A0C4FF] text-[#425a80] shadow-sm transform -translate-y-1' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
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