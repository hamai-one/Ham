
import React, { useState } from 'react';
import { AppState } from '../types.ts';

interface HistoryProps {
  state: AppState;
}

const History: React.FC<HistoryProps> = ({ state }) => {
  const { transactions, activeSource, selectedCurrency } = state;
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  const history = transactions
    .filter(t => t.source === activeSource && t.status !== 'OPEN')
    .filter(t => {
       if (filterPeriod === 'ALL') return true;
       const txDate = new Date(t.timestamp);
       const now = new Date();
       if (filterPeriod === 'TODAY') return txDate.setHours(0,0,0,0) === now.setHours(0,0,0,0);
       if (filterPeriod === 'WEEK') {
           const weekAgo = new Date();
           weekAgo.setDate(now.getDate() - 7);
           return txDate >= weekAgo;
       }
       if (filterPeriod === 'MONTH') {
           const monthAgo = new Date();
           monthAgo.setMonth(now.getMonth() - 1);
           return txDate >= monthAgo;
       }
       return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatMoney = (amount: number) => {
    return `${selectedCurrency.symbol}${(amount * selectedCurrency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPnL = history.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const totalFees = history.reduce((acc, t) => acc + (t.fee || 0), 0);
  const winCount = history.filter(t => (t.pnl || 0) > 0).length;
  const winRate = history.length > 0 ? ((winCount / history.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fadeIn pb-32 w-full max-w-full overflow-hidden">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-orbitron font-bold gradient-text uppercase tracking-tighter">History Log</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
               Full Transaction Audit: <span className="text-emerald-500">{activeSource.toUpperCase()}</span>
            </p>
          </div>
          <div className="flex bg-slate-950/80 rounded-2xl p-1.5 border border-white/5 shadow-inner">
             {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setFilterPeriod(p as any)}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${filterPeriod === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {p}
                </button>
             ))}
          </div>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="quantum-card p-6 rounded-[2rem] glass border-white/5 flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net PnL (Period)</p>
             <h3 className={`text-3xl font-mono font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatMoney(totalPnL)}
             </h3>
          </div>
          <div className="quantum-card p-6 rounded-[2rem] glass border-white/5 flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Fees Paid</p>
             <h3 className="text-3xl font-mono font-black text-amber-500">
                {formatMoney(totalFees)}
             </h3>
          </div>
          <div className="quantum-card p-6 rounded-[2rem] glass border-white/5 flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Win Rate Efficiency</p>
             <h3 className="text-3xl font-mono font-black text-blue-400">
                {winRate}%
             </h3>
          </div>
       </div>

       <div className="quantum-card rounded-[3rem] glass border-white/5 p-8 shadow-2xl relative">
          <h4 className="font-orbitron font-black text-xs text-white uppercase tracking-widest mb-6">Detailed Ledger</h4>
          
          <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="p-4 whitespace-nowrap">Time (Open/Close)</th>
                      <th className="p-4 whitespace-nowrap">Asset / Type</th>
                      <th className="p-4 whitespace-nowrap text-right">Volume</th>
                      <th className="p-4 whitespace-nowrap text-right">Price (In/Out)</th>
                      <th className="p-4 whitespace-nowrap text-right">Fee</th>
                      <th className="p-4 whitespace-nowrap text-right">PnL</th>
                      <th className="p-4 whitespace-nowrap text-right">Balance (Before -> After)</th>
                      <th className="p-4 whitespace-nowrap text-center">Status</th>
                   </tr>
                </thead>
                <tbody className="font-mono text-[10px]">
                   {history.length === 0 ? (
                      <tr>
                         <td colSpan={8} className="text-center py-20 text-slate-700 italic uppercase font-black tracking-widest">No transaction records found for this period.</td>
                      </tr>
                   ) : (
                      history.map(tx => {
                         const balanceBefore = tx.balanceSnapshot?.before || 0;
                         const balanceAfter = tx.balanceSnapshot?.after || 0;
                         
                         return (
                            <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                               <td className="p-4">
                                  <div className="flex flex-col">
                                     <span className="text-white font-bold">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                     <span className="text-[8px] text-slate-600">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                     {tx.closeTimestamp && (
                                        <span className="text-[8px] text-slate-700 mt-1">Closed: {new Date(tx.closeTimestamp).toLocaleTimeString()}</span>
                                     )}
                                  </div>
                               </td>
                               <td className="p-4">
                                  <div className="flex items-center gap-2">
                                     <span className={`w-1.5 h-8 rounded-full ${tx.type.includes('BUY') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                     <div className="flex flex-col">
                                        <span className="text-white font-bold">{tx.asset}</span>
                                        <span className={`text-[8px] font-black uppercase ${tx.type.includes('BUY') ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.type.replace('AUTO_', '')}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-4 text-right text-slate-300">
                                  {tx.amount} <span className="text-[8px] text-slate-600">Vol</span>
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex flex-col">
                                     <span className="text-slate-300">In: {tx.price}</span>
                                     {tx.closePrice && <span className="text-slate-500">Out: {tx.closePrice.toFixed(2)}</span>}
                                  </div>
                               </td>
                               <td className="p-4 text-right text-amber-500">
                                  -{formatMoney(tx.fee || 0)}
                               </td>
                               <td className={`p-4 text-right font-black ${ (tx.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                  {(tx.pnl || 0) >= 0 ? '+' : ''}{formatMoney(tx.pnl || 0)}
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex flex-col items-end gap-1">
                                     <span className="text-[9px] text-slate-500">{formatMoney(balanceBefore)}</span>
                                     <i className="fa-solid fa-arrow-down text-[8px] text-slate-700"></i>
                                     <span className="text-white font-bold">{formatMoney(balanceAfter)}</span>
                                  </div>
                               </td>
                               <td className="p-4 text-center">
                                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${tx.status.includes('CLOSED') ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                     {tx.status}
                                  </span>
                               </td>
                            </tr>
                         );
                      })
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default History;
