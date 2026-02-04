import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, ComposedChart } from 'recharts';
import { AppState, MarketCategory, Transaction, TradingMode, ExecutionType, TradingSource } from '../types.ts';
import { BinanceService } from '../services/binanceService.ts';
import { getContractSize } from '../App.tsx';

interface TerminalProps {
  state: AppState;
  currentPrice: number;
  onTrade?: (amount: number, type: 'BUY' | 'SELL', assetOverride?: string) => void;
  onClosePosition?: (txId: string) => void;
  setActiveAsset: (cat: MarketCategory, id: string) => void;
  setTradingMode: (m: TradingMode) => void;
  setExecutionType: (e: ExecutionType) => void;
  setActiveBrain: (b: any) => void;
  onKillSwitch?: () => void;
  onResetSimulation?: () => void; 
  onSetAllocation?: (amount: number | null) => void;
  scanningAsset?: string | null;
  onUpdateLeverage: (lev: number) => void;
  selectedCurrency: any;
  onPriceUpdate?: (price: number) => void; 
}

const BROKER_SPECS: Record<TradingSource, { 
    type: 'CRYPTO' | 'FOREX'; 
    maxLeverage: number; 
    minVol: number; 
    volUnit: string; 
    color: string;
    accent: string;
    label: string;
    icon: string;
    border: string; 
    glow: string;
    spread: number; 
}> = {
  binance: { type: 'CRYPTO', maxLeverage: 125, minVol: 10, volUnit: 'USDT', color: 'yellow', accent: '#facc15', label: 'Binance', icon: 'fa-brands fa-bitcoin', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/10', spread: 0.01 },
  fbs: { type: 'FOREX', maxLeverage: 3000, minVol: 0.01, volUnit: 'Lot', color: 'blue', accent: '#3b82f6', label: 'FBS Broker', icon: 'fa-solid fa-chart-line', border: 'border-blue-500/30', glow: 'shadow-blue-500/10', spread: 1.0 },
  exness: { type: 'FOREX', maxLeverage: 2000, minVol: 0.01, volUnit: 'Lot', color: 'amber', accent: '#f59e0b', label: 'Exness', icon: 'fa-solid fa-crown', border: 'border-amber-500/30', glow: 'shadow-amber-500/10', spread: 0.6 },
  xm: { type: 'FOREX', maxLeverage: 1000, minVol: 0.01, volUnit: 'Lot', color: 'red', accent: '#ef4444', label: 'XM Global', icon: 'fa-solid fa-shield-halved', border: 'border-red-500/30', glow: 'shadow-red-500/10', spread: 1.2 },
  ic_markets: { type: 'FOREX', maxLeverage: 500, minVol: 0.01, volUnit: 'Lot', color: 'emerald', accent: '#10b981', label: 'IC Markets', icon: 'fa-solid fa-bolt', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10', spread: 0.1 },
  hfm: { type: 'FOREX', maxLeverage: 1000, minVol: 0.01, volUnit: 'Lot', color: 'orange', accent: '#f97316', label: 'HFM', icon: 'fa-solid fa-fire', border: 'border-orange-500/30', glow: 'shadow-orange-500/10', spread: 1.1 },
  pepperstone: { type: 'FOREX', maxLeverage: 500, minVol: 0.01, volUnit: 'Lot', color: 'rose', accent: '#f43f5e', label: 'Pepperstone', icon: 'fa-solid fa-pepper-hot', border: 'border-rose-500/30', glow: 'shadow-rose-500/10', spread: 0.2 },
  ig_group: { type: 'FOREX', maxLeverage: 200, minVol: 0.5, volUnit: 'Contract', color: 'indigo', accent: '#6366f1', label: 'IG Group', icon: 'fa-solid fa-building-columns', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10', spread: 1.5 },
  plus500: { type: 'FOREX', maxLeverage: 30, minVol: 1, volUnit: 'Unit', color: 'sky', accent: '#0ea5e9', label: 'Plus500', icon: 'fa-solid fa-plus', border: 'border-sky-500/30', glow: 'shadow-sky-500/10', spread: 2.0 },
  octafx: { type: 'FOREX', maxLeverage: 500, minVol: 0.01, volUnit: 'Lot', color: 'teal', accent: '#14b8a6', label: 'OctaFX', icon: 'fa-solid fa-circle-nodes', border: 'border-teal-500/30', glow: 'shadow-teal-500/10', spread: 0.9 },
  ibkr: { type: 'FOREX', maxLeverage: 50, minVol: 100, volUnit: 'Share', color: 'violet', accent: '#8b5cf6', label: 'Interactive Brokers', icon: 'fa-solid fa-building', border: 'border-violet-500/30', glow: 'shadow-violet-500/10', spread: 0.5 }
};

const BINANCE_ASSETS = [
  { id: 'BTC', icon: 'fa-brands fa-bitcoin' },
  { id: 'ETH', icon: 'fa-brands fa-ethereum' },
  { id: 'SOL', icon: 'fa-solid fa-bolt-lightning' },
  { id: 'BNB', icon: 'fa-solid fa-coins' },
  { id: 'XRP', icon: 'fa-solid fa-rocket' }
];

const FOREX_ASSETS = [
  { id: 'EURUSD', icon: 'fa-solid fa-euro-sign' },
  { id: 'GBPUSD', icon: 'fa-solid fa-sterling-sign' },
  { id: 'USDJPY', icon: 'fa-solid fa-yen-sign' },
  { id: 'XAUUSD', icon: 'fa-solid fa-gem' },
  { id: 'US30', icon: 'fa-solid fa-building' }
];

const NOMINAL_PRESETS_CRYPTO = [10, 50, 100, 500, 1000];
const NOMINAL_PRESETS_FOREX = [0.01, 0.05, 0.10, 0.50, 1.00];

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
    onSetAllocation,
    onUpdateLeverage,
    selectedCurrency,
    onPriceUpdate
  } = props;

  const { tradingMode, executionType, activeAssetId, transactions, activeSource, leverage, allocatedBalances } = state;
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const currentBrokerSpec = BROKER_SPECS[activeSource];
  const [orderAmount, setOrderAmount] = useState(currentBrokerSpec.minVol);
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [autoStatus, setAutoStatus] = useState("Standby");
  const [dailyRoi, setDailyRoi] = useState(0);
  const [isEditingAllocation, setIsEditingAllocation] = useState(false);
  const [allocationInput, setAllocationInput] = useState('');
  
  const [pricesMap, setPricesMap] = useState<Record<string, number>>({});

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    if (activeAssetId.includes('JPY') || activeAssetId === 'XAUUSD' || activeAssetId === 'US30') {
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price < 10 ? 5 : 2 });
  };

  const formatAmount = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return `${selectedCurrency.symbol} 0.00`;
    return `${selectedCurrency.symbol} ${(val * selectedCurrency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const onTradeRef = useRef(onTrade);
  const setActiveAssetRef = useRef(setActiveAsset);
  const activeSourceRef = useRef(activeSource);
  const orderAmountRef = useRef(orderAmount);
  const displayPriceRef = useRef(displayPrice);
  const activePositionsRef = useRef<Transaction[]>([]);
  const dailyRoiRef = useRef(dailyRoi);
  const balanceRef = useRef(0);
  const executionTypeRef = useRef(executionType); 
  const pricesMapRef = useRef(pricesMap);

  const getActiveBalance = () => {
    if (tradingMode === 'simulation') return state.balances.simulation;
    const allocated = allocatedBalances[activeSource];
    if (allocated !== null) return allocated;
    if (activeSource === 'binance') return state.balances.real;
    return (state.balances as any)[activeSource] || 0;
  };

  const getEstimatedMargin = () => {
      const price = displayPrice || currentPrice;
      if (price === 0) return 0;
      
      if (currentBrokerSpec.type === 'CRYPTO') {
          return orderAmount; 
      } else {
          const contractSize = getContractSize(activeAssetId);
          return (orderAmount * contractSize * price) / leverage;
      }
  };

  const saveAllocation = () => {
      if (!onSetAllocation) return;
      if (!allocationInput || allocationInput === '') {
          onSetAllocation(null); 
      } else {
          const val = parseFloat(allocationInput);
          if (!isNaN(val) && val > 0) {
              onSetAllocation(val);
          }
      }
      setIsEditingAllocation(false);
  };

  useEffect(() => {
    onTradeRef.current = onTrade;
    setActiveAssetRef.current = setActiveAsset;
    activeSourceRef.current = activeSource;
    orderAmountRef.current = orderAmount;
    displayPriceRef.current = displayPrice;
    balanceRef.current = getActiveBalance();
    executionTypeRef.current = executionType;
    pricesMapRef.current = pricesMap;
  }, [onTrade, setActiveAsset, activeSource, orderAmount, displayPrice, state.balances, tradingMode, allocatedBalances, executionType, pricesMap]);

  const calculatePnL = (tx: Transaction) => {
    if (tx.status !== 'OPEN') return tx.pnl || 0;
    
    // Safety check for price
    let currentAssetPrice = tx.asset === activeAssetId ? displayPrice : (pricesMap[tx.asset] || 0);
    
    // If we don't have a price yet, don't show huge PnL
    if (!currentAssetPrice || currentAssetPrice === 0) return 0;

    // Safety check for stale price causing massive jumps
    // If deviation > 50%, assume stale price/wrong fetch and show 0
    if (Math.abs(currentAssetPrice - tx.price) / tx.price > 0.5) return 0;

    const diff = currentAssetPrice - tx.price;
    const isBuy = tx.type.includes('BUY');
    
    let rawPnL = 0;
    if (currentBrokerSpec.type === 'CRYPTO') {
        const fee = tx.amount * 0.0005; 
        const direction = isBuy ? 1 : -1;
        rawPnL = ((diff / tx.price) * direction * tx.amount * tx.leverage) - fee;
    } else {
        const contractSize = getContractSize(tx.asset);
        const direction = isBuy ? 1 : -1;
        rawPnL = (diff * direction) * contractSize * tx.amount;
        if (tx.asset.includes('JPY')) rawPnL /= 100; 
    }
    return rawPnL;
  };

  const activePositions = useMemo(() => {
      const pos = transactions.filter(t => t.status === 'OPEN' && t.source === activeSource);
      activePositionsRef.current = pos;
      
      const today = new Date().setHours(0,0,0,0);
      const todayTrades = transactions.filter(t => t.status !== 'OPEN' && new Date(t.timestamp).getTime() > today);
      const totalPnl = todayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      
      const baseBalance = balanceRef.current > 0 ? balanceRef.current : 1000;
      const roi = (totalPnl / baseBalance) * 100;
      setDailyRoi(roi);
      dailyRoiRef.current = roi;
      
      return pos;
  }, [transactions, activeSource, state.balances, state.tradingMode]);

  useEffect(() => {
     setOrderAmount(BROKER_SPECS[activeSource].minVol);
     const firstAsset = activeSource === 'binance' ? BINANCE_ASSETS[0].id : FOREX_ASSETS[0].id;
     if (activeSource !== state.activeSource) {
         setActiveAsset(activeSource === 'binance' ? MarketCategory.crypto : MarketCategory.forex, firstAsset);
     }
  }, [activeSource]);

  const currentAssetList = currentBrokerSpec.type === 'CRYPTO' ? BINANCE_ASSETS : FOREX_ASSETS;
  const nominalPresets = currentBrokerSpec.type === 'CRYPTO' ? NOMINAL_PRESETS_CRYPTO : NOMINAL_PRESETS_FOREX;

  const activeAsset = useMemo(() => {
    return currentAssetList.find(a => a.id === activeAssetId) || currentAssetList[0];
  }, [activeAssetId, currentAssetList]);

  // --- BACKGROUND POLLING ---
  useEffect(() => {
      let isSubscribed = true;
      const binance = new BinanceService('', '');

      const fetchAllPrices = async () => {
          const uniqueAssets = [...new Set(activePositionsRef.current.map(p => p.asset))];
          if(!uniqueAssets.includes(activeAssetId)) uniqueAssets.push(activeAssetId);
          
          const newPrices: Record<string, number> = {};
          
          await Promise.all(uniqueAssets.map(async (asset: any) => {
              const assetStr = asset as string;
              try {
                  const price = await binance.getTickerPrice(assetStr, activeSourceRef.current);
                  newPrices[assetStr] = price;
              } catch (e) { /* ignore */ }
          }));

          if (isSubscribed) {
              setPricesMap(prev => ({ ...prev, ...newPrices }));
              if (newPrices[activeAssetId]) {
                  setDisplayPrice(newPrices[activeAssetId]);
                  if (onPriceUpdate) onPriceUpdate(newPrices[activeAssetId]);
              }
          }
      };

      fetchAllPrices();
      const interval = setInterval(fetchAllPrices, 2000); 

      return () => {
          isSubscribed = false;
          clearInterval(interval);
      };
  }, [activeAssetId, activeSource]); 

  // --- CHART DATA STREAM ---
  useEffect(() => {
    let isMounted = true;
    const binance = new BinanceService('', '');

    const fetchData = async () => {
      const data = await binance.getKlines(activeAssetId, '1m', 60, activeSource);
      if (isMounted && data && data.length > 0) {
        setRealtimeData(data);
      }
    };

    fetchData(); 
    const intervalId = setInterval(fetchData, 1000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [activeAssetId, activeSource]);

  // --- AUTOPILOT HYPER-SCALPER ---
  useEffect(() => {
    if (executionType !== 'autopilot') {
        setAutoStatus("Standby");
        return;
    }

    let isMounted = true;

    const autoLoop = setInterval(async () => {
        if (!isMounted || executionTypeRef.current !== 'autopilot') return;
        
        const currentSource = activeSourceRef.current;
        const currentSpec = BROKER_SPECS[currentSource];
        const assetsToScan = currentSpec.type === 'CRYPTO' ? BINANCE_ASSETS : FOREX_ASSETS;

        const randomIdx = Math.floor(Math.random() * assetsToScan.length);
        const targetAsset = assetsToScan[randomIdx];
        
        let confidenceScore = Math.random() * 100;
        const hasLoss = activePositionsRef.current.some(p => (p.pnl || 0) < 0);
        if (hasLoss) confidenceScore += 10; 

        if (confidenceScore > 85) {
            const side = Math.random() > 0.5 ? 'BUY' : 'SELL'; 
            const currentBalance = balanceRef.current;
            const aggressionLevel = 0.05; 
            
            let safeAmount = 0;

            if (currentSpec.type === 'CRYPTO') {
                safeAmount = Math.floor(currentBalance * aggressionLevel);
                if (safeAmount < 10) safeAmount = 10;
            } else {
                // FOREX/INDICES LOT CALCULATION
                const contractSize = getContractSize(targetAsset.id);
                
                // Fetch FRESH Price for calculation
                let price = pricesMapRef.current[targetAsset.id];
                if (!price) {
                    const svc = new BinanceService('', '');
                    price = await svc.getTickerPrice(targetAsset.id, currentSource);
                }

                if (price && price > 0) {
                    const maxMargin = currentBalance * aggressionLevel;
                    const rawMaxLot = (maxMargin * leverage) / (contractSize * price);
                    
                    safeAmount = parseFloat(rawMaxLot.toFixed(2));
                    if (safeAmount < currentSpec.minVol) safeAmount = currentSpec.minVol;
                } else {
                    safeAmount = currentSpec.minVol;
                }
            }

            if (currentBalance < 10 && currentBalance > 0) { 
                setAutoStatus("LOW FUNDS.");
                return;
            }

            setAutoStatus(`EXEC: ${side} ${targetAsset.id} @ ${safeAmount}`);
            
            // Visual Update
            if (setActiveAssetRef.current && targetAsset.id !== activeAssetId) {
                setActiveAssetRef.current(currentSpec.type === 'CRYPTO' ? MarketCategory.crypto : MarketCategory.forex, targetAsset.id);
            }
            
            setTimeout(() => {
               if (!isMounted || executionTypeRef.current !== 'autopilot') return;

               const existing = activePositionsRef.current.filter(p => p.asset === targetAsset.id).length;
               
               if (existing < 2 && onTradeRef.current) { 
                   // Explicitly pass asset ID (handled in App.tsx)
                   onTradeRef.current(safeAmount, side, targetAsset.id);
               }
            }, 800); 

        } else {
            setAutoStatus(`Scanning ${targetAsset.id}... (${confidenceScore.toFixed(0)}%)`);
        }

    }, 3000); 

    return () => {
        isMounted = false;
        clearInterval(autoLoop);
    };
  }, [executionType, activeSource, tradingMode, leverage]); 

  // --- TP/SL MONITOR ---
  useEffect(() => {
    if (activePositions.length === 0) return;
    const SCALP_TP_ROI = 0.015; 
    const SCALP_SL_ROI = -0.01; 

    activePositions.forEach(tx => {
       const pnl = calculatePnL(tx);
       let marginUsed = tx.initialMargin || 0;
       
       if (!marginUsed) {
           if (currentBrokerSpec.type === 'CRYPTO') {
               marginUsed = tx.amount;
           } else {
               const contractSize = getContractSize(tx.asset);
               marginUsed = (tx.amount * contractSize * tx.price) / tx.leverage;
           }
       }
       
       const currentRoi = marginUsed > 0 ? (pnl / marginUsed) : 0;

       if (executionType === 'autopilot') {
           if (currentRoi >= SCALP_TP_ROI || currentRoi <= SCALP_SL_ROI) {
               onClosePosition?.(tx.id);
           }
       }
    });
  }, [activePositions, executionType, leverage, activeSource, pricesMap]);

  // --- TOTAL FLOATING PNL ---
  const totalFloatingPnL = useMemo(() => {
    return activePositions.reduce((acc, tx) => {
        return acc + calculatePnL(tx);
    }, 0);
  }, [activePositions, pricesMap, activeAssetId, displayPrice]);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-24 max-w-full overflow-hidden">
      
      {executionType === 'autopilot' && (
        <div className={`w-full bg-${currentBrokerSpec.color}-600/10 border-${currentBrokerSpec.color}-500/20 border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between animate-pulse shadow-2xl backdrop-blur-md transition-all duration-500`}>
           <div className="flex items-center gap-4 mb-2 sm:mb-0">
              <div className={`w-10 h-10 rounded-full bg-${currentBrokerSpec.color}-500/20 flex items-center justify-center border border-${currentBrokerSpec.color}-500/50`}>
                 <i className={`fa-solid fa-robot text-${currentBrokerSpec.color}-400 text-lg animate-spin`}></i>
              </div>
              <div>
                 <p className={`text-[10px] font-black text-${currentBrokerSpec.color}-400 uppercase tracking-widest`}>Hyper-Scalper: ACTIVE ({currentBrokerSpec.label})</p>
                 <p className="text-xs text-white font-bold font-mono uppercase tracking-wider">{autoStatus}</p>
              </div>
           </div>
           
           <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/40 rounded-lg border border-emerald-500/30">
                  <i className="fa-solid fa-arrow-trend-up text-emerald-400 text-[10px]"></i>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                     Daily ROI: <span className="text-white text-base">{dailyRoi.toFixed(2)}%</span>
                  </span>
              </div>
           </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Chart Section */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0">
           
           <div className={`quantum-card h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] glass ${currentBrokerSpec.border} ${currentBrokerSpec.glow} p-4 md:p-6 flex flex-col relative overflow-hidden group/chart transition-all`}>
              {executionType === 'autopilot' && <div className="absolute inset-0 pointer-events-none z-0"><div className="neural-scan"></div></div>}
              
              <div className="flex flex-wrap justify-between items-start mb-4 relative z-10 gap-2">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-950 border border-${currentBrokerSpec.color}-500/20 text-${currentBrokerSpec.color}-400 flex items-center justify-center text-xl shadow-lg`}>
                       <i className={activeAsset.icon}></i>
                    </div>
                    <div>
                       <h2 className="text-base md:text-lg font-orbitron font-black text-white">{activeAsset.id}/{currentBrokerSpec.type === 'CRYPTO' ? 'USDT' : 'USD'}</h2>
                       <p className={`text-xl md:text-2xl font-mono font-black text-${currentBrokerSpec.color}-400 animate-pulse`}>
                          {formatPrice(displayPrice || currentPrice)}
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-2 items-center flex-wrap justify-end">
                    
                    <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-[8px] font-black uppercase border ${tradingMode === 'real' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : `bg-${currentBrokerSpec.color}-500/20 border-${currentBrokerSpec.color}-500/30 text-${currentBrokerSpec.color}-400`}`}>
                       {tradingMode === 'real' ? `LIVE ${currentBrokerSpec.label.toUpperCase()}` : 'PAPER TRADING'}
                    </div>
                    
                    <button onClick={onKillSwitch} className="px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-[8px] font-black uppercase bg-rose-600/20 border border-rose-600/30 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95 flex items-center gap-2">
                       <i className="fa-solid fa-power-off"></i> CLOSE ALL
                    </button>
                 </div>
              </div>

              <div className="flex-1 w-full bg-slate-950/30 rounded-2xl p-2 border border-white/5 overflow-hidden shadow-inner relative" style={{ minHeight: '200px' }}>
                 {realtimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={realtimeData}>
                           <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor={currentBrokerSpec.accent} stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor={currentBrokerSpec.accent} stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="1 5" vertical={false} stroke="rgba(255,255,255,0.05)" />
                           <XAxis dataKey="time" hide />
                           <YAxis domain={['auto', 'auto']} hide />
                           <Tooltip 
                              contentStyle={{ background: '#020617', border: `1px solid ${currentBrokerSpec.accent}`, borderRadius: '12px', fontSize: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} 
                              formatter={(value: any) => [parseFloat(value).toFixed(activeSource !== 'binance' ? 5 : 2), "Price"]}
                           />
                           <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke={currentBrokerSpec.accent} 
                              strokeWidth={2} 
                              fill="url(#chartGrad)" 
                              animationDuration={500} 
                              isAnimationActive={false} 
                           />
                        </ComposedChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-black uppercase">
                        <i className="fa-solid fa-spinner animate-spin mr-2"></i> Synchonizing {activeSource}...
                    </div>
                 )}
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto custom-scrollbar pb-2 relative z-10 shrink-0">
                 {currentAssetList.map(asset => (
                    <button key={asset.id} onClick={() => setActiveAsset(activeSource === 'binance' ? MarketCategory.crypto : MarketCategory.forex, asset.id)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${activeAssetId === asset.id ? `bg-${currentBrokerSpec.color}-600 text-white border-${currentBrokerSpec.color}-600 shadow-lg` : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}>
                       {asset.id}
                    </button>
                 ))}
              </div>
           </div>

           <div className={`quantum-card rounded-[2.5rem] glass border-${currentBrokerSpec.color}-500/10 p-6 flex flex-col shadow-2xl bg-slate-950/40`}>
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Footprints ({currentBrokerSpec.label})</h4>
                 <div className="text-[9px] font-bold text-slate-500 uppercase">{activePositions.length} Posisi Terbuka</div>
              </div>
              
              <div className="overflow-y-auto overflow-x-auto custom-scrollbar max-h-[350px]">
                 <table className="w-full text-left border-separate border-spacing-y-2 min-w-[600px]">
                    <thead className="sticky top-0 bg-[#060b1e] z-10">
                       <tr className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                          <th className="px-4 pb-2">Aset</th>
                          <th className="px-4 pb-2">Sisi</th>
                          <th className="px-4 pb-2">Entry</th>
                          <th className="px-4 pb-2">Volume ({currentBrokerSpec.volUnit})</th>
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
                                      <span className={`px-2 py-0.5 rounded-md ${tx.type.includes('BUY') ? `bg-${currentBrokerSpec.color}-500/20 text-${currentBrokerSpec.color}-400` : 'bg-rose-500/20 text-rose-500'}`}>{tx.type.replace('AUTO_', '')}</span>
                                   </td>
                                   <td className="px-4 py-4 text-slate-400">{tx.price.toFixed(tx.asset.includes('JPY') ? 2 : 5)}</td>
                                   <td className="px-4 py-4 text-slate-400">{tx.amount} <span className="text-[8px] opacity-50">{currentBrokerSpec.volUnit}</span></td>
                                   <td className={`px-4 py-4 text-right font-black ${pnl >= 0 ? `text-${currentBrokerSpec.color}-400` : 'text-rose-500'}`}>
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

        {/* Control Panel Section */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 min-w-0">
           <div className={`quantum-card rounded-[2.5rem] glass border-${currentBrokerSpec.color}-500/30 p-8 shadow-2xl bg-slate-950/40 transition-all`}>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <i className="fa-solid fa-microchip animate-pulse"></i>
                 Execution Core: {currentBrokerSpec.label}
              </h4>
              <div className="space-y-8">
                 <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex justify-between items-center shadow-inner relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${currentBrokerSpec.color}-500 group-hover:w-full transition-all duration-500 opacity-10`}></div>
                    <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Current Price</span>
                        <div className="flex items-center gap-2">
                           <i className={`${activeAsset.icon} text-${currentBrokerSpec.color}-500 text-xs`}></i>
                           <span className="text-xs font-bold text-white">{activeAssetId}/{currentBrokerSpec.type === 'CRYPTO' ? 'USDT' : 'USD'}</span>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <span className={`text-xl md:text-2xl font-mono font-black text-${currentBrokerSpec.color}-400 tracking-tighter`}>
                           {formatPrice(displayPrice || currentPrice)}
                        </span>
                    </div>
                 </div>

                 {/* ACTIVE WALLET & ALLOCATION MANAGER */}
                 <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col gap-3 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${tradingMode === 'real' ? 'bg-amber-500' : `bg-${currentBrokerSpec.color}-500`}`}></div>
                    
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Wallet</span>
                       <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5 items-center gap-1">
                          <button onClick={() => setTradingMode('simulation')} className={`px-2 py-1 md:px-3 rounded-md text-[8px] font-black uppercase transition-all ${tradingMode === 'simulation' ? `bg-${currentBrokerSpec.color}-500 text-black shadow-lg` : 'text-slate-500 hover:text-white'}`}>Demo</button>
                          <button onClick={() => setTradingMode('real')} className={`px-2 py-1 md:px-3 rounded-md text-[8px] font-black uppercase transition-all ${tradingMode === 'real' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>Real</button>
                          {tradingMode === 'simulation' && onResetSimulation && (
                             <button onClick={onResetSimulation} className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 flex items-center justify-center transition-all ml-1" title="Reset Simulation Balance">
                                <i className="fa-solid fa-rotate-right text-[8px]"></i>
                             </button>
                          )}
                       </div>
                    </div>

                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                           <span className="text-[9px] text-slate-600 font-bold uppercase">{tradingMode === 'real' ? (allocatedBalances[activeSource] !== null ? 'Allocated Funds' : 'Full Equity') : 'Testnet Funds'}</span>
                           
                           {/* Allocation Manager Input/Display */}
                           {isEditingAllocation && tradingMode === 'real' ? (
                               <div className="flex items-center gap-2 mt-1">
                                   <input 
                                     type="number" 
                                     value={allocationInput} 
                                     onChange={(e) => setAllocationInput(e.target.value)} 
                                     placeholder="Set Limit..." 
                                     className="w-20 bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-amber-500"
                                     autoFocus
                                   />
                                   <button onClick={saveAllocation} className="text-emerald-500 hover:text-white"><i className="fa-solid fa-check"></i></button>
                                   <button onClick={() => setIsEditingAllocation(false)} className="text-rose-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                               </div>
                           ) : (
                               <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { if(tradingMode === 'real') { setAllocationInput(allocatedBalances[activeSource]?.toString() || ''); setIsEditingAllocation(true); }}}>
                                   <span className={`text-lg md:text-xl font-mono font-black ${tradingMode === 'real' ? 'text-amber-500' : `text-${currentBrokerSpec.color}-400`}`}>
                                      {formatAmount(getActiveBalance()).replace(selectedCurrency.symbol + ' ', selectedCurrency.symbol)}
                                   </span>
                                   {tradingMode === 'real' && (
                                       <i className="fa-solid fa-pen-to-square text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Set Allocation Limit"></i>
                                   )}
                               </div>
                           )}
                       </div>
                    </div>
                    
                    {tradingMode === 'real' && allocatedBalances[activeSource] !== null && (
                        <div className="w-full bg-slate-900 h-1 mt-1 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500/50 w-full animate-pulse"></div>
                        </div>
                    )}
                 </div>

                 {/* TOTAL PNL DISPLAY - FIXED LOGIC */}
                 {totalFloatingPnL !== 0 && (
                   <div className={`p-4 rounded-2xl border ${totalFloatingPnL >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} flex flex-col items-center justify-center animate-fadeIn`}>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Floating PnL</span>
                      <span className={`text-2xl font-mono font-black ${totalFloatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                         {totalFloatingPnL >= 0 ? '+' : ''}{formatAmount(totalFloatingPnL).replace(selectedCurrency.symbol + ' ', '')}
                      </span>
                   </div>
                 )}

                 <div>
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Volume ({currentBrokerSpec.volUnit})
                       </label>
                       <div className="flex flex-col items-end">
                           <input 
                             type="number" 
                             min={currentBrokerSpec.minVol}
                             step={currentBrokerSpec.minVol}
                             value={orderAmount} 
                             onChange={(e) => setOrderAmount(parseFloat(e.target.value))} 
                             className={`bg-transparent border-b border-${currentBrokerSpec.color}-500/50 text-${currentBrokerSpec.color}-400 text-right font-mono font-black text-lg outline-none w-24`} 
                           />
                           <span className="text-[9px] text-slate-500 font-mono mt-1">
                               Est. Margin: {formatAmount(getEstimatedMargin())}
                           </span>
                       </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                       {nominalPresets.map(n => (
                          <button key={n} onClick={() => setOrderAmount(n)} className={`py-1.5 rounded-lg text-[8px] font-black border transition-all ${orderAmount === n ? `bg-${currentBrokerSpec.color}-600 text-white border-${currentBrokerSpec.color}-600 shadow-md` : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'}`}>
                             {n}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Leverage ({currentBrokerSpec.maxLeverage > 1000 ? 'UNLIMITED' : `Max 1:${currentBrokerSpec.maxLeverage}`})</label>
                       <span className={`text-xs font-mono font-black text-${currentBrokerSpec.color}-400`}>1:{leverage}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max={currentBrokerSpec.maxLeverage} 
                      step="1" 
                      value={leverage} 
                      onChange={(e) => onUpdateLeverage(parseInt(e.target.value))}
                      className={`w-full h-1.5 bg-slate-900 rounded-full cursor-pointer outline-none transition-all appearance-none`}
                      style={{ 
                        accentColor: currentBrokerSpec.accent,
                        background: `linear-gradient(90deg, ${currentBrokerSpec.accent} ${(leverage/currentBrokerSpec.maxLeverage)*100}%, #0f172a ${(leverage/currentBrokerSpec.maxLeverage)*100}%)`
                      }}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onTrade?.(orderAmount, 'BUY')} className={`py-5 bg-${currentBrokerSpec.color}-600 text-${activeSource === 'binance' ? 'black' : 'white'} rounded-2xl font-orbitron font-black text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase flex flex-col items-center justify-center gap-1`}>
                       <i className="fa-solid fa-arrow-trend-up"></i>
                       Buy / Long
                    </button>
                    <button onClick={() => onTrade?.(orderAmount, 'SELL')} className="py-5 bg-rose-600 text-white rounded-2xl font-orbitron font-black text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase flex flex-col items-center justify-center gap-1">
                       <i className="fa-solid fa-arrow-trend-down"></i>
                       Sell / Short
                    </button>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-600">
                       <span>Neural Intelligence Mode</span>
                       <span className={`text-${currentBrokerSpec.color}-400 font-bold`}>{executionType.toUpperCase()}</span>
                    </div>
                    <div className="flex bg-slate-900/50 rounded-xl p-1.5 border border-white/5 shadow-inner">
                       <button onClick={() => setExecutionType('manual')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${executionType === 'manual' ? `bg-${currentBrokerSpec.color}-600 text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'}`}>Manual</button>
                       <button onClick={() => setExecutionType('autopilot')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${executionType === 'autopilot' ? `bg-${currentBrokerSpec.color}-600 text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'}`}>Hyper-Scalp</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className={`quantum-card flex-1 rounded-[2.5rem] glass border-${currentBrokerSpec.color}-500/10 p-6 flex flex-col shadow-2xl bg-slate-950/40 hidden lg:flex`}>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Node Telemetry</h4>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[250px]">
                 {[
                   "Liquidity Sweep Engine", "FVG Detection Node", "SMC Bias Analysis", 
                   "Order Flow Imbalance", "Institutional Footprint", "Vol Delta Sensor"
                 ].map((ind, i) => (
                    <div key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-500 group hover:border-emerald-500/30 transition-all hover:translate-x-1">
                       <span>{ind}</span>
                       <div className={`w-1.5 h-1.5 rounded-full bg-${currentBrokerSpec.color}-500 animate-pulse group-hover:shadow-[0_0_8px_${currentBrokerSpec.accent}]`}></div>
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