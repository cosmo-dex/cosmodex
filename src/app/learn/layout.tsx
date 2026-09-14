import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn to Code — Interactive Gamified Programming Courses & Quests",
  description:
    "Master Python, SQL, data structures, and algorithms through interactive gamified courses and coding quests. A fun, beginner-friendly Codédex & Codecademy alternative.",
  keywords: [
    "free coding practice sites",
    "how to learn coding",
    "coding course",
    "python coding",
    "java coding",
    "codedex alternative",
    "learn to code game",
    "gamified coding courses",
    "interactive python practice",
    "learn python by doing",
    "sql practice online",
    "beginner dsa course",
    "coding quests",
    "earn xp coding",
  ],
  alternates: {
    canonical: `${appUrl}/learn`,
  },
  openGraph: {
    title: "Learn to Code — Gamified Programming Courses | CosmoDex",
    description:
      "Master Python, SQL, and computer science fundamentals through hands-on gamified courses, XP rewards, and interactive quests.",
    url: `${appUrl}/learn`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn to Code — Gamified Programming Courses | CosmoDex",
    description:
      "Master Python, SQL, and computer science fundamentals with hands-on gamified courses and quests.",
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

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Learn", url: `${appUrl}/learn` },
        ]}
      />
      {children}
    </>
  );
}
