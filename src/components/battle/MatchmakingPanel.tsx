"use client";

import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { Swords, Flame, Terminal, ListChecks } from "lucide-react";

import MatchmakingCinematic from "@/components/battle/MatchmakingCinematic";

type Mode = "code" | "mcq";
type QueueState = "idle" | "queuing" | "matched";
type CinematicPhase = "SEARCHING" | "MATCH_FOUND";

interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  mode: Mode;
}

interface UserStats {
  username: string;
  level: number;
  experienceLevel: string;
  elo: number;
  mcqElo: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
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
  const [opponent, setOpponent] = useState<{ username: string; elo: number } | null>(null);
  const [matchPayload, setMatchPayload] = useState<MatchInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const onMatchFoundRef = useRef(onMatchFound);
  const hasTransitionedRef = useRef(false);

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound;
  }, [onMatchFound]);

  // Fetch player stats
  useEffect(() => {
    fetch("/api/user/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error("[MatchmakingPanel] stats error:", err));
  }, []);

  // Clean up queue status on window refresh / close / unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket?.connected && userId) {
        socket.emit("leave_queue", { userId });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket?.connected && userId && queueState === "queuing") {
        socket.emit("leave_queue", { userId });
      }
    };
  }, [socket, userId, queueState]);

  // Auto-transition into match arena after cinematic finishes (2.8 seconds)
  useEffect(() => {
    if (queueState === "matched" && matchPayload) {
      hasTransitionedRef.current = false;
      const autoJoinTimer = setTimeout(() => {
        if (!hasTransitionedRef.current) {
          hasTransitionedRef.current = true;
          onMatchFoundRef.current(matchPayload);
        }
      }, 2800);
      return () => clearTimeout(autoJoinTimer);
    }
  }, [queueState, matchPayload]);

  useEffect(() => {
    if (!socket) return;

    const handleJoined = () => {
      setQueueState("queuing");
      setPhase("SEARCHING");
      setError(null);
    };

    const handleMatchFound = (payload: MatchInfo) => {
      console.log("[MatchmakingPanel] Match found event:", payload);
      setMatchPayload(payload);
      setOpponent({
        username: payload.opponentUsername || "Opponent",
        elo: payload.opponentElo || 1000,
      });
      setPhase("MATCH_FOUND");
      setQueueState("matched");
    };

    const handleLeft = () => {
      setQueueState("idle");
      setPhase("SEARCHING");
      setOpponent(null);
      setMatchPayload(null);
    };

    const handleError = (err: { message: string }) => {
      console.log("[MatchmakingPanel] Error event:", err.message);
      if (err.message?.toLowerCase().includes("already in")) {
        // User was already registered in queue, force clean transition into queuing
        setQueueState("queuing");
        setPhase("SEARCHING");
        setError(null);
        return;
      }
      setError(err.message);
      setQueueState("idle");
      setPhase("SEARCHING");
    };

    const handleDisconnect = () => {
      setQueueState("idle");
      setPhase("SEARCHING");
      setOpponent(null);
      setMatchPayload(null);
      setError("Connection lost. Auto-dequeued from battle server.");
    };

    const handleConnect = () => {
      setError(null);
    };

    socket.on("connect", handleConnect);
    socket.on("queue_joined", handleJoined);
    socket.on("match_found", handleMatchFound);
    socket.on("queue_left", handleLeft);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("queue_joined", handleJoined);
      socket.off("match_found", handleMatchFound);
      socket.off("queue_left", handleLeft);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  const joinQueue = () => {
    if (!socket?.connected) {
      setError("Server not connected. Please wait a moment...");
      return;
    }
    setError(null);
    setQueueState("queuing");
    setPhase("SEARCHING");
    socket.emit("join_queue", { userId, mode });
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
  const eloColor = isCode ? "text-[#FFA249]" : "text-[#00FFE9]";

  return (
    <div className="cosmo-glass-panel w-full max-w-2xl mx-auto p-6 sm:p-8 relative overflow-hidden z-10">
      {/* Decorative inner gradient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#9E00F6]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-[#00FFE9]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Outer border glow ring */}
      <div className="absolute inset-0 ring-inset ring-2 ring-white/10 rounded-[20px] pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4 relative z-10">
        <Swords className="text-[#FFA249] drop-shadow-[0_0_8px_rgba(255,162,73,0.5)] shrink-0" size={20} />
        <div className="flex flex-col leading-tight">
          <h3 className="text-base font-display font-bold tracking-wider text-white">Find a Match</h3>
          <h4 className="text-[10px] font-display font-semibold tracking-wider text-white/50 uppercase mt-0.5 transition-colors duration-300">
            {isCode ? "Code Battle" : "MCQ Battle"}
          </h4>
        </div>
      </div>

      {/* Player Profile stats card layout */}
      <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 relative overflow-hidden group z-10">
        {/* Avatar (Leaderboard Pod-like Circular Glow) */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full p-[2px] relative overflow-hidden flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(158,0,246,0.3)] border border-white/10">
            {/* Code Mode Avatar Border */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[#FFA249] to-[#9E00F6] transition-opacity duration-500 ${isCode ? "opacity-100" : "opacity-0"
              }`} />

            {/* MCQ Mode Avatar Border */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[#00FFE9] to-[#2E3192] transition-opacity duration-500 ${!isCode ? "opacity-100" : "opacity-0"
              }`} />

            <div className="w-full h-full rounded-full bg-[#0c071f] flex items-center justify-center relative z-10">
              🥷
            </div>
          </div>
        </div>

        {/* Username and level */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white truncate text-lg">{username}</p>
            <span className="inline-flex items-center text-[#FFA249] font-bold text-[10px] px-2 py-0.5 rounded-full bg-[#FFA249]/10 border border-[#FFA249]/20">
              Lv.{stats?.level ?? 1}
            </span>
          </div>
          <p className="text-xs text-white/50 font-medium capitalize mt-0.5">
            Rank: {stats ? getRankLabel(stats.experienceLevel) : "Loading..."}
          </p>
        </div>

        {/* ELO & Streak info */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold leading-none mb-0.5">Rating</p>
            <p className={`font-mono text-sm font-black transition-colors duration-500 leading-none mt-1 ${eloColor}`}>
              {isCode ? stats?.elo ?? 1000 : stats?.mcqElo ?? 1000} <span className="text-white/40 text-[9px] font-bold">ELO</span>
            </p>
          </div>
          {stats && stats.currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full mt-1 animate-pulse">
              <Flame size={10} fill="currentColor" /> {stats.currentStreak} Streak
            </span>
          )}
        </div>
      </div>

      {/* Mode Selection Buttons (Taller and Enhanced) */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <button
          onClick={() => setMode("code")}
          disabled={queueState === "queuing"}
          className={`relative h-28 flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${isCode
            ? "border-[#9E00F6] bg-[#9E00F6]/10 shadow-[0_0_20px_rgba(158,0,246,0.25)]"
            : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15"
            }`}
        >
          {/* Background decoration code snippet */}
          <div className="absolute top-2 right-2 font-mono text-[7px] text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors duration-300 leading-tight">
            {"func main() {\n  solve();\n}"}
          </div>

          <div className={`p-2 rounded-xl transition-all duration-300 ${isCode ? "bg-[#9E00F6]/20 text-[#FFA249]" : "bg-white/5 text-white/40 group-hover:text-white/60"
            }`}>
            <Terminal size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-white tracking-wide">Code Battle</p>
            <p className="text-[10px] text-white/40 mt-0.5 group-hover:text-white/50 font-medium">Solve coding tasks 1v1</p>
          </div>
        </button>

        <button
          onClick={() => setMode("mcq")}
          disabled={queueState === "queuing"}
          className={`relative h-28 flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${!isCode
            ? "border-[#00FFE9] bg-[#00FFE9]/10 shadow-[0_0_20px_rgba(0,255,233,0.2)]"
            : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15"
            }`}
        >
          {/* Background decoration check circles */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 select-none pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <div className="w-2 h-2 rounded-full border border-white" />
            <div className="w-2 h-2 rounded-full border border-white bg-white" />
            <div className="w-2 h-2 rounded-full border border-white" />
          </div>

          <div className={`p-2 rounded-xl transition-all duration-300 ${!isCode ? "bg-[#00FFE9]/20 text-[#00FFE9]" : "bg-white/5 text-white/40 group-hover:text-white/60"
            }`}>
            <ListChecks size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-white tracking-wide">MCQ Battle</p>
            <p className="text-[10px] text-white/40 mt-0.5 group-hover:text-white/50 font-medium">Speed questions challenge</p>
          </div>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-3 rounded-xl text-sm mb-5 shadow-lg flex items-center justify-center gap-2 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          {error}
        </div>
      )}

      {queueState === "idle" && (
        <div className="w-full flex justify-center mt-2 relative z-10">
          <button
            onClick={joinQueue}
            className={`w-full h-14 text-[15px] font-bold tracking-wider uppercase rounded-2xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-white bg-gradient-to-r border border-white/5 ${isCode
              ? "from-[#ff2d78] to-[#9b30ff]"
              : "from-[#00FFE9] to-[#2E3192]"
              }`}
            style={{
              fontFamily: "var(--font-body), 'Fira Code', monospace",
              boxShadow: "none"
            }}
          >
            Join Match Queue
          </button>
        </div>
      )}

      {(queueState === "queuing" || queueState === "matched") && (
        <MatchmakingCinematic
          username={username}
          userElo={isCode ? stats?.elo : stats?.mcqElo}
          phase={phase}
          opponent={opponent}
          onEnterBattle={handleEnterBattle}
          onCancel={leaveQueue}
        />
      )}
    </div>
  );
}
