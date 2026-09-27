"use client";

import Link from "next/link";

interface WelcomeBannerProps {
  username?: string;
}

export default function WelcomeBanner({ username = 'Explorer' }: WelcomeBannerProps) {
  return (
    <div className="flex items-center gap-4 sm:gap-6 relative z-20 w-full">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-md shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back</span>
      </Link>

      <div className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0 animate-float">
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-125 animate-pulse-slow" />
        <picture>
          <source srcSet="/images/mascot-transparent.webp" type="image/webp" />
          { }
          <img
            src="/images/mascot-transparent.gif"
            alt="Cosmodex Mascot"
            className="relative object-contain w-full h-full drop-shadow-xl"
            width={96}
            height={96}
          />
        </picture>
      </div>

      <div className="flex flex-col">
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-normal text-white mb-1 tracking-wider flex items-center gap-2">
          Welcome back, {username}! <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-white/50 font-medium">
          Ready to continue your coding journey?
        </p>
      </div>
    </div>
  );
}

