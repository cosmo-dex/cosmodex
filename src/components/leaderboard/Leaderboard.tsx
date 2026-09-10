"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Code2, Globe, Trophy, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import SmoothScroll from "@/components/landing/SmoothScroll";
import { Podium } from "./Podium";
import { RankTable } from "./RankTable";
import { Starfield } from "./Starfield";
import { type Player, type Scope, type Timeframe } from "@/data/leaderboard";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

const SCOPES: Array<{ id: Scope; label: string; icon: typeof Globe }> = [
  { id: "global", label: "Global", icon: Globe },
  { id: "code", label: "Code Battle", icon: Code2 },
  { id: "mcq", label: "MCQ Battle", icon: Brain },
];

const TIMEFRAMES: Timeframe[] = ["daily", "weekly", "monthly"];

function mapEntryToPlayer(entry: LeaderboardEntry, index: number): Player {
  const tiers: Player["tier"][] = ["diamond", "platinum", "gold", "silver", "bronze"];

  const realElo = entry.elo || 1000;
  const battles = entry.wins + entry.losses + entry.draws;
  const wins = entry.wins;
  const losses = entry.losses;
  const tier = tiers[Math.min(Math.floor(index / 2), tiers.length - 1)];

  return {
    id: entry.userId,
    name: entry.username,
    handle: entry.userId.slice(0, 8),
    avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(entry.userId)}`,
    tier,
    xp: realElo,
    battles,
    wins,
    losses,
    mmr: realElo,
    streak: Math.max(wins - losses, 0),
  };
}

export default function Leaderboard() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("global");
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/battle/leaderboard?mode=${scope}`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        if (!ignore) {
          if (Array.isArray(data)) {
            setEntries(data);
            setError(null);
          } else {
            setEntries([]);
            setError(data.error || "Unable to load leaderboard");
          }
        }
      } catch (err) {
        if (!ignore) {
          setEntries([]);
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => {
      ignore = true;
    };
  }, [scope]);

  const players = useMemo(() => {
    const raw = entries.map((e, i) => mapEntryToPlayer(e, i));
    return raw.sort((a, b) => b.mmr - a.mmr || b.wins - a.wins);
  }, [entries]);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  // Cosmic Glassmorphic Loading Screen
  if (loading && entries.length === 0) {
    return (
      <main className="starfield relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <Starfield />
        
        {/* Ambient Cosmic Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(232,115,195,0.2)_0%,transparent_70%)] pointer-events-none blur-3xl" />

        {/* Faint Background Podium Skeleton */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center max-w-4xl mx-auto px-4">
          <div className="w-full flex items-end justify-center gap-4 h-64">
            <div className="w-1/3 h-48 bg-white/5 rounded-t-2xl animate-pulse" />
            <div className="w-1/3 h-60 bg-white/10 rounded-t-2xl animate-pulse" />
            <div className="w-1/3 h-40 bg-white/5 rounded-t-2xl animate-pulse" />
          </div>
        </div>

        {/* Premium Glassmorphic Loading Card */}
        <div className="relative z-10 bg-[#0c061a]/85 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 max-w-md w-full flex flex-col items-center justify-center text-center shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(232,115,195,0.25)] animate-in fade-in zoom-in-95 duration-300">
          
          {/* Dual Orbit Spinner & Icon */}
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#E873C3] border-r-[#8D37D6] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#00f5d4] border-l-[#38bdf8] animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E873C3] to-[#8D37D6] flex items-center justify-center text-white shadow-[0_0_25px_rgba(232,115,195,0.6)] animate-pulse">
              <Trophy size={24} />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-purple-100 to-[#E873C3] bg-clip-text text-transparent tracking-wide">
            Calculating Galactic Ranks
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
            Fetching latest XP totals, 1v1 battle records, and cosmic league standings...
          </p>
        </div>
      </main>
    );
  }

  if (error && entries.length === 0) {
    return (
      <main className="starfield relative flex min-h-screen items-center justify-center overflow-hidden">
        <Starfield />
        <div className="relative text-danger">{error}</div>
      </main>
    );
  }

  const IS_LEADERBOARD_LIVE = false;

  if (!IS_LEADERBOARD_LIVE) {
    return (
      <main className="starfield relative min-h-screen overflow-hidden px-4 pb-16 pt-16 md:pt-20">
        <SmoothScroll />
        <Starfield />

        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/dashboard');
            }
          }}
          className="absolute left-4 sm:left-8 md:left-12 top-20 md:top-24 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md z-30 group"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </button>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center pt-8 md:pt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-2">
            <span className="flex items-center gap-2 rounded-full border border-cosmo-border bg-white/[0.04] px-3.5 py-1 text-[10px] uppercase tracking-[0.22em] text-badge">
              <Trophy className="size-3.5" strokeWidth={1.8} />
              Hall of Fame
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              LIVE SOON
            </span>
          </div>

          <h1 className="mt-3 font-display text-4xl tracking-[0.02em] md:text-6xl text-white">
            Leader<span className="text-gradient-accent">board</span>
          </h1>
          <p className="mt-2 max-w-lg text-xs font-light text-text-secondary md:text-sm">
            The quadrant&apos;s elite battle gladiators, ranked by competitive ELO rating and combat victories.
          </p>

          <div className="mt-10 w-full rounded-3xl border border-[#E873C3]/30 bg-gradient-to-b from-[#1a0b2e]/90 via-[#0e071d]/90 to-[#080312]/95 p-8 sm:p-14 shadow-[0_0_60px_rgba(232,115,195,0.18)] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#E873C3]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#E873C3]/25 via-purple-600/20 to-transparent border border-[#E873C3]/40 flex items-center justify-center shadow-[0_0_35px_rgba(232,115,195,0.35)] animate-float">
              <Trophy className="w-10 h-10 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Pre-Launch Standings
            </span>

            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-3 tracking-wide">
              Leaderboard Will Be Live Soon
            </h2>

            <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto leading-relaxed mb-8">
              Season 1 competitive rankings and league tiers are currently being calibrated for our official launch. Compete in 1v1 battle duels and level up now to secure your starting rank!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/battle')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#E873C3] to-[#8D37D6] font-bold text-white text-sm shadow-[0_0_25px_rgba(232,115,195,0.4)] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter Battle Arena</span>
              </button>
              <button
                onClick={() => router.push('/learn')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 font-bold text-white text-sm transition-all cursor-pointer"
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="starfield relative min-h-screen overflow-hidden px-4 pb-16 pt-16 md:pt-20">
      <SmoothScroll />
      <Starfield />

      {/* Back Button */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/dashboard');
          }
        }}
        className="absolute left-4 sm:left-8 md:left-12 top-20 md:top-24 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md z-30 group"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back</span>
      </button>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center">
        <span className="flex items-center gap-2 rounded-full border border-cosmo-border bg-white/[0.04] px-3.5 py-1 text-[10px] uppercase tracking-[0.22em] text-badge">
          <Trophy className="size-3.5" strokeWidth={1.8} />
          Hall of Fame
        </span>

        <h1 className="mt-3 text-center font-display text-3xl tracking-[0.02em] md:text-5xl">
          Leader<span className="text-gradient-accent">board</span>
        </h1>
        <p className="mt-1.5 max-w-lg text-center text-xs font-light text-text-secondary md:text-sm">
          The quadrant&apos;s elite battle gladiators, ranked by competitive ELO rating and combat victories.
        </p>

        <div className="relative mt-5 flex rounded-pill border border-border-subtle bg-bg-surface p-1">
          {TIMEFRAMES.map((t) => {
            const isActive = timeframe === t;
            return (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={cn(
                  "relative rounded-pill px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors",
                  isActive
                    ? "text-accent-bright font-medium"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-timeframe-pill"
                    className="absolute inset-0 rounded-pill bg-accent/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            );
          })}
        </div>

        {/* Scope selector (Global / Code Battle / MCQ Battle) */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
          {SCOPES.map(({ id, label, icon: Icon }) => {
            const isActive = scope === id;
            return (
              <button
                key={id}
                onClick={() => setScope(id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-btn border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all",
                  isActive
                    ? "border-border-accent text-text-accent"
                    : "border-border-subtle bg-bg-surface text-text-muted hover:border-border-medium hover:text-text-secondary",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-scope-pill"
                    className="absolute inset-0 rounded-btn bg-accent/15"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 size-3.5" strokeWidth={1.7} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Leaderboard Podium and Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${scope}-${timeframe}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-6 w-full md:mt-8"
              aria-label="Top three"
            >
              <Podium players={top3} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="mt-6 w-full"
              aria-label="Ranks four and below"
            >
              <RankTable players={rest} />
            </motion.section>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
