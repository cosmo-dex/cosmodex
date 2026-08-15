import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  BookOpen,
  ListOrdered,
  Lightbulb,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import LessonCodeEditor from "@/components/learn/LessonCodeEditor";
import {
  getLesson,
  getLessonIndex,
  getNextLesson,
  getPrevLesson,
  LESSONS,
} from "@/data/lessons";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#1b263b] bg-[#090e1a] p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E873C3]">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E873C3]/15">
          {icon}
        </span>
        {title}
      </h3>
      <div className="space-y-3 text-sm leading-relaxed text-[#94a3b8]">
        {children}
      </div>
    </section>
  );
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  const lessonIndex = getLessonIndex(lessonId);
  const prevLesson = getPrevLesson(lessonId);
  const nextLesson = getNextLesson(lessonId);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05030a] font-sans text-white">
      <Navbar />

      {/* ── Deep-space background FX ── */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#050508]">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-24 pb-20 sm:px-8">
        {/* ── Breadcrumb + Back ── */}
        <Link
          href="/learn"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-white/50 transition-colors hover:text-[#E873C3]"
        >
          <ChevronLeft size={14} />
          Back to Learn
        </Link>

        {/* ── Lesson Header (Hitchcut display font) ── */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E873C3]/30 bg-[#E873C3]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E873C3]">
              <Sparkles size={11} />
              Lesson {String(lesson.number).padStart(2, "0")} · {lesson.track}
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#64748b]">
              {lesson.courseTitle}
            </span>
          </div>

          <h1 className="font-display text-4xl uppercase leading-[1.1] tracking-[0.05em] text-white drop-shadow-[0_0_25px_rgba(232,115,195,0.35)] sm:text-5xl md:text-6xl">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8] sm:text-base">
            {lesson.subtitle} — {lesson.description}
          </p>

          {/* Progress */}
          <div className="mt-6 max-w-md">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-bold tracking-wider text-[#64748b]">
              <span>COURSE PROGRESS</span>
              <span>
                {lessonIndex + 1} / {LESSONS.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] shadow-[0_0_12px_rgba(232,115,195,0.6)]"
                style={{ width: `${((lessonIndex + 1) / LESSONS.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* ── Editor + Instructions Grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
          {/* Left: Lesson content */}
          <div className="order-2 space-y-5 lg:order-1">
            <SectionCard icon={<Target size={13} />} title="Objective">
              <ul className="space-y-2.5">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E873C3]/10 font-mono text-[10px] font-bold text-[#E873C3]">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={<BookOpen size={13} />} title="Read This">
              <p>
                Your code runs inside a sandboxed preview. Write code in the{" "}
                {lesson.files.length > 1 ? "file tabs" : "editor"}, hit{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-[#00FFE9]">
                  Run
                </code>{" "}
                (or Ctrl/Cmd + Enter) and watch the preview update live.
              </p>
            </SectionCard>

            <SectionCard icon={<ListOrdered size={13} />} title="Steps">
              <ol className="space-y-4">
                {lesson.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E873C3]/40 bg-[#E873C3]/10 font-mono text-[11px] font-bold text-[#E873C3]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="mb-0.5 text-[13px] font-bold text-white">
                        {step.title}
                      </p>
                      <p className="text-[13px] leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard icon={<Lightbulb size={13} />} title="Tips">
              <ul className="space-y-2">
                {lesson.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5C842] shadow-[0_0_8px_rgba(245,200,66,0.8)]" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard
              icon={<Sparkles size={13} />}
              title="You should see"
            >
              <p className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#3DCB7F]">✓</span>
                {lesson.expected}
              </p>
            </SectionCard>
          </div>

          {/* Right: Editor */}
          <div className="order-1 lg:order-2">
            <LessonCodeEditor kind={lesson.kind} files={lesson.files} />
          </div>
        </div>

        {/* ── Prev / Next Navigation ── */}
        <nav className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
          {prevLesson ? (
            <Link
              href={`/learn/${prevLesson.id}`}
              className="group flex flex-1 items-center gap-4 rounded-xl border border-[#1b263b] bg-[#090e1a] p-4 transition-all hover:border-[#E873C3]/50 hover:shadow-[0_0_20px_rgba(232,115,195,0.15)] sm:max-w-[320px]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#22314e] text-[#94a3b8] transition-colors group-hover:text-[#E873C3]">
                <ArrowLeft size={15} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                  Previous
                </span>
                <span className="block truncate text-sm font-bold text-white">
                  {prevLesson.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="group flex flex-1 items-center justify-end gap-4 rounded-xl border border-[#1b263b] bg-[#090e1a] p-4 text-right transition-all hover:border-[#E873C3]/50 hover:shadow-[0_0_20px_rgba(232,115,195,0.15)] sm:max-w-[320px]"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                  Next
                </span>
                <span className="block truncate text-sm font-bold text-white">
                  {nextLesson.title}
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#22314e] text-[#94a3b8] transition-colors group-hover:text-[#E873C3]">
                <ArrowRight size={15} />
              </span>
            </Link>
          ) : (
            <Link
              href="/learn"
              className="group flex flex-1 items-center justify-end gap-4 rounded-xl border border-[#E873C3]/40 bg-[#E873C3]/10 p-4 text-right transition-all hover:bg-[#E873C3]/20 sm:max-w-[320px]"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#E873C3]">
                  Course complete
                </span>
                <span className="block text-sm font-bold text-white">
                  Explore more courses →
                </span>
              </span>
            </Link>
          )}
        </nav>
      </div>

      <Footer />
    </main>
  );
}
