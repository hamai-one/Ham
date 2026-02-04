
import React from 'react';
import { AppState } from '../types.ts';

interface JournalProps {
  state: AppState;
}

const Journal: React.FC<JournalProps> = ({ state }) => {
  const { transactions } = state;
  const history = transactions.filter(t => t.status !== 'OPEN');

  const stats = {
    total: history.length,
    wins: history.filter(tx => (tx.pnl || 0) > 0).length,
    loss: history.filter(tx => (tx.pnl || 0) < 0).length,
    netPnL: history.reduce((acc, tx) => acc + (tx.pnl || 0), 0)
  };

  const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0';
  const profitFactor = (Math.abs(history.filter(tx => (tx.pnl || 0) > 0).reduce((a, b) => a + (b.pnl || 0), 0)) / (Math.abs(history.filter(tx => (tx.pnl || 0) < 0).reduce((a, b) => a + (b.pnl || 0), 0)) || 1)).toFixed(2);

  return (
    <div className="space-y-8 animate-fadeIn pb-32 w-full max-w-full overflow-hidden">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-orbitron font-bold gradient-text uppercase tracking-tighter">Quantum Journal</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Verified Institutional Audit Log</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-slate-950/80 border border-white/5 rounded-2xl text-center shadow-inner">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Profit Factor</p>
                <p className="text-xl font-mono font-black text-indigo-400">{profitFactor}</p>
             </div>
             <div className="px-6 py-3 bg-slate-950/80 border border-white/5 rounded-2xl text-center shadow-inner">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-xl font-mono font-black text-emerald-400">{winRate}%</p>
             </div>
          </div>
       </header>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Executions', val: stats.total, sub: 'Cycle Count' },
            { label: 'Winning Strikes', val: stats.wins, sub: 'Positive Bias' },
            { label: 'Drawdown Logs', val: stats.loss, sub: 'Neural Correction' },
            { label: 'Net Cumulative Yield', val: `${stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}`, sub: 'USDT Base' }
          ].map((s, i) => (
            <div key={i} className="quantum-card p-6 rounded-[2rem] glass border-white/5 shadow-xl">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
               <p className={`text-2xl font-mono font-black ${s.label.includes('Yield') ? (stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-500') : 'text-white'}`}>{s.val}</p>
               <p className="text-[8px] font-bold text-slate-600 uppercase mt-2">{s.sub}</p>
            </div>
          ))}
       </div>

       <div className="quantum-card rounded-[3.5rem] glass border-white/5 p-8 shadow-2xl overflow-hidden min-h-[500px] relative w-full">
          <div className="flex justify-between items-center mb-8 relative z-10">
             <h4 className="font-orbitron font-black text-xs text-white uppercase tracking-widest">Historical Transaction Matrix</h4>
             <button className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[8px] font-black uppercase text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all">
                <i className="fa-solid fa-download mr-2"></i> Export CSV
             </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar relative z-10">
             <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                   <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      <th className="px-6 py-2">ID</th>
                      <th className="px-6 py-2">Asset</th>
                      <th className="px-6 py-2">Side</th>
                      <th className="px-6 py-2 text-right">Final PnL (USDT)</th>
                      <th className="px-6 py-2 text-right">Synchronization</th>
                      <th className="px-6 py-2 text-right">Status</th>
                   </tr>
                </thead>
                <tbody className="font-mono text-[10px]">
                   {history.length === 0 ? (
                      <tr>
                         <td colSpan={6} className="text-center py-20 text-slate-700 uppercase font-black tracking-widest">Archive Empty. Execute trades to generate logs.</td>
                      </tr>
                   ) : (
                      history.map(tx => (
                        <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="px-6 py-4 bg-slate-950/40 rounded-l-2xl border-y border-l border-white/5 text-slate-600">#{tx.id}</td>
                           <td className="px-6 py-4 bg-slate-950/40 border-y border-white/5 font-black text-white uppercase">{tx.asset}</td>
                           <td className="px-6 py-4 bg-slate-950/40 border-y border-white/5">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${tx.type === 'BUY' ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'}`}>{tx.type}</span>
                           </td>
                           <td className={`px-6 py-4 bg-slate-950/40 border-y border-white/5 font-black text-right text-sm ${ (tx.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {tx.pnl ? `${tx.pnl >= 0 ? '+' : ''}${tx.pnl.toFixed(2)}` : '0.00'}
                           </td>
                           <td className="px-6 py-4 bg-slate-950/40 border-y border-white/5 text-right text-slate-500 text-[9px]">{new Date(tx.timestamp).toLocaleString()}</td>
                           <td className="px-6 py-4 bg-slate-950/40 rounded-r-2xl border-y border-r border-white/5 text-right">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">{tx.status}</span>
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default Journal;
