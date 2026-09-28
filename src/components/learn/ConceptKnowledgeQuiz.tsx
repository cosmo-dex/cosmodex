"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
  Award,
  ArrowRight,
  Target,
  Sparkles,
  Lock,
  Clock,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { QuizQuestion } from "@/data/theoryExercisesData";

const PASS_THRESHOLD = 3;
const COOLDOWN_MS = 30 * 1000; // 30 seconds (temporary test mode)

interface ConceptKnowledgeQuizProps {
  questions: QuizQuestion[];
  chapterTitle?: string;
  moduleId?: string;
  courseId?: string;
  nextLessonId?: string;
  onCompleteQuiz?: (score: number, total: number, passed: boolean) => void;
}

function formatCountdown(ms: number): string {
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function normalizeCourseSlug(slug?: string): string {
  if (!slug) return "python";
  const s = slug.toLowerCase().trim();
  if (s === "python" || s === "py" || s === "py-1" || s.startsWith("py-") || s.startsWith("python")) {
    return "python";
  }
  if (s === "html" || s === "web-1" || s === "html-1" || s.startsWith("html-") || s.startsWith("web-")) {
    return "html";
  }
  return s;
}

export default function ConceptKnowledgeQuiz({
  questions,
  chapterTitle = "Station Topic",
  moduleId,
  courseId = "python",
  nextLessonId,
  onCompleteQuiz,
}: ConceptKnowledgeQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(() => {
    if (!moduleId || typeof window === "undefined") return 0;
    try {
      const saved = JSON.parse(localStorage.getItem(`quiz_result_${moduleId}`) || "null");
      if (saved && !saved.passed && saved.lockedUntil) {
        const rem = saved.lockedUntil - Date.now();
        return rem > 0 ? rem : 0;
      }
    } catch {}
    return 0;
  });

  const [lastResult, setLastResult] = useState<{ passed: boolean; score: number; total: number } | null>(() => {
    if (!moduleId || typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(localStorage.getItem(`quiz_result_${moduleId}`) || "null");
      if (saved && typeof saved.score === "number") {
        return { passed: saved.passed, score: saved.score, total: saved.total };
      }
    } catch {}
    return null;
  });

  const [quizLocked, setQuizLocked] = useState<boolean>(() => {
    if (!moduleId || typeof window === "undefined") return false;
    try {
      const saved = JSON.parse(localStorage.getItem(`quiz_result_${moduleId}`) || "null");
      if (saved && !saved.passed && saved.lockedUntil) {
        return saved.lockedUntil - Date.now() > 0;
      }
    } catch {}
    return false;
  });

  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanCourseCode = normalizeCourseSlug(courseId);

  const fireCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 999999,
        colors: ["#00FFE9", "#FF007A", "#FFD700", "#9E00F6", "#34D399"],
      });

      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 85,
          origin: { x: 0.05, y: 0.65 },
          zIndex: 999999,
          colors: ["#00FFE9", "#FFD700", "#FFFFFF"],
        });
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 85,
          origin: { x: 0.95, y: 0.65 },
          zIndex: 999999,
          colors: ["#FF007A", "#9E00F6", "#00FFE9"],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 140,
          spread: 140,
          origin: { y: 0.5 },
          zIndex: 999999,
          colors: ["#FFD700", "#00FFE9", "#34D399", "#FF007A"],
        });
      }, 450);
    } catch (e) {
      console.warn("Confetti animation error", e);
    }
  }, []);

  // 1. Initial Load: Check remote database for existing attempt
  useEffect(() => {
    let active = true;

    if (!moduleId) {
      const t = setTimeout(() => {
        if (active) setInitialCheckDone(true);
      }, 0);
      return () => {
        active = false;
        clearTimeout(t);
      };
    }

    fetch(`/api/learning/quiz-attempt?moduleId=${encodeURIComponent(moduleId)}&courseCode=${encodeURIComponent(cleanCourseCode)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data || !data.hasAttempt) return;
        if (data.passed) {
          setLastResult({ passed: true, score: data.score, total: data.total });
          setQuizLocked(false);
          setCooldownRemainingMs(0);
        } else if (data.cooldownRemainingMs > 0) {
          setQuizLocked(true);
          setCooldownRemainingMs(data.cooldownRemainingMs);
          setLastResult({ passed: false, score: data.score, total: data.total });
        } else {
          setLastResult({ passed: false, score: data.score, total: data.total });
          setQuizLocked(false);
          setCooldownRemainingMs(0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setInitialCheckDone(true);
      });

    return () => {
      active = false;
    };
  }, [moduleId, cleanCourseCode]);

  // 2. Countdown Timer for 30m lock
  useEffect(() => {
    if (cooldownRemainingMs <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldownRemainingMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(timerRef.current!);
          setQuizLocked(false);
          if (moduleId && typeof window !== "undefined") {
            try {
              const storageKey = `quiz_result_${moduleId}`;
              const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
              if (saved) {
                saved.lockedUntil = null;
                localStorage.setItem(storageKey, JSON.stringify(saved));
              }
            } catch {}
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldownRemainingMs, moduleId]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const score = Object.entries(selectedAnswers).reduce((acc, [qIdxStr, chosen]) => {
    const q = questions[Number(qIdxStr)];
    return q?.correctAnswerIndex === chosen ? acc + 1 : acc;
  }, 0);

  const executeQuizSubmit = useCallback(
    async (answersMap: Record<number, number>) => {
      if (quizLocked) return;

      const finalScore = Object.entries(answersMap).reduce((sum, [qStr, opt]) => {
        const q = questions[Number(qStr)];
        return q?.correctAnswerIndex === opt ? sum + 1 : sum;
      }, 0);

      const passed = finalScore >= PASS_THRESHOLD;
      setIsSubmitting(true);

      const storageKey = moduleId ? `quiz_result_${moduleId}` : null;
      const lockedUntil = passed ? null : Date.now() + COOLDOWN_MS;

      if (storageKey && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              passed,
              score: finalScore,
              total: totalQuestions,
              answers: answersMap,
              lockedUntil,
            })
          );
          if (passed) {
            localStorage.setItem(`station_completed_${moduleId}`, "true");
          }
        } catch {}
      }

      try {
        if (moduleId) {
          const res = await fetch("/api/learning/quiz-attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleId, score: finalScore, total: totalQuestions, courseCode: cleanCourseCode }),
          });
          const data = await res.json();

          if (res.status === 429) {
            setQuizLocked(true);
            setCooldownRemainingMs(data.cooldownRemainingMs || COOLDOWN_MS);
            setLastResult({ passed: false, score: finalScore, total: totalQuestions });
            setIsSubmitting(false);
            return;
          }
        }

        setLastResult({ passed, score: finalScore, total: totalQuestions });

        if (passed) {
          setQuizLocked(false);
          setCooldownRemainingMs(0);
          setShowCelebrationModal(true);
          fireCelebration();
        } else {
          setQuizLocked(true);
          setCooldownRemainingMs(COOLDOWN_MS);
        }

        if (onCompleteQuiz) onCompleteQuiz(finalScore, totalQuestions, passed);
      } catch {
        setLastResult({ passed, score: finalScore, total: totalQuestions });
        if (passed) {
          setQuizLocked(false);
          setCooldownRemainingMs(0);
          setShowCelebrationModal(true);
          fireCelebration();
        } else {
          setQuizLocked(true);
          setCooldownRemainingMs(COOLDOWN_MS);
        }
        if (onCompleteQuiz) onCompleteQuiz(finalScore, totalQuestions, passed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [quizLocked, questions, moduleId, totalQuestions, cleanCourseCode, fireCelebration, onCompleteQuiz]
  );

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (quizLocked) return;
    if (selectedAnswers[questionIndex] !== undefined) return;
    const nextAnswers = { ...selectedAnswers, [questionIndex]: optionIndex };
    setSelectedAnswers(nextAnswers);

    // Auto-trigger celebration & submit when all questions are answered!
    if (Object.keys(nextAnswers).length === totalQuestions) {
      setTimeout(() => {
        executeQuizSubmit(nextAnswers);
      }, 300);
    }
  };

  const handleResetQuiz = () => {
    if (quizLocked) return;
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
    setLastResult(null);
    setShowCelebrationModal(false);
  };

  if (!questions || questions.length === 0) return null;
  if (!initialCheckDone) return null;

  const currentQ = questions[activeQuestionIndex];
  const chosenOption = selectedAnswers[activeQuestionIndex];
  const hasAnsweredCurrent = chosenOption !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && chosenOption === currentQ.correctAnswerIndex;
  const optionLetters = ["A", "B", "C", "D", "E"];

  const nextDestinationHref = nextLessonId
    ? `/learn/${courseId}/theory/${nextLessonId}`
    : `/learn/${cleanCourseCode}`;

  return (
    <div className="my-10 relative">
      {/* ── Top Bar with Score & Reset ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#9E00F6]/15 border border-[#9E00F6]/40 flex items-center justify-center shadow-[0_0_12px_rgba(158,0,246,0.3)]">
            <Target size={16} className="text-[#9E00F6]" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#9E00F6]">
              Knowledge Check
            </p>
            <h3 className="text-lg font-black text-white tracking-tight font-display">{chapterTitle}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 font-mono text-xs font-bold">
            <span className="text-white/50">Score </span>
            <span className="text-[#00FFE9]">
              {score}/{totalQuestions}
            </span>
            {answeredCount > 0 && (
              <span className="ml-1.5 text-[10px] text-white/50">
                ({answeredCount}/{totalQuestions})
              </span>
            )}
          </div>
          {answeredCount > 0 && !quizLocked && (
            <button
              type="button"
              onClick={handleResetQuiz}
              title="Reset Quiz"
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── 30-Minute Cooldown Banner (Only When Locked from Failed Attempt) ── */}
      {quizLocked && cooldownRemainingMs > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl border border-rose-500/40 bg-rose-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>Quiz Locked — 30m Cooldown</span>
              </h4>
              <p className="text-xs text-rose-200/80 font-sans mt-0.5">
                You scored {lastResult?.score}/{lastResult?.total}. Need at least {PASS_THRESHOLD}/{totalQuestions} to pass.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/50 px-4 py-2 rounded-xl shrink-0">
            <Clock size={16} className="text-rose-300 animate-pulse" />
            <span className="text-xl font-black font-mono text-rose-300 tabular-nums">
              {formatCountdown(cooldownRemainingMs)}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Question Step Indicator Tabs ── */}
      <div className={`flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 ${quizLocked ? "opacity-50 pointer-events-none" : ""}`}>
        {questions.map((q, idx) => {
          const isDone = selectedAnswers[idx] !== undefined;
          const isCorrect = isDone && selectedAnswers[idx] === q.correctAnswerIndex;
          const isCurrent = activeQuestionIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveQuestionIndex(idx)}
              className={`relative flex-shrink-0 w-9 h-9 rounded-xl border font-mono text-[11px] font-black transition-all cursor-pointer
                ${isCurrent && !isDone
                  ? "bg-[#9E00F6]/20 border-[#9E00F6] text-white shadow-[0_0_12px_rgba(158,0,246,0.4)]"
                  : isDone
                    ? isCorrect
                      ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-300"
                      : "bg-rose-950/60 border-rose-500/80 text-rose-300"
                    : "bg-white/[0.04] border-white/10 text-white/40 hover:border-white/25"
                }`}
            >
              {isDone ? (isCorrect ? "✓" : "✗") : idx + 1}
            </button>
          );
        })}
      </div>

      {/* ── Active Question Card ── */}
      <div className={`rounded-2xl border border-white/10 bg-[#0d0f1a] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${quizLocked ? "opacity-50 pointer-events-none select-none" : ""}`}>
        <div className="px-5 py-3 bg-[#13162a] border-b border-white/[0.08] flex items-center gap-2">
          <Zap size={13} className="text-[#9E00F6]" />
          <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest">
            Question {activeQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuestionIndex}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="p-5 sm:p-6 space-y-5"
          >
            {/* Question Text */}
            <p className="text-base sm:text-lg font-bold text-white font-sans leading-relaxed">
              {currentQ.question}
            </p>

            {/* Code Snippet with Mac Terminal Dots */}
            {currentQ.codeSnippet && (
              <div className="rounded-xl border border-white/10 bg-[#070b14] overflow-hidden shadow-inner">
                <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <pre className="p-4 text-[12px] sm:text-[13px] font-mono text-cyan-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {currentQ.codeSnippet}
                </pre>
              </div>
            )}

            {/* 2-Column Options Grid (Original Design) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((optionText, optIdx) => {
                const letter = optionLetters[optIdx];
                const isThisChosen = chosenOption === optIdx;
                const isThisCorrect = optIdx === currentQ.correctAnswerIndex;

                let cardClass =
                  "border-white/10 bg-white/[0.03] text-white hover:border-[#9E00F6]/60 hover:bg-[#9E00F6]/[0.08] cursor-pointer";
                let badgeClass = "bg-white/[0.08] text-white/60";

                if (hasAnsweredCurrent) {
                  if (isThisCorrect) {
                    cardClass =
                      "border-emerald-500/80 bg-emerald-950/50 text-white shadow-[0_0_20px_rgba(52,211,153,0.2)]";
                    badgeClass = "bg-emerald-500 text-black font-black";
                  } else if (isThisChosen && !isThisCorrect) {
                    cardClass =
                      "border-rose-500/80 bg-rose-950/50 text-white/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]";
                    badgeClass = "bg-rose-500 text-white font-black";
                  } else {
                    cardClass = "border-white/[0.05] bg-white/[0.01] text-white/30 opacity-50";
                    badgeClass = "bg-white/[0.04] text-white/30";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={hasAnsweredCurrent || quizLocked}
                    onClick={() => handleSelectOption(activeQuestionIndex, optIdx)}
                    className={`group flex items-center gap-3 p-4 rounded-xl border text-left font-sans text-sm transition-all duration-150 ${cardClass}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-black transition-transform group-hover:scale-105 ${badgeClass}`}
                    >
                      {letter}
                    </span>
                    <span className="leading-snug flex-1">{optionText}</span>
                    {hasAnsweredCurrent && (
                      <span className="shrink-0 ml-1">
                        {isThisCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : isThisChosen ? (
                          <XCircle size={16} className="text-rose-400" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {hasAnsweredCurrent && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed ${
                  isCurrentCorrect
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                    : "bg-[#1a0a2e] border-[#9E00F6]/30 text-purple-200"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCurrentCorrect ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/70 mb-1">
                    {isCurrentCorrect ? "Correct! Key Concept:" : "Review Insight:"}
                  </p>
                  <p className="text-[13px] text-slate-300 font-sans">{currentQ.explanation}</p>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white text-xs font-mono font-bold transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {activeQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveQuestionIndex((p) => Math.min(totalQuestions - 1, p + 1))}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#9E00F6] to-[#E873C3] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all hover:opacity-90 shadow-[0_0_16px_rgba(158,0,246,0.35)] cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => executeQuizSubmit(selectedAnswers)}
                  disabled={isSubmitting || quizLocked || answeredCount < totalQuestions}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-black text-xs font-mono font-black uppercase tracking-wider transition-all hover:opacity-95 shadow-[0_0_25px_rgba(52,211,153,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                >
                  <span>{isSubmitting ? "Submitting..." : "Submit Quiz 🚀"}</span>
                  {!isSubmitting && <Sparkles size={14} />}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Celebration Pop-Up Modal (Triggers when Quiz is Passed with >= 3/5) ── */}
      <AnimatePresence>
        {showCelebrationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 25 }}
              className="w-full max-w-md rounded-3xl border-2 border-emerald-400/80 bg-gradient-to-b from-[#0b1f17] via-[#07130e] to-[#040906] p-6 sm:p-8 space-y-6 text-center shadow-[0_0_60px_rgba(16,185,129,0.4)] relative overflow-hidden"
            >
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Animated Trophy */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <div className="w-full h-full rounded-[22px] bg-[#07130e] flex items-center justify-center text-emerald-300">
                  <Award size={40} className="animate-bounce" />
                </div>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-mono font-black uppercase tracking-[0.2em] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <Sparkles size={12} />
                  STATION CONQUERED
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-mono text-white uppercase tracking-wider">
                  Level Unlocked! 🚀
                </h3>
                <p className="text-xs sm:text-sm font-sans text-white/80 leading-relaxed pt-1">
                  You scored <strong className="text-emerald-300 font-mono text-base">{lastResult?.score || score}/{totalQuestions}</strong> correct!
                  {nextLessonId
                    ? " The next station in your galaxy path has been unlocked."
                    : " All curriculum stations completed! Your course certificate is ready to claim on the galaxy map."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href={nextDestinationHref}
                  onClick={() => setShowCelebrationModal(false)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(52,211,153,0.45)] hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{nextLessonId ? "Continue to Next Station 🚀" : "Return to Galaxy Map 🚀"}</span>
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Stay &amp; Review Answers
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
