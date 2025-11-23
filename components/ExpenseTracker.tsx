import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Companion, Expense, CATEGORY_COLORS, AVATAR_COLORS } from '../types';

interface ExpenseTrackerProps {
  companions: Companion[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ companions, expenses, onAddExpense, onDeleteExpense }) => {
  // --- Currency Converter State ---
  const [amount, setAmount] = useState<number>(1000);
  const [rate, setRate] = useState<number>(0.21); // Default e.g., JPY to TWD
  const [currencyFrom, setCurrencyFrom] = useState('JPY');
  const [currencyTo, setCurrencyTo] = useState('TWD');

  // --- New Expense State ---
  const [desc, setDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [payerId, setPayerId] = useState<string>(companions[0]?.id || '');
  const [involvedIds, setInvolvedIds] = useState<string[]>(companions.map(c => c.id));
  const [category, setCategory] = useState<Expense['category']>('food');
  const [isAdding, setIsAdding] = useState(false);

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

  const pieData = settlement.map(s => ({
    name: s.name,
    value: s.paid
  })).filter(d => d.value > 0);

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
    setIsAdding(false);
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
    <div className="space-y-6 pb-24">
      
      {/* 1. Simple Currency Converter */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">簡易匯率換算</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
               <input 
                 type="text" 
                 value={currencyFrom}
                 onChange={e => setCurrencyFrom(e.target.value.toUpperCase())}
                 className="w-12 bg-white/20 text-center rounded border-none focus:ring-0 text-sm font-bold"
               />
               <span className="text-xs">金額</span>
             </div>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
               className="w-full bg-white/10 rounded-lg p-2 text-xl font-bold border border-white/20 focus:outline-none focus:border-white"
             />
          </div>
          <div className="text-2xl opacity-50">=</div>
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
               <input 
                 type="text" 
                 value={currencyTo}
                 onChange={e => setCurrencyTo(e.target.value.toUpperCase())}
                 className="w-12 bg-white/20 text-center rounded border-none focus:ring-0 text-sm font-bold"
               />
               <span className="text-xs">約為</span>
             </div>
             <div className="w-full bg-white/10 rounded-lg p-2 text-xl font-bold border border-transparent">
               {Math.round(amount * rate).toLocaleString()}
             </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="text-xs opacity-70">匯率: 1 {currencyFrom} = </span>
             <input 
               type="number" 
               value={rate} 
               step="0.01"
               onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
               className="w-16 bg-white/20 text-center rounded text-xs py-1 px-2"
             />
             <span className="text-xs opacity-70">{currencyTo}</span>
           </div>
        </div>
      </div>

      {/* 2. Add Expense Toggle */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-xl text-indigo-600 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          記上一筆
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-in">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800">新增消費</h3>
             <button onClick={() => setIsAdding(false)} className="text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
           </div>
           
           <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold">項目</label>
                <input 
                  type="text" 
                  placeholder="例如: 晚餐, 計程車" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-indigo-500 bg-transparent text-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-gray-500 font-bold">金額</label>
                   <input 
                     type="number" 
                     placeholder="0"
                     value={expenseAmount}
                     onChange={e => setExpenseAmount(e.target.value)}
                     className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-indigo-500 bg-transparent text-2xl font-bold text-indigo-600"
                   />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">分類</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border-b border-gray-200 py-2 focus:outline-none bg-transparent"
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
                <label className="text-xs text-gray-500 font-bold block mb-2">誰先付的?</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {companions.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setPayerId(c.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                        payerId === c.id 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${c.avatarColor} border border-white`}></div>
                      <span className="text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-2">分給誰? (點擊選擇)</label>
                <div className="flex gap-2 flex-wrap">
                  {companions.map(c => {
                    const isSelected = involvedIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleInvolved(c.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                          isSelected ? 'border-indigo-500 opacity-100 scale-110' : 'border-transparent opacity-40 grayscale'
                        } ${c.avatarColor} text-white font-bold text-xs shadow-sm`}
                      >
                        {c.name.charAt(0)}
                        {isSelected && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-white"></div>}
                      </button>
                    )
                  })}
                  <button 
                     onClick={() => setInvolvedIds(companions.map(c => c.id))}
                     className="text-xs text-indigo-500 font-bold ml-2 underline"
                  >
                    全選
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddExpense}
                disabled={!desc || !expenseAmount}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                新增這筆帳
              </button>
           </div>
        </div>
      )}

      {/* 3. Summary & Settlement */}
      {expenses.length > 0 && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">結算概況 (總支出: {formatCurrency(totalExpense)})</h3>
            
            {/* Pie Chart */}
            <div className="h-48 w-full mb-6">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={40}
                     outerRadius={60}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => {
                       const comp = companions.find(c => c.name === entry.name);
                       // Map bg-color class to hex roughly
                       let color = '#8884d8';
                       if (comp?.avatarColor.includes('red')) color = '#EF4444';
                       if (comp?.avatarColor.includes('blue')) color = '#3B82F6';
                       if (comp?.avatarColor.includes('green')) color = '#10B981';
                       if (comp?.avatarColor.includes('yellow')) color = '#F59E0B';
                       if (comp?.avatarColor.includes('purple')) color = '#8B5CF6';
                       if (comp?.avatarColor.includes('pink')) color = '#EC4899';
                       return <Cell key={`cell-${index}`} fill={color} />;
                     })}
                   </Pie>
                   <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {settlement.map(s => (
                <div key={s.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${s.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">已付 {formatCurrency(s.paid)} / 應付 {formatCurrency(s.share)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${s.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {s.balance >= 0 ? `收回 ${formatCurrency(s.balance)}` : `支付 ${formatCurrency(Math.abs(s.balance))}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Transaction List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">最近紀錄</h3>
            {expenses.slice().reverse().map(expense => {
              const payer = companions.find(c => c.id === expense.payerId);
              return (
                <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                      {expense.category === 'food' && '🍔'}
                      {expense.category === 'transport' && '🚕'}
                      {expense.category === 'stay' && '🏠'}
                      {expense.category === 'shopping' && '🛍️'}
                      {expense.category === 'other' && '🔧'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{expense.description}</p>
                      <p className="text-xs text-gray-400">
                        {payer?.name} 先付 • 分給 {expense.involvedIds.length} 人
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-xs text-red-300 hover:text-red-500 mt-1"
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
      
      {expenses.length === 0 && !isAdding && (
         <div className="text-center py-10 text-gray-400">
           <p>還沒有消費紀錄</p>
           <p className="text-xs mt-1">點擊上方按鈕開始記帳</p>
         </div>
      )}
    </div>
  );
};

export default ExpenseTracker;