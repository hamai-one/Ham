
export enum NavPage {
  DASHBOARD = 'dashboard',
  TERMINAL = 'terminal',
  TRADING = 'trading',
  JOURNAL = 'journal',
  ANALYSIS = 'analysis',
  INTEL = 'intel',
  ALGO_LAB = 'algo_lab',
  CREATIVE = 'creative',
  ASSETS = 'assets',
  SETTINGS = 'settings',
  DEPLOY_PANEL = 'deploy_panel',
  DATABASE_USER = 'database_user',
  HISTORY = 'history'
}

export enum MarketCategory {
  crypto = 'crypto',
  forex = 'forex',
  metals = 'metals',
  stocks = 'stocks'
}

export type TradingMode = 'simulation' | 'real';
export type ExecutionType = 'manual' | 'autopilot';
export type AppLanguage = 'ID' | 'EN' | 'JP' | 'KR' | 'CN' | 'RU' | 'AR' | 'FR' | 'DE' | 'ES' | 'PT' | 'HI';
export type AppTheme = 'dark_onyx' | 'light_aurora' | 'neon_quantum';
export type StrategyType = 'SCALPER' | 'SWING' | 'HODL' | 'NEURAL_AGGRESSIVE';
export type NeuralBrain = 'GEMINI_V3' | 'DEEPSEEK_R1';

export type TradingSource = 
  | 'binance' 
  | 'fbs' 
  | 'exness' 
  | 'xm' 
  | 'ic_markets' 
  | 'hfm' 
  | 'pepperstone' 
  | 'ig_group' 
  | 'plus500' 
  | 'octafx' 
  | 'ibkr';

export interface CloudInstance {
  id: string;
  name: string;
  ip: string;
  status: 'ACTIVE' | 'CONNECTING' | 'OFFLINE';
  provider: 'AWS' | 'GOOGLE_CLOUD' | 'AZURE' | 'AETERNA_VPS';
  region: string;
  lastHeartbeat: Date;
}

export interface ServerStatus {
  isLinked: boolean;
  nodeIp: string;
  uptime: string;
  latency: number;
  lastSync: Date;
  location: string;
  cpuUsage: number;
  ramUsage: number;
  heartbeat: 'STABLE' | 'LATENCY_SPIKE' | 'OFFLINE';
  activeInstances: CloudInstance[];
}

export interface BalanceSnapshot {
  before: number;
  after: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'AUTO_BUY' | 'AUTO_SELL' | 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_MANUAL';
  asset: string;
  source: TradingSource;
  category: MarketCategory;
  amount: number;
  price: number;
  leverage: number;
  status: 'OPEN' | 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_MANUAL';
  timestamp: Date;
  closePrice?: number;
  closeTimestamp?: Date;
  pnl?: number;
  fee?: number;
  balanceSnapshot?: BalanceSnapshot;
  initialMargin?: number; // Added for accurate balance restoration
}

export interface NeuralEvent {
  id: string;
  message: string;
  type: 'EXECUTION' | 'ANALYSIS' | 'SYSTEM' | 'MARKET_ALERT';
  timestamp: Date;
}

export interface AppState {
  balances: Record<TradingSource, number> & { simulation: number; real: number };
  allocatedBalances: Record<TradingSource, number | null>;
  activeSource: TradingSource;
  nodeKeys: Record<TradingSource, any> & {
    telegram: { token: string; chatId?: string };
    groq: { apiKey: string };
  };
  transactions: Transaction[];
  neuralEvents: NeuralEvent[];
  selectedCurrency: Currency;
  theme: AppTheme;
  language: AppLanguage;
  tradingMode: TradingMode;
  leverage: number;
  activeCategory: MarketCategory;
  activeAssetId: string;
  executionType: ExecutionType;
  activeStrategy: StrategyType;
  activeBrain: NeuralBrain;
  health: { cpu: number; latency: number; aiEfficiency: number; nodeStatus: string; groqStatus: string };
  serverStatus: ServerStatus;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  licenseDatabase: LicenseUser[];
  isLicenseVerified: boolean;
  verifiedLicenseKey: string;
  currentUserAuthority?: 'ADMIN' | 'USER';
  thinkingBudget: number;
  aiTemperature: number;
  riskParameters: {
    riskPerTrade: number;
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
    maxDailyLoss: number;
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface LicenseUser {
  id: string;
  name: string;
  keylis: string;
  licenseKey: string;
  startDate: string;
  duration: string; 
  expiryDate: string;
  isActive: boolean;
  authority: 'ADMIN' | 'USER';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thought?: string;
  timestamp: Date;
}

export interface MediaItem {
  type: 'image' | 'video' | 'podcast';
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface TradeSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  entry: number;
  tp: number;
  sl: number;
  confidence: number;
  reason: string;
  timeframe: string;
}
