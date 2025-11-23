import React, { useState, useEffect } from 'react';
import TripInfo from './components/TripInfo';
import ExpenseTracker from './components/ExpenseTracker';
import Assistant from './components/Assistant';
import { Companion, FlightInfo, HotelInfo, Expense, AppTab, AVATAR_COLORS } from './types';

// Mock Initial Data
const INITIAL_FLIGHT: FlightInfo = {
  flightNumber: 'JX800',
  departureTime: '10:40',
  arrivalTime: '14:00',
  terminal: 'T2',
  date: '2025/06/15'
};

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
  const [flight] = useState<FlightInfo>(INITIAL_FLIGHT);
  const [hotel, setHotel] = useState<HotelInfo>(INITIAL_HOTEL);
  const [companions, setCompanions] = useState<Companion[]>(INITIAL_COMPANIONS);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
    // Prevent removing self (id: 1) for demo logic safety
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
      Trip to: ${hotel.address}.
      Flight: ${flight.flightNumber} at ${flight.departureTime}.
      Companions: ${companions.map(c => c.name).join(', ')}.
      Total Expenses so far: ${expenses.reduce((s,e) => s + e.amount, 0)}.
    `;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Header */}
      <header className="bg-white pt-10 pb-4 px-6 sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
          Travel<span className="text-blue-500">Buddy</span>
        </h1>
        <p className="text-gray-400 text-xs mt-1 font-medium">日本東京之旅 (2025/06)</p>
      </header>

      {/* Main Content Area */}
      <main className="p-4 pb-28">
        {activeTab === AppTab.TRIP && (
          <TripInfo 
            flight={flight}
            hotel={hotel}
            companions={companions}
            onUpdateHotel={setHotel}
            onAddCompanion={handleAddCompanion}
            onRemoveCompanion={handleRemoveCompanion}
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

      {/* Bottom Navigation */}
      <nav className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 flex justify-between items-center z-20">
        <button 
          onClick={() => setActiveTab(AppTab.TRIP)}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === AppTab.TRIP ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <span className="text-xs font-bold">行程資訊</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(AppTab.EXPENSES)}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === AppTab.EXPENSES ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-xs font-bold">記帳分攤</span>
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.ASSISTANT)}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === AppTab.ASSISTANT ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
           <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           <span className="text-xs font-bold">AI 助手</span>
        </button>
      </nav>
    </div>
  );
};

export default App;