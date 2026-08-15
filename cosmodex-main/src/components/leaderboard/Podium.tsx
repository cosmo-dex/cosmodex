"use client";

import React, { useEffect, useRef, useState } from "react";
import { Crown, Medal } from "lucide-react";
import { TIER_STYLES, type Player } from "@/data/leaderboard";
import { cn } from "@/lib/utils";

const CONFIG = {
  1: {
    order: "md:order-2",
    height: "h-44 md:h-56",
    ring: "ring-gradient-1",
    glow: "0 0 35px -8px rgba(245, 200, 66, 0.55)",
    label: "1st",
    avatarSize: "size-20 md:size-24",
  },
  2: {
    order: "md:order-1",
    height: "h-36 md:h-44",
    ring: "ring-gradient-2",
    glow: "0 0 28px -10px rgba(78, 205, 196, 0.45)",
    label: "2nd",
    avatarSize: "size-16 md:size-20",
  },
  3: {
    order: "md:order-3",
    height: "h-32 md:h-36",
    ring: "ring-gradient-3",
    glow: "0 0 28px -10px rgba(255, 107, 53, 0.45)",
    label: "3rd",
    avatarSize: "size-16 md:size-20",
  },
} as const;

const GLASS_STYLES = {
  1: {
    cardBg:
      "bg-gradient-to-b from-amber-500/15 via-purple-950/45 to-purple-950/85 backdrop-blur-2xl border border-amber-400/40 shadow-[0_12px_40px_-8px_rgba(245,200,66,0.25),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:border-amber-300/60 hover:shadow-[0_16px_50px_-6px_rgba(245,200,66,0.35),inset_0_1px_2px_0_rgba(255,255,255,0.5)]",
    labelGradient: "from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_16px_rgba(245,200,66,0.45)]",
    glowColor: "bg-amber-400/15",
    topLine: "from-transparent via-amber-300/70 to-transparent",
    badgeGlow: "shadow-[0_0_12px_rgba(245,200,66,0.25)] border-amber-400/40",
  },
  2: {
    cardBg:
      "bg-gradient-to-b from-cyan-400/15 via-purple-950/45 to-purple-950/85 backdrop-blur-2xl border border-cyan-300/40 shadow-[0_12px_40px_-8px_rgba(78,205,196,0.22),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:border-cyan-200/60 hover:shadow-[0_16px_50px_-6px_rgba(78,205,196,0.32),inset_0_1px_2px_0_rgba(255,255,255,0.5)]",
    labelGradient: "from-cyan-100 via-cyan-300 to-cyan-500 drop-shadow-[0_4px_16px_rgba(78,205,196,0.45)]",
    glowColor: "bg-cyan-400/15",
    topLine: "from-transparent via-cyan-300/70 to-transparent",
    badgeGlow: "shadow-[0_0_12px_rgba(78,205,196,0.25)] border-cyan-400/40",
  },
  3: {
    cardBg:
      "bg-gradient-to-b from-orange-500/15 via-purple-950/45 to-purple-950/85 backdrop-blur-2xl border border-orange-400/40 shadow-[0_12px_40px_-8px_rgba(255,107,53,0.22),inset_0_1px_1px_0_rgba(255,107,53,0.4)] hover:border-orange-300/60 hover:shadow-[0_16px_50px_-6px_rgba(255,107,53,0.32),inset_0_1px_2px_0_rgba(255,255,255,0.5)]",
    labelGradient: "from-orange-100 via-orange-300 to-orange-500 drop-shadow-[0_4px_16px_rgba(255,107,53,0.45)]",
    glowColor: "bg-orange-400/15",
    topLine: "from-transparent via-orange-300/70 to-transparent",
    badgeGlow: "shadow-[0_0_12px_rgba(255,107,53,0.25)] border-orange-400/40",
  },
} as const;

