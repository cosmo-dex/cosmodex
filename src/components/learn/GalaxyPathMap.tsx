"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Lock, ArrowRight } from "lucide-react";
import { Chapter } from "./pythonData";
import PixelPlanet from "./PixelPlanet";

import ThreeSpaceDebris from "./ThreeSpaceDebris";

interface GalaxyPathMapProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onSelectChapter: (chapter: Chapter) => void;
  courseTitle?: string;
  courseId?: string;
}

const PLANET_X_POSITIONS = [
  22,
  46,
  62,
  50,
  36,
  20,
  34,
  60,
  26,
  48,
];

export default function GalaxyPathMap({
  chapters,
  selectedChapterId,
  onSelectChapter,
  courseTitle,
  courseId,
}: GalaxyPathMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPathD, setSvgPathD] = useState<string>("");

  const isAllCompleted =
    chapters.length > 0 && chapters.every((c) => Boolean(c.isCompleted));
  const trackSlug = (courseId || (courseTitle || "python")).toLowerCase();

  // Calculate SVG path D attribute between exact planet centers
  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const nodeElements = containerRef.current.querySelectorAll<HTMLDivElement>(
        "[data-planet-index]"
      );

      if (nodeElements.length === 0) return;

      const points: { x: number; y: number }[] = [];

      nodeElements.forEach((node) => {
        const centerEl = node.querySelector("[data-planet-center]");
        const targetRect = centerEl
          ? centerEl.getBoundingClientRect()
          : node.getBoundingClientRect();

        const x = targetRect.left + targetRect.width / 2 - containerRect.left;
        const y = targetRect.top + targetRect.height / 2 - containerRect.top;
        points.push({ x, y });
      });

      if (points.length < 2) return;

      // Construct smooth SVG path command with cubic bezier curves
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
      }

      setSvgPathD(d);
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    const timeout = setTimeout(updatePath, 150);

    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timeout);
    };
  }, [chapters]);

  const completedCount = chapters.filter((c) => Boolean(c.isCompleted)).length;
  const totalCount = chapters.length;

  return (
    <div className="flex flex-col w-full relative">
      {/* ── Galaxy Map Header Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl md:text-2xl font-bold font-mono text-white tracking-wider flex items-center gap-2">
          THE {(courseTitle || "PYTHON").toUpperCase()} GALAXY
        </h2>
        <span className="text-xs font-mono text-cyan-300/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
          Tap a planet to view its theory &amp; MCQs
        </span>
      </div>


      {/* ── Galaxy Canvas Container (Seamless space canvas) ── */}
      <div
        ref={containerRef}
        className="relative w-full py-4 min-h-[1100px]"
      >
        {/* Floating 3D WebGL Space Debris & Asteroids Background */}
        <ThreeSpaceDebris />

        {/* SVG Dotted Path Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow-white" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FFFFFF" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Simple White Glowing Little Dots */}
          {svgPathD && (
            <path
              d={svgPathD}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeDasharray="0 14"
              strokeLinecap="round"
              filter="url(#glow-white)"
              className="animate-dots-cyan opacity-80"
            />
          )}
        </svg>

        {/* ── Planets List Grid/Node Map ── */}
        <div className="relative z-10 flex flex-col gap-36 sm:gap-40 py-6">
          {chapters.map((chapter, index) => {
            const xPercent = PLANET_X_POSITIONS[index % PLANET_X_POSITIONS.length];
            const isSelected = selectedChapterId === chapter.id;

            return (
              <motion.div
                key={chapter.id}
                id={chapter.id}
                data-planet-index={index}
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.65,
                  delay: (index % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex items-center transition-all duration-300"
                style={{
                  left: `${xPercent}%`,
                  transform: "translateX(-50%)",
                  width: "max-content",
                }}
              >
                <PixelPlanet
                  type={chapter.planetType}
                  number={chapter.number}
                  title={chapter.title}
                  isUnlocked={chapter.isUnlocked}
                  isCurrent={chapter.isCurrent}
                  isMilestone={chapter.isMilestone}
                  isSelected={isSelected}
                  onClick={() => onSelectChapter(chapter)}
                />
              </motion.div>
            );
          })}

          {/* ── Certificate Station (Locked / Unlocked at End of Galaxy) ── */}
          <motion.div
            id="certificate-station"
            data-planet-index={chapters.length}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center my-6"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              width: "max-content",
            }}
          >
            <div data-planet-center className="relative group">
              {isAllCompleted ? (
                <Link
                  href={`/learn/${trackSlug}/certificate`}
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl border-2 border-yellow-400 bg-gradient-to-b from-[#1c1404] via-[#0d091a] to-[#05040f] shadow-[0_0_50px_rgba(255,215,0,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer text-center max-w-xs"
                >
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-bounce">
                    <Award size={36} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-400 font-bold block">
                      FINAL DESTINATION
                    </span>
                    <h4 className="text-base font-black font-mono text-white tracking-wider uppercase">
                      Claim Certificate 🚀
                    </h4>
                    <p className="text-[11px] font-sans text-white/70 mt-1">
                      Conquered all {totalCount} stations!
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-black bg-yellow-400 px-3 py-1 rounded-full">
                    <span>View &amp; Mint</span>
                    <ArrowRight size={12} />
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-5 rounded-3xl border border-white/10 bg-[#0a0818]/90 text-center max-w-xs shadow-xl backdrop-blur-md opacity-75">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Lock size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 font-bold block">
                      FINAL DESTINATION
                    </span>
                    <h4 className="text-sm font-black font-mono text-white/60 tracking-wider uppercase">
                      Certificate Station (Locked)
                    </h4>
                    <p className="text-[11px] font-sans text-white/40 mt-1">
                      {completedCount} / {totalCount} Stations Completed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
