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
  depth: number;
}

const STAR_PALETTE = [
  "255, 255, 255",   // pure white
  "255, 255, 255",   // pure white
  "220, 235, 255",   // soft blue-white
  "217, 95, 209",    // cosmo pink/magenta
  "0, 255, 233",     // neon cyan
  "168, 85, 247",    // purple tint
];

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 20;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let stars: Star[] = [];

    const initStars = (w: number, h: number) => {
      const count = Math.min(100, Math.floor(Math.max(60, (w * h) / 9000)));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random() * 0.8 + 0.2;
        const rgb = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: (Math.random() * 1.4 + 0.5) * depth,
          speedY: (Math.random() * 0.35 + 0.1) * depth,
          driftAmp: Math.random() * 8 + 2,
          driftFreq: Math.random() * 0.005 + 0.002,
          driftOffset: Math.random() * Math.PI * 2,
          baseOpacity: Math.random() * 0.4 + 0.4,
          twinkleSpeed: Math.random() * 0.02 + 0.006,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: rgb,
          depth,
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

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Move star UPWARDS
        s.y -= s.speedY;

        // Wrap seamlessly around top boundary to bottom
        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }

        // Horizontal wave drift
        const drift = Math.sin(frame * s.driftFreq + s.driftOffset) * s.driftAmp;

        // Twinkle factor
        const twinkle = 0.6 + 0.4 * Math.sin(frame * s.twinkleSpeed + s.twinkleOffset);
        const currentOpacity = Math.min(1, s.baseOpacity * twinkle);

        // Position with mouse parallax
        const drawX = s.x + drift + mouseX * s.depth;
        const drawY = s.y + mouseY * s.depth;

        // Draw star core dot
        ctx.fillStyle = `rgba(${s.color}, ${currentOpacity.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-hidden [will-change:transform]"
      style={{ zIndex: 0, transform: "translate3d(0,0,0)" }}
    />
  );
}
