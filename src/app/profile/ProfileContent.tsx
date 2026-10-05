"use client";

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Edit,
  Camera,
  Shield,
  Award,
  Flame,
  Zap,
  Plus,
  X,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Loader2,
  Swords,
  Trophy,
  Code2,
  Brain,
} from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import Footer from '@/components/dashboard/Footer';
import { getAvatarUrl, getAvatarCls, AVATARS, type AvatarOption } from '@/lib/avatar';

const ONBOARDING_SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'UI/UX Design',
  'Web Development',
  'AI/ML',
  'Cybersecurity',
  'Game Development',
  'Open Source',
];

interface Badge {
  id: string;
  name: string;
  description: string | null;
  earnedAt: string | null;
}

interface ProfileContentProps {
  userId: string | null;
  username: string;
  email: string;
  createdAt: string | null;
  interests: string[];
  xpTotal: number;
  level: number;
  experienceLevel?: string | null;
  streak: number;
  badgeCount: number;
  badges?: Badge[];
  bio?: string;
  avatarUrl?: string;
  arenaWins?: number;
  arenaLosses?: number;
  arenaDraws?: number;
  codeElo?: number;
  mcqElo?: number;
}

function getRankLabel(experienceLevel: string | null | undefined): string {
  if (experienceLevel === 'Advanced') return 'Commander';
  if (experienceLevel === 'Intermediate') return 'Explorer';
  return 'Initiate';
}

