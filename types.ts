
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
  DATABASE_USER = 'database_user'
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
  heartbeat: 'STABLE' | 'RHYTHMIC' | 'STRESS';
  activeInstances: CloudInstance[];
}

export interface RiskConfig {
  riskPerTrade: number;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  maxDailyLoss: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; 
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'AUTO_BUY' | 'AUTO_SELL';
  asset: string;
  category: MarketCategory;
  amount: number;
  price: number;
  leverage: number;
  status: 'OPEN' | 'COMPLETED' | 'FAILED' | 'CLOSED_SL' | 'CLOSED_TP' | 'CLOSED_MANUAL';
  timestamp: Date;
  reasoning?: string;
  pnl?: number;
}

export interface NeuralEvent {
  id: string;
  message: string;
  type: 'AI_THINKING' | 'EXECUTION' | 'SYSTEM' | 'MARKET_ALERT';
  timestamp: Date;
  isCloud?: boolean;
}

export interface SystemHealth {
  cpu: number;
  latency: number;
  aiEfficiency: number;
  nodeStatus: 'STABLE' | 'DEGRADED' | 'SYNCING';
  groqStatus: 'ONLINE' | 'LIMITED' | 'OFFLINE';
}

export interface LicenseUser {
  id: string;
  name: string;
  keylis: string;
  licenseKey: string;
  startDate: string;
  duration: '1' | '7' | '30' | 'UNLIMITED';
  expiryDate: string | 'UNLIMITED';
  isActive: boolean;
  authority: 'ADMIN' | 'USER';
}

export interface TradeSignal {
  action: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
  confidence: number;
  timeframeConfluence: {
    m15: string;
    h1: string;
    h4: string;
    d1: string;
  };
  indicators: {
    rsi: number;
    macd: string;
    volatility: string;
    trend: string;
    marketStructure: string;
    liquidityZones: string[];
    institutionalFootprint: string;
  };
}

export interface BrokerKeys {
  metaApiToken: string;
  accountId: string;
  isAuthorized: boolean;
}

export interface AppState {
  balances: Record<TradingSource, number> & { simulation: number; real: number };
  activeSource: TradingSource;
  nodeKeys: {
    binance: { apiKey: string; secretKey: string; isAuthorized: boolean };
    bybit: { apiKey: string; secretKey: string };
    telegram: { token: string };
    groq: { apiKey: string };
    // Multi-Broker Keys
    fbs: BrokerKeys;
    exness: BrokerKeys;
    xm: BrokerKeys;
    ic_markets: BrokerKeys;
    hfm: BrokerKeys;
    pepperstone: BrokerKeys;
    ig_group: BrokerKeys;
    plus500: BrokerKeys;
    octafx: BrokerKeys;
    ibkr: BrokerKeys;
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
  health: SystemHealth;
  serverStatus: ServerStatus;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  licenseDatabase: LicenseUser[];
  isLicenseVerified: boolean;
  verifiedLicenseKey?: string;
  currentUserAuthority?: 'ADMIN' | 'USER';
  masterNodeSignature?: string;
  thinkingBudget: number;
  aiTemperature: number;
  riskParameters: RiskConfig;
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
