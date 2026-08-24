"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import { motion } from "framer-motion";
import { Star, Rocket } from "lucide-react";
import GalaxyPathMap from "@/components/learn/GalaxyPathMap";
import ProgressSidebar from "@/components/learn/ProgressSidebar";
import { Starfield } from "@/components/leaderboard/Starfield";
import MissionModal from "@/components/learn/MissionModal";
import SmoothScroll from "@/components/landing/SmoothScroll";
import {
  MOCK_PYTHON_CHAPTERS,
  MOCK_USER_PROGRESS,
  Chapter,
  Exercise,
  UserProgressData,
} from "@/components/learn/pythonData";

export default function PythonCoursePage() {
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_PYTHON_CHAPTERS);
  const [userProgress, setUserProgress] = useState<UserProgressData>(MOCK_USER_PROGRESS);
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(MOCK_PYTHON_CHAPTERS[0]);
  const [isMissionOpen, setIsMissionOpen] = useState<boolean>(false);
  const [activeMissionChapter, setActiveMissionChapter] = useState<Chapter | null>(null);
  const [activeMissionExercise, setActiveMissionExercise] = useState<Exercise | null>(null);

  // Always scroll to top of page on initial mount unless a hash anchor is present
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  // Load user progress from localStorage on initial render
  useEffect(() => {
    try {
      const savedChapters = localStorage.getItem("cosmodex_python_chapters");
      const savedProgress = localStorage.getItem("cosmodex_python_progress");
      if (savedChapters) {
        const parsed = JSON.parse(savedChapters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved completion progress with latest MOCK_PYTHON_CHAPTERS data structure
          const mergedChapters = MOCK_PYTHON_CHAPTERS.map((defaultCh) => {
            const savedCh = parsed.find((c: Chapter) => c.id === defaultCh.id);
            if (!savedCh) return defaultCh;

            const mergedExercises = defaultCh.exercises.map((defaultEx) => {
              const savedEx = savedCh.exercises?.find((e: Exercise) => e.id === defaultEx.id);
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
          setUserProgress(parsedProg);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Scroll to station if hash exists in URL (e.g. /learn/python#ch-2)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && chapters.length > 0) {
      const matched = chapters.find(
        (c) => c.id === hash || c.theoryLessonId === hash
      );
      if (matched) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedChapter(matched);
        setTimeout(() => {
          const el = document.getElementById(matched.id) || document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [chapters]);

  // Save chapters and progress to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("cosmodex_python_chapters", JSON.stringify(chapters));
      localStorage.setItem("cosmodex_python_progress", JSON.stringify(userProgress));
    } catch {
      // Ignore storage errors
    }
  }, [chapters, userProgress]);

  const handleLaunchMission = (chapter: Chapter, exercise?: Exercise) => {
    const targetExercise = exercise || chapter.exercises.find((ex) => ex.isUnlocked) || chapter.exercises[0];
    setSelectedChapter(chapter);
    setActiveMissionChapter(chapter);
    setActiveMissionExercise(targetExercise);
    setIsMissionOpen(true);
  };

  const handleCloseMission = () => {
    setIsMissionOpen(false);
    if (activeMissionChapter) {
      setTimeout(() => {
        const el =
          document.getElementById(activeMissionChapter.id) ||
          document.getElementById(`station-${activeMissionChapter.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  };

  const handleCompleteExercise = (chapterId: string, exerciseId: string) => {
    setChapters((prevChapters) => {
      let newlyUnlockedNextStation = false;

      const nextChapters = prevChapters.map((ch) => {
        if (ch.id !== chapterId) return ch;

        const updatedExercises = ch.exercises.map((ex, exIdx, arr) => {
          if (ex.id === exerciseId) {
            const updated = { ...ex, isCompleted: true };
            if (exIdx + 1 < arr.length) {
              arr[exIdx + 1] = { ...arr[exIdx + 1], isUnlocked: true };
            }
            return updated;
          }
          return ex;
        });

        const allDone = updatedExercises.every((e) => e.isCompleted);
        if (allDone && !ch.isCompleted) {
          newlyUnlockedNextStation = true;
        }

        return {
          ...ch,
          isCompleted: allDone || ch.isCompleted,
          exercises: updatedExercises,
        };
      });

      // Unlock next planet station if station is finished
      if (newlyUnlockedNextStation) {
        const finishedIdx = nextChapters.findIndex((c) => c.id === chapterId);
        if (finishedIdx !== -1 && finishedIdx + 1 < nextChapters.length) {
          nextChapters[finishedIdx + 1] = {
            ...nextChapters[finishedIdx + 1],
            isUnlocked: true,
          };
        }
      }

      return nextChapters;
    });

    setUserProgress((prev) => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + 1,
      xpEarned: prev.xpEarned + 55,
    }));
  };

  const handleNextMission = () => {
    if (!activeMissionChapter || !activeMissionExercise) {
      setIsMissionOpen(false);
      return;
    }

    const currentExIdx = activeMissionChapter.exercises.findIndex(
      (e) => e.id === activeMissionExercise.id
    );

    if (currentExIdx !== -1 && currentExIdx + 1 < activeMissionChapter.exercises.length) {
      const nextEx = activeMissionChapter.exercises[currentExIdx + 1];
      setActiveMissionExercise({ ...nextEx, isUnlocked: true });
      setIsMissionOpen(true);
    } else {
      const currentChIdx = chapters.findIndex((c) => c.id === activeMissionChapter.id);
      if (currentChIdx !== -1 && currentChIdx + 1 < chapters.length) {
        const nextCh = chapters[currentChIdx + 1];
        if (nextCh.isUnlocked) {
          setSelectedChapter(nextCh);
          setActiveMissionChapter(nextCh);
          setActiveMissionExercise(nextCh.exercises[0]);
          setIsMissionOpen(true);
          return;
        }
      }
      setIsMissionOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05040d] relative text-white">
      <SmoothScroll />
      <Navbar />

      {/* Background Space Effects with Canvas Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Starfield />

        {/* Ambient Nebula Clouds */}
        <div className="absolute top-[5%] left-[25%] w-[45rem] h-[30rem] bg-purple-900/20 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[10%] w-[35rem] h-[35rem] bg-cyan-900/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[10%] w-[40rem] h-[30rem] bg-fuchsia-900/15 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Top-Left Back Button */}
        <div className="mb-4 sm:mb-2">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md group"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Courses</span>
          </Link>
        </div>

        {/* Galaxy Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-14 pt-4 pb-10 flex flex-col items-center text-center"
        >
          {/* Large Header in Clean Arena Gradient */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] mb-5">
            PYTHON
          </h1>

          {/* Subtitle with Theme Highlights */}
          <p className="text-base sm:text-lg text-white/85 font-mono leading-relaxed max-w-2xl mx-auto mb-9">
            No endless list of chapters chart a course through the{" "}
            <span className="text-[#E873C3] font-bold">
              Python galaxy
            </span>
            . Every planet is a station of exercises, and the{" "}
            <span className="text-[#C453D6] font-bold">
              dotted trail
            </span>{" "}
            shows exactly where you fly next.
          </p>

          {/* Centered CTA Button & XP Label */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => {
                const ch1 = chapters[0];
                setSelectedChapter(ch1);
                handleLaunchMission(ch1);
              }}
              className="relative overflow-hidden group px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] hover:from-[#f085ce] hover:via-[#cf60e0] hover:to-[#9a42e3] text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center gap-2.5"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              <Rocket size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              <span>CONTINUE AT STATION 01</span>
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-amber-400 bg-amber-400/10 px-4.5 py-2.5 rounded-xl border border-amber-400/30">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span>{userProgress.xpEarned} / {userProgress.totalXp} XP EARNED</span>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Galaxy Map & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Galaxy Path Map */}
          <div className="lg:col-span-8">
            <GalaxyPathMap
              chapters={chapters}
              selectedChapterId={selectedChapter.id}
              onSelectChapter={(chapter) => setSelectedChapter(chapter)}
            />
          </div>

          {/* Right Column: Sticky Sidebar Column matching full left path height */}
          <div className="lg:col-span-4 relative h-full">
            <ProgressSidebar
              selectedChapter={selectedChapter}
              userProgress={userProgress}
              onLaunchMission={handleLaunchMission}
            />
          </div>
        </div>
      </div>

      {/* Interactive Exercise Workspace & Mission Launch Modal */}
      <MissionModal
        isOpen={isMissionOpen}
        chapter={activeMissionChapter}
        exercise={activeMissionExercise}
        onClose={handleCloseMission}
        onCompleteExercise={handleCompleteExercise}
        onNextMission={handleNextMission}
      />
    </main>
  );
}
