
import React, { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { LicenseUser } from '../types';

interface DatabaseUserProps {
  database: LicenseUser[];
  onUpdateDatabase: (newDb: LicenseUser[]) => void;
}

const SECRET_SALT = "AETERNA_QUANTUM_SALT_2026_V5";

const DatabaseUser: React.FC<DatabaseUserProps> = ({ database, onUpdateDatabase }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState<LicenseUser[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastUpdateRef = useRef<string>('');

  useEffect(() => {
    const dbString = JSON.stringify(database);
    if (dbString !== lastUpdateRef.current) {
      const cleanDb = [...database];
      const emptyRow: LicenseUser = {
        id: Date.now().toString(),
        name: '',
        keylis: '',
        licenseKey: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: '30',
        expiryDate: '',
        isActive: false,
        authority: 'USER'
      };
      setRows([...cleanDb, emptyRow]);
      lastUpdateRef.current = dbString;
    }
  }, [database]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dasopano21') {
      setIsAuthenticated(true);
    } else {
      alert('AKSES DITOLAK: Sandi Database Salah.');
    }
  };

  const syncToCloud = async (newDb: LicenseUser[]) => {
    setIsSyncing(true);
    // Simulasi Pushing ke API / Cloud DB
    console.log("[Neural Sync] Pushing update to global database node...");
    await new Promise(r => setTimeout(r, 1200));
    
    // Simpan ke local storage (yang merepresentasikan node ini)
    localStorage.setItem('AETERNA_GLOBAL_SYNC_DB', JSON.stringify(newDb));
    onUpdateDatabase(newDb);
    setIsSyncing(false);
  };

  const calculateExpiry = (start: string, duration: string) => {
    if (duration === 'UNLIMITED') return 'UNLIMITED';
    const date = new Date(start);
    date.setDate(date.getDate() + parseInt(duration));
    return date.toISOString().split('T')[0];
  };

  const encryptLicense = (keylis: string) => {
    if (!keylis) return '';
    if (keylis === 'dasopano21') return 'dasopano21';
    return CryptoJS.AES.encrypt(keylis, SECRET_SALT).toString();
  };

  const handleRowChange = (index: number, field: keyof LicenseUser, value: any) => {
    const newRows = [...rows];
    const currentRow = { ...newRows[index], [field]: value };
    
    if (field === 'keylis') {
        currentRow.licenseKey = encryptLicense(value);
        currentRow.isActive = true;
    }
    
    if (field === 'startDate' || field === 'duration') {
        currentRow.expiryDate = calculateExpiry(currentRow.startDate, currentRow.duration);
    } else if (currentRow.expiryDate === '') {
        currentRow.expiryDate = calculateExpiry(currentRow.startDate, currentRow.duration);
    }

    newRows[index] = currentRow;

    if (index === newRows.length - 1 && value !== '') {
        const emptyRow: LicenseUser = {
            id: (Date.now() + index).toString(),
            name: '',
            keylis: '',
            licenseKey: '',
            startDate: new Date().toISOString().split('T')[0],
            duration: '30',
            expiryDate: '',
            isActive: false,
            authority: 'USER'
        };
        newRows.push(emptyRow);
    }

    setRows(newRows);
    
    const validRows = newRows.filter(r => r.name.trim() !== '' && r.keylis.trim() !== '');
    lastUpdateRef.current = JSON.stringify(validRows);
    syncToCloud(validRows);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("License Key Copied!");
  };

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center animate-fadeIn">
         <div className="quantum-card p-12 rounded-[3rem] border-amber-500/30 bg-slate-900/90 backdrop-blur-xl max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
               <i className="fa-solid fa-database animate-pulse"></i>
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-white uppercase tracking-tighter">Database User Access</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ENTER MASTER KEY" className="w-full bg-slate-950 border border-amber-500/20 rounded-xl py-4 px-6 text-center text-amber-400 font-mono focus:border-amber-500 outline-none" />
              <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase rounded-xl shadow-lg transition-all">UNLOCK DATABASE</button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-32">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-3xl font-orbitron font-bold gradient-text uppercase tracking-tighter">Neural License Matrix</h2>
             <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">Global Encrypted Registry</p>
          </div>
          <div className="flex gap-4">
              <div className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${isSyncing ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                 <i className={`fa-solid ${isSyncing ? 'fa-sync animate-spin' : 'fa-cloud-check'}`}></i> 
                 {isSyncing ? 'Syncing Global Node...' : 'Neural Sync Active'}
              </div>
              <div className="px-4 py-2 bg-rose-600/10 border border-rose-600/30 rounded-xl text-rose-500 text-xs font-black uppercase">
                 MASTER-ADMIN
              </div>
          </div>
       </header>

       <div className="quantum-card p-4 rounded-[2.5rem] border-white/10 glass overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-950/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="p-4 w-12 rounded-l-xl">#</th>
                      <th className="p-4 w-40">Client Name</th>
                      <th className="p-4 w-40">Authority</th>
                      <th className="p-4 w-40">Keylis</th>
                      <th className="p-4">Quantum License Key</th>
                      <th className="p-4 w-32">Term</th>
                      <th className="p-4 w-32 rounded-r-xl text-right">Expiry</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                   {rows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="p-4 text-slate-600">{index + 1}</td>
                         <td className="p-4">
                            <input 
                              type="text" 
                              value={row.name} 
                              onChange={(e) => handleRowChange(index, 'name', e.target.value)} 
                              placeholder="Name"
                              className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 text-white placeholder-slate-800 transition-all"
                            />
                         </td>
                         <td className="p-4">
                            <select 
                               value={row.authority} 
                               onChange={(e) => handleRowChange(index, 'authority', e.target.value as any)}
                               className={`w-full bg-slate-950/80 border border-white/10 rounded-lg px-2 py-2 outline-none focus:border-emerald-500 font-black text-[9px] uppercase ${row.authority === 'ADMIN' ? 'text-rose-500' : 'text-emerald-400'}`}
                            >
                               <option value="USER">USER NODE</option>
                               <option value="ADMIN">ADMIN CORE</option>
                            </select>
                         </td>
                         <td className="p-4">
                            <input 
                              type="text" 
                              value={row.keylis} 
                              onChange={(e) => handleRowChange(index, 'keylis', e.target.value)} 
                              placeholder="Keylis"
                              className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 outline-none focus:border-purple-500 text-amber-400 placeholder-slate-800 transition-all"
                            />
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               <input 
                                 type="text" 
                                 readOnly 
                                 value={row.licenseKey} 
                                 className="w-full bg-slate-950/30 rounded-lg px-3 py-2 text-slate-500 truncate border border-white/5 text-[9px]"
                               />
                               {row.licenseKey && (
                                 <button onClick={() => copyToClipboard(row.licenseKey)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black transition-all shrink-0">
                                    <i className="fa-regular fa-copy"></i>
                                 </button>
                               )}
                            </div>
                         </td>
                         <td className="p-4">
                            <select 
                               value={row.duration} 
                               onChange={(e) => handleRowChange(index, 'duration', e.target.value as any)}
                               className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none focus:border-teal-500"
                            >
                               <option value="1">1D</option>
                               <option value="7">7D</option>
                               <option value="30">30D</option>
                               <option value="UNLIMITED">∞ LFM</option>
                            </select>
                         </td>
                         <td className={`p-4 font-black text-right ${row.expiryDate === 'UNLIMITED' ? 'text-teal-400' : 'text-rose-500'}`}>
                            {row.expiryDate}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default DatabaseUser;
