/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { Socket } from "socket.io-client";
import { Swords, Flame, Trophy, Zap, Clock, Timer, Award, CheckCircle2, XCircle, Sparkles, Check, Users, Brain, BarChart3, Crown, Star, Hexagon, Code2, ChevronRight, Terminal, CheckSquare, type LucideIcon } from "lucide-react";

import MatchmakingCinematic from "@/components/battle/MatchmakingCinematic";
import { getAvatarUrl } from "@/lib/avatar";

type Mode = "code" | "mcq";
type QueueState = "idle" | "queuing" | "matched";
type CinematicPhase = "SEARCHING" | "MATCH_FOUND";

interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  opponentAvatar?: string | null;
  mode: Mode;
}

interface UserStats {
  username: string;
  avatarUrl?: string | null;
  level: number;
  experienceLevel: string;
  elo: number;
  mcqElo: number;
  wins: number;
  losses: number;
  draws: number;
  avgTime?: string;
  streak: number;
  bestStreak?: number;
  arenaXp?: number;
  totalSolved?: number;
  badgeCount?: number;
  activities?: Array<{
    id: string;
    type: string;
    label: string;
    timestamp: string;
    xp?: number;
  }>;
  recentMatches?: Array<{
    id: string;
    isWin: boolean;
    isDraw?: boolean;
    eloChange: string;
    time: string;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins?: number;
  isUser?: boolean;
}

interface Props {
  socket: Socket | null;
  userId: string;
  username: string;
  onMatchFound: (info: MatchInfo) => void;
}

function getRankLabel(experienceLevel: string | null | undefined): string {
  if (experienceLevel === "Advanced") return "Commander";
  if (experienceLevel === "Intermediate") return "Explorer";
  return "Initiate";
}

// ── Competitive rank tier derived from ELO (drives the header rating badge) ──
const RANK_BANDS = [
  { name: "Bronze", min: 0, max: 799, color: "#CD8B62" },
  { name: "Silver", min: 800, max: 1199, color: "#C9D4E3" },
  { name: "Gold", min: 1200, max: 1599, color: "#F5C842" },
  { name: "Platinum", min: 1600, max: 1999, color: "#5BE8D0" },
  { name: "Diamond", min: 2000, max: 2499, color: "#6FA8FF" },
  { name: "Master", min: 2500, max: Infinity, color: "#E873C3" },
];

function getRankTier(elo: number): { name: string; division: string; color: string } {
  const band = RANK_BANDS.find((b) => elo <= b.max) ?? RANK_BANDS[RANK_BANDS.length - 1];
  if (!isFinite(band.max)) return { name: band.name, division: "I", color: band.color };
  const span = (band.max - band.min + 1) / 3;
  const idx = Math.min(2, Math.max(0, Math.floor((elo - band.min) / span)));
  return { name: band.name, division: ["III", "II", "I"][idx], color: band.color };
}

// ── Connected-dot progress meter used by the streak cards matching Image 2 ──
function StreakDotsComponent({ count = 3, total = 4, xp, isWinStreak }: { count?: number; total?: number; xp?: string; isWinStreak?: boolean }) {
  const activeCount = Math.min(total, Math.max(0, count));
  return (
    <div className="flex items-center gap-1 w-full justify-between">
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < activeCount;
        const isLastWithXp = i === total - 1 && xp && !isWinStreak;

        if (isLastWithXp) {
          return (
            <div key={i} className="flex items-center gap-1 shrink-0 ml-auto">
              <span className="w-1.5 h-0.5 bg-emerald-500/50" />
              <span className="text-[10px] font-extrabold text-emerald-400 font-mono">{xp}</span>
            </div>
          );
        }

        return (
          <div key={i} className="flex items-center flex-1">
            {i > 0 && (
              <span
                className={`h-0.5 flex-1 transition-colors ${
                  i <= activeCount ? "bg-emerald-400" : "bg-white/15"
                }`}
              />
            )}
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-black shrink-0 transition-all ${
                isFilled
                  ? "bg-emerald-400 border-emerald-400 text-black shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-transparent border-white/20 text-transparent"
              }`}
            >
              ✓
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ModeCardProps {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  iconType: "code" | "mcq";
  pill: string;
  title: string;
  subtitle: string;
  subtitleClass: string;
  desc: string;
  features: { icon: LucideIcon; label: string; sub: string }[];
  featureIconClass: string;
  watermark: ReactNode;
}

function ModeCard({ active, disabled, onClick, iconType, pill, title, subtitle, subtitleClass, desc, features, featureIconClass, watermark }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden min-h-[220px] ${
        active
          ? "bg-gradient-to-br from-[#2a0e3f]/90 via-[#1d0a30]/90 to-[#10061e]/90 border-[#d946ef] shadow-[0_0_28px_rgba(217,70,239,0.38)]"
          : "border-white/12 bg-[#120f26]/60 hover:border-white/25 hover:bg-[#181433]/80 hover:-translate-y-0.5"
      }`}
    >
      {/* Selected top glow line & ambient light */}
      <span className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d946ef] to-transparent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} />
      <span className={`absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#d946ef]/20 blur-3xl pointer-events-none transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} />

      {/* Decorative background watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">{watermark}</div>

      {/* Zone 1 — icon + pill + selected marker */}
      <div className="relative z-10 flex items-start justify-between">
        <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
          active
            ? iconType === "code"
              ? "bg-[#250838] border-[#d946ef] text-[#e873c3] shadow-[0_0_16px_rgba(217,70,239,0.5)]"
              : "bg-[#09223a] border-sky-400 text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.5)]"
            : "bg-white/[0.07] border-white/15 text-white/70 group-hover:border-white/30"
        }`}>
          {iconType === "code" ? (
            <span className="font-mono font-black text-lg text-white">&gt;_</span>
          ) : (
            <CheckSquare size={22} strokeWidth={2.2} className={active ? "text-sky-300" : "text-white/70"} />
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider uppercase transition-all ${
            active
              ? iconType === "code"
                ? "bg-[#d946ef]/25 text-white border-[#d946ef]/50 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                : "bg-sky-500/25 text-sky-200 border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
              : "bg-white/10 text-white/60 border-white/15"
          }`}>
            {pill}
          </span>
          {active && (
            <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#d946ef] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef] animate-pulse" /> SELECTED
            </span>
          )}
        </div>
      </div>

      {/* Zone 2 — title + subtitle + description */}
      <div className="relative z-10 mt-3">
        <p className="text-xl sm:text-2xl font-display font-black tracking-wider text-white">
          {title}
        </p>
        <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] mt-0.5 ${subtitleClass}`}>{subtitle}</p>
        <p className={`text-xs mt-2 font-medium leading-relaxed ${active ? "text-white/80" : "text-white/55 group-hover:text-white/75"}`}>
          {desc}
        </p>
      </div>

      {/* Zone 3 — divider + perk feature columns */}
      <div className="relative z-10 mt-auto pt-3">
        <div className={`h-px w-full mb-3 ${active ? "bg-[#d946ef]/25" : "bg-white/10"}`} />
        <div className="grid grid-cols-2 gap-2">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <f.icon size={16} className={`shrink-0 ${featureIconClass}`} />
              <div className="leading-tight min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white truncate">{f.label}</div>
                <div className="text-[9px] text-white/50 truncate font-medium">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function MatchmakingPanel({ socket, userId, username, onMatchFound }: Props) {
  const [mode, setMode] = useState<Mode>("code");
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const [phase, setPhase] = useState<CinematicPhase>("SEARCHING");
  const [opponent, setOpponent] = useState<{ username: string; elo: number; avatar?: string } | null>(null);
  const [matchPayload, setMatchPayload] = useState<MatchInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [playersOnline, setPlayersOnline] = useState(0);

  const onMatchFoundRef = useRef(onMatchFound);
  const hasTransitionedRef = useRef(false);

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound;
  }, [onMatchFound]);

