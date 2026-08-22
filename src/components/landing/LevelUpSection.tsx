"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Swords, BookOpen, Flame, Zap, ArrowRight, Sparkles } from "lucide-react";

const MILESTONES = [
  { level: 1, label: "Explorer", xp: 0, color: "#40e0ff", rgb: "64,224,255" },
  { level: 5, label: "Navigator", xp: 2500, color: "#b06aff", rgb: "176,106,255" },
  { level: 10, label: "Astronaut", xp: 7500, color: "#ff6ef7", rgb: "255,110,247" },
  { level: 20, label: "Star Coder", xp: 20000, color: "#ff4d8f", rgb: "255,77,143" },
  { level: 35, label: "Cosmic Titan", xp: 50000, color: "#ffb703", rgb: "255,183,3" },
  { level: 50, label: "Cosmic Legend", xp: 100000, color: "#e0aaff", rgb: "224,170,255" },
];

const PROGRESSION_RULES = [
  {
    icon: Swords,
    title: "Battle Arena Victory",
    xp: "+850 ✦",
    color: "#9b30ff",
    rgb: "155,48,255",
    rule: "Win 1v1 Code & MCQ Battles to boost XP and ELO rating.",
  },
  {
    icon: BookOpen,
    title: "Course Lessons Solved",
    xp: "+150 ✦",
    color: "#ff6ba8",
    rgb: "255,107,168",
    rule: "Complete interactive coding lessons, terminal exercises & quizzes.",
  },
  {
    icon: Flame,
    title: "7-Day Daily Streak",
    xp: "+350 ✦",
    color: "#c084fc",
    rgb: "192,132,252",
    rule: "Maintain active daily learning grind across the platform.",
  },
  {
    icon: Zap,
    title: "Level Up Formula",
    xp: "500 ✦ / Lvl",
    color: "#40e0ff",
    rgb: "64,224,255",
    rule: "Every 500 ✦ XP unlocks a new level and climbs cosmic league tiers.",
  },
];

