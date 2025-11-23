import React, { useState } from 'react';
import { ItineraryItem } from '../types';

interface ItineraryProps {
  items: ItineraryItem[];
  onUpdateItems: (items: ItineraryItem[]) => void;
  tripName: string;
  tripYear: string;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, onUpdateItems, tripName, tripYear }) => {
  // Group items by date to build the date selector
  const dates = Array.from(new Set(items.map(item => item.date))).sort();
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  // State for Modal
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter items for the selected date and sort by time
  const dailyItems = items
    .filter(item => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const formatDate = (dateStr: string) => {
    // Input: YYYY/MM/DD -> Output: { day: '14', weekday: 'SAT' }
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

  // Handlers
  const openAddModal = () => {
    setEditingItem({
      id: '', // New item
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
      // Update existing
      const updated = items.map(i => i.id === editingItem.id ? editingItem : i);
      onUpdateItems(updated);
    } else {
      // Add new
      const newItem = { ...editingItem, id: Date.now().toString() };
      const updated = [...items, newItem];
      // If the new item's date isn't in our list, we might want to select it, 
      // but for now just adding it to the list is enough.
      onUpdateItems(updated);
      if (!dates.includes(newItem.date)) {
          setSelectedDate(newItem.date);
      }
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
       <div className="flex-1 overflow-y-auto p-6 relative pb-24">
          {/* Vertical Line */}
          <div className="absolute left-[3.25rem] top-6 bottom-0 w-px bg-gray-200"></div>

          <div className="space-y-12">
             {dailyItems.map((item, idx) => (
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
                     <label className="text-xs font-bold text-gray-400">地點</label>
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