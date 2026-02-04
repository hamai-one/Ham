
import React, { useState } from 'react';
import { TradingSource, Currency } from '../types';

interface AssetsProps {
  balances: Record<TradingSource, number> & { simulation: number; real: number };
  onRefresh?: () => void;
  isReal?: boolean;
  activeSource: TradingSource;
  selectedCurrency: Currency;
}

const Assets: React.FC<AssetsProps> = ({ balances, onRefresh, isReal, activeSource, selectedCurrency }) => {
  const rate = selectedCurrency.rate;
  const symbol = selectedCurrency.symbol;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Deteksi Tipe Broker: Apakah Crypto (Binance) atau Forex/CFD (Sisanya)
  const isCryptoBroker = activeSource === 'binance' || activeSource === 'bybit'; 
  const isForexBroker = !isCryptoBroker;

  const handleRefresh = () => {
      setIsRefreshing(true);
      if(onRefresh) onRefresh();
      setTimeout(() => setIsRefreshing(false), 2000);
  };

  const formatVal = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '0.00';
    if (typeof val === 'number') {
        return (val * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return val;
    return (num * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  const cryptoAssets = [
    { name: 'Bitcoin', symbol: 'BTC', balance: isReal ? 'Synced' : '0.4211', value: '28,810.50', change: '+2.4%', icon: 'fa-brands fa-bitcoin', color: 'text-amber-500', fee: '0.1%' },
    { name: 'Ethereum', symbol: 'ETH', balance: isReal ? 'Synced' : '5.2400', value: '18,078.20', change: '+1.8%', icon: 'fa-brands fa-ethereum', color: 'text-blue-500', fee: '0.1%' },
    { name: 'Tether', symbol: 'USDT', balance: isReal ? 'Synced' : 'Available', value: isReal ? balances.real : balances.simulation, change: '0.0%', icon: 'fa-solid fa-dollar-sign', color: 'text-teal-500', fee: '0.0%' },
  ];

  const forexAssets = [
    { name: 'Euro / USD', symbol: 'EURUSD', balance: isReal ? 'Synced' : '10.0 Lot', value: '10,854.20', change: '+0.15%', icon: 'fa-solid fa-euro-sign', color: 'text-blue-400', fee: 'Spread' },
    { name: 'Pound / USD', symbol: 'GBPUSD', balance: isReal ? 'Synced' : '5.0 Lot', value: '12,400.00', change: '-0.05%', icon: 'fa-solid fa-sterling-sign', color: 'text-indigo-400', fee: 'Spread' },
    { name: 'Gold / USD', symbol: 'XAUUSD', balance: isReal ? 'Synced' : '2.0 Lot', value: '4,600.50', change: '+1.2%', icon: 'fa-solid fa-gem', color: 'text-amber-500', fee: 'Swap' },
    { name: 'USD / JPY', symbol: 'USDJPY', balance: isReal ? 'Synced' : '15.0 Lot', value: '8,200.10', change: '-0.3%', icon: 'fa-solid fa-yen-sign', color: 'text-rose-400', fee: 'Spread' },
    { name: 'Broker Wallet', symbol: 'EQUITY', balance: isReal ? 'Synced' : 'Balance', value: isReal ? (balances as any)[activeSource] : balances.simulation, change: '0.0%', icon: 'fa-solid fa-wallet', color: 'text-emerald-500', fee: '0.0%' },
  ];

  const assetsToDisplay = isCryptoBroker ? cryptoAssets : forexAssets;

  return (
    <div className="space-y-8 animate-fadeIn pb-24 w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h2 className="text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Assets Vault</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
               Secure Ledger: <span className="text-emerald-500">{activeSource.toUpperCase()}</span>
            </p>
         </div>
         <button 
           onClick={handleRefresh}
           className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-2xl active:scale-95 flex items-center gap-3"
         >
           <i className={`fa-solid fa-arrows-rotate ${isRefreshing ? 'animate-spin' : ''}`}></i>
           {isRefreshing ? 'Syncing...' : 'Scan Assets'}
         </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
         <div className="quantum-card rounded-[3rem] p-1 glass border-white/5 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar rounded-[2.5rem] bg-slate-950/40">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50">
                         <th className="p-6">Asset Name</th>
                         <th className="p-6">Balance</th>
                         <th className="p-6 text-right">Value ({selectedCurrency.code})</th>
                         <th className="p-6 text-right">24H Change</th>
                         <th className="p-6 text-right">Fee / Spread</th>
                         <th className="p-6 text-center">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {assetsToDisplay.map((asset, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center ${asset.color} text-lg shadow-inner group-hover:scale-110 transition-transform`}>
                                     <i className={asset.icon}></i>
                                  </div>
                                  <div>
                                     <p className="text-white font-bold">{asset.name}</p>
                                     <p className="text-[9px] text-slate-600">{asset.symbol}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6 text-slate-300 font-bold">{asset.balance}</td>
                            <td className="p-6 text-right font-black text-white">
                               {symbol} {formatVal(asset.value)}
                            </td>
                            <td className={`p-6 text-right font-bold ${asset.change.includes('+') ? 'text-emerald-400' : 'text-rose-500'}`}>
                               {asset.change}
                            </td>
                            <td className="p-6 text-right text-slate-500 text-[10px] uppercase font-bold">{asset.fee}</td>
                            <td className="p-6 text-center">
                               <button className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all">
                                  <i className="fa-solid fa-ellipsis"></i>
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Allocation Distribution</h4>
            <div className="flex items-center gap-8">
               <div className="w-40 h-40 rounded-full border-[10px] border-slate-800 relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[10px] border-emerald-500 border-l-transparent border-b-transparent rotate-45"></div>
                  <span className="text-2xl font-black text-white">72%</span>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Available Margin</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Locked in Orders</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="quantum-card p-10 rounded-[3rem] glass border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Recent Wallet Activity</h4>
            <div className="space-y-4">
               {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs">
                           <i className="fa-solid fa-arrow-down"></i>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-white uppercase">Deposit (Internal)</p>
                           <p className="text-[8px] text-slate-600">Today, 10:4{i} AM</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-emerald-400">+ $500.00</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Assets;
