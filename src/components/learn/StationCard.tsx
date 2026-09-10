"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Chapter } from "./pythonData";

interface StationCardProps {
  chapter: Chapter;
  courseId?: string;
}

export default function StationCard({ chapter, courseId }: StationCardProps) {
  const isCompleted = Boolean(chapter.isCompleted);
  const trackSlug = courseId || "py-1";
  const theoryHref = `/learn/${trackSlug}/theory/${chapter.theoryLessonId || chapter.id}`;

  const topics = useMemo(() => {
    if (chapter.documentation?.sections && Array.isArray(chapter.documentation.sections)) {
      const headings = chapter.documentation.sections
        .map((s) => s.heading)
        .filter((h): h is string => Boolean(h && h.trim().length > 0));
      if (headings.length > 0) return headings;
    }
    return [
      "Core Concepts & Syntax",
      "Code Demonstrations & Explanations",
      "Concept Knowledge Quiz (MCQs)",
    ];
  }, [chapter.documentation]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-3xl border border-[#1e153b] bg-[#070514]/95 p-5 sm:p-6 space-y-5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        {/* ── Top Station Number & Title ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-black tracking-[0.2em] text-[#00FFE9] uppercase">
              {chapter.stationNumber || `STATION ${String(chapter.number).padStart(2, "0")}`}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Ready to Study
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white uppercase leading-tight pt-1">
            {chapter.title}
          </h2>

          <p className="text-xs sm:text-[13px] font-mono text-white/70 leading-relaxed pt-1">
            {chapter.description}
          </p>
        </div>

        {/* ── Feature Badges Row (Pure Theory & MCQs) ── */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#002f3c]/80 border border-[#00FFE9]/40 text-[#00FFE9] font-mono font-black text-[11px] tracking-wider uppercase shadow-[0_0_12px_rgba(0,255,233,0.15)]">
            <BookOpen size={13} className="text-[#00FFE9]" />
            <span>THEORY LESSON</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#240c42]/80 border border-[#9E00F6]/40 text-[#c084fc] font-mono font-black text-[11px] tracking-wider uppercase shadow-[0_0_12px_rgba(158,0,246,0.15)]">
            <HelpCircle size={13} className="text-[#c084fc]" />
            <span>CONCEPT MCQS</span>
          </div>
        </div>

        {/* ── Topics Covered in this Station ── */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase">
            <span className="text-white/45 flex items-center gap-1.5">
              <Layers size={13} className="text-purple-400" />
              TOPICS COVERED
            </span>
            <span className="text-[#00FFE9] text-[10px]">
              {topics.length} MODULES
            </span>
          </div>

          <div className="space-y-2">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#0c0920] border border-[#221940] text-xs font-mono text-white/85 transition-all"
              >
                <span className="w-5 h-5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-400 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="truncate flex-1 font-medium">{topic}</span>
                {isCompleted ? (
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles size={12} className="text-white/20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Primary Action CTA: START THEORY & MCQS ── */}
        <div className="pt-2">
          <Link
            href={theoryHref}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#E000FF] to-[#9E00F6] hover:opacity-95 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-[0_0_24px_rgba(255,0,122,0.35)] hover:shadow-[0_0_32px_rgba(255,0,122,0.55)] transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 text-center group"
          >
            <BookOpen size={16} className="shrink-0 text-white" />
            <span>{isCompleted ? "REVIEW THEORY & MCQS" : "START THEORY & MCQS"}</span>
            <ArrowRight
              size={16}
              className="shrink-0 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
