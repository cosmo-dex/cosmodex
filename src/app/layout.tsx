import type { Metadata } from "next";
import Script from "next/script";
import { displayFont, bodyFont, monoFont } from "@/fonts";
import "./globals.css";
import SmoothScroll from "@/components/landing/SmoothScroll";
import Mascot from "@/features/mascot/Mascot";
import Providers from "@/components/providers/Providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CosmoDex — Gamified Coding Platform for Students | Learn, Code, Battle",
    template: "%s | CosmoDex",
  },
  description:
    "CosmoDex is a gamified coding platform for students to learn programming, practice Python & SQL, solve challenges, compete in 1v1 Space Battles, level up skills, and earn rewards.",
  keywords: [
    "CosmoDex",
    "gamified coding platform",
    "coding for students",
    "1v1 coding battle",
    "learn programming",
    "python practice",
    "sql practice",
    "coding games for students",
    "space battle coding",
    "competitive coding for beginners",
    "leetCode alternative for students",
    "hackerRank alternative",
    "codédex alternative",
    "interactive programming practice",
  ],
  applicationName: "CosmoDex",
  authors: [{ name: "CosmoDex Team", url: appUrl }],
  creator: "CosmoDex",
  publisher: "CosmoDex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: appUrl,
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "CosmoDex — Gamified Coding Platform for Students",
    description:
      "Learn to code through interactive courses, 1v1 Space Battles, and level up across cosmic league ranks. Learn. Code. Battle. Level Up. Earn.",
    url: appUrl,
    siteName: "CosmoDex",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${appUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CosmoDex — Gamified Coding Platform for Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CosmoDex — Gamified Coding Platform for Students",
    description:
      "Learn programming, practice Python & SQL, and compete in real-time 1v1 Space Coding Battles.",
    images: [`${appUrl}/opengraph-image`],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${appUrl}/#organization`,
      name: "CosmoDex",
      alternateName: ["CosmoDeX", "Cosmo Dex"],
      url: appUrl,
      logo: `${appUrl}/images/logo.png`,
      email: "connect.cosmodex@gmail.com",
      sameAs: [
        "https://github.com/cosmo-dex",
        "https://x.com/cosmodex",
        "https://www.linkedin.com/company/cosmodex"
      ],
      description:
        "CosmoDex is a gamified coding platform designed for students and aspiring developers to learn programming, practice coding, and compete in 1v1 battles.",
    },
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      url: appUrl,
      name: "CosmoDex",
      alternateName: ["CosmoDeX", "Cosmo Dex"],
      publisher: {
        "@id": `${appUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${appUrl}/learn?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalApplication",
      "@id": `${appUrl}/#application`,
      name: "CosmoDex Gamified Coding Platform",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      educationalUse: "Coding & Programming Practice",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Interactive gamified platform for students to practice Python, SQL, and compete in 1v1 Space Battles.",
    },
    {
      "@type": "FAQPage",
      "@id": `${appUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is CosmoDex?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CosmoDex is a gamified coding platform for students where learners can learn programming, practice coding, complete challenges, compete in 1v1 Space Battles, progress through cosmic league ranks, and earn rewards.",
          },
        },
        {
          "@type": "Question",
          name: "What is a 1v1 Space Battle on CosmoDex?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Space Battle is a flagship 1v1 multiplayer coding arena where two players compete head-to-head in real time using their programming and problem-solving skills.",
          },
        },
        {
          "@type": "Question",
          name: "What programming languages can I practice on CosmoDex?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CosmoDex provides hands-on learning and practice for Python, SQL, data structures, algorithms, and core computer science fundamentals.",
          },
        },
        {
          "@type": "Question",
          name: "How is CosmoDex different from LeetCode or HackerRank?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Unlike traditional problem sets, CosmoDex is student-focused and combines gamified level progression (XP, streaks, ranks) with real-time 1v1 Space Coding Battles and tangible rewards.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#050508" />
        <link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-96.png" sizes="96x96" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="shortcut icon" href="/favicon-48x48.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {/* Google Tag Manager (head) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MTZR6TH8');`,
          }}
        />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
        style={{ background: "#08040f", color: "#f0e6ff" }}
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MTZR6TH8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Google tag (gtag.js) - Added just after head end */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LN4YNMPR0D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LN4YNMPR0D');
          `}
        </Script>

        <Providers>
          <SmoothScroll />
          {/* Noise overlay for texture */}
          <div className="noise-overlay" aria-hidden="true" />
          {children}
          <Mascot />
        </Providers>
      </body>
    </html>
  );
}
