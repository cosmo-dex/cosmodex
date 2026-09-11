import type { Metadata } from "next";
import "../globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "1v1 Coding Battle Arena — Multiplayer Code Duels & Speed Challenges",
  description:
    "Challenge other coders in real-time 1v1 multiplayer coding battles and rapid MCQ duels. Solve algorithms head-to-head like Clash of Code, defend your streak, and climb the Cosmic League ranks.",
  keywords: [
    "coding game",
    "coding games",
    "online coding",
    "coding practice",
    "1v1 coding battle",
    "clash of code",
    "code duel",
    "speed coding battle",
    "multiplayer coding game",
    "real-time coding match",
    "competitive coding 1v1",
    "coding game online",
    "mcq coding battle",
  ],
  alternates: {
    canonical: `${appUrl}/battle`,
  },
  openGraph: {
    title: "Battle Arena — 1v1 Real-Time Coding Battles & Code Duels | CosmoDex",
    description:
      "Two players. One coding battle. Your code is your weapon. Compete in real-time 1v1 coding challenges and climb the Elo leaderboard.",
    url: `${appUrl}/battle`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Battle Arena — 1v1 Real-Time Coding Battles | CosmoDex",
    description:
      "Two players. One coding battle. Your code is your weapon. Compete in real-time 1v1 coding challenges and climb the Elo leaderboard.",
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
    <div className="battle-layout google-anno-skip">
      {children}
    </div>
  );
}
