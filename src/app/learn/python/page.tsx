"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import GalaxyPathMap from "@/components/learn/GalaxyPathMap";
import ProgressSidebar from "@/components/learn/ProgressSidebar";
import { Starfield } from "@/components/leaderboard/Starfield";
import {
  MOCK_USER_PROGRESS,
  Chapter,
  UserProgressData,
} from "@/components/learn/pythonData";

interface ProgressApiResponse {
  completedStationSlugs?: string[];
  completedModuleIds?: string[];
  completedStationNumbers?: number[];
  totalCompletedExercises?: number;
  totalExercises?: number;
  completedMilestoneProjects?: number;
  totalMilestoneProjects?: number;
  user?: {
    username?: string;
    avatarUrl?: string;
    level?: number;
    xpTotal?: number;
  };
}

function getCourseSlugFromUrl(): string {
  if (typeof window !== "undefined") {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments[0] === "learn" && segments[1]) {
      return segments[1].toLowerCase();
    }
  }
  return "python";
}

function getCourseStorageKey(course: string): string {
  return `cosmodex_nodes_${course.toLowerCase()}`;
}

function formatCourseTitle(slug: string): string {
  if (!slug) return "Python";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PythonCoursePage() {
  const pathname = usePathname();

  const courseCode = useMemo(() => {
    if (!pathname) return getCourseSlugFromUrl();
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "learn" && segments[1] ? segments[1].toLowerCase() : "python";
  }, [pathname]);

  const courseDisplayName = useMemo(() => formatCourseTitle(courseCode), [courseCode]);
  const storageKey = useMemo(() => getCourseStorageKey(courseCode), [courseCode]);

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const slug = getCourseSlugFromUrl();
        const stored = sessionStorage.getItem(getCourseStorageKey(slug));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
    return [];
  });
  const [loadingChapters, setLoadingChapters] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const slug = getCourseSlugFromUrl();
        const stored = sessionStorage.getItem(getCourseStorageKey(slug));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return false;
          }
        }
      }
    } catch {}
    return true;
  });
  const [userProgress, setUserProgress] = useState<UserProgressData>(MOCK_USER_PROGRESS);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const slug = getCourseSlugFromUrl();
        const stored = sessionStorage.getItem(getCourseStorageKey(slug));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0]?.id || "";
          }
        }
      }
    } catch {}
    return "";
  });

  const selectedChapter = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  }, [chapters, selectedChapterId]);

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

  useEffect(() => {
    let active = true;

    async function initCourseData() {
      try {
        const [sessionRes, tracksRes, progressRes] = await Promise.allSettled([
          fetch("/api/auth/session", { credentials: "include" }),
          fetch(`/api/learning/tracks/${courseCode}`),
          fetch(`/api/learning/progress?course=${courseCode}`),
        ]);

        if (!active) return;

        // 1. Session user
        if (sessionRes.status === "fulfilled" && sessionRes.value.ok) {
          const sessionData = await sessionRes.value.json();
          if (sessionData?.user?.username) {
            setUserProgress((prev) => ({
              ...prev,
              username: sessionData.user.username,
              avatarUrl: sessionData.user.avatarId || sessionData.user.avatar_url || prev.avatarUrl,
              level: sessionData.user.level || prev.level,
            }));
          }
        }

        // 2. Track chapters
        let loadedChapters: Chapter[] = [];
        if (tracksRes.status === "fulfilled" && tracksRes.value.ok) {
          const trackData = await tracksRes.value.json();
          loadedChapters = Array.isArray(trackData?.chapters) ? trackData.chapters : [];
        }

        // 3. Student progress
        let progData: ProgressApiResponse | null = null;
        if (progressRes.status === "fulfilled" && progressRes.value.ok) {
          const pJson = await progressRes.value.json();
          progData = pJson?.progress as ProgressApiResponse;
        }

        const guestCompleted = new Set<string>();
        try {
          if (typeof window !== "undefined") {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("station_completed_") && localStorage.getItem(key) === "true") {
                guestCompleted.add(key.replace("station_completed_", ""));
              }
            }
          }
        } catch {}

        const completedSlugs = new Set(progData?.completedStationSlugs || []);
        const completedIds = new Set(progData?.completedModuleIds || []);
        const completedNums = new Set(progData?.completedStationNumbers || []);

        setChapters((prevChapters) => {
          const baseChapters = loadedChapters.length > 0 ? loadedChapters : prevChapters;
          const merged = baseChapters.map((ch) => {
            const isCleared =
              completedIds.has(ch.id) ||
              completedSlugs.has(ch.id) ||
              completedSlugs.has(ch.theoryLessonId || "") ||
              completedNums.has(ch.number) ||
              guestCompleted.has(ch.id) ||
              guestCompleted.has(ch.theoryLessonId || "");
            return {
              ...ch,
              isCompleted: Boolean(isCleared || ch.isCompleted),
              isUnlocked: true,
              exercises: (ch.exercises || []).map((ex) => ({
                ...ex,
                isUnlocked: true,
                isCompleted: Boolean(
                  isCleared ||
                  completedIds.has(ex.id) ||
                  completedSlugs.has(ex.id) ||
                  guestCompleted.has(ex.id) ||
                  ex.isCompleted
                ),
              })),
            };
          });

          if (loadedChapters.length > 0) {
            try {
              if (typeof window !== "undefined") {
                sessionStorage.setItem(storageKey, JSON.stringify(merged));
              }
            } catch {}
            setSelectedChapterId((prev) => {
              if (prev && merged.some((c) => c.id === prev)) {
                return prev;
              }
              return merged[0]?.id || "";
            });
          }

          return merged;
        });

        if (progData) {
          const safeProg = progData;
          setUserProgress((prev) => ({
            ...prev,
            username: safeProg.user?.username || prev.username,
            avatarUrl: safeProg.user?.avatarUrl || prev.avatarUrl,
            level: safeProg.user?.level || prev.level,
            exercisesCompleted: safeProg.totalCompletedExercises ?? prev.exercisesCompleted,
            totalExercises: safeProg.totalExercises || prev.totalExercises,
            projectsCompleted: safeProg.completedMilestoneProjects ?? prev.projectsCompleted,
            totalProjects: safeProg.totalMilestoneProjects || prev.totalProjects,
            xpEarned: safeProg.user?.xpTotal ?? prev.xpEarned,
          }));
        }
      } catch (err) {
        console.warn("Failed to load course data in parallel", err);
      } finally {
        if (active) {
          setLoadingChapters(false);
        }
      }
    }

    initCourseData();

    return () => {
      active = false;
    };
  }, [courseCode, storageKey]);

  const effectiveUserProgress = useMemo(() => {
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

    const totalXpSum = chapters.reduce((acc, ch) => acc + (ch.xpValue || 0), 0) || 685;

    return {
      ...userProgress,
      totalExercises: totalEx || userProgress.totalExercises,
      exercisesCompleted: Math.max(userProgress.exercisesCompleted, completedEx),
      totalProjects: totalProjectsCount,
      projectsCompleted: Math.max(userProgress.projectsCompleted, completedProjectsCount),
      totalXp: totalXpSum,
    };
  }, [chapters, userProgress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "").toLowerCase();

    if (hash && (hash.startsWith("ch-") || hash.startsWith("station-")) && chapters.length > 0) {
      const matched = chapters.find(
        (c) => c.id.toLowerCase() === hash || c.theoryLessonId?.toLowerCase() === hash
      );
      if (matched) {
        setTimeout(() => {
          setSelectedChapterId(matched.id);
          const el = document.getElementById(matched.id) || document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [chapters]);

  return (
    <main className="min-h-screen bg-[#05040d] relative text-white">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Starfield />
        <div className="absolute top-[5%] left-[25%] w-[45rem] h-[30rem] bg-purple-900/20 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[10%] w-[35rem] h-[35rem] bg-cyan-900/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[10%] w-[40rem] h-[30rem] bg-fuchsia-900/15 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-14 pt-4 pb-10 flex flex-col items-center text-center"
        >
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] mb-5 uppercase">
            {courseDisplayName}
          </h1>

          <p className="text-base sm:text-lg text-white/85 font-mono leading-relaxed max-w-2xl mx-auto">
            Chart a course through the{" "}
            <span className="text-[#E873C3] font-bold">{courseDisplayName} galaxy</span>. Every planet is a
            station of theory &amp; knowledge check MCQs.
          </p>
        </motion.div>

        {loadingChapters ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw size={28} className="animate-spin text-cyan-400 opacity-80" />
            <p className="text-xs font-mono uppercase tracking-widest text-white/50">
              Loading Live Curriculum Stations...
            </p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="bg-[#0c0920]/80 border border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto backdrop-blur-xl">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-300">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold font-mono text-white uppercase tracking-wider">
              No Published Stations
            </h3>
            <p className="text-xs sm:text-sm font-mono text-white/60 leading-relaxed">
              Curriculum stations created in the CosmoDex Admin portal will appear here immediately once published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <GalaxyPathMap
                chapters={chapters}
                selectedChapterId={selectedChapter?.id || ""}
                onSelectChapter={(chapter) => {
                  setSelectedChapterId(chapter.id);
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    const sidebar = document.getElementById("station-detail-sidebar");
                    if (sidebar) {
                      sidebar.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }
                }}
                courseTitle={courseDisplayName}
              />
            </div>

            <div id="station-detail-sidebar" className="lg:col-span-5 w-full lg:sticky lg:top-28 z-20 transition-all duration-300">
              {selectedChapter && (
                <ProgressSidebar
                  selectedChapter={selectedChapter}
                  userProgress={effectiveUserProgress}
                  courseId={courseCode}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
