'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Swords, Eye, EyeOff, Loader2, Lock, Sparkles, KeyRound } from 'lucide-react';

const ADMIN_PANELS = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    subtitle: 'Full platform control',
    description: 'User management, RBAC role assignment, events, and admin account creation.',
    icon: Shield,
    gradient: 'from-[#E873C3] via-[#D95FD1] to-[#8D37D6]',
    glow: 'rgba(232,115,195,0.4)',
    border: 'border-pink-500/30 hover:border-pink-500/70',
    badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    href: '/super-admin',
  },
  {
    role: 'learning_admin',
    label: 'Learning Admin',
    subtitle: 'Curriculum management',
    description: 'Manage languages, modules, topics, exercises, and badges for the learning platform.',
    icon: BookOpen,
    gradient: 'from-[#4ECDC4] via-[#26B5A8] to-[#1A7A74]',
    glow: 'rgba(78,205,196,0.4)',
    border: 'border-cyan-500/30 hover:border-cyan-500/70',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    href: '/learning-admin',
  },
  {
    role: 'arena_admin',
    label: 'Battle Arena Admin',
    subtitle: 'Arena & match control',
    description: 'Manage battle problems, test cases, ELO ratings, and monitor active matches.',
    icon: Swords,
    gradient: 'from-[#FF6B35] via-[#F5A623] to-[#C0392B]',
    glow: 'rgba(255,107,53,0.4)',
    border: 'border-amber-500/30 hover:border-amber-500/70',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    href: '/arena-admin',
  },
];

export default function AdminGatewayPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      const { role } = data.user;

      if (role === 'super_admin') {
        router.push('/super-admin');
      } else if (role === 'learning_admin') {
        router.push('/learning-admin');
      } else if (role === 'arena_admin') {
        router.push('/arena-admin');
      } else {
        setError('Your account does not have admin access.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030d] text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* ── Background Nebula & Star Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[55rem] h-[35rem] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[10%] w-[40rem] h-[40rem] bg-pink-900/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute -bottom-[10%] left-[10%] w-[45rem] h-[35rem] bg-cyan-900/15 rounded-full blur-[150px] mix-blend-screen" />

        {/* Futuristic Cyber Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm39 39V1H1v38h38z' fill='rgba(255,255,255,1)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center gap-3 mb-10"
        >
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold tracking-widest uppercase mb-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Lock size={14} className="text-[#E873C3]" />
            <span>CosmoDex Control Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] uppercase">
            Admin Portal
          </h1>

          <p className="text-white/60 text-xs sm:text-sm font-mono max-w-md leading-relaxed">
            Secure access for authorized administrators only. Sign in to manage the platform.
          </p>
        </motion.div>

        {/* ── 2-Column Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Sign In Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="h-full bg-[#0c071d]/90 border border-purple-500/25 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8),_0_0_30px_rgba(232,115,195,0.12)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
                  <KeyRound size={18} className="text-[#E873C3]" />
                  <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    ADMIN SIGN IN
                  </h2>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rizicosmodex@gmail.com"
                      required
                      disabled={loading}
                      className="w-full bg-[#130d2a] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-[#E873C3] focus:shadow-[0_0_15px_rgba(232,115,195,0.3)] transition-all duration-300"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="w-full bg-[#130d2a] border border-white/10 rounded-xl px-4 py-3 pr-11 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-[#E873C3] focus:shadow-[0_0_15px_rgba(232,115,195,0.3)] transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification Banner */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 text-xs font-mono text-red-300 flex items-center gap-2"
                    >
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 w-full py-3.5 rounded-xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#E873C3] via-[#D95FD1] to-[#8D37D6] hover:brightness-110 shadow-md transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Sign In to Admin Panel</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <p className="mt-6 text-[11px] font-mono text-white/35 text-center leading-relaxed">
                Access is restricted to authorized administrators. Unauthorized attempts are logged.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Available Panels List */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col gap-4 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest">
                AVAILABLE PANELS
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 px-3 py-0.5 rounded-full border border-cyan-500/20">
                3 Active Modules
              </span>
            </div>

            {ADMIN_PANELS.map((panel, idx) => {
              const Icon = panel.icon;
              return (
                <motion.div
                  key={panel.role}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + idx * 0.08 }}
                  className={`group relative bg-[#0c071d]/80 border ${panel.border} rounded-2xl p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-[#120a2e] hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transform hover:-translate-y-1 cursor-default overflow-hidden`}
                >
                  <div className="relative flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${panel.glow} 0%, rgba(13,7,34,0.8) 100%)`,
                        border: `1px solid ${panel.glow}`,
                      }}
                    >
                      <Icon size={22} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="font-mono font-bold text-white text-base tracking-wide">
                          {panel.label}
                        </h3>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${panel.badgeColor}`}>
                          {panel.role}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-white/60 leading-relaxed">
                        {panel.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
