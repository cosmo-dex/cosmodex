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
  twitter: {
    card: "summary_large_image",
    title: "Coding Events, Hackathons & Competitions | CosmoDex",
    description:
      "Browse upcoming hackathons, coding contests, and programming challenges on CosmoDex.",
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
