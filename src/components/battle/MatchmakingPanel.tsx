/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
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

export default function MatchmakingPanel({ socket, userId, username, onMatchFound }: Props) {
  const [mode, setMode] = useState<Mode>("code");
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const [phase, setPhase] = useState<CinematicPhase>("SEARCHING");
  const [opponent, setOpponent] = useState<{ username: string; elo: number; avatar?: string } | null>(null);
  const [matchPayload, setMatchPayload] = useState<MatchInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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

  const totalBattles = stats ? (stats.wins + stats.losses + stats.draws) : 0;
  const winRate = totalBattles > 0 ? Math.round((stats!.wins / totalBattles) * 100) : 0;

  const matchHistory = (stats?.recentMatches && stats.recentMatches.length > 0)
    ? stats.recentMatches.slice(0, 2)
    : [
      { id: "1", eloChange: "+25", time: "3m30s", isWin: true },
      { id: "2", eloChange: "-15", time: "2m15s", isWin: false },
    ];

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
                  {top3.map((entry, i) => {
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
                  })}

                  {/* If user is NOT in Top 3, show dots + 4th item for current user */}
                  {!isUserInTop3 && (
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
                  {matchHistory.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        {m.isWin ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs group-hover:text-emerald-300 transition-colors">
                            <CheckCircle2 size={14} className="fill-emerald-400 text-[#0d0f1d]" /> Win
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
                  ))}
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
              {/* Code Battle Mode Card */}
              <button
                onClick={() => setMode("code")}
                disabled={queueState === "queuing"}
                className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${isCode
                    ? "bg-gradient-to-br from-[#E873C3]/25 via-[#C453D6]/20 to-[#8D37D6]/30 border-[#E873C3]/50 shadow-[0_0_18px_rgba(232,115,195,0.3)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border transition-all ${isCode
                      ? "bg-[#E873C3]/20 border-[#E873C3]/40 text-white"
                      : "bg-white/10 border-white/10 text-white/70 group-hover:text-white"
                    }`}>
                    <Terminal size={24} />
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${isCode
                      ? "bg-[#E873C3]/30 text-white border-[#E873C3]/50 shadow-[0_0_8px_rgba(232,115,195,0.5)]"
                      : "bg-white/10 text-white/60 border-white/15"
                    }`}>
                    {isCode ? "1v1 Duel" : "1v1"}
                  </span>
                </div>

                <div className="mt-3 w-full relative z-10">
                  <p className={`text-base sm:text-lg font-display font-bold tracking-wide ${isCode ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                    Code Battle
                  </p>
                  <p className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-snug ${isCode ? "text-white/80" : "text-white/60 group-hover:text-white/80"}`}>
                    1v1 Speed algorithmic coding duel
                  </p>
                </div>
              </button>

              {/* MCQ Battle Mode Card */}
              <button
                onClick={() => setMode("mcq")}
                disabled={queueState === "queuing"}
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
                    }`}>
                    {!isCode ? "Quiz Arena" : "Quiz"}
                  </span>
                </div>

                <div className="mt-3 w-full relative z-10">
                  <p className={`text-base sm:text-lg font-display font-bold tracking-wide ${!isCode ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                    MCQ Battle
                  </p>
                  <p className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-snug ${!isCode ? "text-white/80" : "text-white/60 group-hover:text-white/80"}`}>
                    Rapid 5-round multiple-choice quiz arena
                  </p>
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
                {/* Rating Stake */}
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-amber-300">±25</span>

                  {/* Instant Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-amber-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      Rating Stake: Win +25 / Loss -15
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-amber-400/30 rotate-45 -mt-1" />
                  </div>
                </div>

                <div className="h-3 w-[1px] bg-white/10" />

                {/* Time Limit */}
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Timer size={14} className="text-white/80 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-white/90">15m</span>

                  {/* Instant Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      Match Limit: 15 minutes
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-white/20 rotate-45 -mt-1" />
                  </div>
                </div>

                <div className="h-3 w-[1px] bg-white/10" />

                {/* Winner XP */}
                <div className="relative flex items-center gap-1.5 cursor-pointer group/tip">
                  <Award size={14} className="text-emerald-400 fill-emerald-400 shrink-0 group-hover/tip:scale-110 transition-transform" />
                  <span className="font-bold text-emerald-300">+100 XP</span>

                  {/* Instant Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                    <span className="bg-[#120a26] text-emerald-300 font-sans text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      Winner XP: +100 XP
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#120a26] border-r border-b border-emerald-400/30 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
            )}

            {queueState === "idle" && (
              <div className="w-full relative z-10 mt-auto">
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
              </div>
            )}

            {(queueState === "queuing" || queueState === "matched") && (
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
