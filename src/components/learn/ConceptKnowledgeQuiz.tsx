"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Zap,
  Award,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";
import { QuizQuestion } from "@/data/courses/python/quizData";

interface ConceptKnowledgeQuizProps {
  questions: QuizQuestion[];
  chapterTitle?: string;
  onCompleteQuiz?: (score: number, total: number) => void;
}

export default function ConceptKnowledgeQuiz({
  questions,
  chapterTitle = "Station Topic",
  onCompleteQuiz,
}: ConceptKnowledgeQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const score = Object.entries(selectedAnswers).reduce((acc, [qIdxStr, chosenOption]) => {
    const qIdx = Number(qIdxStr);
    const q = questions[qIdx];
    return q && q.correctAnswerIndex === chosenOption ? acc + 1 : acc;
  }, 0);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (selectedAnswers[questionIndex] !== undefined) return;

    setSelectedAnswers((prev) => {
      const next = { ...prev, [questionIndex]: optionIndex };
      if (Object.keys(next).length === totalQuestions && onCompleteQuiz) {
        const finalScore = Object.entries(next).reduce((sum, [qStr, opt]) => {
          const q = questions[Number(qStr)];
          return q && q.correctAnswerIndex === opt ? sum + 1 : sum;
        }, 0);
        onCompleteQuiz(finalScore, totalQuestions);
      }
      return next;
    });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
  };

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[activeQuestionIndex];
  const chosenOption = selectedAnswers[activeQuestionIndex];
  const hasAnsweredCurrent = chosenOption !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && chosenOption === currentQ.correctAnswerIndex;
  const isAllAnswered = answeredCount === totalQuestions;

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="my-10 relative">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#9E00F6]/15 border border-[#9E00F6]/40 flex items-center justify-center shadow-[0_0_12px_rgba(158,0,246,0.3)]">
          <Target size={16} className="text-[#9E00F6]" />
        </div>
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#9E00F6]">
            Knowledge Check
          </p>
          <h3 className="text-lg font-black text-white tracking-tight">{chapterTitle}</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 font-mono text-xs font-bold">
            <span className="text-white/50">Score </span>
            <span className="text-[#00FFE9]">
              {score}/{totalQuestions}
            </span>
            {isAllAnswered && (
              <span className="ml-1.5 text-[10px] text-emerald-400">
                ({Math.round((score / totalQuestions) * 100)}%)
              </span>
            )}
          </div>
          {answeredCount > 0 && (
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

      {/* ── Question Stepper ── */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
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
                ${
                  isCurrent && !isDone
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

      {/* ── Main Question Card ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f1a] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Question header strip */}
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
            {/* Question text */}
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.question}
            </h4>

            {/* Optional code snippet */}
            {currentQ.codeSnippet && (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#060810]">
                <div className="px-4 py-2 bg-[#0d1020] border-b border-white/[0.06] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <pre className="p-4 text-[12px] sm:text-[13px] font-mono text-cyan-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {currentQ.codeSnippet}
                </pre>
              </div>
            )}

            {/* Options grid */}
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
                    disabled={hasAnsweredCurrent}
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

            {/* Explanation after answering */}
            <AnimatePresence>
              {hasAnsweredCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
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
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white text-xs font-mono font-bold transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              {activeQuestionIndex < totalQuestions - 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveQuestionIndex((p) => Math.min(totalQuestions - 1, p + 1))
                  }
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#9E00F6] to-[#E873C3] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all hover:opacity-90 shadow-[0_0_16px_rgba(158,0,246,0.35)] cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Completion Banner ── */}
      <AnimatePresence>
        {isAllAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-5 p-5 sm:p-6 rounded-2xl border border-[#9E00F6]/40 bg-gradient-to-r from-[#1a0a2e] via-[#180b38] to-[#140520] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_40px_rgba(158,0,246,0.2)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFA249] to-[#FF007A] flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  Quiz Complete!
                  <Sparkles size={14} className="text-amber-400" />
                </h4>
                <p className="text-xs text-white/60 mt-0.5 font-sans">
                  {score} of {totalQuestions} correct ({Math.round((score / totalQuestions) * 100)}%) — XP awarded!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetQuiz}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                Retry
              </button>
              <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono font-black flex items-center gap-2">
                <Trophy size={13} className="text-amber-400" />
                +{totalQuestions * 5} XP
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
