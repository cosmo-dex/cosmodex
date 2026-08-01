import { Crown, Medal } from "lucide-react";
import { TIER_STYLES, type Player } from "@/data/leaderboard";
import { cn } from "@/lib/utils";

const CONFIG = {
  1: {
    order: "md:order-2",
    height: "h-56 md:h-72",
    ring: "ring-gradient-1",
    glow: "0 0 40px -8px rgba(245, 200, 66, 0.55)",
    label: "1st",
    avatarSize: "size-24 md:size-28",
  },
  2: {
    order: "md:order-1",
    height: "h-44 md:h-56",
    ring: "ring-gradient-2",
    glow: "0 0 34px -10px rgba(78, 205, 196, 0.5)",
    label: "2nd",
    avatarSize: "size-20 md:size-24",
  },
  3: {
    order: "md:order-3",
    height: "h-36 md:h-44",
    ring: "ring-gradient-3",
    glow: "0 0 34px -10px rgba(255, 107, 53, 0.5)",
    label: "3rd",
    avatarSize: "size-20 md:size-24",
  },
} as const;

function PodiumCard({ player, place }: { player: Player; place: 1 | 2 | 3 }) {
  const c = CONFIG[place];
  const tier = TIER_STYLES[player.tier];

  return (
    <div className={cn("flex w-full flex-col items-center md:w-1/3", c.order)}>
      {place === 1 ? (
        <Crown className="mb-2 size-8 animate-float text-xp-gold" strokeWidth={1.6} />
      ) : (
        <Medal
          className={cn("mb-2 size-6", place === 2 ? "text-badge" : "text-streak")}
          strokeWidth={1.6}
        />
      )}

      <div className={cn("rounded-card p-[2px]", c.ring)} style={{ boxShadow: c.glow }}>
        <img
          src={player.avatar}
          alt={`${player.name} avatar`}
          loading="lazy"
          className={cn("rounded-[10px] bg-bg-elevated object-cover", c.avatarSize)}
        />
      </div>

      <p className="mt-3 text-center text-sm font-bold md:text-base">{player.name}</p>
      <p className="text-sm font-bold text-badge">{player.xp.toLocaleString()} XP</p>

      <div
        className={cn(
          "card-surface mt-4 flex w-full flex-col items-center justify-between rounded-card rounded-b-none px-4 py-5",
          c.height,
        )}
      >
        <span className="font-display text-4xl text-white/12 md:text-5xl">{c.label}</span>
        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              "rounded-pill border px-3 py-1 text-[10px] uppercase tracking-[0.16em]",
              tier.className,
            )}
          >
            {tier.label}
          </span>
          <span className="text-xs font-light text-text-muted">
            {player.wins}W / {player.losses}L · {player.mmr} MMR
          </span>
        </div>
      </div>
    </div>
  );
}

export function Podium({ players }: { players: Player[] }) {
  const [first, second, third] = players;
  if (!first) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-end gap-6 md:flex-row md:gap-4">
      {second ? <PodiumCard player={second} place={2} /> : null}
      <PodiumCard player={first} place={1} />
      {third ? <PodiumCard player={third} place={3} /> : null}
    </div>
  );
}
