
import React, { useState, useEffect, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { ChatMessage, CloudInstance } from '../types';

const DeployPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [instances, setInstances] = useState<CloudInstance[]>([
    { id: 'INST-01', name: 'Master-Node-SG', ip: '192.168.1.104', status: 'ACTIVE', provider: 'AETERNA_VPS', region: 'Singapore', lastHeartbeat: new Date() }
  ]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dasopano21') {
      setIsAuthenticated(true);
      setLastSync(new Date());
    } else {
      alert('ACCESS DENIED: Kunci Otoritas Salah.');
    }
  };

  const deployNewInstance = () => {
    const newInst: CloudInstance = {
      id: `INST-${Math.floor(Math.random()*100)}`,
      name: 'Secondary-Relay',
      ip: '172.10.42.11',
      status: 'CONNECTING',
      provider: 'AWS',
      region: 'Tokyo',
      lastHeartbeat: new Date()
    };
    setInstances([...instances, newInst]);
    setTimeout(() => {
        setInstances(prev => prev.map(i => i.id === newInst.id ? {...i, status: 'ACTIVE'} : i));
    }, 5000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const architectPrompt = `[CORE AUTHORITY GRANTED] User is requesting system modification or check. Otoritas penuh diberikan kepada Anda sebagai arsitek aplikasi ini. Instruksi: ${input}`;
      const { text, thought } = await gemini.analyzeMarket(architectPrompt, true);

      // Fix: Removed 'isThinking' property as it is not defined in the ChatMessage interface
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        thought: thought,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
      setLastSync(new Date());
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'SYSTEM ERROR: Gagal memodifikasi core neural network.',
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center animate-fadeIn">
        <div className="quantum-card p-12 rounded-[3rem] border-rose-500/30 bg-rose-500/[0.02] backdrop-blur-3xl max-w-md w-full text-center space-y-8">
           <div className="w-24 h-24 mx-auto rounded-full border-2 border-rose-500/50 flex items-center justify-center text-rose-500 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <i className="fa-solid fa-vault text-4xl animate-pulse"></i>
           </div>
           <div>
              <h2 className="text-3xl font-orbitron font-bold text-white mb-2 uppercase tracking-tighter">Otoritas Deploy</h2>
              <p className="text-xs text-rose-500/60 font-black tracking-widest uppercase">Masukkan sandi otorisasi pusat</p>
           </div>
           <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD ACCESS..."
                className="w-full bg-slate-950 border border-rose-500/20 rounded-2xl py-5 px-6 text-center text-rose-400 font-mono tracking-[0.5em] focus:border-rose-500/50 outline-none transition-all"
              />
              <button className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-black rounded-2xl shadow-xl shadow-rose-500/20 transition-all active:scale-95">
                UNLOCK CORE ACCESS
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24 h-full flex flex-col">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
              <h2 className="text-4xl font-bold font-orbitron text-rose-500 tracking-tighter uppercase">Cloud Instance Hub</h2>
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">MANAGE YOUR SERVER-SIDE DEPLOYMENTS</p>
        </div>

        <button onClick={deployNewInstance} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-3">
            <i className="fa-solid fa-plus"></i> Deploy New Node
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         {/* INSTANCE LIST */}
         <div className="lg:col-span-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {instances.map(inst => (
                <div key={inst.id} className="quantum-card p-6 rounded-[2rem] glass border-white/5 group hover:border-rose-500/30 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-rose-500">
                            <i className={`fa-solid ${inst.provider === 'AWS' ? 'fa-brands fa-aws' : 'fa-server'}`}></i>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black ${inst.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500 animate-pulse'}`}>{inst.status}</span>
                    </div>
                    <div className="mt-4">
                        <h4 className="text-sm font-bold text-white">{inst.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{inst.ip} | {inst.region}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Uptime: 142h</span>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-rose-600 transition-all"><i className="fa-solid fa-power-off text-[10px]"></i></button>
                            <button className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-rose-600 transition-all"><i className="fa-solid fa-terminal text-[10px]"></i></button>
                        </div>
                    </div>
                </div>
            ))}
         </div>

         {/* TERMINAL LOGS */}
         <div className="lg:col-span-2 flex flex-col h-full quantum-card rounded-[3rem] p-8 border-rose-500/20 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar mb-8 font-mono text-[12px]">
                {messages.length === 0 && (
                    <div className="opacity-30 p-4 border border-white/5 rounded-xl bg-black/20">
                        <p className="text-rose-500">[SYSTEM] NEURAL CORE V11.0 INITIALIZED...</p>
                        <p className="text-slate-500">[SYSTEM] LISTENING FOR DEPLOYMENT COMMANDS...</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-xl border ${msg.role === 'user' ? 'bg-rose-900/10 border-rose-500/20' : 'bg-black/40 border-white/5'}`}>
                        <p className={`text-[10px] font-black uppercase mb-1 ${msg.role === 'user' ? 'text-rose-500' : 'text-slate-500'}`}>{msg.role === 'user' ? '> ARCHITECT' : '# NODE_OUTPUT'}</p>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                ))}
                {isThinking && (
                    <div className="animate-pulse text-rose-500 font-black text-[10px]">[ANALYZING CLOUD VECTORS...]</div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            <div className="flex gap-4">
               <input 
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Terminal command..."
                 className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl py-5 px-8 focus:border-rose-500/50 outline-none text-white font-mono text-sm"
               />
               <button 
                 onClick={handleSend}
                 disabled={isThinking || !input.trim()}
                 className="w-16 h-16 bg-rose-600 text-white rounded-3xl flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 active:scale-90"
               >
                 <i className="fa-solid fa-terminal text-xl"></i>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DeployPanel;
