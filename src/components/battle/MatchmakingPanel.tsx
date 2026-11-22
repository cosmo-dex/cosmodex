/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArenaSocket } from "@/lib/arenaWsClient";
import { Swords, Flame, Terminal, ListChecks, Trophy, Zap, Clock, Timer, Award, CheckCircle2, XCircle, Sparkles } from "lucide-react";

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
  eventId?: string | null;
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
  eventId?: string | null;
  allowedModes?: ('code' | 'mcq')[];
  isEventContext?: boolean;
}

function getRankLabel(experienceLevel: string | null | undefined): string {
  if (experienceLevel === "Advanced") return "Commander";
  if (experienceLevel === "Intermediate") return "Explorer";
  return "Initiate";
}

const IS_BATTLE_LEADERBOARD_LIVE = true;
const IS_CODE_BATTLE_LIVE = true;
const DEFAULT_ALLOWED_MODES: Mode[] = ['code', 'mcq'];

export default function MatchmakingPanel({
  socket,
  userId,
  username,
  onMatchFound,
  eventId,
  allowedModes = DEFAULT_ALLOWED_MODES,
  isEventContext = false,
}: Props) {
  const [userSelectedMode, setUserSelectedMode] = useState<Mode | null>(null);
  const mode: Mode = (userSelectedMode && allowedModes.includes(userSelectedMode))
    ? userSelectedMode
    : (allowedModes.includes('mcq') ? 'mcq' : (allowedModes[0] || 'code'));
  const setMode = setUserSelectedMode;
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
  const [cancelledByOpponent, setCancelledByOpponent] = useState(false);

  const onMatchFoundRef = useRef(onMatchFound);
  const hasTransitionedRef = useRef(false);
  const matchPayloadRef = useRef<MatchInfo | null>(null);
  const cancelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound;
  }, [onMatchFound]);

  useEffect(() => {
    matchPayloadRef.current = matchPayload;
  }, [matchPayload]);

  const fetchStats = useCallback(() => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
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
    const interval = setInterval(fetchStats, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStats]);

  useEffect(() => {
    const fetchLeaderboard = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetch(`/api/battle/leaderboard?mode=${mode}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setLeaderboard(data))
        .catch(() => setLeaderboard([]));
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLeaderboard();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mode]);

  useEffect(() => {
    if (!socket?.connected) return;
    const statusPayload = eventId ? { eventId } : {};
    socket.emit("queue_status", statusPayload);
    const interval = setInterval(() => {
      if (socket?.connected) {
        socket.emit("queue_status", statusPayload);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [socket, socket?.connected, eventId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket?.connected && userId) {
        socket.emit("leave_queue", {
          mode,
          eventId: eventId ?? null,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket, userId, mode, eventId]);

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (payload: MatchInfo) => {
      setCancelledByOpponent(false);
      setMatchPayload(payload);
      matchPayloadRef.current = payload;
      setIsReady(false);
      setOpponentReady(false);
      setOpponent({
        username: payload.opponentUsername,
        elo: payload.opponentElo,
        avatar: payload.opponentAvatar || undefined,
      });
      setPhase("MATCH_FOUND");
      setQueueState("matched");
      socket.emit("join_room", { roomId: payload.roomId });
    };

    const handlePlayerReadyUpdate = (data: { readyUserIds?: string[]; allReady?: boolean }) => {
      if (data?.readyUserIds && matchPayloadRef.current) {
        if (data.readyUserIds.includes(matchPayloadRef.current.opponentId)) {
          setOpponentReady(true);
        }
        if (data.readyUserIds.includes(userId)) {
          setIsReady(true);
        }
      }
    };

    const handleMatchStart = () => {
      const payload = matchPayloadRef.current;
      if (payload && !hasTransitionedRef.current) {
        hasTransitionedRef.current = true;
        onMatchFoundRef.current(payload);
      }
    };

    const handleMatchCancelled = (data?: { cancelledBy?: string }) => {
      if (data?.cancelledBy && data.cancelledBy === userId) {
        return;
      }
      setCancelledByOpponent(true);
      setIsReady(false);
      setOpponentReady(false);
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current);
      }
      cancelTimeoutRef.current = setTimeout(() => {
        setCancelledByOpponent(false);
        setQueueState("idle");
        setPhase("SEARCHING");
        setOpponent(null);
        setMatchPayload(null);
        matchPayloadRef.current = null;
        hasTransitionedRef.current = false;
      }, 2500);
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
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current);
        cancelTimeoutRef.current = null;
      }
      setQueueState("idle");
      setPhase("SEARCHING");
      setOpponent(null);
      setMatchPayload(null);
      matchPayloadRef.current = null;
      setIsReady(false);
      setOpponentReady(false);
    };

    const handleError = (err: { message: string }) => {
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current);
        cancelTimeoutRef.current = null;
      }
      setError(err.message);
      setQueueState("idle");
      setPhase("SEARCHING");
      setIsReady(false);
      setOpponentReady(false);
    };

    socket.on("match_found", handleMatchFound);
    socket.on("player_ready_update", handlePlayerReadyUpdate);
    socket.on("match_start", handleMatchStart);
    socket.on("match_cancelled", handleMatchCancelled);
    socket.on("queue_status", handleQueueStatus);
    socket.on("queue_joined", handleQueueJoined);
    socket.on("queue_left", handleLeft);
    socket.on("error", handleError);

    return () => {
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current);
        cancelTimeoutRef.current = null;
      }
      socket.off("match_found", handleMatchFound);
      socket.off("player_ready_update", handlePlayerReadyUpdate);
      socket.off("match_start", handleMatchStart);
      socket.off("match_cancelled", handleMatchCancelled);
      socket.off("queue_status", handleQueueStatus);
      socket.off("queue_joined", handleQueueJoined);
      socket.off("queue_left", handleLeft);
      socket.off("error", handleError);
    };
  }, [socket, userId]);


  const joinQueue = () => {
    // Guard against duplicate queue submissions
    if (queueState === "queuing" || queueState === "matched") {
      return;
    }

    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }
    setCancelledByOpponent(false);
    if (!socket) {
      setError("Not connected to arena. Reconnecting...");
      return;
    }

    if (!socket.connected) {
      setError("Not connected to arena. Reconnecting...");
      // Continuing to show UI queuing state anyway
    }
    setError(null);
    hasTransitionedRef.current = false;
    setIsReady(false);
    setOpponentReady(false);
    setOpponent(null);
    setMatchPayload(null);
    matchPayloadRef.current = null;
    setQueueState("queuing");
    setPhase("SEARCHING");

    // Security: never send spoofable client userId; backend derives identity strictly from socket.data.userId
    socket.emit("join_queue", {
      mode,
      ...(eventId ? { eventId } : {}),
    });
  };

  const leaveQueue = () => {
    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }
    const currentPayload = matchPayloadRef.current;
    if (currentPayload && socket) {
      socket.emit("leave_match", { roomId: currentPayload.roomId });
    }
    setQueueState("idle");
    setPhase("SEARCHING");
    setOpponent(null);
    setMatchPayload(null);
    matchPayloadRef.current = null;
    setIsReady(false);
    setOpponentReady(false);
    setCancelledByOpponent(false);
    hasTransitionedRef.current = false;
    if (socket) {
      socket.emit("leave_queue", {
        mode,
        eventId: eventId ?? null,
      });
    }
  };

  const handleEnterBattle = () => {
    if (matchPayload) {
      setIsReady(true);
      // Security: roomId only; backend derives userId strictly from socket.data.userId
      socket?.emit("match_ready", { roomId: matchPayload.roomId });
    }
  };

  const isCode = mode === "code";
  const isMcqAllowed = allowedModes.includes("mcq");
  const isCodeAllowed = allowedModes.includes("code");
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

        {/* ── 2. CENTER & MATCHMAKING HUB: MODE SELECTION & JOIN MATCH (DOUBLE WIDTH) ── */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px]">
            <div className="absolute inset-0 ring-inset rounded-[20px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#9E00F6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#00FFE9]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <Swords className="text-[#FFA249] fill-[#FFA249] shrink-0" size={24} />
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white">Find a Match</h3>
              </div>
              <span className="text-[11px] sm:text-xs text-white/60 font-medium">Select battle mode & jump into 1v1 arena</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 relative z-10 flex-1 items-stretch">
              <button
                id="battle-mode-mcq"
                onClick={() => {
                  if (isMcqAllowed) setMode("mcq");
                }}
                disabled={queueState === "queuing" || !isMcqAllowed}
                className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${!isCode && isMcqAllowed
                  ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/20 to-[#8D37D6]/30 border-[#E873C3]/50 shadow-[0_0_18px_rgba(232,115,195,0.3)]"
                  : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border transition-all ${!isCode && isMcqAllowed
                    ? "bg-[#E873C3]/20 border-[#E873C3]/40 text-white"
                    : "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                    }`}>
                    <ListChecks size={24} />
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${!isMcqAllowed
                    ? "bg-white/5 text-white/40 border-white/10"
                    : !isCode
                    ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
                    : "bg-white/10 text-white/60 border-white/15"
                    }`}>
                    {!isMcqAllowed ? "NOT ALLOWED" : !isCode ? "Quiz Arena" : "Quiz"}
                  </span>
                </div>

                <div className="mt-3 w-full relative z-10">
                  <p className={`text-base sm:text-lg font-display font-bold tracking-wide ${!isCode && isMcqAllowed ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                    MCQ Battle
                  </p>
                  <p className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-snug ${!isCode && isMcqAllowed ? "text-white/80" : "text-white/60 group-hover:text-white/80"}`}>
                    Rapid 5-round multiple-choice quiz arena
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{!isMcqAllowed ? "Mode disabled in this event" : (queueCounts.mcq > 0 ? `${queueCounts.mcq} in queue` : 'Queue open')}</span>
                  </div>
                </div>
              </button>

              <button
                id="battle-mode-code"
                onClick={() => {
                  if (IS_CODE_BATTLE_LIVE && isCodeAllowed) {
                    setMode("code");
                  }
                }}
                disabled={queueState === "queuing" || !isCodeAllowed}
                className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${!isCodeAllowed
                  ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                  : !IS_CODE_BATTLE_LIVE
                  ? "border-white/15 bg-white/5 hover:border-amber-400/40"
                  : isCode
                    ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/20 to-[#8D37D6]/30 border-[#E873C3]/50 shadow-[0_0_18px_rgba(232,115,195,0.3)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${!isCodeAllowed
                      ? "bg-white/5 border-white/10 text-white/40"
                      : !IS_CODE_BATTLE_LIVE
                      ? "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                      : isCode
                        ? "bg-[#E873C3]/20 border-[#E873C3]/40 text-white"
                        : "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                      }`}
                  >
                    <Terminal size={24} />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${!isCodeAllowed
                      ? "bg-white/5 text-white/40 border-white/10"
                      : !IS_CODE_BATTLE_LIVE
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                      : isCode
                        ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
                        : "bg-white/10 text-white/60 border-white/15"
                      }`}
                  >
                    {!isCodeAllowed ? "NOT ALLOWED" : !IS_CODE_BATTLE_LIVE ? "LIVE SOON" : isCode ? "1v1 Duel" : "1v1"}
                  </span>
                </div>

                <div className="mt-3 w-full relative z-10">
                  <p
                    className={`text-base sm:text-lg font-display font-bold tracking-wide ${isCode && isCodeAllowed && IS_CODE_BATTLE_LIVE ? "text-white" : "text-white/90 group-hover:text-white"
                      }`}
                  >
                    Code Battle
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-snug ${isCode && isCodeAllowed && IS_CODE_BATTLE_LIVE ? "text-white/80" : "text-white/60 group-hover:text-white/80"
                      }`}
                  >
                    1v1 Speed algorithmic coding duel
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{!isCodeAllowed ? "Mode disabled in this event" : !IS_CODE_BATTLE_LIVE ? "Live Soon • Season 2 Launch" : (queueCounts.code > 0 ? `${queueCounts.code} in queue` : 'Queue open')}</span>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-3 text-center relative z-10">
                {error}
              </div>
            )}

            {queueState === "idle" && (
              <div className="relative z-10 mb-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-around text-xs text-white/80 font-mono">
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-amber-300">{isEventContext || Boolean(eventId) ? "Event Pts" : "±ELO"}</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-amber-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      {isEventContext || Boolean(eventId) ? "Rating Stake: Event Standings (Global ELO Protected)" : "Rating Stake: Dynamic ELO (K=32)"}
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-amber-400/30 rotate-45 -mt-1" />
                  </div>
                </div>

                <div className="h-3 w-[1px] bg-white/10" />

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
                  <span className="font-bold text-emerald-300">{isEventContext || Boolean(eventId) ? "+Rank" : "+ELO"}</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-emerald-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      {isEventContext || Boolean(eventId) ? "Victory Reward: Event Win & Standings Points" : "Victory Reward: Dynamic ELO Rating Gain"}
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
                    id="battle-join-btn"
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
              </div>
            )}

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
                  cancelledByOpponent={cancelledByOpponent}
                  onEnterBattle={handleEnterBattle}
                  onCancel={leaveQueue}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 3. RIGHT SECTION: BATTLE STATS & QUADRANT DOSSIER ──────────────── */}
        <div id="battle-stats-panel" className="lg:col-span-3 flex flex-col h-full">
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
              <div id="battle-pro-tips" className="bg-white/[0.04] rounded-2xl p-3.5 sm:p-4 hover:bg-white/[0.07] transition-all duration-200">
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
