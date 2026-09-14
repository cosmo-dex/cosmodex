import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
import Leaderboard from "@/components/leaderboard/Leaderboard";

import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Galactic Leaderboard — Top Coders & Global League Rankings",
  description:
    "See the top CosmoDex coders ranked by XP across 1v1 coding battles, algorithm challenges, and global standings. Climb from Explorer to Celestial Master.",
  keywords: [
    "coding leaderboard",
    "top coders",
    "competitive programming leaderboard",
    "coder ranking",
    "student coder rankings",
    "elo rating coding",
    "global coding rankings",
    "best competitive programmers",
  ],
  alternates: {
    canonical: `${appUrl}/leaderboard`,
  },
  openGraph: {
    title: "Galactic Leaderboard — Top Coders & League Rankings | CosmoDex",
    description:
      "See the top CosmoDex coders ranked by XP across 1v1 coding battles and global league standings.",
    url: `${appUrl}/leaderboard`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galactic Leaderboard — Top Coders & League Rankings | CosmoDex",
    description:
      "See the top CosmoDex coders ranked by XP across 1v1 coding battles and global league standings.",
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

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#090214] text-white">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Leaderboard", url: `${appUrl}/leaderboard` },
        ]}
      />
      <Navbar />
      <Leaderboard />
    </div>
  );
}
