"use client";

import { Exercise } from "./pythonData";

interface ExerciseRowProps {
  exercise: Exercise;
  onStart?: (exercise: Exercise) => void;
}

export default function ExerciseRow({ exercise, onStart }: ExerciseRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 px-5 bg-[#0e0a1b]/60 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-6 md:gap-12 min-w-0">
        <span className="text-xs font-mono font-medium text-white/50 w-24 shrink-0">
          {exercise.numberLabel}
        </span>
        <span className="text-sm font-medium text-white/90 truncate">
          {exercise.title}
        </span>
      </div>

      <div className="shrink-0 ml-4">
        {exercise.isUnlocked ? (
          <button
            onClick={() => onStart && onStart(exercise)}
            className="px-6 py-1.5 rounded-lg bg-[#00c8ff] hover:bg-[#33d6ff] text-[#06040a] font-bold text-xs shadow-[0_0_15px_rgba(0,200,255,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            Start
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-1.5 rounded-lg bg-[#181328]/80 border border-white/10 text-white/30 font-bold text-xs cursor-not-allowed select-none"
          >
            ???
          </button>
        )}
      </div>
    </div>
  );
}
