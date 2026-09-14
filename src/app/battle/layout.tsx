import type { Metadata } from "next";
import "../globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Battle Arena — 1v1 Real-Time Coding Battles & Code Duels",
  description:
    "Challenge other coders in real-time 1v1 multiplayer coding battles. Solve algorithms and MCQs head-to-head, defend your streak, and climb the Cosmic League ranks. The ultimate Clash of Code alternative.",
  keywords: [
    "1v1 coding battle",
    "clash of code",
    "coding game",
    "coding games",
    "code duel multiplayer",
    "multiplayer coding game",
    "speed coding challenge",
    "live coding battle",
    "competitive coding 1v1",
    "codingame alternative",
    "real-time coding match",
    "python coding battle",
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
