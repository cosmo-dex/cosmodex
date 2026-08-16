"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { List, Check, ChevronLeft, ChevronRight, X, Rocket } from "lucide-react";
import confetti from "canvas-confetti";
import { TheoryExercise } from "@/data/theoryExercisesData";
import { PYTHON_COURSE_CHAPTERS } from "@/data/courses/python";

interface TheoryFooterProps {
  exercise: TheoryExercise;
  onToggleComplete?: () => void;
  isCompleted?: boolean;
}

export default function TheoryFooter({
  exercise,
  onToggleComplete,
  isCompleted: externalIsCompleted,
}: TheoryFooterProps) {
  const [internalCompleted, setInternalCompleted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isCompleted =
    externalIsCompleted !== undefined
      ? externalIsCompleted
      : internalCompleted;

  const handleMarkComplete = () => {
    if (!isCompleted) {
      // Fire celebratory space confetti burst!
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.9 },
        colors: ["#38bdf8", "#e873c3", "#a855f7", "#ffffff", "#4ade80"],
        ticks: 200,
        gravity: 1,
        decay: 0.94,
      });
    }

    if (onToggleComplete) {
      onToggleComplete();
    } else {
      setInternalCompleted(!internalCompleted);
    }
  };

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#080d19] border-t border-[#1b263b] px-4 sm:px-8 py-3 flex items-center justify-between font-sans shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Drawer Toggle, Exercise Info & XP Tag */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Exercise List Drawer Icon */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] transition-all cursor-pointer shadow-sm"
            title="Exercise List"
            aria-label="Exercise List Drawer"
          >
            <List size={18} />
          </button>

          {/* Title & XP Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-[260px]">
              {exercise.title}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm">
              {exercise.xp} XP
            </span>
          </div>
        </div>

        {/* Center: Mark Complete Button Matching Site Theme */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleMarkComplete}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer active:scale-95 ${
              isCompleted
                ? "bg-[#22c55e] text-black border border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.5)] scale-105"
                : "bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] hover:from-[#f085ce] hover:to-[#9a42e4] text-white border border-[#E873C3]/50 shadow-[0_0_20px_rgba(232,115,195,0.4)] hover:shadow-[0_0_30px_rgba(232,115,195,0.6)]"
            }`}
          >
            <Check size={18} className="stroke-[3]" />
            <span>{isCompleted ? "Completed" : "Mark complete"}</span>
          </button>
        </div>

        {/* Right: Back & Next Navigation Buttons + Galaxy Sandbox */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/learn/python#${exercise.id || ""}`}
            className="px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20 text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,233,0.15)]"
            title="Go to Exercises"
          >
            <Rocket size={15} className="text-cyan-400" />
            <span className="hidden sm:inline">Exercise</span>
          </Link>
          {exercise.prevLessonId ? (
            <Link
              href={`/learn/${exercise.courseId}/theory/${exercise.prevLessonId}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-slate-600 text-xs font-mono font-semibold uppercase tracking-wider cursor-not-allowed flex items-center gap-1.5"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {exercise.nextLessonId ? (
            <Link
              href={`/learn/${exercise.courseId}/theory/${exercise.nextLessonId}`}
              className="px-4 py-2 rounded-xl border border-[#E873C3]/50 bg-[#E873C3]/15 text-[#E873C3] hover:border-[#E873C3] hover:bg-[#E873C3]/25 text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(232,115,195,0.2)]"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-slate-600 text-xs font-mono font-semibold uppercase tracking-wider cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </footer>

      {/* ── Left Sliding Side Drawer Menu ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* High Performance Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 pointer-events-auto"
            />

            {/* Fast GPU-Accelerated Sliding Drawer Panel */}
            <motion.aside
              data-lenis-prevent
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-96 bg-[#080d19] border-r border-[#1b263b] shadow-[10px_0_30px_rgba(0,0,0,0.9)] flex flex-col p-6 font-sans will-change-transform"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                    {exercise.courseTitle} Exercises
                  </h3>
                  <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
                    Select an exercise to jump to
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] transition-all cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Exercises List */}
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto space-y-3 pr-1 pb-12 overscroll-contain touch-pan-y custom-sidebar-scrollbar"
              >
                {PYTHON_COURSE_CHAPTERS.map((ch, idx) => {
                  const lessonId = ch.theoryLessonId || ch.id;
                  const isCurrent = exercise.id === lessonId || exercise.id === ch.id;
                  const numStr = String(idx + 1).padStart(2, "0");
                  const displayTitle = ch.documentation?.title || ch.title;

                  return (
                    <Link
                      key={ch.id}
                      href={`/learn/${exercise.courseId || "py-1"}/theory/${lessonId}`}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-[#E873C3]/15 border-[#E873C3]/60 text-white shadow-[0_0_15px_rgba(232,115,195,0.2)] font-bold"
                          : "bg-[#0d1527] border-white/10 text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-slate-300 shrink-0">
                          {numStr}
                        </div>
                        <span className="text-xs font-sans font-bold truncate">
                          {displayTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 ml-2">
                        {ch.xpValue || 10} XP
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
