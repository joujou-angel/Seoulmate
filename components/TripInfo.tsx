import React, { useState } from 'react';
import { FlightInfo, HotelInfo, Companion } from '../types';
import { generateTaxiCard } from '../services/geminiService';

interface TripInfoProps {
  flight: FlightInfo;
  hotel: HotelInfo;
  companions: Companion[];
  onUpdateHotel: (hotel: HotelInfo) => void;
  onAddCompanion: (name: string) => void;
  onRemoveCompanion: (id: string) => void;
}

const TripInfo: React.FC<TripInfoProps> = ({ 
  flight, 
  hotel, 
  companions, 
  onUpdateHotel,
  onAddCompanion,
  onRemoveCompanion
}) => {
  const [taxiCard, setTaxiCard] = useState<string | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [newCompanionName, setNewCompanionName] = useState('');
  const [isEditingHotel, setIsEditingHotel] = useState(false);

  // Local state for editing form
  const [tempHotel, setTempHotel] = useState<HotelInfo>(hotel);

  const handleGenerateCard = async () => {
    setIsLoadingCard(true);
    const cardContent = await generateTaxiCard(hotel);
    setTaxiCard(cardContent);
    setIsLoadingCard(false);
  };

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

  return (
    <div className="space-y-6 pb-20">
      {/* Flight Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            航班資訊
          </h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">航班號碼</p>
            <p className="text-xl font-bold text-gray-800">{flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">日期</p>
            <p className="text-lg font-medium text-gray-800">{flight.date}</p>
          </div>
          <div className="col-span-2 border-t border-gray-100 my-2 pt-2 flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{flight.departureTime}</p>
              <p className="text-xs text-gray-500">出發</p>
            </div>
            <div className="flex-1 px-4 flex flex-col items-center">
               <div className="w-full h-0.5 bg-gray-300 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 p-1">
                    <svg className="w-4 h-4 text-gray-400 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409 8.729 8.729 0 014.722-1.391 8.736 8.736 0 014.723 1.391 1 1 0 001.168-1.409l-7-14z" /></svg>
                 </div>
               </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{flight.arrivalTime}</p>
              <p className="text-xs text-gray-500">抵達</p>
            </div>
          </div>
          <div className="col-span-2 text-center bg-blue-50 py-2 rounded-lg mt-2">
            <span className="text-blue-800 font-medium">航廈: {flight.terminal}</span>
          </div>
        </div>
      </div>

      {/* Hotel Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="bg-orange-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            住宿資訊
          </h2>
          <button 
            onClick={() => setIsEditingHotel(!isEditingHotel)}
            className="text-white hover:bg-orange-600 p-1 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
        
        {isEditingHotel ? (
          <div className="p-6 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">飯店名稱</label>
               <input 
                 type="text" 
                 value={tempHotel.name}
                 onChange={(e) => setTempHotel({...tempHotel, name: e.target.value})}
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">地址</label>
               <input 
                 type="text" 
                 value={tempHotel.address}
                 onChange={(e) => setTempHotel({...tempHotel, address: e.target.value})}
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
               />
             </div>
             <div className="flex gap-2">
                <button onClick={saveHotel} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium">儲存</button>
                <button onClick={() => setIsEditingHotel(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">取消</button>
             </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
            <p className="text-gray-600 mb-4">{hotel.address}</p>
            
            <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3 mb-4">
               <div>
                 <span className="block font-medium text-gray-900">入住</span>
                 {hotel.checkIn}
               </div>
               <div className="text-right">
                 <span className="block font-medium text-gray-900">退房</span>
                 {hotel.checkOut}
               </div>
            </div>

            <button 
              onClick={handleGenerateCard}
              disabled={isLoadingCard}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isLoadingCard ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              )}
              給司機看 (AI 產生卡片)
            </button>
          </div>
        )}
      </div>

      {/* Taxi Card Modal/Display */}
      {taxiCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setTaxiCard(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm max-h-[80vh] overflow-y-auto relative animate-fade-in" onClick={e => e.stopPropagation()}>
             <button onClick={() => setTaxiCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="text-center mb-4">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Driver Card</span>
             </div>
             <div className="prose prose-lg text-gray-800 whitespace-pre-wrap leading-relaxed font-serif text-center text-xl">
               {taxiCard}
             </div>
             <p className="text-center text-gray-400 text-sm mt-6">點擊背景關閉</p>
          </div>
        </div>
      )}

      {/* Companions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          旅伴管理
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {companions.map(companion => (
            <div key={companion.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
              <div className={`w-6 h-6 rounded-full ${companion.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                {companion.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{companion.name}</span>
              <button onClick={() => onRemoveCompanion(companion.id)} className="text-gray-400 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="新增旅伴名字..." 
            className="flex-1 border-gray-300 rounded-xl shadow-sm focus:border-green-500 focus:ring-green-500 border p-3"
            value={newCompanionName}
            onChange={(e) => setNewCompanionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCompanion()}
          />
          <button 
            onClick={handleAddCompanion}
            className="bg-green-500 text-white px-4 rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            新增
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">* 這些旅伴會同步到記帳功能中</p>
      </div>
    </div>
  );
};

export default TripInfo;