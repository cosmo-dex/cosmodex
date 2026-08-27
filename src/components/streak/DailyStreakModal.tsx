"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, X, Trophy, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

export default function DailyStreakModal() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(1);
  const [bestStreak, setBestStreak] = useState(1);

  const currentDayIndex = (() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  })();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const storageKey = `cosmodex_streak_popup_dismissed_${user.userId}_${todayStr}`;

    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) {
      return;
    }

    fetch("/api/user/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setStreakCount(data.currentStreak || 1);
          setBestStreak(data.bestStreak || 1);

          if (data.streakIncreased) {
            setIsOpen(true);
          }
        }
      })
      .catch((err) => {
        console.warn("[DailyStreakModal] Streak check error:", err);
      });
  }, [isAuthenticated, user?.userId]);

  const handleClose = () => {
    setIsOpen(false);
    if (user?.userId && typeof window !== "undefined") {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`cosmodex_streak_popup_dismissed_${user.userId}_${todayStr}`, "true");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#050508]/85 backdrop-blur-xl transition-all"
          />


          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#E873C3]/30 bg-gradient-to-b from-[#180c2e] via-[#0d071a] to-[#050508] p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(232,115,195,0.25),0_25px_60px_rgba(0,0,0,0.95)] z-10"
            style={{
              boxShadow: "0 0 60px rgba(155,48,255,0.25), inset 0 1.5px 1px rgba(255,255,255,0.15)",
            }}
          >

            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-b from-[#ff2d78]/25 via-[#9b30ff]/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 w-60 h-60 rounded-full bg-[#00FFE9]/10 blur-3xl" />


            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-20"
              aria-label="Close streak modal"
            >
              <X size={18} />
            </button>


            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b30ff]/15 border border-[#9b30ff]/40 text-[#c084fc] font-mono text-[11px] font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(155,48,255,0.3)]">
              <Sparkles size={12} className="text-[#FFA249]" />
              <span>Daily Streak Extended</span>
            </div>


            <div className="relative mx-auto mb-5 flex items-center justify-center w-28 h-28">

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.85, 0.5],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff2d78] via-[#ff7a00] to-[#ffd700] blur-2xl pointer-events-none"
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 rounded-full border border-dashed border-orange-400/40 pointer-events-none"
              />

              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#2b1040] via-[#1a0928] to-[#0e0417] border-2 border-orange-400/80 shadow-[0_0_35px_rgba(255,122,0,0.6)]">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    scale: [1, 1.06, 1],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-center"
                >
                  <Flame size={54} className="text-amber-400 fill-orange-500 filter drop-shadow-[0_0_18px_rgba(255,122,0,0.9)]" />
                </motion.div>


                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="absolute -bottom-1 -right-1 flex items-center justify-center px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff2d78] to-[#9b30ff] border border-white/40 text-white font-mono text-[11px] font-black shadow-[0_0_12px_rgba(255,45,120,0.8)]"
                >
                  +1
                </motion.div>
              </div>
            </div>

            <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mb-1.5">
              <span className="bg-gradient-to-r from-[#FFA249] via-[#E873C3] to-[#00FFE9] bg-clip-text text-transparent">
                {streakCount} Day{streakCount > 1 ? "s" : ""}
              </span>{" "}
              Streak! 🔥
            </h2>

            <p className="text-white/70 text-xs sm:text-sm font-medium mb-5 max-w-xs mx-auto leading-relaxed font-sans">
              You kept the cosmic flame alive today. Daily practice unlocks cosmic leagues and XP boosts!
            </p>

            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/12 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-mono text-white/60 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Flame size={12} className="text-orange-400 fill-orange-400" />
                  Streak Track
                </span>
                <span className="text-[11px] font-mono text-amber-300 font-extrabold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  {streakCount} {streakCount === 1 ? "Day" : "Days"} Active 🔥
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS_OF_WEEK.map((dayLabel, idx) => {
                  const isToday = idx === currentDayIndex;
                  const isStreakActive = idx <= currentDayIndex && idx > (currentDayIndex - streakCount);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 relative ${isToday
                          ? "bg-gradient-to-tr from-[#ff7a00] via-[#ff2d78] to-[#9b30ff] text-white border-2 border-amber-200 shadow-[0_0_24px_rgba(255,122,0,0.9),0_0_10px_rgba(255,45,120,0.6)] scale-110 z-10"
                          : isStreakActive
                            ? "bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-pink-500/20 text-white border-1.5 border-orange-400/80 shadow-[0_0_16px_rgba(255,140,0,0.55)] scale-100"
                            : "bg-white/[0.03] text-white/20 border border-white/5 opacity-50"
                          }`}
                      >
                        {isToday ? (
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Flame size={18} className="fill-amber-200 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                          </motion.div>
                        ) : isStreakActive ? (
                          <Flame size={16} className="fill-amber-400 text-orange-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                        ) : (
                          <span className="font-mono text-[11px] text-white/30 font-semibold">{dayLabel}</span>
                        )}

                        {isToday && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 border border-white shadow-[0_0_8px_#ffd700]" />
                        )}
                      </div>

                      <span className={`text-[10px] font-mono font-bold tracking-tight ${isToday
                        ? "text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                        : isStreakActive
                          ? "text-orange-400"
                          : "text-white/30"
                        }`}>
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-semibold">Today&apos;s Bonus</span>
                <span className="text-sm sm:text-base font-bold text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  +50 ✦ <span className="text-[11px] text-white/60">XP</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-semibold">Best Streak</span>
                <span className="text-sm sm:text-base font-bold text-orange-400 font-mono mt-0.5 flex items-center gap-1">
                  <Trophy size={13} className="text-orange-400" />
                  {bestStreak} Day{bestStreak > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9b30ff] via-[#d946ef] to-[#ff2d78] hover:from-[#8b20ef] hover:via-[#c026d3] hover:to-[#e11d48] text-white font-bold text-sm tracking-wide shadow-[0_8px_25px_rgba(155,48,255,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              style={{
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              <span>Keep Grinding</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
