/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { Socket } from "socket.io-client";
import { Swords, Flame, Trophy, Zap, Clock, Timer, Award, CheckCircle2, XCircle, Sparkles, Check, Users, Brain, BarChart3, Crown, Star, Hexagon, Code2, type LucideIcon } from "lucide-react";

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

// ── Small connected-dot progress meter used by the streak cards ──
function StreakDots({ count, color }: { count: number; color: string }) {
  const total = 5;
  const filled = Math.max(0, Math.min(total, count));
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && (
            <span className="w-1.5 h-px" style={{ background: i < filled ? color : "rgba(255,255,255,0.15)" }} />
          )}
          <span
            className="w-3 h-3 rounded-full flex items-center justify-center border"
            style={
              i < filled
                ? { background: color, borderColor: color, boxShadow: `0 0 6px ${color}80` }
                : { background: "transparent", borderColor: "rgba(255,255,255,0.18)" }
            }
          >
            {i < filled && <Check size={8} strokeWidth={4} className="text-black/70" />}
          </span>
        </span>
      ))}
    </div>
  );
}

interface ModeCardProps {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  iconSrc: string;
  pill: string;
  title: string;
  subtitle: string;
  subtitleClass: string;
  desc: string;
  features: { icon: LucideIcon; label: string; sub: string }[];
  featureIconClass: string;
  watermark: ReactNode;
}

