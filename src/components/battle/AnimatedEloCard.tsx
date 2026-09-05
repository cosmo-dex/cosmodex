'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EloUpdateData {
  oldElo: number;
  newElo: number;
  delta: number;
}

interface Props {
  eloUpdate?: EloUpdateData | null;
  won: boolean;
  draw?: boolean;
}

export default function AnimatedEloCard({ eloUpdate, won, draw }: Props) {
  const fallbackOld = 1000;
  const fallbackDelta = draw ? 0 : won ? 16 : -16;
  const fallbackNew = fallbackOld + fallbackDelta;

  const oldElo = eloUpdate?.oldElo ?? fallbackOld;
  const newElo = eloUpdate?.newElo ?? fallbackNew;
  const delta = eloUpdate?.delta ?? fallbackDelta;

  const [displayedElo, setDisplayedElo] = useState<number>(oldElo);

  useEffect(() => {
    let frameId: number;
    const start = oldElo;
    const target = newElo;
    const duration = 1400;
    const startTime = performance.now();

    const updateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      setDisplayedElo(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      }
    };

    frameId = requestAnimationFrame(updateCounter);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [oldElo, newElo]);

  const isPositive = delta > 0;
  const isZero = delta === 0;

  const getTier = (elo: number) => {
    if (elo >= 2000) return { name: 'Cosmic Grandmaster', min: 2000, next: 2500, color: 'text-amber-300' };
    if (elo >= 1600) return { name: 'Master', min: 1600, next: 2000, color: 'text-purple-400' };
    if (elo >= 1300) return { name: 'Diamond', min: 1300, next: 1600, color: 'text-cyan-400' };
    if (elo >= 1100) return { name: 'Gold', min: 1100, next: 1300, color: 'text-yellow-400' };
    return { name: 'Explorer', min: 800, next: 1100, color: 'text-emerald-400' };
  };

  const tier = getTier(displayedElo);
  const tierProgress = Math.min(
    100,
    Math.max(0, ((displayedElo - tier.min) / (tier.next - tier.min)) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 bg-white/[0.05] border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner text-center relative overflow-hidden"
    >
      <div
        className={cn(
          'absolute -inset-1 blur-xl opacity-20 pointer-events-none transition-all duration-700',
          isZero ? 'bg-amber-500' : isPositive ? 'bg-emerald-500' : 'bg-rose-600'
        )}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
            {displayedElo}
          </span>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg',
              isZero
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-amber-500/20'
                : isPositive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/20'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-rose-500/20'
            )}
          >
            {isZero ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isPositive ? `+${delta}` : `${delta}`}</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase tracking-widest font-bold mb-2">
          <span>ELO Rating</span>
          <span>•</span>
          <span className={tier.color}>{tier.name}</span>
        </div>

        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tierProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              isPositive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-rose-500 to-amber-500'
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
