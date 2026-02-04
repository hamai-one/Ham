
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MarketIntel: React.FC = () => {
  const WhaleMovements = [
    { id: 1, time: '2 mins ago', asset: 'BTC', amount: '2,400', from: 'Unknown Wallet', to: 'Binance', type: 'INFLOW' },
    { id: 2, time: '12 mins ago', asset: 'ETH', amount: '45,000', from: 'Coinbase', to: 'Cold Wallet', type: 'OUTFLOW' },
    { id: 3, time: '45 mins ago', asset: 'SOL', amount: '800,000', from: 'Unknown Wallet', to: 'Kraken', type: 'INFLOW' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header>
         <h2 className="text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Global Market Intel</h2>
         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Aggregating Institutional Footprints & Whale Tracks</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Fear & Greed Gauge */}
         <div className="quantum-card p-10 rounded-[3rem] glass flex flex-col items-center justify-center border-amber-500/20">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Fear & Greed Index</h4>
            <div className="relative w-48 h-48 rounded-full border-[12px] border-slate-900 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-[12px] border-amber-500 border-t-transparent border-l-transparent rotate-[45deg] shadow-[0_0_20px_#f59e0b40]"></div>
               <div className="text-center">
                  <span className="text-5xl font-mono font-black text-amber-500">74</span>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2">GREED</p>
               </div>
            </div>
            <p className="mt-8 text-[11px] text-slate-400 text-center leading-relaxed font-bold">Pasar dalam kondisi euforia. <br/> Pertimbangkan untuk mengurangi leverage agresif.</p>
         </div>

         {/* Whale Tracker */}
         <div className="lg:col-span-2 quantum-card p-10 rounded-[3rem] glass border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex justify-between items-center">
               Whale Alert Stream
               <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[8px] animate-pulse">LIVE FEED</span>
            </h4>
            <div className="space-y-4">
               {WhaleMovements.map(move => (
                  <div key={move.id} className="flex items-center justify-between p-5 bg-slate-950/60 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                     <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${move.type === 'INFLOW' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           <i className={`fa-solid ${move.type === 'INFLOW' ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket'}`}></i>
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm">{move.amount} {move.asset} <span className="text-[10px] text-slate-500 ml-2">{move.time}</span></p>
                           <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">{move.from} → {move.to}</p>
                        </div>
                     </div>
                     <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${move.type === 'INFLOW' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {move.type}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5 h-[400px]">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Institutional Order Flow Index</h4>
            <div className="flex-1 h-64 border border-dashed border-white/10 rounded-3xl bg-slate-950/30 flex items-center justify-center">
               <div className="text-center">
                  <i className="fa-solid fa-tower-broadcast text-4xl text-slate-800 mb-4 animate-pulse"></i>
                  <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Awaiting Synchronized Node Approval...</p>
               </div>
            </div>
         </div>
         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5 h-[400px]">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Correlation Matrix (DXY vs Crypto)</h4>
            <div className="grid grid-cols-3 gap-2">
               {['BTC', 'ETH', 'SOL', 'GOLD', 'NASDAQ', 'DXY'].map(item => (
                  <div key={item} className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                     <span className="text-[9px] font-black text-slate-500">{item}</span>
                     <span className="text-lg font-mono font-black text-white">0.8{Math.floor(Math.random()*9)}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default MarketIntel;
