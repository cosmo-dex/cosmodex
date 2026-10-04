"use client";

import React, { useState, useId } from "react";
import { Target, Lock } from "lucide-react";
import { PlanetType } from "./pythonData";

interface PixelPlanetProps {
  type: PlanetType;
  size?: number; // default 84
  number: number;
  title: string;
  isUnlocked: boolean;
  isCurrent?: boolean;
  isMilestone?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PixelPlanet({
  type,
  size = 84,
  number,
  title,
  isUnlocked,
  isCurrent = false,
  isMilestone = false,
  isSelected = false,
  onClick,
}: PixelPlanetProps) {
  const uniqueId = useId().replace(/:/g, "");
  const [isRippling, setIsRippling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Planets reveal their signature theme colors only on hover or selection
  const isColored = isSelected || isHovered;

  const handlePlanetClick = () => {
    if (!isUnlocked) return;
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1400);
    if (onClick) onClick();
  };

  // Team Design System Isometric Gradients:
  // Theme 1 (Sunset Magenta/Gold): #FFA249 -> #9E00F6
  // Theme 2 (Cyber Cyan/Royal Blue): #00FFE9 -> #2E3192
  // Theme 3 (Neon Coral/Violet): #FF7F83 -> #2700F6
  const getThemeStyles = () => {
    switch (type) {
      case "swirl":
      case "striped-banded":
        // Pink-Magenta to Electric Violet (#FF007A -> #9E00F6)
        return {
          glow: "shadow-[0_0_12px_rgba(255,0,122,0.3)]",
          ringBorder: "border-[#FF007A]",
          textHover: "text-[#FF007A] drop-shadow-[0_0_6px_rgba(255,0,122,0.4)]",
          badgeBg: isUnlocked ? "bg-[#FF007A] text-white border-[#FF007A]" : "",
        };
      case "green-crater":
      case "saturn-ring":
      case "grid-web":
        // Electric Cyan to Royal Blue (#00FFE9 -> #2E3192)
        return {
          glow: "shadow-[0_0_12px_rgba(0,255,233,0.3)]",
          ringBorder: "border-[#00FFE9]",
          textHover: "text-[#00FFE9] drop-shadow-[0_0_6px_rgba(0,255,233,0.4)]",
          badgeBg: isUnlocked ? "bg-[#00FFE9] text-[#050508] border-[#00FFE9]" : "",
        };
      case "moon-crater":
      default:
        // Gold Yellow to Coral Orange (#FFD600 -> #FF6B00)
        return {
          glow: "shadow-[0_0_12px_rgba(255,107,0,0.3)]",
          ringBorder: "border-[#FF6B00]",
          textHover: "text-[#FF6B00] drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]",
          badgeBg: isUnlocked ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "",
        };
    }
  };

  const theme = getThemeStyles();

  // Renders exact SVG planet graphics matching Team Design Specs
  const renderPlanetGraphic = () => {
    switch (type) {
      case "green-crater":
        // Cyber Cyan / Royal Blue Cratered Planet (#00FFE9 -> #2E3192)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <radialGradient id={`greenPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#A6FFFF" : "#CBD5E1"} />
                <stop offset="35%" stopColor={isColored ? "#00FFE9" : "#94A3B8"} />
                <stop offset="70%" stopColor={isColored ? "#2E3192" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#0F114A" : "#0F172A"} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={isColored ? "#0F114A" : "#0F172A"} />
            <circle cx="50" cy="50" r="44" fill={`url(#greenPlanet-${uniqueId})`} />

            <circle cx="35" cy="35" r="9" fill={isColored ? "#181B66" : "#334155"} stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="3" />
            <circle cx="35" cy="35" r="5" fill={isColored ? "#0F114A" : "#1E293B"} />

            <circle cx="68" cy="42" r="11" fill={isColored ? "#181B66" : "#334155"} stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="3.5" />
            <circle cx="68" cy="42" r="6" fill={isColored ? "#0F114A" : "#1E293B"} />

            <circle cx="45" cy="70" r="8" fill={isColored ? "#181B66" : "#334155"} stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="2.5" />
            <circle cx="45" cy="70" r="4" fill={isColored ? "#0F114A" : "#1E293B"} />

            <circle cx="24" cy="58" r="6" fill={isColored ? "#181B66" : "#334155"} stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="2" />
            <circle cx="76" cy="72" r="5" fill={isColored ? "#181B66" : "#334155"} stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="2" />

            <circle cx="28" cy="24" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />
          </svg>
        );

      case "swirl":
        // Pink-Magenta to Electric Violet Swirl Planet (#FF007A -> #9E00F6)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <radialGradient id={`swirlPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#FF75BA" : "#CBD5E1"} />
                <stop offset="35%" stopColor={isColored ? "#FF007A" : "#94A3B8"} />
                <stop offset="70%" stopColor={isColored ? "#9E00F6" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#2A0054" : "#0F172A"} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={isColored ? "#2A0054" : "#0F172A"} />
            <circle cx="50" cy="50" r="44" fill={`url(#swirlPlanet-${uniqueId})`} />

            <g className="animate-[spin_25s_linear_infinite] origin-center">
              <path
                d="M 22 40 Q 45 15, 75 30 Q 88 50, 62 65 Q 32 78, 22 52 Z"
                fill="none"
                stroke={isColored ? "#FF75BA" : "#E2E8F0"}
                strokeWidth="5"
                opacity="0.8"
              />
              <path
                d="M 30 30 Q 55 18, 80 40"
                fill="none"
                stroke={isColored ? "#FF007A" : "#94A3B8"}
                strokeWidth="4"
                opacity="0.65"
              />
              <path
                d="M 20 62 Q 45 82, 75 60"
                fill="none"
                stroke={isColored ? "#4B007D" : "#1E293B"}
                strokeWidth="6"
                opacity="0.85"
              />
            </g>
            <circle cx="28" cy="24" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />
          </svg>
        );

      case "striped-banded":
        // Pink-Magenta to Electric Violet Striped Banded Planet (#FF007A -> #9E00F6)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <radialGradient id={`stripedPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#FF75BA" : "#E2E8F0"} />
                <stop offset="35%" stopColor={isColored ? "#FF007A" : "#94A3B8"} />
                <stop offset="70%" stopColor={isColored ? "#9E00F6" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#2A0054" : "#0F172A"} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={isColored ? "#2A0054" : "#0F172A"} />
            <circle cx="50" cy="50" r="44" fill={`url(#stripedPlanet-${uniqueId})`} />

            <path d="M 10 32 Q 50 40, 90 32" stroke={isColored ? "#FF75BA" : "#64748B"} strokeWidth="5" fill="none" opacity="0.9" />
            <path d="M 8 44 Q 50 52, 92 44" stroke={isColored ? "#FFD0E5" : "#CBD5E1"} strokeWidth="4" fill="none" opacity="0.75" />
            <path d="M 10 56 Q 50 64, 90 56" stroke={isColored ? "#7000B3" : "#334155"} strokeWidth="6" fill="none" opacity="0.9" />
            <path d="M 14 68 Q 50 74, 86 68" stroke={isColored ? "#E000FF" : "#64748B"} strokeWidth="4" fill="none" opacity="0.8" />

            <circle cx="28" cy="24" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />
          </svg>
        );

      case "saturn-ring":
        // Cyber Cyan / Royal Blue Saturn Ringed Planet (#00FFE9 -> #2E3192)
        return (
          <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <radialGradient id={`saturnPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#A6FFFF" : "#CBD5E1"} />
                <stop offset="35%" stopColor={isColored ? "#00FFE9" : "#94A3B8"} />
                <stop offset="70%" stopColor={isColored ? "#2E3192" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#0F114A" : "#0F172A"} />
              </radialGradient>
            </defs>
            <ellipse cx="60" cy="50" rx="54" ry="16" fill="none" stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="6" opacity="0.45" transform="rotate(-15 60 50)" />

            <circle cx="60" cy="50" r="37" fill={isColored ? "#0F114A" : "#0F172A"} />
            <circle cx="60" cy="50" r="36" fill={`url(#saturnPlanet-${uniqueId})`} />

            <path d="M 28 42 Q 60 48, 92 42" stroke={isColored ? "#00A3FF" : "#475569"} strokeWidth="4" fill="none" opacity="0.9" />
            <path d="M 26 52 Q 60 58, 94 52" stroke={isColored ? "#A6FFFF" : "#CBD5E1"} strokeWidth="3" fill="none" opacity="0.8" />
            <path d="M 30 62 Q 60 68, 90 62" stroke={isColored ? "#181B66" : "#0F172A"} strokeWidth="4" fill="none" opacity="0.9" />

            <circle cx="46" cy="32" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />

            <path d="M 10 56 A 54 16 0 0 0 110 44" fill="none" stroke={isColored ? "#00FFE9" : "#CBD5E1"} strokeWidth="7" opacity="0.9" transform="rotate(-15 60 50)" />
          </svg>
        );

      case "grid-web":
        // Cyber Cyan / Royal Blue Hexagonal Grid Mesh Planet (#00FFE9 -> #2E3192)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <radialGradient id={`gridWebPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#A6FFFF" : "#94A3B8"} />
                <stop offset="35%" stopColor={isColored ? "#00FFE9" : "#64748B"} />
                <stop offset="70%" stopColor={isColored ? "#2E3192" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#0A0C38" : "#0F172A"} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={isColored ? "#0A0C38" : "#0F172A"} />
            <circle cx="50" cy="50" r="44" fill={`url(#gridWebPlanet-${uniqueId})`} />

            <g className="animate-[spin_30s_linear_infinite] origin-center">
              <polygon points="50,15 75,28 75,55 50,68 25,55 25,28" fill="none" stroke={isColored ? "#00FFE9" : "#CBD5E1"} strokeWidth="2" opacity="0.85" />
              <polygon points="50,28 65,36 65,52 50,60 35,52 35,36" fill="none" stroke={isColored ? "#A6FFFF" : "#94A3B8"} strokeWidth="1.5" opacity="0.7" />
              <line x1="50" y1="15" x2="50" y2="85" stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="1.5" opacity="0.6" />
              <line x1="15" y1="50" x2="85" y2="50" stroke={isColored ? "#00FFE9" : "#94A3B8"} strokeWidth="1.5" opacity="0.6" />
            </g>

            <circle cx="28" cy="24" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />
          </svg>
        );

      case "moon-crater":
      default:
        // Neon Coral / Violet Moon Crater Planet (#FF7F83 -> #2700F6)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <radialGradient id={`moonCraterPlanet-${uniqueId}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={isColored ? "#FFB3B5" : "#CBD5E1"} />
                <stop offset="35%" stopColor={isColored ? "#FF7F83" : "#94A3B8"} />
                <stop offset="70%" stopColor={isColored ? "#2700F6" : "#475569"} />
                <stop offset="100%" stopColor={isColored ? "#0C0054" : "#1E293B"} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={isColored ? "#0C0054" : "#1E293B"} />
            <circle cx="50" cy="50" r="44" fill={`url(#moonCraterPlanet-${uniqueId})`} />

            <circle cx="35" cy="30" r="8" fill={isColored ? "#6200B3" : "#334155"} stroke={isColored ? "#FF7F83" : "#475569"} strokeWidth="1.5" opacity="0.85" />
            <circle cx="65" cy="55" r="12" fill={isColored ? "#6200B3" : "#334155"} stroke={isColored ? "#FF7F83" : "#475569"} strokeWidth="2" opacity="0.85" />
            <circle cx="63" cy="53" r="9" fill={isColored ? "#140080" : "#1E293B"} opacity="0.9" />

            <circle cx="38" cy="65" r="9" fill={isColored ? "#6200B3" : "#334155"} stroke={isColored ? "#FF7F83" : "#475569"} strokeWidth="1.5" opacity="0.85" />
            <circle cx="70" cy="32" r="6" fill={isColored ? "#6200B3" : "#334155"} opacity="0.75" />
            <circle cx="26" cy="48" r="5" fill={isColored ? "#6200B3" : "#334155"} opacity="0.75" />

            <circle cx="28" cy="24" r="6" fill="#FFFFFF" opacity="0.45" filter="blur(1px)" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex flex-col items-center select-none group ${isUnlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
      onClick={handlePlanetClick}
      onMouseEnter={() => { if (isUnlocked) setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
      title={isUnlocked ? title : "Complete the previous station to unlock"}
    >
      {/* ── Planet Wrapper Container ── */}
      <div data-planet-center className="relative flex items-center justify-center">
        {/* Slow Cosmic Ripple Wave Effect on Click */}
        {isRippling && (
          <>
            {/* Wave 1: Slow expanding outer glowing ripple */}
            <span
              className={`absolute inset-[-10px] rounded-full border-2 ${
                isCurrent ? "border-[#00FFE9]" : theme.ringBorder
              } pointer-events-none animate-[ripple_1.4s_cubic-bezier(0,0.2,0.8,1)_infinite]`}
            />
            {/* Wave 2: Staggered trailing ripple ring */}
            <span
              className={`absolute inset-[-10px] rounded-full border ${
                isCurrent ? "border-[#9E00F6]" : "border-[#FF7F83]"
              } pointer-events-none animate-[ripple_1.4s_cubic-bezier(0,0.2,0.8,1)_infinite_0.35s]`}
            />
          </>
        )}

        {/* Dual Concentric Pulsing Cyan Rings for CURRENT planet ("YOU ARE HERE") */}
        {isCurrent && (
          <>
            <div className="absolute inset-[-24px] rounded-full border border-[#00FFE9]/30 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute inset-[-20px] rounded-full border border-[#00FFE9]/40 shadow-[0_0_20px_rgba(0,255,233,0.25)] pointer-events-none" />
            <div className="absolute inset-[-7px] rounded-full border-2 border-[#00FFE9] shadow-[0_0_25px_rgba(0,255,233,0.6)] pointer-events-none" />
          </>
        )}

        {/* Selected / Hover Highlight Ring tied to planet theme with smooth fade & scale */}
        {!isCurrent && (
          <div
            className={`absolute inset-[-8px] rounded-full border-2 ${theme.ringBorder} ${theme.glow} transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${
              isSelected || isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          />
        )}

        {/* Outer 3D Sphere Container */}
        <div
          style={{ width: size, height: size }}
          className={`rounded-full bg-[#070414] shadow-[inset_-12px_-12px_25px_rgba(0,0,0,0.85),_0_10px_25px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.45, 0.64, 1) z-10 ${
            !isUnlocked
              ? "filter grayscale opacity-35"
              : `transform group-hover:scale-110 group-hover:-translate-y-1 ${
                isCurrent
                  ? "scale-105"
                  : isColored
                  ? "opacity-100"
                  : "opacity-90"
                }`
          }`}
        >
          {renderPlanetGraphic()}
        </div>

        {/* Lock overlay for locked planets */}
        {!isUnlocked && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 rounded-full"
            style={{ width: size, height: size }}
          >
            <div className="flex flex-col items-center justify-center bg-[#05040d]/70 rounded-full w-full h-full">
              <Lock size={Math.round(size * 0.28)} className="text-white/50" />
            </div>
          </div>
        )}

        {/* ── Top-Left Badge Bubble (Number or Milestone Icon) ── */}
        <div
          className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black shadow-xl z-20 border transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105 ${
            isMilestone
              ? "bg-[#090518] text-[#00FFE9] border-[#00FFE9]/80 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              : theme.badgeBg || "bg-[#00FFE9] text-[#050508] border-[#00FFE9]"
          }`}
        >
          {isMilestone ? (
            <Target size={15} className="text-[#00FFE9]" />
          ) : (
            <span>{number}</span>
          )}
        </div>
      </div>

      {/* ── Planet Title & Sublabels Below ── */}
      <div className="flex flex-col items-center mt-3 text-center max-w-[210px] sm:max-w-[240px]">
        <span
          className={`text-xs md:text-sm font-bold font-mono tracking-wider leading-snug transition-all duration-500 ease-out ${
            isCurrent
              ? "text-[#00FFE9] drop-shadow-[0_0_8px_rgba(0,255,233,0.4)]"
              : isSelected || isHovered
              ? theme.textHover
              : "text-white/90 group-hover:text-white"
          }`}
        >
          {title}
        </span>

        {/* "YOU ARE HERE" label */}
        {isCurrent && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#00FFE9] tracking-widest uppercase bg-[#00FFE9]/10 px-2.5 py-1 rounded-full border border-[#00FFE9]/40 shadow-[0_0_12px_rgba(0,255,233,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#00FFE9] animate-pulse shrink-0" />
            <span>YOU ARE HERE</span>
          </div>
        )}
      </div>
    </div>
  );
}


