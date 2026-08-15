import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
import Leaderboard from "@/components/leaderboard/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard — CosmoDex Galactic Legends",
  description:
    "See the top CosmoDex coders ranked by XP across MCQ battles, code battles and global standings.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#090214] text-white">
      <Navbar />
      <Leaderboard />
    </div>
  );
}
