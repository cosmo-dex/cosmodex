"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { List, ChevronLeft, ChevronRight, X, RefreshCw, Lock } from "lucide-react";
import { TheoryExercise } from "@/data/theoryExercisesData";

interface DrawerStation {
  id: string;
  title: string;
  number: number;
  theoryLessonId?: string;
}

interface TheoryFooterProps {
  exercise: TheoryExercise;
  onToggleComplete?: () => void;
  isCompleted?: boolean;
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

export default function TheoryFooter({
  exercise,
  isCompleted = false,
}: TheoryFooterProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stations, setStations] = useState<DrawerStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const cleanCourseCode = normalizeCourseSlug(exercise.courseId);

  const nextHref = exercise.nextLessonId
    ? `/learn/${exercise.courseId}/theory/${exercise.nextLessonId}`
    : `/learn/${cleanCourseCode}`;

  useEffect(() => {
    if (!drawerOpen) return;
    let active = true;
    const courseCode = exercise.courseId === "py-1" ? "python" : exercise.courseId;
    fetch(`/api/learning/tracks/${courseCode}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.chapters && Array.isArray(data.chapters)) {
          setStations(
            data.chapters.map((ch: { id: string; title: string; number: number; theoryLessonId?: string }) => ({
              id: ch.id,
              title: ch.title,
              number: ch.number,
              theoryLessonId: ch.theoryLessonId || ch.id,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingStations(false);
      });
    return () => {
      active = false;
    };
  }, [drawerOpen, exercise.courseId]);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#080d19] border-t border-[#1b263b] px-4 sm:px-8 py-3 flex items-center justify-between font-sans shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              setDrawerOpen(true);
              setLoadingStations(true);
            }}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] transition-all cursor-pointer shadow-sm"
            title="Station Modules"
            aria-label="Station Modules Drawer"
          >
            <List size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-[260px]">
              {exercise.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back Button */}
          {exercise.prevLessonId ? (
            <Link
              href={`/learn/${exercise.courseId}/theory/${exercise.prevLessonId}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#E873C3]/50 hover:bg-[#E873C3]/10 hover:text-[#E873C3] text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
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

          {/* Next Button - Clickable ONLY when isCompleted is true */}
          {isCompleted ? (
            <Link
              href={nextHref}
              className="px-5 py-2 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/30 hover:bg-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,233,0.35)] cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <button
              disabled
              title="Pass the quiz (score >= 3/5) to unlock Next"
              className="px-5 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-slate-600 text-xs font-mono font-semibold uppercase tracking-wider cursor-not-allowed flex items-center gap-1.5"
            >
              <Lock size={12} className="text-slate-600" />
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </footer>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 pointer-events-auto"
            />

            <motion.aside
              data-lenis-prevent
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-96 bg-[#080d19] border-r border-[#1b263b] shadow-[10px_0_30px_rgba(0,0,0,0.9)] flex flex-col p-6 font-sans will-change-transform"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                    {exercise.courseTitle} Stations
                  </h3>
                  <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
                    Select a station to study
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

              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto space-y-3 pr-1 pb-12 overscroll-contain touch-pan-y custom-sidebar-scrollbar"
              >
                {loadingStations ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-xs font-mono text-white/50">
                    <RefreshCw size={14} className="animate-spin text-cyan-400" />
                    <span>Loading stations...</span>
                  </div>
                ) : stations.length > 0 ? (
                  stations.map((st) => {
                    const lessonId = st.theoryLessonId || st.id;
                    const isCurrent = exercise.id === lessonId || exercise.id === st.id;
                    const numStr = String(st.number).padStart(2, "0");

                    return (
                      <Link
                        key={st.id}
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
                            {st.title}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-white/40">
                    No stations available
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
