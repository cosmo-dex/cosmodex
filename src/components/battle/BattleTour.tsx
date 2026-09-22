'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Swords, ListChecks, BarChart3, Zap, Sparkles, Terminal } from 'lucide-react';

const STORAGE_KEY = 'cosmodex_battle_tour_complete';

interface TourStep {
  id: string;
  targetId: string | null; // null = full-screen welcome
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: string; // extra hint text
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: null,
    title: 'Welcome to the Battle Arena!',
    description: 'Compete in real-time 1v1 battles against other players. Test your knowledge, earn ELO points, and climb the leaderboard.',
    icon: <Swords size={28} className="text-[#FFA249]" />,
    position: 'center',
    highlight: '⚔️ Your journey to the top starts here',
  },
  {
    id: 'mode-selection',
    targetId: 'battle-mode-mcq',
    title: 'MCQ Battle',
    description: 'Select MCQ Battle for rapid-fire quiz rounds. Pick the mode that suits your strengths!',
    icon: <ListChecks size={24} className="text-[#E873C3]" />,
    position: 'right',
    highlight: 'Test your knowledge in quick-fire rounds',
  },
  {
    id: 'mode-selection-code',
    targetId: 'battle-mode-code',
    title: 'Code Battle',
    description: 'Switch to Code Battle to test your algorithm and coding skills in intense 1v1 speed duels.',
    icon: <Terminal size={24} className="text-amber-400" />,
    position: 'left',
    highlight: 'Compete to solve algorithms faster',
  },
  {
    id: 'join-match',
    targetId: 'battle-join-btn',
    title: 'Match Section',
    description: 'Hit "Join Match" to enter matchmaking. You\'ll be paired with an opponent of similar skill level.',
    icon: <Zap size={24} className="text-amber-400" />,
    position: 'top',
    highlight: 'Matches typically start within 10-30 seconds',
  }
];

function getTooltipPosition(
  targetRect: DOMRect | null,
  position: TourStep['position'],
  tooltipWidth: number,
  tooltipHeight: number
): { top: number; left: number } {
  if (!targetRect) {
    return {
      top: window.innerHeight / 2 - tooltipHeight / 2,
      left: window.innerWidth / 2 - tooltipWidth / 2,
    };
  }

  const padding = 16;
  const arrowGap = 14;
  let top = 0;
  let left = 0;

  switch (position) {
    case 'top':
      top = targetRect.top - tooltipHeight - arrowGap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + arrowGap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - arrowGap;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + arrowGap;
      break;
    case 'center':
      top = window.innerHeight / 2 - tooltipHeight / 2;
      left = window.innerWidth / 2 - tooltipWidth / 2;
      break;
  }

  // Clamp within viewport
  top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, top));
  left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));

  return { top, left };
}

