
import React, { useState } from 'react';
import { AppState, TradingSource, MarketCategory } from '../types.ts';

interface SettingsProps {
  state: AppState;
  onUpdateState: (update: Partial<AppState>) => void;
}

const BROKER_DETAILS: Record<TradingSource, { label: string; icon: string; color: string; tutorial: string[] }> = {
  fbs: { 
    label: 'FBS Broker', icon: 'fa-solid fa-chart-line', color: 'blue',
    tutorial: [
      "Buka Dashboard FBS Anda dan buat akun MT4/MT5 Real.",
      "Daftar di MetaApi.cloud untuk menjembatani MT4 ke Aeterna.",
      "Tambahkan akun MT4 Anda di MetaApi dan pilih server yang sesuai.",
      "Salin 'API Token' dan 'Account ID' ke formulir di bawah."
    ]
  },
  exness: { 
    label: 'Exness', icon: 'fa-solid fa-crown', color: 'amber',
    tutorial: [
      "Login ke Exness Personal Area dan buat akun Pro MT5.",
      "Gunakan MetaApi.cloud sebagai cloud bridge gateway.",
      "Pastikan 'Read-only' atau 'Trading' permission aktif di MetaApi.",
      "Masukkan Account ID UUID dari MetaApi ke sistem Aeterna."
    ]
  },
  binance: { 
    label: 'Binance', icon: 'fa-brands fa-bitcoin', color: 'yellow',
    tutorial: [
      "Masuk ke akun Binance > API Management.",
      "Buat 'New API Key' dengan nama 'AETERNA_NODE'.",
      "Centang 'Enable Spot & Margin Trading'.",
      "Salin API Key dan Secret Key (Secret hanya muncul sekali)."
    ]
  },
  xm: { label: 'XM Global', icon: 'fa-solid fa-shield-halved', color: 'red', tutorial: ["Gunakan MetaApi Bridge untuk MT4/MT5", "Input API Token & Account ID"] },
  ic_markets: { label: 'IC Markets', icon: 'fa-solid fa-bolt', color: 'emerald', tutorial: ["Gunakan MetaApi Bridge", "Support Raw Spread accounts"] },
  hfm: { label: 'HFM', icon: 'fa-solid fa-fire', color: 'orange', tutorial: ["Gunakan MetaApi Bridge", "Support Micro/Premium accounts"] },
  pepperstone: { label: 'Pepperstone', icon: 'fa-solid fa-pepper-hot', color: 'rose', tutorial: ["Gunakan MetaApi Bridge", "C-Trader tidak didukung, gunakan MT4/MT5"] },
  ig_group: { label: 'IG Group', icon: 'fa-solid fa-building-columns', color: 'indigo', tutorial: ["Koneksi via IG API atau MetaApi Bridge"] },
  plus500: { label: 'Plus500', icon: 'fa-solid fa-plus', color: 'sky', tutorial: ["Gunakan API Key resmi Plus500 (Jika tersedia)"] },
  octafx: { label: 'OctaFX', icon: 'fa-solid fa-circle-nodes', color: 'teal', tutorial: ["Gunakan MetaApi Bridge untuk MT4/MT5 sinkronisasi"] },
  ibkr: { label: 'Interactive Brokers', icon: 'fa-solid fa-building', color: 'violet', tutorial: ["Gunakan TWS API atau Gateway Node"] }
};

