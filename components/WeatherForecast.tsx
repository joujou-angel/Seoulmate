import React, { useState, useEffect } from 'react';
import { getWeatherAdvice } from '../services/geminiService';
import { FlightInfo, DailyWeather } from '../types';

interface WeatherForecastProps {
  flights: FlightInfo[];
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ flights }) => {
  // Location State (Local)
  const [location, setLocation] = useState('Tokyo, Japan');
  
  const [info, setInfo] = useState<{ daily: DailyWeather[], advice: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Debounce logic for fetching weather
    const fetchWeather = async () => {
      if (!location || flights.length === 0) return;
      
      // Determine Start and End Dates from flights
      const sortedFlights = [...flights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const startDate = sortedFlights[0]?.date;
      const endDate = sortedFlights[sortedFlights.length - 1]?.date;

      if (!startDate || !endDate) return;

      setLoading(true);
      const data = await getWeatherAdvice(location, startDate, endDate);
      setInfo(data);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchWeather();
    }, 1000); // Debounce delay

    return () => clearTimeout(timer);
  }, [location, flights]);

  if (flights.length === 0) {
    return (
       <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
         <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
         <p>請先設定航班資訊，</p>
         <p>讓 AI 為你查詢旅程天氣！</p>
       </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Location Header - Pastel Yellow */}
       <div className="bg-[#FFF9C4] rounded-3xl p-6 shadow-sm border border-yellow-100 relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2 text-yellow-600 opacity-70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xs font-bold uppercase tracking-wider">Destination</span>
             </div>
             <input 
               type="text" 
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               className="w-full bg-transparent border-b border-yellow-600/20 text-3xl font-black text-yellow-800 focus:outline-none focus:border-yellow-600 placeholder-yellow-800/30"
               placeholder="Enter location..."
             />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 transform translate-x-10 -translate-y-10"></div>
       </div>

       {/* Weather Content */}
       <div className="space-y-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-10 space-y-4 bg-white rounded-3xl border border-gray-100">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
               <p className="text-gray-400 font-bold text-sm">AI 正在查詢每日天氣與中文穿搭建議...</p>
             </div>
          ) : (
             <>
               {/* Daily Forecast List */}
               <div className="space-y-2">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">每日天氣</h3>
                 {info?.daily?.map((day, idx) => (
                   <div key={idx} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-50 shadow-sm">
                      <span className="text-gray-500 font-bold text-sm w-16">{day.date}</span>
                      <span className="text-gray-800 font-medium flex-1 text-center">{day.weather}</span>
                      <span className="text-[#F57F17] font-black text-lg w-24 text-right">{day.temp}</span>
                   </div>
                 ))}
               </div>

               {/* Clothing Advice */}
               <div className="bg-gradient-to-br from-[#E0F2F1] to-[#F3E5F5] rounded-3xl p-6 border border-white shadow-sm mt-4">
                  <div className="flex items-start gap-3">
                     <span className="text-3xl">👗</span>
                     <div>
                        <h3 className="font-bold text-gray-800 mb-1">AI 穿衣建議</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                          {info?.advice || "無法取得建議。"}
                        </p>
                     </div>
                  </div>
               </div>
             </>
          )}
       </div>
    </div>
  );
};

export default WeatherForecast;