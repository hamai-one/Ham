
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gemini } from '../services/geminiService';
import { GroqService } from '../services/groqService';
import { GROQ_API_KEY } from '../constants';
import { ChatMessage, NeuralBrain } from '../types';

const TradingBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeBrain, setActiveBrain] = useState<NeuralBrain>('DEEPSEEK_R1');
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi Service. Menggunakan useMemo agar instance tetap stabil
  const groq = useMemo(() => new GroqService(GROQ_API_KEY), []);

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return; // Mencegah double send

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input; // Simpan input ke variabel lokal
    setInput('');
    setIsThinking(true);

    try {
      let response;
      
      if (activeBrain === 'DEEPSEEK_R1') {
        // Panggil DeepSeek
        response = await groq.chatAnalysis(currentInput);
      } else {
        // Panggil Gemini (Fallback/Alternative)
        response = await gemini.analyzeMarket(currentInput, true);
      }

      setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: response.text, 
          thought: response.thought || "Memproses analisis pasar...",
          timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("Bot Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: `⚠️ **System Error:** ${error.message || 'Koneksi Neural Terputus.'}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn max-h-[calc(100vh-8rem)]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-orbitron gradient-text flex items-center gap-3 tracking-tighter uppercase">
            <i className={`fa-solid ${activeBrain === 'DEEPSEEK_R1' ? 'fa-atom' : 'fa-brain'} text-teal-400 animate-spin-slow`}></i>
            Neural Node Terminal
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Status: <span className="text-emerald-500">ONLINE</span> | Engine: {activeBrain === 'DEEPSEEK_R1' ? 'DeepSeek-R1 (Groq)' : 'Gemini-3-Pro'}
          </p>
        </div>
        <div className="flex bg-slate-950/80 rounded-[1.5rem] p-1.5 border border-white/10 shadow-inner">
          <button 
            onClick={() => setActiveBrain('DEEPSEEK_R1')} 
            className={`px-6 py-3 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${activeBrain === 'DEEPSEEK_R1' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-300'}`}
          >
            DEEPSEEK R1
          </button>
          <button 
            onClick={() => setActiveBrain('GEMINI_V3')} 
            className={`px-6 py-3 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${activeBrain === 'GEMINI_V3' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-slate-600 hover:text-slate-300'}`}
          >
            GEMINI V3
          </button>
        </div>
      </header>

      <div className="flex-1 quantum-card rounded-[3rem] p-8 flex flex-col glass overflow-hidden border-white/5 shadow-2xl relative">
        <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar p-2 relative z-10">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
               <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
                  <i className={`fa-solid ${activeBrain === 'DEEPSEEK_R1' ? 'fa-atom' : 'fa-brain'} text-4xl text-indigo-400 animate-pulse`}></i>
               </div>
               <h4 className="text-xl font-orbitron font-bold text-white mb-2 uppercase tracking-widest">Aeterna Neural Hub</h4>
               <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] max-w-sm leading-relaxed">
                 Siap menganalisis pasar dengan logika {activeBrain === 'DEEPSEEK_R1' ? 'Chain-of-Thought (CoT)' : 'Gemini Pro'}.
               </p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Bagian Thought Process (Hanya untuk Model) */}
              {msg.role === 'model' && msg.thought && (
                  <div className="mb-4 w-full max-w-[95%]">
                      <button 
                        onClick={() => toggleThought(msg.id)}
                        className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] mb-3 px-4 py-2 rounded-full border border-white/5 transition-all shadow-inner ${expandedThoughts.has(msg.id) ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                      >
                         <i className={`fa-solid ${expandedThoughts.has(msg.id) ? 'fa-brain' : 'fa-microchip'}`}></i>
                         {expandedThoughts.has(msg.id) ? 'Collapse Logic' : 'View Reasoning Trace'}
                      </button>
                      
                      {expandedThoughts.has(msg.id) && (
                          <div className="bg-[#020617]/90 border border-indigo-500/30 rounded-[2rem] p-6 mb-4 text-[11px] font-mono text-indigo-300/80 whitespace-pre-wrap animate-slideDown leading-relaxed shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40"></div>
                             <div className="flex items-center justify-between mb-4 border-b border-indigo-500/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Reasoning_Trace::{activeBrain}</span>
                                <i className="fa-solid fa-network-wired text-[10px] text-indigo-500/20"></i>
                             </div>
                             {msg.thought}
                          </div>
                      )}
                  </div>
              )}

              {/* Chat Bubble Utama */}
              <div className={`max-w-[90%] rounded-[2.5rem] p-8 relative shadow-2xl transition-all hover:scale-[1.005] ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border border-indigo-400/30' : 'quantum-card glass border-white/10 text-slate-200'}`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-inter">{msg.text}</div>
                <div className={`absolute bottom-4 ${msg.role === 'user' ? 'left-6' : 'right-6'} opacity-20 text-[8px] font-black uppercase`}>
                   {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Indikator Loading */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="quantum-card glass px-6 py-4 rounded-[1.5rem] animate-pulse text-indigo-400 font-black text-[10px] uppercase flex items-center gap-4 border-indigo-500/20 shadow-xl">
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce shadow-[0_0_8px_#6366f1]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_#6366f1]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_#6366f1]"></div>
                 </div>
                 {activeBrain === 'DEEPSEEK_R1' ? 'DeepSeek Thinking...' : 'Gemini Analyzing...'}
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        <div className="mt-8 flex gap-4 p-2.5 bg-slate-950/80 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={`Tanyakan strategi ke ${activeBrain === 'DEEPSEEK_R1' ? 'DeepSeek R1' : 'Gemini'}...`} 
            className="flex-1 bg-transparent py-5 px-8 outline-none text-sm text-white placeholder-slate-700 font-medium" 
            disabled={isThinking}
          />
          <button onClick={handleSend} disabled={isThinking} className={`w-16 h-16 bg-indigo-600 text-white shadow-indigo-600/30 rounded-[2rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}>
            <i className="fa-solid fa-bolt-lightning text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingBot;
