import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, Lock } from 'lucide-react';

export const Login = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden w-full">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#00f3ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#9d4edd]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#00f3ff]/30 shadow-2xl relative z-10 space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00f3ff] to-[#9d4edd] p-0.5 mx-auto shadow-lg shadow-[#00f3ff]/20">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#00f3ff]" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Hive Minds <span className="gradient-text">Admin</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Secure Authentication Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none transition-colors font-mono"
                placeholder="admin@hiveminds.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00f3ff] to-[#9d4edd] text-slate-950 hover:opacity-90 shadow-lg shadow-[#00f3ff]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 min-h-[48px]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
          Protected by JWT HTTP-Only Cookies & Express Security Middleware
        </div>
      </div>
    </div>
  );
};

export default Login;