export default function LevelUpSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [userData, setUserData] = useState<{
    xp_total: number;
    level: number;
    username: string;
  } | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/user/profile", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/stats", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([profData, statsData]) => {
        if (!isMounted) return;
        const u = profData?.user;
        const s = statsData;
        if (u || s) {
          const totalXp = Math.max(u?.xp_total ?? 0, s?.arenaXp ?? 0);
          const computedLevel =
            u?.level && u.level > 1
              ? u.level
              : Math.max(1, Math.floor(totalXp / 500) + 1);
          setUserData({
            xp_total: totalXp,
            level: computedLevel,
            username: u?.username || s?.username || "",
          });
        }
      })
      .catch(() => {
        // Unauthenticated visitor
      })
      .finally(() => {
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const rankInfo = useMemo(() => {
    const currentXP = userData ? userData.xp_total : 0;
    const userLevel = userData
      ? Math.max(userData.level, Math.floor(userData.xp_total / 500) + 1)
      : 1;

    let rankLabel = "Explorer";
    let rankColor = "#40e0ff";
    let rankRgb = "64,224,255";
    let nextLevelXP = 2500;
    let prevLevelXP = 0;

    if (userLevel >= 50 || currentXP >= 100000) {
      rankLabel = "Cosmic Legend";
      rankColor = "#e0aaff";
      rankRgb = "224,170,255";
      nextLevelXP = 250000;
      prevLevelXP = 100000;
    } else if (userLevel >= 35 || currentXP >= 50000) {
      rankLabel = "Cosmic Titan";
      rankColor = "#ffb703";
      rankRgb = "255,183,3";
      nextLevelXP = 100000;
      prevLevelXP = 50000;
    } else if (userLevel >= 20 || currentXP >= 20000) {
      rankLabel = "Star Coder";
      rankColor = "#ff4d8f";
      rankRgb = "255,77,143";
      nextLevelXP = 50000;
      prevLevelXP = 20000;
    } else if (userLevel >= 10 || currentXP >= 7500) {
      rankLabel = "Astronaut";
      rankColor = "#ff6ef7";
      rankRgb = "255,110,247";
      nextLevelXP = 20000;
      prevLevelXP = 7500;
    } else if (userLevel >= 5 || currentXP >= 2500) {
      rankLabel = "Navigator";
      rankColor = "#b06aff";
      rankRgb = "176,106,255";
      nextLevelXP = 7500;
      prevLevelXP = 2500;
    } else {
      rankLabel = "Explorer";
      rankColor = "#40e0ff";
      rankRgb = "64,224,255";
      nextLevelXP = 2500;
      prevLevelXP = 0;
    }

    const range = Math.max(1, nextLevelXP - prevLevelXP);
    const xpInLevel = Math.max(0, currentXP - prevLevelXP);
    const progressPct = Math.min(100, Math.max(0, (xpInLevel / range) * 100));

    return {
      currentXP,
      userLevel,
      rankLabel,
      rankColor,
      rankRgb,
      nextLevelXP,
      progressPct,
    };
  }, [userData]);

  const {
    currentXP,
    userLevel,
    rankLabel,
    rankColor,
    rankRgb,
    nextLevelXP,
    progressPct,
  } = rankInfo;

  return (
    <section
      id="level-up"
      className="section-padding"
      style={{
        position: "relative",
        zIndex: 3,
        background: "rgba(5,5,8,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      {/* Background tint */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(155,48,255,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-custom" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <div className="badge" style={{ marginBottom: "22px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor" />
            </svg>
            Progression & Cosmic Leagues
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 58px)",
              fontWeight: 700,
              letterSpacing: "0.03em",
              lineHeight: 1.28,
              paddingTop: "6px",
              marginBottom: "18px",
              fontFamily: "var(--font-display), sans-serif",
            }}
          >
            <span style={{ color: "rgba(240,230,255,0.9)" }}>Level Up Your</span>{" "}
            <span style={{ color: "#ffffff" }}>Learning.</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(240,230,255,0.48)",
              maxWidth: "540px",
              margin: "0 auto",
              lineHeight: 1.65,
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            Earn XP from lessons, battle arenas, and daily streaks to conquer cosmic leagues.
          </p>
        </motion.div>

        {/* ── 1ST BLOCK: Progress Bar (Logged In) OR Start Onboarding CTA (Not Logged In) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ marginBottom: "48px" }}
        >
          {isLoaded && userData ? (
            /* Logged in progress bar */
            <div
              style={{
                padding: "24px 32px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(18,12,32,0.85))",
                border: `1.5px solid rgba(${rankRgb}, 0.35)`,
                boxShadow: `0 12px 40px rgba(${rankRgb}, 0.18)`,
                transform: "translateZ(0)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-body), sans-serif" }}>
                    {userData.username ? `${userData.username}'s Live Progression` : "Your Live Progression"}
                  </span>
                  <span
                    style={{
                      padding: "4px 14px",
                      borderRadius: "100px",
                      background: `rgba(${rankRgb}, 0.18)`,
                      border: `1px solid ${rankColor}`,
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: rankColor,
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    }}
                  >
                    Lvl {userLevel} • {rankLabel}
                  </span>
                </div>
                <span style={{ fontSize: "12.5px", color: rankColor, fontWeight: 700, fontFamily: "var(--font-mono), 'Fira Code', monospace" }}>
                  {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} ✦ ({Math.round(progressPct)}%)
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${progressPct}%` } : { width: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: `linear-gradient(90deg, ${rankColor}, #c084fc, #9b30ff)`, borderRadius: "5px" }}
                />
              </div>
            </div>
          ) : (
            /* Not logged in: Start Onboarding CTA */
            <div
              style={{
                padding: "32px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, rgba(155,48,255,0.12) 0%, rgba(18,12,32,0.85) 50%, rgba(8,5,16,0.95) 100%)",
                border: "1.5px solid rgba(155,48,255,0.35)",
                boxShadow: "0 16px 48px rgba(155,48,255,0.25), inset 0 1.5px 1px rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "24px",
                transform: "translateZ(0)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#c084fc",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    marginBottom: "8px",
                  }}
                >
                  <Sparkles size={14} /> Start Your Cosmic Journey
                </div>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "var(--font-body), sans-serif",
                    margin: "0 0 6px 0",
                  }}
                >
                  Ready to Level Up and Unlock Cosmic Leagues?
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "rgba(240,230,255,0.6)",
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                    margin: 0,
                    maxWidth: "560px",
                  }}
                >
                  Join thousands of developers earning XP through interactive coding lessons, 1v1 battle matches, and daily streaks.
                </p>
              </div>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #9b30ff 0%, #ff2d78 100%)",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  fontFamily: "var(--font-body), sans-serif",
                  boxShadow: "0 8px 24px rgba(155,48,255,0.45)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                Start Onboarding <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── 2ND BLOCK: 6 Horizontal Sleek Rank Items Track ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.2 }}
          style={{ marginBottom: "56px" }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "rgba(240,230,255,0.35)",
              marginBottom: "20px",
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            ✦ Cosmic League Ranks
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "16px",
            }}
            className="leagues-grid"
          >
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.level}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                whileHover={{
                  y: -4,
                  scale: 1.03,
                }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "16px 14px",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, rgba(18,12,32,0.85), rgba(8,5,16,0.95))",
                  border: `1.5px solid rgba(${m.rgb}, 0.35)`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 16px rgba(${m.rgb}, 0.12)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {/* 3D Orb Badge Icon */}
                <div
                  style={{
                    position: "relative",
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: `radial-gradient(circle at 35% 30%, rgba(${m.rgb}, 0.55) 0%, rgba(${m.rgb}, 0.25) 60%, rgba(10,5,20,0.95) 100%)`,
                    border: `1.5px solid ${m.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 8px",
                    marginBottom: "12px",
                    boxShadow: `0 6px 22px rgba(${m.rgb}, 0.45), inset 0 2px 4px rgba(255,255,255,0.4)`,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "5px",
                      right: "5px",
                      height: "12px",
                      borderRadius: "100px",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: m.level >= 10 ? "13px" : "15px",
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                      fontFamily: "var(--font-body), sans-serif",
                      textShadow: `0 0 10px ${m.color}`,
                      padding: "2px 6px",
                    }}
                  >
                    Lvl {m.level}
                  </span>
                </div>

                {/* Rank Name */}
                <div
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "var(--font-body), sans-serif",
                    letterSpacing: "-0.01em",
                    marginBottom: "6px",
                  }}
                >
                  {m.label}
                </div>

                {/* Required XP Tag */}
                <div
                  style={{
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: `rgba(${m.rgb}, 0.12)`,
                    border: `1px solid rgba(${m.rgb}, 0.3)`,
                    color: m.color,
                    fontFamily: "var(--font-mono), 'Fira Code', monospace",
                  }}
                >
                  {m.xp === 0 ? "0 ✦ XP" : `${m.xp.toLocaleString()} ✦ XP`}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 3RD BLOCK: Earning Rules Bar (Horizontal Grid) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "rgba(240,230,255,0.35)",
              marginBottom: "18px",
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            ✦ Progression Rules & Guidelines
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
            className="rules-grid"
          >
            {PROGRESSION_RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.title}
                  style={{
                    padding: "20px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(18,12,32,0.85), rgba(8,5,16,0.95))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "12px",
                        background: `rgba(${rule.rgb}, 0.15)`,
                        border: `1px solid rgba(${rule.rgb}, 0.35)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: rule.color,
                      }}
                    >
                      <Icon size={18} fill="currentColor" />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: rule.color,
                        fontFamily: "var(--font-mono), 'Fira Code', monospace",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        background: `rgba(${rule.rgb}, 0.1)`,
                        border: `1px solid rgba(${rule.rgb}, 0.25)`,
                      }}
                    >
                      {rule.xp}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#ffffff",
                        fontFamily: "var(--font-body), sans-serif",
                        marginBottom: "4px",
                      }}
                    >
                      {rule.title}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(240,230,255,0.42)",
                        fontFamily: "var(--font-body), 'Fira Code', monospace",
                        lineHeight: 1.45,
                        margin: 0,
                      }}
                    >
                      {rule.rule}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Responsive Grid Styles ── */}
      <style>{`
        @media (max-width: 1200px) {
          .leagues-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .rules-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .leagues-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .rules-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
