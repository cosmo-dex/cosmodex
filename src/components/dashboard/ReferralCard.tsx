"use client";

import { useState } from "react";
import { Check, Copy, Link2, Share2, Users, Zap } from "lucide-react";

interface ReferralCardProps {
  link: string;
  count: number;
  points: number;
}

export default function ReferralCard({ link, count, points }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on CosmoDex",
        text: "Join me on CosmoDex and start your coding journey.",
        url: link,
      }).catch(() => undefined);
      return;
    }
    await copyLink();
  };

  return (
    <section className="cosmo-glass-panel p-6 border border-white/10 relative overflow-hidden">
      <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">Grow the crew</p>
          <h2 className="mt-1 text-lg font-bold text-white">Invite friends</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/55">You and your friend each earn 100 points when they create an account with your link.</p>
        </div>
        <Link2 size={20} className="shrink-0 text-[#E873C3]" />
      </div>

      <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/65">{link}</span>
        <button type="button" onClick={copyLink} aria-label="Copy referral link" className="shrink-0 rounded-lg p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
          {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
        </button>
      </div>

      <button type="button" onClick={shareLink} className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E873C3] to-[#8D37D6] py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(141,55,214,0.3)] transition-opacity hover:opacity-90 cursor-pointer">
        <Share2 size={15} />
        Share invite link
      </button>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/5 p-3">
          <Users size={16} className="mb-2 text-cyan-300" />
          <p className="text-xl font-bold leading-none text-white">{count}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Referred</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 p-3">
          <Zap size={16} className="mb-2 text-yellow-300" />
          <p className="text-xl font-bold leading-none text-white">{points.toLocaleString()}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Referral points</p>
        </div>
      </div>
    </section>
  );
}
