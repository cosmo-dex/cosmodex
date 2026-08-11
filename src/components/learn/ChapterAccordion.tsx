"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Chapter, Exercise } from "./pythonData";
import ExerciseRow from "./ExerciseRow";

interface ChapterAccordionProps {
  chapter: Chapter;
  defaultExpanded?: boolean;
  onStartExercise?: (exercise: Exercise) => void;
  isLast?: boolean;
}

export default function ChapterAccordion({
  chapter,
  defaultExpanded = false,
  onStartExercise,
  isLast = false,
}: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="relative flex gap-4 md:gap-6 group">
      {/* ── Vertical Timeline Line & Circle Node ── */}
      <div className="flex flex-col items-center shrink-0 w-10 md:w-12">
        {/* Circle Node */}
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm md:text-base z-10 transition-all shadow-lg ${
            chapter.isMilestone
              ? "border-[#00c8ff] bg-[#090518] text-[#00c8ff] shadow-[0_0_15px_rgba(0,200,255,0.3)]"
              : chapter.isUnlocked || isOpen
              ? "border-[#00c8ff] bg-[#0c081e] text-white shadow-[0_0_12px_rgba(0,200,255,0.2)]"
              : "border-white/20 bg-[#0a0618] text-white/50"
          }`}
        >
          {chapter.isMilestone ? (
            <MapPin size={20} className="text-[#00c8ff]" />
          ) : (
            <span>{chapter.number}</span>
          )}
        </div>

        {/* Connecting Vertical Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-white/20 via-white/10 to-white/20 my-1 group-hover:from-[#00c8ff]/40 transition-colors" />
        )}
      </div>

      {/* ── Chapter Main Content Card ── */}
      <div className="flex-1 pb-8">
        <div
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            isOpen
              ? "bg-[#0b071a]/90 border-cyan-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5),_0_0_20px_rgba(0,200,255,0.1)]"
              : "bg-[#090518]/70 border-white/10 hover:border-white/25 hover:bg-[#0c081f]"
          }`}
        >
          {/* Header Row (Clickable) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer select-none group/header"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg md:text-xl font-bold font-sans text-white group-hover/header:text-cyan-300 transition-colors">
                {chapter.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {chapter.isClubLocked && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#E873C3]/15 text-[#E873C3] border border-[#E873C3]/30 shadow-[0_0_10px_rgba(232,115,195,0.2)]">
                  CLUB
                </span>
              )}
              <ChevronDown
                size={20}
                className={`text-white/60 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-cyan-400" : "group-hover/header:text-white"
                }`}
              />
            </div>
          </button>

          {/* Expanded Content Drawer */}
          {isOpen && (
            <div className="px-5 pb-6 md:px-6 md:pb-6 pt-0 border-t border-white/5 animate-fade-in">
              {/* Description */}
              <p className="text-sm text-white/70 font-mono mb-6 leading-relaxed bg-[#120c24]/50 p-4 rounded-xl border border-white/5">
                {chapter.description}
              </p>

              {/* Exercises List */}
              <div className="flex flex-col gap-2.5">
                {chapter.exercises.map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onStart={onStartExercise}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
