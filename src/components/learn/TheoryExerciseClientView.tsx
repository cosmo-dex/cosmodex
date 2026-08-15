"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar/Navbar";
import TheoryHeader from "@/components/learn/TheoryHeader";
import TheoryFooter from "@/components/learn/TheoryFooter";
import RisingStars from "@/component/RisingStar";
import { TheoryExercise } from "@/data/theoryExercisesData";

interface TheoryExerciseClientViewProps {
  exercise: TheoryExercise;
}

export default function TheoryExerciseClientView({
  exercise,
}: TheoryExerciseClientViewProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  // Helper to format text with **bold** terms
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-white font-bold tracking-tight">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative flex flex-col font-sans overflow-x-hidden selection:bg-[#38bdf8]/30">
      {/* ── High Performance Ultra-Smooth Space Background FX ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        {/* Deep dark base canvas */}
        <div className="absolute inset-0 bg-[#050508]" />

        {/* Ambient Top & Bottom Radial Glow Blooms */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.2)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />

        {/* Shooting Stars FX */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: "150px", rotate: -35, top: "10%", right: "-10%" }}
          animate={{ x: [0, -1200], y: [0, 800], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: "120px", rotate: -35, top: "35%", right: "-5%" }}
          animate={{ x: [0, -1100], y: [0, 750], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
        />

        <RisingStars />
      </div>

      {/* Main Navbar */}
      <Navbar />

      {/* Fixed Exercise Sub-Header (Sticks under Navbar at top-16) */}
      <TheoryHeader
        activeGrindersCount={exercise.activeGrindersCount}
        courseId={exercise.courseId}
        exerciseIndex={exercise.exerciseIndex}
        totalExercises={exercise.totalExercises}
      />

      {/* Main Content Area (pt-36 ensures content starts below both fixed headers) */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-6 sm:px-12 pt-36 pb-36">
        <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Exercise Display Title (e.g. 01. In The Beginning...) */}
          <div className="space-y-2 border-b border-white/10 pb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono font-black tracking-tight text-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-[#E873C3] mr-3 drop-shadow-[0_0_15px_rgba(232,115,195,0.5)]">
                {exercise.chapterNumber}.
              </span>
              {exercise.title}
            </h1>
          </div>

          {/* Exercise Sections */}
          {exercise.sections.map((section) => (
            <div
              key={section.id}
              className="space-y-6 text-[#cbd5e1] leading-relaxed text-sm sm:text-base md:text-lg"
            >
              {/* Section Heading e.g. # A Brief History */}
              {section.heading && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[#38bdf8] font-mono font-black text-xl sm:text-2xl">
                    #
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
                    {section.heading}
                  </h2>
                </div>
              )}

              {/* Paragraphs */}
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="font-sans text-slate-300 leading-relaxed">
                  {renderFormattedText(paragraph)}
                </p>
              ))}

              {/* Bullet Points List */}
              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <div className="space-y-3 pt-2 bg-[#0d0922]/60 p-5 rounded-2xl border border-white/10">
                  <p className="text-sm font-sans font-semibold text-slate-200">
                    They are known by different names:
                  </p>
                  <ul className="space-y-2.5 pl-2">
                    {section.bulletPoints.map((item, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-center gap-3 text-sm sm:text-base font-sans text-slate-300"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </article>
      </main>

      {/* Sticky Bottom Action Footer */}
      <TheoryFooter
        exercise={exercise}
        isCompleted={isCompleted}
        onToggleComplete={() => setIsCompleted(!isCompleted)}
      />
    </div>
  );
}
