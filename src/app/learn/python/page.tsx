"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { motion } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import GalaxyPathMap from "@/components/learn/GalaxyPathMap";
import ProgressSidebar from "@/components/learn/ProgressSidebar";
import { Starfield } from "@/components/leaderboard/Starfield";
import {
  MOCK_PYTHON_CHAPTERS,
  MOCK_USER_PROGRESS,
  Chapter,
  Exercise,
  UserProgressData,
} from "@/components/learn/pythonData";

export default function PythonCoursePage() {
  const pathname = usePathname();
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_PYTHON_CHAPTERS);
  const [userProgress, setUserProgress] = useState<UserProgressData>(MOCK_USER_PROGRESS);
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(MOCK_PYTHON_CHAPTERS[0]);

  const [userSession, setUserSession] = useState<{
    id?: string;
    username?: string;
    avatarId?: string;
    level?: number;
    xpTotal?: number;
  } | null>(null);

  const getUserStorageKey = useCallback(
    (key: string) => {
      const userIdentifier = userSession?.id || userSession?.username || "guest";
      return `${key}_${userIdentifier}`;
    },
    [userSession]
  );

  // Scroll to top on navigation (unless a specific station hash is present)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const currentHash = window.location.hash.replace("#", "").toLowerCase();
    const isSpecificStationHash =
      currentHash.startsWith("ch-") || currentHash.startsWith("station-");

    if (currentHash === "python") {
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (!isSpecificStationHash) {
      const resetToTop = () => {
        window.scrollTo(0, 0);
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        }
      };
      resetToTop();
      const raf1 = requestAnimationFrame(resetToTop);
      const raf2 = requestAnimationFrame(() => requestAnimationFrame(resetToTop));
      const t1 = setTimeout(resetToTop, 50);
      const t2 = setTimeout(resetToTop, 150);
      const t3 = setTimeout(resetToTop, 400);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  // Fetch authenticated session
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.username) {
            setUserSession(data.user);
            setUserProgress((prev) => ({
              ...prev,
              username: data.user.username,
              avatarUrl: data.user.avatarId || data.user.avatar_url || prev.avatarUrl,
              level: data.user.level || prev.level,
            }));
          }
        }
      } catch {
        // Ignore network errors
      }
    }
    fetchUserSession();
  }, []);

  // Load user-specific progress from localStorage
  useEffect(() => {
    try {
      const chaptersKey = getUserStorageKey("cosmodex_python_chapters");
      const progressKey = getUserStorageKey("cosmodex_python_progress");

      const savedChapters =
        localStorage.getItem(chaptersKey) || localStorage.getItem("cosmodex_python_chapters");
      const savedProgress =
        localStorage.getItem(progressKey) || localStorage.getItem("cosmodex_python_progress");

      if (savedChapters) {
        const parsed = JSON.parse(savedChapters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedChapters = MOCK_PYTHON_CHAPTERS.map((defaultCh) => {
            const savedCh = parsed.find((c: Chapter) => c.id === defaultCh.id);
            if (!savedCh) return defaultCh;

            const mergedExercises = defaultCh.exercises.map((defaultEx) => {
              const savedEx = savedCh.exercises?.find(
                (e: Exercise) => e.id === defaultEx.id
              );
              return {
                ...defaultEx,
                isUnlocked: savedEx ? savedEx.isUnlocked : defaultEx.isUnlocked,
                isCompleted: savedEx ? savedEx.isCompleted : defaultEx.isCompleted,
              };
            });

            return {
              ...defaultCh,
              isUnlocked: savedCh.isUnlocked ?? defaultCh.isUnlocked,
              isCompleted: savedCh.isCompleted ?? defaultCh.isCompleted,
              exercises: mergedExercises,
            };
          });

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setChapters(mergedChapters);
          setSelectedChapter(mergedChapters[0]);
        }
      }

      if (savedProgress) {
        const parsedProg = JSON.parse(savedProgress);
        if (parsedProg) {
          setUserProgress({
            ...parsedProg,
            username: userSession?.username || parsedProg.username || "Explorer",
            avatarUrl:
              userSession?.avatarId || parsedProg.avatarUrl || "/images/avatars/nebula.webp",
          });
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [userSession, getUserStorageKey]);

  // Sync dynamic metrics
  useEffect(() => {
    const totalEx = chapters.reduce(
      (acc, ch) => acc + (ch.exercises ? ch.exercises.length : 0),
      0
    );
    const completedEx = chapters.reduce(
      (acc, ch) => acc + (ch.exercises ? ch.exercises.filter((e) => e.isCompleted).length : 0),
      0
    );

    const totalProjectsCount = chapters.filter((ch) => ch.isMilestone).length || 2;
    const completedProjectsCount = chapters.filter(
      (ch) => ch.isMilestone && ch.isCompleted
    ).length;

    const completedChaptersCount = chapters.filter((ch) => ch.isCompleted).length;
    const totalBadgesCount = chapters.length;

    const ch4Done = chapters[3]?.isCompleted ?? false;
    const ch8Done = chapters[7]?.isCompleted ?? false;
    const cheatSheetsCount = (ch4Done ? 1 : 0) + (ch8Done ? 1 : 0);

    const totalXpSum = chapters.reduce((acc, ch) => acc + (ch.xpValue || 0), 0) || 685;
    const courseEarnedXp = completedEx * 55 + completedChaptersCount * 50;
    const currentTotalXp = (userSession?.xpTotal ?? 0) + courseEarnedXp;
    const currentLevel = userSession?.level ?? Math.max(1, Math.floor(currentTotalXp / 250) + 1);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserProgress((prev) => ({
      ...prev,
      username: userSession?.username || prev.username || "Explorer",
      avatarUrl: userSession?.avatarId || prev.avatarUrl || "/images/avatars/nebula.webp",
      level: currentLevel,
      totalExercises: totalEx || prev.totalExercises,
      exercisesCompleted: completedEx,
      totalProjects: totalProjectsCount,
      projectsCompleted: completedProjectsCount,
      totalXp: totalXpSum,
      xpEarned: courseEarnedXp,
      totalBadges: totalBadgesCount,
      badgesUnlocked: completedChaptersCount,
      totalCheatSheets: 2,
      cheatSheetsUnlocked: cheatSheetsCount,
    }));
  }, [chapters, userSession]);

  // Scroll to station if a specific hash exists in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "").toLowerCase();

    if (hash && (hash.startsWith("ch-") || hash.startsWith("station-")) && chapters.length > 0) {
      const matched = chapters.find(
        (c) => c.id.toLowerCase() === hash || c.theoryLessonId?.toLowerCase() === hash
      );
      if (matched) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedChapter(matched);
        setTimeout(() => {
          const el = document.getElementById(matched.id) || document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [chapters]);

  // Save progress to localStorage
  useEffect(() => {
    try {
      const chaptersKey = getUserStorageKey("cosmodex_python_chapters");
      const progressKey = getUserStorageKey("cosmodex_python_progress");

      localStorage.setItem(chaptersKey, JSON.stringify(chapters));
      localStorage.setItem(progressKey, JSON.stringify(userProgress));
      localStorage.setItem("cosmodex_python_chapters", JSON.stringify(chapters));
      localStorage.setItem("cosmodex_python_progress", JSON.stringify(userProgress));
    } catch {
      // Ignore storage errors
    }
  }, [chapters, userProgress, userSession, getUserStorageKey]);

  // Find the first unlocked/in-progress chapter for the CTA
  const firstStation = chapters.find((ch) => ch.isUnlocked && !ch.isCompleted) || chapters[0];
  const ctaHref = `/learn/py-1/theory/${firstStation?.theoryLessonId || firstStation?.id || "in-the-beginning"}`;

  return (
    <main className="min-h-screen bg-[#05040d] relative text-white">
      <Navbar />

      {/* Background Space Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Starfield />
        <div className="absolute top-[5%] left-[25%] w-[45rem] h-[30rem] bg-purple-900/20 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[10%] w-[35rem] h-[35rem] bg-cyan-900/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[10%] w-[40rem] h-[30rem] bg-fuchsia-900/15 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-4 sm:mb-2">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back to Courses</span>
          </Link>
        </div>

        {/* Galaxy Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-14 pt-4 pb-10 flex flex-col items-center text-center"
        >
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] mb-5">
            PYTHON
          </h1>

          <p className="text-base sm:text-lg text-white/85 font-mono leading-relaxed max-w-2xl mx-auto mb-9">
            No endless list of chapters — chart a course through the{" "}
            <span className="text-[#E873C3] font-bold">Python galaxy</span>. Every planet is a
            station of exercises, and the{" "}
            <span className="text-[#C453D6] font-bold">dotted trail</span> shows exactly where you
            fly next.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Primary CTA → goes directly to theory */}
            <Link
              href={ctaHref}
              className="relative overflow-hidden group px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] hover:from-[#f085ce] hover:via-[#cf60e0] hover:to-[#9a42e3] text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center gap-2.5 shadow-[0_0_24px_rgba(232,115,195,0.35)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <BookOpen size={16} />
              <span>START STATION 01</span>
            </Link>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-amber-400 bg-amber-400/10 px-4 py-2.5 rounded-xl border border-amber-400/30">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span>
                {userProgress.xpEarned} / {userProgress.totalXp} XP EARNED
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Layout: Galaxy Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <GalaxyPathMap
              chapters={chapters}
              selectedChapterId={selectedChapter.id}
              onSelectChapter={(chapter) => setSelectedChapter(chapter)}
            />
          </div>

          <div className="lg:col-span-4 relative h-full">
            <ProgressSidebar
              selectedChapter={selectedChapter}
              userProgress={userProgress}
              onLaunchMission={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