function EyeTrackingAvatar({ sizeClass, place }: { sizeClass: string; place: 1 | 2 | 3 }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);

      const maxRadius = place === 1 ? 5 : 4;
      const pupilX = Math.cos(angle) * maxRadius;
      const pupilY = Math.sin(angle) * maxRadius;

      setPupil({ x: pupilX, y: pupilY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [place]);

  if (place === 1) {
    return (
      <div ref={containerRef} className={cn("relative overflow-hidden rounded-[14px] bg-[#00a8ff] flex flex-col items-center justify-center border-2 border-amber-400/80 shadow-[0_0_20px_rgba(0,168,255,0.6)] select-none", sizeClass)}>
        <div className="flex items-center gap-2 mt-1.5 md:mt-2">
          {/* Left Eye */}
          <div className="relative size-5 md:size-6.5 rounded-full bg-white flex items-center justify-center shadow-inner">
            <div
              className="size-2.5 rounded-full bg-[#111] transition-transform duration-75 ease-out"
              style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)` }}
            />
          </div>
          {/* Right Eye */}
          <div className="relative size-5 md:size-6.5 rounded-full bg-white flex items-center justify-center shadow-inner">
            <div
              className="size-2.5 rounded-full bg-[#111] transition-transform duration-75 ease-out"
              style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)` }}
            />
          </div>
        </div>
        <div className="mt-1.5 flex flex-col items-center">
          <div className="w-5 h-2.5 bg-[#111] rounded-b-full overflow-hidden flex justify-center">
            <div className="w-1.5 h-1 bg-white rounded-b-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (place === 2) {
    return (
      <div ref={containerRef} className={cn("relative overflow-hidden rounded-[12px] bg-[#ffb703] flex flex-col items-center justify-center border-2 border-cyan-400/80 shadow-[0_0_18px_rgba(255,183,3,0.5)] select-none", sizeClass)}>
        <div className="w-10 h-4.5 rounded-md bg-[#111] flex items-center justify-around px-1 mt-1 shadow-inner overflow-hidden">
          <div
            className="w-2 h-2.5 rounded-sm bg-[#00f5d4] transition-transform duration-75 ease-out shadow-[0_0_8px_#00f5d4]"
            style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)` }}
          />
          <div
            className="w-2 h-2.5 rounded-sm bg-[#00f5d4] transition-transform duration-75 ease-out shadow-[0_0_8px_#00f5d4]"
            style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)` }}
          />
        </div>
        <div className="w-3.5 h-1.5 bg-[#111] rounded-b-md mt-1 flex justify-center overflow-hidden">
          <div className="w-1 h-1 bg-white rounded-b-xs" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden rounded-[12px] bg-[#ff9f1c] flex flex-col items-center justify-center border-2 border-orange-400/80 shadow-[0_0_18px_rgba(255,159,28,0.5)] select-none", sizeClass)}>
      <div
        className="flex items-center gap-2 mt-1 transition-transform duration-75 ease-out"
        style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)` }}
      >
        <span className="text-xs md:text-sm font-black text-[#111]">✕</span>
        <span className="text-xs md:text-sm font-black text-[#111]">✕</span>
      </div>
      <div className="w-3.5 h-1.5 bg-[#111] rounded-b-md mt-1 flex justify-center overflow-hidden">
        <div className="w-1 h-1 bg-white rounded-b-xs" />
      </div>
    </div>
  );
}

function PodiumCard({ player, place }: { player: Player; place: 1 | 2 | 3 }) {
  const c = CONFIG[place];
  const glass = GLASS_STYLES[place];
  const tier = TIER_STYLES[player.tier];

  return (
    <div className={cn("flex w-full flex-col items-center md:w-1/3", c.order)}>
      {place === 1 ? (
        <Crown className="mb-2 size-8 animate-float text-xp-gold drop-shadow-[0_0_14px_rgba(245,200,66,0.75)]" strokeWidth={1.6} />
      ) : (
        <Medal
          className={cn("mb-2 size-6", place === 2 ? "text-badge drop-shadow-[0_0_12px_rgba(78,205,196,0.65)]" : "text-streak drop-shadow-[0_0_12px_rgba(255,107,53,0.65)]")}
          strokeWidth={1.6}
        />
      )}

      <div className={cn("rounded-card p-[2px] transition-transform duration-300 hover:scale-105", c.ring)} style={{ boxShadow: c.glow }}>
        <EyeTrackingAvatar sizeClass={c.avatarSize} place={place} />
      </div>

      <p className="mt-3 text-center text-sm font-black tracking-wide md:text-base">{player.name}</p>
      <span className="mt-1 inline-flex items-center rounded-full border border-badge/30 bg-badge/10 px-3 py-0.5 text-xs font-bold text-badge backdrop-blur-md shadow-[0_0_10px_rgba(78,205,196,0.2)]">
        {player.xp.toLocaleString()} XP
      </span>

      {/* Enhanced Glassmorphism Card */}
      <div
        className={cn(
          "group relative mt-4 flex w-full flex-col items-center justify-between overflow-hidden rounded-2xl rounded-b-none px-4 py-5 transition-all duration-500 hover:-translate-y-1.5",
          glass.cardBg,
          c.height,
        )}
      >
        {/* Top edge glass specular reflection line */}
        <div className={cn("absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r", glass.topLine)} />

        {/* Diagonal sheen sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {/* Ambient center spotlight glow behind rank label */}
        <div className={cn("pointer-events-none absolute top-3 size-36 rounded-full blur-2xl", glass.glowColor)} />

        {/* 3D Glass Rank Typography */}
        <span className={cn("bg-gradient-to-b bg-clip-text text-transparent font-display text-5xl font-black tracking-tight select-none md:text-6xl", glass.labelGradient)}>
          {c.label}
        </span>

        {/* Card Footer Info */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span
            className={cn(
              "rounded-pill border px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md transition-transform duration-300 group-hover:scale-105",
              tier.className,
              glass.badgeGlow,
            )}
          >
            {tier.label}
          </span>
          <span className="text-xs font-semibold tracking-wide text-text-muted">
            {player.wins}W / {player.losses}L · <span className="text-text-secondary">{player.mmr} MMR</span>
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
      {/* DOM order is 1st → 2nd → 3rd so mobile (flex-col) reads top to bottom correctly;
          the md:order-* classes in CONFIG rearrange them into the podium on desktop. */}
      {first ? <PodiumCard player={first} place={1} /> : null}
      {second ? <PodiumCard player={second} place={2} /> : null}
      {third ? <PodiumCard player={third} place={3} /> : null}
    </div>
  );
}
