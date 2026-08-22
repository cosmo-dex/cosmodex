"use client";

import { useEffect, useRef, memo } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  maxOpacity: number;
  color: string;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftFreq: number;
  driftAmp: number;
  driftOffset: number;
}

const COLORS = [
  "#ff2d78",
  "#ff6ba8",
  "#9b30ff",
  "#c084fc",
  "#ffffff",
  "#ffffff",
];

function makeStars(count: number, width: number, height: number): Star[] {
  return Array.from({ length: count }, () => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.5,
      speed: Math.random() * 0.45 + 0.12,
      opacity: 0,
      maxOpacity: Math.random() * 0.55 + 0.2,
      color,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftFreq: Math.random() * 0.008 + 0.003,
      driftAmp: Math.random() * 16 + 4,
      driftOffset: Math.random() * Math.PI * 2,
    };
  });
}

interface RisingStarsProps {
  /** Number of stars. Default 40. */
  count?: number;
  /** Overall brightness multiplier 0–1. Default 1. */
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const RisingStars = memo(function RisingStars({
  count = 40,
  intensity = 1,
  className,
  style,
}: RisingStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      if (starsRef.current.length === 0) {
        starsRef.current = makeStars(count, width, height);
      }
    };

    resize();

    const ro = new ResizeObserver(() => {
      if (canvas.offsetWidth !== width || canvas.offsetHeight !== height) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }
    });
    ro.observe(canvas);

    const draw = () => {
      if (!isVisibleRef.current) {
        rafRef.current = 0;
        return;
      }

      frameRef.current += 1;
      ctx.clearRect(0, 0, width, height);

      for (const star of starsRef.current) {
        star.y -= star.speed;

        const drift =
          Math.sin(frameRef.current * star.driftFreq + star.driftOffset) *
          star.driftAmp;

        const progress = 1 - star.y / height;
        const fadeIn = Math.min(progress * 3, 1);
        const lifecycle =
          Math.min(fadeIn, 1) *
          (progress > 0.67 ? Math.max(1 - (progress - 0.67) * 3, 0) : 1);

        const twinkle =
          0.7 +
          0.3 *
            Math.sin(
              frameRef.current * star.twinkleSpeed + star.twinkleOffset
            );

        star.opacity = star.maxOpacity * lifecycle * twinkle * intensity;

        if (star.y < -10) {
          star.y = height + Math.random() * 20;
          star.x = Math.random() * width;
          star.opacity = 0;
        }

        if (star.opacity <= 0.01) continue;

        const px = star.x + drift;
        const r = star.size;

        ctx.globalAlpha = Math.min(star.opacity, 1);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(px, star.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      rafRef.current = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafRef.current) {
          rafRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    />
  );
});

export default RisingStars;
