"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Shield, Award, Zap } from "lucide-react";
import { getAvatarUrl, getAvatarCls } from "@/lib/avatar";

interface ProfileCardProps {
  username?: string;
  level?: number;
  xpTotal?: number;
  avatarId?: string | null;
  experienceLevel?: string | null;
  streak?: number;
  badgeCount?: number;
  codeElo?: number;
}

function getRankLabel(experienceLevel: string | null | undefined): string {
  if (experienceLevel === 'Advanced') return 'Commander';
  if (experienceLevel === 'Intermediate') return 'Explorer';
  return 'Initiate';
}

export default function ProfileCard({
  username = 'Explorer',
  level = 1,
  xpTotal = 0,
  avatarId = null,
  experienceLevel = 'Beginner',
  streak = 0,
  badgeCount = 0,
  codeElo = 1000,
}: ProfileCardProps) {
  const xpNeeded = level * 1000;
  const xpPct = Math.min((xpTotal / xpNeeded) * 100, 100);
  const avatarCls = getAvatarCls(avatarId);
  const avatarUrl = getAvatarUrl(avatarId);

  const stats = [
    {
      icon: Zap,
      label: "TOTAL XP",
      value: xpTotal.toLocaleString(),
      color: "text-[#FFD700]",
      glowColor: "rgba(255,215,0,0.6)",
    },
    {
      icon: Flame,
      label: "DAY STREAK",
      value: streak.toString(),
      color: "text-orange-500",
      glowColor: "rgba(249,115,22,0.6)",
    },
    {
      icon: Shield,
      label: "RANK",
      value: getRankLabel(experienceLevel),
      color: "text-[#CD7F32]",
      glowColor: "rgba(205,127,50,0.6)",
    },
    {
      icon: Award,
      label: "BADGES",
      value: badgeCount.toString(),
      color: "text-cyan-400",
      glowColor: "rgba(34,211,238,0.6)",
    },
  ];

  return (
    <div className="cosmo-glass-panel p-6 border border-white/10">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className={`w-16 h-16 rounded-full border-2 border-[#E873C3] overflow-hidden ${avatarCls} flex items-center justify-center shadow-[0_0_20px_rgba(232,115,195,0.3)]`}>
            <Image
              src={avatarUrl}
              alt="User avatar"
              width={64}
              height={64}
              sizes="64px"
              priority
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-white truncate text-xl">
            {username}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center text-[#E873C3] font-bold text-xs px-3 py-1 rounded-full bg-[#E873C3]/10 border border-[#E873C3]/20">
              Level {level}
            </span>
            <span className="inline-flex items-center text-purple-300 font-bold text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25">
              ⚔️ {codeElo.toLocaleString()} ELO
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6 pt-5 border-t border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Current Progress</p>
            <p className="text-sm font-medium text-white/80 flex items-center gap-1">
              <span className="text-white font-bold">{xpTotal.toLocaleString()}</span> / {xpNeeded.toLocaleString()}
              <Zap size={14} className="text-yellow-400 shrink-0" />
            </p>
          </div>
          <p className="text-sm font-medium text-white/60 mb-0.5">to Level {level + 1}</p>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFD700] via-[#F59E0B] to-[#E873C3] shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all duration-1000"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5"
          >
            <div className={`${s.color} mt-0.5`} style={{ filter: `drop-shadow(0 0 8px ${s.glowColor})` }}>
              <s.icon size={18} fill="currentColor" />
            </div>
            <div>
              <p className="font-bold text-white text-xl leading-none">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/50 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/profile"
        id="profile-view"
        className="cosmo-btn-secondary w-full py-3.5 rounded-xl text-sm font-bold text-white text-center mt-6"
      >
        View Profile
      </Link>
    </div>
  );
}
