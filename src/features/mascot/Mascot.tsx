"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMascotStore } from "@/hooks/useMascotStore";

import Assistant from "./Assistant";

import mascotBody from "./Mascot - Without Eyes.png";
import mascotPupil from "./Mascot - Pupil.png";

export default function Mascot() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const { message } = useMascotStore();

  const [dragConstraints, setDragConstraints] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>({ left: -1000, right: 0, top: -1000, bottom: 0 });

  // Update drag constraints dynamically based on viewport dimensions
  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== "undefined") {
        const padding = 16;
        const width = containerRef.current?.offsetWidth || 130;
        const height = containerRef.current?.offsetHeight || 173;
        setDragConstraints({
          left: -(window.innerWidth - width - padding * 2),
          right: padding,
          top: -(window.innerHeight - height - padding * 2),
          bottom: padding,
        });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  /* ==========================================================
      Assistant State
  ========================================================== */

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // --- Eye Tracking Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsIdle(false);

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setIsIdle(true);
      }, 2000);

      if (!containerRef.current || !leftEyeRef.current || !rightEyeRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = containerRect.left + containerRect.width / 2;
      const mascotCenterY = containerRect.top + containerRect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      const maxRadius = 5;
      const pupilX = Math.cos(angle) * maxRadius;
      const pupilY = Math.sin(angle) * maxRadius;

      leftEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      rightEyeRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // --- Idle Snap Logic ---
  useEffect(() => {
    if (isIdle && leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.style.transition = "transform 0.3s ease-out";
      rightEyeRef.current.style.transition = "transform 0.3s ease-out";
      leftEyeRef.current.style.transform = `translate(0px, 0px)`;
      rightEyeRef.current.style.transform = `translate(0px, 0px)`;

      setTimeout(() => {
        if (leftEyeRef.current) leftEyeRef.current.style.transition = "none";
        if (rightEyeRef.current) rightEyeRef.current.style.transition = "none";
      }, 300);
    }
  }, [isIdle]);

  const blinkAnimation = {
    scaleY: [1, 1, 0.1, 1, 1],
    transition: { duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: "easeInOut" as const }
  };

  /* ==========================================================
    Assistant Chat Logic
  ========================================================== */

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const question = inputValue.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        text: question,
        isUser: true,
      },
    ]);

    setInputValue("");
    setIsTyping(true);

    try {
      // Temporary simulated response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const reply =
        "👋 Hi! I'm Cosmo. How can I help you with your cosmic coding journey today?";

      setMessages((prev) => [
        ...prev,
        {
          text: reply,
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error("Assistant Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          text: "Something went wrong. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (
    !pathname ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/battle') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/learning-admin') ||
    pathname.startsWith('/arena-admin') ||
    pathname.includes('admin')
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Mascot Button */}
      <motion.div
        ref={containerRef}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        animate={{
          opacity: chatOpen ? 0 : 1,
          scale: chatOpen ? 0.75 : 1,
          pointerEvents: chatOpen ? "none" : "auto",
        }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[110px] h-[146px] sm:w-[130px] sm:h-[173px] select-none touch-none cursor-grab active:cursor-grabbing"
      >
        {/* Dark Theme Chat Bubble */}
        <div
          className={`absolute -top-[52px] right-0 sm:-right-2 w-[190px] sm:w-[220px] px-3.5 py-2 rounded-2xl font-medium tracking-wide pointer-events-none transition-all duration-500 ease-out text-xs
            bg-[#160E2B]/95 text-cyan-400 border border-cyan-400/30 shadow-[0_4px_15px_rgba(0,255,255,0.15)]
            ${message ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"}`}
        >
          {message}
        </div>

        <motion.div
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          whileHover={{
            scale: 1.05,
            y: -3,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onTap={() => {
            setChatOpen(true);
          }}
        >
          <Image
            src={mascotBody}
            alt="Cosmo Mascot"
            priority
            draggable={false}
            className="w-full h-auto pointer-events-none drop-shadow-[0_8px_24px_rgba(141,55,214,0.35)]"
          />

          {/* Left Pupil */}
          <div ref={leftEyeRef} className="absolute z-11 w-[14px] sm:w-[17px] top-[38px] left-[38px] sm:top-[45px] sm:left-[45px]">
            <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
              <Image src={mascotPupil} alt="Left Eye" draggable={false} className="w-full h-auto pointer-events-none" />
            </motion.div>
          </div>

          {/* Right Pupil */}
          <div ref={rightEyeRef} className="absolute z-11 w-[14px] sm:w-[17px] top-[38px] right-[33px] sm:top-[45px] sm:right-[39px]">
            <motion.div animate={blinkAnimation} style={{ originY: 0.5 }}>
              <Image src={mascotPupil} alt="Right Eye" draggable={false} className="w-full h-auto pointer-events-none" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ==========================================================
          Assistant Modal
      ========================================================== */}
      <Assistant
        chatOpen={chatOpen}
        fullScreen={fullScreen}
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        onClose={() => setChatOpen(false)}
        onSend={sendMessage}
        onInputChange={setInputValue}
        onToggleFullscreen={() =>
          setFullScreen((prev) => !prev)
        }
      />
    </>
  );
}