export type Tier = "bronze" | "silver" | "gold" | "platinum" | "diamond";
export type Scope = "global" | "mcq" | "code";
export type Timeframe = "daily" | "weekly" | "monthly";

export type Player = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tier: Tier;
  xp: number;
  battles: number;
  wins: number;
  losses: number;
  mmr: number;
  streak: number;
};

export const TIER_STYLES: Record<Tier, { label: string; className: string }> = {
  bronze: { label: "Bronze", className: "text-streak border-streak/40 bg-streak/10" },
  silver: { label: "Silver", className: "text-text-secondary border-border-medium bg-white/5" },
  gold: { label: "Gold", className: "text-xp-gold border-xp-gold/40 bg-xp-gold/10" },
  platinum: { label: "Platinum", className: "text-badge border-badge/40 bg-badge/10" },
  diamond: {
    label: "Diamond",
    className: "text-text-accent border-border-accent bg-accent/10",
  },
};
