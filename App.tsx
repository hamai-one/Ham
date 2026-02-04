import React, { useState, useEffect, useCallback, useRef } from 'react';
import LandingScreen from './components/LandingScreen.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Terminal from './components/Terminal.tsx';
import Journal from './components/Journal.tsx';
import TradingBot from './components/TradingBot.tsx';
import CreativeLab from './components/CreativeLab.tsx';
import DeployPanel from './components/DeployPanel.tsx';
import DatabaseUser from './components/DatabaseUser.tsx';
import LicensePortal from './components/LicensePortal.tsx';
import Analysis from './components/Analysis.tsx';
import Assets from './components/Assets.tsx';
import Settings from './components/Settings.tsx';
import MarketIntel from './components/MarketIntel.tsx';
import StrategyBuilder from './components/StrategyBuilder.tsx';
import History from './components/History.tsx';
import { NavPage, Transaction, AppState, MarketCategory, NeuralBrain, TradingMode, ExecutionType, ServerStatus, NeuralEvent, TradingSource, Currency, AppLanguage, LicenseUser } from './types.ts';
import { 
  BINANCE_KEY as DEFAULT_BINANCE_KEY,
  BINANCE_SECRET as DEFAULT_BINANCE_SECRET,
  TELEGRAM_BOT_TOKEN as DEFAULT_TG_TOKEN,
  GROQ_API_KEY as DEFAULT_GROQ_KEY,
  SCAN_SYMBOLS
} from './constants.tsx';
import { BinanceService } from './services/binanceService.ts';
import { FirebaseService } from './services/firebase.ts';

const GLOBAL_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', rate: 1 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 16250 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 151.5 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.23 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1350 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 92.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.5 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.75 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 36.5 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 25450 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.15 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 32.2 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', rate: 0.000015 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rate: 0.00032 },
  { code: 'SOL', name: 'Solana', symbol: '◎', rate: 0.0065 }
];

