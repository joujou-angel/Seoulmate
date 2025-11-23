import React, { useState, useMemo, useEffect } from 'react';
import { Companion, Expense } from '../types';
import { getExchangeRate } from '../services/geminiService';

interface ExpenseTrackerProps {
  companions: Companion[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ companions, expenses, onAddExpense, onDeleteExpense }) => {
  // --- Currency Converter State ---
  const [amount, setAmount] = useState<number>(1000);
  const [rate, setRate] = useState<number>(0.21); 
  const [currencyFrom, setCurrencyFrom] = useState('JPY');
  const [currencyTo, setCurrencyTo] = useState('TWD');
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // --- New Expense State ---
  const [desc, setDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [payerId, setPayerId] = useState<string>(companions[0]?.id || '');
  const [involvedIds, setInvolvedIds] = useState<string[]>(companions.map(c => c.id));
  const [category, setCategory] = useState<Expense['category']>('food');

  // --- Auto Fetch Rate Effect ---
  useEffect(() => {
    const fetchRate = async () => {
      setIsLoadingRate(true);
      const newRate = await getExchangeRate(currencyFrom, currencyTo);
      if (newRate) {
        setRate(newRate);
      }
      setIsLoadingRate(false);
    };

    // Debounce to avoid too many API calls
    const timer = setTimeout(() => {
      if (currencyFrom && currencyTo && currencyFrom !== currencyTo) {
        fetchRate();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currencyFrom, currencyTo]);

  // --- Calculations ---
  const settlement = useMemo(() => {
    return companions.map(c => {
      const paid = expenses
        .filter(e => e.payerId === c.id)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const share = expenses.reduce((sum, e) => {
        if (e.involvedIds.includes(c.id)) {
          return sum + (e.amount / e.involvedIds.length);
        }
        return sum;
      }, 0);

      return {
        ...c,
        paid,
        share,
        balance: paid - share
      };
    });
  }, [companions, expenses]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // --- Handlers ---
  const handleAddExpense = () => {
    if (!desc || !expenseAmount || !payerId || involvedIds.length === 0) return;
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(expenseAmount),
      payerId,
      involvedIds,
      date: new Date().toISOString().split('T')[0],
      category
    };

    onAddExpense(newExpense);
    
    // Reset form
    setDesc('');
    setExpenseAmount('');
    setInvolvedIds(companions.map(c => c.id));
  };

  const toggleInvolved = (id: string) => {
    setInvolvedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Auto-updating Currency Converter - Macaroon Purple/Lavender */}
      <div className="bg-[#E2DBF5] rounded-3xl p-6 text-[#6a5a9e] shadow-sm border border-white/50">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80 flex items-center justify-between">
          <span>簡易匯率換算</span>
          {isLoadingRate && <span className="text-xs animate-pulse">更新匯率中...</span>}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-2">
               <input 
                 type="text" 
                 value={currencyFrom}
                 onChange={e => setCurrencyFrom(e.target.value.toUpperCase())}
                 className="w-16 bg-white/40 text-center rounded-lg border-none focus:ring-2 focus:ring-[#9d8ec4] text-sm font-black p-1"
               />
               <span className="text-xs font-bold">金額</span>
             </div>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
               className="w-full bg-white rounded-2xl p-3 text-xl font-bold border-2 border-transparent focus:outline-none focus:border-[#9d8ec4] text-[#6a5a9e]"
             />
          </div>
          <div className="text-2xl opacity-50 pt-6">=</div>
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-2">
               <input 
                 type="text" 
                 value={currencyTo}
                 onChange={e => setCurrencyTo(e.target.value.toUpperCase())}
                 className="w-16 bg-white/40 text-center rounded-lg border-none focus:ring-2 focus:ring-[#9d8ec4] text-sm font-black p-1"
               />
               <span className="text-xs font-bold">約為</span>
             </div>
             <div className="w-full bg-white/50 rounded-2xl p-3 text-xl font-bold border-2 border-transparent text-[#6a5a9e]">
               {Math.round(amount * rate).toLocaleString()}
             </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center bg-white/30 rounded-xl py-2">
           <div className="flex items-center gap-2">
             <span className="text-xs font-bold">匯率: 1 {currencyFrom} = </span>
             <input 
               type="number" 
               value={rate} 
               step="0.0001"
               onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
               className="w-20 bg-white/50 text-center rounded text-xs py-1 px-2 font-mono font-bold"
             />
             <span className="text-xs font-bold">{currencyTo}</span>
           </div>
        </div>
      </div>

      {/* 2. Add Expense Form (Always Visible) - Macaroon Green/Mint Background */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-[#B5EAD7]"></div>
         <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#B5EAD7] p-2 rounded-xl text-[#4a7c72]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="font-black text-gray-800 text-lg">記上一筆</h3>
         </div>
         
         <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 font-bold ml-1">消費項目</label>
              <input 
                type="text" 
                placeholder="例如: 晚餐, 計程車" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full border-b-2 border-gray-100 py-2 focus:outline-none focus:border-[#B5EAD7] bg-transparent text-lg font-medium text-gray-700 placeholder-gray-300 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="text-xs text-gray-400 font-bold ml-1">金額</label>
                 <div className="relative">
                   <input 
                     type="number" 
                     placeholder="0"
                     value={expenseAmount}
                     onChange={e => setExpenseAmount(e.target.value)}
                     className="w-full border-b-2 border-gray-100 py-2 focus:outline-none focus:border-[#B5EAD7] bg-transparent text-2xl font-black text-[#5a8c82] placeholder-gray-200"
                   />
                 </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold ml-1">分類</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full border-b-2 border-gray-100 py-3 focus:outline-none bg-transparent text-gray-600 font-medium"
                >
                  <option value="food">🍔 飲食</option>
                  <option value="transport">🚕 交通</option>
                  <option value="stay">🏠 住宿</option>
                  <option value="shopping">🛍️ 購物</option>
                  <option value="other">🔧 其他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-3 ml-1">誰先付的?</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {companions.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setPayerId(c.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all whitespace-nowrap ${
                      payerId === c.id 
                      ? 'bg-[#B5EAD7] text-[#4a7c72] border-[#B5EAD7] shadow-sm' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${c.avatarColor} border-2 border-white shadow-sm`}></div>
                    <span className="text-sm font-bold">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                 <label className="text-xs text-gray-400 font-bold">分給誰?</label>
                 <button 
                   onClick={() => setInvolvedIds(companions.map(c => c.id))}
                   className="text-xs text-[#5a8c82] font-bold hover:underline"
                 >
                   全選
                 </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {companions.map(c => {
                  const isSelected = involvedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleInvolved(c.id)}
                      className={`relative flex flex-col items-center gap-1 transition-all duration-200 ${
                        isSelected ? 'opacity-100 transform scale-100' : 'opacity-40 grayscale transform scale-95'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${c.avatarColor} flex items-center justify-center text-white text-lg font-bold shadow-md border-2 ${isSelected ? 'border-[#B5EAD7]' : 'border-transparent'}`}>
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{c.name}</span>
                      {isSelected && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#B5EAD7] rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#4a7c72]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <button 
              onClick={handleAddExpense}
              disabled={!desc || !expenseAmount}
              className="w-full bg-[#B5EAD7] text-[#4a7c72] py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#b5ead7]/40 hover:bg-[#a3e0c9] active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              新增這筆帳
            </button>
         </div>
      </div>

      {/* 3. Summary List (No Pie Chart) */}
      {expenses.length > 0 && (
        <>
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-[#FFDAC1] w-2 h-6 rounded-full"></span>
              結算概況 
              <span className="text-sm font-medium text-gray-400 ml-2 bg-gray-100 px-2 py-1 rounded-lg">總支出: {formatCurrency(totalExpense)}</span>
            </h3>

            <div className="space-y-4">
              {settlement.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${s.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{s.name}</p>
                      <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wide mt-1">
                        <span className="text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">已付 {formatCurrency(s.paid)}</span>
                        <span className="text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">應付 {formatCurrency(s.share)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-black text-sm px-3 py-1.5 rounded-lg ${
                    s.balance >= 0 
                      ? 'bg-[#B5EAD7]/20 text-[#4a7c72]' 
                      : 'bg-[#FFB7B2]/20 text-[#e06c6c]'
                  }`}>
                    {s.balance >= 0 ? `收回 ${formatCurrency(s.balance)}` : `支付 ${formatCurrency(Math.abs(s.balance))}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Transaction List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">最近紀錄</h3>
            {expenses.slice().reverse().map(expense => {
              const payer = companions.find(c => c.id === expense.payerId);
              return (
                <div key={expense.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0FAF7] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {expense.category === 'food' && '🍔'}
                      {expense.category === 'transport' && '🚕'}
                      {expense.category === 'stay' && '🏠'}
                      {expense.category === 'shopping' && '🛍️'}
                      {expense.category === 'other' && '🔧'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{expense.description}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        <span className="text-[#5a8c82]">{payer?.name}</span> 先付 • 分給 {expense.involvedIds.length} 人
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-700">{formatCurrency(expense.amount)}</p>
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-xs text-red-300 hover:text-red-500 mt-2 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {expenses.length === 0 && (
         <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 mt-6">
           <p className="font-bold">還沒有消費紀錄</p>
           <p className="text-xs mt-2 opacity-60">在上方新增你的第一筆支出吧！</p>
         </div>
      )}
    </div>
  );
};

export default ExpenseTracker;