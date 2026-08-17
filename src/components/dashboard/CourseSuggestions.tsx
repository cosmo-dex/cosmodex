"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ── Compact SVG Pixel Art Banners (matching /learn page) ──

const PythonBanner = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="dPySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#bae6fd" />
      </linearGradient>
      <linearGradient id="dSnake" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#dPySky)" />
    <path d="M0,130 L60,80 L120,130 L190,70 L260,130 L340,65 L400,130 L400,200 L0,200 Z" fill="#22c55e" opacity="0.6" />
    <path d="M-20,140 Q80,110 180,140 T380,130 T420,160 L420,200 L-20,200 Z" fill="#16a34a" />
    <path d="M140,160 Q130,100 170,80 Q210,60 220,110 Q230,160 180,170 Q140,175 140,120 Q140,80 180,75 Q210,75 220,100" fill="none" stroke="url(#dSnake)" strokeWidth="22" strokeLinecap="round" />
    <circle cx="222" cy="100" r="3" fill="#ef4444" />
    <rect x="0" y="180" width="400" height="20" fill="#14532d" />
  </svg>
);

const HTMLBanner = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="dHtmlSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#dHtmlSky)" />
    <circle cx="200" cy="120" r="45" fill="#fff7ed" />
    <path d="M0,140 Q100,125 200,140 T400,135 L400,200 L0,200 Z" fill="#9a3412" />
  </svg>
);

const JSBanner = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="dJsSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ca8a04" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#dJsSky)" />
    <rect x="70" y="50" width="55" height="150" fill="#a16207" />
    <rect x="200" y="40" width="60" height="160" fill="#a16207" />
  </svg>
);

const JavaBanner = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="dJavaSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c2d12" />
        <stop offset="60%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#ffedd5" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#dJavaSky)" />
    <polygon points="50,140 130,50 210,140" fill="#9a3412" />
    <polygon points="180,140 270,40 360,140" fill="#7c2d12" />
  </svg>
);

interface SuggestedCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  banner: React.ReactNode;
  href: string;
}

const SUGGESTED_COURSES: SuggestedCourse[] = [
  {
    id: "s-py",
    title: "Python",
    description: "Learn programming fundamentals like variables, control flow, and loops.",
    level: "BEGINNER",
    banner: <PythonBanner />,
    href: "/learn/py-1/theory/in-the-beginning",
  },
  {
    id: "s-html",
    title: "HTML",
    description: "Build the structure of web pages with semantic HTML tags.",
    level: "BEGINNER",
    banner: <HTMLBanner />,
    href: "/learn/web-1/theory/in-the-beginning",
  },
  {
    id: "s-js",
    title: "JavaScript",
    description: "Add interactive behavior, DOM manipulation, and logic to the web.",
    level: "INTERMEDIATE",
    banner: <JSBanner />,
    href: "/learn/web-3/theory/in-the-beginning",
  },
  {
    id: "s-java",
    title: "Java",
    description: "Master object-oriented programming, classes, and robust software design.",
    level: "BEGINNER",
    banner: <JavaBanner />,
    href: "/learn/oop-1/theory/in-the-beginning",
  },
];

// Signal bars icon reused from learn page
const SignalBarsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block shrink-0">
    <rect x="2" y="8" width="3.5" height="6" rx="1" fill="#38bdf8" />
    <rect x="7.5" y="4" width="3.5" height="10" rx="1" fill="#38bdf8" />
    <rect x="13" y="2" width="3.5" height="12" rx="1" fill="#64748b" />
  </svg>
);

export default function CourseSuggestions() {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(SUGGESTED_COURSES.length / perPage);
  const visible = SUGGESTED_COURSES.slice(page * perPage, (page + 1) * perPage);

  return (
    <section className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E873C3]/15 border border-[#E873C3]/20 flex items-center justify-center">
            <BookOpen size={18} className="text-[#E873C3]" />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-wide">
            Suggested Courses
          </h2>
        </div>

        {/* Pagination arrows */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                page === 0
                  ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-[#E873C3]/50 hover:text-[#E873C3] hover:bg-[#E873C3]/10"
              }`}
              aria-label="Previous suggestions"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-mono text-white/40 px-1 tabular-nums">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                page >= totalPages - 1
                  ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-[#E873C3]/50 hover:text-[#E873C3] hover:bg-[#E873C3]/10"
              }`}
              aria-label="Next suggestions"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Course cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((course) => (
          <Link key={course.id} href={course.href} className="block group">
            <div className="cosmo-glass-panel overflow-hidden border border-white/10 flex flex-col cursor-pointer h-full">
              {/* Banner */}
              <div className="relative w-full h-28 overflow-hidden border-b border-white/5">
                <div className="w-full h-full pointer-events-none">
                  {course.banner}
                </div>
                {/* Gradient overlay for blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-white mb-1 tracking-tight group-hover:text-[#E873C3] transition-colors duration-200">
                  {course.title}
                </h3>
                <p className="text-[13px] text-white/50 leading-relaxed line-clamp-2 mb-3 flex-1">
                  {course.description}
                </p>

                {/* Bottom row: level pill + start arrow */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-wider text-white/50">
                    <SignalBarsIcon />
                    <span>{course.level}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#E873C3]/20 group-hover:border-[#E873C3]/30 transition-all duration-200">
                    <ArrowRight size={13} className="text-white/40 group-hover:text-[#E873C3] transition-colors duration-200" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Browse all link */}
      <div className="mt-4 flex justify-end">
        <Link
          href="/learn"
          className="text-xs font-bold text-white/40 hover:text-[#E873C3] transition-colors duration-200 flex items-center gap-1.5 group/link"
        >
          Browse all courses
          <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>
    </section>
  );
}
