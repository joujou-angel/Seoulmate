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
      {/* Flight Section - Pastel Blue */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#A0C4FF]/30 overflow-hidden">
        <div className="bg-[#A0C4FF] px-6 py-4">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            航班資訊
          </h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">航班號碼</p>
            <p className="text-xl font-bold text-gray-700">{flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">日期</p>
            <p className="text-lg font-medium text-gray-700">{flight.date}</p>
          </div>
          <div className="col-span-2 border-t border-gray-100 my-2 pt-4 flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-[#8bb4f7]">{flight.departureTime}</p>
              <p className="text-xs text-gray-400 font-bold">出發</p>
            </div>
            <div className="flex-1 px-4 flex flex-col items-center">
               <div className="w-full h-0.5 bg-gray-200 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 p-1">
                    <svg className="w-4 h-4 text-[#A0C4FF] transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409 8.729 8.729 0 014.722-1.391 8.736 8.736 0 014.723 1.391 1 1 0 001.168-1.409l-7-14z" /></svg>
                 </div>
               </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#8bb4f7]">{flight.arrivalTime}</p>
              <p className="text-xs text-gray-400 font-bold">抵達</p>
            </div>
          </div>
          <div className="col-span-2 text-center bg-[#f0f7ff] py-2 rounded-xl mt-2">
            <span className="text-[#8bb4f7] font-bold">航廈: {flight.terminal}</span>
          </div>
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
               <label className="block text-sm font-bold text-gray-600 mb-1">地址</label>
               <input 
                 type="text" 
                 value={tempHotel.address}
                 onChange={(e) => setTempHotel({...tempHotel, address: e.target.value})}
                 className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#FFDAC1] focus:ring-[#FFDAC1] border p-3 bg-gray-50"
               />
             </div>
             <div className="flex gap-2">
                <button onClick={saveHotel} className="flex-1 bg-[#FFDAC1] text-[#8a6a54] py-3 rounded-xl font-bold hover:bg-[#ffcfb0] transition-colors">儲存</button>
                <button onClick={() => setIsEditingHotel(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">取消</button>
             </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-black text-gray-800 mb-2 leading-tight">{hotel.name}</h3>
            <p className="text-gray-500 mb-5 text-sm">{hotel.address}</p>
            
            <div className="flex justify-between text-sm text-gray-500 border-t border-dashed border-gray-200 pt-4 mb-5">
               <div>
                 <span className="block font-bold text-gray-700 mb-1">入住</span>
                 <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{hotel.checkIn}</span>
               </div>
               <div className="text-right">
                 <span className="block font-bold text-gray-700 mb-1">退房</span>
                 <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{hotel.checkOut}</span>
               </div>
            </div>

            <button 
              onClick={handleGenerateCard}
              disabled={isLoadingCard}
              className="w-full bg-[#8a6a54] hover:bg-[#6d5341] text-[#FFDAC1] py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 font-bold"
            >
              {isLoadingCard ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FFDAC1]"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              )}
              給司機看 (AI 產生卡片)
            </button>
          </div>
        )}
      </div>

      {/* Taxi Card Modal */}
      {taxiCard && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setTaxiCard(null)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm max-h-[80vh] overflow-y-auto relative animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
             <button onClick={() => setTaxiCard(null)} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="text-center mb-6">
                <span className="bg-[#FFDAC1] text-[#8a6a54] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Driver Card</span>
             </div>
             <div className="prose prose-lg text-gray-800 whitespace-pre-wrap leading-loose font-serif text-center text-xl">
               {taxiCard}
             </div>
             <p className="text-center text-gray-300 text-xs mt-8 font-medium">點擊背景關閉</p>
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