"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Bot,
  Rocket,
  Trophy,
  Compass,
  BookOpen,
  Loader2,
} from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

interface AssistantProps {
  chatOpen: boolean;

  fullScreen: boolean;

  messages: Message[];

  inputValue: string;

  isTyping: boolean;

  onClose: () => void;

  onSend: () => void;

  onInputChange: (value: string) => void;

  onToggleFullscreen: () => void;
}

export default function Assistant({

  chatOpen,

  fullScreen,

  messages,

  inputValue,

  isTyping,

  onClose,

  onSend,

  onInputChange,

  onToggleFullscreen,

}: AssistantProps) {

  /* ======================================================
      Refs
  ====================================================== */

  const scrollRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  /* ======================================================
      Auto Scroll
  ====================================================== */

  useEffect(() => {

    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({

      top: scrollRef.current.scrollHeight,

      behavior: "smooth",

    });

  }, [messages, isTyping]);

  /* ======================================================
      Click Outside to Close Chatbot
  ====================================================== */
  useEffect(() => {
    if (!chatOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Delay listener to avoid triggering on the click that opened the chatbox
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [chatOpen, onClose]);

  /* ======================================================
      Lock Background Scroll While Chatbot is Open
  ====================================================== */
  useEffect(() => {
    if (!chatOpen) return;

    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (lenis) {
      lenis.stop();
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (lenis) {
        lenis.start();
      }
      document.body.style.overflow = originalOverflow;
    };
  }, [chatOpen]);

  /* ======================================================
      Suggestions
  ====================================================== */

  const suggestions = useMemo(
    () => [

      {
        icon: Rocket,
        title: "Explore Courses",
        prompt: "Show me beginner friendly courses",
      },

      {
        icon: Trophy,
        title: "Leaderboard",
        prompt: "Show leaderboard details",
      },

      {
        icon: Compass,
        title: "Learning Roadmap",
        prompt: "Create my roadmap",
      },

      {
        icon: BookOpen,
        title: "Documentation",
        prompt: "Open documentation",
      },

    ],

    []

  );

  /* ======================================================
      Closed
  ====================================================== */

  if (!chatOpen) return null;
    return (

    <AnimatePresence>

      <motion.div

        initial={{
          opacity: 0,
        }}

        animate={{
          opacity: 1,
        }}

        exit={{
          opacity: 0,
        }}

        className="fixed inset-0 z-[10000] pointer-events-none"

      >

        {/* =====================================================
            Backdrop
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`
            pointer-events-auto
            absolute
            inset-0
            cursor-pointer
            ${fullScreen ? "bg-black/50 backdrop-blur-md" : "bg-transparent"}
          `}
        />

        {/* =====================================================
            Main Window
        ====================================================== */}
        <motion.div
          ref={windowRef}
          data-lenis-prevent
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          className={`
            pointer-events-auto
            fixed
            overflow-hidden
            border
            border-white/10
            bg-[#13111C]/95
            backdrop-blur-3xl
            shadow-[0_0_80px_rgba(141,55,214,.25)]
            flex
            flex-col
            ${fullScreen
              ? `
                inset-3
                sm:inset-4
                lg:inset-8
                rounded-[24px] sm:rounded-[28px]
              `
              : `
                bottom-3
                inset-x-3
                sm:inset-x-auto
                sm:bottom-6
                sm:right-6
                lg:bottom-8
                lg:right-8
                sm:w-[440px]
                max-w-[440px]
                h-[min(680px,calc(100dvh-70px))]
                sm:h-[min(720px,calc(100vh-120px))]
                rounded-[24px] sm:rounded-[28px]
              `
            }
          `}
        >
          {/* =====================================================
              Ambient Glow
          ====================================================== */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[110px]" />
            <div className="absolute -bottom-40 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
          </div>

          {/* =====================================================
              Header
          ====================================================== */}
          <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-white/8 px-4 sm:px-6 py-3.5 sm:py-4">
            {/* Left */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-700 shadow-[0_0_30px_rgba(217,95,209,.35)]">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#13111C]" />
              </div>

              <div>
                <h3 className="font-display text-lg sm:text-xl lg:text-2xl tracking-wide text-white">
                  COSMO AI
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] sm:text-[12px] text-fuchsia-300">
                  <Sparkles className="h-3 w-3" />
                  Online • Ready to help
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onToggleFullscreen}
                className="cosmo-btn-secondary !h-9 !w-9 sm:!h-10 sm:!w-10 !rounded-xl !p-0"
              >
                {fullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={onClose}
                className="cosmo-btn-secondary !h-9 !w-9 sm:!h-10 sm:!w-10 !rounded-xl !p-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* =====================================================
              Body
          ====================================================== */}
          <div className="relative z-20 flex flex-1 min-h-0 flex-col">
            {/* Messages */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-4"
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col py-2 pb-8"
                >
                  <div className="mb-4 sm:mb-6 text-center">
                    <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-700 shadow-[0_0_35px_rgba(217,95,209,.35)]">
                      <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl text-white">
                      Welcome Explorer
                    </h2>

                    <p className="mt-1.5 font-mono text-xs sm:text-sm text-white/60">
                      Ask me anything about CosmoDeX, coding,
                      challenges or your learning journey.
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:gap-3">
                    {suggestions.map((item) => {
                      const Icon = item.icon;

                      return (
                        <motion.button
                          key={item.title}
                          whileHover={{
                            scale: 1.02,
                            y: -2,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                          onClick={() =>
                            onInputChange(item.prompt)
                          }
                          className="
                            group
                            flex
                            items-center
                            gap-3.5
                            p-3 sm:p-3.5
                            text-left
                            rounded-2xl
                            bg-white/[0.05]
                            hover:bg-white/[0.09]
                            border
                            border-white/10
                            hover:border-fuchsia-500/30
                            transition-colors
                          "
                        >
                          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25 transition-colors">
                            <Icon className="h-5 w-5 text-fuchsia-300" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-mono text-xs sm:text-sm font-semibold text-white truncate">
                              {item.title}
                            </p>

                            <p className="mt-0.5 font-mono text-[11px] sm:text-xs text-white/50 truncate">
                              {item.prompt}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    if (!message.text && !message.isUser) return null;
                    return (
                      <motion.div
                        key={index}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className={`flex ${
                          message.isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:py-3 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            message.isUser
                              ? "bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white shadow-[0_0_20px_rgba(217,95,209,0.25)]"
                            : "bg-white/[0.07] border border-white/10 text-white backdrop-blur-md"
                          }`}
                        >
                          {message.text}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 py-1"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />

                      <span className="font-mono text-xs text-white/60">
                        Cosmo is thinking...
                      </span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* =====================================================
                Input Area
            ====================================================== */}
            <div className="shrink-0 border-t border-white/10 bg-[#13111C]/60 p-3.5 sm:p-4 backdrop-blur-md">
              <div className="flex items-end gap-2.5 sm:gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Cosmo anything..."
                  className="
                    cosmo-input
                    !min-h-[46px]
                    sm:!min-h-[48px]
                    max-h-32
                    resize-none
                    !py-2.5
                    !px-3.5
                    font-mono
                    text-xs sm:text-sm
                  "
                />

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={onSend}
                  disabled={!inputValue.trim()}
                  className="
                    cosmo-btn-primary
                    !h-[46px]
                    !w-[46px]
                    sm:!h-[48px]
                    sm:!w-[48px]
                    shrink-0
                    !rounded-xl
                    !p-0
                    disabled:opacity-40
                  "
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 font-mono">
                <p>
                  <span className="hidden sm:inline">Press <span className="text-fuchsia-300">Enter</span> to send • </span>
                  <span>Shift + Enter for new line</span>
                </p>

                <span>Cosmo AI Beta</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
  
