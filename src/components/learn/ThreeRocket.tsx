"use client";

import { useEffect, useRef } from "react";

export default function ThreeRocket() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, 48, 48);

      const floatY = Math.sin(time * 0.8) * 3;
      const tilt = Math.cos(time * 0.6) * 0.1;

      ctx.save();
      ctx.translate(24, 24 + floatY);
      ctx.rotate(-0.35 + tilt);

      // 3D Thruster Flame
      const flameHeight = 12 + Math.sin(time * 4) * 4;
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(0, 10 + flameHeight);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fillStyle = "#FFDD00";
      ctx.shadowColor = "#FF0055";
      ctx.shadowBlur = 10;
      ctx.fill();

      // Rocket Body Fins
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-4, 10);
      ctx.closePath();
      ctx.fillStyle = "#9E00F6";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, 8);
      ctx.lineTo(4, 0);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fillStyle = "#9E00F6";
      ctx.fill();

      // Rocket Main Capsule Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 12, 0, 0, Math.PI * 2);
      const gradient = ctx.createLinearGradient(-7, -12, 7, 12);
      gradient.addColorStop(0, "#00FFE9");
      gradient.addColorStop(1, "#0088AA");
      ctx.fillStyle = gradient;
      ctx.fill();

      // Nose Cone
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.quadraticCurveTo(0, -18, 0, -18);
      ctx.quadraticCurveTo(0, -18, 7, -4);
      ctx.closePath();
      ctx.fillStyle = "#E873C3";
      ctx.fill();

      // Porthole Window
      ctx.beginPath();
      ctx.arc(0, -2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#090518";
      ctx.fill();
      ctx.strokeStyle = "#00FFE9";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="pointer-events-none select-none"
    />
  );
}
