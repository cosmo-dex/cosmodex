"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  BookOpen,
  Lock,
  ChevronRight,
  Star,
  Zap,
  AlertCircle,
  Terminal,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Chapter } from "./pythonData";

interface StationCardProps {
  chapter: Chapter;
  onLaunchMission?: (chapter: Chapter) => void; // kept for API compat, unused
}

export default function StationCard({ chapter }: StationCardProps) {
  const totalEx = chapter.exercises.length;
  const completedEx = chapter.exercises.filter((e) => e.isCompleted).length;
  const progressPct = totalEx > 0 ? Math.round((completedEx / totalEx) * 100) : 0;

  const theoryHref = `/learn/py-1/theory/${chapter.theoryLessonId || chapter.id}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/10 bg-[#0d0f1a] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        {/* ── Top Accent Bar ── */}
        <div className="h-[3px] bg-gradient-to-r from-[#E873C3] via-[#9E00F6] to-[#00FFE9]" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* ── Station Header ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#00FFE9]">
                {chapter.stationNumber}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                  <Star size={11} className="fill-amber-400" />
                  {chapter.xpValue} XP
                </span>
                {chapter.isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 size={11} />
                    Done
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {chapter.title}
            </h3>

            <p className="text-[13px] text-white/55 font-sans leading-relaxed">
              {chapter.description}
            </p>
          </div>

          {/* ── Feature Badges ── */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00FFE9]/[0.07] border border-[#00FFE9]/20 text-[10px] font-mono font-bold text-[#00FFE9] uppercase tracking-wider">
              <Terminal size={10} />
              Code Labs
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9E00F6]/[0.07] border border-[#9E00F6]/20 text-[10px] font-mono font-bold text-[#C878F0] uppercase tracking-wider">
              <HelpCircle size={10} />
              MCQ Quiz
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFA249]/[0.07] border border-[#FFA249]/20 text-[10px] font-mono font-bold text-[#FFA249] uppercase tracking-wider">
              <Zap size={10} />
              {totalEx} Exercises
            </span>
          </div>

          {/* ── Locked Banner ── */}
          {!chapter.isUnlocked && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/50 text-xs font-mono">
              <Lock size={14} className="shrink-0 text-white/30" />
              <span>Complete the previous station to unlock</span>
            </div>
          )}

          {/* ── Exercise List ── */}
          {chapter.isUnlocked && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/35">
                  Exercises
                </span>
                <span className="text-[10px] font-mono text-white/35">
                  {completedEx}/{totalEx} done
                </span>
              </div>

              <div className="space-y-1.5">
                {chapter.exercises.map((exercise, i) => {
                  const isBonus = exercise.numberLabel?.toLowerCase().includes("bonus");
                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[12px] font-mono transition-all
                        ${
                          exercise.isCompleted
                            ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-300"
                            : exercise.isUnlocked
                            ? "bg-white/[0.03] border-white/[0.08] text-white/80"
                            : "bg-white/[0.02] border-white/[0.05] text-white/30"
                        }`}
                    >
                      {/* Status dot */}
                      <span className="shrink-0">
                        {exercise.isCompleted ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : exercise.isUnlocked ? (
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/25 inline-block" />
                        ) : (
                          <Lock size={13} className="text-white/20" />
                        )}
                      </span>

                      {/* Label & title */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider shrink-0 w-16 ${
                          isBonus ? "text-[#FFA249]" : exercise.isCompleted ? "text-emerald-400" : "text-white/35"
                        }`}
                      >
                        {exercise.numberLabel}
                      </span>
                      <span className={`truncate flex-1 ${exercise.isCompleted ? "line-through opacity-70" : ""}`}>
                        {exercise.title}
                      </span>

                      {exercise.isCompleted && (
                        <span className="shrink-0 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                          ✓
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Progress Bar ── */}
          {chapter.isUnlocked && totalEx > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/35">
                <span>Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#E873C3] to-[#9E00F6]"
                />
              </div>
            </div>
          )}

          {/* ── Locked CTA ── */}
          {!chapter.isUnlocked && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFA249]/[0.06] border border-[#FFA249]/20 text-[#FFA249] text-[12px] font-mono">
              <AlertCircle size={14} className="shrink-0" />
              <span>Finish the previous station to unlock this one</span>
            </div>
          )}

          {/* ── Action Buttons ── */}
          {(chapter.documentation || chapter.theoryLessonId) && (
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Primary — Theory & MCQs */}
              <Link
                href={theoryHref}
                className="w-full py-3 px-4 rounded-xl font-bold font-mono text-[12px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#E873C3] to-[#9E00F6] text-white hover:opacity-90 shadow-[0_0_20px_rgba(158,0,246,0.25)] hover:shadow-[0_0_30px_rgba(158,0,246,0.4)] active:scale-[0.98]"
              >
                <BookOpen size={14} />
                <span>Study Theory & MCQs</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