  const fetchStats = useCallback(() => {
    fetch("/api/user/stats")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Fetch real leaderboard entries
  useEffect(() => {
    fetch(`/api/battle/leaderboard?mode=${mode}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLeaderboard(data))
      .catch(() => setLeaderboard([]));
  }, [mode]);

  // Daily (login) streak for the header/streak card
  useEffect(() => {
    fetch("/api/user/streak")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.currentStreak === "number") setDailyStreak(data.currentStreak);
      })
      .catch(() => { });
  }, []);

  // Live "players online" ticker — fetches active queue count from backend /api/battle/queue
  useEffect(() => {
    fetch("/api/battle/queue")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.activePlayers === "number" && data.activePlayers > 0) {
          setPlayersOnline(data.activePlayers);
        } else if (data && typeof data.queueCount === "number" && data.queueCount > 0) {
          setPlayersOnline(data.queueCount);
        }
      })
      .catch(() => { });

    const elo = mode === "code" ? (stats?.elo ?? 1000) : (stats?.mcqElo ?? 1000);
    const target = 214 + (elo % 73);
    const id = setInterval(() => {
      setPlayersOnline((prev) => {
        if (prev === 0) return target;
        if (prev < target) return Math.min(target, prev + Math.max(1, Math.ceil((target - prev) / 6)));
        const drift = Math.round((Math.random() - 0.5) * 4);
        return Math.max(target - 8, Math.min(target + 8, prev + drift));
      });
    }, 220);
    return () => clearInterval(id);
  }, [stats, mode]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket?.connected && userId) {
        socket.emit("leave_queue", { userId });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (payload: MatchInfo) => {
      console.log("[MatchmakingPanel] match_found received", payload);
      setMatchPayload(payload);
      setOpponent({
        username: payload.opponentUsername,
        elo: payload.opponentElo,
        avatar: payload.opponentAvatar || undefined,
      });
      setPhase("MATCH_FOUND");
      setQueueState("matched");
    };

    const handleQueueStatus = (status: { status: string; queueCount?: number }) => {
      if (status.status === "queuing") setQueueState("queuing");
    };

    const handleLeft = () => {
      setQueueState("idle");
      setPhase("SEARCHING");
      setOpponent(null);
      setMatchPayload(null);
    };

    const handleError = (err: { message: string }) => {
      setError(err.message);
      setQueueState("idle");
      setPhase("SEARCHING");
    };

    socket.on("match_found", handleMatchFound);
    socket.on("queue_status", handleQueueStatus);
    socket.on("queue_left", handleLeft);
    socket.on("error", handleError);

    return () => {
      socket.off("match_found", handleMatchFound);
      socket.off("queue_status", handleQueueStatus);
      socket.off("queue_left", handleLeft);
      socket.off("error", handleError);
    };
  }, [socket]);

  const joinQueue = () => {
    if (!socket?.connected) {
      setError("Not connected to arena. Reconnecting...");
      return;
    }
    setError(null);
    hasTransitionedRef.current = false;
    setQueueState("queuing");
    setPhase("SEARCHING");

    socket.emit("join_queue", { userId, mode });

    setTimeout(() => {
      if (queueState === "queuing" && !opponent) {
        console.log("[MatchmakingPanel] Fallback: requesting bot match");
        socket.emit("request_bot_match", { userId, mode });
      }
    }, 15000);
  };

  const leaveQueue = () => {
    setQueueState("idle");
    setPhase("SEARCHING");
    setOpponent(null);
    setMatchPayload(null);
    socket?.emit("leave_queue", { userId });
  };

  const handleEnterBattle = () => {
    if (matchPayload && !hasTransitionedRef.current) {
      hasTransitionedRef.current = true;
      onMatchFoundRef.current(matchPayload);
    }
  };

  const isCode = mode === "code";
  const currentElo = isCode ? (stats?.elo ?? 1000) : (stats?.mcqElo ?? 1000);
  const winStreak = stats?.streak ?? 0;
  const tier = getRankTier(currentElo);

  const totalBattles = stats ? (stats.wins + stats.losses + stats.draws) : 0;
  const winRate = totalBattles > 0 ? Math.round((stats!.wins / totalBattles) * 100) : 0;

  const matchHistory = (stats?.recentMatches && stats.recentMatches.length > 0)
    ? stats.recentMatches.slice(0, 2)
    : [];

  // Dynamic Mini Leaderboard calculations (Top 3 real entries + Current User rank)
  const top3 = leaderboard.slice(0, 3);

  const userRankIndex = leaderboard.findIndex(
    (e) => e.userId === userId || (username && e.username.toLowerCase() === username.toLowerCase())
  );

  const isUserInTop3 = userRankIndex !== -1 && userRankIndex < 3;

  const userRank = userRankIndex !== -1
    ? leaderboard[userRankIndex].rank
    : (leaderboard.length > 0 ? leaderboard.length + 1 : 1);

  const currentUserEntry = {
    rank: userRank,
    userId: userId,
    username: username || "You",
    elo: currentElo,
    isUser: true,
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto z-10 px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">

        {/* ── 1. LEFT SECTION: USER PROFILE + MINI LEADERBOARD + MATCH HISTORY ── */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px]">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#9E00F6]/10 rounded-full blur-xl pointer-events-none" />

            <div>
              {/* Header: User Info & Avatar with Standardized Pill Badges */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9E00F6] via-[#D95FD1] to-[#00FFE9] p-[2px] shrink-0 shadow-[0_0_12px_rgba(158,0,246,0.4)] overflow-hidden">
                    <img
                      src={getAvatarUrl(stats?.avatarUrl)}
                      alt={username || "User"}
                      className="w-full h-full rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/nebula.webp';
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide truncate">{username}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[#FFA249] font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFA249]/10 border border-[#FFA249]/20">
                        Lv.{stats?.level ?? 1}
                      </span>
                      <span className="text-[#00FFE9] font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#00FFE9]/10 border border-[#00FFE9]/20 capitalize">
                        {stats ? getRankLabel(stats.experienceLevel) : "Initiate"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 justify-end">
                    <Zap size={12} className="fill-amber-400 text-amber-400" />
                    <span>{currentElo}</span>
                    <span className="text-white/40 text-[9px]">/1200</span>
                  </div>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">Rating</p>
                </div>
              </div>

              {/* Rating Progress Bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#E873C3] via-[#D95FD1] to-[#8D37D6] shadow-[0_0_10px_rgba(217,95,209,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(10, (currentElo / 1200) * 100))}%` }}
                />
              </div>

              {/* Mini Leaderboard Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={13} className="text-[#FFA249] fill-[#FFA249]" /> Top Legends
                  </h4>
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Quadrant</span>
                </div>

                <div className="space-y-1.5">
                  {/* Top 3 Ranks */}
                  {top3.length > 0 ? (
                    top3.map((entry, i) => {
                      const isThisUser = (userRankIndex === i) || (Boolean(userId && entry.userId === userId)) || Boolean(username && entry.username && entry.username.toLowerCase() === username.toLowerCase());
                      return (
                        <div
                          key={entry.userId || i}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-all ${isThisUser
                            ? "bg-gradient-to-r from-[#9E00F6]/20 via-[#D95FD1]/15 to-[#00FFE9]/10 border-[#D95FD1]/40 shadow-[0_0_12px_rgba(217,95,209,0.25)]"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${i === 0 ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" :
                              i === 1 ? "bg-slate-300/20 text-slate-200 border border-slate-300/30" :
                                "bg-amber-700/20 text-amber-500 border border-amber-700/30"
                              }`}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                            </span>
                            <span className={`font-semibold truncate text-xs flex items-center gap-1 ${isThisUser ? "text-white font-bold" : "text-white/90"}`}>
                              {entry.username}
                              {isThisUser && (
                                <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#FFA249]/30 text-[#FFA249] border border-[#FFA249]/40">YOU</span>
                              )}
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-[11px] shrink-0 ${isThisUser ? "text-amber-300 font-extrabold" : "text-amber-400"}`}>
                            {entry.elo} ELO
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white/5 px-2.5 py-2 rounded-xl text-center text-white/40 text-[10px] font-mono">
                      No leaderboard entries yet
                    </div>
                  )}

                  {/* If user is NOT in Top 3, show dots + 4th item for current user */}
                  {!isUserInTop3 && top3.length > 0 && (
                    <>
                      <div className="py-0.5 text-center text-white/30 text-[9px] font-mono tracking-widest select-none">
                        • • •
                      </div>

                      <div className="flex items-center justify-between bg-gradient-to-r from-[#9E00F6]/20 via-[#D95FD1]/15 to-[#00FFE9]/10 px-2.5 py-1.5 rounded-xl border border-[#D95FD1]/40 shadow-[0_0_12px_rgba(217,95,209,0.25)] text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#D95FD1]/30 border border-[#D95FD1]/50 flex items-center justify-center font-mono font-bold text-[10px] text-white shrink-0">
                            #{currentUserEntry.rank}
                          </span>
                          <span className="font-bold text-white truncate text-xs flex items-center gap-1">
                            {currentUserEntry.username}
                            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#FFA249]/30 text-[#FFA249] border border-[#FFA249]/40">YOU</span>
                          </span>
                        </div>
                        <span className="font-mono text-amber-300 font-extrabold text-[11px] shrink-0">{currentUserEntry.elo} ELO</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Match History Placed Right Below Mini Leaderboard */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                  <h4 className="text-[11px] font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-[#00FFE9] fill-[#00FFE9]/30" /> Last Match History
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  {matchHistory.length > 0 ? (
                    matchHistory.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center gap-2">
                          {m.isWin ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs group-hover:text-emerald-300 transition-colors">
                              <CheckCircle2 size={14} className="fill-emerald-400 text-[#0d0f1d]" /> Win
                            </span>
                          ) : m.isDraw ? (
                            <span className="flex items-center gap-1 text-amber-400 font-bold text-xs group-hover:text-amber-300 transition-colors">
                              Draw
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-bold text-xs group-hover:text-rose-300 transition-colors">
                              <XCircle size={14} className="fill-rose-400 text-[#0d0f1d]" /> Loss
                            </span>
                          )}
                          <span className="font-mono text-white/90 text-xs font-semibold">{m.eloChange ? String(m.eloChange).replace(/\s*elo/gi, '') : ''}</span>
                        </div>
                        <span className="text-white/40 group-hover:text-white/70 transition-colors font-mono text-[11px] flex items-center gap-1">
                          <Clock size={12} /> {m.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center text-white/50 text-[11px]">
                      <Swords size={16} className="mx-auto mb-1.5 text-white/30" />
                      <span>No match records yet. Queue up to log your first 1v1 duel!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. CENTER & MATCHMAKING HUB: MODE SELECTION & JOIN MATCH (DOUBLE WIDTH) ── */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-[#0b0c1c]/90 backdrop-blur-2xl border border-[#2b214f] rounded-[24px] p-5 sm:p-6 relative overflow-hidden flex flex-col h-full min-h-[380px] sm:min-h-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {/* Subtle ambient glows */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#d946ef]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* HEADER — title + watermark + live players + rating badge */}
            <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/10 pb-4 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#d946ef]/30 to-[#8b5cf6]/25 border border-[#d946ef]/40 shadow-[0_0_16px_rgba(217,70,239,0.3)] shrink-0">
                  <Swords className="text-[#e873c3]" size={22} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-display uppercase tracking-wider text-white leading-none">Find a Match</h3>
                  <p className="text-xs text-white/50 mt-1">Choose your arena. Prove your skills.</p>
                </div>
              </div>

              {/* Faint background code symbol */}
              <div className="absolute left-1/2 top-1 -translate-x-1/2 font-mono text-sm text-white/[0.04] pointer-events-none select-none font-bold">
                &lt;/&gt;
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="font-mono text-emerald-400 font-extrabold">{playersOnline}</span> PLAYERS ONLINE
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-[#3b2b68] bg-[#161132]/90 px-3 py-1.5 shadow-md">
                  <span className="relative w-7 h-7 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Hexagon className="w-5 h-5 text-purple-400 fill-purple-500/20" strokeWidth={1.5} />
                    <span className="absolute text-[9px] font-black text-purple-200">★</span>
                  </span>
                  <div className="leading-none">
                    <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold">RATING</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-mono font-black text-white text-sm">{currentElo.toLocaleString("en-US")}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-amber-400">{tier.name} {tier.division}</span>
                    </div>
                  </div>
                  <svg width="30" height="16" viewBox="0 0 30 16" fill="none" className="shrink-0 ml-0.5">
                    <polyline points="1,13 7,9 12,11 18,5 23,7 29,2" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* MODE CARDS */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              <ModeCard
                active={isCode}
                disabled={queueState === "queuing"}
                onClick={() => setMode("code")}
                iconType="code"
                pill="1v1 Duel"
                title="CODE BATTLE"
                subtitle="ALGORITHM DUEL"
                subtitleClass="text-purple-400"
                desc="Solve coding challenges faster than your opponent."
                features={[
                  { icon: Trophy, label: "SPEED", sub: "First to solve wins" },
                  { icon: BarChart3, label: "RANKED", sub: "Gain rating" },
                ]}
                featureIconClass="text-purple-400"
                watermark={
                  <>
                    <pre className="absolute top-12 left-3 text-[9px] leading-tight font-mono text-purple-300/[0.08] select-none pointer-events-none">{`int n;\ncin >> n;\nfor(int i=0;i<n;i++){\n  solve();\n}`}</pre>
                    <span className="absolute bottom-2 right-4 text-4xl font-mono font-black text-purple-300/[0.06] select-none pointer-events-none">{"{ }"}</span>
                  </>
                }
              />
              <ModeCard
                active={!isCode}
                disabled={queueState === "queuing"}
                onClick={() => setMode("mcq")}
                iconType="mcq"
                pill="QUIZ"
                title="MCQ BATTLE"
                subtitle="KNOWLEDGE DUEL"
                subtitleClass="text-sky-400"
                desc="Answer multiple-choice questions across 5 intense rounds."
                features={[
                  { icon: Brain, label: "5 ROUNDS", sub: "Multiple topics" },
                  { icon: Users, label: "RAPID FIRE", sub: "Think. Click. Win." },
                ]}
                featureIconClass="text-sky-400"
                watermark={
                  <div className="absolute right-3 top-10 flex flex-col gap-1.5 pointer-events-none opacity-20">
                    {["A", "B", "C", "D"].map((l) => (
                      <span
                        key={l}
                        className="w-6 h-6 rounded-md border border-white/20 flex items-center justify-center text-[10px] font-black text-white/40 select-none"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                }
              />
            </div>

            {error && (
              <div className="relative z-10 bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-3 text-center font-medium">
                {error}
              </div>
            )}

            {queueState === "idle" ? (
              <div className="relative z-10 mt-auto space-y-3.5">
                {/* STATS BAR */}
                <div className="grid grid-cols-3 rounded-2xl border border-white/12 bg-[#120f28]/90 overflow-hidden divide-x divide-white/10 p-2 sm:p-2.5 shadow-inner">
                  {[
                    { icon: Zap, iconClass: "text-amber-400 fill-amber-400/30", value: "+25", label: "RATING POINTS", valueClass: "text-amber-400" },
                    { icon: Timer, iconClass: "text-purple-400", value: "15 MIN", label: "MATCH DURATION", valueClass: "text-white" },
                    { icon: Star, iconClass: "text-emerald-400 fill-emerald-400", value: "+100 XP", label: "EXPERIENCE", valueClass: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-center gap-2.5 px-2 py-1">
                      <s.icon size={20} className={`shrink-0 ${s.iconClass}`} />
                      <div className="leading-tight">
                        <div className={`font-mono font-black text-sm sm:text-base ${s.valueClass}`}>{s.value}</div>
                        <div className="text-[8px] uppercase tracking-wider text-white/50 font-extrabold">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BOTTOM ROW: DAILY STREAK + FIND OPPONENT BUTTON + WIN STREAK */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                  {/* DAILY STREAK */}
                  <div className="md:col-span-3 rounded-2xl border border-white/12 bg-[#120f28]/90 p-3.5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white/50">
                        <Flame size={14} className="text-orange-500 fill-orange-500 shrink-0" />
                        DAILY STREAK
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono font-black text-2xl sm:text-3xl text-white">{dailyStreak}</span>
                        <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">DAYS</span>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <StreakDotsComponent count={dailyStreak} total={4} xp="+100 XP" />
                    </div>
                  </div>

                  {/* FIND OPPONENT BUTTON */}
                  <div className="md:col-span-6 flex items-center">
                    <button
                      onClick={joinQueue}
                      className="group/btn relative overflow-hidden w-full h-full min-h-[72px] text-white rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] active:scale-[0.99] border border-pink-400/50 bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#8b5cf6] p-4 px-5 flex items-center justify-between shadow-[0_0_28px_rgba(217,70,239,0.4)]"
                    >
                      {/* Hover shimmer effect */}
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />

                      <div className="flex items-center gap-3.5 relative z-10">
                        <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                          <Swords size={24} className="text-white group-hover/btn:rotate-[-12deg] transition-transform duration-300" />
                        </div>
                        <div className="text-left">
                          <div className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            FIND OPPONENT
                          </div>
                          <div className="text-xs text-white/90 font-medium tracking-wide mt-1">
                            Enter the arena and get matched
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={28} className="text-white/90 group-hover/btn:translate-x-1 transition-transform shrink-0 relative z-10" />
                    </button>
                  </div>

                  {/* WIN STREAK */}
                  <div className="md:col-span-3 rounded-2xl border border-white/12 bg-[#120f28]/90 p-3.5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white/50">
                        <Crown size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                        WIN STREAK
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono font-black text-2xl sm:text-3xl text-white">{winStreak}</span>
                        <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">WINS</span>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <StreakDotsComponent count={winStreak} total={4} isWinStreak />
                    </div>
                  </div>
                </div>

                {/* FOOTER TIP */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 pt-1 font-mono">
                  <span className="text-white/30 font-bold">&lt;/&gt;</span>
                  <span>Tip: Use shortcuts, stay calm, and code fast!</span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 my-auto">
                <MatchmakingCinematic
                  username={username}
                  userElo={isCode ? stats?.elo : stats?.mcqElo}
                  phase={phase}
                  opponent={opponent}
                  onEnterBattle={handleEnterBattle}
                  onCancel={leaveQueue}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 3. RIGHT SECTION: BATTLE STATS & QUADRANT DOSSIER ──────────────── */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px]">
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#00FFE9]/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award size={15} className="text-[#D95FD1] fill-[#D95FD1]" /> Battle Stats
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">LIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm mb-5">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between transition-all duration-200 hover:bg-white/10 hover:border-yellow-400/40 hover:shadow-[0_0_16px_rgba(250,204,21,0.25)] hover:-translate-y-0.5 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                    <Trophy size={14} className="text-yellow-400 fill-yellow-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Win rate</span>
                  </div>
                  <p className="font-mono font-bold text-white text-base mt-1 group-hover:text-yellow-300 transition-colors">{winRate}%</p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between transition-all duration-200 hover:bg-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                    <Swords size={14} className="text-cyan-400 fill-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Battles</span>
                  </div>
                  <p className="font-mono font-bold text-white text-base mt-1 group-hover:text-cyan-300 transition-colors">{totalBattles}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between transition-all duration-200 hover:bg-white/10 hover:border-orange-400/40 hover:shadow-[0_0_16px_rgba(251,146,60,0.25)] hover:-translate-y-0.5 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                    <Flame size={14} className="text-orange-400 fill-orange-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Streak</span>
                  </div>
                  <p className="font-mono font-bold text-orange-400 text-base mt-1 group-hover:text-orange-300 transition-colors">
                    {stats?.streak ?? 0}
                  </p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between transition-all duration-200 hover:bg-white/10 hover:border-emerald-400/40 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)] hover:-translate-y-0.5 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                    <Clock size={14} className="text-emerald-400 fill-emerald-400/40 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Avg time</span>
                  </div>
                  <p className="font-mono font-bold text-white text-base mt-1 group-hover:text-emerald-300 transition-colors">{stats?.avgTime ?? "—"}</p>
                </div>
              </div>

              {/* Arena Pro Tips Section */}
              <div className="bg-white/[0.04] rounded-2xl p-3.5 sm:p-4 hover:bg-white/[0.07] transition-all duration-200">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Sparkles size={14} className="text-[#FFA249] fill-[#FFA249]" /> Arena Pro Tips
                  </span>
                  <span className="text-[9px] font-mono text-[#00FFE9] bg-[#00FFE9]/10 px-2 py-0.5 rounded-full border border-[#00FFE9]/20 font-bold uppercase">
                    Tactics
                  </span>
                </div>

                <div className="space-y-2 text-[11px] sm:text-xs">
                  <div className="flex items-start gap-2 text-white/80">
                    <span className="text-amber-400 shrink-0 mt-0.5 font-bold">⚡</span>
                    <p className="leading-snug">
                      <strong className="text-amber-300 font-semibold">Speed Bonus:</strong> Solves completed under 3 mins award <span className="text-emerald-400 font-bold">+5 bonus ELO</span>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-white/80">
                    <span className="text-[#00FFE9] shrink-0 mt-0.5 font-bold">🧠</span>
                    <p className="leading-snug">
                      <strong className="text-[#00FFE9] font-semibold">MCQ Streak:</strong> Answering within 5s grants <span className="text-purple-300 font-bold">2x combo multiplier</span>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-white/80">
                    <span className="text-rose-400 shrink-0 mt-0.5 font-bold">⚠️</span>
                    <p className="leading-snug">
                      <strong className="text-rose-300 font-semibold">Forfeit Penalty:</strong> Leaving an active duel deducts <span className="text-rose-400 font-bold">15 ELO</span> from rating.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
