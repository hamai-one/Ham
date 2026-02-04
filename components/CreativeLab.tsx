
import React, { useState, useRef } from 'react';
import { gemini, GeminiService } from '../services/geminiService';
import { MediaItem } from '../types';

const CreativeLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [type, setType] = useState<'image' | 'video' | 'podcast'>('image');
  const [podcastScript, setPodcastScript] = useState('Joe: Selamat datang di Aeterna News. Pasar terlihat sangat bullish hari ini.\nJane: Benar Joe, Bitcoin baru saja menembus level psikologis baru.');
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const playPCM = async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    const bytes = GeminiService.decodeBase64(base64Audio);
    const audioBuffer = await GeminiService.decodeAudioData(bytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  };

  const generate = async () => {
    setGenerating(true);
    setLoadingStep('SYNTHESIZING NEURAL OUTPUT...');

    try {
      if (type === 'image') {
        const url = await gemini.generateImage(prompt) || '';
        setItems(p => [{ type: 'image', url, prompt, timestamp: new Date() }, ...p]);
      } else if (type === 'video') {
        const url = await gemini.generateVideo(prompt);
        setItems(p => [{ type: 'video', url, prompt, timestamp: new Date() }, ...p]);
      } else if (type === 'podcast') {
        const base64Audio = await gemini.generateMarketPodcast(podcastScript);
        if (base64Audio) {
          await playPCM(base64Audio);
          // For visualization, we store a placeholder
          setItems(p => [{ type: 'podcast' as any, url: '', prompt: 'Market News Podcast (Playing Now)', timestamp: new Date() }, ...p]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses permintaan kreatif. Pastikan API Key valid.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <header>
        <h2 className="text-3xl font-bold font-orbitron gradient-text">Creative Neural Lab</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Sintesis Konten Multimodal Cerdas</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="quantum-card p-6 rounded-[2rem] glass border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Pilih Modalitas</h4>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setType('image')} className={`p-4 rounded-xl text-xs font-bold transition-all border ${type === 'image' ? 'bg-teal-500 text-black border-teal-500' : 'bg-slate-950 border-white/5 text-slate-500'}`}>GAMBAR (GEN 2.5)</button>
              <button onClick={() => setType('video')} className={`p-4 rounded-xl text-xs font-bold transition-all border ${type === 'video' ? 'bg-purple-500 text-white border-purple-500' : 'bg-slate-950 border-white/5 text-slate-500'}`}>VIDEO (VEO 3.1)</button>
              <button onClick={() => setType('podcast')} className={`p-4 rounded-xl text-xs font-bold transition-all border ${type === 'podcast' ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-white/5 text-slate-500'}`}>PODCAST BERITA</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="quantum-card p-8 rounded-[2.5rem] glass border-white/5">
            {type === 'podcast' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skrip Podcast Multi-Speaker</label>
                <textarea value={podcastScript} onChange={(e) => setPodcastScript(e.target.value)} className="w-full h-40 bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-sm font-mono text-amber-400 outline-none" />
                <p className="text-[9px] text-slate-600 italic">Format: Joe: [teks] \n Jane: [teks]</p>
              </div>
            ) : (
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Deskripsikan visi neural Anda..." className="w-full h-40 bg-slate-950/50 border border-white/5 rounded-2xl p-6 outline-none" />
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={generate} disabled={generating} className="px-10 py-4 bg-teal-500 text-black font-orbitron font-black text-xs rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                {generating ? <i className="fa-solid fa-sync animate-spin"></i> : "INISIASI SINTESIS"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <div key={idx} className="quantum-card rounded-[2rem] overflow-hidden glass border-white/5 p-4 space-y-4 shadow-xl">
                 {item.type === 'image' ? (
                   <img src={item.url} className="w-full aspect-video object-cover rounded-xl" />
                 ) : item.type === 'video' ? (
                   <video src={item.url} controls className="w-full aspect-video rounded-xl bg-black" />
                 ) : (
                   <div className="w-full aspect-video rounded-xl bg-slate-950 flex flex-col items-center justify-center border border-amber-500/20">
                      <i className="fa-solid fa-microphone-lines text-5xl text-amber-500 mb-4 animate-pulse"></i>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Audio Podcast Aktif</p>
                   </div>
                 )}
                 <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.timestamp.toLocaleTimeString()}</span>
                    <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-lg border border-white/5">{item.type.toUpperCase()}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeLab;
