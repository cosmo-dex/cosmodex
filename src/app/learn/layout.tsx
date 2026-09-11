import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn to Code — Interactive Programming Courses",
  description:
    "Master Python, SQL, data structures, and computer science fundamentals through hands-on gamified courses, quests, and interactive challenges on CosmoDex.",
  alternates: {
    canonical: `${appUrl}/learn`,
  },
  openGraph: {
    title: "Learn to Code — Interactive Programming Courses | CosmoDex",
    description:
      "Master Python, SQL, and computer science fundamentals through hands-on gamified courses and interactive quests.",
    url: `${appUrl}/learn`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn to Code — Interactive Programming Courses | CosmoDex",
    description:
      "Master Python, SQL, and computer science fundamentals with hands-on gamified courses.",
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
