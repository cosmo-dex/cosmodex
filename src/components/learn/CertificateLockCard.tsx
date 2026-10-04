"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Award, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Chapter } from "./pythonData";

interface CertificateLockCardProps {
  courseId?: string;
  chapters: Chapter[];
}

function normalizeCourseSlug(slug?: string): string {
  if (!slug) return "python";
  const s = slug.toLowerCase().trim();
  if (s === "python" || s === "py" || s === "py-1" || s.startsWith("py-") || s.startsWith("python")) {
    return "python";
  }
  if (s === "html" || s === "web-1" || s === "html-1" || s.startsWith("html-") || s.startsWith("web-")) {
    return "html";
  }
  return s;
}

export default function CertificateLockCard({ courseId = "python", chapters }: CertificateLockCardProps) {
  const normSlug = normalizeCourseSlug(courseId);
  const totalCount = chapters.length || 9;
  const completedCount = chapters.filter((c) => Boolean(c.isCompleted)).length;
  const isAllCompleted = totalCount > 0 && completedCount >= totalCount;
  const pct = Math.round((completedCount / (totalCount || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
        isAllCompleted
          ? "border-2 border-yellow-400/80 bg-gradient-to-b from-[#1c1404] via-[#0d091a] to-[#05040f] shadow-[0_0_40px_rgba(255,215,0,0.25)]"
          : "border border-white/10 bg-[#070514]/90 shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Background glow effects */}
      {isAllCompleted ? (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
      ) : (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 space-y-4">
        {/* ── Top Header Row ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isAllCompleted
                  ? "bg-yellow-500/20 border border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                  : "bg-white/5 border border-white/10 text-white/40"
              }`}
            >
              {isAllCompleted ? <Award size={18} /> : <Lock size={16} />}
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-cyan-400 block">
                CREDENTIAL VAULT
              </span>
              <h3 className="text-sm sm:text-base font-black font-mono text-white tracking-wide uppercase">
                Course Certificate
              </h3>
            </div>
          </div>

          {isAllCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black text-black bg-gradient-to-r from-yellow-400 to-amber-400 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.4)]">
              <Sparkles size={11} />
              UNLOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300/90 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
              <Lock size={10} />
              LOCKED
            </span>
          )}
        </div>

        {/* ── Progress Details ── */}
        <div className="space-y-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-white/50">Stations Conquered</span>
            <span className={isAllCompleted ? "text-yellow-300 font-bold" : "text-cyan-300 font-bold"}>
              {completedCount} / {totalCount} ({pct}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isAllCompleted
                  ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(255,215,0,0.8)]"
                  : "bg-gradient-to-r from-cyan-400 to-fuchsia-500"
              }`}
              style={{ width: `${Math.max(5, pct)}%` }}
            />
          </div>
        </div>

        {/* ── Description text ── */}
        <p className="text-xs font-sans text-white/60 leading-relaxed">
          {isAllCompleted ? (
            <span className="text-white/90">
              🎉 <strong className="text-yellow-300">Outstanding work!</strong> You have conquered every station and knowledge check. Your official certificate is ready to claim!
            </span>
          ) : (
            <span>
              Complete all <strong className="text-cyan-300">{totalCount} stations</strong> and pass each knowledge check quiz (<strong className="text-amber-300">3/5 score</strong>) to unlock your verified calligraphy certificate.
            </span>
          )}
        </p>

        {/* ── Action Button ── */}
        <div className="pt-1">
          {isAllCompleted ? (
            <Link
              href={`/learn/${normSlug}/certificate`}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:opacity-95 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,215,0,0.45)] hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Award size={16} />
              <span>Claim Certificate 🚀</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-mono font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-not-allowed">
              <Lock size={13} />
              <span>Locked • {totalCount - completedCount} Stations Remaining</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
