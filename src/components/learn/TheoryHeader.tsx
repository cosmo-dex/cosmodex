"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface TheoryHeaderProps {
  courseId?: string;
  exerciseIndex?: number;
  totalExercises?: number;
  exerciseId?: string;
  chapterTitle?: string;
}

export default function TheoryHeader({
  courseId,
  exerciseIndex,
  totalExercises,
  exerciseId,
  chapterTitle,
}: TheoryHeaderProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  const targetCourse = courseId === "py-1" ? "python" : courseId || "python";
  const fallbackHref = `/learn/${targetCourse}${exerciseId ? `#${exerciseId}` : ""}`;

  return (
    <header className="fixed top-16 left-0 right-0 z-30 bg-[#080d19] border-b border-[#1b263b] px-4 sm:px-8 py-3 flex items-center justify-between font-sans shadow-md">
      <div className="flex items-center gap-3">
        {courseId && (
          <Link
            href={fallbackHref}
            onClick={handleBack}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] transition-all cursor-pointer"
            title="Back to Station Map"
          >
            <ArrowLeft size={16} />
          </Link>
        )}

        {exerciseIndex !== undefined && totalExercises !== undefined && (
          <span className="text-xs font-mono font-bold text-slate-300 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] shadow-sm">
            Station {String(exerciseIndex).padStart(2, "0")} / {totalExercises}
          </span>
        )}

        {chapterTitle && (
          <span className="text-xs font-sans font-semibold text-white/70 hidden md:inline truncate max-w-xs">
            {chapterTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5" />
    </header>
  );
}
