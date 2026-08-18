"use client";

import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import RisingStars from "@/component/RisingStar";
import { Sparkles, Terminal } from "lucide-react";

interface NoExercisesViewProps {
  courseId: string;
}

export default function NoExercisesView({ courseId }: NoExercisesViewProps) {
  const formattedCourseName = courseId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-[#050508] text-white relative flex flex-col font-sans overflow-x-hidden selection:bg-[#38bdf8]/30">
      {/* High Performance Space Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.2)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <RisingStars />
      </div>

      <Navbar />

      {/* Main Empty State Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center max-w-2xl mx-auto">
        <div className="bg-[#0d0922]/80 border border-white/10 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(124,58,237,0.15)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
            <Sparkles size={14} className="text-[#38bdf8]" />
            <span>Coming Soon</span>
          </div>

          {/* Icon Terminal Illustration */}
          <div className="w-16 h-16 rounded-2xl bg-[#131d31] border border-[#22314e] flex items-center justify-center mx-auto text-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Terminal size={32} />
          </div>

          {/* Heading & Text */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              No Exercises Yet for {formattedCourseName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
              Exercises for <span className="text-[#38bdf8] font-semibold">{formattedCourseName}</span> are currently being written. Try our <span className="text-purple-300 font-semibold">Python</span> course for the full demo!
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/learn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md group"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Courses</span>
            </Link>

            <Link
              href="/learn/python/theory/in-the-beginning"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sans font-bold text-sm text-[#38bdf8] bg-[#131d31] border border-[#22314e] hover:border-[#38bdf8]/50 hover:bg-[#1b273e] transition-all cursor-pointer"
            >
              <span>Try Python Demo</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
