import type { Metadata } from "next";
import "../globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Battle Arena — 1v1 Real-Time Coding Battles & Code Duels",
  description:
    "Challenge other coders in real-time 1v1 multiplayer coding battles. Solve algorithms and MCQs head-to-head, defend your streak, and climb the Cosmic League ranks. The ultimate Clash of Code alternative.",
  keywords: [
    "1v1 coding battle",
    "live coding battle",
    "code duel multiplayer",
    "real-time multiplayer coding",
    "speed coding challenge",
    "coding battle royale",
    "online coding arena",
    "coding contest for college students",
    "competitive coding for beginners",
    "coding league ranks",
    "coding leaderboard",
    "xp points for coding",
    "coding streak tracker",
    "coding quiz game",
    "clash of code",
    "codingame alternative",
    "gamified coding platform",
    "multiplayer coding game",
    "python coding game",
    "sql practice game",
    "real-time coding match",
    "competitive coding 1v1",
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
