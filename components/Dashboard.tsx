
import React from 'react';
import { AppState } from '../types.ts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { balances, activeBrain, serverStatus, transactions, selectedCurrency } = state;

  const totalPnL = transactions.reduce((acc, tx) => acc + (tx.pnl || 0), 0);
  const winRate = transactions.length > 0 
    ? (transactions.filter(tx => (tx.pnl || 0) > 0).length / transactions.length * 100).toFixed(1) 
    : '0';

  const formatCurrency = (amount: number) => {
    return `${selectedCurrency.symbol}${(amount * selectedCurrency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header>
        <h2 className="text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Master Node Overview</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Real-time Neural Performance Monitoring</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Simulation Balance */}
        <div className="quantum-card p-6 rounded-[2.5rem] glass border-emerald-500/20 bg-emerald-500/[0.02]">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulation Equity</p>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black">TESTNET</span>
           </div>
           <h3 className="text-3xl font-mono font-black text-white">{formatCurrency(balances.simulation)}</h3>
           <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
              <i className="fa-solid fa-flask"></i>
              <span>Ready for Neural Testing</span>
           </div>
        </div>

        {/* Real Balance */}
        <div className="quantum-card p-6 rounded-[2.5rem] glass border-amber-500/20 bg-amber-500/[0.02]">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real Node Equity</p>
              <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-black">MAINNET</span>
           </div>
           <h3 className="text-3xl font-mono font-black text-amber-500">{formatCurrency(balances.real)}</h3>
           <div className="mt-4 flex items-center gap-2 text-amber-500 text-[10px] font-bold">
              <i className="fa-solid fa-vault"></i>
              <span>Secured in Wealth Vault</span>
           </div>
        </div>

        <div className="quantum-card p-6 rounded-[2.5rem] glass border-indigo-500/20 relative overflow-hidden">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Core Status</p>
           <h3 className="text-2xl font-orbitron font-black text-indigo-400">{activeBrain === 'DEEPSEEK_R1' ? 'DEEPSEEK R1' : 'GEMINI 3'}</h3>
           <div className="mt-4 flex items-center gap-2 text-indigo-400 text-[10px] font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>SYNCHRONIZED</span>
           </div>
        </div>

        <div className="quantum-card p-6 rounded-[2.5rem] glass border-white/10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Uptime & Latency</p>
           <h3 className="text-2xl font-mono font-black text-white">{serverStatus.latency}ms / <span className="text-slate-500 text-sm">{serverStatus.uptime.split(' ')[0]}</span></h3>
           <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
              <i className="fa-solid fa-circle-check"></i>
              <span>Accuracy: {winRate}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 quantum-card p-10 rounded-[3rem] glass border-white/5 min-h-[400px] flex flex-col">
            <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-widest mb-10 flex items-center justify-between">
               <span>Institutional Liquidity Map</span>
               <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">LIVE SCANNING</span>
            </h4>
            <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-slate-950/30">
               <div className="text-center">
                  <i className="fa-solid fa-radar text-4xl text-slate-800 mb-4 animate-pulse"></i>
                  <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Aggregating Order Flow Data from Global Nodes...</p>
               </div>
            </div>
         </div>
         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5 space-y-8">
            <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-widest border-b border-white/5 pb-6">System Health Matrix</h4>
            <div className="space-y-6">
               {[
                 { label: 'DeepSeek R1 Processing', value: 88, color: 'bg-indigo-500' },
                 { label: 'Binance API Uplink', value: 99, color: 'bg-emerald-500' },
                 { label: 'Risk Safeguard Buffer', value: 95, color: 'bg-amber-500' },
                 { label: 'Creative Synth Engine', value: 42, color: 'bg-purple-500' }
               ].map((h, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                       <span>{h.label}</span>
                       <span>{h.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                       <div className={`h-full ${h.color} transition-all duration-[2000ms] shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${h.value}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
