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

        {fullScreen && (

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

            className="
            absolute
            inset-0
            bg-black/45
            backdrop-blur-md
            "

          />

        )}

        {/* =====================================================
            Main Window
        ====================================================== */}

        <motion.div

          initial={{
            opacity: 0,
            scale: .90,
            y: 20,
          }}

          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}

          exit={{
            opacity: 0,
            scale: .92,
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

bg-[#13111C]/92

backdrop-blur-3xl

shadow-[0_0_80px_rgba(141,55,214,.25)]

${fullScreen
? `
inset-4

lg:inset-8
rounded-[28px]
`
:`
bottom-4
right-4

sm:bottom-6
sm:right-6

lg:bottom-8
lg:right-8

w-[calc(100vw-24px)]
max-w-[460px]

h-[min(720px,calc(100vh-140px))]

rounded-[28px]
`
}

`}

        >

          {/* =====================================================
              Ambient Glow
          ====================================================== */}

          <div

            className="
absolute
inset-0
pointer-events-none
"

          >

            <div
              className="
absolute

-top-32
-left-24

h-72
w-72

rounded-full

bg-fuchsia-500/20

blur-[110px]
"
            />

            <div
              className="
absolute

-bottom-40
-right-24

h-72
w-72

rounded-full

bg-cyan-500/10

blur-[120px]
"
            />

          </div>

          {/* =====================================================
              Header
          ====================================================== */}

          <div

            className="
relative
z-20

flex
items-center
justify-between

border-b
border-white/8

px-6
py-4
"

          >

            {/* Left */}

            <div className="flex items-center gap-4">

              <div

                className="
relative

flex
h-12
w-12
items-center
justify-center

rounded-2xl

bg-gradient-to-br

from-fuchsia-500
to-violet-700

shadow-[0_0_35px_rgba(217,95,209,.35)]
"

              >

                <Bot

                  className="h-7 w-7 text-white"

                />

                <span

className="
absolute
-bottom-1
-right-1

h-3
w-3

rounded-full

bg-emerald-400

ring-2
ring-[#13111C]
"

                />

              </div>

              <div>

                <h3

                  className="
font-display

text-xl

lg:text-2xl

tracking-wide

text-white
"

                >

                  COSMO AI

                </h3>

                <p

                  className="
mt-1

flex
items-center
gap-2

font-mono

text-[12px]

text-fuchsia-300
"

                >

                  <Sparkles className="h-3 w-3" />

                  Online • Ready to help

                </p>

              </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-2">

              <button

                onClick={onToggleFullscreen}

                className="
cosmo-btn-secondary

!h-11
!w-11

!rounded-xl

!p-0
"

              >

                {

                  fullScreen

                  ?

                  <Minimize2 className="h-4 w-4"/>

                  :

                  <Maximize2 className="h-4 w-4"/>

                }

              </button>

              <button

                onClick={onClose}

                className="
cosmo-btn-secondary

!h-11
!w-11

!rounded-xl

!p-0
"

              >

                <X className="h-4 w-4"/>

              </button>

            </div>

          </div>
                    {/* =====================================================
              Body
          ====================================================== */}

          <div className="relative z-20 flex h-[calc(100%-92px)] flex-col">

            {/* Messages */}

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-6"
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col justify-center"
                >
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-700 shadow-[0_0_45px_rgba(217,95,209,.35)]">
                      <Bot className="h-10 w-10 text-white" />
                    </div>

                    <h2 className="font-display text-3xl text-white">
                      Welcome Explorer
                    </h2>

                    <p className="mt-3 font-mono text-sm text-white/60">
                      Ask me anything about CosmoDeX, coding,
                      challenges or your learning journey.
                    </p>
                  </div>

                  <div className="grid gap-3">
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
                          cosmo-glass-panel

                          flex
                          items-center
                          gap-4

                          p-4

                          text-left
                          "
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/15">
                            <Icon className="h-5 w-5 text-fuchsia-300" />
                          </div>

                          <div>
                            <p className="font-mono text-sm font-semibold text-white">
                              {item.title}
                            </p>

                            <p className="mt-1 font-mono text-xs text-white/50">
                              {item.prompt}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 12,
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
                        className={`max-w-[82%] rounded-2xl px-4 py-3 font-mono text-sm leading-7 ${
                          message.isUser
                            ? "bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white"
                            : "cosmo-glass-panel text-white"
                        }`}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
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

            <div className="border-t border-white/10 p-5">

              <div className="flex items-end gap-3">

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

                  min-h-[52px]
                  max-h-40

                  resize-none

                  font-mono
                  text-sm
                  "

                />

                <motion.button

                  whileHover={{
                    scale: 1.06,
                    y: -2,
                  }}

                  whileTap={{
                    scale: 0.95,
                  }}

                  onClick={onSend}

                  disabled={!inputValue.trim()}

                  className="
                  cosmo-btn-primary

                  !h-[52px]
                  !w-[52px]

                  !rounded-2xl

                  !p-0

                  disabled:opacity-40
                  "

                >

                  <Send className="h-5 w-5" />

                </motion.button>

              </div>

              <div className="mt-3 flex items-center justify-between">

                <p className="font-mono text-[11px] text-white/40">

                  Press <span className="text-fuchsia-300">Enter</span> to send
                  • Shift + Enter for a new line

                </p>

                <span className="font-mono text-[11px] text-white/40">

                  Cosmo AI Beta

                </span>

              </div>

            </div>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>

  );

}
  
