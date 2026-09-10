"use client";

import React, { useEffect } from "react";

interface AdSenseBannerProps {
  slot?: string;
  className?: string;
}

export default function AdSenseBanner({ slot, className = "" }: AdSenseBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      }
    } catch {
    }
  }, []);

  return (
    <div
      className={`w-full flex justify-center items-center py-4 my-2 overflow-hidden relative z-10 ${className}`}
      style={{ minHeight: "0px" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center", width: "100%", maxWidth: "970px" }}
        data-ad-client="ca-pub-8841633365335879"
        {...(slot ? { "data-ad-slot": slot } : { "data-ad-format": "auto" })}
        data-full-width-responsive="true"
      />
    </div>
  );
}
