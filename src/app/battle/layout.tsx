import type { Metadata } from "next";
import "../globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Coding Battles & Challenges",
  description:
    "Compete in real-time coding battles and coding challenges with live multiplayer duels, problem-solving, and speed-based coding practice.",
  keywords: [
    "coding battle",
    "coding challenges online",
    "online coding platform",
    "coding practice platform",
    "competitive coding platform",
  ],
  alternates: {
    canonical: `${appUrl}/battle`,
  },
  openGraph: {
    title: "Battle Arena — 1v1 Real-Time Coding Battles | CosmoDex",
    description:
      "Two players. One coding battle. Your code is your weapon. Compete in real-time 1v1 coding challenges.",
    url: `${appUrl}/battle`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Battle Arena — 1v1 Real-Time Coding Battles | CosmoDex",
    description:
      "Two players. One coding battle. Your code is your weapon. Compete in real-time 1v1 coding challenges.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="battle-layout">
      {children}
    </div>
  );
}