const LANGUAGES = [
  { code: 'ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'EN', name: 'English (Global)', flag: '🇺🇸' },
  { code: 'JP', name: '日本語', flag: '🇯🇵' },
  { code: 'KR', name: '한국어', flag: '🇰🇷' },
  { code: 'CN', name: '中文', flag: '🇨🇳' },
  { code: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'AR', name: 'العربية', flag: '🇸🇦' },
  { code: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'PT', name: 'Português', flag: '🇧🇷' },
  { code: 'HI', name: 'हिन्दी', flag: '🇮🇳' }
];

const DEFAULT_SERVER_STATUS: ServerStatus = {
  isLinked: false, nodeIp: '192.168.1.104', uptime: '0h 0m 0s', latency: 12, lastSync: new Date(),
  location: 'Singapore Central', cpuUsage: 14.2, ramUsage: 22.5, heartbeat: 'STABLE', activeInstances: []
};

// HELPER: Dynamic Contract Size untuk Normalisasi PnL
export const getContractSize = (asset: string) => {
  if (asset.includes('XAU') || asset.includes('GOLD')) return 100; // Gold Standard 100oz
  if (asset.includes('US30') || asset.includes('DJI') || asset.includes('NAS')) return 1; // Indices CFD
  if (asset.includes('JPY')) return 100000; // JPY Pairs
  if (asset.includes('BTC') || asset.includes('ETH')) return 1; // Crypto Spot/Futures often 1
  return 100000; // Standard Forex Lot
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showLicensePortal, setShowLicensePortal] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavPage>(NavPage.DASHBOARD);
  const [currentPrice, setCurrentPrice] = useState<number>(0); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [scanningAsset, setScanningAsset] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING'>('IDLE');
  
  const [state, setState] = useState<AppState>(() => {
    // Generate dates for the new user license
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 7);

    const dbk = { metaApiToken: '', accountId: '', isAuthorized: false };
    const defaultState: AppState = {
      // SINKRONISASI SALDO: Setiap broker memiliki vault sendiri.
      balances: { 
        simulation: 10000.00, real: 0.00, fbs: 0, exness: 0, xm: 0, ic_markets: 0, hfm: 0, 
        pepperstone: 0, ig_group: 0, plus500: 0, octafx: 0, ibkr: 0, binance: 0 
      },
      // Saldo Alokasi (Partial Capital) - Null berarti menggunakan full balance
      allocatedBalances: {
        binance: null, fbs: null, exness: null, xm: null, ic_markets: null, hfm: null,
        pepperstone: null, ig_group: null, plus500: null, octafx: null, ibkr: null
      },
      activeSource: 'binance',
      nodeKeys: {
        binance: { apiKey: DEFAULT_BINANCE_KEY, secretKey: DEFAULT_BINANCE_SECRET, isAuthorized: false },
        telegram: { token: DEFAULT_TG_TOKEN },
        groq: { apiKey: DEFAULT_GROQ_KEY },
        fbs: { ...dbk }, exness: { ...dbk }, xm: { ...dbk }, ic_markets: { ...dbk }, hfm: { ...dbk },
        pepperstone: { ...dbk }, ig_group: { ...dbk }, plus500: { ...dbk }, octafx: { ...dbk }, ibkr: { ...dbk }
      },
      transactions: [], neuralEvents: [], selectedCurrency: GLOBAL_CURRENCIES[0],
      theme: 'dark_onyx', language: 'ID', tradingMode: 'simulation', leverage: 20,
      activeCategory: MarketCategory.crypto, activeAssetId: 'BTC', executionType: 'manual',
      activeStrategy: 'NEURAL_AGGRESSIVE', activeBrain: 'DEEPSEEK_R1',
      health: { cpu: 12, latency: 12, aiEfficiency: 99.9, nodeStatus: 'STABLE', groqStatus: 'ONLINE' },
      serverStatus: DEFAULT_SERVER_STATUS, notificationsEnabled: true, soundEnabled: true,
      licenseDatabase: [
        { id: 'ADM', name: 'Admin Central', keylis: 'dasopano21', licenseKey: 'dasopano21', startDate: '2025-01-01', duration: 'UNLIMITED', expiryDate: 'UNLIMITED', isActive: true, authority: 'ADMIN' },
        { 
          id: 'USR-AUTO-01', 
          name: 'Registered User', 
          keylis: 'Encrypted', 
          licenseKey: 'U2FsdGVkX1+e+99hod9cfdrSfVCibGhuoUg8zM6pjBo=', 
          startDate: today.toISOString().split('T')[0], 
          duration: '7', 
          expiryDate: expiryDate.toISOString().split('T')[0], 
          isActive: true, 
          authority: 'USER' 
        }
      ],
      isLicenseVerified: false, verifiedLicenseKey: '', currentUserAuthority: undefined, thinkingBudget: 32768, aiTemperature: 0.7,
      riskParameters: { riskPerTrade: 1.5, stopLoss: 2.0, takeProfit: 5.0, maxDrawdown: 10.0, maxDailyLoss: 5.0 }
    };

    try {
      const saved = localStorage.getItem('AETERNA_FOUNDATION_V16');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          allocatedBalances: { ...defaultState.allocatedBalances, ...(parsed.allocatedBalances || {}) }, // Merge allocated defaults
          transactions: (parsed.transactions || []).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })),
          neuralEvents: (parsed.neuralEvents || []).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }))
        };
      }
      return defaultState;
    } catch (e) {
      return defaultState;
    }
  });

  // --- FIREBASE REAL-TIME LISTENER ---
  useEffect(() => {
    // Subscribe ke Firebase Firestore
    const unsubscribe = FirebaseService.subscribeToLicenses((updatedUsers) => {
      setState(prev => {
         return { ...prev, licenseDatabase: updatedUsers };
      });
      localStorage.setItem('AETERNA_GLOBAL_SYNC_DB', JSON.stringify(updatedUsers));
    });

    // Handle Resize untuk Mobile
    const handleResize = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (mobile) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => {
        unsubscribe();
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  const addNeuralEvent = useCallback((message: string, type: NeuralEvent['type']) => {
    const event: NeuralEvent = { id: Date.now().toString(), message, type, timestamp: new Date() };
    setState(prev => ({ ...prev, neuralEvents: [event, ...prev.neuralEvents].slice(0, 50) }));
  }, []);

  useEffect(() => {
    localStorage.setItem('AETERNA_FOUNDATION_V16', JSON.stringify(state));
  }, [state]);

  useEffect(() => { 
    const timer = setTimeout(() => { 
      setLoading(false); 
      if (!state.isLicenseVerified) setShowLicensePortal(true); 
    }, 2500);
    return () => clearTimeout(timer);
  }, [state.isLicenseVerified]);

  // --- REAL-TIME BALANCE SYNC ENGINE ---
  const syncRealBalance = async (forceSource?: TradingSource) => {
      const source = forceSource || state.activeSource;
      setSyncStatus('SYNCING');
      
      const binanceService = new BinanceService(
          state.nodeKeys.binance.apiKey, 
          state.nodeKeys.binance.secretKey
      );

      const brokerKeys = (state.nodeKeys as any)[source];
      
      try {
          const fetchedBalance = await binanceService.getUnifiedBalance(source, brokerKeys);
          
          setState(prev => {
              const newBalances = { ...prev.balances };
              if (source === 'binance') {
                  if (fetchedBalance > 0) newBalances.real = fetchedBalance;
              } else {
                  if (fetchedBalance === -1) {
                      const current = (newBalances as any)[source] || 0;
                      if (current === 0) (newBalances as any)[source] = 5000.00; 
                  } else if (fetchedBalance > 0) {
                      (newBalances as any)[source] = fetchedBalance;
                  }
              }
              return { ...prev, balances: newBalances };
          });
          
          if (fetchedBalance !== 0) {
             addNeuralEvent(`Vault Update: ${source.toUpperCase()} Balance Synced.`, 'SYSTEM');
          }
      } catch (e) {
          console.error("Sync Error", e);
      } finally {
          setTimeout(() => setSyncStatus('IDLE'), 1500);
      }
  };

  const handleSetAllocation = (amount: number | null) => {
      setState(prev => ({
          ...prev,
          allocatedBalances: {
              ...prev.allocatedBalances,
              [prev.activeSource]: amount
          }
      }));
      addNeuralEvent(`Capital Allocation Updated: ${amount ? '$'+amount : 'Full Balance'}`, 'SYSTEM');
  };

  const handleResetSimulation = () => {
    setState(prev => ({
      ...prev,
      balances: { ...prev.balances, simulation: 10000.00 }
    }));
    addNeuralEvent("Simulation Balance Reset to default.", "SYSTEM");
  };

  // UPDATE: Async to support fetching real price for assetOverride (AutoPilot)
  // This prevents the "Wrong Price -> Massive Margin/PnL" bug
  const handleTrade = async (amount: number, type: 'BUY' | 'SELL', assetOverride?: string) => {
    const isReal = state.tradingMode === 'real';
    const activeWalletKey = isReal ? (state.activeSource === 'binance' ? 'real' : state.activeSource) : 'simulation';
    
    // Determine the effective balance (Total or Allocated)
    let currentBalance = 0;
    
    if (isReal) {
        // Jika Allocated Balance diset, gunakan itu. Jika tidak, gunakan saldo total.
        const allocated = state.allocatedBalances[state.activeSource];
        // @ts-ignore
        const total = activeWalletKey === 'real' ? state.balances.real : state.balances[activeWalletKey];
        currentBalance = allocated !== null ? allocated : total;
    } else {
        currentBalance = state.balances.simulation;
    }

    // Use Asset Override if provided (for AutoPilot), otherwise current UI asset
    const tradeAsset = assetOverride || state.activeAssetId;
    
    // CRITICAL FIX: Fetch correct price for override asset
    let executionPrice = currentPrice;
    if (assetOverride && assetOverride !== state.activeAssetId) {
        // If trading an asset not currently viewed, we MUST fetch its price
        // to avoid using the viewed asset's price (e.g. BTC price for EUR trade)
        const svc = new BinanceService(state.nodeKeys.binance.apiKey, state.nodeKeys.binance.secretKey);
        try {
            executionPrice = await svc.getTickerPrice(tradeAsset, state.activeSource);
        } catch(e) {
            console.error("Price fetch failed for override", e);
            // Fallback to avoid division by zero or NaN, but this trade is risky
            return;
        }
    }
    
    if (!executionPrice || executionPrice <= 0) executionPrice = 1; // Safety

    // 1. Margin Calculation (CORRECTED FORMULA)
    let marginRequired = amount;
    if (state.activeSource !== 'binance') {
        const contractSize = getContractSize(tradeAsset);
        // Correct Forex/Indices Margin: (Lots * ContractSize * Price) / Leverage
        // This fixes the "Billions" error where margin was underestimated.
        marginRequired = (amount * contractSize * executionPrice) / state.leverage; 
    }

    // 2. Fee Calculation (Simulasi 0.1% dari Margin)
    const estimatedFee = marginRequired * 0.001; 
    const totalDeduction = marginRequired + estimatedFee;

    if (currentBalance < totalDeduction) {
       addNeuralEvent(`Insufficient Funds in ${isReal ? (state.allocatedBalances[state.activeSource] !== null ? 'Allocated' : 'Main') : 'Demo'} Wallet. Need ${totalDeduction.toFixed(2)}`, 'SYSTEM');
       return;
    }

    // Apply state updates based on calculated margin
    setState(prev => {
        const newBalances = { ...prev.balances };
        const newAllocated = { ...prev.allocatedBalances };
        
        // 3. Deduct Margin + Fee from TOTAL Ledger
        if (activeWalletKey === 'real' || activeWalletKey === 'simulation') {
            // @ts-ignore
            newBalances[activeWalletKey] -= totalDeduction; 
        } else {
            (newBalances as any)[activeWalletKey] -= totalDeduction;
        }

        // 4. Deduct from ALLOCATED Ledger (If active)
        if (isReal && newAllocated[state.activeSource] !== null) {
            // @ts-ignore
            newAllocated[state.activeSource] -= totalDeduction;
        }

        // Capture Balance After Deduction for Snapshot
        const balanceAfter = isReal && newAllocated[state.activeSource] !== null 
            ? newAllocated[state.activeSource]!
            // @ts-ignore
            : (activeWalletKey === 'real' || activeWalletKey === 'simulation' ? newBalances[activeWalletKey] : newBalances[activeWalletKey]);

        const newTx: Transaction = {
          id: Date.now().toString(),
          type: state.executionType === 'autopilot' ? (type === 'BUY' ? 'AUTO_BUY' : 'AUTO_SELL') : type,
          asset: tradeAsset,
          source: state.activeSource, 
          category: state.activeCategory,
          amount: amount, 
          price: executionPrice,
          leverage: state.leverage,
          status: 'OPEN',
          timestamp: new Date(),
          pnl: 0,
          fee: estimatedFee,
          initialMargin: marginRequired, // Stored for accurate restoration
          balanceSnapshot: {
              before: currentBalance,
              after: balanceAfter
          }
        };

        return {
          ...prev,
          balances: newBalances,
          allocatedBalances: newAllocated,
          transactions: [newTx, ...prev.transactions]
        };
    });

    addNeuralEvent(`Position Opened: ${type} ${tradeAsset} @ ${amount}`, 'EXECUTION');
  };

  const handleClosePosition = async (txId: string) => {
    const txIndex = state.transactions.findIndex(t => t.id === txId);
    if (txIndex === -1) return;

    const tx = state.transactions[txIndex];
    if (tx.status !== 'OPEN') return;

    const binanceService = new BinanceService('', '');
    const closingPrice = await binanceService.getTickerPrice(tx.asset, tx.source);

    const diff = closingPrice - tx.price;
    let rawPnl = 0;
    
    if (state.activeSource === 'binance') {
         // Crypto PnL
         const direction = tx.type.includes('BUY') ? 1 : -1;
         rawPnl = ((diff / tx.price) * direction * tx.amount * tx.leverage);
    } else {
         // Forex/Metals PnL (NORMALIZED)
         const contractSize = getContractSize(tx.asset);
         const direction = tx.type.includes('BUY') ? 1 : -1;
         
         // PnL = PriceDiff * ContractSize * Lots
         rawPnl = (diff * direction) * contractSize * tx.amount;
         
         // JPY Correction (Price diff is in JPY, must convert to USD approx /100 or /Rate)
         if (tx.asset.includes('JPY')) rawPnl /= 100;
    }
    
    // Return Margin (Closed Position) - Use stored initialMargin if available, else recalculate
    let marginUsed = tx.initialMargin || 0;
    if (!marginUsed) {
        // Fallback for old transactions
        if (state.activeSource !== 'binance') {
            const contractSize = getContractSize(tx.asset);
            // We use closing price here as approximation if open price logic was flawed before
            marginUsed = (tx.amount * contractSize * tx.price) / tx.leverage; 
        } else {
            marginUsed = tx.amount;
        }
    }

    const finalReturn = marginUsed + rawPnl;
    const isReal = state.tradingMode === 'real';
    
    let activeWalletKey = isReal ? (tx.source === 'binance' ? 'real' : tx.source) : 'simulation';
    const newBalances = { ...state.balances };
    const newAllocated = { ...state.allocatedBalances };
    
    // Update Total Balance
    // @ts-ignore
    if (activeWalletKey === 'real' || activeWalletKey === 'simulation') newBalances[activeWalletKey] += finalReturn;
    else (newBalances as any)[activeWalletKey] += finalReturn;

    // Update Allocated Balance (If active and matched source)
    if (isReal && newAllocated[tx.source] !== null) {
        // @ts-ignore
        newAllocated[tx.source] += finalReturn;
    }

    // Balance After Return (Final Snapshot)
    const balanceAfterClose = isReal && newAllocated[tx.source] !== null
        ? newAllocated[tx.source]!
        // @ts-ignore
        : (activeWalletKey === 'real' || activeWalletKey === 'simulation' ? newBalances[activeWalletKey] : newBalances[activeWalletKey]);

    const updatedTx: Transaction = { 
        ...tx, 
        status: rawPnl >= 0 ? 'CLOSED_TP' : 'CLOSED_SL', 
        pnl: rawPnl, 
        closePrice: closingPrice,
        closeTimestamp: new Date(),
        // Update snapshot to reflect final state
        balanceSnapshot: {
            before: tx.balanceSnapshot?.before || 0, // Keep original entry balance
            after: balanceAfterClose // New final balance
        }
    };
    
    const newTransactions = [...state.transactions];
    newTransactions[txIndex] = updatedTx;

    setState(prev => ({
      ...prev,
      balances: newBalances,
      allocatedBalances: newAllocated,
      transactions: newTransactions
    }));

    addNeuralEvent(`Position Closed: ${tx.asset} | PnL: ${rawPnl.toFixed(2)}`, rawPnl > 0 ? 'EXECUTION' : 'MARKET_ALERT');
  };

  const handleKillSwitch = async () => {
    const openTxs = state.transactions.filter(t => t.status === 'OPEN' && t.source === state.activeSource);
    if (openTxs.length === 0) return;

    let totalReturn = 0;
    const newTransactions = [...state.transactions];
    const binanceService = new BinanceService('', '');

    await Promise.all(openTxs.map(async (tx) => {
       const closingPrice = await binanceService.getTickerPrice(tx.asset, tx.source);
       const diff = closingPrice - tx.price;
       
       let rawPnl = 0;
       if (state.activeSource === 'binance') {
           const direction = tx.type.includes('BUY') ? 1 : -1;
           rawPnl = ((diff / tx.price) * direction * tx.amount * tx.leverage);
       } else {
           const contractSize = getContractSize(tx.asset);
           const direction = tx.type.includes('BUY') ? 1 : -1;
           rawPnl = (diff * direction) * contractSize * tx.amount;
           if (tx.asset.includes('JPY')) rawPnl /= 100;
       }

       let marginUsed = tx.initialMargin || 0;
       if (!marginUsed) {
           if (state.activeSource !== 'binance') {
              const contractSize = getContractSize(tx.asset);
              marginUsed = (tx.amount * contractSize * tx.price) / tx.leverage;
           } else {
              marginUsed = tx.amount;
           }
       }

       totalReturn += (marginUsed + rawPnl);
       
       const idx = newTransactions.findIndex(t => t.id === tx.id);
       if (idx !== -1) {
          newTransactions[idx] = { 
              ...newTransactions[idx], 
              status: 'CLOSED_MANUAL', 
              pnl: rawPnl,
              closePrice: closingPrice,
              closeTimestamp: new Date()
          };
       }
    }));

    const isReal = state.tradingMode === 'real';
    let activeWalletKey = isReal ? (state.activeSource === 'binance' ? 'real' : state.activeSource) : 'simulation';
    const newBalances = { ...state.balances };
    const newAllocated = { ...state.allocatedBalances };

    // @ts-ignore
    if (activeWalletKey === 'real' || activeWalletKey === 'simulation') newBalances[activeWalletKey] += totalReturn;
    else (newBalances as any)[activeWalletKey] += totalReturn;

    if (isReal && newAllocated[state.activeSource] !== null) {
        // @ts-ignore
        newAllocated[state.activeSource] += totalReturn;
    }

    const finalBalance = isReal && newAllocated[state.activeSource] !== null 
        ? newAllocated[state.activeSource]!
        : ((newBalances as any)[activeWalletKey] || (newBalances as any).simulation);
    
    newTransactions.forEach(t => {
        if(t.status === 'CLOSED_MANUAL' && !t.balanceSnapshot?.after) {
             t.balanceSnapshot = {
                 before: t.balanceSnapshot?.before || 0,
                 after: finalBalance 
             }
        }
    });

    setState(prev => ({
       ...prev,
       balances: newBalances,
       allocatedBalances: newAllocated,
       transactions: newTransactions
    }));

    addNeuralEvent(`KILL SWITCH ACTIVATED: ${openTxs.length} Positions Liquidated on ${state.activeSource.toUpperCase()}`, 'SYSTEM');
  };


  const handleNavigate = (page: NavPage, source?: TradingSource) => {
    setCurrentPage(page);
    if (source && source !== state.activeSource) {
      const isCrypto = source === 'binance';
      
      setState(p => ({ 
        ...p, 
        activeSource: source, 
        activeAssetId: isCrypto ? 'BTC' : 'EUR', 
        activeCategory: isCrypto ? MarketCategory.crypto : MarketCategory.forex,
        executionType: 'manual' 
      }));

      syncRealBalance(source);
    }
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const onUpdateLeverage = (lev: number) => {
    setState(p => ({ ...p, leverage: lev }));
  };

  const renderPage = () => {
    switch(currentPage) {
      case NavPage.DASHBOARD: return <Dashboard key={state.activeSource} state={state} />;
      case NavPage.TERMINAL: return <Terminal 
        key={state.activeSource}
        state={state} 
        currentPrice={currentPrice}
        onTrade={handleTrade}
        onClosePosition={handleClosePosition} 
        onKillSwitch={handleKillSwitch}
        onResetSimulation={handleResetSimulation}
        onSetAllocation={handleSetAllocation}
        setActiveAsset={(cat, id) => setState(p => ({...p, activeCategory: cat, activeAssetId: id}))} 
        setTradingMode={(m) => setState(p => ({...p, tradingMode: m}))} 
        setExecutionType={(e) => setState(p => ({...p, executionType: e}))} 
        setActiveBrain={(b) => setState(p => ({...p, activeBrain: b}))} 
        scanningAsset={scanningAsset}
        onUpdateLeverage={onUpdateLeverage}
        selectedCurrency={state.selectedCurrency}
        // @ts-ignore
        onPriceUpdate={(price) => setCurrentPrice(price)}
      />;
      case NavPage.JOURNAL: return <Journal key={state.activeSource} state={state} />;
      case NavPage.HISTORY: return <History key={state.activeSource} state={state} />;
      case NavPage.TRADING: return <TradingBot />;
      case NavPage.CREATIVE: return <CreativeLab />;
      case NavPage.ANALYSIS: return <Analysis />;
      case NavPage.ASSETS: return <Assets key={state.activeSource} balances={state.balances} activeSource={state.activeSource} selectedCurrency={state.selectedCurrency} isReal={state.tradingMode === 'real'} onRefresh={() => syncRealBalance()} />;
      case NavPage.SETTINGS: return <Settings state={state} onUpdateState={(u) => setState(p => ({...p, ...u}))} />;
      case NavPage.DEPLOY_PANEL: return <DeployPanel />;
      case NavPage.DATABASE_USER: return <DatabaseUser database={state.licenseDatabase} onUpdateDatabase={(d) => setState(p => ({...p, licenseDatabase: d}))} />;
      case NavPage.INTEL: return <MarketIntel />;
      case NavPage.ALGO_LAB: return <StrategyBuilder />;
      default: return <Dashboard key={state.activeSource} state={state} />;
    }
  };

  return (
    <div className={`h-screen w-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-hidden font-inter ${state.theme === 'light_aurora' ? 'brightness-125 saturate-150' : ''}`}>
      <LandingScreen />
      
      {syncStatus === 'SYNCING' && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-[100] animate-scan"></div>
      )}

      {showLicensePortal && !loading && (
        <LicensePortal 
          database={state.licenseDatabase} 
          onSuccess={(licenseKey, authority) => { 
            setState(p => ({ ...p, isLicenseVerified: true, verifiedLicenseKey: licenseKey, currentUserAuthority: authority })); 
            setShowLicensePortal(false); 
          }} 
        />
      )}
      {!loading && !showLicensePortal && (
        <div className="flex relative h-full w-full overflow-hidden">
          {/* Mobile Overlay Backdrop */}
          {isMobile && isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
          )}

          <Sidebar 
            currentPage={currentPage} 
            activeSource={state.activeSource} 
            onNavigate={handleNavigate} 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            serverLinked={(state.nodeKeys as any)[state.activeSource]?.isAuthorized} 
            authority={state.currentUserAuthority} 
          />
          
          {/* Main Content Area - Responsive Layout Fix: No padding on mobile when sidebar open */}
          <div className={`flex-1 flex flex-col transition-all duration-500 min-w-0 h-full relative ${isSidebarOpen && !isMobile ? 'pl-64' : 'pl-0'}`}>
            <header className="h-16 md:h-20 glass border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 bg-slate-950/80 relative">
              <div className="flex items-center gap-3 md:gap-5">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-emerald-400 p-2 rounded-lg hover:bg-white/5 transition-all">
                  <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <div className="flex flex-col">
                  <h1 className="text-lg md:text-2xl font-orbitron font-bold gradient-text tracking-widest block truncate max-w-[150px] md:max-w-none">
                    {currentPage.replace('_', ' ')}
                  </h1>
                  {syncStatus === 'SYNCING' && (
                     <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Syncing...</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 relative">
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brain Uplink</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${state.activeBrain ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-bold ${state.activeBrain ? 'text-emerald-400' : 'text-slate-500'}`}>{state.activeBrain === 'DEEPSEEK_R1' ? 'DeepSeek R1' : 'Gemini V3'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-900 border flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all shadow-lg ${isSettingsOpen ? 'border-emerald-500 text-emerald-400 shadow-emerald-500/20' : 'border-white/10'}`}
                  >
                    <i className="fa-solid fa-gear animate-spin-slow text-sm md:text-base"></i>
                  </button>

                  {isSettingsOpen && (
                     <div className="absolute top-14 md:top-16 right-0 w-72 md:w-80 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-0 z-50 animate-slideDown overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-slate-900/50">
                           <h4 className="font-orbitron font-bold text-white text-sm uppercase tracking-widest">Node Settings</h4>
                           <p className="text-[9px] text-slate-500 font-black uppercase">Configuration Panel</p>
                        </div>
                        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                           
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Theme Mode</label>
                              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                                 <button onClick={() => setState(p => ({...p, theme: 'dark_onyx'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.theme === 'dark_onyx' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Dark</button>
                                 <button onClick={() => setState(p => ({...p, theme: 'light_aurora'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.theme === 'light_aurora' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Light</button>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">AI Neural Model</label>
                              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                                 <button onClick={() => setState(p => ({...p, activeBrain: 'DEEPSEEK_R1'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.activeBrain === 'DEEPSEEK_R1' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>DeepSeek</button>
                                 <button onClick={() => setState(p => ({...p, activeBrain: 'GEMINI_V3'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.activeBrain === 'GEMINI_V3' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Gemini</button>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Interface Language</label>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                 {LANGUAGES.map(lang => (
                                    <button 
                                      key={lang.code} 
                                      onClick={() => setState(p => ({...p, language: lang.code as AppLanguage}))}
                                      className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${state.language === lang.code ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-white/5'}`}
                                    >
                                       <span>{lang.flag}</span>
                                       <span className="text-[9px] font-bold">{lang.code}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Global Currency</label>
                              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                 {GLOBAL_CURRENCIES.map(curr => (
                                    <button 
                                      key={curr.code} 
                                      onClick={() => setState(p => ({...p, selectedCurrency: curr}))}
                                      className={`px-3 py-2 rounded-lg border text-left transition-all ${state.selectedCurrency.code === curr.code ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-white/5'}`}
                                    >
                                       <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold">{curr.code}</span>
                                          <span className="text-[10px]">{curr.symbol}</span>
                                       </div>
                                       <p className="text-[8px] opacity-60 truncate">{curr.name}</p>
                                    </button>
                                 ))}
                              </div>
                           </div>
                           
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-white/5 text-center">
                           <p className="text-[8px] text-slate-600 font-mono">Brain Status: <span className="text-emerald-500">ONLINE</span> • Ping: {state.serverStatus.latency}ms</p>
                        </div>
                     </div>
                  )}
              </div>

            </header>

            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative scroll-smooth custom-scrollbar">
               {renderPage()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;