function ModeCard({ active, disabled, onClick, iconSrc, pill, title, subtitle, subtitleClass, desc, features, featureIconClass, watermark }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden min-h-[210px] ${active
        ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/18 to-[#8D37D6]/28 border-[#E873C3]/50 shadow-[0_0_25px_rgba(232,115,195,0.32)]"
        : "border-white/12 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07] hover:-translate-y-0.5"
        }`}
    >
      {/* Selected: top accent bar + soft radial glow + animated neon ring */}
      <span className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} />
      <span className={`absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#E873C3]/20 blur-2xl pointer-events-none transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} />
      <span className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${active ? "opacity-100 animate-[neonBreathe_2.8s_ease-in-out_infinite]" : "opacity-0"}`} />

      {/* Decorative background watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">{watermark}</div>

      {/* Zone 1 — icon + pill + selected marker */}
      <div className="relative z-10 flex items-start justify-between">
        <div className={`relative p-2.5 rounded-xl border transition-all duration-200 group-hover:scale-105 ${active
          ? "bg-gradient-to-br from-[#E873C3]/40 to-[#8D37D6]/25 border-[#E873C3]/50 shadow-[0_0_16px_rgba(232,115,195,0.4)]"
          : "bg-white/10 border-white/12 group-hover:border-white/25"
          }`}>
          <img
            src={iconSrc}
            alt={title}
            width={26}
            height={26}
            className="w-[26px] h-[26px] object-contain transition-all duration-300 group-hover:scale-110"
            style={{
              filter: active
                ? "drop-shadow(0 0 5px rgba(0,255,233,0.8)) drop-shadow(0 0 13px rgba(0,255,233,0.4))"
                : "saturate(0.55) brightness(0.85)",
              opacity: active ? 1 : 0.62,
            }}
          />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide transition-all ${active
            ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
            : "bg-white/10 text-white/60 border-white/15"
            }`}>
            {pill}
          </span>
          {active && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#E873C3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E873C3] shadow-[0_0_6px_rgba(232,115,195,0.9)]" /> Selected
            </span>
          )}
        </div>
      </div>

      {/* Zone 2 — title + subtitle + description */}
      <div className="relative z-10 mt-3">
        <p className={`text-lg sm:text-xl font-display font-bold tracking-wide ${active ? "text-white" : "text-white/90 group-hover:text-white"}`}>
          {title}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mt-0.5 ${subtitleClass}`}>{subtitle}</p>
        <p className={`text-[11px] mt-2 font-medium leading-snug ${active ? "text-white/75" : "text-white/55 group-hover:text-white/75"}`}>
          {desc}
        </p>
      </div>

      {/* Zone 3 — divider + feature columns (pinned to card bottom) */}
      <div className="relative z-10 mt-auto pt-3">
        <div className={`h-px w-full mb-3 ${active ? "bg-[#E873C3]/20" : "bg-white/10"}`} />
        <div className="grid grid-cols-2 gap-2">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <f.icon size={16} className={`shrink-0 ${featureIconClass}`} />
              <div className="leading-tight min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-white truncate">{f.label}</div>
                <div className="text-[9px] text-white/45 truncate">{f.sub}</div>
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

  // Ambient "players online" ticker — counts up then gently drifts to feel live
  useEffect(() => {
    const elo = mode === "code" ? (stats?.elo ?? 1000) : (stats?.mcqElo ?? 1000);
    const target = 214 + (elo % 73);
    const id = setInterval(() => {
      setPlayersOnline((prev) => {
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
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] p-5 sm:p-6 relative overflow-hidden flex flex-col h-full min-h-[380px] sm:min-h-[400px]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#9E00F6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#00FFE9]/10 rounded-full blur-2xl pointer-events-none" />

            {/* HEADER — title + live players + rating badge */}
            <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/10 pb-3.5 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#9E00F6]/30 to-[#E873C3]/25 border border-[#E873C3]/30 shadow-[0_0_14px_rgba(232,115,195,0.25)] shrink-0">
                  <Swords className="text-[#E873C3]" size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white leading-none">Find a Match</h3>
                  <p className="text-[11px] text-white/50 mt-1.5">Choose your arena. Prove your skills.</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/55 uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="font-mono text-emerald-300">{playersOnline}</span> Players Online
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-2.5 py-1.5">
                  <span className="relative w-7 h-7 flex items-center justify-center shrink-0">
                    <Hexagon className="absolute inset-0 w-7 h-7" strokeWidth={1.5} style={{ color: tier.color }} />
                    <span className="relative text-[10px] font-black" style={{ color: tier.color }}>{tier.name[0]}</span>
                  </span>
                  <div className="leading-none">
                    <div className="text-[8px] uppercase tracking-widest text-white/40 font-semibold">Rating</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-mono font-black text-white text-sm">{currentElo.toLocaleString("en-US")}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: tier.color }}>{tier.name} {tier.division}</span>
                    </div>
                  </div>
                  <svg width="30" height="16" viewBox="0 0 30 16" fill="none" className="shrink-0">
                    <polyline points="1,13 7,9 12,11 18,5 23,7 29,2" stroke={tier.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                iconSrc="/images/battle/code-battle.webp"
                pill="1v1 Duel"
                title="Code Battle"
                subtitle="Algorithm Duel"
                subtitleClass="text-purple-300"
                desc="Solve coding challenges faster than your opponent."
                features={[
                  { icon: Trophy, label: "Speed", sub: "First to solve wins" },
                  { icon: BarChart3, label: "Ranked", sub: "Gain rating" },
                ]}
                featureIconClass="text-purple-300"
                watermark={
                  <>
                    <pre className="absolute top-14 left-3 text-[9px] leading-tight font-mono text-white/[0.07] select-none">{`int n;\ncin >> n;\nfor(int i=0;\n  i<n; i++){\n  solve();\n}`}</pre>
                    <span className="absolute bottom-2 right-4 text-4xl font-mono font-bold text-white/[0.05] select-none">{"{ }"}</span>
                  </>
                }
              />
              <ModeCard
                active={!isCode}
                disabled={queueState === "queuing"}
                onClick={() => setMode("mcq")}
                iconSrc="/images/battle/mcq-battle.webp"
                pill="Quiz"
                title="MCQ Battle"
                subtitle="Knowledge Duel"
                subtitleClass="text-sky-300"
                desc="Answer multiple-choice questions across 5 intense rounds."
                features={[
                  { icon: Brain, label: "5 Rounds", sub: "Multiple topics" },
                  { icon: Users, label: "Rapid Fire", sub: "Think. Click. Win." },
                ]}
                featureIconClass="text-sky-300"
                watermark={
                  <>
                    {["A", "B", "C", "D"].map((l, i) => (
                      <span
                        key={l}
                        className="absolute w-6 h-6 rounded-md border border-white/[0.07] flex items-center justify-center text-[10px] font-black text-white/[0.08] select-none"
                        style={{ top: `${52 + i * 20}px`, right: `${12 + (i % 2) * 22}px` }}
                      >
                        {l}
                      </span>
                    ))}
                  </>
                }
              />
            </div>

            {error && (
              <div className="relative z-10 bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-3 text-center">
                {error}
              </div>
            )}

            {queueState === "idle" ? (
              <div className="relative z-10 mt-auto space-y-3">
                {/* STATS BAR */}
                <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  {[
                    { icon: Zap, iconClass: "text-amber-400 fill-amber-400", value: "+25", label: "Rating Points", valueClass: "text-amber-300" },
                    { icon: Timer, iconClass: "text-[#C9A2FF]", value: "15 Min", label: "Match Duration", valueClass: "text-white" },
                    { icon: Star, iconClass: "text-emerald-400 fill-emerald-400", value: "+100 XP", label: "Experience", valueClass: "text-emerald-300" },
                  ].map((s, i) => (
                    <div key={s.label} className={`flex items-center justify-center gap-2 px-2 py-3 ${i > 0 ? "border-l border-white/10" : ""}`}>
                      <s.icon size={16} className={`shrink-0 ${s.iconClass}`} />
                      <div className="leading-tight">
                        <div className={`font-mono font-bold text-sm ${s.valueClass}`}>{s.value}</div>
                        <div className="text-[8px] uppercase tracking-wider text-white/40 font-semibold">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* STREAK CARDS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
                        <Flame size={13} className="text-orange-400 fill-orange-400" /> Daily Streak
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono font-black text-white text-lg leading-none">{dailyStreak}</span>
                        <span className="text-[9px] text-white/40 uppercase">Days</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StreakDots count={dailyStreak} color="#34d399" />
                      <span className="text-[8px] font-bold text-emerald-300">+100 XP</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
                        <Crown size={13} className="text-amber-400 fill-amber-400" /> Win Streak
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono font-black text-white text-lg leading-none">{winStreak}</span>
                        <span className="text-[9px] text-white/40 uppercase">Wins</span>
                      </div>
                    </div>
                    <StreakDots count={winStreak} color="#fbbf24" />
                  </div>
                </div>

                {/* JOIN MATCH BUTTON — unchanged */}
                <button
                  onClick={joinQueue}
                  className="cosmo-btn-primary group/btn relative overflow-hidden w-full h-14 text-base font-bold tracking-wider uppercase rounded-2xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-white border border-white/20"
                  style={{
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none" />
                  <Swords size={20} className="relative z-10 transition-transform duration-200 group-hover/btn:rotate-[-12deg]" />
                  <span className="relative z-10">join match</span>
                </button>

                {/* FOOTER TIP */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                  <Code2 size={13} className="text-white/40" />
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
                  <p className="font-mono font-bold text-white text-base mt-1 group-hover:text-emerald-300 transition-colors">{stats?.avgTime ?? "4m15s"}</p>
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
