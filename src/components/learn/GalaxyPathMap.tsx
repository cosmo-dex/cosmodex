"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chapter } from "./pythonData";
import PixelPlanet from "./PixelPlanet";

import ThreeSpaceDebris from "./ThreeSpaceDebris";

interface GalaxyPathMapProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onSelectChapter: (chapter: Chapter) => void;
  courseTitle?: string;
}

const PLANET_X_POSITIONS = [
  20,
  52,
  82,
  68,
  45,
  22,
  36,
  78,
  30,
  56,
];

export default function GalaxyPathMap({
  chapters,
  selectedChapterId,
  onSelectChapter,
  courseTitle,
}: GalaxyPathMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPathD, setSvgPathD] = useState<string>("");

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

  return (
    <div className="flex flex-col w-full relative">
      {/* ── Galaxy Map Header Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
        <div className="relative z-10 flex flex-col gap-24 py-6">
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
        </div>
      </div>
    </div>
  );
}
