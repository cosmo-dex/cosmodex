/**
 * ─── Font Configuration ───────────────────────────────────────────────────────
 *
 * This is the ONLY file you need to edit to change fonts site-wide.
 *
 * HOW TO SWAP A FONT
 * ──────────────────
 * 1. Pick a font from https://fonts.google.com
 * 2. Import it below (replace the existing import for that role)
 * 3. Update the font() call — change the function name and adjust weights
 *    if the new font supports different ones
 * 4. Save — the CSS variables update automatically everywhere
 *
 * FONT ROLES
 * ──────────
 *  display  →  --font-display  →  hero headings, Battle Arena titles, section titles,
 *                                  feature card titles, achievement titles
 *  body     →  --font-body     →  ALL other text: nav, buttons, descriptions,
 *                                  badges, forms, footer, cards, modals
 *  mono     →  --font-mono     →  code blocks, terminal mockups, XP values
 *                                  (same as body — unified Fira Code)
 *  inter    →  --font-inter    →  readable sans-serif for long-form text,
 *                                  MCQ questions, option labels, paragraphs
 */

import {
  // ── DISPLAY font (Battle Arena headings, hero headings, section titles) ─────
  // Space Grotesk: Clean, easily readable, modern geometric space-tech font
  Space_Grotesk as DisplayFont,

  // ── BODY font (all UI text — nav, buttons, descriptions, forms, footer) ──────
  // Fira Code: monospace with programming ligatures — developer-centric aesthetic
  Fira_Code as BodyFont,

  // ── MONO font (code blocks, terminal, XP values) ──────────────────────────────
  // Same as body — unified Fira Code throughout for a cohesive dev experience
  Fira_Code as MonoFont,

  // ── READABLE font for Battle Arena questions & long-form text ───────────────
  // Plus Jakarta Sans: modern geometric sans with wide apertures & high legibility
  Plus_Jakarta_Sans as InterFont,
} from "next/font/google";

// ── Display ──────────────────────────────────────────────────────────────────
// Space Grotesk: Crisp, highly legible geometric tech/gaming font for Battle Arena,
// hero headings, section titles, feature card titles, and tournament gaming elements.
export const displayFont = DisplayFont({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ── Body ─────────────────────────────────────────────────────────────────────
// Fira Code as the primary application font — nav links, buttons, descriptions,
// form elements, badges, footer content, cards, modals, and ALL UI text.
export const bodyFont = BodyFont({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ── Mono ─────────────────────────────────────────────────────────────────────
// Fira Code — code blocks, terminal mockups, XP values, stat numbers.
// Unified with body for a seamless developer experience.
export const monoFont = MonoFont({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ── Readable Sans-Serif (Plus Jakarta Sans) ─────────────────────────────────
// Clean modern geometric sans-serif for Battle Arena questions, option labels,
// and long-form text where high readability is essential.
export const interFont = InterFont({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
