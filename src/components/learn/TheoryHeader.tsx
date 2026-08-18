"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

interface TheoryHeaderProps {
  activeGrindersCount?: number;
  courseId?: string;
  exerciseIndex?: number;
  totalExercises?: number;
  exerciseId?: string;
}

export default function TheoryHeader({
  activeGrindersCount = 4,
  courseId,
  exerciseIndex,
  totalExercises,
  exerciseId,
}: TheoryHeaderProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  const fallbackHref =
    courseId === "py-1" || courseId === "python"
      ? `/learn/python${exerciseId ? `#${exerciseId}` : ""}`
      : `/learn/${courseId || ""}`;

  return (
    <header className="fixed top-16 left-0 right-0 z-30 bg-[#080d19] border-b border-[#1b263b] px-4 sm:px-8 py-3 flex items-center justify-between font-sans shadow-md">
      {/* Left: Dashboard Button, Back Arrow & Exercise Counter */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          prefetch={true}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm"
          title="Dashboard"
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

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
            Exercise {exerciseIndex}/{totalExercises}
          </span>
        )}
      </div>

      {/* Right: Active Grinders Avatar Stack */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2 overflow-hidden">
          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#080d19] bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
            🧙‍♂️
          </div>
          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#080d19] bg-gradient-to-tr from-[#E873C3] to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            👾
          </div>
          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#080d19] bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
            🤖
          </div>
        </div>
        <span className="text-xs font-mono text-[#94a3b8] font-medium hidden sm:inline">
          +{activeGrindersCount} also grinding
        </span>
      </div>
    </header>
  );
}
