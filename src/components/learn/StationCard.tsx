"use client";

import { motion, Variants } from "framer-motion";
import { Play, Star, AlertCircle, Rocket, CheckCircle2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Chapter, Exercise } from "./pythonData";

interface StationCardProps {
  chapter: Chapter;
  onLaunchMission?: (chapter: Chapter, exercise?: Exercise) => void;
}

export default function StationCard({ chapter, onLaunchMission }: StationCardProps) {
  const firstUnlockedExercise =
    chapter.exercises.find((ex) => ex.isUnlocked) || chapter.exercises[0];

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#090518]/95 border border-cyan-500/25 rounded-2xl p-6 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6),_0_0_20px_rgba(0,200,255,0.1)] transition-all"
    >
      {/* Station Header Badge */}
      <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase mb-2 block">
        {chapter.stationNumber}
      </span>

      {/* Chapter Title */}
      <h3 className="text-xl md:text-2xl font-bold font-mono text-white tracking-wide mb-2">
        {chapter.title}
      </h3>

      {/* Description */}
      <p className="text-xs font-mono text-white/70 leading-relaxed mb-4">
        {chapter.description}
      </p>

      {/* XP Earn Indicator */}
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-6 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 w-fit">
        <Star size={14} className="fill-amber-400 text-amber-400" />
        <span>{chapter.xpValue} XP</span>
      </div>

      {/* Locked Station Warning Banner */}
      {!chapter.isUnlocked && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono">
          <AlertCircle size={16} className="shrink-0 text-pink-400" />
          <span>Complete previous station to unlock exercises</span>
        </div>
      )}

      {/* Exercises List */}
      <div className="flex flex-col gap-2.5 mb-6">
        {chapter.exercises.map((exercise, i) => (
          <motion.div
            key={exercise.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={rowVariants}
            onClick={() => onLaunchMission && onLaunchMission(chapter, exercise)}
            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              exercise.isCompleted
                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:border-emerald-400 hover:bg-emerald-950/50"
                : exercise.isUnlocked
                ? "bg-[#120d28] border-cyan-500/40 text-white hover:border-cyan-400 hover:bg-[#181135]"
                : "bg-[#120d28]/70 border-purple-500/25 text-white/80 hover:border-purple-400 hover:bg-[#181135]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`text-[10px] uppercase font-bold shrink-0 w-20 ${
                  exercise.isCompleted
                    ? "text-emerald-400"
                    : exercise.isUnlocked
                    ? "text-cyan-400/80"
                    : "text-purple-400/80"
                }`}
              >
                {exercise.numberLabel}
              </span>
              <span className={`truncate font-medium ${exercise.isCompleted ? "text-emerald-300 line-through opacity-85" : ""}`}>
                {exercise.title}
              </span>
            </div>

            <div className="shrink-0 ml-2 flex items-center gap-2">
              {exercise.isCompleted ? (
                <>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 uppercase tracking-widest hidden sm:inline">
                    Done
                  </span>
                  <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-400/20" />
                </>
              ) : exercise.isUnlocked ? (
                <Play size={14} className="text-cyan-400 fill-cyan-400" />
              ) : (
                <Play size={14} className="text-purple-400 fill-purple-400" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        {(chapter.documentation || chapter.theoryLessonId) && (
          <Link
            href={`/learn/py-1/theory/${chapter.theoryLessonId || chapter.id}`}
            className="flex-1 py-3 px-4 rounded-xl font-bold font-mono text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-[#E873C3]/40 bg-[#E873C3]/10 text-[#E873C3] hover:bg-[#E873C3]/20 hover:border-[#E873C3]"
          >
            <BookOpen size={15} />
            <span>Read Theory</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => onLaunchMission && onLaunchMission(chapter, firstUnlockedExercise)}
          className="flex-1 py-3 px-4 rounded-xl font-bold font-mono text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-98 bg-gradient-to-r from-[#FF007A] via-[#E000FF] to-[#9E00F6] text-white hover:opacity-95 shadow-md shadow-pink-500/20 hover:shadow-pink-500/40"
        >
          <Rocket size={15} />
          <span>{chapter.isUnlocked ? "Launch Mission" : "Preview Station"}</span>
        </button>
      </div>
    </motion.div>
  );
}
