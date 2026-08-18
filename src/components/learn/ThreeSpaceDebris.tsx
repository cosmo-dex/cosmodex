"use client";

import { useEffect, useRef } from "react";

interface Asteroid3D {
  x: number;
  y: number;
  z: number;
  size: number;
  rotX: number;
  rotY: number;
  rotSpeedX: number;
  rotSpeedY: number;
  speedY: number;
  color: string;
}

export default function ThreeSpaceDebris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 1100);

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", resize);

    // Initialize 20 floating 3D low-poly asteroids
    const asteroids: Asteroid3D[] = Array.from({ length: 20 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: Math.random() * height,
      z: Math.random() * 300 + 100, // Depth (100px to 400px)
      size: Math.random() * 14 + 6,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotSpeedX: (Math.random() - 0.5) * 0.03,
      rotSpeedY: (Math.random() - 0.5) * 0.03,
      speedY: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.5 ? "#475569" : "#334155",
    }));

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      asteroids.forEach((ast) => {
        ast.y -= ast.speedY;
        ast.rotX += ast.rotSpeedX;
        ast.rotY += ast.rotSpeedY;

        if (ast.y < -30) {
          ast.y = height + 30;
          ast.x = (Math.random() - 0.5) * width;
        }

        // Perspective 3D projection
        const fov = 400;
        const scale = fov / (fov + ast.z);
        const projX = width / 2 + ast.x * scale;
        const projY = ast.y;
        const projSize = ast.size * scale;

        // Draw 3D low-poly rock polygon
        ctx.save();
        ctx.translate(projX, projY);
        ctx.rotate(ast.rotX);

        ctx.beginPath();
        const numPoints = 6;
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const dist = projSize * (0.8 + 0.4 * Math.sin(angle * 3 + ast.rotY));
          const px = Math.cos(angle) * dist;
          const py = Math.sin(angle) * dist;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = ast.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
