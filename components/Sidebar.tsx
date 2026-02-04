import React, { useState } from 'react';
import { NavPage, TradingSource } from '../types.ts';

interface SidebarProps {
  currentPage: NavPage;
  activeSource: TradingSource;
  onNavigate: (page: NavPage, source?: TradingSource) => void;
  isOpen: boolean;
  onToggle: () => void;
  serverLinked?: boolean;
  authority?: 'ADMIN' | 'USER';
}

const BROKERS = [
  { id: 'binance', label: 'Binance', icon: 'fa-brands fa-bitcoin', color: 'yellow' },
  { id: 'fbs', label: 'FBS Broker', icon: 'fa-solid fa-chart-line', color: 'blue' },
  { id: 'exness', label: 'Exness', icon: 'fa-solid fa-crown', color: 'amber' },
  { id: 'xm', label: 'XM Global', icon: 'fa-solid fa-shield-halved', color: 'red' },
  { id: 'ic_markets', label: 'IC Markets', icon: 'fa-solid fa-bolt', color: 'emerald' },
  { id: 'hfm', label: 'HFM', icon: 'fa-solid fa-fire', color: 'orange' },
  { id: 'pepperstone', label: 'Pepperstone', icon: 'fa-solid fa-pepper-hot', color: 'rose' },
  { id: 'ig_group', label: 'IG Group', icon: 'fa-solid fa-building-columns', color: 'indigo' },
  { id: 'plus500', label: 'Plus500', icon: 'fa-solid fa-plus', color: 'sky' },
  { id: 'octafx', label: 'OctaFX', icon: 'fa-solid fa-circle-nodes', color: 'teal' },
  { id: 'ibkr', label: 'Interactive Brokers', icon: 'fa-solid fa-building', color: 'violet' }
];

const subMenus = [
  { id: NavPage.DASHBOARD, icon: 'fa-gauge-high', label: 'Master Node' },
  { id: NavPage.TERMINAL, icon: 'fa-chart-line', label: 'Trading Terminal' },
  { id: NavPage.TRADING, icon: 'fa-brain-circuit', label: 'Neural Bot' },
  { id: NavPage.INTEL, icon: 'fa-shuttle-space', label: 'Market Intel' },
  { id: NavPage.ALGO_LAB, icon: 'fa-flask-vial', label: 'Strategy Lab' },
  { id: NavPage.JOURNAL, icon: 'fa-file-invoice-dollar', label: 'Journal' },
  { id: NavPage.CREATIVE, icon: 'fa-wand-magic-sparkles', label: 'Creative Lab' },
  { id: NavPage.SETTINGS, icon: 'fa-microchip', label: 'Node Core' }
];

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { 
    currentPage, 
    activeSource, 
    onNavigate, 
    isOpen, 
    onToggle, 
    serverLinked = false,
    authority = 'USER'
  } = props;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ [activeSource]: true });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const next = { ...prev };
      next[id] = !prev[id];
      return next;
    });
  };

  const getBrokerColorClass = (color: string) => {
    const map: Record<string, string> = {
      yellow: 'text-yellow-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      red: 'text-red-500',
      emerald: 'text-emerald-400',
      orange: 'text-orange-400',
      rose: 'text-rose-500',
      indigo: 'text-indigo-400',
      sky: 'text-sky-400',
      teal: 'text-teal-400',
      violet: 'text-violet-400'
    };
    return map[color] || 'text-emerald-400';
  };

  const getBrokerBgActive = (color: string) => {
    const map: Record<string, string> = {
      yellow: 'bg-yellow-500/10 border-yellow-500/30',
      blue: 'bg-blue-500/10 border-blue-500/30',
      amber: 'bg-amber-500/10 border-amber-500/30',
      red: 'bg-red-500/10 border-red-500/30',
      emerald: 'bg-emerald-500/10 border-emerald-500/30',
      orange: 'bg-orange-500/10 border-orange-500/30',
      rose: 'bg-rose-500/10 border-rose-500/30',
      indigo: 'bg-indigo-500/10 border-indigo-500/30',
      sky: 'bg-sky-500/10 border-sky-500/30',
      teal: 'bg-teal-500/10 border-teal-500/30',
      violet: 'bg-violet-500/10 border-violet-500/30'
    };
    return map[color] || 'bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <aside className={`w-64 h-screen glass border-r border-emerald-500/10 flex flex-col fixed left-0 top-0 z-50 transition-all duration-700 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 relative">
        <h1 className="text-xl font-orbitron font-bold gradient-text">AETERNA</h1>
        <button onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Admin Section - Restored */}
        {authority === 'ADMIN' && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
            <p className="text-[8px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3 ml-2">Authority Node</p>
            <div className="space-y-1">
              <button 
                onClick={() => onNavigate(NavPage.DEPLOY_PANEL)} 
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${currentPage === NavPage.DEPLOY_PANEL ? 'bg-rose-500/20 text-white' : 'text-slate-500 hover:text-rose-400'}`}
              >
                <i className="fa-solid fa-server text-[10px]"></i>
                <span className="text-[10px] font-bold uppercase">Cloud Instance</span>
              </button>
              <button 
                onClick={() => onNavigate(NavPage.DATABASE_USER)} 
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${currentPage === NavPage.DATABASE_USER ? 'bg-rose-500/20 text-white' : 'text-slate-500 hover:text-rose-400'}`}
              >
                <i className="fa-solid fa-database text-[10px]"></i>
                <span className="text-[10px] font-bold uppercase">License Matrix</span>
              </button>
            </div>
          </div>
        )}

        {/* Brokers Navigation - Dynamic Standard */}
        {BROKERS.map(broker => (
          <div key={broker.id} className="mb-2">
            <button 
              onClick={() => toggleGroup(broker.id)} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSource === broker.id ? 'bg-white/5 border border-white/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <i className={`${broker.icon} text-[12px] ${getBrokerColorClass(broker.color)}`}></i>
                <span className={`text-[10px] font-black tracking-widest uppercase ${activeSource === broker.id ? 'text-white' : 'text-slate-400'}`}>{broker.label}</span>
              </div>
              <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${openGroups[broker.id] ? 'rotate-180' : ''}`}></i>
            </button>
            
            {openGroups[broker.id] && (
              <div className="mt-1 space-y-1 border-l border-white/5 ml-4 animate-slideDown">
                {subMenus.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => onNavigate(item.id, broker.id as TradingSource)} 
                    className={`w-full flex items-center gap-4 pl-6 py-2.5 rounded-r-xl transition-all ${currentPage === item.id && activeSource === broker.id ? `${getBrokerBgActive(broker.color)} text-white border-l-2` : 'text-slate-500 hover:text-white'}`}
                  >
                    <i className={`fa-solid ${item.icon} text-[10px]`}></i>
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-emerald-500/10 text-[8px] font-bold uppercase text-center">
        {serverLinked ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            Node established
          </div>
        ) : (
          <span className="text-rose-500">Master Offline</span>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;