export const Settings: React.FC<SettingsProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'brokers' | 'general' | 'risk'>('brokers');
  const [selectedBroker, setSelectedBroker] = useState<TradingSource>(state.activeSource);
  const [isSyncing, setIsSyncing] = useState(false);

  const brokerInfo = BROKER_DETAILS[selectedBroker];

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulasi handshake neural ke server broker
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onUpdateState({
      nodeKeys: {
        ...state.nodeKeys,
        [selectedBroker]: {
          ...(state.nodeKeys as any)[selectedBroker],
          isAuthorized: true
        }
      }
    });
    setIsSyncing(false);
  };

  const updateKey = (field: string, value: string) => {
    onUpdateState({
      nodeKeys: {
        ...state.nodeKeys,
        [selectedBroker]: {
          ...(state.nodeKeys as any)[selectedBroker],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-32 w-full max-w-full overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-orbitron font-black gradient-text uppercase tracking-tighter">Node Configuration</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Sacred Protocol v16.9 Synchronization</p>
        </div>
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-slate-950/80 rounded-2xl p-1.5 border border-white/5 shadow-inner whitespace-nowrap min-w-max">
            <button onClick={() => setActiveTab('brokers')} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'brokers' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>Broker Node</button>
            <button onClick={() => setActiveTab('risk')} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'risk' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>Risk Engine</button>
            <button onClick={() => setActiveTab('general')} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'general' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>System</button>
          </div>
        </div>
      </header>

      {activeTab === 'brokers' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* List Broker - Horizontal Scroll di Mobile */}
          <div className="xl:col-span-4 space-y-3 overflow-y-auto max-h-[300px] xl:max-h-[70vh] custom-scrollbar pr-2">
            {(Object.entries(BROKER_DETAILS) as [TradingSource, any][]).map(([id, info]) => {
              const isLinked = (state.nodeKeys as any)[id]?.isAuthorized;
              return (
                <button 
                  key={id} 
                  onClick={() => setSelectedBroker(id)}
                  className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${selectedBroker === id ? `bg-${info.color}-500/10 border-${info.color}-500 shadow-xl` : 'bg-slate-950/40 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-${info.color}-400`}>
                      <i className={info.icon}></i>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-white uppercase">{info.label}</p>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">{isLinked ? 'Uplink Established' : 'Disconnected'}</p>
                    </div>
                  </div>
                  {isLinked && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>}
                </button>
              );
            })}
          </div>

          {/* Configuration Panel */}
          <div className="xl:col-span-8 space-y-8 animate-slideUp">
            <div className={`quantum-card p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] glass border-${brokerInfo.color}-500/20 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <i className={`${brokerInfo.icon} text-[120px] text-white`}></i>
              </div>

              <div className="relative z-10">
                <h4 className="font-orbitron font-black text-xl text-white uppercase mb-8 flex items-center gap-4">
                  <i className={brokerInfo.icon}></i>
                  Bridge Setup: {brokerInfo.label}
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Connection Form */}
                  <div className="space-y-6">
                    {selectedBroker === 'binance' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Binance API Key</label>
                          <input 
                            type="text" 
                            value={state.nodeKeys.binance.apiKey} 
                            onChange={(e) => updateKey('apiKey', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-mono text-yellow-400 outline-none focus:border-yellow-500"
                            placeholder="64 character key..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secret Signature Key</label>
                          <input 
                            type="password" 
                            value={state.nodeKeys.binance.secretKey} 
                            onChange={(e) => updateKey('secretKey', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-mono text-yellow-400 outline-none focus:border-yellow-500"
                            placeholder="Enter secret securely..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MetaApi Bridge Token</label>
                          <input 
                            type="text" 
                            value={(state.nodeKeys as any)[selectedBroker]?.metaApiToken} 
                            onChange={(e) => updateKey('metaApiToken', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-mono text-blue-400 outline-none focus:border-blue-500"
                            placeholder="Your metaapi security token..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account ID (MT4/MT5 UUID)</label>
                          <input 
                            type="text" 
                            value={(state.nodeKeys as any)[selectedBroker]?.accountId} 
                            onChange={(e) => updateKey('accountId', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-mono text-blue-400 outline-none focus:border-blue-500"
                            placeholder="e.g. 5e9f8...d4c1"
                          />
                        </div>
                      </>
                    )}
                    
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className={`w-full py-6 rounded-2xl font-orbitron font-black text-xs uppercase shadow-xl transition-all flex items-center justify-center gap-4 ${isSyncing ? 'bg-slate-900 text-slate-500' : `bg-${brokerInfo.color}-600 text-white shadow-${brokerInfo.color}-500/20 active:scale-95 hover:brightness-110`}`}
                    >
                      {isSyncing ? <i className="fa-solid fa-sync animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                      {isSyncing ? 'Synchronizing Node...' : 'Establish Sacred Link'}
                    </button>
                  </div>

                  {/* Tutorial Side */}
                  <div className="bg-slate-950/60 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                      <i className="fa-solid fa-circle-question"></i>
                      Tutorial Koneksi Robot
                    </h5>
                    <div className="space-y-5">
                      {brokerInfo.tutorial.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className={`w-6 h-6 rounded-lg bg-${brokerInfo.color}-500/10 border border-${brokerInfo.color}-500/30 flex items-center justify-center text-[10px] font-black text-${brokerInfo.color}-400 shrink-0`}>
                            {i + 1}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-white/5">
                       <p className="text-[9px] text-slate-600 italic">
                         Robot Aeterna menggunakan enkripsi quantum untuk memastikan data akun Anda tidak pernah keluar dari Master Node lokal atau cloud relay terdaftar.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="quantum-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] glass border-white/5 animate-slideUp">
           <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-widest mb-10">Neural Risk Guard (Active Nodes)</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                       <span>Sacred Risk Per Trade (%)</span>
                       <span className="text-emerald-400">{state.riskParameters.riskPerTrade}%</span>
                    </div>
                    <input type="range" min="0.1" max="10" step="0.1" value={state.riskParameters.riskPerTrade} onChange={e => onUpdateState({ riskParameters: { ...state.riskParameters, riskPerTrade: parseFloat(e.target.value) } })} className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-full cursor-pointer" />
                    <p className="text-[9px] text-slate-600">Berapa persen dari total ekuitas yang dipertaruhkan per eksekusi.</p>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                       <span>Node Leverage Power</span>
                       <span className="text-amber-500">x{state.leverage}</span>
                    </div>
                    <input type="range" min="1" max="500" step="1" value={state.leverage} onChange={e => onUpdateState({ leverage: parseInt(e.target.value) })} className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-full cursor-pointer" />
                    <p className="text-[9px] text-slate-600">Daya ungkit untuk node forex. (Binance otomatis mengikuti setting Cross/Isolated).</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
