"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import AdSenseBanner from "./AdSenseBanner";
import ResponsiveAdBanner from "./ResponsiveAdBanner";

const EXCLUDED_ROUTES = [
  "/onboarding",
  "/battle",
  "/login",
  "/signup",
];

export default function GlobalAds() {
  const pathname = usePathname();

  const isExcluded = pathname
    ? EXCLUDED_ROUTES.some((route) => pathname.startsWith(route))
    : false;

  if (isExcluded) {
    return null;
  }

  return (
    <>
      <Script
        id="cpm-network-header"
        src="https://pl31257884.profitableratecpmnetwork.com/59/2e/c7/592ec7429696819bdbed6840e82ee112.js"
        strategy="lazyOnload"
      />
      <Script
        id="cpm-network-body"
        src="https://pl31257886.profitableratecpmnetwork.com/71/76/42/7176422c6fb28d171c63bd88c8439c95.js"
        strategy="lazyOnload"
      />

      <div className="w-full flex flex-col items-center justify-center py-4 my-2 overflow-hidden relative z-10">
        <AdSenseBanner />
        <ResponsiveAdBanner />
      </div>
    </>
  );
}
