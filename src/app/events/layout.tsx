import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Coding Events, Hackathons & Competitions",
  description:
    "Browse upcoming hackathons, coding contests, and programming challenges on CosmoDex. Compete with peers, win prizes, and level up your skills.",
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
  keywords: [
    "coding events",
    "college hackathons 2025",
    "student coding contests",
    "online programming competitions",
    "hackathons with prizes",
    "competitive coding challenge",
  ],
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
