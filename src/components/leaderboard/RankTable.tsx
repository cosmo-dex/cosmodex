import { Flame, Swords } from "lucide-react";
import { TIER_STYLES, type Player } from "@/data/leaderboard";
import { cn } from "@/lib/utils";

export function RankTable({ players }: { players: Player[] }) {
  return (
    <div className="card-surface mx-auto w-full max-w-4xl rounded-card p-2 md:p-4">
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-3 py-3 text-[11px] uppercase tracking-[0.16em] text-text-muted md:grid-cols-[3rem_1fr_7rem_6rem_7rem]">
        <span>#</span>
        <span>Name / User ID</span>
        <span className="hidden md:block">Battles</span>
        <span className="hidden md:block">Streak</span>
        <span className="text-right">Rating (ELO)</span>
      </div>

      <ul className="flex flex-col gap-2">
        {players.map((p, i) => {
          const tier = TIER_STYLES[p.tier];
          return (
            <li
              key={p.id}
              className="group relative z-0 grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-btn border border-border-subtle bg-bg-surface px-3 py-3 transition-all duration-200 hover:z-10 hover:-translate-y-0.5 hover:border-border-accent hover:bg-white/[0.07] hover:shadow-[0_10px_30px_-5px_rgba(124,58,237,0.28)] md:grid-cols-[3rem_1fr_7rem_6rem_7rem]"
            >
              <span className="font-display text-sm font-semibold text-text-secondary transition-colors group-hover:text-text-accent">#{i + 4}</span>

              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt={`${p.name} avatar`}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-btn bg-bg-elevated transition-transform duration-200 group-hover:scale-110"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold transition-colors group-hover:text-white">{p.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-light text-text-muted">@{p.handle}</span>
                    <span
                      className={cn(
                        "rounded-pill border px-2 py-px text-[10px] uppercase tracking-wider transition-transform duration-200 group-hover:scale-105",
                        tier.className,
                      )}
                    >
                      {tier.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2 text-sm text-text-secondary md:flex">
                <Swords className="size-4 text-text-muted transition-colors group-hover:text-cyan-400" strokeWidth={1.6} />
                <span>
                  <span className="text-success">{p.wins}W</span> /{" "}
                  <span className="text-danger">{p.losses}L</span>
                </span>
              </div>

              <div className="hidden items-center gap-1.5 text-sm md:flex">
                <Flame className="size-4 text-streak animate-pulse" strokeWidth={1.6} />
                <span className="text-text-secondary">{p.streak}</span>
              </div>

              <span className="text-right text-xs md:text-sm font-bold text-xp-gold transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(245,200,66,0.6)] shrink-0">
                {p.mmr.toLocaleString()} ELO
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
