"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftAmp: number;
  driftFreq: number;
  driftOffset: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

const STAR_PALETTE = [
  "255, 255, 255",
  "220, 235, 255",
  "217, 95, 209",
  "0, 255, 233",
  "168, 85, 247",
];

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const initStars = (w: number, h: number) => {
      const count = prefersReducedMotion
        ? 16
        : Math.min(28, Math.max(14, Math.floor((w * h) / 26000)));

      stars = Array.from({ length: count }, () => {
        const rgb = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.6 + 0.7,
          speedY: Math.random() * 0.45 + 0.12,
          driftAmp: Math.random() * 8 + 1.5,
          driftFreq: Math.random() * 0.01 + 0.003,
          driftOffset: Math.random() * Math.PI * 2,
          baseOpacity: Math.random() * 0.45 + 0.35,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: rgb,
        };
      });
    };

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      initStars(width, height);
    };

    resize();
    const handleResize = () => resize();
    window.addEventListener("resize", handleResize, { passive: true });

    if (prefersReducedMotion) {
      return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", handleResize);
      };
    }

    let frame = 0;
    const render = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        s.y -= s.speedY;

        if (s.y < -16) {
          s.y = height + 16;
          s.x = Math.random() * width;
        }

        const drift = Math.sin(frame * s.driftFreq + s.driftOffset) * s.driftAmp;
        const twinkle = 0.72 + 0.28 * Math.sin(frame * s.twinkleSpeed + s.twinkleOffset);
        const opacity = Math.min(1, s.baseOpacity * twinkle);

        ctx.beginPath();
        ctx.arc(s.x + drift, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${opacity.toFixed(3)})`;
        ctx.fill();
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}


