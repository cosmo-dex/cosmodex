"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface MascotGreetingPopupProps {
  name: string;
  customMessage?: string | null;
  onOpenChat: () => void;
  onDismiss: () => void;
}

export default function MascotGreetingPopup({
  name,
  customMessage,
  onOpenChat,
  onDismiss,
}: MascotGreetingPopupProps) {
  const formattedName =
    name && name.length > 0
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -4, 0],
      }}
      exit={{ opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.15 } }}
      transition={{
        y: {
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.2 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
      onClick={onOpenChat}
      className="absolute bottom-[104%] right-1 sm:-right-2 w-auto min-w-[210px] max-w-[270px] rounded-2xl px-4 py-2.5 bg-[#0f0926]/95 backdrop-blur-md border border-cyan-400/35 shadow-[0_8px_30px_rgba(0,0,0,0.6),_0_0_18px_rgba(0,255,233,0.15)] cursor-pointer select-none group transition-all hover:border-cyan-400/60 z-50 pointer-events-auto"
      onPointerDownCapture={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-mono font-medium text-white/90 leading-snug">
          {customMessage ? (
            customMessage
          ) : (
            <>
              Hey{formattedName ? ` ` : ``}
              {formattedName && (
                <span className="text-cyan-400 font-bold">{formattedName}</span>
              )}
              , how can I help? 👋
            </>
          )}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="shrink-0 p-0.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>

      {/* Downward pointer tail */}
      <div className="absolute -bottom-[5px] right-8 sm:right-10 w-2.5 h-2.5 bg-[#0f0926] border-r border-b border-cyan-400/35 rotate-45 pointer-events-none" />
    </motion.div>
  );
}
