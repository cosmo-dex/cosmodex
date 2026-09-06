"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Shield, Award, Zap, Edit2, Camera, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarUrl, getAvatarCls, AVATARS, type AvatarOption } from "@/lib/avatar";

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
  const router = useRouter();
  const [userOverride, setUserOverride] = useState<{ username: string; avatarId: string | null } | null>(null);

  const displayUsername = userOverride?.username ?? username;
  const displayAvatarId = userOverride?.avatarId ?? avatarId;

  // Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(displayUsername);
  const [editAvatar, setEditAvatar] = useState(displayAvatarId || '/images/avatars/nebula.webp');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenEdit = () => {
    setEditUsername(displayUsername);
    setEditAvatar(displayAvatarId || '/images/avatars/nebula.webp');
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editUsername.trim()) {
      setSaveError("Username cannot be empty.");
      return;
    }

    setSaveError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: editUsername.trim(),
            avatarUrl: editAvatar,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setSaveError(data.error ?? 'Failed to save profile.');
          return;
        }

        setUserOverride({
          username: editUsername.trim(),
          avatarId: editAvatar,
        });
        setIsEditing(false);
        router.refresh();
      } catch {
        setSaveError('Network error. Please try again.');
      }
    });
  };

  const xpNeeded = level * 1000;
  const xpPct = Math.min((xpTotal / xpNeeded) * 100, 100);
  const avatarCls = getAvatarCls(displayAvatarId);
  const avatarUrl = getAvatarUrl(displayAvatarId);

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
    <>
      <div className="cosmo-glass-panel p-6 border border-white/10 relative">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 group/avatar">
            <button
              type="button"
              onClick={handleOpenEdit}
              title="Click to change avatar"
              className={`w-16 h-16 rounded-full border-2 border-[#E873C3] overflow-hidden ${avatarCls} flex items-center justify-center shadow-[0_0_20px_rgba(232,115,195,0.3)] relative cursor-pointer transition-transform duration-300 hover:scale-105`}
            >
              <Image
                src={avatarUrl}
                alt="User avatar"
                width={64}
                height={64}
                sizes="64px"
                priority
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity duration-200 text-white backdrop-blur-[2px]">
                <Camera size={16} className="text-white drop-shadow" />
                <span className="text-[8px] font-mono font-bold tracking-wider uppercase text-white/90">Edit</span>
              </div>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-white truncate text-xl">
                {displayUsername}
              </p>
              <button
                type="button"
                onClick={handleOpenEdit}
                title="Edit profile"
                className="text-white/40 hover:text-[#E873C3] transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0"
              >
                <Edit2 size={16} />
              </button>
            </div>
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

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={handleOpenEdit}
            id="profile-edit-btn"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E873C3]/40 transition-all cursor-pointer"
          >
            <Edit2 size={15} />
            <span>Edit Profile</span>
          </button>
          <Link
            href="/profile"
            id="profile-view"
            className="cosmo-btn-secondary py-3 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              data-lenis-prevent
              className="cosmo-glass-panel border border-white/20 p-6 rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-[#080d19]"
            >
              <div className="relative flex flex-col h-full max-h-[80vh] min-h-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors p-1.5 z-20 bg-black/30 rounded-full cursor-pointer border border-white/10"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-display font-bold text-white mb-5 shrink-0">Edit Profile</h2>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5">
                  {/* Choose Avatar */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Choose Hologram Avatar
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATARS.map((av: AvatarOption) => {
                        const isSelected =
                          editAvatar === av.id ||
                          editAvatar === av.image ||
                          getAvatarUrl(editAvatar) === av.image;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setEditAvatar(av.image)}
                            className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                ? 'border-[#E873C3] bg-[#E873C3]/15 shadow-[0_0_15px_rgba(232,115,195,0.4)] scale-105'
                                : 'border-white/10 bg-white/5 hover:border-white/30 hover:scale-102'
                              }`}
                          >
                            <div className={`w-12 h-12 rounded-lg overflow-hidden ${av.cls} p-0.5 mb-1.5`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={av.image}
                                alt={av.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold truncate max-w-full ${isSelected ? 'text-[#E873C3]' : 'text-white/60'
                                }`}
                            >
                              {av.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm font-mono"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="text-red-400 text-sm mt-3 font-medium">{saveError}</p>
                )}

                <div className="mt-5 pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isPending}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#E873C3] to-[#8D37D6] rounded-xl font-bold text-white shadow-[0_0_20px_rgba(141,55,214,0.4)] hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {isPending && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
