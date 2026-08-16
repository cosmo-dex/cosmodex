"use client";
import { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Edit, Zap, Shield, Award, Flame, Plus, X, Globe, Link, MessageCircle, Video, Share2, CheckCircle2, Star, Loader2 } from 'lucide-react';
import RisingStars from '../../component/RisingStar';

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

export interface ShowcaseBadge {
  id: string;
  name: string;
  description: string;
  category: 'earned' | 'locked';
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earnedAt?: string | null;
}

const ALL_SHOWCASE_BADGES: ShowcaseBadge[] = [
  {
    id: 'b1',
    name: 'Cosmo Initiate',
    description: 'Joined CosmoDeX and started your coding odyssey.',
    category: 'earned',
    icon: '🌌',
    rarity: 'Common',
    earnedAt: '2026-08-01',
  },
  {
    id: 'b2',
    name: 'Python Pioneer',
    description: 'Mastered the Python Basics chapter & variables.',
    category: 'earned',
    icon: '⚡',
    rarity: 'Rare',
    earnedAt: '2026-08-10',
  },
  {
    id: 'b3',
    name: '7-Day Flame',
    description: 'Maintained a 7-day active daily grind streak.',
    category: 'earned',
    icon: '🔥',
    rarity: 'Epic',
    earnedAt: '2026-08-14',
  },
  {
    id: 'b4',
    name: 'CLI Navigator',
    description: 'Completed Command Line Basics theory & terminal exercises.',
    category: 'earned',
    icon: '🖥️',
    rarity: 'Rare',
    earnedAt: '2026-08-15',
  },
  {
    id: 'b5',
    name: 'Battle Arena Champion',
    description: 'Win 25 Code & MCQ Battles in the Battle Arena.',
    category: 'locked',
    icon: '⚔️',
    rarity: 'Legendary',
  },
  {
    id: 'b6',
    name: 'Grandmaster Coder',
    description: 'Reach Level 10 and accumulate 1,000+ Star Points.',
    category: 'locked',
    icon: '👑',
    rarity: 'Legendary',
  },
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
  experienceLevel: string | null;
  streak: number;
  badgeCount: number;
  badges?: Badge[];
  starPoints: number;
  rankThreshold: number;
  bio?: string;
  avatarUrl?: string;
  arenaWins?: number;
  arenaLosses?: number;
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
  level,
  experienceLevel,
  streak,
  badgeCount,
  starPoints,
  rankThreshold,
  bio: initialBio = 'Full-Stack Cosmo Coder 🌌 Grinding Python, React & AI algorithms on CosmoDeX.',
  avatarUrl: initialAvatarUrl = '/images/mascot.png',
  arenaWins = 12,
  arenaLosses = 3,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'practice' | 'battles'>('overview');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<ShowcaseBadge | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: initialUsername,
    username: initialUsername,
    bio: initialBio,
    avatarUrl: initialAvatarUrl,
    skills: initialInterests,
    socials: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      youtube: '',
      twitch: ''
    }
  });

  const [editData, setEditData] = useState(profile);
  const [tempSkills, setTempSkills] = useState<string[]>(initialInterests);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSocials = localStorage.getItem(`cosmo_socials_${initialUsername}`);
      if (savedSocials) {
        try {
          const parsed = JSON.parse(savedSocials);
          setProfile(prev => ({
            ...prev,
            socials: { ...prev.socials, ...parsed }
          }));
        } catch (e) {
          console.error('Failed to parse saved socials:', e);
        }
      }
    }
  }, [initialUsername]);

  const handleSaveProfile = () => {
    setSaveError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: editData.username,
            interests: editData.skills,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setSaveError(data.error ?? 'Failed to save profile.');
          return;
        }

        setProfile({
          ...editData,
          name: editData.username,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(`cosmo_socials_${initialUsername}`, JSON.stringify(editData.socials));
        }

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

  const handleSaveSkills = () => {
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

  const rankProgress = Math.min((starPoints / rankThreshold) * 100, 100);
  const totalBattles = arenaWins + arenaLosses;
  const winRate = totalBattles > 0 ? Math.round((arenaWins / totalBattles) * 100) : 0;

  const filteredBadges = ALL_SHOWCASE_BADGES.filter((b) => {
    if (badgeFilter === 'earned') return b.category === 'earned';
    if (badgeFilter === 'locked') return b.category === 'locked';
    return true;
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080312] text-white">
      {/* Top Main Site Navbar */}
      <Navbar />

      {/* Dashboard Background */}
      <DashboardBackground />

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
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
              <div className="absolute -bottom-16 left-6 sm:left-10 z-20">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#E873C3] shadow-[0_0_30px_rgba(232,115,195,0.4)] overflow-hidden bg-[#15151c] relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || '/images/mascot.png'}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/mascot.png';
                    }}
                  />
                  <div className="absolute inset-0 ring-inset ring-2 ring-white/20 rounded-full pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 sm:px-10 mt-20">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wide">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/40 text-[#E873C3] text-xs font-mono font-bold">
                  Lvl {level}
                </span>
              </div>
              <p className="text-white/60 text-base mt-1 font-mono">@{profile.username}</p>

              {/* Personal Bio */}
              <p className="text-slate-300 text-sm mt-3.5 leading-relaxed font-sans max-w-2xl">
                {profile.bio}
              </p>

              <div className="flex items-center gap-2 text-white/50 text-sm mt-4 font-medium">
                <Calendar size={16} /> Joined {formatJoinDate(createdAt)}
              </div>

              {/* ── Stats Grid Integrated inside Main Left Card ── */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] text-2xl">
                    ✦
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg leading-none">{starPoints}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">
                      Star Points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="text-[#CD7F32] drop-shadow-[0_0_8px_rgba(205,127,50,0.6)]">
                    <Shield size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm leading-none mt-0.5">
                      {getRankLabel(experienceLevel)}
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

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
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

              {/* Progress Bar towards Next Rank */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                      Current Progress
                    </p>
                    <p className="text-sm font-medium text-white/80">
                      <span className="text-white font-bold">{starPoints}</span> / {rankThreshold} ✦
                    </p>
                  </div>
                  <p className="text-xs font-mono text-slate-400">to Silver Rank</p>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] via-[#F59E0B] to-[#E873C3] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 1.5, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-8 mt-10 border-b border-white/10 text-base font-semibold tracking-wide">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 px-1 -mb-[1px] transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'text-white border-b-2 border-fuchsia-400'
                      : 'text-white/40 border-b-2 border-transparent hover:text-white/80'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`pb-4 px-1 -mb-[1px] transition-colors cursor-pointer ${
                    activeTab === 'practice'
                      ? 'text-white border-b-2 border-fuchsia-400'
                      : 'text-white/40 border-b-2 border-transparent hover:text-white/80'
                  }`}
                >
                  Practice & Lessons
                </button>
                <button
                  onClick={() => setActiveTab('battles')}
                  className={`pb-4 px-1 -mb-[1px] transition-colors cursor-pointer ${
                    activeTab === 'battles'
                      ? 'text-white border-b-2 border-fuchsia-400'
                      : 'text-white/40 border-b-2 border-transparent hover:text-white/80'
                  }`}
                >
                  Battle Stats
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Recent Activity Timeline */}
                    <div>
                      <h2 className="text-xl font-bold font-display text-white mb-4 tracking-wide">
                        Recent Activity Log
                      </h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#E873C3]/40 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#E873C3]/15 text-[#E873C3]">
                              <Award size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Completed Exercise: Command Line Basics</p>
                              <p className="text-xs text-slate-400 font-mono">Python Course • 10 XP Earned</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-slate-500">2 hours ago</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#00FFE9]/40 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#00FFE9]/15 text-[#00FFE9]">
                              <Swords size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Won MCQ Battle vs @CyberWizard</p>
                              <p className="text-xs text-slate-400 font-mono">Battle Arena • +25 XP Earned • {winRate}% Win Rate ({arenaWins}W - {arenaLosses}L)</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-slate-500">Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-display text-white tracking-wide">
                      Course Progress & Practice
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Python Fundamentals</span>
                          <span className="text-xs font-mono font-bold text-[#00FFE9]">2/6 Completed</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-[#00FFE9] to-[#E873C3] w-1/3" />
                        </div>
                        <p className="text-xs text-slate-400">Next lesson: Variables & Data Types</p>
                      </div>

                      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Web Development 101</span>
                          <span className="text-xs font-mono text-slate-400">Coming Soon</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-white/10 w-0" />
                        </div>
                        <p className="text-xs text-slate-400">HTML & CSS Foundations</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'battles' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-display text-white tracking-wide">
                      Battle Arena Statistics
                    </h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                        <p className="text-2xl font-bold text-white font-mono">{arenaWins}</p>
                        <p className="text-xs font-mono uppercase text-emerald-400 mt-1">Victories</p>
                      </div>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                        <p className="text-2xl font-bold text-white font-mono">{arenaLosses}</p>
                        <p className="text-xs font-mono uppercase text-rose-400 mt-1">Defeats</p>
                      </div>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                        <p className="text-2xl font-bold text-white font-mono">{winRate}%</p>
                        <p className="text-xs font-mono uppercase text-[#00FFE9] mt-1">Win Rate</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Badges, Skills, Socials) */}
          <div className="w-full lg:w-[320px] xl:w-[350px] flex flex-col gap-6 mt-8 lg:mt-0 px-4 sm:px-0">
            {/* Interactive Badge Showcase (Moved to Top of Sidebar) */}
            <div className="cosmo-glass-panel p-6 border border-white/10 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-display text-white text-lg tracking-wide">
                  Badges & Achievements
                </h3>
                <Trophy size={18} className="text-[#FFD700]" />
              </div>

              {/* Badge Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10">
                {(['all', 'earned', 'locked'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBadgeFilter(tab)}
                    className={`flex-1 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                      badgeFilter === tab
                        ? 'bg-[#E873C3]/20 border border-[#E873C3]/50 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredBadges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadgeModal(badge)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-1.5 ${
                      badge.category === 'earned'
                        ? 'bg-white/[0.04] border-white/15 hover:border-[#E873C3]/60 hover:bg-[#E873C3]/10'
                        : 'bg-white/[0.01] border-white/5 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs font-bold text-white truncate w-full">
                      {badge.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        badge.rarity === 'Legendary'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : badge.rarity === 'Epic'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                ))}
              </div>
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
            <div className="cosmo-glass-panel p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-display text-white text-lg tracking-wide drop-shadow-sm">Socials</h3>
                <button
                  onClick={() => {
                    setEditData(profile);
                    setSaveError(null);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 rounded-lg"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {Object.entries(profile.socials).map(([network, url]) => {
                  if (!url) return null;

                  let Icon = Zap;
                  let label = '';
                  if (network === 'github') { Icon = Globe; label = 'GitHub'; }
                  if (network === 'linkedin') { Icon = Link; label = 'LinkedIn'; }
                  if (network === 'twitter') { Icon = MessageCircle; label = 'X (Twitter)'; }
                  if (network === 'instagram') { Icon = Share2; label = 'Instagram'; }
                  if (network === 'youtube') { Icon = Video; label = 'YouTube'; }
                  if (network === 'twitch') { Icon = Video; label = 'Twitch'; }

                  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

                  return (
                    <a
                      key={network}
                      href={cleanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-white/80 hover:text-white transition-colors bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-fuchsia-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold">{label}</span>
                      </div>
                      <span className="text-xs text-white/40 group-hover:text-white/60 font-mono truncate max-w-[140px]">
                        {url.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                  );
                })}

                {Object.values(profile.socials).every(val => !val) && (
                  <p className="text-sm text-white/60 font-medium mb-2">No social links added yet.</p>
                )}

                <button
                  onClick={() => {
                    setEditData(profile);
                    setSaveError(null);
                    setIsEditing(true);
                  }}
                  className="cosmo-glass hover:bg-white/15 hover:-translate-y-0.5 transition-all w-full border border-white/20 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white shadow-lg mt-2"
                >
                  <Plus size={16} strokeWidth={2.5} /> Add Social Links
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <Footer />
    </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadgeModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="cosmo-glass-panel border border-white/20 p-6 rounded-3xl w-full max-w-sm relative z-10 text-center space-y-4 shadow-2xl bg-[#0d1527]"
            >
              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#E873C3]/20 to-[#8D37D6]/20 border border-[#E873C3]/40 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(232,115,195,0.4)]">
                {selectedBadgeModal.icon}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {selectedBadgeModal.name}
                </h3>
                <p className="text-xs font-mono text-[#00FFE9] mt-1">
                  Rarity: {selectedBadgeModal.rarity}
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {selectedBadgeModal.description}
              </p>

              <div className="pt-3 border-t border-white/10">
                {selectedBadgeModal.category === 'earned' ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle2 size={14} /> Earned on {selectedBadgeModal.earnedAt}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-500 flex items-center justify-center gap-1.5">
                    <Lock size={14} /> Locked Achievement
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="cosmo-glass-panel border border-white/20 p-6 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-[#080d19]"
            >
              <div className="relative flex flex-col h-full max-h-[80vh]">
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors p-1 z-20 bg-black/20 rounded-full cursor-pointer"
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-display font-bold text-white mb-6">Edit Profile</h2>

                <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#E873C3] transition-colors text-sm font-mono"
                    />
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
                    <h3 className="text-white font-medium">Social Links</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.keys(editData.socials).map(network => {
                        const placeholders: Record<string, string> = {
                          github: 'github.com/username',
                          linkedin: 'linkedin.com/in/username',
                          twitter: 'x.com/username',
                          instagram: 'instagram.com/username',
                          youtube: 'youtube.com/@channel',
                          twitch: 'twitch.tv/username',
                        };

                        return (
                          <div key={network} className="relative">
                            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{network}</label>
                            <input
                              type="text"
                              placeholder={placeholders[network] || `${network}.com/username`}
                              value={editData.socials[network as keyof typeof editData.socials]}
                              onChange={e => setEditData({
                                ...editData,
                                socials: { ...editData.socials, [network]: e.target.value }
                              })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-fuchsia-500 transition-colors text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {saveError && (
                  <p className="text-red-400 text-sm mb-3 font-medium">{saveError}</p>
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
                    disabled={isPending}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#E873C3] to-[#8D37D6] rounded-xl font-bold text-white shadow-[0_0_20px_rgba(141,55,214,0.4)] hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2 cursor-pointer"
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
                  <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
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
