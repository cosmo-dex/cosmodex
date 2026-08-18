"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const milestones = [
  { level: 1, label: "Explorer", xp: 0, color: "#40e0ff", rgb: "64,224,255" },
  { level: 5, label: "Navigator", xp: 2500, color: "#b06aff", rgb: "176,106,255" },
  { level: 10, label: "Astronaut", xp: 7500, color: "#ff6ef7", rgb: "255,110,247" },
  { level: 20, label: "Star Coder", xp: 20000, color: "#ff4d8f", rgb: "255,77,143" },
];

export default function LevelUpSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Simulated current progress
  const currentXP = 3200;
  const nextLevelXP = 7500;
  const progressPct = Math.min((currentXP / nextLevelXP) * 100, 100);

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
      {/* Radial tint */}
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
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <div className="badge" style={{ marginBottom: "22px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor" />
            </svg>
            Progression
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
            <span style={{ color: "rgba(240,230,255,0.9)" }}>Level Up Your</span>
            <br />
            <span style={{ color: "#ffffff" }}>Learning.</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(240,230,255,0.48)",
              maxWidth: "460px",
              margin: "0 auto",
              lineHeight: 1.65,
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            Every lesson, challenge, and streak earns you ✦. Watch your rank
            climb as you conquer the cosmos.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "start",
            perspective: "1200px",
          }}
          className="levelup-grid"
        >
          {/* Left: XP progress card (3D) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            whileHover={{
              rotateX: 4,
              rotateY: -6,
              scale: 1.025,
              z: 20,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(18,12,32,0.88), rgba(8,5,16,0.95))",
                border: "1.5px solid rgba(255,255,255,0.14)",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 1.5px 1px rgba(255,255,255,0.18)",
                transformStyle: "preserve-3d",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {/* Level badge (3D Glowing Orb) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  marginBottom: "28px",
                  transform: "translateZ(24px)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "68px",
                    height: "68px",
                    borderRadius: "20px",
                    background: "radial-gradient(circle at 35% 30%, rgba(255,45,120,0.5) 0%, rgba(155,48,255,0.3) 60%, rgba(10,5,20,0.95) 100%)",
                    border: "1.5px solid rgba(255,45,120,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(255,45,120,0.45), inset 0 2px 4px rgba(255,255,255,0.4)",
                    transform: "translateZ(20px)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "8px",
                      right: "8px",
                      height: "18px",
                      borderRadius: "100px",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: 900,
                      fontFamily: "var(--font-display), sans-serif",
                      color: "#ffffff",
                      textShadow: "0 0 16px rgba(255,45,120,0.9), 0 2px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    7
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "rgba(240,230,255,0.95)",
                      fontFamily: "var(--font-display), sans-serif",
                      letterSpacing: "-0.02em",
                      marginBottom: "4px",
                    }}
                  >
                    Navigator
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "rgba(240,230,255,0.35)",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    }}
                  >
                    {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} ✦
                  </div>
                </div>
              </div>

              {/* XP bar */}
              <div style={{ marginBottom: "28px", transform: "translateZ(18px)" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(240,230,255,0.35)",
                      fontFamily: "var(--font-body), 'Fira Code', monospace",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    ✦ Progress
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#c084fc",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(progressPct)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${progressPct}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #ff2d78, #c084fc, #9b30ff)",
                      borderRadius: "4px",
                      boxShadow: "0 0 16px rgba(255,45,120,0.6)",
                    }}
                  />
                </div>
              </div>

              {/* XP sources */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", transform: "translateZ(14px)" }}>
                {[
                  { label: "Lessons completed", xp: "+150 ✦", color: "#ff6ba8" },
                  { label: "Daily streak (7 days)", xp: "+350 ✦", color: "#c084fc" },
                  { label: "Battle challenge won", xp: "+850 ✦", color: "#9b30ff" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(240,230,255,0.58)",
                        fontFamily: "var(--font-body), 'Fira Code', monospace",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: item.color,
                        fontFamily: "var(--font-mono), 'Fira Code', monospace",
                        fontWeight: 700,
                      }}
                    >
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: milestone ladder (3D cards with 3D Orb Badges) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "rgba(240,230,255,0.28)",
                marginBottom: "8px",
                fontFamily: "var(--font-body), 'Fira Code', monospace",
              }}
            >
              Rank Milestones
            </div>
            {milestones.map((m, i) => {
              const reached = currentXP >= m.xp;
              return (
                <motion.div
                  key={m.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  whileHover={{
                    rotateX: -5,
                    rotateY: 8,
                    scale: 1.03,
                    z: 25,
                  }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    opacity: reached ? 1 : 0.6,
                    borderRadius: "20px",
                    background: reached
                      ? `linear-gradient(135deg, rgba(${m.rgb}, 0.18) 0%, rgba(18,12,32,0.85) 50%, rgba(8,5,16,0.95) 100%)`
                      : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(10,7,20,0.7) 100%)",
                    border: reached
                      ? `1.5px solid rgba(${m.rgb}, 0.5)`
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: reached
                      ? `0 16px 40px rgba(${m.rgb}, 0.25), inset 0 1.5px 1px rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.5)`
                      : "0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                    transformStyle: "preserve-3d",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* 3D Orb / Shield Badge */}
                  <div
                    style={{
                      position: "relative",
                      width: "52px",
                      height: "52px",
                      borderRadius: "16px",
                      background: reached
                        ? `radial-gradient(circle at 35% 30%, rgba(${m.rgb}, 0.5) 0%, rgba(${m.rgb}, 0.2) 60%, rgba(10,5,20,0.9) 100%)`
                        : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08) 0%, rgba(15,10,25,0.7) 100%)",
                      border: `1.5px solid ${reached ? m.color : "rgba(255,255,255,0.12)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: reached
                        ? `0 8px 24px rgba(${m.rgb}, 0.45), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.8)`
                        : "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.08)",
                      transform: "translateZ(24px)",
                      overflow: "hidden",
                    }}
                  >
                    {/* 3D Specular Highlight Gloss */}
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "6px",
                        right: "6px",
                        height: "14px",
                        borderRadius: "100px",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: m.level >= 10 ? "14px" : "17px",
                        fontWeight: 900,
                        color: reached ? "#ffffff" : "rgba(240,230,255,0.3)",
                        fontFamily: "var(--font-display), sans-serif",
                        textShadow: reached
                          ? `0 0 12px ${m.color}, 0 2px 4px rgba(0,0,0,0.9)`
                          : "none",
                        transform: "translateZ(8px)",
                      }}
                    >
                      {m.level}
                    </span>
                  </div>

                  <div style={{ flex: 1, transform: "translateZ(16px)" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: reached ? "rgba(240,230,255,0.95)" : "rgba(240,230,255,0.4)",
                        fontFamily: "var(--font-display), sans-serif",
                        letterSpacing: "-0.01em",
                        marginBottom: "3px",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "rgba(240,230,255,0.32)",
                        fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      }}
                    >
                      {m.xp === 0 ? "Starting rank" : `${m.xp.toLocaleString()} ✦ required`}
                    </div>
                  </div>

                  {reached && (
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: "100px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: `rgba(${m.rgb}, 0.15)`,
                        border: `1.5px solid rgba(${m.rgb}, 0.5)`,
                        color: m.color,
                        fontFamily: "var(--font-body), 'Fira Code', monospace",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        flexShrink: 0,
                        boxShadow: `0 0 16px rgba(${m.rgb}, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)`,
                        transform: "translateZ(22px)",
                      }}
                    >
                      Reached
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .levelup-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
