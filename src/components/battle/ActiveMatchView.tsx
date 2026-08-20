'use client';

import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import Editor, { Monaco } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import { Starfield } from '../leaderboard/Starfield';

const STARTERS: Record<string, string> = {
  python: "# Write your solution here\n",
  java: 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Write your solution here\n  }\n}',
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // Write your solution here\n  return 0;\n}",
};

function getAvatar(name: string) {
  return (name || "?").charAt(0).toUpperCase();
}



const hearts = (n = 5, max = 5) =>
  Array.from({ length: max }, (_, i) => (
    <span key={i} className={`h ${i < n ? "" : "dead"}`}>
      ❤
    </span>
  ));

interface ProblemDetails {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  basePoints: number;
  testCases: { id: string; input: string; expected: string; isPublic: boolean }[];
}

const MOCK_PROBLEMS: Record<number, ProblemDetails> = {
  1: {
    id: "mock-stage-1",
    title: "Two Sum & Target Search",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "EASY",
    basePoints: 100,
    testCases: [
      { id: "tc1", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", isPublic: true },
      { id: "tc2", input: "nums = [3,2,4], target = 6", expected: "[1,2]", isPublic: true },
      { id: "tc3", input: "nums = [3,3], target = 6", expected: "[0,1]", isPublic: true },
    ],
  },
  2: {
    id: "mock-stage-2",
    title: "Valid Palindrome String",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    difficulty: "EASY",
    basePoints: 150,
    testCases: [
      { id: "tc1", input: 's = "A man, a plan, a canal: Panama"', expected: "true", isPublic: true },
      { id: "tc2", input: 's = "race a car"', expected: "false", isPublic: true },
    ],
  },
  3: {
    id: "mock-stage-3",
    title: "Longest Substring Without Repeating",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    difficulty: "MEDIUM",
    basePoints: 200,
    testCases: [
      { id: "tc1", input: 's = "abcabcbb"', expected: "3", isPublic: true },
      { id: "tc2", input: 's = "bbbbb"', expected: "1", isPublic: true },
    ],
  },
  4: {
    id: "mock-stage-4",
    title: "Container With Most Water",
    description: "You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    difficulty: "MEDIUM",
    basePoints: 250,
    testCases: [
      { id: "tc1", input: "height = [1,8,6,2,5,4,8,3,7]", expected: "49", isPublic: true },
      { id: "tc2", input: "height = [1,1]", expected: "1", isPublic: true },
    ],
  },
  5: {
    id: "mock-stage-5",
    title: "Binary Tree Maximum Path Sum",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge connecting them. Return the maximum path sum of any non-empty path.",
    difficulty: "HARD",
    basePoints: 350,
    testCases: [
      { id: "tc1", input: "root = [1,2,3]", expected: "6", isPublic: true },
      { id: "tc2", input: "root = [-10,9,20,null,null,15,7]", expected: "42", isPublic: true },
    ],
  },
  6: {
    id: "mock-stage-6",
    title: "BOSS: Cosmic Graph Matrix Optimization",
    description: "Solve the cosmic matrix node traversal problem with optimal time and space complexity to defeat the Boss and claim supreme victory in the Arena!",
    difficulty: "HARD",
    basePoints: 500,
    testCases: [
      { id: "tc1", input: "matrix = [[1,2],[3,4]]", expected: "24", isPublic: true },
      { id: "tc2", input: "matrix = [[0,1],[1,0]]", expected: "0", isPublic: true },
    ],
  },
};

interface CodePlayerState {
  status?: string;
  currentStage?: number;
  points?: number;
  lives?: number;
  currentDraft?: string;
  stageTimeRemaining?: number;
  submissionsCount?: number;
}

interface CodeMatchState {
  roomId?: string;
  currentStage?: number;
  stageTimeRemaining?: number;
  problems?: string[];
  playerIds?: string[];
  players?: Record<string, CodePlayerState>;
}

interface McqQuestion {
  category: string;
  difficulty: string;
  question: string;
  options: string[];
}

interface McqPlayerState {
  score?: number;
}

interface McqMatchState {
  currentRound?: number;
  status?: string;
  currentQuestion?: McqQuestion;
  players?: Record<string, McqPlayerState>;
  timeRemaining?: number;
}

interface RoundRevealData {
  correctIndex: number;
}

interface ExecResult {
  status?: string;
  passedCount?: number;
  totalCount?: number;
  pointsAwarded?: number;
  livesRemaining?: number;
  error?: string;
  stderr?: string;
  testCases?: { id?: string; input: string; expected: string; actual?: string; passed?: boolean; isPublic?: boolean }[];
}

interface RunResult {
  stdout?: string;
  stderr?: string;
  timedOut?: boolean;
}

interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  mode: 'code' | 'mcq';
}

interface Props {
  socket: Socket | null;
  matchInfo: MatchInfo;
  userId: string;
  username: string;
  onLeave: () => void;
}

