import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn Coding Online",
  description:
    "Explore coding guides, Python learning resources, and practical programming tutorials to help you learn coding online and improve your skills.",
  keywords: [
    "coding tutorials",
    "learn Python online",
    "Python programming for beginners",
    "coding practice platform",
    "coding learning platform",
    "programming guides",
    "coding tips and tricks",
    "coding for beginners"
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
