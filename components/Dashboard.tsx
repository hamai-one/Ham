
import React from 'react';
import { AppState } from '../types.ts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { balances, activeBrain, serverStatus, transactions, selectedCurrency, activeSource, tradingMode } = state;

  const sourceTransactions = transactions.filter(t => t.source === activeSource);
  const totalPnL = sourceTransactions.reduce((acc, tx) => acc + (tx.pnl || 0), 0);
  const winRate = sourceTransactions.length > 0 
    ? (sourceTransactions.filter(tx => (tx.pnl || 0) > 0).length / sourceTransactions.length * 100).toFixed(1) 
    : '0';

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return `${selectedCurrency.symbol}0.00`;
    return `${selectedCurrency.symbol}${(amount * selectedCurrency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getActiveRealBalance = () => {
    if (activeSource === 'binance') return balances.real;
    return (balances as any)[activeSource] || 0;
  };

  const activeBalanceVal = getActiveRealBalance();

  // Helper untuk Icon Broker - DISINKRONISASI LENGKAP DENGAN SIDEBAR
  const getBrokerIcon = (source: string) => {
      const map: any = {
          binance: 'fa-brands fa-bitcoin',
          fbs: 'fa-solid fa-chart-line',
          exness: 'fa-solid fa-crown',
          xm: 'fa-solid fa-shield-halved',
          ic_markets: 'fa-solid fa-bolt',
          hfm: 'fa-solid fa-fire',
          pepperstone: 'fa-solid fa-pepper-hot',
          ig_group: 'fa-solid fa-building-columns',
          plus500: 'fa-solid fa-plus',
          octafx: 'fa-solid fa-circle-nodes',
          ibkr: 'fa-solid fa-building'
      };
      return map[source] || 'fa-solid fa-server';
  };

  // Helper untuk Warna Broker (Untuk efek visual dashboard)
  // FIXED: Color Mapping Standardized (Binance=Yellow, Exness=Amber)
  const getBrokerColor = (source: string) => {
      const map: any = {
          binance: 'yellow',
          fbs: 'blue',
          exness: 'amber',
          xm: 'red',
          ic_markets: 'emerald',
          hfm: 'orange',
          pepperstone: 'rose',
          ig_group: 'indigo',
          plus500: 'sky',
          octafx: 'teal',
          ibkr: 'violet'
      };
      return map[source] || 'emerald';
  };

  const brokerColor = getBrokerColor(activeSource);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header>
        <h2 className="text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Master Node Overview</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Sacred Protocol v16.9 Active</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Simulation Balance */}
        <div className={`quantum-card p-6 rounded-[2.5rem] glass border-emerald-500/20 bg-emerald-500/[0.02] transition-all ${tradingMode === 'simulation' ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-[1.02]' : 'opacity-80'}`}>
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

        {/* Real Balance - DYNAMIC BROKER THEME */}
        <div className={`quantum-card p-6 rounded-[2.5rem] glass border-${brokerColor}-500/20 bg-${brokerColor}-500/[0.02] transition-all ${tradingMode === 'real' ? `shadow-[0_0_30px_rgba(var(--color-${brokerColor}-500),0.1)] scale-[1.02]` : 'opacity-80'}`}>
           <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                 <i className={`${getBrokerIcon(activeSource)} text-${brokerColor}-500`}></i>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real Equity ({activeSource.replace('_', ' ').toUpperCase()})</p>
              </div>
              <span className={`text-[8px] bg-${brokerColor}-500/10 text-${brokerColor}-500 px-2 py-0.5 rounded border border-${brokerColor}-500/20 font-black`}>MAINNET</span>
           </div>
           <h3 className={`text-3xl font-mono font-black text-${brokerColor}-500`}>{formatCurrency(activeBalanceVal)}</h3>
           <div className={`mt-4 flex items-center gap-2 text-${brokerColor}-500 text-[10px] font-bold`}>
              <i className="fa-solid fa-vault"></i>
              <span>Secured in {activeSource === 'binance' ? 'Exchange' : 'Broker'} Vault</span>
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
              <span>{activeSource.replace('_', ' ').toUpperCase()} Win Rate: {winRate}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 3D SACRED BRIDGE VISUALIZER */}
         <div className="lg:col-span-2 quantum-card p-0 rounded-[3rem] glass border-white/5 min-h-[400px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#020617]">
               {/* Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:40px_40px] perspective-[500px] transform rotateX(20deg)"></div>
               
               {/* Central Tunnel */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
                   <div className="relative w-[80%] h-[120px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent blur-xl"></div>
                   
                   {/* Data Particles Flowing Left to Right */}
                   <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div 
                           key={i}
                           className="absolute h-[2px] w-[100px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full animate-scan"
                           style={{ 
                              left: '-10%', 
                              top: `${40 + (i * 5)}%`,
                              animationDuration: `${2 + Math.random()}s`,
                              animationDelay: `${Math.random()}s`,
                              opacity: 0.7
                           }}
                        ></div>
                      ))}
                   </div>
               </div>

               {/* Left Node (Aeterna) */}
               <div className="absolute left-10 top-1/2 -translate-y-1/2 text-center z-10">
                   <div className="w-20 h-20 rounded-2xl bg-[#0f172a] border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-4 relative">
                       <i className="fa-solid fa-robot text-3xl text-emerald-400"></i>
                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                   </div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Aeterna Node</h4>
                   <p className="text-[8px] text-emerald-500 font-mono">Sacred Protocol</p>
               </div>

               {/* Right Node (Binance/Broker) - DYNAMIC BROKER DISPLAY */}
               <div className="absolute right-10 top-1/2 -translate-y-1/2 text-center z-10">
                   <div className={`w-20 h-20 rounded-2xl bg-[#0f172a] border border-${brokerColor}-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-${brokerColor}-500),0.2)] mb-4 relative`}>
                       <i className={`${getBrokerIcon(activeSource)} text-3xl text-${brokerColor}-400`}></i>
                       <div className={`absolute -bottom-1 -left-1 w-3 h-3 bg-${brokerColor}-500 rounded-full animate-ping`}></div>
                   </div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{activeSource.toUpperCase()} API</h4>
                   <p className={`text-[8px] text-${brokerColor}-500 font-mono`}>Encrypted Link</p>
               </div>

               {/* Connection Line with Pulse */}
               <div className={`absolute top-1/2 left-[100px] right-[100px] h-[1px] bg-gradient-to-r from-emerald-500/20 via-white/20 to-${brokerColor}-500/20 -translate-y-1/2`}></div>
            </div>
            
            {/* Overlay Info */}
            <div className="absolute bottom-6 left-10 z-20">
               <div className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-emerald-500 text-[10px]"></i>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E2E ENCRYPTION: <span className="text-white">VERIFIED</span></span>
               </div>
            </div>
         </div>

         {/* System Health Matrix */}
         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5 space-y-8">
            <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-widest border-b border-white/5 pb-6">System Health Matrix</h4>
            <div className="space-y-6">
               {[
                 { label: 'DeepSeek R1 Processing', value: 88, color: 'bg-indigo-500' },
                 { label: `Sacred Uplink (${activeSource.toUpperCase()})`, value: 99, color: `bg-${brokerColor}-500` },
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
