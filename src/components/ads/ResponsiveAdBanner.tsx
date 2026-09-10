"use client";

import React from "react";
import AdsterraBanner from "./AdsterraBanner";

// Keys provided by Adsterra
export const AD_KEYS = {
  leaderboard_728x90: "72aa18b347c03cdf69f297374fe51641",
  mobile_320x50: "727d83ce8b8c81b2bfba7f3004b874db",
  rectangle_300x250: "f2ee77db0d55d16f49153c92557d2335",
  skyscraper_160x300: "92f110926312f17cb4aa68de007cabbf",
  banner_468x60: "d539f5aaa7b22bda531b299161a0c850",
};

/**
 * Responsive banner that displays:
 * - 728x90 on desktop (>= 768px)
 * - 468x60 on tablets (480px - 767px)
 * - 320x50 on mobile (< 480px)
 */
export default function ResponsiveAdBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center items-center py-2 overflow-hidden relative z-10 ${className}`}>
      {/* Desktop Banner (728x90) */}
      <div className="hidden md:block">
        <AdsterraBanner
          adKey={AD_KEYS.leaderboard_728x90}
          width={728}
          height={90}
        />
      </div>

      {/* Tablet Banner (468x60) */}
      <div className="hidden sm:block md:hidden">
        <AdsterraBanner
          adKey={AD_KEYS.banner_468x60}
          width={468}
          height={60}
        />
      </div>

      {/* Mobile Banner (320x50) */}
      <div className="block sm:hidden">
        <AdsterraBanner
          adKey={AD_KEYS.mobile_320x50}
          width={320}
          height={50}
        />
      </div>
    </div>
  );
}

/**
 * High-performing 300x250 Medium Rectangle Ad
 */
export function MediumRectangleAd({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center py-2 overflow-hidden relative z-10 ${className}`}>
      <AdsterraBanner
        adKey={AD_KEYS.rectangle_300x250}
        width={300}
        height={250}
      />
    </div>
  );
}

/**
 * 160x300 Skyscraper Ad (sidebar or vertical placement)
 */
export function SkyscraperAd({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center py-2 overflow-hidden relative z-10 ${className}`}>
      <AdsterraBanner
        adKey={AD_KEYS.skyscraper_160x300}
        width={160}
        height={300}
      />
    </div>
  );
}
