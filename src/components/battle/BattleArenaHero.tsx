'use client';

import { useRouter } from 'next/navigation';

export default function BattleArenaHero() {
  const router = useRouter();

  return (
    <section className="relative text-center pt-8 sm:pt-10 pb-0 px-4 z-10 shrink-0 max-w-[1360px] mx-auto w-full flex items-center justify-center">
      {/* Back button on left side */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/dashboard');
          }
        }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md group"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back</span>
      </button>

      <div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] mb-0.5 select-none">
          Battle <span className="bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] bg-clip-text text-transparent ">Arena</span>
        </h1>
        <p className="text-white/70 text-xs sm:text-sm font-medium tracking-wide max-w-lg mx-auto">
          1v1 Competitive Coding & MCQ Speed Battles
        </p>
      </div>
    </section>
  );
}
