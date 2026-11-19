"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Brain, Code2, Swords, Target, Trophy, Zap } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import RisingStars from "@/components/RisingStar";

const battleModes = [
  {
    title: "MCQ Battle",
    description: "Race through quick-fire questions and outthink your rival.",
    label: "KNOWLEDGE DUEL",
    icon: Brain,
    glow: "from-[#E873C3] to-[#A855F7]",
    border: "hover:border-[#E873C3]/50",
    iconColor: "text-[#F18BD0]",
  },
  {
    title: "Code Battle",
    description: "Solve coding challenges head-to-head in a live arena.",
    label: "CODING DUEL",
    icon: Code2,
    glow: "from-[#8D37D6] to-[#5B5FEF]",
    border: "hover:border-[#9B72F2]/50",
    iconColor: "text-[#A98BFA]",
  },
];

export default function BattlePreviewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white starfield">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-[34rem] w-[34rem] rounded-full bg-[#7C3AED]/20 blur-[130px]" />
        <div className="absolute -right-32 top-[28rem] h-[32rem] w-[32rem] rounded-full bg-[#E873C3]/10 blur-[130px]" />
        <div className="absolute left-1/2 top-[42rem] h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-[#8D37D6]/10 blur-[120px]" />

        <motion.div
          className="absolute right-[-10%] top-[12%] h-px w-40 rotate-[-35deg] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          animate={{ x: [0, -1300], y: [0, 850], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
        />
        <motion.div
          className="absolute right-[-5%] top-[36%] h-px w-32 rotate-[-35deg] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          animate={{ x: [0, -1200], y: [0, 800], opacity: [0, 0.85, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
        />
        <motion.div
          className="absolute right-[25%] top-[-5%] h-px w-44 rotate-[-35deg] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          animate={{ x: [0, -1400], y: [0, 950], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 10, ease: "linear" }}
        />
        <RisingStars />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <div className="text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E873C3]/25 bg-[#E873C3]/[0.07] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#F18BD0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E873C3] shadow-[0_0_10px_#E873C3]" />
            The CosmoDex Arena
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] sm:text-6xl">
            Battle <span className="bg-gradient-to-r from-[#F18BD0] via-[#C453D6] to-[#8D5CF6] bg-clip-text text-transparent">Arena</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Think fast. Play smart. Challenge coders in real-time MCQ and coding battles.
          </p>
        </div>

        <section aria-labelledby="find-match-title" className="mt-12 w-full max-w-4xl sm:mt-16">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#E873C3]/50" />
            <h2 id="find-match-title" className="text-xs font-bold uppercase tracking-[0.28em] text-white/75 sm:text-sm">Find a Match</h2>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#8D37D6]/50" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {battleModes.map(({ title, description, label, icon: Icon, glow, border, iconColor }) => (
              <article key={title} className={`group relative overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0B0A12]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 ${border} sm:p-7`}>
                <div aria-hidden="true" className={`absolute -right-16 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${glow} opacity-[0.13] blur-3xl transition-opacity group-hover:opacity-25`} />
                <div className="relative flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${glow} bg-opacity-10 shadow-[0_0_25px_rgba(141,55,214,0.16)]`}>
                    <Icon size={22} className={iconColor} />
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-white/45">{label}</span>
                </div>
                <h3 className="relative mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h3>
                <p className="relative mt-2 max-w-sm text-sm leading-6 text-white/55">{description}</p>
                <div className="relative mt-7 flex items-center gap-2 text-xs font-semibold text-white/40">
                  <Zap size={14} className={iconColor} />
                  <span>1v1 • Real-time • Competitive</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 divide-x divide-white/[0.09] rounded-xl border border-white/[0.09] bg-white/[0.025] px-2 py-4 backdrop-blur-md sm:mt-6 sm:px-8">
            <div className="flex flex-col items-center gap-1.5">
              <Target size={15} className="text-[#E873C3]" />
              <span className="text-base font-bold text-white sm:text-lg">±ELO</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:text-[10px]">Fair Match</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Swords size={15} className="text-[#C084FC]" />
              <span className="text-base font-bold text-white sm:text-lg">5 Rds</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:text-[10px]">Per Battle</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Trophy size={15} className="text-[#E873C3]" />
              <span className="text-base font-bold text-white sm:text-lg">+ELO</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:text-[10px]">Climb Ranks</span>
            </div>
          </div>
        </section>

        <section className="mt-16 w-full max-w-4xl border-t border-white/[0.08] pt-12 text-center sm:mt-20 sm:pt-16">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#E873C3]/20 bg-[#E873C3]/[0.08] text-[#F18BD0]">
            <Swords size={19} />
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Want More Excitement?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">
            Join CosmoDex and step into the arena. Your next great battle is waiting.
          </p>
          <Link href="/onboarding" className="dashboard-btn-primary mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold shadow-[0_0_28px_rgba(216,95,209,0.24)] transition hover:shadow-[0_0_36px_rgba(216,95,209,0.38)]">
            Join the BattleArena
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
