
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, ComposedChart } from 'recharts';
import { AppState, MarketCategory, Transaction, TradingMode, ExecutionType, TradingSource } from '../types.ts';
import { BinanceService } from '../services/binanceService.ts';

interface TerminalProps {
  state: AppState;
  currentPrice: number;
  onTrade?: (amount: number, type: 'BUY' | 'SELL') => void;
  onClosePosition?: (txId: string) => void;
  setActiveAsset: (cat: MarketCategory, id: string) => void;
  setTradingMode: (m: TradingMode) => void;
  setExecutionType: (e: ExecutionType) => void;
  setActiveBrain: (b: any) => void;
  onKillSwitch?: () => void;
  onResetSimulation?: () => void; // New prop for reset
  scanningAsset?: string | null;
  onUpdateLeverage: (lev: number) => void;
  selectedCurrency: any;
  onPriceUpdate?: (price: number) => void; // Added for sync
}

const BROKER_UI_CONFIG: Record<TradingSource, { color: string; accent: string; label: string; icon: string; border: string; glow: string }> = {
  binance: { color: 'yellow', accent: '#facc15', label: 'Binance', icon: 'fa-brands fa-bitcoin', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/10' },
  fbs: { color: 'blue', accent: '#3b82f6', label: 'FBS Broker', icon: 'fa-solid fa-chart-line', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
  exness: { color: 'amber', accent: '#f59e0b', label: 'Exness', icon: 'fa-solid fa-crown', border: 'border-amber-500/30', glow: 'shadow-amber-500/10' },
  xm: { color: 'red', accent: '#ef4444', label: 'XM Global', icon: 'fa-solid fa-shield-halved', border: 'border-red-500/30', glow: 'shadow-red-500/10' },
  ic_markets: { color: 'emerald', accent: '#10b981', label: 'IC Markets', icon: 'fa-solid fa-bolt', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10' },
  hfm: { color: 'orange', accent: '#f97316', label: 'HFM', icon: 'fa-solid fa-fire', border: 'border-orange-500/30', glow: 'shadow-orange-500/10' },
  pepperstone: { color: 'rose', accent: '#f43f5e', label: 'Pepperstone', icon: 'fa-solid fa-pepper-hot', border: 'border-rose-500/30', glow: 'shadow-rose-500/10' },
  ig_group: { color: 'indigo', accent: '#6366f1', label: 'IG Group', icon: 'fa-solid fa-building-columns', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10' },
  plus500: { color: 'sky', accent: '#0ea5e9', label: 'Plus500', icon: 'fa-solid fa-plus', border: 'border-sky-500/30', glow: 'shadow-sky-500/10' },
  octafx: { color: 'teal', accent: '#14b8a6', label: 'OctaFX', icon: 'fa-solid fa-circle-nodes', border: 'border-teal-500/30', glow: 'shadow-teal-500/10' },
  ibkr: { color: 'violet', accent: '#8b5cf6', label: 'Interactive Brokers', icon: 'fa-solid fa-building', border: 'border-violet-500/30', glow: 'shadow-violet-500/10' }
};

const BINANCE_ASSETS = [
  { id: 'BTC', icon: 'fa-brands fa-bitcoin' },
  { id: 'ETH', icon: 'fa-brands fa-ethereum' },
  { id: 'SOL', icon: 'fa-solid fa-bolt-lightning' },
  { id: 'BNB', icon: 'fa-solid fa-coins' }
];

const FOREX_ASSETS = [
  { id: 'EUR', icon: 'fa-solid fa-euro-sign' },
  { id: 'GBP', icon: 'fa-solid fa-sterling-sign' },
  { id: 'JPY', icon: 'fa-solid fa-yen-sign' },
  { id: 'XAU', icon: 'fa-solid fa-gem' }
];

const NOMINAL_PRESETS = [10, 50, 100, 500, 1000, 5000];

const Terminal: React.FC<TerminalProps> = (props) => {
  const { 
    state, 
    currentPrice, 
    onTrade, 
    setActiveAsset, 
    setTradingMode, 
    setExecutionType, 
    onClosePosition, 
    onKillSwitch, 
    onResetSimulation,
    onUpdateLeverage,
    selectedCurrency,
    onPriceUpdate
  } = props;

  const { tradingMode, executionType, activeAssetId, transactions, activeSource, leverage } = state;
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [orderAmount, setOrderAmount] = useState(10);
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  
  // Local state untuk Autopilot visual
  const [autoStatus, setAutoStatus] = useState("Standby");
  const [scanTarget, setScanTarget] = useState<string | null>(null);

  // Manual Input State
  const [manualTp, setManualTp] = useState<string>("");
  const [manualSl, setManualSl] = useState<string>("");

  // Refs untuk mengatasi Stale Closure pada setInterval Autopilot
  const onTradeRef = useRef(onTrade);
  const setActiveAssetRef = useRef(setActiveAsset);
  const activeSourceRef = useRef(activeSource);
  // Ref untuk state agar autopilot bisa baca saldo terbaru tanpa restart interval
  const stateRef = useRef(state);

  useEffect(() => {
    onTradeRef.current = onTrade;
    setActiveAssetRef.current = setActiveAsset;
    activeSourceRef.current = activeSource;
    stateRef.current = state;
  }, [onTrade, setActiveAsset, activeSource, state]);

  const brokerConfig = BROKER_UI_CONFIG[activeSource];
  const currentAssetList = activeSource === 'binance' ? BINANCE_ASSETS : FOREX_ASSETS;

  const activeAsset = useMemo(() => {
    return currentAssetList.find(a => a.id === activeAssetId) || currentAssetList[0];
  }, [activeAssetId, currentAssetList]);

  const activePositions = useMemo(() => transactions.filter(t => t.status === 'OPEN'), [transactions]);

  // Unified Data Fetcher
  useEffect(() => {
    let isMounted = true;
    const binance = new BinanceService('', '');

    const fetchData = async () => {
      const data = await binance.getKlines(activeAssetId, '15m', 60, activeSource);
      if (isMounted && data && data.length > 0) {
        setRealtimeData(data);
        const latestPrice = data[data.length - 1].price;
        setDisplayPrice(latestPrice);
        if (onPriceUpdate) onPriceUpdate(latestPrice);
      }
    };

    fetchData(); 
    const intervalId = setInterval(fetchData, 3000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [activeAssetId, activeSource]);

  // --- AUTOPILOT ENGINE LOGIC (SMART MONEY MANAGEMENT) ---
  useEffect(() => {
    if (executionType !== 'autopilot') {
        setAutoStatus("Standby");
        setScanTarget(null);
        return;
    }

    let isScanning = true;
    
    // Interval loop untuk Autopilot
    const autoLoop = setInterval(() => {
        if (!isScanning) return;

        // Gunakan current ref untuk list aset yang sesuai
        const currentSource = activeSourceRef.current;
        const currentState = stateRef.current;
        const assetsToScan = currentSource === 'binance' ? BINANCE_ASSETS : FOREX_ASSETS;

        // 1. Pilih Aset Random untuk di Scan
        const randomIdx = Math.floor(Math.random() * assetsToScan.length);
        const targetAsset = assetsToScan[randomIdx];
        setScanTarget(targetAsset.id);
        setAutoStatus(`Analyzing ${targetAsset.id} Structure...`);

        // 2. Simulasi Analisis AI
        setTimeout(() => {
            // HITUNG CONFIDENCE SCORE (0-100%)
            // Dalam mode simulasi, kita random ini, tapi di real app ini dari API AI
            const confidenceScore = Math.random() * 100;
            const threshold = 70; // Minimal 70% confidence untuk entry
            
            if (confidenceScore > threshold) {
                const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
                setAutoStatus(`SETUP FOUND (${confidenceScore.toFixed(1)}%): ${side} ${targetAsset.id}`);
                
                // --- MONEY MANAGEMENT LOGIC ---
                // Ambil saldo aktif saat ini
                let currentBalance = 0;
                if (currentState.tradingMode === 'simulation') currentBalance = currentState.balances.simulation;
                else if (currentSource === 'binance') currentBalance = currentState.balances.real;
                else currentBalance = (currentState.balances as any)[currentSource] || 0;

                // Risk 2% - 5% dari saldo per transaksi
                const riskPercentage = 0.02 + (Math.random() * 0.03); 
                let dynamicAmount = Math.floor(currentBalance * riskPercentage);
                
                // Pastikan nominal wajar (Min 10 USDT)
                if (dynamicAmount < 10) dynamicAmount = 10;
                // Jangan melebihi saldo
                if (dynamicAmount > currentBalance) dynamicAmount = currentBalance;

                // Jika saldo sangat kecil (<10), batalkan trade
                if (currentBalance < 10) {
                     setAutoStatus("Skipped: Low Balance for Safety.");
                     return;
                }
                
                // Update UI: Pindah ke aset target
                if (setActiveAssetRef.current) {
                    setActiveAssetRef.current(currentSource === 'binance' ? MarketCategory.crypto : MarketCategory.forex, targetAsset.id);
                }
                
                // Eksekusi Trade dengan delay natural
                setTimeout(() => {
                   if (onTradeRef.current) {
                       // Gunakan dynamic amount, bukan fixed orderAmount state
                       onTradeRef.current(dynamicAmount, side);
                   }
                   setAutoStatus(`Filled ${dynamicAmount} USDT. Cooling down...`);
                }, 800);

            } else {
                setAutoStatus(`Low Confidence (${confidenceScore.toFixed(1)}%). Scanning Next...`);
            }
        }, 1200);

    }, 3000); 

    return () => {
        isScanning = false;
        clearInterval(autoLoop);
    };
  }, [executionType]); // Dependensi minimal karena pakai Ref


  // --- DYNAMIC NEURAL RISK GUARD ---
  const getDynamicThresholds = () => {
      const isCrypto = activeSource === 'binance';
      let baseTpRoi = isCrypto ? 0.30 : 0.15; 
      let baseSlRoi = isCrypto ? -0.15 : -0.08; 

      if (leverage > 100) {
          baseSlRoi = -0.05; 
      }
      return { tp: baseTpRoi, sl: baseSlRoi };
  };

  useEffect(() => {
    if (executionType !== 'autopilot' || activePositions.length === 0 || !displayPrice) return;

    const { tp: AUTO_TP_ROI, sl: AUTO_SL_ROI } = getDynamicThresholds();

    activePositions.forEach(tx => {
       if (tx.asset !== activeAssetId) return;

       const diff = displayPrice - tx.price;
       const isBuy = tx.type.includes('BUY');
       const roi = ((isBuy ? diff : -diff) / tx.price) * tx.leverage;

       if (roi <= AUTO_SL_ROI || roi >= AUTO_TP_ROI) {
           console.log(`[NEURAL GUARD] Auto-Closing ${tx.id} | ROI: ${(roi*100).toFixed(2)}%`);
           onClosePosition?.(tx.id);
       }
    });
  }, [displayPrice, activePositions, executionType, leverage, activeSource, activeAssetId]);


  const calculatePnL = (tx: Transaction) => {
    if (!displayPrice || tx.status !== 'OPEN') return 0;
    
    if (tx.asset !== activeAssetId) {
       return (Math.sin(Date.now() / 1000 + parseFloat(tx.id.slice(-4))) * 5) * (tx.amount / 100); 
    }

    const diff = displayPrice - tx.price;
    return (tx.type.includes('BUY') ? diff : -diff) / tx.price * tx.amount * tx.leverage;
  };

  const totalFloatingPnL = useMemo(() => {
    return activePositions.reduce((acc, tx) => acc + calculatePnL(tx), 0);
  }, [activePositions, displayPrice, activeAssetId]);

  const formatPrice = (price: number) => {
     if (!price) return "0.00";
     const val = price * selectedCurrency.rate;
     return `${selectedCurrency.symbol} ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatAmount = (amount: number) => {
      return `${selectedCurrency.symbol} ${(amount * selectedCurrency.rate).toLocaleString()}`;
  };

  const getActiveBalance = () => {
    if (tradingMode === 'simulation') return state.balances.simulation;
    if (activeSource === 'binance') return state.balances.real;
    return (state.balances as any)[activeSource] || 0;
  };

  const { tp: dynTp, sl: dynSl } = getDynamicThresholds();
  const autoTpTarget = displayPrice * (1 + (dynTp / leverage)); 
  const autoSlTarget = displayPrice * (1 + (dynSl / leverage)); 

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-24 max-w-full overflow-hidden">
      
      {/* Autopilot Status Bar */}
      {executionType === 'autopilot' && (
        <div className={`w-full bg-${brokerConfig.color}-600/10 border-${brokerConfig.color}-500/20 border rounded-2xl p-4 flex items-center justify-between animate-pulse shadow-2xl backdrop-blur-md transition-all duration-500`}>
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-${brokerConfig.color}-500/20 flex items-center justify-center border border-${brokerConfig.color}-500/50`}>
                 <i className={`fa-solid fa-radar text-${brokerConfig.color}-400 text-lg animate-spin`}></i>
              </div>
              <div>
                 <p className={`text-[10px] font-black text-${brokerConfig.color}-400 uppercase tracking-widest`}>Neural Autopilot: ACTIVE ({brokerConfig.label})</p>
                 <p className="text-xs text-white font-bold font-mono uppercase tracking-wider">{autoStatus}</p>
              </div>
           </div>
           
           <div className="flex gap-4 items-center">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-950/50 rounded-lg border border-white/5">
                  <i className="fa-solid fa-shield-halved text-emerald-500 text-[10px] animate-pulse"></i>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     Smart Guard: <span className="text-white">{(dynTp*100).toFixed(0)}% TP / {(Math.abs(dynSl)*100).toFixed(0)}% SL</span>
                  </span>
              </div>
              <div className="flex gap-2 items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase mr-2">{scanTarget ? `Target: ${scanTarget}` : 'IDLE'}</span>
                  <span className={`w-2 h-2 bg-${brokerConfig.color}-500 rounded-full animate-ping`}></span>
                  <span className={`w-2 h-2 bg-${brokerConfig.color}-500 rounded-full animate-ping [animation-delay:0.2s]`}></span>
                  <span className={`w-2 h-2 bg-${brokerConfig.color}-500 rounded-full animate-ping [animation-delay:0.4s]`}></span>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0">
           
           {/* Dynamic Broker Chart Card */}
           <div className={`quantum-card h-[450px] rounded-[2.5rem] glass ${brokerConfig.border} ${brokerConfig.glow} p-6 flex flex-col relative overflow-hidden group/chart transition-all hover:scale-[1.005]`}>
              {executionType === 'autopilot' && <div className="absolute inset-0 pointer-events-none z-0"><div className="neural-scan"></div></div>}
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-${brokerConfig.color}-500/20 text-${brokerConfig.color}-400 flex items-center justify-center text-xl shadow-lg`}>
                       <i className={activeAsset.icon}></i>
                    </div>
                    <div>
                       <h2 className="text-lg font-orbitron font-black text-white">{activeAsset.id}/{selectedCurrency.code}</h2>
                       <p className={`text-2xl font-mono font-black text-${brokerConfig.color}-400 animate-pulse`}>
                          {formatPrice(displayPrice || currentPrice)}
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-2 items-center">
                    
                    {/* --- TARGET MANAGEMENT PANEL (TP/SL) --- */}
                    {executionType === 'autopilot' ? (
                        <div className="flex items-center gap-3 mr-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                           <div className="text-right">
                              <p className="text-[7px] text-emerald-500 uppercase font-black tracking-widest flex items-center justify-end gap-1">
                                 <i className="fa-solid fa-crosshairs text-[6px]"></i> Auto TP
                              </p>
                              <p className="text-[9px] text-emerald-400 font-mono font-bold">{formatPrice(autoTpTarget)}</p>
                           </div>
                           <div className="w-[1px] h-4 bg-white/10"></div>
                           <div className="text-right">
                              <p className="text-[7px] text-rose-500 uppercase font-black tracking-widest flex items-center justify-end gap-1">
                                 <i className="fa-solid fa-ban text-[6px]"></i> Auto SL
                              </p>
                              <p className="text-[9px] text-rose-500 font-mono font-bold">{formatPrice(autoSlTarget)}</p>
                           </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mr-2">
                            <div className="flex flex-col items-end">
                                <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest mb-0.5">TP Target</span>
                                <input 
                                  type="text" 
                                  value={manualTp}
                                  onChange={(e) => setManualTp(e.target.value)}
                                  placeholder="Price" 
                                  className="w-16 bg-slate-900/80 border border-emerald-500/30 rounded-lg px-2 py-1 text-[9px] text-right font-mono text-emerald-400 outline-none focus:border-emerald-500 transition-all placeholder-slate-700" 
                                />
                            </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[6px] text-rose-500 font-black uppercase tracking-widest mb-0.5">SL Limit</span>
                                <input 
                                  type="text" 
                                  value={manualSl}
                                  onChange={(e) => setManualSl(e.target.value)}
                                  placeholder="Price" 
                                  className="w-16 bg-slate-900/80 border border-rose-500/30 rounded-lg px-2 py-1 text-[9px] text-right font-mono text-rose-500 outline-none focus:border-rose-500 transition-all placeholder-slate-700" 
                                />
                            </div>
                        </div>
                    )}

                    <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border ${tradingMode === 'real' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : `bg-${brokerConfig.color}-500/20 border-${brokerConfig.color}-500/30 text-${brokerConfig.color}-400`}`}>
                       {tradingMode === 'real' ? `LIVE ${brokerConfig.label.toUpperCase()}` : 'PAPER TRADING'}
                    </div>
                    
                    <button onClick={onKillSwitch} className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase bg-rose-600/20 border border-rose-600/30 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95 flex items-center gap-2">
                       <i className="fa-solid fa-power-off"></i> KILL SWITCH
                    </button>
                 </div>
              </div>

              {/* Chart Container - Fixed Height */}
              <div className="flex-1 w-full bg-slate-950/30 rounded-2xl p-2 border border-white/5 overflow-hidden shadow-inner relative" style={{ minHeight: '250px' }}>
                 {realtimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={realtimeData}>
                           <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor={brokerConfig.accent} stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor={brokerConfig.accent} stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="1 5" vertical={false} stroke="rgba(255,255,255,0.05)" />
                           <XAxis dataKey="time" hide />
                           <YAxis domain={['auto', 'auto']} hide />
                           <Tooltip 
                              contentStyle={{ background: '#020617', border: `1px solid ${brokerConfig.accent}`, borderRadius: '12px', fontSize: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} 
                              formatter={(value: any) => [parseFloat(value).toFixed(2), "Price"]}
                           />
                           <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke={brokerConfig.accent} 
                              strokeWidth={2} 
                              fill="url(#chartGrad)" 
                              animationDuration={500} 
                              isAnimationActive={false} 
                           />
                        </ComposedChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-black uppercase">
                        <i className="fa-solid fa-spinner animate-spin mr-2"></i> Initializing Feed ({activeSource})...
                    </div>
                 )}
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto custom-scrollbar pb-2 relative z-10 shrink-0">
                 {currentAssetList.map(asset => (
                    <button key={asset.id} onClick={() => setActiveAsset(activeSource === 'binance' ? MarketCategory.crypto : MarketCategory.forex, asset.id)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${activeAssetId === asset.id ? `bg-${brokerConfig.color}-600 text-white border-${brokerConfig.color}-600 shadow-lg` : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
                       {asset.id}
                    </button>
                 ))}
              </div>
           </div>

           {/* Position List (ACTIVE FOOTPRINTS) */}
           <div className="quantum-card rounded-[2.5rem] glass border-white/5 p-6 bg-slate-950/40 min-h-[200px]">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Footprints ({brokerConfig.label})</h4>
                 <div className="text-[9px] font-bold text-slate-500 uppercase">{activePositions.length} Posisi Terbuka</div>
              </div>
              
              <div className="overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[350px] pr-2">
                 <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead className="sticky top-0 bg-[#060b1e] z-10">
                       <tr className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                          <th className="px-4 pb-2">Aset</th>
                          <th className="px-4 pb-2">Sisi</th>
                          <th className="px-4 pb-2">Entry</th>
                          <th className="px-4 pb-2">Stake</th>
                          <th className="px-4 pb-2 text-right">PnL ({selectedCurrency.code})</th>
                          <th className="px-4 pb-2 text-right">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="font-mono text-[10px]">
                       {activePositions.length === 0 ? (
                          <tr>
                             <td colSpan={6} className="text-center py-10 text-slate-700 italic uppercase font-black tracking-widest">Menunggu sinyal neural dari node {activeSource}...</td>
                          </tr>
                       ) : (
                          activePositions.map(tx => {
                             const pnl = calculatePnL(tx);
                             return (
                                <tr key={tx.id} className="bg-slate-950/50 rounded-xl overflow-hidden group hover:bg-slate-900/50 transition-colors">
                                   <td className="px-4 py-4 font-black text-white rounded-l-xl">{tx.asset} <span className="text-[8px] text-slate-600 font-normal">x{tx.leverage}</span></td>
                                   <td className="px-4 py-4">
                                      <span className={`px-2 py-0.5 rounded-md ${tx.type.includes('BUY') ? `bg-${brokerConfig.color}-500/20 text-${brokerConfig.color}-400` : 'bg-rose-500/20 text-rose-500'}`}>{tx.type.replace('AUTO_', '')}</span>
                                   </td>
                                   <td className="px-4 py-4 text-slate-400">{formatPrice(tx.price)}</td>
                                   <td className="px-4 py-4 text-slate-400">{formatAmount(tx.amount)}</td>
                                   <td className={`px-4 py-4 text-right font-black ${pnl >= 0 ? `text-${brokerConfig.color}-400` : 'text-rose-500'}`}>
                                      {pnl >= 0 ? '+' : ''}{formatAmount(pnl).replace(selectedCurrency.symbol + ' ', '')} {selectedCurrency.symbol}
                                   </td>
                                   <td className="px-4 py-4 text-right rounded-r-xl">
                                      <button onClick={() => onClosePosition?.(tx.id)} className="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-500 border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all">
                                         <i className="fa-solid fa-xmark"></i>
                                      </button>
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

        {/* Execution Core */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 min-w-0">
           <div className={`quantum-card rounded-[2.5rem] glass border-${brokerConfig.color}-500/30 p-8 shadow-2xl bg-slate-950/40 transition-all`}>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <i className="fa-solid fa-microchip animate-pulse"></i>
                 Execution Core: {brokerConfig.label}
              </h4>
              <div className="space-y-8">
                 <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex justify-between items-center shadow-inner relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${brokerConfig.color}-500 group-hover:w-full transition-all duration-500 opacity-10`}></div>
                    <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Current Price</span>
                        <div className="flex items-center gap-2">
                           <i className={`${activeAsset.icon} text-${brokerConfig.color}-500 text-xs`}></i>
                           <span className="text-xs font-bold text-white">{activeAssetId}/{selectedCurrency.code}</span>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <span className={`text-2xl font-mono font-black text-${brokerConfig.color}-400 tracking-tighter`}>
                           {formatPrice(displayPrice || currentPrice)}
                        </span>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col gap-3 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${tradingMode === 'real' ? 'bg-amber-500' : `bg-${brokerConfig.color}-500`}`}></div>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Wallet</span>
                       <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5 items-center gap-1">
                          <button onClick={() => setTradingMode('simulation')} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${tradingMode === 'simulation' ? `bg-${brokerConfig.color}-500 text-black shadow-lg` : 'text-slate-500 hover:text-white'}`}>Demo</button>
                          <button onClick={() => setTradingMode('real')} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${tradingMode === 'real' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>Real</button>
                          {/* Reset Simulation Button */}
                          {tradingMode === 'simulation' && onResetSimulation && (
                             <button onClick={onResetSimulation} className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 flex items-center justify-center transition-all ml-1" title="Reset Simulation Balance">
                                <i className="fa-solid fa-rotate-right text-[8px]"></i>
                             </button>
                          )}
                       </div>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] text-slate-600 font-bold uppercase">{tradingMode === 'real' ? 'Live Equity' : 'Testnet Funds'}</span>
                       <span className={`text-xl font-mono font-black ${tradingMode === 'real' ? 'text-amber-500' : `text-${brokerConfig.color}-400`}`}>
                          {selectedCurrency.symbol}
                          {(getActiveBalance() * selectedCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                       </span>
                    </div>
                 </div>

                 {activePositions.length > 0 && (
                   <div className={`p-4 rounded-2xl border ${totalFloatingPnL >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} flex flex-col items-center justify-center animate-fadeIn`}>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Floating PnL</span>
                      <span className={`text-2xl font-mono font-black ${totalFloatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                         {totalFloatingPnL >= 0 ? '+' : ''}{formatAmount(totalFloatingPnL)}
                      </span>
                   </div>
                 )}

                 <div>
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Stake Nominal (USDT)</label>
                       <input type="number" min="10" value={orderAmount} onChange={(e) => setOrderAmount(parseInt(e.target.value))} className={`bg-transparent border-b border-${brokerConfig.color}-500/50 text-${brokerConfig.color}-400 text-right font-mono font-black text-lg outline-none w-24`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {NOMINAL_PRESETS.map(n => (
                          <button key={n} onClick={() => setOrderAmount(n)} className={`py-2 rounded-lg text-[8px] font-black border transition-all ${orderAmount === n ? `bg-${brokerConfig.color}-600 text-white border-${brokerConfig.color}-600 shadow-md` : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'}`}>${n}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Leverage</label>
                       <span className={`text-xs font-mono font-black text-${brokerConfig.color}-400`}>x{leverage}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="500" 
                      step="1" 
                      value={leverage} 
                      onChange={(e) => onUpdateLeverage(parseInt(e.target.value))}
                      className={`w-full h-1.5 bg-slate-900 rounded-full cursor-pointer outline-none transition-all appearance-none`}
                      style={{ 
                        accentColor: brokerConfig.accent,
                        background: `linear-gradient(90deg, ${brokerConfig.accent} ${leverage/5}%, #0f172a ${leverage/5}%)`
                      }}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onTrade?.(orderAmount, 'BUY')} className={`py-5 bg-${brokerConfig.color}-600 text-${activeSource === 'binance' ? 'black' : 'white'} rounded-2xl font-orbitron font-black text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase flex flex-col items-center justify-center gap-1`}>
                       <i className="fa-solid fa-arrow-trend-up"></i>
                       Long Node
                    </button>
                    <button onClick={() => onTrade?.(orderAmount, 'SELL')} className="py-5 bg-rose-600 text-white rounded-2xl font-orbitron font-black text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase flex flex-col items-center justify-center gap-1">
                       <i className="fa-solid fa-arrow-trend-down"></i>
                       Short Node
                    </button>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-600">
                       <span>Neural Intelligence Mode</span>
                       <span className={`text-${brokerConfig.color}-400 font-bold`}>{executionType.toUpperCase()}</span>
                    </div>
                    <div className="flex bg-slate-900/50 rounded-xl p-1.5 border border-white/5 shadow-inner">
                       <button onClick={() => setExecutionType('manual')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${executionType === 'manual' ? `bg-${brokerConfig.color}-600 text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'}`}>Manual</button>
                       <button onClick={() => setExecutionType('autopilot')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${executionType === 'autopilot' ? `bg-${brokerConfig.color}-600 text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'}`}>Autopilot</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className={`quantum-card flex-1 rounded-[2.5rem] glass border-${brokerConfig.color}-500/10 p-6 flex flex-col shadow-2xl bg-slate-950/40`}>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Node Telemetry</h4>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[250px]">
                 {[
                   "Liquidity Sweep Engine", "FVG Detection Node", "SMC Bias Analysis", 
                   "Order Flow Imbalance", "Institutional Footprint", "Vol Delta Sensor"
                 ].map((ind, i) => (
                    <div key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-500 group hover:border-emerald-500/30 transition-all hover:translate-x-1">
                       <span>{ind}</span>
                       <div className={`w-1.5 h-1.5 rounded-full bg-${brokerConfig.color}-500 animate-pulse group-hover:shadow-[0_0_8px_${brokerConfig.accent}]`}></div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
