"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMascotStore } from "@/hooks/useMascotStore";
import { useAuth } from "@/context/AuthContext";

import Assistant from "./Assistant";
import MascotGreetingPopup from "./MascotGreetingPopup";

import mascotBody from "./Mascot - Without Eyes.png";
import mascotPupil from "./Mascot - Pupil.png";

export default function Mascot() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { message, setMessage } = useMascotStore();
  const [isGreetingDismissed, setIsGreetingDismissed] = useState(false);

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

    // 1. Add user message AND empty bot message placeholder
    setMessages((prev) => [
      ...prev,
      { text: question, isUser: true },
      { text: "", isUser: false },
    ]);

    setInputValue("");
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.slice(6).trim();
          if (!dataStr) continue;
          if (dataStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataStr);

            // Log which model/provider responded
            if (parsed.provider || parsed.model) {
              console.log(
                `%c🤖 [Cosmo AI] Responding Provider: %c${parsed.provider || "Unknown"} %c| Model: %c${parsed.model || "Default"}`,
                "color: #c084fc; font-weight: bold;",
                "color: #38bdf8; font-weight: bold;",
                "color: #94a3b8;",
                "color: #4ade80; font-weight: bold;"
              );
            }

            if (parsed.token) {
              assistantText += parsed.token;
              setIsTyping(false);

              setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0 && !updated[updated.length - 1].isUser) {
                  updated[updated.length - 1] = {
                    text: assistantText,
                    isUser: false,
                  };
                }
                return updated;
              });
            }
          } catch {
            // Incomplete JSON chunk, will parse on next tick
          }
        }
      }

      if (!assistantText) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && !updated[updated.length - 1].isUser) {
            updated[updated.length - 1] = {
              text: "🌌 Cosmo was unable to transmit a response. Please try asking again.",
              isUser: false,
            };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Assistant Error:", error);

      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && !updated[updated.length - 1].isUser) {
          updated[updated.length - 1] = {
            text: "⚠️ Cosmo is currently out of orbit (Backend unreachable). Please make sure the backend is running.",
            isUser: false,
          };
        }
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (
    !isAuthenticated ||
    !user ||
    !pathname ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/battle')
  ) {
    return null;
  }

  return (
    <>
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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[110px] h-[146px] sm:w-[130px] sm:h-[173px] select-none touch-none cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence>
          {!chatOpen && (Boolean(message) || !isGreetingDismissed) && (
            <MascotGreetingPopup
              name={user.username || ""}
              customMessage={message}
              onOpenChat={() => setChatOpen(true)}
              onDismiss={() => {
                if (message) setMessage(null);
                setIsGreetingDismissed(true);
              }}
            />
          )}
        </AnimatePresence>

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