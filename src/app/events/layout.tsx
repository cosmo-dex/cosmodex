import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Coding Events & Competitions for Students",
  description:
    "Explore coding events, student hackathons, and online challenges designed for learners who want to practice, compete, and grow.",
  keywords: [
    "coding battle",
    "coding challenges online",
    "coding learning platform",
    "coding events for students",
    "online coding challenges",
    "coding contests for beginners",
  ],
  alternates: {
    canonical: `${appUrl}/events`,
  },
  openGraph: {
    title: "Coding Events & Competitions | CosmoDex",
    description:
      "Explore coding events, student hackathons, and online challenges designed for learners who want to practice and compete.",
    url: `${appUrl}/events`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Events & Competitions | CosmoDex",
    description:
      "Explore coding events, student hackathons, and online challenges designed for learners who want to practice and compete.",
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
