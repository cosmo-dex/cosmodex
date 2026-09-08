"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export interface CourseData {
  id: string;
  courseNumber: string;
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  thumbnail: string;
  pixelArtBanner?: React.ReactNode;
  isLive?: boolean;
}

interface CourseCardProps {
  course: CourseData;
  index: number;
}

const SignalBarsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline-block">
    <rect x="2" y="8" width="3.5" height="6" rx="1" fill="#38bdf8" />
    <rect x="7.5" y="4" width="3.5" height="10" rx="1" fill="#38bdf8" />
    <rect x="13" y="2" width="3.5" height="12" rx="1" fill="#64748b" />
  </svg>
);

export default function CourseCard({ course }: CourseCardProps) {
  const [imgError, setImgError] = useState(false);

  const isLive = course.isLive ?? true;
  const targetCourseSlug =
    course.id === "py-1" || course.title.toLowerCase() === "python"
      ? "python"
      : course.id;

  const targetHref = `/learn/${targetCourseSlug}`;

  return (
    <Link href={targetHref} scroll={false} className="block">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut", delay: 0 }}
        className="group relative flex flex-col overflow-hidden bg-[#090e1a] border border-white/80 border-l-3 border-b-3 border-0 hover:border-white/50 rounded-[8px] cursor-pointer transition-colors duration-150"
      >
      {/* Highlight screen overlay on whole card component */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30" />

      {/* 1. Image Banner */}
      <div className="relative w-full h-40 overflow-hidden bg-[#0b1220] border-b border-[#1b263b]">
        {!isLive && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-purple-950/90 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-lg flex items-center gap-1.5 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Coming Soon
          </div>
        )}

        {course.pixelArtBanner ? (
          <div className="w-full h-full pointer-events-none">
            {course.pixelArtBanner}
          </div>
        ) : !imgError && course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0b1220] text-white/60 text-sm font-sans">
            {course.title}
          </div>
        )}
      </div>

      {/* 2. Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-[#090e1a]">
        <div>
          {/* COURSE sequence number */}
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#64748b] uppercase block mb-1.5">
            {course.courseNumber}
          </span>

          {/* Title Heading in font-sans */}
          <h3 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">
            {course.title}
          </h3>

          {/* Short 2-sentence summary */}
          <p className="text-sm text-[#94a3b8] font-sans leading-relaxed mb-6 line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* 3. Level Tag Pill */}
        <div className="flex items-center justify-start mt-auto">
          {isLive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-[11px] font-sans font-bold tracking-wider text-[#94a3b8]">
              <SignalBarsIcon />
              <span>{course.level}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-sans font-bold tracking-wider text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>COMING SOON</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