function formatJoinDate(iso: string | null): string {
  if (!iso) return 'Recently joined';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ProfileContent({
  username: initialUsername,
  createdAt,
  interests: initialInterests,
  xpTotal = 0,
  level = 1,
  experienceLevel = 'Beginner',
  streak = 0,
  badgeCount = 0,
  bio: initialBio = '',
  avatarUrl: initialAvatarUrl = '/images/avatars/nebula.webp',
  badges = [],
  arenaWins = 0,
  arenaLosses = 0,
  arenaDraws = 0,
  codeElo = 1000,
  mcqElo = 1000,
}: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const [profile, setProfile] = useState(() => {
    let savedBio = '';
    let savedSocials: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      try {
        const storedBio = localStorage.getItem('cosmodex_user_bio');
        if (storedBio) savedBio = storedBio;
        const stored = localStorage.getItem('cosmodex_user_socials');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            savedSocials = parsed;
          }
        }
      } catch {
        // ignore storage access errors
      }
    }
    return {
      name: initialUsername,
      username: initialUsername,
      bio: savedBio || initialBio || '',
      avatarUrl: initialAvatarUrl,
      skills: initialInterests,
      socials: {
        github: '',
        twitter: '',
        linkedin: '',
        discord: '',
        portfolio: '',
        ...savedSocials,
      },
    };
  });

  const [editData, setEditData] = useState(profile);
  const [tempSkills, setTempSkills] = useState<string[]>(initialInterests);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [socialInputValue, setSocialInputValue] = useState('');

  const startEditingSocial = (network: string, currentUrl: string) => {
    setEditingSocial(network);
    setSocialInputValue(currentUrl);
  };

  const saveSocialUrl = (network: string) => {
    const updatedSocials = {
      ...profile.socials,
      [network]: socialInputValue.trim(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('cosmodex_user_socials', JSON.stringify(updatedSocials));
    }
    setProfile((prev) => ({
      ...prev,
      socials: updatedSocials,
    }));
    setEditData((prev) => ({
      ...prev,
      socials: updatedSocials,
    }));
    setEditingSocial(null);
  };

  const cancelEditingSocial = () => {
    setEditingSocial(null);
    setSocialInputValue('');
  };

  // Pure derived synchronous validation
  const trimmed = (editData.username || '').trim();
  const formatError = !trimmed
    ? 'Username cannot be empty.'
    : trimmed.length < 3 || trimmed.length > 30
    ? 'Username must be 3–30 characters.'
    : !/^[a-zA-Z0-9_]+$/.test(trimmed)
    ? 'Only letters, numbers, and underscores.'
    : null;
  const isSelf = trimmed.toLowerCase() === (profile.username || '').toLowerCase();

  const [asyncAvailability, setAsyncAvailability] = useState<{
    checking: boolean;
    taken: boolean | null;
    error: string | null;
  }>({ checking: false, taken: null, error: null });

  // OPTIMIZATION: Increase debounce time for username availability check to reduce API calls
  useEffect(() => {
    if (!isEditing || formatError || isSelf) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAsyncAvailability({ checking: true, taken: null, error: null });
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.available) {
          setAsyncAvailability({ checking: false, taken: false, error: null });
        } else {
          setAsyncAvailability({
            checking: false,
            taken: true,
            error: data.reason || 'This name is already taken.',
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setAsyncAvailability({ checking: false, taken: null, error: null });
        }
      }
    }, 1000); // OPTIMIZATION: Increased from 400ms to 1000ms to reduce API calls

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, isEditing, formatError, isSelf]);

  const isNameTaken = !isSelf && asyncAvailability.taken === true;
  const isChecking = !formatError && !isSelf && asyncAvailability.checking;
  const isAvailable = !formatError && !isSelf && asyncAvailability.taken === false;
  const usernameError = formatError || (isNameTaken ? asyncAvailability.error || 'This name is already taken.' : null);

  // OPTIMIZATION: Batch profile updates to reduce API calls
  const handleSaveProfile = () => {
    if (formatError) {
      setSaveError(formatError);
      return;
    }

    if (isNameTaken) {
      setSaveError(asyncAvailability.error || "This name is already taken.");
      return;
    }

    setSaveError(null);
    startTransition(async () => {
      try {
        // OPTIMIZATION: Only send data that has actually changed
        const updates: Record<string, string | string[]> = {};
        
        if (trimmed !== profile.username) {
          updates.username = trimmed;
        }
        
        if (JSON.stringify(editData.skills) !== JSON.stringify(profile.skills)) {
          updates.interests = editData.skills;
        }
        
        if (editData.avatarUrl !== profile.avatarUrl) {
          updates.avatarUrl = editData.avatarUrl;
        }

        // Only make API call if there are actual changes
        if (Object.keys(updates).length === 0) {
          // OPTIMIZATION: No changes detected, just update local state and exit
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('cosmodex_user_bio', editData.bio);
            } catch {
              // ignore
            }
          }
          setProfile({
            ...editData,
            username: trimmed,
            name: editData.name?.trim() || trimmed,
          });
          setIsEditing(false);
          return;
        }

        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await res.json();

        if (!res.ok) {
          setSaveError(data.error ?? 'Failed to save profile.');
          return;
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cosmodex_user_bio', editData.bio);
          } catch {
            // ignore
          }
        }

        setProfile({
          ...editData,
          username: trimmed,
          name: editData.name?.trim() || trimmed,
        });
        setIsEditing(false);
      } catch {
        setSaveError('Network error. Please try again.');
      }
    });
  };

  const openEditSkillsModal = () => {
    setTempSkills([...profile.skills]);
    setCustomSkillInput('');
    setIsAddingSkill(true);
  };

  const toggleTempSkill = (skill: string) => {
    if (tempSkills.includes(skill)) {
      setTempSkills(tempSkills.filter((s) => s !== skill));
    } else {
      setTempSkills([...tempSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !tempSkills.includes(trimmed)) {
      setTempSkills([...tempSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  // OPTIMIZATION: Batch skills update to reduce API calls
  const handleSaveSkills = () => {
    // OPTIMIZATION: Only update if skills actually changed
    if (JSON.stringify(tempSkills) === JSON.stringify(profile.skills)) {
      setIsAddingSkill(false);
      return;
    }

    setIsSavingSkills(true);
    startTransition(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interests: tempSkills,
          }),
        });

        if (res.ok) {
          setProfile((prev) => ({ ...prev, skills: tempSkills }));
          setIsAddingSkill(false);
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to update skills.');
        }
      } catch (err) {
        console.error('Failed to save skills:', err);
        alert('Network error. Failed to update skills.');
      } finally {
        setIsSavingSkills(false);
      }
    });
  };

  const rankLabel = getRankLabel(experienceLevel);
  const xpNeeded = level * 1000;
  const xpPct = Math.min(100, Math.max(5, (xpTotal / xpNeeded) * 100));
  const totalBattles = arenaWins + arenaLosses + arenaDraws;
  const winRate = totalBattles > 0 ? Math.round((arenaWins / totalBattles) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-[#080312] text-white">
      {/* Top Main Site Navbar */}
      <Navbar />

      {/* Dashboard Background */}
      <DashboardBackground />

      {/* Main Content Area */}
      <div className="relative z-10 w-full">
        {/* Spacer for fixed top Navbar */}
        <div className="w-full h-16"></div>

        <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-8">
          <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 pb-12">
            {/* Left Column (Main Profile) */}
            <div className="flex-1 flex flex-col cosmo-glass-panel border border-white/10 rounded-[32px] pb-10 overflow-hidden relative">
              {/* Banner & Avatar Wrapper */}
              <div className="relative">
                {/* Banner Image */}
                <div className="w-full h-56 sm:h-64 rounded-t-[32px] overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-[#2A0845] via-[#1a0b2e] to-[#0a0518] opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0518]/90 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,115,195,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(141,55,214,0.1),transparent_60%)]" />
                </div>

                {/* Action Bar */}
                <div className="absolute -bottom-16 left-0 right-0 px-6 sm:px-8 flex justify-end">
                  <button
                    onClick={() => {
                      setEditData(profile);
                      setSaveError(null);
                      setIsEditing(true);
                    }}
                    className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold flex items-center gap-2 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/15 hover:text-white transition-all text-white shadow-lg mt-auto mb-20 z-20 cursor-pointer"
                  >
                    <Edit size={16} /> <span className="hidden sm:inline">Edit profile</span>
                  </button>
                </div>

                {/* Profile Custom User Image Avatar */}
                <div className="absolute -bottom-16 left-6 sm:left-10 z-20 group/avatar">
                  <div
                    onClick={() => {
                      setEditData(profile);
                      setSaveError(null);
                      setIsEditing(true);
                    }}
                    title="Change profile picture"
                    className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#E873C3] shadow-[0_0_30px_rgba(232,115,195,0.4)] overflow-hidden ${getAvatarCls(profile.avatarUrl)} relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAvatarUrl(profile.avatarUrl)}
                      alt={profile.name}
                      loading="eager"
                      fetchPriority="high"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/nebula.webp';
                      }}
                    />

                    {/* Dark Hover Overlay with Camera Icon */}
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-250 text-white backdrop-blur-[2px]">
                      <Camera size={24} className="text-white drop-shadow-md" />
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white/90">Change</span>
                    </div>

                    <div className="absolute inset-0 ring-inset ring-2 ring-white/20 rounded-full pointer-events-none" />
                  </div>

                  {/* Floating Camera Button Badge */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditData(profile);
                      setSaveError(null);
                      setIsEditing(true);
                    }}
                    title="Upload / Change Avatar"
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-30 p-2.5 rounded-full bg-[#E873C3] hover:bg-[#d95fc0] text-black transition-all shadow-[0_0_15px_rgba(232,115,195,0.8)] cursor-pointer hover:scale-110 active:scale-95 border-2 border-[#0a0518]"
                  >
                    <Camera size={18} className="text-black stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Profile Bio & Content Area */}
              <div className="mt-20 px-6 sm:px-10">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E873C3]/10 border border-[#E873C3]/30 text-[#E873C3] text-xs font-mono font-bold">
                    Lvl {level}
                  </span>
                </div>
                <p className="text-white/60 text-base mt-1 font-mono">@{profile.username}</p>

                {/* Personal Bio */}
                {profile.bio ? (
                  <p className="text-slate-300 text-sm mt-3.5 leading-relaxed font-sans max-w-2xl">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm mt-3.5 italic font-sans max-w-2xl">
                    No bio added yet. Click &quot;Edit profile&quot; to write about your journey.
                  </p>
                )}

                <div className="flex items-center gap-2 text-white/50 text-sm mt-4 font-medium">
                  <Calendar size={16} /> Joined {formatJoinDate(createdAt)}
                </div>

                {/* ── Stats Grid Integrated inside Main Left Card ── */}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg leading-none">{xpTotal.toLocaleString()}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">
                        Total XP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="text-[#E873C3] drop-shadow-[0_0_8px_rgba(232,115,195,0.6)]">
                      <Swords size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg leading-none">{codeElo.toLocaleString()}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#E873C3] mt-1">
                        Battle ELO
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="text-[#CD7F32] drop-shadow-[0_0_8px_rgba(205,127,50,0.6)]">
                      <Shield size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm leading-none mt-0.5">
                        {rankLabel}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">
                        Rank
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                      <Award size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg leading-none">{badgeCount}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">
                        Badges
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03] col-span-2 sm:col-span-1">
                    <div className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                      <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg leading-none">{streak}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">
                        Day Streak
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar towards Next Level */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                        Current Progress
                      </p>
                      <p className="text-sm font-medium text-white/80">
                        <span className="text-white font-bold">{xpTotal.toLocaleString()}</span> / {xpNeeded.toLocaleString()} XP
                      </p>
                    </div>
                    <p className="text-xs font-mono text-slate-400">to Level {level + 1}</p>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] via-[#F59E0B] to-[#E873C3] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ ease: 'easeOut', duration: 1.5, delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* ── Battle Arena Combat Section ── */}
                <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-display text-white tracking-wide flex items-center gap-2.5">
                        <Swords size={20} className="text-[#E873C3]" />
                        Battle Arena Combat Record
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Authentic competitive ratings and performance from live 1v1 arenas.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Link
                        href="/battle"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D95FD1] to-[#8D37D6] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,95,209,0.35)] transition-all cursor-pointer"
                      >
                        <Swords size={14} />
                        <span>Fight Now</span>
                      </Link>
                      <Link
                        href="/leaderboard"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trophy size={14} className="text-amber-400" />
                        <span>Leaderboard</span>
                      </Link>
                    </div>
                  </div>

                  {/* Dual ELO Rating Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Code Battle ELO Card */}
                    <div className="p-5 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/30 via-white/[0.02] to-transparent relative overflow-hidden group hover:border-purple-500/40 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                          <Code2 size={16} className="text-purple-400" />
                          Code Battle Rating
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                          1v1 Duel
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
                          {codeElo.toLocaleString()}
                        </span>
                        <span className="text-sm font-mono font-bold text-purple-400">ELO</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Real-time algorithmic coding challenges & test suite validation.
                      </p>
                    </div>

                    {/* MCQ Battle ELO Card */}
                    <div className="p-5 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/30 via-white/[0.02] to-transparent relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                          <Brain size={16} className="text-cyan-400" />
                          MCQ Battle Rating
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                          Speed Trivia
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
                          {mcqElo.toLocaleString()}
                        </span>
                        <span className="text-sm font-mono font-bold text-cyan-400">ELO</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        High-velocity computer science theory, logic, and syntax duels.
                      </p>
                    </div>
                  </div>

                  {/* Combat Statistics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <p className="text-2xl font-bold text-white font-mono">{arenaWins}</p>
                      <p className="text-[11px] font-mono uppercase text-emerald-400 font-bold mt-1">Victories</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <p className="text-2xl font-bold text-white font-mono">{arenaLosses}</p>
                      <p className="text-[11px] font-mono uppercase text-rose-400 font-bold mt-1">Defeats</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <p className="text-2xl font-bold text-white font-mono">{arenaDraws}</p>
                      <p className="text-[11px] font-mono uppercase text-amber-400 font-bold mt-1">Draws</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                      <p className="text-2xl font-bold text-white font-mono">{totalBattles}</p>
                      <p className="text-[11px] font-mono uppercase text-slate-300 font-bold mt-1">Total Duels</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] col-span-2 sm:col-span-1">
                      <p className="text-2xl font-bold text-[#00FFE9] font-mono">{winRate}%</p>
                      <p className="text-[11px] font-mono uppercase text-[#00FFE9] font-bold mt-1">Win Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar Badges, Skills, Socials) */}
            <div className="w-full lg:w-[320px] xl:w-[350px] flex flex-col gap-6 mt-8 lg:mt-0 px-4 sm:px-0">
              {/* Badges & Achievements */}
              <div className="cosmo-glass-panel p-6 border border-white/10 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold font-display text-white text-lg tracking-wide">
                    Badges & Achievements
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-amber-300">{badges.length}</span>
                    <Trophy size={16} className="text-[#FFD700]" />
                  </div>
                </div>

                {badges.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/60">
                      <Trophy size={18} className="text-amber-400/60" />
                    </div>
                    <p className="text-xs font-semibold text-white/80">No Badges Unlocked Yet</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Compete in the Battle Arena and solve missions to unlock badges.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {badges.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl border border-white/15 bg-white/[0.04] flex flex-col items-center text-center space-y-1.5 hover:border-[#E873C3]/50 transition-all"
                      >
                        <span className="text-2xl">🏆</span>
                        <span className="text-xs font-bold text-white truncate w-full">{b.name}</span>
                        {b.description && (
                          <span className="text-[10px] text-slate-400 line-clamp-2">{b.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Card */}
              <div className="cosmo-glass-panel p-6 border border-white/10 rounded-3xl">
                <h3 className="font-bold font-display text-white mb-3 text-lg tracking-wide drop-shadow-sm">
                  Skills & Interests
                </h3>
                {profile.skills.length === 0 ? (
                  <p className="text-sm text-white/60 mb-6 font-medium">
                    You haven&apos;t listed any skills yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.skills.map((skill) => (
                      <div
                        key={skill}
                        className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/90"
                      >
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={openEditSkillsModal}
                  className="rounded-xl border border-white/15 bg-white/[0.04] py-2.5 transition-all w-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] cursor-pointer"
                >
                  <Edit size={14} /> Edit Skills
                </button>
              </div>

              {/* Socials Card */}
              <div className="cosmo-glass-panel p-6 border border-white/10 rounded-3xl">
                <h3 className="font-bold font-display text-white mb-4 text-lg tracking-wide drop-shadow-sm">
                  Social Links
                </h3>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(profile.socials).map(([network, url]) => {
                    let Icon = Globe;
                    const label = network.toUpperCase();
                    if (network === 'github') Icon = Globe;
                    if (network === 'twitter') Icon = MessageCircle;
                    if (network === 'linkedin') Icon = LinkIcon;
                    if (network === 'discord') Icon = Share2;
                    if (network === 'portfolio') Icon = Globe;

                    const isEditingThis = editingSocial === network;

                    if (isEditingThis) {
                      return (
                        <div
                          key={network}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E873C3]/60 bg-[#E873C3]/10 shadow-[0_0_15px_rgba(232,115,195,0.2)]"
                        >
                          <Icon size={16} className="text-[#E873C3] shrink-0" />
                          <span className="text-xs font-bold text-white uppercase font-mono w-14 shrink-0">{label}</span>
                          <input
                            type="text"
                            value={socialInputValue}
                            onChange={(e) => setSocialInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveSocialUrl(network);
                              if (e.key === 'Escape') cancelEditingSocial();
                            }}
                            placeholder={`${network}.com/username`}
                            className="flex-1 min-w-0 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#E873C3] font-mono"
                            autoFocus
                          />
                          <button
                            onClick={() => saveSocialUrl(network)}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 transition-colors cursor-pointer shrink-0"
                            title="Save URL"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            onClick={cancelEditingSocial}
                            className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition-colors cursor-pointer shrink-0"
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={network}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-white transition-all text-xs font-medium group"
                      >
                        <a
                          href={url ? (url.startsWith('http') ? url : `https://${url}`) : '#'}
                          target={url ? '_blank' : undefined}
                          rel="noreferrer"
                          onClick={(e) => {
                            if (!url) e.preventDefault();
                          }}
                          className="flex items-center justify-between flex-1 min-w-0 mr-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} className="text-[#E873C3] shrink-0" />
                            <span>{label}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[110px]">
                            {url ? url.replace(/^https?:\/\//, '') : <span className="italic text-slate-500">Not set</span>}
                          </span>
                        </a>
                        <button
                          onClick={() => startEditingSocial(network, url)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#E873C3] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title={`Edit ${label} URL`}
                        >
                          <Edit size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <Footer />
      </div>



      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              data-lenis-prevent
              className="cosmo-glass-panel border border-white/20 p-6 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-[#080d19]"
            >
              <div className="relative flex flex-col h-full max-h-[80vh] min-h-0">
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors p-1 z-20 bg-black/20 rounded-full cursor-pointer"
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-display font-bold text-white mb-6 shrink-0">Edit Profile</h2>

                <div
                  onWheel={(e) => e.stopPropagation()}
                  data-lenis-prevent
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 custom-scrollbar space-y-6 pb-6"
                >
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Choose Hologram Avatar
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATARS.map((av: AvatarOption) => {
                        const isSelected =
                          editData.avatarUrl === av.id ||
                          editData.avatarUrl === av.image ||
                          getAvatarUrl(editData.avatarUrl) === av.image;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setEditData({ ...editData, avatarUrl: av.image })}
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
                            <span className={`text-[10px] font-mono font-bold truncate max-w-full ${isSelected ? 'text-[#E873C3]' : 'text-white/60'}`}>
                              {av.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Your display name"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Username / Callsign
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => {
                          setEditData({ ...editData, username: e.target.value });
                          setSaveError(null);
                        }}
                        placeholder="e.g. starweaver_99"
                        className={`w-full bg-black/40 border rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors text-sm font-mono pr-9 ${
                          isNameTaken || (trimmed.length > 0 && !!formatError)
                            ? 'border-rose-500/80 focus:border-rose-500'
                            : isAvailable
                            ? 'border-emerald-500/80 focus:border-emerald-500'
                            : 'border-white/10 focus:border-[#E873C3]'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isChecking && (
                          <Loader2 size={16} className="animate-spin text-white/50" />
                        )}
                        {(isNameTaken || (trimmed.length > 0 && !!formatError)) && (
                          <XCircle size={16} className="text-rose-400" />
                        )}
                        {isAvailable && (
                          <CheckCircle size={16} className="text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Live status message */}
                    <div className="min-h-[20px] mt-1.5 flex items-center gap-1.5">
                      {isChecking && (
                        <span className="text-[11px] font-mono text-white/50">
                          Checking availability...
                        </span>
                      )}
                      {(isNameTaken || (trimmed.length > 0 && !!formatError)) && (
                        <span className="text-[11px] font-mono text-rose-400 font-medium">
                          {usernameError || 'This name is already taken.'}
                        </span>
                      )}
                      {isAvailable && (
                        <span className="text-[11px] font-mono text-emerald-400 font-medium">
                          Name available!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Personal Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Write a short bio..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm resize-none"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h3 className="text-white font-bold text-sm">Social Links</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.keys(editData.socials).map((network) => (
                        <div key={network}>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                            {network}
                          </label>
                          <input
                            type="text"
                            placeholder={`${network}.com/username`}
                            value={
                              editData.socials[network as keyof typeof editData.socials]
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                socials: { ...editData.socials, [network]: e.target.value },
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                    <XCircle size={15} className="shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isPending || isChecking || isNameTaken || !!formatError}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#E873C3] to-[#8D37D6] rounded-xl font-bold text-white shadow-[0_0_20px_rgba(141,55,214,0.4)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {isPending && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Skills Modal */}
        {isAddingSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsAddingSkill(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-[520px]"
            >
              <div className="flex flex-col cosmo-glass-panel border border-white/20 p-6 sm:p-8 rounded-3xl bg-[#080d19] shadow-2xl relative">
                <button
                  onClick={() => setIsAddingSkill(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Edit Skills & Interests
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-sans">
                  Click skills to add or remove them from your profile, or add your custom skills below.
                </p>

                {/* Section 1: Active Selected Skills */}
                <div className="mb-6">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#E873C3] mb-2.5">
                    Your Active Skills ({tempSkills.length})
                  </label>
                  {tempSkills.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      No skills selected. Click any skill below to add it.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tempSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleTempSkill(skill)}
                          className="px-3 py-1.5 bg-[#E873C3]/20 border border-[#E873C3]/50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 group hover:bg-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer"
                          title={`Click to remove ${skill}`}
                        >
                          <span>{skill}</span>
                          <X size={13} className="text-white/70 group-hover:text-rose-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Recommended Presets */}
                <div className="mb-6">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Available Presets
                  </label>
                  <div
                    data-lenis-prevent
                    onWheel={(e) => e.stopPropagation()}
                    className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto overscroll-contain custom-scrollbar pr-1"
                  >
                    {ONBOARDING_SKILLS.map((skill) => {
                      const isSelected = tempSkills.includes(skill);
                      if (isSelected) return null; // already shown in active list above
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleTempSkill(skill)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus size={13} className="text-emerald-400" />
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Add Custom Skill */}
                <div className="mb-6 pt-4 border-t border-white/10">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Add Custom Skill
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Rust, Docker..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E873C3] text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      disabled={!customSkillInput.trim()}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    disabled={isSavingSkills}
                    className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSkills}
                    disabled={isSavingSkills}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#E873C3] to-[#8D37D6] rounded-xl font-bold text-white text-xs shadow-[0_0_20px_rgba(232,115,195,0.4)] hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingSkills ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Save Skills
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
