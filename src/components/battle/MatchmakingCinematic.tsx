/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X } from 'lucide-react';
import RisingStars from '@/component/RisingStar';
import { getAvatarUrl } from '@/lib/avatar';

interface MatchmakingCinematicProps {
  username: string;
  userAvatar?: string | null;
  userElo?: number;
  phase: 'SEARCHING' | 'MATCH_FOUND';
  opponent: { username: string; elo: number; avatar?: string } | null;
  isReady?: boolean;
  opponentReady?: boolean;
  onEnterBattle: () => void;
  onCancel: () => void;
}

export default function MatchmakingCinematic({
  username,
  userAvatar,
  userElo = 1000,
  phase,
  opponent,
  isReady = false,
  opponentReady = false,
  onEnterBattle,
  onCancel,
}: MatchmakingCinematicProps) {
  const [fusionPulse, setFusionPulse] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  // Trigger fusion pulse when phase changes to MATCH_FOUND
  useEffect(() => {
    let isMounted = true;
    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;

    if (phase === 'MATCH_FOUND') {
      timer1 = setTimeout(() => {
        if (isMounted) setFusionPulse(true);
        timer2 = setTimeout(() => {
          if (isMounted) setFusionPulse(false);
        }, 800);
      }, 1100);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [phase]);

  // HTML Canvas Logic for Sparse Stars and Streaks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const streaks: { x: number; y: number; length: number; speed: number; alpha: number }[] = [];
    const staticStars: { x: number; y: number; size: number; alpha: number }[] = [];
    const fusionParticles: { x: number; y: number; vx: number; vy: number; life: number; size: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Vertical star streaks
    const numStreaks = Math.floor(Math.random() * 11) + 30;
    for (let i = 0; i < numStreaks; i++) {
      streaks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 0.8 + 0.2,
        alpha: Math.random() * 0.1 + 0.15,
      });
    }

    // Static background stars
    for (let i = 0; i < 80; i++) {
      staticStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.2 + 0.05,
      });
    }

    let pulseTriggered = false;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint background stars
      ctx.fillStyle = '#ffffff';
      staticStars.forEach((star) => {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw streaks
      ctx.lineCap = 'butt';
      ctx.lineWidth = 1;

      streaks.forEach((streak) => {
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x, streak.y + streak.length);
        const grad = ctx.createLinearGradient(streak.x, streak.y, streak.x, streak.y + streak.length);
        grad.addColorStop(0, `rgba(217, 95, 209, 0)`);
        grad.addColorStop(1, `rgba(217, 95, 209, ${streak.alpha})`);
        ctx.strokeStyle = grad;
        ctx.stroke();

        streak.y += streak.speed;
        if (streak.y > canvas.height) {
          streak.y = -streak.length;
          streak.x = Math.random() * canvas.width;
        }
      });

      // Spawn fusion particles when pulse triggers
      if (fusionPulse && !pulseTriggered) {
        pulseTriggered = true;
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 3 + 1;
          fusionParticles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1.0,
            size: Math.random() * 2 + 1,
          });
        }
      }

      if (!fusionPulse && pulseTriggered) {
        pulseTriggered = false;
      }

      // Draw fusion particles
      fusionParticles.forEach((p) => {
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${p.life})`;
          ctx.fill();
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.life -= 0.03;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [fusionPulse]);

  const easeInOutCubic: [number, number, number, number] = [0.65, 0, 0.35, 1];

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 9999, background: 'radial-gradient(circle at 50% 100%, #1a0b2e 0%, #080312 100%)' }}>
      {/* Background exact match copy */}
      <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none z-0">
        <RisingStars />

        {/* Nebula dust / subtle colored clouds */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
              rotate: [-45, -40, -45]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[30%] w-[40rem] h-[30rem] bg-indigo-900/20 rounded-[100%] blur-[100px] mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] right-[20%] w-[35rem] h-[25rem] bg-fuchsia-900/10 rounded-[100%] blur-[120px] mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.9, 0.7, 0.9],
              x: [0, -15, 0],
              y: [0, 15, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-pink-900/10 rounded-[100%] blur-[100px] mix-blend-screen"
          />
        </div>

        {/* Small stars layers */}
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10%]" style={{
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #ffffff, rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.4
          }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10%]" style={{
            backgroundImage: 'radial-gradient(1.5px 1.5px at 10px 10px, #e0b0ff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 150px, #fuchsia, rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
            opacity: 0.3
          }}
        />

        {/* Twinkling Stars */}
        <motion.div
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(2px 2px at 80px 120px, rgba(255,255,255,0.9), rgba(0,0,0,0)), radial-gradient(2px 2px at 250px 50px, rgba(158,0,246,0.8), rgba(0,0,0,0)), radial-gradient(2px 2px at 180px 300px, rgba(0,255,233,0.9), rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '350px 350px'
          }}
        />
        <motion.div
          animate={{ opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(2px 2px at 120px 220px, rgba(255,220,100,0.9), rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 300px 180px, rgba(255,255,255,1), rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 350px, rgba(255,100,200,0.8), rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '450px 450px'
          }}
        />

        {/* Subtle Shooting Stars */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ width: "150px", rotate: -35, top: "10%", right: "-10%" }}
          animate={{
            x: [0, -1200],
            y: [0, 800],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 6,
            ease: "linear"
          }}
        />
      </div>

      <canvas ref={canvasRef} className="canvas-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />
      <div className="ambient-bloom" />

      {/* Cancel Matchmaking Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
          title="Cancel Matchmaking"
        >
          <X size={20} />
        </button>
      )}

      {/* Tiny Accent Rockets */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', pointerEvents: 'none', zIndex: 11 }}>

        {/* Left Rocket (Purple) */}
        <div style={{ position: 'absolute', left: '32vw', top: 0, transform: 'translateY(-50%)' }}>
          <motion.div
            initial={{ x: 0, y: 0, rotate: 90, opacity: 0 }}
            animate={
              phase === 'SEARCHING'
                ? { x: 0, y: [-4, 4, -4], rotate: [88, 92, 88], opacity: 1 }
                : { x: '18vw', y: 0, rotate: 90, opacity: 0 }
            }
            transition={{
              opacity: phase === 'SEARCHING' ? { duration: 1 } : { duration: 0.1, delay: 1.0 },
              x: phase === 'SEARCHING' ? { duration: 0 } : { duration: 0.8, ease: easeInOutCubic, delay: 0.3 },
              y: phase === 'SEARCHING' ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3, ease: "easeOut" },
              rotate: phase === 'SEARCHING' ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3, ease: "easeOut" }
            }}
            style={{ position: 'relative' }}
          >
            <motion.div
              animate={{ filter: phase === 'SEARCHING' ? ['drop-shadow(0 0 5px #A855F7)', 'drop-shadow(0 0 10px #A855F7)', 'drop-shadow(0 0 5px #A855F7)'] : 'drop-shadow(0 0 15px #A855F7)' }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <Rocket size={28} color="#A855F7" fill="#A855F7" />
            </motion.div>
            {/* Engine Sparks */}
            <motion.div
              animate={phase === 'SEARCHING' ? { opacity: [0.5, 0.9, 0.5], scaleY: [1, 1.2, 1] } : { opacity: 1, scaleY: 2 }}
              transition={{ repeat: phase === 'SEARCHING' ? Infinity : 0, duration: 2.8 }}
              style={{ position: 'absolute', top: '28px', left: '12px', width: '4px', height: '24px', background: 'linear-gradient(to bottom, #A855F7, transparent)', borderRadius: '4px', transformOrigin: 'top' }}
            />
          </motion.div>
        </div>

        {/* Right Rocket (Pink) */}
        <div style={{ position: 'absolute', right: '32vw', top: 0, transform: 'translateY(-50%)' }}>
          <motion.div
            initial={{ x: 0, y: 0, rotate: -90, opacity: 0 }}
            animate={
              phase === 'SEARCHING'
                ? { x: 0, y: [4, -4, 4], rotate: [-88, -92, -88], opacity: 1 }
                : { x: '-18vw', y: 0, rotate: -90, opacity: 0 }
            }
            transition={{
              opacity: phase === 'SEARCHING' ? { duration: 1 } : { duration: 0.1, delay: 1.0 },
              x: phase === 'SEARCHING' ? { duration: 0 } : { duration: 0.8, ease: easeInOutCubic, delay: 0.3 },
              y: phase === 'SEARCHING' ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3, ease: "easeOut" },
              rotate: phase === 'SEARCHING' ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3, ease: "easeOut" }
            }}
            style={{ position: 'relative' }}
          >
            <motion.div
              animate={{ filter: phase === 'SEARCHING' ? ['drop-shadow(0 0 5px #EC4899)', 'drop-shadow(0 0 10px #EC4899)', 'drop-shadow(0 0 5px #EC4899)'] : 'drop-shadow(0 0 15px #EC4899)' }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <Rocket size={28} color="#EC4899" fill="#EC4899" />
            </motion.div>
            {/* Engine Sparks */}
            <motion.div
              animate={phase === 'SEARCHING' ? { opacity: [0.5, 0.9, 0.5], scaleY: [1, 1.2, 1] } : { opacity: 1, scaleY: 2 }}
              transition={{ repeat: phase === 'SEARCHING' ? Infinity : 0, duration: 2.8 }}
              style={{ position: 'absolute', top: '28px', left: '12px', width: '4px', height: '24px', background: 'linear-gradient(to bottom, #EC4899, transparent)', borderRadius: '4px', transformOrigin: 'top' }}
            />
          </motion.div>
        </div>

      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

        {/* Top Text Area */}
        <div style={{ position: 'absolute', top: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {phase === 'SEARCHING' && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center' }}
              >
                <h1 className="glow-text" style={{ fontSize: '3rem', letterSpacing: '4px', color: 'white' }}>
                  SEARCHING FOR AN OPPONENT
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>...</motion.span>
                </h1>
              </motion.div>
            )}

            {phase === 'MATCH_FOUND' && (
              <motion.div
                key="found"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.8, type: 'spring', damping: 15, stiffness: 80 }}
                style={{ textAlign: 'center' }}
              >
                <h1 className="glow-text" style={{ fontSize: '4.5rem', letterSpacing: '6px' }}>
                  MATCH FOUND
                </h1>
                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ color: 'var(--text-secondary)', marginTop: '15px', fontSize: '1.2rem', letterSpacing: '8px', textTransform: 'uppercase', fontFamily: 'Lato, sans-serif' }}
                >
                  Preparing Battle Arena...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Central VS Portal Area */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {phase === 'MATCH_FOUND' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 15, stiffness: 80 }}
                style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <AnimatePresence>
                  {fusionPulse && (
                    <>
                      {/* Inner Pulse */}
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                          position: 'absolute', width: '80px', height: '80px', borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.9) 0%, rgba(168, 85, 247, 0.5) 70%, transparent 100%)',
                          boxShadow: '0 0 40px rgba(236, 72, 153, 0.8)',
                          zIndex: 20
                        }}
                      />
                      {/* Expanding Ring */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0.8, borderWidth: '8px' }}
                        animate={{ scale: 2, opacity: 0, borderWidth: '1px' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                          position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
                          border: 'solid rgba(217, 95, 209, 0.6)',
                          zIndex: 19
                        }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Portal Rings */}
                <motion.div
                  className="vs-portal-ring vs-portal-ring-outer"
                  animate={fusionPulse ? { boxShadow: '0 0 60px rgba(168, 85, 247, 0.8)' } : { boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="vs-portal-ring vs-portal-ring-inner"
                  animate={fusionPulse ? { boxShadow: 'inset 0 0 40px rgba(236, 72, 153, 0.8)' } : { boxShadow: 'inset 0 0 20px rgba(236, 72, 153, 0.2)' }}
                  transition={{ duration: 0.4 }}
                />
                <div className="portal-pulse" />

                {/* VS Text */}
                <h2 style={{ fontFamily: 'Hitchcut, sans-serif', fontSize: '6rem', color: 'white', textShadow: '0 0 40px var(--primary-pink)', zIndex: 10 }}>VS</h2>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === 'SEARCHING' && (
              <motion.div
                key="searching-portal"
                exit={{ opacity: 0, scale: 0.2, filter: 'blur(20px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {/* Rotating Dashed Border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '200px', height: '200px', borderRadius: '50%',
                    border: '1px dashed rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)'
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  style={{
                    fontSize: '5rem',
                    filter: 'drop-shadow(0 0 25px rgba(217,95,209,0.8))',
                    zIndex: 2
                  }}
                >
                  ⚔️
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Circular Player Frames */}
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 15vw', pointerEvents: 'none' }}>

          {/* Player 1 (Me) */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={phase === 'MATCH_FOUND' ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ delay: 0.8, type: 'spring', damping: 15, stiffness: 100 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px' }}
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#9E00F6] via-[#D95FD1] to-[#00FFE9] p-[3px] shadow-[0_0_30px_rgba(158,0,246,0.6)] overflow-hidden relative flex items-center justify-center pointer-events-auto"
            >
              <img
                src={getAvatarUrl(userAvatar)}
                alt={username}
                className="w-full h-full rounded-full object-cover border border-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/avatars/nebula.webp';
                }}
              />
              {isReady && (
                <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px] rounded-full border-2 border-emerald-400 flex items-center justify-center">
                  <span className="bg-emerald-500 text-black font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.9)]">READY</span>
                </div>
              )}
            </motion.div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>{username}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginTop: '4px', letterSpacing: '1px' }}>
                ELO <span style={{ color: '#D95FD1', fontWeight: 'bold' }}>{userElo}</span>
              </div>
            </div>
          </motion.div>

          {/* Player 2 (Opponent) */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={phase === 'MATCH_FOUND' ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ delay: 0.8, type: 'spring', damping: 15, stiffness: 100 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px' }}
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#FFA249] via-[#E873C3] to-[#8D37D6] p-[3px] shadow-[0_0_30px_rgba(232,115,195,0.6)] overflow-hidden relative flex items-center justify-center pointer-events-auto"
            >
              <img
                src={getAvatarUrl(opponent?.avatar)}
                alt={opponent?.username || 'Opponent'}
                className="w-full h-full rounded-full object-cover border border-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/avatars/nebula.webp';
                }}
              />
              {opponentReady && (
                <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px] rounded-full border-2 border-emerald-400 flex items-center justify-center">
                  <span className="bg-emerald-500 text-black font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.9)]">READY</span>
                </div>
              )}
            </motion.div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>{opponent?.username || 'Opponent'}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginTop: '4px', letterSpacing: '1px' }}>
                ELO <span style={{ color: '#00FFE9', fontWeight: 'bold' }}>{opponent?.elo || 1000}</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Enter Battle Button */}
        <AnimatePresence>
          {phase === 'MATCH_FOUND' && (
            <motion.button
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', damping: 15, stiffness: 100 }}
              disabled={isReady}
              className={`px-8 py-3.5 rounded-2xl font-bold tracking-widest text-sm uppercase transition-all duration-300 shadow-2xl border ${isReady
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.4)] cursor-wait'
                  : 'cosmo-btn-primary text-white border-white/20 hover:scale-105 cursor-pointer shadow-[0_0_25px_rgba(217,95,209,0.5)]'
                }`}
              style={{ position: 'absolute', bottom: '18%', pointerEvents: 'auto' }}
              onClick={onEnterBattle}
            >
              {isReady ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  READY — WAITING FOR OPPONENT...
                </span>
              ) : (
                'ENTER BATTLE'
              )}
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>,
    document.body
  );
}
