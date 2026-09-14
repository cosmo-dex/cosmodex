import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Coding Events, Hackathons & Programming Competitions",
  description:
    "Browse upcoming student hackathons, coding contests, and programming challenges on CosmoDex. Compete with peers, win prizes, and level up your skills.",
  keywords: [
    "coding events",
    "college coding contest",
    "student hackathons",
    "hackathons 2025",
    "online coding competition",
    "programming contests",
    "coding challenges with prizes",
    "competitive programming contests",
    "free coding competitions",
    "developer hackathon",
  ],
  alternates: {
    canonical: `${appUrl}/events`,
  },
  openGraph: {
    title: "Coding Events, Hackathons & Competitions | CosmoDex",
    description:
      "Browse upcoming hackathons, coding contests, and programming challenges on CosmoDex. Compete, win prizes, and level up.",
    url: `${appUrl}/events`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Events, Hackathons & Competitions | CosmoDex",
    description:
      "Browse upcoming hackathons, coding contests, and programming challenges on CosmoDex.",
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

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Events", url: `${appUrl}/events` },
        ]}
      />
      {children}
    </>
  );
}
