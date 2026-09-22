"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Swords,
  Trophy,
  Rocket,
  UserCircle,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";

/* ───────────────────── Tour Step Data ───────────────────── */

interface TourStep {
  id: string;
  selector: string; // DOM selector to highlight
  position: "top" | "bottom" | "left" | "right" | "center";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  particleColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "login",
    selector: "a[href='/onboarding']",
    position: "bottom",
    icon: <Rocket className="w-6 h-6" />,
    title: "Welcome to CosmoDex!",
    subtitle: "Start Your Cosmic Journey",
    description:
      "Click here to register or log in. Once you're in, you can start battling other coders!",
    gradient: "from-emerald-400 via-cyan-500 to-blue-600",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentColor: "#10B981",
    particleColor: "#34D399",
  },
  {
    id: "battle",
    selector: "a[href='/battle']",
    position: "bottom",
    icon: <Swords className="w-6 h-6" />,
    title: "Battle Arena",
    subtitle: "Compete against others",
    description: "Click here to enter the Battle Arena and test your coding skills against other developers in real-time!",
    gradient: "from-purple-400 via-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.4)",
    accentColor: "#EC4899",
    particleColor: "#F472B6",
  }
];

/* ────────────── Step Indicator Dots ────────────── */

function StepIndicators({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-colors duration-300"
          style={{
            width: i === current ? 16 : 6,
            height: 6,
            background:
              i === current
                ? TOUR_STEPS[current].accentColor
                : i < current
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)",
            boxShadow:
              i === current
                ? `0 0 8px ${TOUR_STEPS[current].glowColor}`
                : "none",
          }}
        />
      ))}
    </div>
  );
}

const TOUR_STORAGE_KEY = "cosmodex-tour-completed";

export default function WebsiteTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure the target element for the current step
  const measureTarget = useCallback(() => {
    if (!isVisible) return;
    const step = TOUR_STEPS[currentStep];
    
    // Slight delay to allow DOM to render/settle
    setTimeout(() => {
      let el = document.querySelector(step.selector);
      
      // If mobile navbar links are hidden, just fallback to center
      if (el && window.getComputedStyle(el).display === 'none') {
        el = null;
      }

      if (el && step.selector !== 'body') {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll into view gently if needed
        const isFullyVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        if (!isFullyVisible) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null); // center fallback
      }
    }, 100);
  }, [currentStep, isVisible]);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      measureTarget();
      window.addEventListener('resize', measureTarget);
      window.addEventListener('scroll', measureTarget);
      return () => {
        window.removeEventListener('resize', measureTarget);
        window.removeEventListener('scroll', measureTarget);
      };
    }
  }, [isVisible, measureTarget]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVisible, handleNext, handleSkip]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  const padding = 12; // padding around the spotlight

  if (targetRect && step.position !== "center") {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    if (step.position === "bottom" || (step.position === "left" && window.innerWidth < 1024)) {
       // Prefer bottom if on mobile, or explicitly requested
       if (spaceBelow > 300 || spaceBelow > spaceAbove) {
         tooltipStyle = {
           top: targetRect.bottom + padding + 16,
           left: Math.max(20, Math.min(targetRect.left + (targetRect.width/2) - 175, window.innerWidth - 370)),
         };
       } else {
         // Fallback to top
         tooltipStyle = {
           top: targetRect.top - padding - 16 - 220, // approx height
           left: Math.max(20, Math.min(targetRect.left + (targetRect.width/2) - 175, window.innerWidth - 370)),
         };
       }
    } else if (step.position === "left") {
      tooltipStyle = {
        top: Math.max(20, targetRect.top + (targetRect.height/2) - 110),
        left: targetRect.left - padding - 360,
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Full screen clickable backdrop for skip (invisible, just catches clicks) */}
            <div 
              className="absolute inset-0 pointer-events-none" 
            />

            {/* Spotlight Hole and Overlay */}
            {targetRect ? (
              <motion.div
                className="absolute pointer-events-none border-4"
                style={{
                  borderColor: step.accentColor,
                  borderRadius: 16,
                  // The first box-shadow creates the dark overlay covering the rest of the screen.
                  // The subsequent ones create the neon glow.
                }}
                initial={false}
                animate={{
                  left: targetRect.left - padding,
                  top: targetRect.top - padding,
                  width: targetRect.width + padding * 2,
                  height: targetRect.height + padding * 2,
                  boxShadow: [
                    `0 0 0 9999px rgba(5, 2, 15, 0.85), 0 0 20px ${step.glowColor.replace(/[\d.]+\)$/, "0.6)")}`,
                    `0 0 0 9999px rgba(5, 2, 15, 0.85), 0 0 45px ${step.glowColor.replace(/[\d.]+\)$/, "1)")}`,
                    `0 0 0 9999px rgba(5, 2, 15, 0.85), 0 0 20px ${step.glowColor.replace(/[\d.]+\)$/, "0.6)")}`
                  ]
                }}
                transition={{ 
                  left: { type: "spring", stiffness: 300, damping: 30 },
                  top: { type: "spring", stiffness: 300, damping: 30 },
                  width: { type: "spring", stiffness: 300, damping: 30 },
                  height: { type: "spring", stiffness: 300, damping: 30 },
                  boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            ) : (
              // Fallback overlay if no target is found
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ background: "rgba(5, 2, 15, 0.85)" }} 
              />
            )}

            {/* Tour Tooltip Card */}
            <motion.div
              className="absolute z-10 w-[350px] pointer-events-auto"
              style={tooltipStyle}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div
                className="relative overflow-hidden rounded-2xl border border-white/10"
                style={{
                  background: "rgba(15, 8, 35, 0.95)",
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 60px ${step.glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                {/* Top accent line */}
                <motion.div
                  className={`h-1 w-full bg-gradient-to-r ${step.gradient}`}
                  layoutId="accent-bar"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient}`}
                      style={{
                        boxShadow: `0 4px 15px ${step.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                      }}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="text-white">{step.icon}</div>
                    </motion.div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5 leading-tight font-display tracking-wide">
                        {step.title}
                      </h3>
                      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: step.accentColor }}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/70 mb-6">
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {currentStep + 1} / {TOUR_STEPS.length}
                      </span>
                      <StepIndicators total={TOUR_STEPS.length} current={currentStep} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSkip}
                        className="px-3 py-1.5 text-xs text-white/40 hover:text-white/80 font-medium transition-colors cursor-pointer"
                      >
                        {isLastStep ? "" : "Skip"}
                      </button>
                      <button
                        onClick={handleNext}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${step.gradient} hover:opacity-90 transition-all cursor-pointer shadow-lg`}
                        style={{
                          boxShadow: `0 4px 15px ${step.glowColor}`,
                        }}
                      >
                        {isLastStep ? "Finish" : "Next"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
