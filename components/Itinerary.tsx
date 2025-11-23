import React, { useState, useEffect, useRef } from 'react';
import { ItineraryItem, FlightInfo } from '../types';
import { getCoordinates } from '../services/geminiService';

declare const L: any; // Leaflet global

interface ItineraryProps {
  items: ItineraryItem[];
  onUpdateItems: (items: ItineraryItem[]) => void;
  flights: FlightInfo[];
}

const Itinerary: React.FC<ItineraryProps> = ({ items, onUpdateItems, flights }) => {
  // --- Date Logic ---
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // --- View Mode ---
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (flights.length > 0) {
      // Find min and max date from flights
      const sortedDates = flights
        .map(f => new Date(f.date).getTime())
        .sort((a, b) => a - b);
      
      const start = new Date(sortedDates[0]);
      const end = new Date(sortedDates[sortedDates.length - 1]);
      
      const dateList: string[] = [];
      const current = new Date(start);
      
      if (isNaN(current.getTime())) {
          setDates([]);
          return;
      }

      while (current <= end) {
        const y = current.getFullYear();
        const m = (current.getMonth() + 1).toString().padStart(2, '0');
        const d = current.getDate().toString().padStart(2, '0');
        dateList.push(`${y}/${m}/${d}`);
        current.setDate(current.getDate() + 1);
      }
      
      setDates(dateList);
      if ((!selectedDate || !dateList.includes(selectedDate)) && dateList.length > 0) {
        setSelectedDate(dateList[0]);
      }
    } else if (items.length > 0) {
      const itemDates = Array.from(new Set(items.map(i => i.date))).sort();
      setDates(itemDates);
      if (!selectedDate) setSelectedDate(itemDates[0]);
    } else {
        const today = new Date();
        const y = today.getFullYear();
        const m = (today.getMonth() + 1).toString().padStart(2, '0');
        const d = today.getDate().toString().padStart(2, '0');
        const todayStr = `${y}/${m}/${d}`;
        setDates([todayStr]);
        if (!selectedDate) setSelectedDate(todayStr);
    }
  }, [flights, items, selectedDate]);


  // --- State for Modals ---
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Filtered Items ---
  const dailyItems = items
    .filter(item => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  // --- Map Logic ---
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapRef.current) {
      // Init Map
      mapRef.current = L.map(mapContainerRef.current).setView([35.6895, 139.6917], 13); // Default Tokyo
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const updateMarkers = async () => {
      if (viewMode === 'map' && mapRef.current) {
        // Clear existing markers
        markers.forEach(m => m.remove());
        const newMarkers: any[] = [];
        const bounds = L.latLngBounds([]);

        for (const item of dailyItems) {
          if (item.location) {
            const coords = await getCoordinates(item.location);
            if (coords) {
              const iconEmoji = getCategoryIcon(item.category);
              const customIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.2); font-size:16px;">${iconEmoji}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });

              const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
                .addTo(mapRef.current)
                .bindPopup(`<b>${item.time}</b><br>${item.title}`);
              
              newMarkers.push(marker);
              bounds.extend([coords.lat, coords.lng]);
            }
          }
        }
        
        setMarkers(newMarkers);
        if (newMarkers.length > 0) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };

    if (viewMode === 'map') {
      updateMarkers();
    }
  }, [viewMode, dailyItems]);


  // --- Handlers ---
  const openAddModal = () => {
    setEditingItem({
      id: '',
      date: selectedDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      time: '12:00',
      title: '',
      category: 'sightseeing',
      description: '',
      isReserved: false,
      location: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ItineraryItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const saveItem = () => {
    if (!editingItem || !editingItem.title) return;

    if (editingItem.id) {
      onUpdateItems(items.map(i => i.id === editingItem.id ? editingItem : i));
    } else {
      const newItem = { ...editingItem, id: Date.now().toString() };
      onUpdateItems([...items, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (confirm('確定要刪除此行程嗎？')) {
      onUpdateItems(items.filter(i => i.id !== id));
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  // --- Helpers ---
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { day: '--', weekday: '---' };
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
       
       {/* Date Selector & View Toggle */}
       <div className="bg-[#F9F8F6] sticky top-0 z-10 shadow-sm">
         {/* Date Bar */}
         <div className="flex overflow-x-auto py-4 px-6 gap-6 scrollbar-hide border-b border-gray-100 pt-6">
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
            {dates.length === 0 && <div className="text-center w-full text-gray-400 text-sm py-2">請先新增航班以建立日期</div>}
         </div>

         {/* List/Map Toggle */}
         <div className="flex justify-center py-2 pb-4">
            <div className="bg-gray-200 p-1 rounded-xl flex font-sans text-xs font-bold">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
               >
                 列表 List
               </button>
               <button 
                 onClick={() => setViewMode('map')}
                 className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
               >
                 地圖 Map
               </button>
            </div>
         </div>
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto relative pb-24">
          
          {/* MAP VIEW */}
          <div className={`${viewMode === 'map' ? 'block' : 'hidden'} h-full w-full min-h-[400px] relative`}>
             <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
             <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-xl backdrop-blur-sm text-xs text-center z-[500] pointer-events-none">
                顯示 {selectedDate} 的行程位置
             </div>
          </div>

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="p-6 relative">
              <div className="absolute left-[3.25rem] top-6 bottom-0 w-px bg-gray-200"></div>

              <div className="space-y-12">
                {dailyItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative flex gap-8 group cursor-pointer hover:bg-gray-100/50 p-2 rounded-xl transition-colors -ml-2"
                    onClick={() => openEditModal(item)}
                  >
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

                        {item.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-sans">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {item.location}
                          </div>
                        )}

                        {item.description && (
                          <p className="text-sm text-gray-500 leading-relaxed font-sans mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                  </div>
                ))}

                {dailyItems.length === 0 && (
                  <div className="pl-20 text-gray-400 text-sm italic pt-10">
                    本日尚無安排行程，點擊右下角 + 新增
                  </div>
                )}
              </div>
            </div>
          )}
       </div>

       {/* Floating Add Button */}
       <button 
         onClick={openAddModal}
         className="absolute bottom-6 right-6 bg-[#A0C4FF] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#8bb4f7] active:scale-95 transition-all z-20"
       >
         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
       </button>

       {/* Edit/Add Modal */}
       {isModalOpen && editingItem && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
               <h3 className="text-lg font-bold text-gray-800 mb-4">{editingItem.id ? '編輯行程' : '新增行程'}</h3>
               
               <div className="space-y-3">
                  <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">日期</label>
                        <input 
                           type="text"
                           value={editingItem.date}
                           onChange={e => setEditingItem({...editingItem, date: e.target.value})}
                           placeholder="YYYY/MM/DD"
                           className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                        />
                     </div>
                     <div className="w-1/3">
                        <label className="text-xs font-bold text-gray-400">時間</label>
                        <input 
                           type="time"
                           value={editingItem.time}
                           onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                           className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-400">標題</label>
                     <input 
                        type="text"
                        value={editingItem.title}
                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                        placeholder="行程名稱"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                     />
                  </div>

                  <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400">分類</label>
                        <select 
                           value={editingItem.category}
                           onChange={e => setEditingItem({...editingItem, category: e.target.value as any})}
                           className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                        >
                           <option value="sightseeing">📷 觀光</option>
                           <option value="food">🍴 飲食</option>
                           <option value="transport">🚗 交通</option>
                           <option value="stay">🏨 住宿</option>
                           <option value="flight">✈️ 航班</option>
                           <option value="other">📍 其他</option>
                        </select>
                     </div>
                     <div className="flex items-end mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                              type="checkbox"
                              checked={editingItem.isReserved}
                              onChange={e => setEditingItem({...editingItem, isReserved: e.target.checked})}
                              className="w-4 h-4 text-red-400 rounded focus:ring-red-400"
                           />
                           <span className="text-xs font-bold text-gray-600">已預約</span>
                        </label>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-400">地點 (用於地圖)</label>
                     <input 
                        type="text"
                        value={editingItem.location || ''}
                        onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                        placeholder="地點名稱"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                     />
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-400">備註</label>
                     <textarea 
                        value={editingItem.description || ''}
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        placeholder="詳細資訊..."
                        rows={3}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                     />
                  </div>

                  <div className="flex gap-2 pt-2">
                     <button onClick={saveItem} className="flex-1 bg-[#A0C4FF] text-white py-3 rounded-xl font-bold">儲存</button>
                     <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">取消</button>
                  </div>
                  {editingItem.id && (
                     <button onClick={() => deleteItem(editingItem.id)} className="w-full text-red-400 text-xs font-bold py-2">刪除此行程</button>
                  )}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Itinerary;