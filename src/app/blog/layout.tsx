import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Cosmic Dispatches — CosmoDex Engineering & Learning Blog",
  description:
    "Insights, tutorials, and dispatches on gamified coding, real-time 1v1 battle arenas, Python mastery, and technical interview preparation.",
  keywords: [
    "coding blog",
    "programming tutorials",
    "python tutorials for beginners",
    "how to learn coding",
    "coding guides",
    "technical interview preparation",
    "dsa tips and tricks",
    "gamified learning insights",
    // Blog / Sheet Page keywords from Excel
    "top 100 coding interview questions",
    "must do coding questions for interviews",
    "450 dsa questions",
    "150 days of code challenge",
    "75 leetcode questions list",
    "striver sde sheet alternative",
    "love babbar dsa sheet alternative",
    "neetcode 150 alternative",
    "blind 75 leetcode list",
    "coding interview questions and answers pdf",
    "dsa questions with solutions",
    "top 50 sql interview questions",
    "top 50 python interview questions",
    "top 50 java interview questions",
    "data structures interview questions pdf",
  ],
  alternates: {
    canonical: `${appUrl}/blog`,
  },
  openGraph: {
    title: "Cosmic Dispatches — CosmoDex Engineering & Learning Blog",
    description:
      "Insights, tutorials, and dispatches on gamified coding, real-time 1v1 battle arenas, and Python mastery.",
    url: `${appUrl}/blog`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmic Dispatches — CosmoDex Engineering & Learning Blog",
    description:
      "Insights, tutorials, and dispatches on gamified coding, real-time 1v1 battle arenas, and Python mastery.",
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

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Blog", url: `${appUrl}/blog` },
        ]}
      />
      {children}
    </>
  );
}
