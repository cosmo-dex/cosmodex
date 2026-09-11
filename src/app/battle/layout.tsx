import type { Metadata } from "next";
import "../globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Battle Arena — 1v1 Real-Time Coding Battles",
  description:
    "Challenge other coders in real-time 1v1 multiplayer coding battles. Solve algorithms and MCQs head-to-head, defend your streak, and climb the Cosmic League ranks.",
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
