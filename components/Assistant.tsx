import React, { useState, useEffect, useRef } from 'react';
import { askTravelAssistant } from '../services/geminiService';

interface AssistantProps {
  contextData: string;
}

const Assistant: React.FC<AssistantProps> = ({ contextData }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: '你好！我是你的 AI 旅遊助手。有關行程規劃、當地貨幣或天氣都可以問我喔！' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    const aiResponse = await askTravelAssistant(userMsg, contextData);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E2DBF5] flex flex-col h-[calc(100vh-160px)] overflow-hidden">
      <div className="bg-[#E2DBF5] px-6 py-4">
        <h2 className="text-[#6a5a9e] text-lg font-black flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          AI 旅遊小幫手
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#fcfbff]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#E2DBF5] text-[#6a5a9e] font-medium rounded-br-none' 
                : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-2">
               <div className="w-2 h-2 bg-[#E2DBF5] rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-[#E2DBF5] rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-[#E2DBF5] rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-50">
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="例如: 目前日幣匯率如何?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 border-gray-200 rounded-2xl focus:border-[#E2DBF5] focus:ring-[#E2DBF5] border p-3.5 shadow-sm bg-gray-50 text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#E2DBF5] text-[#6a5a9e] px-5 rounded-2xl hover:bg-[#d4cbf0] transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;