export default function ActiveMatchView({ socket, matchInfo, userId, username, onLeave }: Props) {
  const isMcq = matchInfo.mode === 'mcq';

  // State for Code Battle
  const [codeState, setCodeState] = useState<CodeMatchState | null>(null);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);

  const [code, setCode] = useState(STARTERS.python);
  const [language, setLanguage] = useState('python');
  const [customStdin, setCustomStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState<ExecResult | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [waitingDecision, setWaitingDecision] = useState(false);
  const [decTimer, setDecTimer] = useState(0);
  const [waitTimer, setWaitTimer] = useState(0);

  const [leftWidth, setLeftWidth] = useState(40);
  const isDragging = useRef(false);

  // State for MCQ Battle
  const [mcqState, setMcqState] = useState<McqMatchState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [roundReveal, setRoundReveal] = useState<RoundRevealData | null>(null);

  // Live MCQ Question Round Countdown Timer (15s per question)
  const [mcqTimer, setMcqTimer] = useState(15);
  // Real-time Match Elapsed Timer
  const [matchElapsedSeconds, setMatchElapsedSeconds] = useState(0);

  // Match outcome
  const [matchResult, setMatchResult] = useState<{ winnerId: string | null; reason: string } | null>(null);
  const draftRestoredRef = useRef(false);


  // Drag resizer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  };

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    if (isMcq) {
      socket.emit('mcq_join_room', { roomId: matchInfo.roomId, userId });

      socket.on('mcq_room_state', (state: McqMatchState) => {
        setMcqState(state);
        if (state.status === 'ACTIVE') {
          setRoundReveal(null);
          if (typeof state.timeRemaining === 'number') {
            setMcqTimer(state.timeRemaining);
          }
        }
      });

      socket.on('mcq_round_reveal', (data: RoundRevealData) => {
        setRoundReveal(data);
      });

      socket.on('mcq_next_round', (state: McqMatchState) => {
        setMcqState(state);
        setRoundReveal(null);
        setSelectedAnswer(null);
        setMcqTimer(state.timeRemaining ?? 15);
      });

      socket.on('mcq_match_ended', (data: { winnerId: string | null; reason: string }) => {
        setMatchResult(data);

        setMcqState((latest) => {
          try {
            const myPlayer = latest?.players?.[userId];
            localStorage.setItem('cosmodex_match_result', JSON.stringify({
              points: myPlayer?.score ?? 0,
              livesLeft: 0,
              submissions: 0,
              opponentName: matchInfo.opponentUsername,
              myName: username,
              eloDelta: null,
              matchId: matchInfo.roomId,
              isWinner: data.winnerId === userId,
            }));
          } catch { /* ignore */ }
          return latest;
        });

        if (data.winnerId === userId) {
          setTimeout(() => { window.location.href = '/victory'; }, 1200);
        }
      });
    } else {
      socket.emit('join_room', { roomId: matchInfo.roomId, userId });

      socket.on('room_state_update', (state: CodeMatchState) => {
        setCodeState(state);
        const myPlayer = state.players?.[userId];

        // Restore current draft only once on join
        if (myPlayer?.currentDraft && !draftRestoredRef.current) {
          draftRestoredRef.current = true;
          setCode(myPlayer.currentDraft);
        }

        if (myPlayer?.status === 'WAITING_DECISION') {
          setWaitingDecision(true);
          setDecTimer((prev) => (prev > 0 ? prev : 15));
        } else {
          setWaitingDecision(false);
          setDecTimer(0);
        }
      });

      socket.on('submission_result', (result: ExecResult) => {
        setSubmitting(false);
        setExecResult(result);
      });

      socket.on('run_result', (res: RunResult) => {
        setRunning(false);
        setRunResult(res);
      });

      socket.on('opponent_completed_stage', () => {
        setWaitingDecision(true);
        setDecTimer(15);
      });

      socket.on('waiting_for_opponent', (data: { time: number }) => {
        setWaitTimer(data?.time || 15);
      });

      socket.on('match_ended', (data: { winnerId: string | null; reason: string }) => {
        setMatchResult(data);

        // Persist result for victory page
        setCodeState((latest) => {
          const myPlayer = latest?.players?.[userId];
          try {
            localStorage.setItem('cosmodex_match_result', JSON.stringify({
              points: myPlayer?.points ?? 0,
              livesLeft: myPlayer?.lives ?? 0,
              submissions: myPlayer?.submissionsCount ?? 0,
              opponentName: matchInfo.opponentUsername,
              myName: username,
              eloDelta: null,
              matchId: latest?.roomId ?? null,
              isWinner: data.winnerId === userId,
            }));
            localStorage.setItem('cosmodex_last_room_state', JSON.stringify(latest));
            if (latest?.roomId) localStorage.setItem('cosmodex_last_match_id', latest.roomId);
          } catch { /* ignore */ }
          return latest;
        });

        if (data.winnerId === userId) {
          setTimeout(() => { window.location.href = '/victory'; }, 1200);
        }
      });
    }

    return () => {
      socket.off('mcq_room_state');
      socket.off('mcq_round_reveal');
      socket.off('mcq_next_round');
      socket.off('mcq_match_ended');
      socket.off('room_state_update');
      socket.off('submission_result');
      socket.off('run_result');
      socket.off('opponent_completed_stage');
      socket.off('waiting_for_opponent');
      socket.off('match_ended');
    };
  }, [socket, isMcq, matchInfo.roomId, matchInfo.opponentUsername, userId, username]);

  // Wait timer Countdown
  useEffect(() => {
    if (waitTimer <= 0) return;
    const interval = setInterval(() => {
      setWaitTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [waitTimer]);

  // Decision timer Countdown (Pure cleanup effect with no setState in effect body)
  useEffect(() => {
    if (!waitingDecision) return;
    const interval = setInterval(() => {
      setDecTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waitingDecision]);

  // Real-time MCQ Question Round Countdown Effect (Production Synced - Smooth 15s -> 0s)
  useEffect(() => {
    if (!isMcq || roundReveal || matchResult) return;
    const interval = setInterval(() => {
      setMcqTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isMcq, roundReveal, matchResult]);

  // Real-time Overall Match Elapsed Timer Effect
  useEffect(() => {
    if (matchResult) return;
    const interval = setInterval(() => {
      setMatchElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [matchResult]);

  // Auto-save draft in Code Battle
  useEffect(() => {
    if (isMcq || !socket || !matchInfo.roomId || !code) return;
    const timer = setTimeout(() => {
      socket.emit('auto_save_draft', {
        roomId: matchInfo.roomId,
        userId,
        code,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [code, isMcq, socket, matchInfo.roomId, userId]);

  // Problem management: Fetch problem details if valid ID provided, dependent ONLY on problemId
  const myPlayer = codeState?.players?.[userId];
  const currentStage = myPlayer?.currentStage ?? codeState?.currentStage ?? 1;
  const problemId = codeState?.problems?.[currentStage - 1];

  useEffect(() => {
    if (isMcq || !problemId || problemId.startsWith('mock-')) return;

    let ignore = false;

    fetch(`/api/battle/problems/${problemId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        if (data && !data.error && data.id && data.title) {
          setProblem(data);
          setExecResult(null);
          setRunResult(null);
        }
      })
      .catch(() => {
        // Silently fallback to local problem details if API fails
      });

    return () => {
      ignore = true;
    };
  }, [problemId, isMcq]);

  const handleForfeit = () => {
    if (socket && matchInfo.roomId) {
      if (isMcq) {
        socket.emit('mcq_leave_room', { roomId: matchInfo.roomId, userId });
      } else {
        socket.emit('leave_match', { roomId: matchInfo.roomId, userId });
      }
    }
    onLeave();
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(STARTERS[newLang] || "");
  };

  const handleRunCode = () => {
    if (running || !code) return;
    setRunning(true);
    setRunResult(null);
    setExecResult(null);
    socket?.emit("run_code", { code, language, stdin: customStdin });
  };

  const handleSubmitCode = () => {
    const currentProblem = problem || MOCK_PROBLEMS[myStage] || MOCK_PROBLEMS[1];
    if (!socket || !currentProblem || submitting) return;
    setSubmitting(true);
    setExecResult(null);
    setRunResult(null);
    socket.emit('submit_code', {
      roomId: matchInfo.roomId,
      userId,
      problemId: currentProblem.id,
      code,
      language,
    });
  };

  const handleDecision = (choice: 'skip' | 'stay') => {
    if (!socket) return;
    socket.emit('decide_skip_stay', {
      roomId: matchInfo.roomId,
      userId,
      choice,
    });
    setWaitingDecision(false);
  };

  const handleRedeem = () => {
    if (!socket) return;
    socket.emit('redeem_life', { roomId: matchInfo.roomId, userId });
  };

  const handleMcqAnswer = (answerIndex: number) => {
    if (!socket || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    socket.emit('mcq_answer', {
      roomId: matchInfo.roomId,
      userId,
      answerIndex,
    });
  };

  const myPlayerCode = codeState?.players?.[userId];
  const oppPlayerCode = codeState?.players?.[matchInfo.opponentId];

  const myPlayerMcq = mcqState?.players?.[userId];
  const oppPlayerMcq = mcqState?.players?.[matchInfo.opponentId];

  const myStage = myPlayerCode?.currentStage ?? codeState?.currentStage ?? 1;
  const isBoss = myStage === 6;


  const inDecision = waitingDecision || myPlayerCode?.status === 'WAITING_DECISION';
  const isWaiting = myPlayerCode?.status === 'DONE';
  const isElim = myPlayerCode?.status === 'ELIMINATED';

  // Derived active problem & timer without cascading renders
  const activeProblem = problem || MOCK_PROBLEMS[myStage] || MOCK_PROBLEMS[1];
  const effectiveDecTimer = waitingDecision ? decTimer : 0;

  // ── MATCH ENDED VIEW OVERLAY ───────────────────────────────────────────────
  if (matchResult) {
    const won = matchResult.winnerId === userId;
    const draw = !matchResult.winnerId;
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050508] text-text-primary flex flex-col font-fira overflow-hidden items-center justify-center p-4">
        {/* Ambient background spotlight glow */}
        <div className={cn(
          "absolute size-[500px] rounded-full blur-[140px] pointer-events-none opacity-40 animate-pulse",
          draw ? "bg-amber-500" : won ? "bg-emerald-500" : "bg-rose-600"
        )} />

        <div className="relative z-10 max-w-md w-full bg-gradient-to-b from-[#180f33]/90 via-[#0e0724]/95 to-[#060212]/98 border border-white/15 p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center flex flex-col items-center">
          {/* Top light line */}
          <div className={cn(
            "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r",
            draw ? "from-transparent via-amber-400 to-transparent" : won ? "from-transparent via-emerald-400 to-transparent" : "from-transparent via-rose-500 to-transparent"
          )} />

          <div className="text-7xl mb-4 animate-[bounce_1s_infinite]">
            {draw ? "🤝" : won ? "🏆" : "💀"}
          </div>

          <h2
            className={cn(
              "text-4xl md:text-5xl font-black tracking-widest uppercase mb-2 drop-shadow-lg",
              draw ? "text-amber-400 drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]" : won ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" : "text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]"
            )}
          >
            {draw ? "DRAW" : won ? "VICTORY" : "DEFEATED"}
          </h2>

          <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-xs">
            {draw
              ? "Both fighters competed hard. The battle ends in a draw."
              : won
                ? "You defeated your opponent! Your ELO has been updated."
                : `${matchInfo.opponentUsername} won this battle. Keep practicing!`}
          </p>

          <div className="flex gap-4 w-full justify-center mb-8">
            <div className="flex-1 bg-white/[0.05] border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner">
              <div className="text-3xl font-black text-amber-400">
                {isMcq ? myPlayerMcq?.score || 0 : myPlayerCode?.points || 0}
              </div>
              <div className="text-[11px] text-text-muted mt-1 uppercase tracking-widest font-bold">
                Points Earned
              </div>
            </div>
          </div>

          <button
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black tracking-wider uppercase text-sm shadow-[0_0_25px_rgba(192,38,211,0.5)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={onLeave}
          >
            Back to Arena
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN ARENA VIEW (FULLSCREEN TAKEOVER, NO NAVBAR) ──────────────────────
  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#060212] text-text-primary flex flex-col font-fira overflow-hidden arena-active">
      {/* Cosmodex Cosmic Starry Space Background */}
      <DashboardBackground />
      <Starfield />

      {/* Cosmic Nebula Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[45rem] h-[45rem] bg-purple-600/25 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-[40rem] h-[40rem] bg-fuchsia-600/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[35%] right-[30%] w-[30rem] h-[30rem] bg-cyan-600/15 rounded-full blur-[110px]" />
      </div>

      <div className="arena-game-wrapper relative z-10 flex flex-col h-full" style={{ paddingTop: 0, height: '100vh' }}>
        {/* Topbar matching redesign image */}
        <div className="relative w-full h-16 bg-[#080312]/90 border-b border-purple-900/30 backdrop-blur-xl px-6 flex items-center justify-between z-30 shadow-md">
          {/* Left: Round Badge & Elapsed Timer */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/10 backdrop-blur-md text-purple-200 border border-purple-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(168,85,247,0.15)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {isMcq ? `ROUND ${mcqState?.currentRound ?? 1} / 5` : `STAGE ${myStage} / 6`}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-white/70">
              ⏱ {Math.floor(matchElapsedSeconds / 60).toString().padStart(2, "0")}:{(matchElapsedSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Center: MCQ Speed Battle Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="font-display text-xl md:text-3xl text-white uppercase tracking-[0.08em]">
              MCQ <span style={{ background: 'linear-gradient(135deg, #E873C3 0%, #D95FD1 35%, #C453D6 65%, #8D37D6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPEED</span> BATTLE
            </span>
          </div>

          <motion.button
            whileHover={{
              scale: 1.06,
              y: -1,
              boxShadow: "0 0 12px rgba(236,72,153,0.4), 0 0 20px rgba(217,70,239,0.2)"
            }}
            whileTap={{ scale: 0.94 }}
            onClick={handleForfeit}
            className="group relative overflow-hidden px-6 py-1.5 rounded-full border border-pink-500/60 hover:border-pink-400 bg-pink-500/10 hover:bg-gradient-to-r hover:from-pink-600/30 hover:to-fuchsia-600/40 text-pink-400 hover:text-pink-100 text-xs font-mono font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer shadow-[0_0_12px_rgba(217,70,239,0.3)] backdrop-blur-md"
          >
            {/* Shimmer Light Beam Effect */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
            <span className="relative z-10 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">FORFEIT</span>
          </motion.button>
        </div>

        {/* Content Area */}
        {isMcq ? (
          /* MCQ QUESTION VIEW - EXACT MATCH FOR USER REDESIGN PIC */
          <div className="p-4 md:p-6 max-w-4xl mx-auto flex-1 flex flex-col justify-center w-full relative z-10 font-sans">
            {/* 5-Segment Round Progress Bar */}
            <div className="flex gap-2.5 mb-5 w-full">
              {Array.from({ length: 5 }, (_, i) => {
                const roundNum = i + 1;
                const currentRound = mcqState?.currentRound ?? 1;
                const isCompleted = roundNum <= currentRound;
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-500",
                      isCompleted
                        ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.7)]"
                        : "bg-white/10"
                    )}
                  />
                );
              })}
            </div>

            {/* Score Cards (You vs Opponent) */}
            <div className="grid grid-cols-2 gap-4 mb-6 w-full relative z-10">
              {/* You Card */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -1,
                  boxShadow: "0 0 20px rgba(217,70,239,0.3)"
                }}
                className="relative overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-r from-pink-950/60 to-[#120a26]/80 p-4 shadow-[0_0_20px_rgba(217,70,239,0.15)] backdrop-blur-xl flex items-center justify-between group transition-shadow duration-300"
              >
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-pink-500/20 blur-[30px] rounded-full pointer-events-none" />
                {/* Shimmer Light Beam Effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="size-10 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-lg shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                    {getAvatar(username)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-pink-300/80 uppercase">YOU</span>
                    <span className="text-sm font-mono font-bold text-white truncate max-w-[100px]">{username.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-4xl font-mono font-black text-pink-400 drop-shadow-[0_0_12px_rgba(217,70,239,0.6)] relative z-10">
                  {myPlayerMcq?.score || 1}
                </div>
              </motion.div>

              {/* Opponent Card */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -1,
                  boxShadow: "0 0 20px rgba(6,182,212,0.3)"
                }}
                className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-l from-cyan-950/60 to-[#120a26]/80 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl flex items-center justify-between flex-row-reverse group transition-shadow duration-300"
              >
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/20 blur-[30px] rounded-full pointer-events-none" />
                {/* Shimmer Light Beam Effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                <div className="flex items-center gap-3 flex-row-reverse relative z-10">
                  <div className="size-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    {getAvatar(matchInfo.opponentUsername)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold tracking-widest text-cyan-300/80 uppercase">OPPONENT</span>
                    <span className="text-sm font-mono font-bold text-white truncate max-w-[100px] text-right">{matchInfo.opponentUsername.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-4xl font-mono font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] relative z-10">
                  {oppPlayerMcq?.score || 0}
                </div>
              </motion.div>
            </div>

            {/* Main Question Card */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0e0720]/95 p-6 md:p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              {mcqState?.currentQuestion ? (
                <>
                  <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-500/40">
                        {mcqState.currentQuestion.category}
                      </span>
                      <span className={cn(
                        "px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
                        mcqState.currentQuestion.difficulty === 'HARD' ? "bg-red-950/60 text-red-400 border-red-500/40" :
                        mcqState.currentQuestion.difficulty === 'MEDIUM' ? "bg-amber-950/60 text-amber-400 border-amber-500/40" :
                        "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                      )}>
                        {mcqState.currentQuestion.difficulty}
                      </span>
                      <div className="flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)] text-xs font-mono font-bold text-purple-300">
                        <span>🔥</span>
                        <span>STREAK</span>
                        <span className="text-purple-400 font-black">· 3</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* XP Badge */}
                      <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <span className="text-amber-400 text-xs animate-pulse">⚡</span>
                        <span className="text-amber-300 font-mono font-black text-xs tracking-wider">
                          {isMcq ? (myPlayerMcq?.score ? myPlayerMcq.score * 240 : 240) : myPlayerCode?.points || 0} XP
                        </span>
                      </div>

                      <span className="h-4 w-px bg-white/20" />

                      {/* Timer */}
                      <div className="text-xs font-mono font-bold text-red-400 tracking-wider flex items-center gap-1.5 bg-red-950/80 border border-red-500/40 px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                        <span className="text-[11px] font-bold text-red-400">TIME</span>
                        <span className="text-sm font-black text-red-300">{mcqTimer.toString().padStart(2, "0")}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Pink Accent Line */}
                  <div className="h-1 w-32 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.7)] mb-6" />

                  <h3 className="text-xl md:text-3xl font-black text-white mb-8 leading-snug tracking-wide">
                    {mcqState.currentQuestion.question}
                  </h3>

                  {/* 2x2 Choice Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {mcqState.currentQuestion.options.map((option: string, idx: number) => {
                      const letter = String.fromCharCode(65 + idx);
                      let cardStyle = "bg-[#130b29]/60 border-white/10 text-white hover:border-fuchsia-500/70 hover:bg-[#1e1045]";
                      let badgeStyle = "bg-white/10 text-white/60 group-hover:bg-[#d946ef] group-hover:text-white group-hover:scale-110";

                      if (selectedAnswer === idx) {
                        cardStyle = "border-2 border-pink-500 bg-[#240c3c] text-white";
                        badgeStyle = "bg-[#d946ef] text-white font-black";
                      }

                      if (roundReveal) {
                        if (idx === roundReveal.correctIndex) {
                          cardStyle = "border-2 border-emerald-400 bg-emerald-950/80 text-white";
                          badgeStyle = "bg-emerald-500 text-white font-black";
                        } else if (selectedAnswer === idx && idx !== roundReveal.correctIndex) {
                          cardStyle = "border-2 border-rose-500 bg-rose-950/80 text-white";
                          badgeStyle = "bg-rose-500 text-white font-black";
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          whileHover={
                            selectedAnswer === null && !roundReveal
                              ? {
                                  y: -8,
                                  scale: 1.03,
                                  transition: { duration: 0.12, ease: "easeOut" }
                                }
                              : {}
                          }
                          whileTap={selectedAnswer === null && !roundReveal ? { scale: 0.97, y: -2, transition: { duration: 0.05 } } : {}}
                          onClick={() => handleMcqAnswer(idx)}
                          disabled={selectedAnswer !== null || roundReveal !== null}
                          className={cn(
                            "group relative p-5 rounded-2xl border text-left font-semibold transition-colors transition-border duration-100 ease-out flex items-center gap-4 cursor-pointer backdrop-blur-md overflow-hidden",
                            cardStyle
                          )}
                        >
                          <span className={cn(
                            "size-8 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold transition-all duration-100 ease-out",
                            badgeStyle
                          )}>
                            {letter}
                          </span>
                          <span className="text-sm md:text-base leading-snug flex-1">{option}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {roundReveal && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-sm font-medium text-emerald-200 backdrop-blur-md flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span>Round Over! Correct Answer: <strong className="text-emerald-300 font-bold">{String.fromCharCode(65 + roundReveal.correctIndex)}</strong></span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-text-muted py-12 font-mono flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-400"></div>
                  <span>Waiting for next question...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CODE BATTLE VIEW */
          <div className="arena-main" style={{ display: "flex", flexDirection: "row" }}>
            {/* Left Panel: Problem Details & Players */}
            <div
              className="arena-left flex flex-col min-w-0"
              style={{ width: `${leftWidth}%` }}
            >
              <div className="arena-problem-panel flex-1 bg-[#0d0a14] border border-white/5 rounded-xl p-8 relative overflow-y-auto mb-4 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[#A78BFA] font-bold tracking-widest uppercase text-sm">
                    Exercise
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium">
                      Stage {myStage} of 6
                    </span>
                  </div>
                </div>

                <h2 className="text-[36px] leading-none font-black font-lato text-white tracking-wide uppercase mb-4 drop-shadow-md">
                  {String(myStage).padStart(2, "0")}. {activeProblem.title}
                </h2>

                <div className="mb-6 flex items-center">
                  <h3
                    className={`text-xl font-bold ${activeProblem.difficulty === "EASY"
                        ? "text-[#3DCB7F]"
                        : activeProblem.difficulty === "MEDIUM"
                          ? "text-[#F5C842]"
                          : "text-[#E85D5D]"
                      }`}
                  >
                    # {activeProblem.difficulty}
                  </h3>
                  <span className="ml-3 text-xl">👾</span>
                </div>

                <div className="text-[#A1A1AA] leading-relaxed text-[14px] space-y-4 mb-8">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {activeProblem.description}
                  </div>
                </div>

                <div className="space-y-4 relative z-10 mt-auto">
                  {activeProblem.testCases
                    ?.filter((tc) => tc.isPublic)
                    .map((tc, i) => (
                      <div
                        key={tc.id || i}
                        className="arena-example bg-black/50 border border-white/5 rounded-xl p-4"
                      >
                        <div className="arena-example-label text-[11px] font-bold text-[#A78BFA] mb-2 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                          Example {i + 1}
                        </div>
                        <div className="arena-example-row font-mono text-xs mb-1 flex gap-3 items-start">
                          <span className="arena-example-key text-text-muted select-none mt-0.5">
                            Input:
                          </span>
                          <code className="arena-example-val text-white bg-white/5 px-2 py-0.5 rounded border border-white/10 break-all">
                            {tc.input}
                          </code>
                        </div>
                        <div className="arena-example-row font-mono text-xs flex gap-3 items-start">
                          <span className="arena-example-key text-text-muted select-none mt-0.5">
                            Output:
                          </span>
                          <code className="arena-example-val text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/20 px-2 py-0.5 rounded break-all">
                            {tc.expected}
                          </code>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Players Section */}
              <div className="arena-players-section mt-2">
                <div className="arena-players-title text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
                  Players
                </div>

                {/* You Card */}
                <div className="arena-player-card you">
                  <span className="arena-player-avi">
                    {getAvatar(username)}
                  </span>
                  <div className="arena-player-info">
                    <span className="arena-player-name">
                      {username}{" "}
                      <span className="arena-you-tag">(you)</span>
                    </span>
                    <div className="arena-player-meta flex items-center gap-3">
                      <span className="arena-player-stage bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                        Stage {myStage}
                      </span>
                      <span className="arena-player-hearts">{hearts(myPlayerCode?.lives ?? 5)}</span>
                      <span className="arena-player-pts text-[#F5C842] font-black text-sm">
                        🌟 {myPlayerCode?.points ?? 0} XP
                      </span>
                      <span
                        className={`arena-player-status ${(myPlayerCode?.status || 'CODING')
                          .toLowerCase()
                          .replace("_", "-")} text-[10px] font-bold tracking-widest uppercase ml-auto`}
                      >
                        {myPlayerCode?.status === "CODING"
                          ? "CODING"
                          : myPlayerCode?.status === "DONE"
                            ? "DONE"
                            : myPlayerCode?.status === "STAYING"
                              ? "STAYING"
                              : myPlayerCode?.status === "WAITING_DECISION"
                                ? "DECIDING"
                                : myPlayerCode?.status === "ELIMINATED"
                                  ? "ELIMINATED"
                                  : myPlayerCode?.status || "CODING"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponent Card */}
                <div className="arena-player-card bg-[#1C1929] border border-white/5 rounded-xl p-4 flex gap-4 items-center mt-2">
                  <span className="arena-player-avi text-4xl bg-black/40 rounded-full w-12 h-12 flex items-center justify-center">
                    {getAvatar(matchInfo.opponentUsername)}
                  </span>
                  <div className="arena-player-info flex-1">
                    <span className="arena-player-name text-sm font-bold text-white block mb-1">
                      {matchInfo.opponentUsername}
                    </span>
                    <div className="arena-player-meta flex items-center gap-3">
                      <span className="arena-player-stage bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                        Stage {oppPlayerCode?.currentStage ?? 1}
                      </span>
                      <span className="arena-player-hearts">{hearts(oppPlayerCode?.lives ?? 5)}</span>
                      <span className="arena-player-pts text-[#F5C842] font-black text-sm">
                        🌟 {oppPlayerCode?.points ?? 0} XP
                      </span>
                      <span
                        className={`arena-player-status ${(oppPlayerCode?.status || 'CODING')
                          .toLowerCase()
                          .replace("_", "-")} text-[10px] font-bold tracking-widest uppercase ml-auto`}
                      >
                        {oppPlayerCode?.status === "CODING"
                          ? "CODING"
                          : oppPlayerCode?.status === "DONE"
                            ? "DONE"
                            : oppPlayerCode?.status === "STAYING"
                              ? "STAYING"
                              : oppPlayerCode?.status === "WAITING_DECISION"
                                ? "DECIDING"
                                : oppPlayerCode?.status === "ELIMINATED"
                                  ? "ELIMINATED"
                                  : oppPlayerCode?.status || "CODING"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Resizer */}
            <div
              className="w-2 cursor-col-resize hover:bg-accent/30 transition-colors z-20 flex items-center justify-center shrink-0 group"
              onMouseDown={startDrag}
            >
              <div className="w-0.5 h-12 bg-white/10 group-hover:bg-accent/50 rounded-full transition-colors" />
            </div>

            {/* Right Panel: Code Editor & Execution */}
            <div
              className="arena-right flex flex-col flex-1 min-w-0"
              style={{ width: `${100 - leftWidth}%` }}
            >
              {/* Toolbar */}
              <div className="arena-editor-toolbar">
                <div className="arena-editor-toolbar-left">
                  <span className="arena-editor-icon">📝</span>
                  <span className="arena-editor-label">Editor</span>
                  <select
                    className="arena-lang-select"
                    value={language}
                    onChange={handleLangChange}
                  >
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <span className="arena-char-count">{code.length} chars</span>
              </div>

              {/* Monaco Code Editor */}
              <div className="flex-1 w-full min-h-[200px] overflow-hidden py-2 bg-black">
                <Editor
                  height="100%"
                  language={language}
                  theme="pure-black"
                  beforeMount={(monaco: Monaco) => {
                    monaco.editor.defineTheme('pure-black', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#000000',
                        'editorGutter.background': '#000000',
                        'editor.lineHighlightBackground': '#0a0a0a',
                      },
                    });
                  }}
                  onMount={(_editor: unknown, monaco: Monaco) => {
                    monaco.editor.setTheme('pure-black');
                  }}
                  value={code}
                  onChange={(val: string | undefined) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false }, // Hides the minimap to match the UI in image_8c7941.png
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    // THE TYPING FIXES:
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoIndent: 'full',
                    formatOnType: true,
                    tabSize: 4,
                    insertSpaces: true,
                  }}
                />
              </div>

              {/* Actions Bar */}
              <div className="arena-actions-bar">
                <div className="arena-actions-left">
                  {inDecision && (
                    <>
                      <button
                        className="arena-btn-skip"
                        onClick={() => handleDecision("skip")}
                      >
                        ⏭ Skip (−1 life)
                      </button>
                      <button
                        className="arena-btn-stay"
                        onClick={() => handleDecision("stay")}
                      >
                        ✋ Stay & Solve
                      </button>
                    </>
                  )}
                  {isBoss && (myPlayerCode?.points || 0) >= 100 && (
                    <button className="arena-btn-redeem" onClick={handleRedeem}>
                      ❤️ Redeem Life (100pt)
                    </button>
                  )}
                </div>
                <div className="arena-actions-right">
                  {!inDecision && (
                    <>
                      <button
                        className="arena-btn-run"
                        onClick={handleRunCode}
                        disabled={running || isElim}
                      >
                        {running ? "⏳ Running..." : "▶ Run"}
                      </button>
                      <button
                        className="arena-btn-submit"
                        onClick={handleSubmitCode}
                        disabled={submitting || isWaiting || isElim}
                      >
                        {submitting ? "⏳ Judging..." : "⚡ Submit"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Custom Stdin Section */}
              <div className="arena-stdin-section">
                <div
                  className="arena-stdin-toggle cursor-pointer"
                  onClick={() => setShowStdin(!showStdin)}
                >
                  <span>{showStdin ? "▲" : "▼"} Custom Input</span>
                </div>
                {showStdin && (
                  <textarea
                    className="arena-stdin-input"
                    placeholder="Enter custom input to pass to stdin..."
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    spellCheck={false}
                  />
                )}
              </div>

              {/* Output / Terminal Section */}
              <div className="arena-output-section">
                <div className="arena-output-header">
                  <span className="arena-output-label">Terminal</span>
                  {runResult && !execResult && (
                    <span
                      className={`arena-output-status ${runResult.timedOut || runResult.stderr ? "error" : "success"
                        }`}
                    >
                      {runResult.timedOut
                        ? "⏱ TLE"
                        : runResult.stderr
                          ? "❌ Error"
                          : "✓ Success"}
                    </span>
                  )}
                  {execResult && (
                    <span
                      className={`arena-output-status ${execResult.status === "ACCEPTED" ? "success" : "error"
                        }`}
                    >
                      {execResult.status === "ACCEPTED"
                        ? `✅ ACCEPTED ${execResult.passedCount}/${execResult.totalCount}`
                        : `❌ ${(execResult.status || "FAILED").replace(/_/g, " ")} ${execResult.passedCount ?? 0}/${execResult.totalCount ?? 0}`}
                    </span>
                  )}
                </div>
                <div
                  className={`arena-output-body ${execResult
                      ? execResult.status === "ACCEPTED"
                        ? "success"
                        : "error"
                      : runResult
                        ? runResult.timedOut || runResult.stderr
                          ? "warn"
                          : "success"
                        : ""
                    }`}
                >
                  {execResult
                    ? execResult.status === "ACCEPTED"
                      ? `All ${execResult.passedCount} test cases passed! +${execResult.pointsAwarded ?? 0} points\n` +
                      (execResult.testCases
                        ?.filter((tc) => tc.isPublic)
                        .map(
                          (tc, i) =>
                            `\nTest ${i + 1} ✓  Input: ${tc.input}   Expected: ${tc.expected}`
                        )
                        .join("") || "")
                      : `${(execResult.status || "FAILED").replace(/_/g, " ")}  —  ${execResult.livesRemaining ?? myPlayerCode?.lives ?? 0} lives remaining\n` +
                      (execResult.error ? `Error: ${execResult.error}\n` : "") +
                      (execResult.testCases
                        ?.filter((tc) => tc.isPublic)
                        .map(
                          (tc, i) =>
                            `\nTest ${i + 1} ${tc.passed ? "✓" : "✗"}  Input: ${tc.input}   Expected: ${tc.expected}   Got: ${tc.actual || "(none)"}`
                        )
                        .join("") || "")
                    : runResult
                      ? runResult.timedOut
                        ? "Your code took too long to execute (Time limit: 5s)."
                        : runResult.stderr ||
                        runResult.stdout ||
                        "(No output produced)"
                      : "Click Run or Submit to view your execution results"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Futuristic Glassmorphic Bottom Status Bar */}
        {!isMcq && (
          <div className="relative z-50 w-full h-14 bg-[#080312]/95 border-t border-purple-900/40 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300/80">
                <span className="tracking-widest">STREAK</span>
                <span className="text-purple-400 font-black">· 3</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-white text-xs tracking-wider">
                {activeProblem.title}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                STAGE {myStage} / 6
              </span>
              <span className="px-3 py-1 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/40 text-xs font-mono font-bold tracking-wider">
                {myPlayerCode?.lives ?? 5} LIVES
              </span>
            </div>
          </div>
        )}

        {/* Overlay: Waiting for Opponent */}
        {waitTimer > 0 && (
          <div className="arena-overlay">
            <div className="arena-overlay-spin">⏳</div>
            <div className="arena-overlay-title">WAITING FOR OPPONENT</div>
            <div className="arena-overlay-sub">
              They are deciding whether to skip or stay.
            </div>
            <div className="arena-overlay-countdown">{waitTimer}</div>
          </div>
        )}

        {/* Overlay: Decision Modal */}
        {effectiveDecTimer > 0 && (
          <div className="arena-overlay decision">
            <div className="arena-decision-modal">
              <div className="arena-decision-icon">⚠️</div>
              <div className="arena-decision-title">
                OPPONENT COMPLETED STAGE
              </div>
              <div className="arena-decision-desc">
                Your opponent just completed this stage! You have 15 seconds to
                decide whether to stay and try to solve it, or skip to the next
                stage at the cost of 1 life.
              </div>
              <div className="arena-decision-timer">{effectiveDecTimer}</div>
              <div className="arena-decision-actions">
                <button
                  className="arena-btn-skip"
                  onClick={() => handleDecision("skip")}
                >
                  Skip (−1 life)
                </button>
                <button
                  className="arena-btn-stay-lg"
                  onClick={() => handleDecision("stay")}
                >
                  Stay & Solve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
