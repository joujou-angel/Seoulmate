import React, { useState, useEffect } from 'react';
import { getWeatherAdvice } from '../services/geminiService';

interface WeatherForecastProps {
  location: string;
  tripDates: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ location, tripDates }) => {
  const [info, setInfo] = useState<{ temp: string, advice: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location || !tripDates) return;
      setLoading(true);
      const data = await getWeatherAdvice(location, tripDates);
      setInfo(data);
      setLoading(false);
    };

    fetchWeather();
  }, [location, tripDates]);

  if (!location) {
    return (
       <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
         <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
         <p>請先設定航班資訊，</p>
         <p>讓 AI 知道你要去哪裡！</p>
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
             <h2 className="text-3xl font-black text-yellow-800">{location}</h2>
             <p className="text-yellow-700 font-medium mt-1">{tripDates}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 transform translate-x-10 -translate-y-10"></div>
       </div>

       {/* Weather Info - Pastel Blue/Pink Gradient */}
       <div className="bg-gradient-to-br from-[#E0F2F1] to-[#F3E5F5] rounded-3xl p-8 shadow-sm border border-white relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-10 space-y-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300"></div>
               <p className="text-gray-400 font-bold text-sm">AI 正在查詢天氣與穿搭...</p>
             </div>
          ) : (
             <>
               <div className="text-center mb-8">
                  <div className="inline-block bg-white/60 backdrop-blur-sm rounded-full px-4 py-1 text-xs font-bold text-gray-500 mb-4 shadow-sm">
                    預測氣溫
                  </div>
                  <div className="text-5xl font-black text-gray-800 tracking-tight">
                    {info?.temp || "--°C"}
                  </div>
               </div>

               <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
                  <div className="flex items-start gap-3">
                     <span className="text-2xl">👗</span>
                     <div>
                        <h3 className="font-bold text-gray-800 mb-1">AI 穿衣建議</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
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