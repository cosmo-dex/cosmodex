"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Swords, BookOpen, Flame, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const MILESTONES = [
  { level: 1, label: "Explorer", xp: 0, color: "#a8b2d1", rgb: "168,178,209", icon: "/images/ranks/explorer.webp" },
  { level: 5, label: "Astronaut", xp: 5000, color: "#40e0ff", rgb: "64,224,255", icon: "/images/ranks/astronaut.webp" },
  { level: 10, label: "Navigator", xp: 7500, color: "#00b4d8", rgb: "0,180,216", icon: "/images/ranks/navigator.webp" },
  { level: 20, label: "Star Coder", xp: 10000, color: "#4895ef", rgb: "72,149,239", icon: "/images/ranks/star_coder.webp" },
  { level: 35, label: "Galaxy Master", xp: 15000, color: "#7209b7", rgb: "114,9,183", icon: "/images/ranks/galaxy_master.webp" },
  { level: 50, label: "Celestial Master", xp: 20000, color: "#b5179e", rgb: "181,23,158", icon: "/images/ranks/celestial_master.webp" },
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
  const { user } = useAuth();
  const mounted = useMounted();

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

        {/* ── 1ST BLOCK: Start Onboarding CTA (Only shown when not logged in) ── */}
        {mounted && !user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ marginBottom: "48px" }}
          >
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
                href="/onboarding"
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
          </motion.div>
        )}

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
                  y: -6,
                  scale: 1.04,
                }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "20px 14px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(18,12,32,0.88), rgba(8,5,16,0.95))",
                  border: `1.5px solid rgba(${m.rgb}, 0.4)`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(${m.rgb}, 0.15)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {/* Rank Badge Custom Image Icon */}
                <div
                  style={{
                    position: "relative",
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                    filter: `drop-shadow(0 0 14px rgba(${m.rgb}, 0.6))`,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={m.icon}
                    alt={m.label}
                    width={64}
                    height={64}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                  />
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
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    background: `rgba(${m.rgb}, 0.14)`,
                    border: `1px solid rgba(${m.rgb}, 0.35)`,
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
