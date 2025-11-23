import React, { useState } from 'react';
import { ItineraryItem } from '../types';

interface ItineraryProps {
  items: ItineraryItem[];
  tripName: string;
  tripYear: string;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, tripName, tripYear }) => {
  // Group items by date to build the date selector
  const dates = Array.from(new Set(items.map(item => item.date))).sort();
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  // Filter items for the selected date and sort by time
  const dailyItems = items
    .filter(item => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const formatDate = (dateStr: string) => {
    // Input: YYYY/MM/DD -> Output: { day: '14', weekday: 'SAT' }
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const weekday = weekdays[date.getDay()];
    return { day, weekday };
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'flight': return '✈️';
      case 'transport': return '🚗';
      case 'food': return '🍴';
      case 'sightseeing': return '📷';
      case 'stay': return '🏨';
      default: return '📍';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'flight': return 'FLIGHT';
      case 'transport': return 'TRANSPORT';
      case 'food': return 'FOOD';
      case 'sightseeing': return 'SIGHTSEEING';
      case 'stay': return 'HOTEL';
      default: return 'ACTIVITY';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9F8F6] font-serif relative">
       {/* Top: Trip Title & Year */}
       <div className="pt-6 pb-2 text-center bg-[#F9F8F6]">
         <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-1">Family Trip</p>
         <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-medium text-gray-800 tracking-wide">{tripName}</h2>
            <span className="text-xs border border-gray-300 rounded-full px-2 py-0.5 text-gray-500">{tripYear}</span>
         </div>
       </div>

       {/* Horizontal Date Selector */}
       <div className="flex overflow-x-auto py-4 px-6 gap-6 scrollbar-hide border-b border-gray-100 bg-[#F9F8F6] sticky top-0 z-10">
          {dates.map(date => {
             const { day, weekday } = formatDate(date);
             const isSelected = date === selectedDate;
             return (
               <button 
                 key={date}
                 onClick={() => setSelectedDate(date)}
                 className={`flex flex-col items-center min-w-[3rem] transition-colors ${isSelected ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
               >
                 <span className="text-[10px] font-bold tracking-widest text-gray-500 mb-1">{weekday}</span>
                 <span className={`text-2xl font-serif leading-none ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
                 {isSelected && <div className="w-1 h-1 bg-red-400 rounded-full mt-2"></div>}
               </button>
             )
          })}
          {dates.length === 0 && <div className="text-center w-full text-gray-400 text-sm">暫無行程</div>}
       </div>

       {/* Timeline Content */}
       <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[3.25rem] top-6 bottom-0 w-px bg-gray-200"></div>

          <div className="space-y-12 pb-24">
             {dailyItems.map((item, idx) => (
               <div key={item.id} className="relative flex gap-8 group">
                  {/* Time */}
                  <div className="w-16 pt-1 text-right flex-shrink-0">
                     <span className="text-xl font-serif text-gray-800">{item.time}</span>
                     {/* Dot */}
                     <div className="absolute left-[3.25rem] top-3 w-1.5 h-1.5 bg-white border-2 border-gray-300 rounded-full transform -translate-x-1/2 z-10 group-hover:border-red-400 transition-colors"></div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 space-y-1 pt-1">
                     <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-800 font-serif leading-tight">{item.title}</h3>
                        {item.isReserved && (
                           <span className="border border-red-300 text-red-400 text-[10px] px-1 py-0.5 transform -rotate-6 font-bold">予約済</span>
                        )}
                     </div>
                     
                     <div className="flex items-center gap-2 text-[10px] tracking-widest text-gray-400 uppercase">
                        <span>{getCategoryIcon(item.category)}</span>
                        <span>{getCategoryLabel(item.category)}</span>
                     </div>

                     {item.description && (
                       <p className="text-sm text-gray-500 leading-relaxed font-sans mt-2">
                         {item.description}
                       </p>
                     )}
                     
                     {item.location && (
                       <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 font-sans">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {item.location}
                       </div>
                     )}
                  </div>
               </div>
             ))}

             {dailyItems.length === 0 && (
               <div className="pl-20 text-gray-400 text-sm italic">
                 本日尚無安排行程
               </div>
             )}
          </div>
       </div>

       {/* Floating Next Activity */}
       {dailyItems.length > 0 && (
         <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex justify-between items-center z-20">
            <div>
               <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-serif text-gray-900">{dailyItems[0].time}</span>
                 <span className="text-[10px] border border-gray-200 px-1 rounded text-gray-400">行程預覽</span>
               </div>
               <p className="text-sm font-bold text-gray-700 font-serif">{dailyItems[0].title}</p>
               {dailyItems.length > 1 && (
                  <p className="text-[10px] text-gray-400 mt-1">→ {dailyItems[1].title}</p>
               )}
            </div>
            <div className="text-center px-2 border-l border-gray-100 pl-4">
               <span className="block text-xl font-bold text-gray-800">{dailyItems.length > 1 ? dailyItems[1].time : 'END'}</span>
               <span className="text-[10px] text-gray-400">下個時間</span>
            </div>
         </div>
       )}
    </div>
  );
};

export default Itinerary;