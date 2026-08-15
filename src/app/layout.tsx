import type { Metadata } from "next";
import { displayFont, bodyFont, monoFont } from "@/fonts";
import "./globals.css";
import Mascot from "@/features/mascot/Mascot";
import SmoothScroll from "@/components/landing/SmoothScroll";

export const metadata: Metadata = {
  title: "CosmoDeX — Start Your Coding Expedition",
  description:
    "Learn to code through interactive courses, battle challenges, and level up your skills. One expedition at a time.",
  keywords: ["coding", "learn to code", "programming courses", "python", "html", "css", "gamified learning"],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "CosmoDeX — Start Your Coding Expedition",
    description: "Learn to code through interactive courses, battle challenges, and level up your skills.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#050508" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
        style={{ background: "#08040f", color: "#f0e6ff" }}
        suppressHydrationWarning
      >
        <SmoothScroll />
        {/* Noise overlay for texture */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
