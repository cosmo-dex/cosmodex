import localFont from "next/font/local";
import {
  Fira_Code as FiraCodeFont,
  Fira_Sans as FiraSansFont,
  Inter as InterFont,
} from "next/font/google";

// ── Display ──────────────────────────────────────────────────────────────────
export const displayFont = localFont({
  src: [
    {
      path: "../public/fonts/Hitchcut Font/Hitchcut-typeface/Hitchcut-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

// ── Unified Body & Mono Font (Fira Code) ─────────────────────────────────────
// Single instantiation avoids duplicate font downloads
export const bodyFont = FiraCodeFont({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const monoFont = {
  variable: "--font-mono",
  className: bodyFont.className,
};

// ── Inter (Readable Sans-Serif) ──────────────────────────────────────────────
export const interFont = InterFont({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ── Fira Sans (Used in battle matches) ───────────────────────────────────────
export const firaSansFont = FiraSansFont({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
