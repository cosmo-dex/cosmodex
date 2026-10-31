import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn Python & Coding for Beginners",
  description:
    "Learn Python online with beginner-friendly courses, interactive coding lessons, and programming exercises designed for students and first-time learners.",
  keywords: [
    "learn Python online",
    "Python course for beginners",
    "python language courses",
    "learn HTML online",
    "coding practice platform",
    "coding platform for beginners",
    "python programming course"
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
