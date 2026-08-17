"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  FolderCheck,
  Zap,
  Lock,
  FileText,
  MessageSquare,
  Shield,
  Award,
  Trophy,
  Star,
  Target,
  Sparkles,
  Flame,
  Code
} from "lucide-react";
import { UserProgressData, Chapter, Exercise } from "./pythonData";
import StationCard from "./StationCard";

interface ProgressSidebarProps {
  selectedChapter: Chapter;
  userProgress: UserProgressData;
  onLaunchMission?: (chapter: Chapter, exercise?: Exercise) => void;
}

export default function ProgressSidebar({
  selectedChapter,
  userProgress,
  onLaunchMission,
}: ProgressSidebarProps) {
  const badgeIcons = [
    Shield,
    Trophy,
    Award,
    Star,
    Target,
    Sparkles,
    Flame,
    Code,
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <aside
      data-lenis-prevent
      className="flex flex-col gap-5 sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto pr-1.5 custom-sidebar-scrollbar"
    >
      {/* ── 0. Selected Station Preview Card ── */}
      <motion.div
        key={selectedChapter.id}
        initial="hidden"
        animate="visible"
        custom={0}
        variants={cardVariants}
      >
        <StationCard
          chapter={selectedChapter}
          onLaunchMission={onLaunchMission}
        />
      </motion.div>

      {/* ── 1. User Profile Card ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        custom={1}
        variants={cardVariants}
        className="bg-[#090518]/90 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),_0_0_15px_rgba(0,200,255,0.08)]"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E873C3] to-[#8D37D6] p-0.5 shadow-[0_0_15px_rgba(232,115,195,0.4)] shrink-0">
            <div className="w-full h-full bg-[#0d0722] rounded-[14px] overflow-hidden flex items-center justify-center relative">
              <Image
                src={userProgress.avatarUrl}
                alt="Avatar"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-sans">
              {userProgress.username}
            </h4>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">
              Level {userProgress.level}
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="w-full py-2 px-4 rounded-xl bg-[#140e2b] hover:bg-[#1d153e] border border-white/10 text-white font-bold text-xs text-center transition-all duration-200 block shadow-sm hover:border-cyan-500/30"
        >
          View Profile
        </Link>
      </motion.div>

      {/* ── 2. Course Progress Card ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        custom={2}
        variants={cardVariants}
        className="bg-[#090518]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg"
      >
        <h4 className="text-sm font-bold text-white mb-4 tracking-wide font-mono uppercase">
          Course Progress
        </h4>

        <div className="flex flex-col gap-4">
          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <div className="flex items-center gap-2 text-white/80">
                <BookOpen size={14} className="text-cyan-400" />
                <span>Exercises</span>
              </div>
              <span className="text-white/60 font-bold">
                {userProgress.exercisesCompleted} / {userProgress.totalExercises}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#150f2f] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(userProgress.exercisesCompleted / userProgress.totalExercises) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Projects Completed */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <div className="flex items-center gap-2 text-white/80">
                <FolderCheck size={14} className="text-pink-400" />
                <span>Projects</span>
              </div>
              <span className="text-white/60 font-bold">
                {userProgress.projectsCompleted} / {userProgress.totalProjects}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#150f2f] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(userProgress.projectsCompleted / userProgress.totalProjects) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* XP Earned */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <div className="flex items-center gap-2 text-white/80">
                <Zap size={14} className="text-yellow-400" />
                <span>XP Earned</span>
              </div>
              <span className="text-white/60 font-bold">
                {userProgress.xpEarned} / {userProgress.totalXp}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#150f2f] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(userProgress.xpEarned / userProgress.totalXp) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Course Badges Card ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        custom={3}
        variants={cardVariants}
        className="bg-[#090518]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
            Course Badges
          </h4>
          <span className="text-xs font-mono font-bold text-white/50">
            {userProgress.badgesUnlocked} / {userProgress.totalBadges}
          </span>
        </div>
        <p className="text-[11px] text-white/50 font-mono mb-4 leading-snug">
          Complete a chapter to earn a badge — collect &apos;em all!
        </p>

        {/* Badges Grid */}
        <div className="grid grid-cols-4 gap-3">
          {badgeIcons.map((IconComp, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl bg-[#140e2b]/80 border border-white/10 flex items-center justify-center relative group/badge hover:border-cyan-500/40 transition-colors"
            >
              <IconComp size={18} className="text-white/20 group-hover/badge:text-white/40 transition-colors" />
              <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <Lock size={12} className="text-white/30" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 4. Cheat Sheets Card ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        custom={4}
        variants={cardVariants}
        className="bg-[#090518]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
            Cheat Sheets
          </h4>
          <span className="text-xs font-mono font-bold text-white/50">
            {userProgress.cheatSheetsUnlocked} / {userProgress.totalCheatSheets}
          </span>
        </div>
        <p className="text-[11px] text-white/50 font-mono mb-4 leading-snug">
          Unlock printables with Python functions and concepts.
        </p>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#140e2b]/60 border border-white/5">
            <FileText size={18} className="text-white/40 shrink-0" />
            <span className="text-xs font-mono text-white/60">
              Unlock after Ch. 4
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#140e2b]/60 border border-white/5">
            <FileText size={18} className="text-white/40 shrink-0" />
            <span className="text-xs font-mono text-white/60">
              Unlock after Ch. 8
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 5. Community Help Card ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        custom={5}
        variants={cardVariants}
        className="bg-[#090518]/90 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <h4 className="text-sm font-bold text-white mb-1 font-mono uppercase">
          Need Python Help?
        </h4>
        <p className="text-xs text-white/60 font-mono mb-4">
          Ask questions in our community!
        </p>

        <Link
          href="https://discord.gg"
          target="_blank"
          className="w-full py-2.5 px-4 rounded-xl bg-[#140e2b] hover:bg-[#1d153e] border border-cyan-500/40 text-cyan-300 font-bold text-xs text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,200,255,0.15)] hover:shadow-[0_0_20px_rgba(0,200,255,0.3)] font-mono"
        >
          <MessageSquare size={14} />
          Go to Community
        </Link>
      </motion.div>
    </aside>
  );
}
