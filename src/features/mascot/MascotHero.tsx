"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Assistant from "./Assistant";

import mascotBody from "./Mascot - Without Eyes.png";
import mascotPupil from "./Mascot - Pupil.png";

export default function MascotHero() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      text: string;
      isUser: boolean;
    }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Live Mouse Eye Tracking ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !leftEyeRef.current || !rightEyeRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = containerRect.left + containerRect.width / 2;
      const mascotCenterY = containerRect.top + containerRect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      const maxRadius = 7;
      const pupilX = Math.cos(angle) * maxRadius;
      const pupilY = Math.sin(angle) * maxRadius;

      leftEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      rightEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // ── Natural Blinking Animation ──
  const blinkAnimation = {
    scaleY: [1, 1, 0.1, 1, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      times: [0, 0.85, 0.9, 0.95, 1],
      ease: "easeInOut" as const,
    },
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const question = inputValue.trim();

    setMessages((prev) => [...prev, { text: question, isUser: true }]);
    setInputValue("");
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const reply = "👋 Hi! I'm Cosmo, your Python AI Assistant. Ask me anything about Python variables, loops, functions, or station exercises!";
      setMessages((prev) => [...prev, { text: reply, isUser: false }]);
    } catch (error) {
      console.error("Assistant Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Interactive Mascot Character Wrapper */}
      <motion.div
        ref={containerRef}
        animate={{
          y: [0, -14, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.8,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.06, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(true)}
        className="relative shrink-0 w-[180px] h-[230px] sm:w-[220px] sm:h-[280px] cursor-pointer group select-none self-center md:self-auto"
      >
        {/* Glowing Ambient Aura behind Mascot */}
        <div className="absolute inset-[-10px] bg-gradient-to-tr from-purple-600/30 to-cyan-400/40 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Mascot Body */}
        <Image
          src={mascotBody}
          alt="Cosmo Mascot"
          priority
          draggable={false}
          className="absolute z-10 w-full h-auto pointer-events-none drop-shadow-[0_15px_35px_rgba(0,255,233,0.35)] group-hover:drop-shadow-[0_20px_45px_rgba(0,255,233,0.6)] transition-all"
        />

        {/* Left Pupil (Mouse Tracking & Blinking) */}
        <div ref={leftEyeRef} className="absolute z-20 w-[24px] sm:w-[28px] top-[60px] sm:top-[74px] left-[60px] sm:left-[76px] pointer-events-none">
          <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
            <Image src={mascotPupil} alt="Left Eye" draggable={false} className="w-full h-auto" />
          </motion.div>
        </div>

        {/* Right Pupil (Mouse Tracking & Blinking) */}
        <div ref={rightEyeRef} className="absolute z-20 w-[24px] sm:w-[28px] top-[60px] sm:top-[74px] right-[52px] sm:right-[66px] pointer-events-none">
          <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
            <Image src={mascotPupil} alt="Right Eye" draggable={false} className="w-full h-auto" />
          </motion.div>
        </div>
      </motion.div>

      {/* Cosmo AI Assistant Chat Modal */}
      <Assistant
        chatOpen={chatOpen}
        fullScreen={fullScreen}
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        onClose={() => setChatOpen(false)}
        onSend={sendMessage}
        onInputChange={setInputValue}
        onToggleFullscreen={() => setFullScreen((prev) => !prev)}
      />
    </>
  );
}
