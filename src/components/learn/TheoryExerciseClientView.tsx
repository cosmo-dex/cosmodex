"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import TheoryHeader from "@/components/learn/TheoryHeader";
import TheoryFooter from "@/components/learn/TheoryFooter";
import { TheoryExercise } from "@/data/theoryExercisesData";
import InteractiveCodeLab from "@/components/learn/InteractiveCodeLab";
import ConceptKnowledgeQuiz from "@/components/learn/ConceptKnowledgeQuiz";
import RisingStars from "@/components/RisingStar";
import {
  Rocket,
  Sparkles,
  ChevronRight,
  Terminal,
  Hash,
  Lightbulb,
  CheckCircle2,
  Target,
} from "lucide-react";

interface TheoryExerciseClientViewProps {
  exercise: TheoryExercise;
}

export default function TheoryExerciseClientView({
  exercise,
}: TheoryExerciseClientViewProps) {
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cCode = (exercise.courseId || "python").toLowerCase();
        return (
          localStorage.getItem(`station_completed_${cCode}_${exercise.id}`) === "true" ||
          localStorage.getItem(`station_completed_${exercise.id}`) === "true"
        );
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const courseCode = exercise.courseId || "python";
    fetch(`/api/learning/progress?course=${courseCode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.progress) return;
        const prog = data.progress;
        const stationNum = parseInt(exercise.chapterNumber || "1", 10);

        const isDone =
          (Array.isArray(prog.completedStationSlugs) && (
            prog.completedStationSlugs.includes(exercise.id) ||
            prog.completedStationSlugs.includes(String(stationNum)) ||
            prog.completedStationSlugs.includes(`station-${stationNum}`) ||
            prog.completedStationSlugs.includes(`ch-${stationNum}`)
          )) ||
          (Array.isArray(prog.completedStationNumbers) && prog.completedStationNumbers.includes(stationNum)) ||
          (Array.isArray(prog.completedModuleIds) && prog.completedModuleIds.includes(exercise.id));

        if (isDone) {
          setIsCompleted(true);
        }

        if (stationNum > 1 && data.authenticated) {
          const prevNum = stationNum - 1;
          const prevCompleted =
            (Array.isArray(prog.completedStationNumbers) && prog.completedStationNumbers.includes(prevNum)) ||
            (Array.isArray(prog.completedStationSlugs) && (
              prog.completedStationSlugs.includes(String(prevNum)) ||
              prog.completedStationSlugs.includes(`ch-${prevNum}`)
            ));
          if (!prevCompleted) {
            setIsLocked(true);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [exercise.id, exercise.chapterNumber, exercise.courseId]);

  const fileExt = useMemo(() => {
    const cid = (exercise.courseId || "").toLowerCase();
    if (cid.includes("html") || cid.includes("web")) return "html";
    if (cid.includes("css")) return "css";
    if (cid.includes("js") || cid.includes("javascript") || cid.includes("react")) return "js";
    if (cid.includes("java")) return "java";
    if (cid.includes("cpp") || cid.includes("c++")) return "cpp";
    return "py";
  }, [exercise.courseId]);

  const handleToggleComplete = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    const cCode = (exercise.courseId || "python").toLowerCase();
    try {
      localStorage.setItem(`station_completed_${cCode}_${exercise.id}`, String(nextState));
      localStorage.setItem(`station_completed_${exercise.id}`, String(nextState));
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: exercise.id,
          courseCode: exercise.courseId || 'python',
          isStationComplete: nextState,
          xpEarned: 0,
        }),
      });
    } catch (err) {
      console.warn('Failed to toggle station completion', err);
    }
  };

  const handleQuizCompleted = async (score: number, total: number, passed: boolean) => {
    if (!passed) return;
    setIsCompleted(true);
    const cCode = (exercise.courseId || "python").toLowerCase();
    try {
      localStorage.setItem(`station_completed_${cCode}_${exercise.id}`, "true");
      localStorage.setItem(`station_completed_${exercise.id}`, "true");
    } catch {}
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#9E00F6]/15 border border-[#9E00F6]/30 font-mono text-[#00FFE9] text-[0.82em] inline-block"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const parseCodeBlockFromContent = (text: string) => {
    const codeBlockMatch = text.match(/```(?:[a-zA-Z0-9_\-#+]+)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const code = codeBlockMatch[1].trim();
      const nonCode = text.replace(/```(?:[a-zA-Z0-9_\-#+]+)?\s*[\s\S]*?```/, "").trim();
      return { code, nonCode };
    }
    return null;
  };

  if (isLocked) {
    const courseLink = exercise.courseId === "py-1" ? "/learn/python" : `/learn/${exercise.courseId}`;
    return (
      <div className="min-h-screen bg-[#07080f] text-white flex flex-col items-center justify-center gap-6 px-4">
        <Navbar />
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#0d0f1a] border border-white/10 flex items-center justify-center">
            <Sparkles size={28} className="text-white/20" />
          </div>
          <h1 className="text-2xl font-black text-white font-mono uppercase tracking-wider">Station Locked</h1>
          <p className="text-sm text-white/50 font-sans leading-relaxed">
            You need to complete the previous station and pass its quiz with at least 3/5 correct answers before accessing this one.
          </p>
          <Link
            href={courseLink}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E873C3] to-[#9E00F6] text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-all"
          >
            <Rocket size={14} />
            <span>Back to Galaxy Map</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-white relative flex flex-col font-sans overflow-x-hidden">
      {/* ── Space Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Base dark */}
        <div className="absolute inset-0 bg-[#07080f]" />
        {/* Subtle purple nebula top-left */}
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-[radial-gradient(ellipse,rgba(158,0,246,0.12)_0%,transparent_65%)]" />
        {/* Subtle pink nebula bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.08)_0%,transparent_65%)]" />
        {/* Center teal glow very subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,255,233,0.04)_0%,transparent_70%)]" />

        {/* Shooting stars */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ width: "140px", rotate: -35, top: "12%", right: "-8%" }}
          animate={{ x: [0, -1300], y: [0, 900], opacity: [0, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent"
          style={{ width: "100px", rotate: -35, top: "40%", right: "-4%" }}
          animate={{ x: [0, -1100], y: [0, 750], opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 8, ease: "linear" }}
        />

        <RisingStars />
      </div>

      <Navbar />

      <TheoryHeader
        courseId={exercise.courseId}
        exerciseIndex={exercise.exerciseIndex}
        totalExercises={exercise.totalExercises}
        exerciseId={exercise.id}
        chapterTitle={exercise.title}
      />

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-8 pt-36 pb-40">
        <article className="space-y-14">

          {/* ── Hero Header ── */}
          <header className="space-y-5 pb-8 border-b border-white/[0.08]">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-white/40">
              <Link href="/learn" className="hover:text-white/70 transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} />
              <Link
                href={exercise.courseId === "py-1" ? "/learn/python" : `/learn/${exercise.courseId}`}
                className="text-[#00FFE9] hover:underline transition-colors"
              >
                {exercise.courseTitle || "Course"} Galaxy
              </Link>
              <ChevronRight size={12} />
              <span className="text-white/60">Station {exercise.chapterNumber}</span>
            </nav>

            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#E873C3] mb-2">
                Station {exercise.chapterNumber} · Theory
              </p>
              <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
                {exercise.title}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-white/55 font-sans leading-relaxed max-w-2xl">
              Study the concept, trace through the code examples, then test yourself with the quiz below.
            </p>
          </header>

          <div className="space-y-12">
            {exercise.sections.map((section) => (
              <section key={section.id} className="space-y-5">
                {section.heading && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-[#00FFE9]/10 border border-[#00FFE9]/30 flex items-center justify-center">
                      <Hash size={12} className="text-[#00FFE9]" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {section.heading}
                    </h2>
                  </div>
                )}

                {section.content.map((paragraph, pIdx) => {
                  const parsedBlock = parseCodeBlockFromContent(paragraph);
                  if (parsedBlock) {
                    return (
                      <div key={pIdx} className="space-y-3">
                        {parsedBlock.nonCode && (
                          <p className="text-[15px] text-white/70 leading-relaxed font-sans">
                            {renderFormattedText(parsedBlock.nonCode)}
                          </p>
                        )}
                        <InteractiveCodeLab
                          title="Syntax Example"
                          inputCode={parsedBlock.code}
                          outputCode="[Program executed with exit code 0]"
                          explanation="Study the code structure and indentation."
                          fileName={`syntax.${fileExt}`}
                        />
                      </div>
                    );
                  }

                  if (paragraph.startsWith("**Step")) {
                    return (
                      <div
                        key={pIdx}
                        className="flex items-start gap-3 p-4 rounded-xl bg-[#00FFE9]/[0.05] border border-[#00FFE9]/15"
                      >
                        <CheckCircle2 size={15} className="text-[#00FFE9] mt-0.5 shrink-0" />
                        <p className="text-[14px] text-white/75 leading-relaxed font-sans">
                          {renderFormattedText(paragraph)}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-[15px] text-white/70 leading-relaxed font-sans">
                      {renderFormattedText(paragraph)}
                    </p>
                  );
                })}

                {/* Bullet Key Takeaways */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <div className="rounded-xl border border-[#9E00F6]/20 bg-[#9E00F6]/[0.05] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb size={13} className="text-[#FFA249]" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FFA249]">
                        Key Takeaways
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {section.bulletPoints.map((item, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-3 text-[14px] text-white/65 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9E00F6] mt-[7px] shrink-0" />
                          <span>{renderFormattedText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* ── Code Examples Section ── */}
          {exercise.codeExamples && exercise.codeExamples.length > 0 && (
            <section className="space-y-5 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00FFE9]/10 border border-[#00FFE9]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,233,0.2)]">
                  <Terminal size={16} className="text-[#00FFE9]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00FFE9]">
                    Code Examples
                  </p>
                  <h3 className="text-lg font-black text-white">Interactive Demos</h3>
                </div>
              </div>

              <div className="space-y-4">
                {exercise.codeExamples.map((ex, idx) => (
                  <InteractiveCodeLab
                    key={idx}
                    title={ex.title}
                    inputCode={ex.input}
                    outputCode={ex.output}
                    explanation={ex.explanation}
                    fileName={`example_${idx + 1}.${fileExt}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Practice Challenge ── */}
          {exercise.practiceQuestion && (
            <section className="space-y-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFA249]/10 border border-[#FFA249]/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,162,73,0.2)]">
                  <Target size={16} className="text-[#FFA249]" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FFA249]">
                    Practice Challenge
                  </p>
                  <h3 className="text-lg font-black text-white">
                    {exercise.practiceQuestion.title}
                  </h3>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0f1a] p-5 sm:p-6 space-y-4">
                <p className="text-[14px] text-white/65 font-sans leading-relaxed">
                  {exercise.practiceQuestion.description}
                </p>
                <InteractiveCodeLab
                  title="Challenge"
                  inputCode={exercise.practiceQuestion.input}
                  outputCode={exercise.practiceQuestion.output}
                  explanation={exercise.practiceQuestion.explanation}
                  fileName={`challenge.${fileExt}`}
                />
              </div>
            </section>
          )}

          {/* ── MCQ Quiz ── */}
          {exercise.mcqs && exercise.mcqs.length > 0 && (
            <section className="pt-4 border-t border-white/[0.08]">
              <ConceptKnowledgeQuiz
                questions={exercise.mcqs}
                chapterTitle={exercise.title}
                moduleId={exercise.id}
                courseId={exercise.courseId}
                nextLessonId={exercise.nextLessonId}
                onCompleteQuiz={handleQuizCompleted}
              />
            </section>
          )}

          {/* MCQ Quiz Component manages its own unified result and next action */}
        </article>
      </main>

      <TheoryFooter
        exercise={exercise}
        isCompleted={isCompleted}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
