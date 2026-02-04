import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { gemini } from '../services/geminiService.ts';

const Analysis: React.FC = () => {
  const [mapsLoading, setMapsLoading] = useState(false);
  const [localNodes, setLocalNodes] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    loadMarketNews();
  }, []);

  const loadMarketNews = async () => {
    setLoadingNews(true);
    try {
      const result = await gemini.searchGrounding("Critical crypto and financial market structure updates today");
      const chunks = result.grounding || [];
      const newsItems = chunks.map((chunk: any, i: number) => ({
        id: i,
        title: chunk.web?.title || "Market Anomaly Detected",
        source: chunk.web?.uri ? new URL(chunk.web.uri).hostname : "Neural Core",
        url: chunk.web?.uri || "#"
      })).slice(0, 5);
      setNews(newsItems);
    } catch (e) {
      console.error("News load failed", e);
    } finally {
      setLoadingNews(false);
    }
  };

  const scanLocalNodes = () => {
    setMapsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const result = await gemini.findLocalFinancialNodes(pos.coords.latitude, pos.coords.longitude);
        setLocalNodes(result);
      } catch (err) {
        alert("Gagal memindai node lokal.");
      } finally {
        setMapsLoading(false);
      }
    });
  };

  const heatmapData = [
    { zone: '100k', liquidity: 85, color: '#f43f5e' },
    { zone: '95k', liquidity: 42, color: '#fb7185' },
    { zone: '90k', liquidity: 95, color: '#e11d48' },
    { zone: '85k', liquidity: 60, color: '#fb7185' },
    { zone: '80k', liquidity: 20, color: '#fda4af' }
  ];

  const sentimentData = [
    { name: '00:00', value: 65 },
    { name: '04:00', value: 58 },
    { name: '08:00', value: 82 },
    { name: '12:00', value: 75 },
    { name: '16:00', value: 92 },
    { name: '20:00', value: 88 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-orbitron font-black uppercase tracking-tighter gradient-text">Neural Analysis</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">DXY Correlation & Order Flow Delta</p>
        </div>
        <button 
          onClick={scanLocalNodes}
          disabled={mapsLoading}
          className="px-8 py-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all shadow-2xl flex items-center gap-3 active:scale-95"
        >
          {mapsLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}
          Scan Physical Nodes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 quantum-card p-8 rounded-[3rem] glass border-white/5 h-full flex flex-col">
          <h4 className="font-orbitron font-black text-xs mb-8 text-white flex items-center gap-4 uppercase tracking-[0.2em]">
            <i className="fa-solid fa-satellite text-teal-400"></i>
            Grounding Intelligence
          </h4>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-3">
            {loadingNews ? (
               <div className="animate-pulse space-y-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl"></div>)}
               </div>
            ) : (
              news.map((item) => (
                <a key={item.id} href={item.url} target="_blank" className="block p-5 bg-slate-950/60 rounded-2xl border border-white/5 hover:border-teal-500/30 hover:bg-slate-900/80 transition-all group shadow-inner">
                  <h5 className="text-[12px] font-bold text-slate-200 line-clamp-2 leading-relaxed group-hover:text-teal-400 transition-colors">{item.title}</h5>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{item.source}</p>
                    <i className="fa-solid fa-chevron-right text-[8px] text-slate-800 group-hover:text-teal-500 group-hover:translate-x-1 transition-all"></i>
                  </div>
                </a>
              ))
            )}
            {news.length === 0 && !loadingNews && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-20">
                <i className="fa-solid fa-newspaper text-5xl mb-4"></i>
                <p className="text-xs font-black uppercase tracking-widest">Feed Offline</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {localNodes && (
            <div className="quantum-card p-8 rounded-[3rem] glass border-teal-500/20 animate-scaleIn shadow-2xl">
              <h4 className="font-orbitron font-black text-xs mb-6 text-teal-400 uppercase tracking-widest">Physical Financial Nodes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localNodes.places.slice(0,4).map((chunk: any, i: number) => (
                  chunk.maps && (
                    <a key={i} href={chunk.maps.uri} target="_blank" className="p-5 bg-slate-950/80 border border-white/5 rounded-2xl hover:border-teal-500/50 transition-all group flex items-center justify-between shadow-inner">
                      <div>
                        <span className="text-[11px] font-black text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight">{chunk.maps.title || "POI Node"}</span>
                        <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Node verified</p>
                      </div>
                      <i className="fa-solid fa-up-right-from-square text-[11px] text-slate-800 group-hover:text-teal-400"></i>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="quantum-card p-8 rounded-[2.5rem] border-teal-500/20 glass group">
              <div className="flex justify-between items-start">
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Sentiment</p>
                 <i className="fa-solid fa-brain-circuit text-teal-500/30 group-hover:text-teal-500 transition-colors"></i>
              </div>
              <div className="flex items-end gap-3 mt-4">
                <span className="text-4xl text-teal-400 font-mono font-black tracking-tighter">82.4%</span>
                <span className="text-xs text-teal-500 mb-1.5 font-bold font-mono">+5.2</span>
              </div>
            </div>
            <div className="quantum-card p-8 rounded-[2.5rem] border-purple-500/20 glass group">
               <div className="flex justify-between items-start">
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">DXY Correlation</p>
                 <i className="fa-solid fa-chart-line text-purple-500/30 group-hover:text-purple-500 transition-colors"></i>
              </div>
              <div className="flex items-end gap-3 mt-4">
                <span className="text-4xl text-purple-400 font-mono font-black tracking-tighter">-0.74</span>
                <span className="text-xs text-rose-500 mb-1.5 font-bold font-mono">INV</span>
              </div>
            </div>
            <div className="quantum-card p-8 rounded-[2.5rem] border-amber-500/20 glass group">
               <div className="flex justify-between items-start">
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Flow Imbalance</p>
                 <i className="fa-solid fa-scale-balanced text-amber-500/30 group-hover:text-amber-500 transition-colors"></i>
              </div>
              <div className="flex items-end gap-3 mt-4">
                <span className="text-4xl text-amber-400 font-mono font-black tracking-tighter">1.42</span>
                <span className="text-xs text-teal-500 mb-1.5 font-bold font-mono">BULL</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="quantum-card p-8 rounded-[3rem] border-white/5 glass h-[400px]">
               <h4 className="font-orbitron font-black text-[10px] text-slate-500 uppercase tracking-widest mb-8">Neural Liquidity Heatmap</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={heatmapData} layout="vertical" margin={{ left: -20 }}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="zone" type="category" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ background: '#020617', border: 'none', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                     />
                     <Bar dataKey="liquidity" radius={[0, 10, 10, 0]}>
                        {heatmapData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="quantum-card p-8 rounded-[3rem] border-white/5 glass h-[400px]">
               <h4 className="font-orbitron font-black text-[10px] text-slate-500 uppercase tracking-widest mb-8">Sentiment Pulse (24H)</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={sentimentData}>
                     <defs>
                        <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Tooltip 
                        contentStyle={{ background: '#020617', border: 'none', borderRadius: '16px' }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#2dd4bf" fill="url(#sentimentGrad)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;