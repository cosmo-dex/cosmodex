/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArenaSocket } from "@/lib/arenaWsClient";
import {
  Swords,
  Flame,
  Terminal,
  ListChecks,
  Trophy,
  Zap,
  Clock,
  Timer,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  Brain,
  ChevronRight,
  Shield,
  Crown,
} from "lucide-react";

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

interface ModeStats {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  avgTime?: string;
  recentMatches: Array<{
    id: string;
    isWin: boolean;
    isDraw?: boolean;
    eloChange: string;
    time: string;
  }>;
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
  codeStats?: ModeStats;
  mcqStats?: ModeStats;
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
  socket: ArenaSocket | null;
  userId: string;
  username: string;
  onMatchFound: (info: MatchInfo) => void;
}

function getRankLabel(experienceLevel: string | null | undefined, elo: number = 1000): string {
  if (elo >= 1500) return "GOLD III";
  if (elo >= 1300) return "GOLD II";
  if (elo >= 1100) return "GOLD I";
  if (experienceLevel === "Advanced") return "COMMANDER";
  if (experienceLevel === "Intermediate") return "EXPLORER";
  return "INITIATE";
}

const IS_BATTLE_LEADERBOARD_LIVE = false;
const IS_CODE_BATTLE_LIVE = false;

export default function MatchmakingPanel({ socket, userId, username, onMatchFound }: Props) {
  const [mode, setMode] = useState<Mode>("mcq");
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const [phase, setPhase] = useState<CinematicPhase>("SEARCHING");
  const [opponent, setOpponent] = useState<{ username: string; elo: number; avatar?: string } | null>(null);
  const [matchPayload, setMatchPayload] = useState<MatchInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [queueCounts, setQueueCounts] = useState<{ code: number; mcq: number; total: number }>({ code: 0, mcq: 0, total: 0 });

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

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch(`/api/battle/leaderboard?mode=${mode}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setLeaderboard(data))
        .catch(() => setLeaderboard([]));
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (!socket?.connected) return;
    socket.emit("queue_status", {});
    const interval = setInterval(() => {
      if (socket?.connected) {
        socket.emit("queue_status", {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [socket, socket?.connected]);

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
      setIsReady(false);
      setOpponentReady(false);
      setOpponent({
        username: payload.opponentUsername,
        elo: payload.opponentElo,
        avatar: payload.opponentAvatar || undefined,
      });
      setPhase("MATCH_FOUND");
      setQueueState("matched");
    };

    const handlePlayerReadyUpdate = (data: { readyUserIds?: string[]; allReady?: boolean }) => {
      if (data?.readyUserIds && matchPayload) {
        if (data.readyUserIds.includes(matchPayload.opponentId)) {
          setOpponentReady(true);
        }
        if (data.readyUserIds.includes(userId)) {
          setIsReady(true);
        }
      }
    };

    const handleMatchStart = () => {
      console.log("[MatchmakingPanel] match_start received → entering battle!");
      if (matchPayload && !hasTransitionedRef.current) {
        hasTransitionedRef.current = true;
        onMatchFoundRef.current(matchPayload);
      }
    };

    const handleQueueStatus = (status: { status?: string; codeQueueLength?: number; mcqQueueLength?: number; totalInQueue?: number }) => {
      if (status.status === "queuing") setQueueState("queuing");
      if (typeof status.codeQueueLength === "number" || typeof status.mcqQueueLength === "number") {
        setQueueCounts({
          code: status.codeQueueLength ?? 0,
          mcq: status.mcqQueueLength ?? 0,
          total: status.totalInQueue ?? 0,
        });
      }
    };

    const handleQueueJoined = (data: { mode?: Mode; size?: number }) => {
      if (data?.mode && typeof data?.size === "number") {
        setQueueCounts((prev) => ({
          ...prev,
          [data.mode === "mcq" ? "mcq" : "code"]: data.size ?? 1,
        }));
      }
    };

    const handleLeft = () => {
      setQueueState("idle");
      setPhase("SEARCHING");
      setOpponent(null);
      setMatchPayload(null);
      setIsReady(false);
      setOpponentReady(false);
    };

    const handleError = (err: { message: string }) => {
      setError(err.message);
      setQueueState("idle");
      setPhase("SEARCHING");
      setIsReady(false);
      setOpponentReady(false);
    };

    socket.on("match_found", handleMatchFound);
    socket.on("player_ready_update", handlePlayerReadyUpdate);
    socket.on("match_start", handleMatchStart);
    socket.on("queue_status", handleQueueStatus);
    socket.on("queue_joined", handleQueueJoined);
    socket.on("queue_left", handleLeft);
    socket.on("error", handleError);

    return () => {
      socket.off("match_found", handleMatchFound);
      socket.off("player_ready_update", handlePlayerReadyUpdate);
      socket.off("match_start", handleMatchStart);
      socket.off("queue_status", handleQueueStatus);
      socket.off("queue_joined", handleQueueJoined);
      socket.off("queue_left", handleLeft);
      socket.off("error", handleError);
    };
  }, [socket, matchPayload, userId]);


  const joinQueue = () => {
    if (!socket?.connected) {
      setError("Not connected to arena. Reconnecting...");
      return;
    }
    setError(null);
    hasTransitionedRef.current = false;
    setIsReady(false);
    setOpponentReady(false);
    setQueueState("queuing");
    setPhase("SEARCHING");

    socket.emit("join_queue", { userId, mode });
  };

  const leaveQueue = () => {
    setQueueState("idle");
    setPhase("SEARCHING");
    setOpponent(null);
    setMatchPayload(null);
    setIsReady(false);
    setOpponentReady(false);
    socket?.emit("leave_queue", { userId });
  };

  const handleEnterBattle = () => {
    if (matchPayload) {
      setIsReady(true);
      socket?.emit("match_ready", { roomId: matchPayload.roomId, userId });
    }
  };

  const isCode = mode === "code";
  const activeModeStats = isCode ? stats?.codeStats : stats?.mcqStats;
  const currentElo = activeModeStats?.elo ?? (isCode ? (stats?.elo ?? 1000) : (stats?.mcqElo ?? 1000));

  const totalBattles = activeModeStats
    ? (activeModeStats.wins + activeModeStats.losses + activeModeStats.draws)
    : (stats ? (stats.wins + stats.losses + stats.draws) : 0);

  const modeWins = activeModeStats?.wins ?? stats?.wins ?? 0;
  const modeStreak = activeModeStats?.streak ?? stats?.streak ?? 0;
  const modeAvgTime = activeModeStats?.avgTime ?? stats?.avgTime ?? "—";
  const winRate = totalBattles > 0 ? Math.round((modeWins / totalBattles) * 100) : 0;

  const matchHistory = (activeModeStats?.recentMatches && activeModeStats.recentMatches.length > 0)
    ? activeModeStats.recentMatches.slice(0, 3)
    : (stats?.recentMatches && stats.recentMatches.length > 0 ? stats.recentMatches.slice(0, 3) : []);

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
                        {stats ? getRankLabel(stats.experienceLevel, currentElo) : "Initiate"}
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
                  {!IS_BATTLE_LEADERBOARD_LIVE ? (
                    <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live Soon
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Quadrant</span>
                  )}
                </div>

                {!IS_BATTLE_LEADERBOARD_LIVE ? (
                  <div className="bg-gradient-to-br from-[#1a0b2e]/60 to-white/[0.02] border border-amber-500/25 p-3 rounded-xl text-center shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                    <div className="flex items-center justify-center gap-1.5 text-amber-300 text-[11px] font-bold mb-1">
                      <Sparkles size={13} className="animate-pulse text-amber-400" />
                      <span>Leaderboard Will Be Live Soon</span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                      Season 1 rankings unlock at official launch. Battle now to calibrate your MMR!
                    </p>
                  </div>
                ) : (
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
                )}
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
                          <span className={`font-mono text-xs font-semibold ${m.isWin ? 'text-emerald-400' : (m.isDraw ? 'text-amber-400' : 'text-rose-400')}`}>
                            {m.eloChange ? `${m.eloChange} ELO` : ''}
                          </span>
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

        {/* ── 2. CENTER & MATCHMAKING HUB: HIGH-FIDELITY MATCH CARDS & ARENA CONTAINER (IMAGE 2 DESIGN) ── */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-[#0b0813]/90 backdrop-blur-2xl border border-[#231a34] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_50px_rgba(158,0,246,0.12)]">
            
            {/* Ambient Radial Lights */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#d946ef]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-5 gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef]/20 to-[#8b5cf6]/20 border border-[#d946ef]/40 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)] shrink-0">
                  <Swords className="text-[#d946ef]" size={22} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-wider text-white flex items-center gap-2">
                    FIND A MATCH
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-medium">
                    Choose your arena. Prove your skills.
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <div className="bg-[#0f1d18]/90 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>248 PLAYERS ONLINE</span>
                </div>

                <div className="bg-[#161026]/90 border border-[#d946ef]/30 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
                  <div className="w-7 h-7 rounded-lg bg-[#d946ef]/20 border border-[#d946ef]/40 flex items-center justify-center text-[#d946ef] shrink-0">
                    <Shield size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block leading-none mb-0.5">RATING</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-white">{currentElo}</span>
                      <span className="font-mono font-bold text-[10px] text-[#e873c3] tracking-wide uppercase">{getRankLabel(stats?.experienceLevel, currentElo)}</span>
                    </div>
                  </div>
                  <TrendingUp size={16} className="text-purple-400 ml-1 shrink-0" />
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 relative z-10 flex-1 items-stretch">
=======
            {/* Two Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5 relative z-10 flex-1 items-stretch">
              
              {/* CODE BATTLE CARD */}
              <button
                type="button"
                onClick={() => setMode("code")}
                disabled={queueState === "queuing"}
                className={`relative flex flex-col justify-between p-5 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${
                  isCode
                    ? "bg-gradient-to-br from-[#1c0e2e] via-[#150a24] to-[#0f071a] border-2 border-[#d946ef] shadow-[0_0_30px_rgba(217,70,239,0.35),inset_0_0_20px_rgba(217,70,239,0.15)]"
                    : "bg-[#110c1c]/80 border border-white/10 hover:border-white/25 hover:bg-[#161024]/90 shadow-lg"
                }`}
              >
                {/* Code Background Watermark */}
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.08] pointer-events-none text-white select-none overflow-hidden" viewBox="0 0 200 200" fill="none">
                  <text x="10" y="30" fontSize="10" fontFamily="monospace" fill="currentColor">int n;</text>
                  <text x="10" y="48" fontSize="10" fontFamily="monospace" fill="currentColor">cin &gt;&gt; n;</text>
                  <text x="10" y="66" fontSize="10" fontFamily="monospace" fill="currentColor">for(int i=0;i&lt;n;i++) &#123;</text>
                  <text x="30" y="84" fontSize="10" fontFamily="monospace" fill="currentColor">solve();</text>
                  <text x="10" y="102" fontSize="10" fontFamily="monospace" fill="currentColor">&#125;</text>
                  <text x="100" y="150" fontSize="68" fontFamily="monospace" fontWeight="bold" fill="currentColor">&#123; &#125;</text>
                </svg>

                {isCode && <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#d946ef]/20 rounded-full blur-xl pointer-events-none" />}

                {/* Card Top Row */}
                <div className="w-full flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-bold text-lg transition-all ${
                    isCode
                      ? "bg-[#d946ef]/20 border-[#d946ef]/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                      : "bg-white/5 border-white/10 text-white/60 group-hover:text-white group-hover:border-white/20"
                  }`}>
                    <Terminal size={22} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider uppercase transition-all ${
                      isCode
                        ? "bg-[#d946ef]/25 text-[#f472b6] border-[#d946ef]/50"
                        : "bg-white/5 text-white/50 border-white/10"
                    }`}>
                      1V1 DUEL
                    </span>

                    {isCode && (
                      <span className="bg-[#d946ef]/30 text-white border border-[#d946ef]/60 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />
                        SELECTED
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 mb-4">
                  <h4 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-wide uppercase">
                    CODE BATTLE
                  </h4>
                  <span className="text-[10px] font-bold tracking-widest text-[#c084fc] uppercase block mt-0.5">
                    ALGORITHM DUEL
                  </span>
                  <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed mt-2">
                    Solve coding challenges faster than your opponent.
                  </p>
                </div>

                {/* Card Bottom Features */}
                <div className="grid grid-cols-2 gap-2 w-full relative z-10 pt-3 border-t border-white/5">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Trophy size={14} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-white uppercase block leading-none">SPEED</span>
                      <span className="text-[9px] text-white/50 truncate block mt-0.5">First to solve wins</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <BarChart3 size={14} className="text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-white uppercase block leading-none">RANKED</span>
                      <span className="text-[9px] text-white/50 truncate block mt-0.5">Gain rating</span>
                    </div>
                  </div>
                </div>
              </button>


              {/* MCQ BATTLE CARD */}
>>>>>>> 43f1ce3 (feat: redesign battle mode cards with premium neon UI)
              <button
                type="button"
                onClick={() => setMode("mcq")}
                disabled={queueState === "queuing"}
<<<<<<< HEAD
                className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${!isCode
                  ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/20 to-[#8D37D6]/30 border-[#E873C3]/50 shadow-[0_0_18px_rgba(232,115,195,0.3)]"
                  : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border transition-all ${!isCode
                    ? "bg-[#E873C3]/20 border-[#E873C3]/40 text-white"
                    : "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                    }`}>
                    <ListChecks size={24} />
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${!isCode
                    ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
                    : "bg-white/10 text-white/60 border-white/15"
=======
                className={`relative flex flex-col justify-between p-5 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${
                  !isCode
                    ? "bg-gradient-to-br from-[#1c0e2e] via-[#150a24] to-[#0f071a] border-2 border-[#d946ef] shadow-[0_0_30px_rgba(217,70,239,0.35),inset_0_0_20px_rgba(217,70,239,0.15)]"
                    : "bg-[#110c1c]/80 border border-white/10 hover:border-white/25 hover:bg-[#161024]/90 shadow-lg"
                }`}
              >
                {/* MCQ Background Watermark */}
                <svg className="absolute right-1 bottom-1 w-36 h-36 opacity-[0.08] pointer-events-none text-white select-none" viewBox="0 0 100 100" fill="none">
                  <rect x="55" y="10" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                  <text x="63" y="29" fontSize="13" fontWeight="bold" fill="currentColor">A</text>
                  
                  <rect x="68" y="42" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                  <text x="76" y="61" fontSize="13" fontWeight="bold" fill="currentColor">B</text>

                  <rect x="25" y="35" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                  <text x="33" y="54" fontSize="13" fontWeight="bold" fill="currentColor">C</text>

                  <rect x="38" y="68" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                  <text x="46" y="87" fontSize="13" fontWeight="bold" fill="currentColor">D</text>
                </svg>

                {!isCode && <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#d946ef]/20 rounded-full blur-xl pointer-events-none" />}

                {/* Card Top Row */}
                <div className="w-full flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-bold text-lg transition-all ${
                    !isCode
                      ? "bg-[#d946ef]/20 border-[#d946ef]/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                      : "bg-white/5 border-white/10 text-white/60 group-hover:text-white group-hover:border-white/20"
                  }`}>
                    <ListChecks size={22} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider uppercase transition-all ${
                      !isCode
                        ? "bg-sky-500/25 text-sky-300 border-sky-500/50"
                        : "bg-white/5 text-white/50 border-white/10"
>>>>>>> 43f1ce3 (feat: redesign battle mode cards with premium neon UI)
                    }`}>
                      QUIZ
                    </span>

                    {!isCode && (
                      <span className="bg-[#d946ef]/30 text-white border border-[#d946ef]/60 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />
                        SELECTED
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 mb-4">
                  <h4 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-wide uppercase">
                    MCQ BATTLE
                  </h4>
                  <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase block mt-0.5">
                    KNOWLEDGE DUEL
                  </span>
                  <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed mt-2">
                    Answer multiple-choice questions across 5 intense rounds.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{queueCounts.mcq > 0 ? `${queueCounts.mcq} in queue` : 'Queue open'}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (IS_CODE_BATTLE_LIVE) {
                    setMode("code");
                  }
                }}
                disabled={queueState === "queuing"}
                className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${!IS_CODE_BATTLE_LIVE
                  ? "border-white/15 bg-white/5 hover:border-amber-400/40"
                  : isCode
                    ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/20 to-[#8D37D6]/30 border-[#E873C3]/50 shadow-[0_0_18px_rgba(232,115,195,0.3)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${!IS_CODE_BATTLE_LIVE
                      ? "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                      : isCode
                        ? "bg-[#E873C3]/20 border-[#E873C3]/40 text-white"
                        : "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                      }`}
                  >
                    <Terminal size={24} />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${!IS_CODE_BATTLE_LIVE
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                      : isCode
                        ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
                        : "bg-white/10 text-white/60 border-white/15"
                      }`}
                  >
                    {!IS_CODE_BATTLE_LIVE ? "LIVE SOON" : isCode ? "1v1 Duel" : "1v1"}
                  </span>
                </div>

                <div className="mt-3 w-full relative z-10">
                  <p
                    className={`text-base sm:text-lg font-display font-bold tracking-wide ${isCode && IS_CODE_BATTLE_LIVE ? "text-white" : "text-white/90 group-hover:text-white"
                      }`}
                  >
                    Code Battle
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-snug ${isCode && IS_CODE_BATTLE_LIVE ? "text-white/80" : "text-white/60 group-hover:text-white/80"
                      }`}
                  >
                    1v1 Speed algorithmic coding duel
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{!IS_CODE_BATTLE_LIVE ? "Live Soon • Season 2 Launch" : (queueCounts.code > 0 ? `${queueCounts.code} in queue` : 'Queue open')}</span>
                  </div>
                </div>

                {/* Card Bottom Features */}
                <div className="grid grid-cols-2 gap-2 w-full relative z-10 pt-3 border-t border-white/5">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Brain size={14} className="text-sky-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-white uppercase block leading-none">5 ROUNDS</span>
                      <span className="text-[9px] text-white/50 truncate block mt-0.5">Multiple topics</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Users size={14} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-white uppercase block leading-none">RAPID FIRE</span>
                      <span className="text-[9px] text-white/50 truncate block mt-0.5">Think. Click. Win.</span>
                    </div>
                  </div>
                </div>
              </button>

            </div>


            {/* Middle Stats Bar */}
            {queueState === "idle" && (
              <div className="relative z-10 mb-5 bg-[#120d22]/90 border border-white/10 rounded-2xl py-3 px-4 flex items-center justify-around text-xs font-mono shadow-inner">
                <div className="flex items-center gap-2 cursor-pointer group/tip">
                  <Zap size={16} className="text-amber-400 fill-amber-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                    <span className="font-mono font-black text-amber-300 text-sm sm:text-base">+25</span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest font-sans font-bold">RATING POINTS</span>
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/10" />

                <div className="flex items-center gap-2 cursor-pointer group/tip">
                  <Timer size={16} className="text-sky-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                    <span className="font-mono font-black text-white text-sm sm:text-base">15 MIN</span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest font-sans font-bold">MATCH DURATION</span>
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/10" />

                <div className="flex items-center gap-2 cursor-pointer group/tip">
                  <Award size={16} className="text-emerald-400 fill-emerald-400/30 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                    <span className="font-mono font-black text-emerald-300 text-sm sm:text-base">+100 XP</span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest font-sans font-bold">EXPERIENCE</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-3 text-center relative z-10">
                {error}
              </div>
            )}

            {/* Bottom Row (Daily Streak + Find Opponent Button + Win Streak) */}
            {queueState === "idle" && (
<<<<<<< HEAD
              <div className="relative z-10 mb-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-around text-xs text-white/80 font-mono">
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-amber-300">±ELO</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-amber-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      Rating Stake: Dynamic ELO (K=32)
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-amber-400/30 rotate-45 -mt-1" />
=======
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center relative z-10">
                
                {/* Daily Streak Box */}
                <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between h-full hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Flame size={15} className="text-orange-500 fill-orange-500 shrink-0" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider font-sans truncate">DAILY STREAK</span>
                    </div>
                    <span className="text-xs font-mono font-black text-white shrink-0">{stats?.streak ?? 7} DAYS</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-300 font-bold">✓</span>
                    <div className="h-[2px] w-2 bg-emerald-400/50" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-300 font-bold">✓</span>
                    <div className="h-[2px] w-2 bg-emerald-400/50" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-300 font-bold">✓</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 ml-auto">+100 XP</span>
>>>>>>> 43f1ce3 (feat: redesign battle mode cards with premium neon UI)
                  </div>
                </div>

                {/* Big Action Button */}
                <div className="md:col-span-6">
                  <button
                    type="button"
                    onClick={joinQueue}
                    className="group w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#e873c3] via-[#c453d6] to-[#8d37d6] hover:from-[#f472b6] hover:via-[#d946ef] hover:to-[#a855f7] border border-white/25 shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:shadow-[0_0_45px_rgba(217,70,239,0.75)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-between text-white"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                      <Swords size={20} className="text-white" />
                    </div>

<<<<<<< HEAD
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Timer size={14} className="text-white/80 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-white/90">{isCode ? "15m" : "5 Rds"}</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {isCode ? "Match Limit: 15 minutes" : "Match Limit: 5 rapid rounds"}
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-white/20 rotate-45 -mt-1" />
                  </div>
                </div>

                <div className="h-3 w-[1px] bg-white/10" />

                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Award size={14} className="text-emerald-400 fill-emerald-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-emerald-300">+ELO</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-emerald-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      Victory Reward: Dynamic ELO Rating Gain
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-emerald-400/30 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
            )}

            {queueState === "idle" && (
              <div className="w-full relative z-10 mt-auto">
                {isCode && !IS_CODE_BATTLE_LIVE ? (
                  <button
                    disabled
                    className="w-full h-14 text-sm font-bold tracking-wider uppercase rounded-2xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Code Battle Will Be Live Soon</span>
                  </button>
                ) : (
                  <button
                    onClick={joinQueue}
                    className="cosmo-btn-primary w-full h-14 text-base font-bold tracking-wider uppercase rounded-2xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-white border border-white/20"
                    style={{
                      fontFamily: "var(--font-body), 'Fira Code', monospace",
                    }}
                  >
                    <Swords size={20} />
                    join match
                  </button>
                )}
=======
                    <div className="text-center px-2">
                      <span className="text-base sm:text-lg font-black font-display tracking-wider uppercase block leading-none">
                        FIND OPPONENT
                      </span>
                      <span className="text-[10px] text-white/80 font-medium normal-case tracking-normal block mt-1">
                        Enter the arena and get matched
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={20} className="text-white" />
                    </div>
                  </button>
                </div>

                {/* Win Streak Box */}
                <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between h-full hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Crown size={15} className="text-amber-400 fill-amber-400 shrink-0" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider font-sans truncate">WIN STREAK</span>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-300 shrink-0">{stats?.wins ?? 3} WINS</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/30 border border-amber-400 flex items-center justify-center text-[8px] text-amber-300 font-bold">✓</span>
                    <div className="h-[2px] w-2 bg-amber-400/50" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/30 border border-amber-400 flex items-center justify-center text-[8px] text-amber-300 font-bold">✓</span>
                    <div className="h-[2px] w-2 bg-amber-400/50" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/30 border border-amber-400 flex items-center justify-center text-[8px] text-amber-300 font-bold">✓</span>
                    <div className="h-[2px] w-2 bg-white/20" />
                    <span className="w-3.5 h-3.5 rounded-full bg-white/5 border border-white/20" />
                  </div>
                </div>

>>>>>>> 43f1ce3 (feat: redesign battle mode cards with premium neon UI)
              </div>
            )}

            {/* Cinematic Queue Overlay */}
            {(queueState === "queuing" || queueState === "matched") && (
              <div className="relative z-10 my-auto">
                <MatchmakingCinematic
                  username={username}
                  userAvatar={stats?.avatarUrl}
                  userElo={currentElo}
                  phase={phase}
                  opponent={opponent}
                  isReady={isReady}
                  opponentReady={opponentReady}
                  onEnterBattle={handleEnterBattle}
                  onCancel={leaveQueue}
                />
              </div>
            )}

            {/* Footer Tip */}
            <div className="text-center text-[11px] text-white/40 font-mono mt-4 relative z-10">
              &lt;/&gt; Tip: Use shortcuts, stay calm, and code fast!
            </div>

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
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase font-bold">
                    {isCode ? "Code" : "MCQ"}
                  </span>
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
                    {modeStreak}
                  </p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between transition-all duration-200 hover:bg-white/10 hover:border-emerald-400/40 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)] hover:-translate-y-0.5 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                    <Clock size={14} className="text-emerald-400 fill-emerald-400/40 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Avg time</span>
                  </div>
                  <p className="font-mono font-bold text-white text-base mt-1 group-hover:text-emerald-300 transition-colors">
                    {modeAvgTime && modeAvgTime !== "—" ? modeAvgTime : "—"}
                  </p>
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
