
import React, { useEffect, useState } from 'react';

const LandingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 5000; 
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5500);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center transition-all duration-1000 ${progress >= 100 ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]"></div>
        
        <div className="particles-container absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="particle absolute bg-teal-400/30 rounded-full"
              style={{
                width: Math.random() * 5 + 2 + 'px',
                height: Math.random() * 5 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDuration: Math.random() * 15 + 10 + 's',
                animationDelay: Math.random() * 5 + 's'
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center max-w-lg w-full px-8 perspective-[1000px]">
        <div className="relative mb-10 group transform-style-3d transition-transform duration-1000 hover:rotate-y-12">
          <div className="w-44 h-44 flex items-center justify-center rounded-[3.5rem] bg-slate-900 border border-teal-500/40 shadow-[0_0_100px_rgba(45,212,191,0.25)] overflow-hidden transition-all duration-700 hover:scale-110 hover:border-teal-400/60 relative">
             <span className="text-9xl font-orbitron font-bold gradient-text animate-glow select-none">H</span>
             <div className="absolute inset-0 shimmer opacity-20"></div>
             
             <div className="absolute w-32 h-32 bg-teal-500/10 blur-3xl rounded-full animate-pulse"></div>
          </div>
          
          <div className="absolute -inset-8 border-2 border-teal-500/10 rounded-[4rem] animate-spin-slow"></div>
          <div className="absolute -inset-16 border border-purple-500/10 rounded-full animate-spin-reverse-slow opacity-30"></div>
          
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-teal-500/20 blur-xl rounded-full animate-ping"></div>
        </div>

        <div className="text-center space-y-4 mb-16 animate-fadeInUp">
          <h1 className="text-7xl font-orbitron font-black tracking-[0.3em] gradient-text drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]">
            AETERNA
          </h1>
          <div className="flex flex-col items-center">
            <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.6em] mt-2 opacity-80">Platform Trading Neural Quantum</p>
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-teal-500 to-transparent my-4"></div>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Arsitektur oleh Hamli | 2026</p>
          </div>
        </div>

        <div className="w-full space-y-6 animate-fadeInUp [animation-delay:0.5s]">
          <div className="flex justify-between items-end px-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-2">Neural Link Established</span>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-700 ${progress > (i+1)*20 ? 'bg-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
            <span className="text-base font-mono font-bold text-teal-400 drop-shadow-[0_0_5px_#2dd4bf]">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-3 w-full bg-slate-950/90 rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-24 bg-teal-400/50 blur-[25px] animate-pulse"></div>
              <div className="absolute inset-0 shimmer opacity-30"></div>
              
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white shadow-[0_0_20px_#fff] rounded-full"></div>
            </div>
          </div>
          
          <div className="flex justify-center gap-12 pt-6">
             <div className="flex items-center gap-3 group">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_12px_#2dd4bf] group-hover:scale-150 transition-transform"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Aeternity Secure</span>
             </div>
             <div className="flex items-center gap-3 group">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_12px_#a855f7] [animation-delay:0.7s] group-hover:scale-150 transition-transform"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Quantum Linked</span>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(45, 212, 191, 0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 35px rgba(45, 212, 191, 0.7)); transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          25% { opacity: 0.6; }
          50% { transform: translateY(-150px) translateX(30px) scale(1.5); opacity: 0.9; }
          75% { opacity: 0.6; }
        }
        .particle {
          animation: particleFloat infinite ease-in-out;
        }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .animate-spin-slow { animation: spin-slow 18s linear infinite; }
        .animate-spin-reverse-slow { animation: spin-reverse-slow 25s linear infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LandingScreen;
