
import React from 'react';
import { TradingSource, Currency } from '../types';

interface AssetsProps {
  balances: { simulation: number; real: number; fbs: number };
  onRefresh?: () => void;
  isReal?: boolean;
  activeSource: TradingSource;
  selectedCurrency: Currency;
}

const Assets: React.FC<AssetsProps> = ({ balances, onRefresh, isReal, activeSource, selectedCurrency }) => {
  const isFBS = activeSource === 'fbs';
  const rate = selectedCurrency.rate;
  const symbol = selectedCurrency.symbol;

  const formatVal = (val: string | number) => {
    if (typeof val === 'number') {
        return (val * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    // Try to parse string number
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return val;
    return (num * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  const binanceAssets = [
    { name: 'Bitcoin', symbol: 'BTC', balance: isReal ? 'Synced' : '0.4211', value: '28,810.50', change: '+2.4%', icon: 'fa-brands fa-bitcoin', color: 'text-amber-500', fee: '0.1%' },
    { name: 'Ethereum', symbol: 'ETH', balance: isReal ? 'Synced' : '5.2400', value: '18,078.20', change: '+1.8%', icon: 'fa-brands fa-ethereum', color: 'text-blue-500', fee: '0.1%' },
    { name: 'Tether', symbol: 'USDT', balance: (isReal ? balances.real : balances.simulation).toFixed(2), value: (isReal ? balances.real : balances.simulation).toFixed(2), change: '0.0%', icon: 'fa-solid fa-dollar-sign', color: 'text-teal-500', fee: '0.0%' },
  ];

  const fbsAssets = [
    { name: 'Euro / USD', symbol: 'EURUSD', balance: isReal ? 'Synced' : '10,000', value: '10,854.20', change: '+0.15%', icon: 'fa-solid fa-euro-sign', color: 'text-blue-400', fee: 'Spread' },
    { name: 'Pound / USD', symbol: 'GBPUSD', balance: isReal ? 'Synced' : '5,000', value: '6,342.10', change: '-0.05%', icon: 'fa-solid fa-sterling-sign', color: 'text-indigo-400', fee: 'Spread' },
    { name: 'Gold / USD', symbol: 'XAUUSD', balance: isReal ? 'Synced' : '20.5', value: '48,210.30', change: '+1.2%', icon: 'fa-solid fa-gem', color: 'text-amber-400', fee: 'Commission' },
  ];

  const assets = isFBS ? fbsAssets : binanceAssets;
  const totalEquity = isFBS ? (isReal ? balances.fbs : balances.simulation) : (isReal ? balances.real : balances.simulation);

  return (
    <div className="space-y-8 animate-fadeIn pb-24 px-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-orbitron font-bold uppercase tracking-tighter gradient-text">Wealth Vault ({activeSource.toUpperCase()})</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Quantum Allocation & Institutional Settlement</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onRefresh} className={`px-6 py-3 ${isFBS ? 'bg-blue-600/10 border-blue-600/30 text-blue-400' : 'bg-indigo-600/10 border-indigo-600/30 text-indigo-400'} border rounded-xl hover:brightness-125 transition-all text-[10px] font-black uppercase flex items-center gap-2`}>
              <i className="fa-solid fa-sync"></i> Refresh Node
           </button>
           <div className={`px-6 py-3 ${isFBS ? 'bg-blue-500/10 border-blue-500/30' : 'bg-teal-500/10 border-teal-500/30'} rounded-xl shadow-lg border`}>
              <div className="flex items-center gap-3">
                 <i className={`fa-solid fa-receipt ${isFBS ? 'text-blue-400' : 'text-teal-400'}`}></i>
                 <p className={`text-[11px] font-black ${isFBS ? 'text-blue-400' : 'text-teal-500'} uppercase`}>{isFBS ? 'Spread Trading' : 'Fee: 0.1%'}</p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="quantum-card p-10 rounded-[3.5rem] border-white/5 glass relative shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
               <h4 className="font-orbitron font-bold text-base uppercase tracking-widest text-slate-400">Ledger Index</h4>
               <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full border ${isReal ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : (isFBS ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')}`}>
                  {isReal ? `LIVE ${activeSource.toUpperCase()} UPLINK` : 'SIMULATION MODE'}
               </span>
            </div>
            <div className="space-y-5">
              {assets.map((asset, i) => (
                <div key={i} className={`group flex items-center justify-between p-6 rounded-[2.5rem] border border-white/5 ${isFBS ? 'hover:border-blue-500/20' : 'hover:border-teal-500/20'} transition-all hover:bg-white/[0.03] shadow-inner relative overflow-hidden`}>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-2xl shadow-xl transform group-hover:scale-110 transition-all ${asset.color}`}>
                      <i className={asset.icon}></i>
                    </div>
                    <div>
                      <h5 className="font-bold text-lg tracking-tight">{asset.name}</h5>
                      <p className="text-[12px] text-slate-500 font-mono font-bold">{asset.balance} {asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-mono font-black text-xl text-white tracking-tighter">{symbol}{formatVal(asset.value)}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${asset.change.startsWith('+') ? (isFBS ? 'text-blue-400' : 'text-teal-400') : 'text-slate-500'}`}>{asset.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className={`quantum-card p-10 rounded-[3rem] border-white/5 glass bg-gradient-to-br ${isFBS ? 'from-blue-500/[0.05]' : 'from-teal-500/[0.05]'} to-transparent shadow-2xl relative overflow-hidden group`}>
             <h4 className="font-orbitron font-bold mb-8 text-xs uppercase tracking-widest text-slate-500">Current Liquidity</h4>
             <div className="flex flex-col items-center justify-center py-4">
                <div className="w-60 h-60 rounded-full border-[15px] border-slate-950 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.4)]">
                   <div className={`absolute inset-0 border-[15px] ${isReal ? 'border-amber-500 shadow-[0_0_20px_#f59e0b40]' : (isFBS ? 'border-blue-500 shadow-[0_0_20px_#3b82f640]' : 'border-teal-500 shadow-[0_0_20px_#2dd4bf40]')} border-t-transparent border-r-transparent rounded-full rotate-45`}></div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">TOTAL EQUITY</p>
                      <p className={`text-3xl font-mono font-black tracking-tighter ${isReal ? 'text-amber-500' : (isFBS ? 'text-blue-400' : 'text-teal-400')}`}>
                         {symbol}{formatVal(totalEquity)}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
