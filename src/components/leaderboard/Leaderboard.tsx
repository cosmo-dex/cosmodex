"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Code2, Globe, Trophy } from "lucide-react";
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

  // Only block whole page on initial load when no data exists yet
  if (loading && entries.length === 0) {
    return (
      <main className="starfield relative flex min-h-screen items-center justify-center overflow-hidden">
        <Starfield />
        <div className="relative text-text-secondary">Loading leaderboard...</div>
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

        {/* Timeframe selector (Daily / Weekly / Monthly) */}
        <div className="relative mt-4 flex rounded-pill border border-border-subtle bg-bg-surface p-1">
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