export default function BattleTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        fetch('/api/user/stats')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
          })
          .then(data => {
            const totalBattles = (data?.wins || 0) + (data?.losses || 0) + (data?.draws || 0);
            if (totalBattles === 0) {
              setTimeout(() => setIsVisible(true), 800);
            } else {
              localStorage.setItem(STORAGE_KEY, 'true');
            }
          })
          .catch(() => {
            setTimeout(() => setIsVisible(true), 800);
          });
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  }, []);

  // Position the tooltip relative to the target element
  const updatePosition = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    if (!step.targetId) {
      setTargetRect(null);
      const tw = Math.min(480, window.innerWidth - 32);
      const th = 320;
      setTooltipPos(getTooltipPosition(null, 'center', tw, th));
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll into view if needed
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!isInView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recalculate after scroll
        requestAnimationFrame(() => {
          const newRect = el.getBoundingClientRect();
          setTargetRect(newRect);
          const tw = tooltipRef.current?.offsetWidth || 380;
          const th = tooltipRef.current?.offsetHeight || 220;
          setTooltipPos(getTooltipPosition(newRect, step.position, tw, th));
        });
        return;
      }

      const tw = tooltipRef.current?.offsetWidth || 380;
      const th = tooltipRef.current?.offsetHeight || 220;
      setTooltipPos(getTooltipPosition(rect, step.position, tw, th));
    } else {
      setTargetRect(null);
      const tw = Math.min(480, window.innerWidth - 32);
      setTooltipPos(getTooltipPosition(null, 'center', tw, 280));
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, currentStep, updatePosition]);

  // Re-measure after tooltip renders
  useEffect(() => {
    if (!isVisible) return;
    const frame = requestAnimationFrame(() => {
      updatePosition();
    });
    return () => cancelAnimationFrame(frame);
  }, [isVisible, currentStep, updatePosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isWelcome = !step.targetId;

  // Spotlight cutout dimensions
  const spotlightPadding = 12;
  const spotlightRadius = 16;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: 'none' }}>
          {/* Dark backdrop with spotlight cutout via SVG mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              style={{ pointerEvents: 'none' }}
            >
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && !isWelcome && (
                    <rect
                      x={targetRect.left - spotlightPadding}
                      y={targetRect.top - spotlightPadding}
                      width={targetRect.width + spotlightPadding * 2}
                      height={targetRect.height + spotlightPadding * 2}
                      rx={spotlightRadius}
                      ry={spotlightRadius}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.75)"
                mask="url(#tour-spotlight-mask)"
                style={{ pointerEvents: 'none' }}
              />
            </svg>

            {/* Spotlight glow ring around target */}
            {targetRect && !isWelcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute pointer-events-none"
                style={{
                  top: targetRect.top - spotlightPadding - 2,
                  left: targetRect.left - spotlightPadding - 2,
                  width: targetRect.width + (spotlightPadding + 2) * 2,
                  height: targetRect.height + (spotlightPadding + 2) * 2,
                  borderRadius: spotlightRadius + 2,
                  border: '2px solid rgba(217, 95, 209, 0.6)',
                  boxShadow: '0 0 30px rgba(217, 95, 209, 0.3), inset 0 0 20px rgba(217, 95, 209, 0.1)',
                }}
              />
            )}
          </motion.div>

          {/* Tooltip card */}
          <motion.div
            ref={tooltipRef}
            key={step.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-[10001]"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: isWelcome ? Math.min(480, window.innerWidth - 32) : Math.min(380, window.innerWidth - 32),
              pointerEvents: 'auto',
            }}
          >
            <div className="relative bg-gradient-to-b from-[#1a0d35]/98 via-[#120828]/98 to-[#0a0418]/98 border border-purple-500/30 rounded-2xl p-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-2xl font-inter">
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D95FD1] to-transparent rounded-t-2xl" />

              {/* Close / Skip button */}
              <button
                onClick={completeTour}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/50 hover:text-white transition-all duration-200 cursor-pointer group"
                title="Skip tour"
              >
                <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>

              {/* Icon + Step indicator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  {step.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-purple-300/80 uppercase tracking-widest">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide leading-tight font-inter">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/75 leading-relaxed mb-4 font-inter">
                {step.description}
              </p>

              {/* Highlight tip */}
              {step.highlight && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
                  <span className="text-[11px] font-medium text-purple-300 font-inter">
                    {step.highlight}
                  </span>
                </div>
              )}

              {/* Step dots + Navigation */}
              <div className="flex items-center justify-between">
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'w-6 bg-gradient-to-r from-[#E873C3] to-[#D95FD1] shadow-[0_0_8px_rgba(217,95,209,0.6)]'
                          : i < currentStep
                            ? 'w-1.5 bg-purple-400/60'
                            : 'w-1.5 bg-white/15'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrev}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all duration-200 cursor-pointer font-inter"
                    >
                      Back
                    </button>
                  )}

                  {isFirstStep && !isLastStep && (
                    <button
                      onClick={completeTour}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white/50 hover:text-white/80 transition-all duration-200 cursor-pointer font-inter"
                    >
                      Skip Tour
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] transition-all duration-200 cursor-pointer font-inter"
                  >
                    {isLastStep ? "Let's Go!" : isFirstStep ? "Start Tour" : "Next"}
                    {!isLastStep && (
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
