
import React, { useState } from 'react';
import { LicenseUser } from '../types';

interface LicensePortalProps {
  database: LicenseUser[];
  onSuccess: (licenseKey: string, authority: 'ADMIN' | 'USER') => void;
}

const LicensePortal: React.FC<LicensePortalProps> = ({ database, onSuccess }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);
    setError('');

    setTimeout(() => {
        const foundUser = database.find(u => u.licenseKey === inputKey.trim());
        
        if (!foundUser) {
            setError("LISENSI TIDAK DITEMUKAN DALAM DATABASE QUANTUM.");
            setValidating(false);
            return;
        }

        if (foundUser.expiryDate !== 'UNLIMITED') {
            const now = new Date();
            const expiry = new Date(foundUser.expiryDate);
            expiry.setHours(23, 59, 59, 999);
            
            if (now > expiry) {
                setError(`LISENSI TELAH KADALUARSA PADA ${foundUser.expiryDate}`);
                setValidating(false);
                return;
            }
        }

        // Teruskan kunci dan otoritas
        onSuccess(foundUser.licenseKey, foundUser.authority);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center animate-fadeIn">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.05)_0%,_transparent_70%)]"></div>
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-teal-900/10 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg px-6">
            <div className="quantum-card p-10 rounded-[3.5rem] border-teal-500/30 bg-slate-900/80 backdrop-blur-3xl shadow-[0_0_120px_rgba(45,212,191,0.15)] text-center relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>

                <div className="w-28 h-28 mx-auto mb-8 rounded-[2rem] border border-teal-500/30 flex items-center justify-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-all"></div>
                    <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-spin-slow opacity-20"></div>
                    <i className="fa-solid fa-fingerprint text-5xl text-teal-400 group-hover:scale-110 transition-transform"></i>
                </div>

                <h2 className="text-4xl font-orbitron font-bold text-white mb-2 tracking-tighter uppercase">Authenticator</h2>
                <p className="text-xs text-teal-500/60 font-black uppercase tracking-[0.5em] mb-10">Neural Node Access Point</p>

                <form onSubmit={handleValidate} className="space-y-6 relative">
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="PASTE QUANTUM KEY..."
                            className="w-full bg-slate-950/80 border border-teal-500/20 rounded-2xl py-6 px-6 text-center text-white font-mono text-base focus:border-teal-500 outline-none transition-all shadow-inner placeholder-slate-800"
                        />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-teal-500 transition-all duration-700 group-focus-within:w-full"></div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-shake">
                            <p className="text-[10px] font-black text-rose-500 uppercase flex items-center justify-center gap-3">
                                <i className="fa-solid fa-triangle-exclamation"></i> {error}
                            </p>
                        </div>
                    )}

                    <button 
                        disabled={validating || !inputKey}
                        className="w-full py-6 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-900 disabled:text-slate-700 text-black font-orbitron font-black text-sm rounded-2xl shadow-2xl shadow-teal-500/30 transition-all active:scale-95 relative overflow-hidden group/btn"
                    >
                        {validating ? (
                            <span className="flex items-center justify-center gap-4">
                                <i className="fa-solid fa-microchip animate-spin"></i> ANALYZING FREQUENCY...
                            </span>
                        ) : (
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-unlock-keyhole"></i> 
                                ESTABLISH NEURAL LINK
                            </span>
                        )}
                        <div className="absolute inset-0 shimmer opacity-10 group-hover/btn:opacity-20"></div>
                    </button>
                </form>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mb-4">Admin Authority Node</p>
                        <div className="flex gap-6">
                            <a href="https://wa.me/6281545627312" target="_blank" rel="noopener noreferrer" 
                               className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-2xl hover:shadow-emerald-500/20 group relative overflow-hidden">
                                <i className="fa-brands fa-whatsapp text-2xl relative z-10"></i>
                                <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </a>
                            <a href="https://t.me/6281545627312" target="_blank" rel="noopener noreferrer" 
                               className="w-16 h-16 rounded-[1.5rem] bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-2xl hover:shadow-sky-500/20 group relative overflow-hidden">
                                <i className="fa-brands fa-telegram text-2xl relative z-10"></i>
                                <div className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-4 opacity-30">
                    <div className="h-[1px] w-12 bg-slate-700"></div>
                    <p className="text-[8px] text-slate-500 uppercase tracking-[0.5em] font-black">AETERNA CORE v16.9</p>
                    <div className="h-[1px] w-12 bg-slate-700"></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LicensePortal;
