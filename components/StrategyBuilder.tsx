
import React, { useState } from 'react';

const StrategyBuilder: React.FC = () => {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'TRIGGER', label: 'Price Hits Support Zone', active: true },
    { id: 2, type: 'FILTER', label: 'RSI Divergence Check', active: true },
    { id: 3, type: 'FILTER', label: 'Institutional Footprint Detected', active: true },
    { id: 4, type: 'ACTION', label: 'Initiate Long Position', active: true },
  ]);

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Strategy Lab</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Visual Logic Designer for Autonomous Nodes</p>
         </div>
         <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl hover:scale-105 transition-all">
            <i className="fa-solid fa-play mr-2"></i> Run Backtest
         </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="quantum-card p-8 rounded-[2rem] glass border-white/5 space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Node Palette</h4>
               {['Market Trigger', 'AI Filter', 'Liquidity Sweep', 'Logic Gate', 'Risk Override', 'TP/SL Dynamic'].map(item => (
                  <div key={item} className="p-4 bg-slate-950/80 rounded-xl border border-white/5 text-[10px] font-bold text-white cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-between group">
                     {item}
                     <i className="fa-solid fa-plus text-slate-700 group-hover:text-indigo-400"></i>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-3 quantum-card p-10 rounded-[3rem] glass border-white/5 min-h-[650px] relative overflow-hidden bg-[radial-gradient(circle_at_20px_20px,_rgba(255,255,255,0.03)_1px,_transparent_0)] bg-[size:40px_40px]">
            <div className="flex flex-col gap-10 items-center justify-center h-full relative z-10">
               {nodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                     <div className={`p-8 rounded-[2.5rem] border-2 w-72 text-center transition-all duration-500 group relative ${node.active ? 'bg-indigo-600/10 border-indigo-600 shadow-[0_0_40px_#6366f115]' : 'bg-slate-900/50 border-white/10 opacity-50'}`}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full text-[8px] font-black uppercase text-white shadow-lg">{node.type}</div>
                        <h5 className="text-[11px] font-black text-white uppercase tracking-widest leading-relaxed">{node.label}</h5>
                        <div className="mt-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="w-8 h-8 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white transition-all"><i className="fa-solid fa-gear text-[10px]"></i></button>
                           <button className="w-8 h-8 rounded-lg bg-slate-950 border border-white/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash text-[10px]"></i></button>
                        </div>
                     </div>
                     {idx < nodes.length - 1 && (
                        <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-indigo-600/20 relative">
                           <div className="absolute -bottom-1 -left-[3px] w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                        </div>
                     )}
                  </React.Fragment>
               ))}
            </div>
            {/* Visual Decorative */}
            <div className="absolute top-10 left-10 opacity-10 pointer-events-none">
               <i className="fa-solid fa-flask-vial text-[150px] text-white"></i>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StrategyBuilder;
