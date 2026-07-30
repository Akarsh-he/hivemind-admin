import React from 'react';
import { ShieldCheck, LogOut, ExternalLink, Activity } from 'lucide-react';

export const Navbar = ({ admin, onLogout }) => {
  return (
    <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f3ff] to-[#9d4edd] p-0.5 flex items-center justify-center shadow-lg shadow-[#00f3ff]/20">
          <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#00f3ff]" />
          </div>
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
            Hive Minds <span className="text-xs px-2 py-0.5 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 font-mono">ADMIN PORTAL</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <a
          href={import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00f3ff] transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-[#00f3ff]/30"
        >
          <span>Live Portfolio</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#9d4edd]/50 flex items-center justify-center text-xs font-bold text-[#9d4edd]">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-white leading-tight">{admin?.name || 'Administrator'}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold bg-[#9d4edd]/20 text-[#9d4edd] border border-[#9d4edd]/40">
                {admin?.role || 'developer'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">{admin?.email || 'admin@hiveminds.com'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-2 text-xs font-semibold"
          title="Logout Admin Session"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
