import { Space_Grotesk as DisplayFont, Fira_Code as BodyFont, Fira_Code as MonoFont } from "next/font/google";

// Space Grotesk — display font (hero headings, battle arena, section titles, achievements)
export const displayFont = DisplayFont({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Fira Code — primary application font (all UI text)
export const bodyFont = BodyFont({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Fira Code — code/mono contexts (unified with body)
export const monoFont = MonoFont({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
