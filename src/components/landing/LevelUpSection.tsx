"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
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
  { level: 1, label: "Explorer", color: "#a8b2d1", rgb: "168,178,209", icon: "/images/ranks/explorer.webp" },
  { level: 5, label: "Astronaut", color: "#40e0ff", rgb: "64,224,255", icon: "/images/ranks/astronaut.webp" },
  { level: 10, label: "Navigator", color: "#00b4d8", rgb: "0,180,216", icon: "/images/ranks/navigator.webp" },
  { level: 20, label: "Star Coder", color: "#4895ef", rgb: "72,149,239", icon: "/images/ranks/star_coder.webp" },
  { level: 35, label: "Galaxy Master", color: "#7209b7", rgb: "114,9,183", icon: "/images/ranks/galaxy_master.webp" },
  { level: 50, label: "Celestial Master", color: "#b5179e", rgb: "181,23,158", icon: "/images/ranks/celestial_master.webp" },
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
            Master algorithms, compete in real-time battle arenas, and ascend through cosmic leagues.
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
                  Join thousands of developers leveling up their skills through interactive coding lessons, 1v1 battle matches, and challenges.
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
          style={{ marginBottom: "0px" }}
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

                {/* Rank Tier Tag */}
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
                  Tier 0{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Responsive Grid Styles ── */}
      <style>{`
        @media (max-width: 1200px) {
          .leagues-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .leagues-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
