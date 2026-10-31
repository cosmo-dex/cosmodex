import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Support & Contact — Mission Control | CosmoDex",
  description:
    "Need assistance, found an anomaly, or want to partner with us? Transmit your signal to CosmoDex Mission Control and our crew will respond within 24-48 hours.",
  keywords: [
    "cosmodex support",
    "cosmodex help center",
    "contact cosmodex",
    "coding platform support",
    "report a bug cosmodex",
    "cosmodex contact email",
    "cosmodex platform assistance"
  ],
  alternates: {
    canonical: `${appUrl}/support`,
  },
  openGraph: {
    title: "Support & Contact — Mission Control | CosmoDex",
    description:
      "Need assistance, found an anomaly, or want to partner with us? Transmit your signal to CosmoDex Mission Control.",
    url: `${appUrl}/support`,
    siteName: "CosmoDex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support & Contact — Mission Control | CosmoDex",
    description:
      "Need assistance, found an anomaly, or want to partner with us? Transmit your signal to CosmoDex Mission Control.",
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

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Support", url: `${appUrl}/support` },
        ]}
      />
      {children}
    </>
  );
}
