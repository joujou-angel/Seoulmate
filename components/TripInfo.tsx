import React, { useState } from 'react';
import { FlightInfo, HotelInfo, Companion } from '../types';
import { predictFlightDetails } from '../services/geminiService';

interface TripInfoProps {
  flights: FlightInfo[];
  onUpdateFlights: (flights: FlightInfo[]) => void;
  hotel: HotelInfo;
  companions: Companion[];
  onUpdateHotel: (hotel: HotelInfo) => void;
  onAddCompanion: (name: string) => void;
  onRemoveCompanion: (id: string) => void;
}

const TripInfo: React.FC<TripInfoProps> = ({ 
  flights, 
  onUpdateFlights,
  hotel, 
  companions, 
  onUpdateHotel,
  onAddCompanion,
  onRemoveCompanion
}) => {
  const [showTaxiCard, setShowTaxiCard] = useState(false);
  const [newCompanionName, setNewCompanionName] = useState('');
  const [isEditingHotel, setIsEditingHotel] = useState(false);
  
  // Flight Editing State
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  const [tempFlight, setTempFlight] = useState<FlightInfo | null>(null);
  const [isPredictingFlight, setIsPredictingFlight] = useState(false);

  // Local state for editing form
  const [tempHotel, setTempHotel] = useState<HotelInfo>(hotel);

  const handleAddCompanion = () => {
    if (newCompanionName.trim()) {
      onAddCompanion(newCompanionName.trim());
      setNewCompanionName('');
    }
  };

  const saveHotel = () => {
    onUpdateHotel(tempHotel);
    setIsEditingHotel(false);
  };

  const startEditFlight = (flight: FlightInfo) => {
    setTempFlight({...flight});
    setEditingFlightId(flight.id);
  };

  const saveFlight = async () => {
    if (tempFlight) {
      let finalFlight = { ...tempFlight };

      // Auto-fill origin/dest if missing and flight number exists
      if (finalFlight.flightNumber && (!finalFlight.origin || !finalFlight.destination)) {
        setIsPredictingFlight(true);
        const prediction = await predictFlightDetails(finalFlight.flightNumber);
        if (prediction) {
          finalFlight.origin = finalFlight.origin || prediction.origin;
          finalFlight.destination = finalFlight.destination || prediction.destination;
        }
        setIsPredictingFlight(false);
      }

      const updatedFlights = flights.map(f => f.id === tempFlight.id ? finalFlight : f);
      onUpdateFlights(updatedFlights);
      setEditingFlightId(null);
      setTempFlight(null);
    }
  };

  const deleteFlight = (id: string) => {
    onUpdateFlights(flights.filter(f => f.id !== id));
  };

  const addNewFlight = () => {
    const newId = Date.now().toString();
    const newFlight: FlightInfo = {
      id: newId,
      type: flights.length === 0 ? 'departure' : 'other', 
      flightNumber: '',
      bookingRef: '',
      origin: '',
      destination: '',
      departureTime: '00:00',
      arrivalTime: '00:00',
      terminal: '',
      date: '2025/01/01'
    };
    const updated = [...flights, newFlight];
    onUpdateFlights(updated);
    setTempFlight(newFlight);
    setEditingFlightId(newId);
  };

  const getFlightLabel = (type: string) => {
    switch (type) {
      case 'departure': return '去程航班';
      case 'return': return '回程航班';
      default: return '轉機/其他航班';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Flight Section - Pastel Blue */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#A0C4FF]/30 overflow-hidden">
        <div className="bg-[#A0C4FF] px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            航班資訊
          </h2>
          <button onClick={addNewFlight} className="text-white bg-white/20 hover:bg-white/30 p-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            新增
          </button>
        </div>
        
        <div className="p-2 space-y-2">
          {flights.length === 0 && (
             <div className="text-center text-gray-400 py-6 text-sm">目前沒有航班資料</div>
          )}

          {flights.map((flight) => {
            const isEditing = editingFlightId === flight.id;
            
            if (isEditing && tempFlight) {
              return (
                <div key={flight.id} className="bg-gray-50 p-4 rounded-2xl border border-[#A0C4FF] space-y-3 m-2 relative">
                   {isPredictingFlight && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                       <span className="text-[#8bb4f7] font-bold text-sm animate-pulse">AI 分析航班中...</span>
                     </div>
                   )}
                   <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">類型</label>
                        <select 
                          value={tempFlight.type}
                          onChange={e => setTempFlight({...tempFlight, type: e.target.value as any})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        >
                          <option value="departure">去程</option>
                          <option value="return">回程</option>
                          <option value="other">轉機/其他</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">日期</label>
                        <input 
                          type="text"
                          placeholder="YYYY/MM/DD"
                          value={tempFlight.date}
                          onChange={e => setTempFlight({...tempFlight, date: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-xs font-bold text-gray-400">班機代號</label>
                         <input 
                          type="text"
                          placeholder="例如 JX800"
                          value={tempFlight.flightNumber}
                          onChange={e => setTempFlight({...tempFlight, flightNumber: e.target.value.toUpperCase()})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                         <label className="text-xs font-bold text-gray-400">訂位代碼</label>
                         <input 
                          type="text"
                          placeholder="PNR"
                          value={tempFlight.bookingRef || ''}
                          onChange={e => setTempFlight({...tempFlight, bookingRef: e.target.value.toUpperCase()})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                      <div className="w-1/4">
                         <label className="text-xs font-bold text-gray-400">航廈</label>
                         <input 
                          type="text"
                          value={tempFlight.terminal}
                          onChange={e => setTempFlight({...tempFlight, terminal: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                   </div>
                   
                   {/* Origin / Dest Inputs */}
                   <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">出發地</label>
                        <input 
                          type="text"
                          placeholder="(自動)"
                          value={tempFlight.origin || ''}
                          onChange={e => setTempFlight({...tempFlight, origin: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                      <span className="text-gray-300 mb-2">→</span>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">目的地</label>
                        <input 
                          type="text"
                          placeholder="(自動)"
                          value={tempFlight.destination || ''}
                          onChange={e => setTempFlight({...tempFlight, destination: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                   </div>

                   <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">出發時間</label>
                        <input 
                          type="text"
                          placeholder="HH:MM"
                          value={tempFlight.departureTime}
                          onChange={e => setTempFlight({...tempFlight, departureTime: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold text-[#8bb4f7]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">抵達時間</label>
                        <input 
                          type="text"
                          placeholder="HH:MM"
                          value={tempFlight.arrivalTime}
                          onChange={e => setTempFlight({...tempFlight, arrivalTime: e.target.value})}
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold text-[#8bb4f7]"
                        />
                      </div>
                   </div>
                   <div className="flex gap-2 pt-2">
                     <button onClick={saveFlight} className="flex-1 bg-[#A0C4FF] text-white py-2 rounded-xl text-sm font-bold">儲存</button>
                     <button onClick={() => {
                         if(!flight.flightNumber && flight.departureTime === '00:00') {
                           deleteFlight(flight.id); 
                         } else {
                           setEditingFlightId(null);
                           setTempFlight(null);
                         }
                     }} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-bold">取消</button>
                   </div>
                </div>
              );
            }

            return (
              <div key={flight.id} className="bg-white rounded-2xl p-4 hover:bg-blue-50 transition-colors relative group border border-gray-100">
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditFlight(flight)} className="p-1 text-[#8bb4f7] hover:bg-blue-100 rounded-md">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => deleteFlight(flight.id)} className="p-1 text-red-300 hover:bg-red-50 rounded-md">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                    flight.type === 'departure' ? 'bg-[#A0C4FF] text-white' : 
                    flight.type === 'return' ? 'bg-[#ffb7b2] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {getFlightLabel(flight.type)}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{flight.date}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-700">{flight.flightNumber}</span>
                    {(flight.origin || flight.destination) && (
                      <span className="text-xs text-gray-400 font-bold">{flight.origin} → {flight.destination}</span>
                    )}
                  </div>
                  <div className="text-right">
                     {flight.bookingRef && (
                       <span className="block text-xs font-bold text-[#8bb4f7] mb-1 bg-blue-50 px-2 py-1 rounded">訂位代碼: {flight.bookingRef}</span>
                     )}
                     <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-lg">航廈 {flight.terminal}</span>
                  </div>
                  <div className="col-span-2 flex justify-between items-center mt-1">
                     <div>
                       <p className="text-xl font-black text-[#8bb4f7]">{flight.departureTime}</p>
                     </div>
                     <div className="flex-1 px-3 flex flex-col items-center">
                       <div className="w-full h-0.5 bg-gray-100 relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1">
                            <svg className="w-4 h-4 text-gray-300 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409 8.729 8.729 0 014.722-1.391 8.736 8.736 0 014.723 1.391 1 1 0 001.168-1.409l-7-14z" /></svg>
                         </div>
                       </div>
                     </div>
                     <div>
                       <p className="text-xl font-black text-[#8bb4f7]">{flight.arrivalTime}</p>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hotel Section - Pastel Peach/Orange */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#FFDAC1]/50 overflow-hidden">
        <div className="bg-[#FFDAC1] px-6 py-4 flex justify-between items-center">
          <h2 className="text-[#8a6a54] text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            住宿資訊
          </h2>
          <button 
            onClick={() => setIsEditingHotel(!isEditingHotel)}
            className="text-[#8a6a54] hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
        
        {isEditingHotel ? (
          <div className="p-6 space-y-4">
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">飯店名稱</label>
               <input 
                 type="text" 
                 value={tempHotel.name}
                 onChange={(e) => setTempHotel({...tempHotel, name: e.target.value})}
                 className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">地址 (英文)</label>
               <input 
                 type="text" 
                 value={tempHotel.address}
                 onChange={(e) => setTempHotel({...tempHotel, address: e.target.value})}
                 className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">地址 (當地語言/原文)</label>
               <input 
                 type="text" 
                 placeholder="例如: 東京都新宿区西新宿3-2-9"
                 value={tempHotel.originalAddress || ''}
                 onChange={(e) => setTempHotel({...tempHotel, originalAddress: e.target.value})}
                 className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
               />
             </div>
             <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-600 mb-1">電話</label>
                    <input 
                        type="text" 
                        value={tempHotel.phone || ''}
                        onChange={(e) => setTempHotel({...tempHotel, phone: e.target.value})}
                        className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-600 mb-1">訂房代碼</label>
                    <input 
                        type="text" 
                        value={tempHotel.bookingRef}
                        onChange={(e) => setTempHotel({...tempHotel, bookingRef: e.target.value})}
                        className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
                    />
                </div>
             </div>
             <div className="flex gap-2">
               <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">入住時間</label>
                  <input 
                    type="text" 
                    value={tempHotel.checkIn}
                    onChange={(e) => setTempHotel({...tempHotel, checkIn: e.target.value})}
                    className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
                  />
               </div>
               <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">退房時間</label>
                  <input 
                    type="text" 
                    value={tempHotel.checkOut}
                    onChange={(e) => setTempHotel({...tempHotel, checkOut: e.target.value})}
                    className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
                  />
               </div>
             </div>

             <div className="flex gap-2 pt-2">
                <button onClick={saveHotel} className="flex-1 bg-[#FFDAC1] text-[#8a6a54] py-3 rounded-xl font-bold hover:bg-[#ffcfb0] transition-colors">儲存</button>
                <button onClick={() => setIsEditingHotel(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">取消</button>
             </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-black text-gray-800 mb-2 leading-tight">{hotel.name}</h3>
            {hotel.originalAddress && <p className="text-gray-800 font-bold text-sm mb-1">{hotel.originalAddress}</p>}
            <p className="text-gray-500 mb-4 text-sm">{hotel.address}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t border-dashed border-gray-200 pt-4 mb-5">
               <div>
                 <span className="block font-bold text-gray-400 text-[10px] uppercase">Booking Ref</span>
                 <span className="text-gray-800 font-bold">{hotel.bookingRef}</span>
               </div>
               <div>
                 <span className="block font-bold text-gray-400 text-[10px] uppercase">Phone</span>
                 <span className="text-gray-800 font-bold">{hotel.phone || '--'}</span>
               </div>
               <div>
                 <span className="block font-bold text-gray-700 mb-1">入住</span>
                 <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{hotel.checkIn}</span>
               </div>
               <div>
                 <span className="block font-bold text-gray-700 mb-1">退房</span>
                 <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{hotel.checkOut}</span>
               </div>
            </div>

            <button 
              onClick={() => setShowTaxiCard(true)}
              className="w-full bg-[#8a6a54] hover:bg-[#6d5341] text-[#FFDAC1] py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              給司機看
            </button>
          </div>
        )}
      </div>

      {/* Taxi Card Modal - Simple Display */}
      {showTaxiCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setShowTaxiCard(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative animate-fade-in shadow-2xl flex flex-col items-center justify-center min-h-[50vh]" onClick={e => e.stopPropagation()}>
             <button onClick={() => setShowTaxiCard(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 bg-gray-100 rounded-full p-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             
             <div className="text-center space-y-8 w-full">
               <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Hotel Name</p>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">{hotel.name}</h2>
               </div>
               
               <div className="w-full h-px bg-gray-200"></div>

               {/* Priority to Original Address */}
               <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Address</p>
                  {hotel.originalAddress && (
                     <p className="text-2xl font-black text-gray-900 leading-relaxed mb-2">{hotel.originalAddress}</p>
                  )}
                  <p className="text-md font-medium text-gray-500 leading-relaxed">{hotel.address}</p>
               </div>
             </div>

             <div className="mt-10 bg-[#FFDAC1] px-6 py-2 rounded-full text-[#8a6a54] text-xs font-bold">
                Please take me here
             </div>
          </div>
        </div>
      )}

      {/* Companions Section - Pastel Mint */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#B5EAD7]/50 p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#7dbfb3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          旅伴管理
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {companions.map(companion => (
            <div key={companion.id} className="flex items-center gap-2 bg-[#F0FAF7] px-4 py-2 rounded-2xl border border-[#B5EAD7]">
              <div className={`w-8 h-8 rounded-full ${companion.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                {companion.name.charAt(0)}
              </div>
              <span className="font-bold text-[#5a8c82]">{companion.name}</span>
              <button onClick={() => onRemoveCompanion(companion.id)} className="text-[#B5EAD7] hover:text-red-400 ml-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="新增旅伴名字..." 
            className="flex-1 border-gray-100 rounded-2xl shadow-sm focus:border-[#B5EAD7] focus:ring-[#B5EAD7] border p-3 bg-gray-50"
            value={newCompanionName}
            onChange={(e) => setNewCompanionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCompanion()}
          />
          <button 
            onClick={handleAddCompanion}
            className="bg-[#B5EAD7] text-[#4a7c72] px-6 rounded-2xl hover:bg-[#a3e0c9] transition-colors font-bold shadow-sm"
          >
            新增
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3 ml-2">* 這些旅伴會同步到記帳功能中</p>
      </div>
    </div>
  );
};

export default TripInfo;