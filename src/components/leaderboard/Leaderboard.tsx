"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, Code2, Globe, Trophy } from "lucide-react";
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
  const tier = tiers[Math.min(Math.floor(index / 2), tiers.length - 1)];
  return {
    id: entry.userId,
    name: entry.username,
    handle: entry.userId.slice(0, 8),
    avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(entry.userId)}`,
    tier,
    xp: entry.elo,
    battles: entry.wins + entry.losses + entry.draws,
    wins: entry.wins,
    losses: entry.losses,
    mmr: entry.elo,
    streak: Math.max(entry.wins - entry.losses, 0),
  };
}

export default function Leaderboard() {
  const [scope, setScope] = useState<Scope>("global");
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const mode = scope === "global" ? "code" : scope;
        const res = await fetch(`/api/battle/leaderboard?mode=${mode}`);
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
  }, [scope, timeframe]);

  const players = useMemo(() => entries.map((e, i) => mapEntryToPlayer(e, i)), [entries]);
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  if (loading) {
    return (
      <main className="starfield relative flex min-h-screen items-center justify-center overflow-hidden">
        <Starfield />
        <div className="relative text-text-secondary">Loading leaderboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="starfield relative flex min-h-screen items-center justify-center overflow-hidden">
        <Starfield />
        <div className="relative text-danger">{error}</div>
      </main>
    );
  }

  return (
    <main className="starfield relative min-h-screen overflow-hidden px-4 pb-24 pt-16">
      <Starfield />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center">
        <span className="flex items-center gap-2 rounded-full border border-cosmo-border bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-badge">
          <Trophy className="size-3.5" strokeWidth={1.8} />
          Hall of Fame
        </span>

        <h1 className="mt-6 text-center font-display text-4xl tracking-[0.02em] md:text-6xl">
          Leader<span className="text-gradient-accent">board</span>
        </h1>
        <p className="mt-4 max-w-lg text-center text-sm font-light text-text-secondary md:text-base">
          The quadrant&apos;s elite coders, ranked by raw XP and mission completion.
        </p>

        <div className="mt-8 flex rounded-pill border border-border-subtle bg-bg-surface p-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "rounded-pill px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors",
                timeframe === t
                  ? "bg-accent/20 text-accent-bright shadow-[var(--shadow-accent)]"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {SCOPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setScope(id)}
              className={cn(
                "flex items-center gap-2 rounded-btn border px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] transition-all",
                scope === id
                  ? "border-border-accent bg-accent/15 text-text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-border-medium hover:text-text-secondary",
              )}
            >
              <Icon className="size-4" strokeWidth={1.7} />
              {label}
            </button>
          ))}
        </div>

        <section className="mt-16 w-full" aria-label="Top three">
          <Podium players={top3} />
        </section>

        <section className="mt-8 w-full" aria-label="Ranks four and below">
          <RankTable players={rest} />
        </section>
      </div>
    </main>
  );
}
