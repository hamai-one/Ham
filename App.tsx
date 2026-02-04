
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
import { NavPage, Transaction, AppState, MarketCategory, NeuralBrain, TradingMode, ExecutionType, ServerStatus, NeuralEvent, TradingSource, Currency, AppLanguage } from './types.ts';
import { 
  BINANCE_KEY as DEFAULT_BINANCE_KEY,
  BINANCE_SECRET as DEFAULT_BINANCE_SECRET,
  BYBIT_KEY as DEFAULT_BYBIT_KEY,
  BYBIT_SECRET as DEFAULT_BYBIT_SECRET,
  TELEGRAM_BOT_TOKEN as DEFAULT_TG_TOKEN,
  GROQ_API_KEY as DEFAULT_GROQ_KEY,
  SCAN_SYMBOLS
} from './constants.tsx';
import { BinanceService } from './services/binanceService.ts';

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

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showLicensePortal, setShowLicensePortal] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavPage>(NavPage.DASHBOARD);
  // Current Price State untuk PnL Realtime
  const [currentPrice, setCurrentPrice] = useState<number>(0); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [scanningAsset, setScanningAsset] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const dbk = { metaApiToken: '', accountId: '', isAuthorized: false };
    const defaultState: AppState = {
      balances: { 
        simulation: 100000.00, real: 0.00, fbs: 0, exness: 0, xm: 0, ic_markets: 0, hfm: 0, 
        pepperstone: 0, ig_group: 0, plus500: 0, octafx: 0, ibkr: 0, binance: 0 
      },
      activeSource: 'binance',
      nodeKeys: {
        binance: { apiKey: DEFAULT_BINANCE_KEY, secretKey: DEFAULT_BINANCE_SECRET, isAuthorized: false },
        bybit: { apiKey: DEFAULT_BYBIT_KEY, secretKey: DEFAULT_BYBIT_SECRET },
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
      licenseDatabase: [{ id: 'ADM', name: 'Admin Central', keylis: 'dasopano21', licenseKey: 'dasopano21', startDate: '2025-01-01', duration: 'UNLIMITED', expiryDate: 'UNLIMITED', isActive: true, authority: 'ADMIN' }],
      isLicenseVerified: false, thinkingBudget: 32768, aiTemperature: 0.7,
      riskParameters: { riskPerTrade: 1.5, stopLoss: 2.0, takeProfit: 5.0, maxDrawdown: 10.0, maxDailyLoss: 5.0 }
    };

    try {
      const saved = localStorage.getItem('AETERNA_FOUNDATION_V16');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          transactions: (parsed.transactions || []).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })),
          neuralEvents: (parsed.neuralEvents || []).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }))
        };
      }
      return defaultState;
    } catch (e) {
      return defaultState;
    }
  });

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

  // --- TRADING LOGIC IMPLEMENTATION ---

  // Handle Reset Simulation
  const handleResetSimulation = () => {
    setState(prev => ({
      ...prev,
      balances: { ...prev.balances, simulation: 10000.00 } // Reset ke 10,000 USDT
    }));
    addNeuralEvent("Simulation Balance Reset to default.", "SYSTEM");
  };

  // 1. Handle Trade (Open Position)
  const handleTrade = (amount: number, type: 'BUY' | 'SELL') => {
    // Tentukan Wallet Mana yang Dipakai
    let activeWalletKey = state.tradingMode === 'simulation' ? 'simulation' : (state.activeSource === 'binance' ? 'real' : state.activeSource);
    
    // @ts-ignore
    const currentBalance = activeWalletKey === 'real' || activeWalletKey === 'simulation' ? state.balances[activeWalletKey] : state.balances[activeWalletKey];

    if (currentBalance < amount) {
       addNeuralEvent(`Insufficient Funds in ${activeWalletKey.toUpperCase()} Wallet`, 'SYSTEM');
       return;
    }

    // Kurangi Saldo
    const newBalances = { ...state.balances };
    // @ts-ignore
    if (activeWalletKey === 'real' || activeWalletKey === 'simulation') newBalances[activeWalletKey] -= amount;
    else (newBalances as any)[activeWalletKey] -= amount;

    // Buat Transaksi Baru
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: state.executionType === 'autopilot' ? (type === 'BUY' ? 'AUTO_BUY' : 'AUTO_SELL') : type,
      asset: state.activeAssetId,
      category: state.activeCategory,
      amount: amount,
      price: currentPrice || 0, // Harga saat entry
      leverage: state.leverage,
      status: 'OPEN',
      timestamp: new Date(),
      pnl: 0
    };

    setState(prev => ({
      ...prev,
      balances: newBalances,
      transactions: [newTx, ...prev.transactions]
    }));

    addNeuralEvent(`Position Opened: ${type} ${state.activeAssetId} @ $${currentPrice?.toFixed(2)}`, 'EXECUTION');
  };

  // 2. Handle Close Position (Realize PnL)
  // Perlu menerima harga saat ini dari Terminal agar akurat
  const handleClosePosition = (txId: string, closingPrice: number) => {
    const txIndex = state.transactions.findIndex(t => t.id === txId);
    if (txIndex === -1) return;

    const tx = state.transactions[txIndex];
    if (tx.status !== 'OPEN') return;

    // Hitung PnL
    // (Harga Close - Harga Entry) / Harga Entry * Leverage * Margin
    const diff = closingPrice - tx.price;
    const rawPnl = (tx.type.includes('BUY') ? diff : -diff) / tx.price * tx.amount * tx.leverage;
    
    // Kembalikan Margin + PnL ke Saldo
    const finalAmount = tx.amount + rawPnl;
    
    let activeWalletKey = state.tradingMode === 'simulation' ? 'simulation' : (state.activeSource === 'binance' ? 'real' : state.activeSource);
    const newBalances = { ...state.balances };
    
    // @ts-ignore
    if (activeWalletKey === 'real' || activeWalletKey === 'simulation') newBalances[activeWalletKey] += finalAmount;
    else (newBalances as any)[activeWalletKey] += finalAmount;

    // Update Transaksi
    const updatedTx = { ...tx, status: 'CLOSED_MANUAL', pnl: rawPnl, timestamp: new Date() }; // Update timestamp close if needed
    const newTransactions = [...state.transactions];
    newTransactions[txIndex] = updatedTx as Transaction;

    setState(prev => ({
      ...prev,
      balances: newBalances,
      transactions: newTransactions
    }));

    addNeuralEvent(`Position Closed: ${tx.asset} | PnL: ${rawPnl.toFixed(2)}`, rawPnl > 0 ? 'EXECUTION' : 'MARKET_ALERT');
  };

  // 3. Kill Switch (Panic Button)
  const handleKillSwitch = () => {
    const openTxs = state.transactions.filter(t => t.status === 'OPEN');
    if (openTxs.length === 0) return;

    let totalRefund = 0;
    const newTransactions = [...state.transactions];

    openTxs.forEach(tx => {
       // Close paksa dengan harga sekarang (currentPrice state global atau fetch latest)
       // Kita gunakan currentPrice state app yg diupdate oleh Terminal
       const diff = (currentPrice || tx.price) - tx.price;
       const rawPnl = (tx.type.includes('BUY') ? diff : -diff) / tx.price * tx.amount * tx.leverage;
       totalRefund += (tx.amount + rawPnl);
       
       const idx = newTransactions.findIndex(t => t.id === tx.id);
       if (idx !== -1) {
          newTransactions[idx] = { ...newTransactions[idx], status: 'CLOSED_MANUAL', pnl: rawPnl };
       }
    });

    let activeWalletKey = state.tradingMode === 'simulation' ? 'simulation' : (state.activeSource === 'binance' ? 'real' : state.activeSource);
    const newBalances = { ...state.balances };
    // @ts-ignore
    if (activeWalletKey === 'real' || activeWalletKey === 'simulation') newBalances[activeWalletKey] += totalRefund;
    else (newBalances as any)[activeWalletKey] += totalRefund;

    setState(prev => ({
       ...prev,
       balances: newBalances,
       transactions: newTransactions
    }));

    addNeuralEvent(`KILL SWITCH ACTIVATED: ${openTxs.length} Positions Liquidated`, 'SYSTEM');
  };


  const handleNavigate = (page: NavPage, source?: TradingSource) => {
    setCurrentPage(page);
    if (source) {
      const isCrypto = source === 'binance';
      setState(p => ({ 
        ...p, 
        activeSource: source, 
        activeAssetId: isCrypto ? 'BTC' : 'EUR', 
        activeCategory: isCrypto ? MarketCategory.crypto : MarketCategory.forex
      }));
    }
  };

  const onUpdateLeverage = (lev: number) => {
    setState(p => ({ ...p, leverage: lev }));
  };

  const renderPage = () => {
    switch(currentPage) {
      case NavPage.DASHBOARD: return <Dashboard state={state} />;
      case NavPage.TERMINAL: return <Terminal 
        state={state} 
        currentPrice={currentPrice} // Kirim harga ke terminal untuk visualisasi
        onTrade={handleTrade}
        onClosePosition={(id) => handleClosePosition(id, currentPrice)} // Gunakan harga saat ini untuk close
        onKillSwitch={handleKillSwitch}
        onResetSimulation={handleResetSimulation} // Pass reset function
        setActiveAsset={(cat, id) => setState(p => ({...p, activeCategory: cat, activeAssetId: id}))} 
        setTradingMode={(m) => setState(p => ({...p, tradingMode: m}))} 
        setExecutionType={(e) => setState(p => ({...p, executionType: e}))} 
        setActiveBrain={(b) => setState(p => ({...p, activeBrain: b}))} 
        scanningAsset={scanningAsset}
        onUpdateLeverage={onUpdateLeverage}
        selectedCurrency={state.selectedCurrency}
        // Callback khusus agar Terminal bisa update harga global App untuk sinkronisasi PnL
        // @ts-ignore
        onPriceUpdate={(price) => setCurrentPrice(price)}
      />;
      case NavPage.JOURNAL: return <Journal state={state} />;
      case NavPage.TRADING: return <TradingBot />;
      case NavPage.CREATIVE: return <CreativeLab />;
      case NavPage.ANALYSIS: return <Analysis />;
      case NavPage.ASSETS: return <Assets balances={state.balances} activeSource={state.activeSource} selectedCurrency={state.selectedCurrency} isReal={state.tradingMode === 'real'} />;
      case NavPage.SETTINGS: return <Settings state={state} onUpdateState={(u) => setState(p => ({...p, ...u}))} />;
      case NavPage.DEPLOY_PANEL: return <DeployPanel />;
      case NavPage.DATABASE_USER: return <DatabaseUser database={state.licenseDatabase} onUpdateDatabase={(d) => setState(p => ({...p, licenseDatabase: d}))} />;
      case NavPage.INTEL: return <MarketIntel />;
      case NavPage.ALGO_LAB: return <StrategyBuilder />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className={`h-screen w-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-hidden font-inter ${state.theme === 'light_aurora' ? 'brightness-125 saturate-150' : ''}`}>
      <LandingScreen />
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
          <Sidebar 
            currentPage={currentPage} 
            activeSource={state.activeSource} 
            onNavigate={handleNavigate} 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            serverLinked={(state.nodeKeys as any)[state.activeSource]?.isAuthorized} 
            authority={state.currentUserAuthority} 
          />
          <div className={`flex-1 flex flex-col transition-all duration-500 min-w-0 h-full relative ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
            <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 shrink-0 z-40 bg-slate-950/80 relative">
              <div className="flex items-center gap-5">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-emerald-400 p-2 rounded-lg hover:bg-white/5 transition-all">
                  <i className="fa-solid fa-bars text-xl"></i>
                </button>
                <h1 className="text-2xl font-orbitron font-bold gradient-text tracking-widest hidden md:block">
                  {currentPage.replace('_', ' ')}
                </h1>
              </div>

              {/* TOP RIGHT SETTINGS BUTTON */}
              <div className="flex items-center gap-4 relative">
                  {/* Connection Status Indicator */}
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brain Uplink</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${state.activeBrain ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-bold ${state.activeBrain ? 'text-emerald-400' : 'text-slate-500'}`}>{state.activeBrain === 'DEEPSEEK_R1' ? 'DeepSeek R1' : 'Gemini V3'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all shadow-lg ${isSettingsOpen ? 'border-emerald-500 text-emerald-400 shadow-emerald-500/20' : 'border-white/10'}`}
                  >
                    <i className="fa-solid fa-gear animate-spin-slow"></i>
                  </button>

                  {/* SETTINGS DROPDOWN */}
                  {isSettingsOpen && (
                     <div className="absolute top-16 right-0 w-80 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-0 z-50 animate-slideDown overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-slate-900/50">
                           <h4 className="font-orbitron font-bold text-white text-sm uppercase tracking-widest">Node Settings</h4>
                           <p className="text-[9px] text-slate-500 font-black uppercase">Configuration Panel</p>
                        </div>
                        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                           
                           {/* Theme */}
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Theme Mode</label>
                              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                                 <button onClick={() => setState(p => ({...p, theme: 'dark_onyx'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.theme === 'dark_onyx' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Dark</button>
                                 <button onClick={() => setState(p => ({...p, theme: 'light_aurora'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.theme === 'light_aurora' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Light</button>
                              </div>
                           </div>

                           {/* AI Model */}
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">AI Neural Model</label>
                              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                                 <button onClick={() => setState(p => ({...p, activeBrain: 'DEEPSEEK_R1'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.activeBrain === 'DEEPSEEK_R1' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>DeepSeek</button>
                                 <button onClick={() => setState(p => ({...p, activeBrain: 'GEMINI_V3'}))} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${state.activeBrain === 'GEMINI_V3' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Gemini</button>
                              </div>
                           </div>

                           {/* Language */}
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

                           {/* Currency */}
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

            <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative scroll-smooth custom-scrollbar">
               {renderPage()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
