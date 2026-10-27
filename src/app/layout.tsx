import type { Metadata } from "next";
import Script from "next/script";
import { displayFont, bodyFont, monoFont, interFont } from "@/fonts";
import "./globals.css";
import SmoothScroll from "@/components/landing/SmoothScroll";
import Providers from "@/components/providers/Providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CosmoDex — Gamified Coding Platform for Students | Learn, Code, Battle",
    template: "%s | CosmoDex",
  },
  description:
    "CosmoDex is a gamified coding platform and LeetCode/Codédex alternative for students to learn programming, practice Python & SQL, solve challenges, compete in 1v1 Space Battles, and level up skills.",
  keywords: [
    "CosmoDex",
    // Landing / Comparison Page keywords
    "leetcode alternative",
    "leetcode alternative for students",
    "hackerrank alternative",
    "codechef alternative",
    "codewars alternative",
    "codedex alternative",
    "coding ninjas alternative",
    "codingame alternative",
    "gamified coding platform",
    "gamified learning platform for coding",
    "coding platform for students",
    "free coding practice sites",
    "best coding practice website",
    "learn to code by playing games",
    "coding games for students",
    "coding games online",
    "1v1 coding battle",
    "code duel multiplayer",
    "real-time multiplayer coding",
    "live coding battle",
    "speed coding challenge",
    "coding streak tracker",
    "coding leaderboard",
    "coding league ranks",
    "xp points for coding",
    "coding contest for college students",
    "competitive coding for beginners",
    "online coding arena",
    "coding quiz game",
    "learn python by playing",
    "python coding game",
    "sql practice game",
    "interactive programming practice",
    "vibe coding platform",
    "ai coding practice platform",
    "coding battle royale",
    // Landing Page keywords
    "free coding platform for students",
    "coding practice for engineering students",
    "college coding contest platform",
    "campus placement coding practice",
    "SIH hackathon coding practice",
    "DSA sheet for placement",
    "placement preparation website",
    "coding bootcamp online free",
    "GATE CS coding practice",
    "best site to learn python for beginners",
    "best site to learn sql for beginners",
    "coding for computer science students",
    "online judge for students",
    "coding platform for college students",
    "free python course for students",
    "free sql course for students",
    "beginner dsa practice website",
    "coding practice with certificate",
    "student coding community",
    "project based learning coding",
    // General
    "coding platform",
    "coding website",
    "free coding",
    "coding practice",
    "online coding",
    "coding game",
    "python coding",
    "java coding",
    "how to learn coding",
    "coding course",
    "learn programming",
    "python practice",
    "sql practice",
    "beginner dsa practice",
    "daily coding streak",
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
      logo: `${appUrl}/images/logo.webp`,
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
        {
          "@type": "Question",
          name: "Is CosmoDex a good alternative to Codédex and LeetCode?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. CosmoDex provides beginner-friendly gamified quests and interactive courses like Codédex, but introduces real-time multiplayer 1v1 coding duels, college hackathons, and Elo ratings to prepare students for real-world technical assessments.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I find free coding practice sites to learn Python and Java?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CosmoDex is a free coding platform where students can practice Python, Java, SQL, and data structures with interactive courses, real-time code challenges, and instant automated feedback.",
          },
        },
        {
          "@type": "Question",
          name: "What makes CosmoDex a fun coding game for students?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CosmoDex combines programming education with multiplayer gaming mechanics: earn XP, maintain streaks, climb 6 cosmic league ranks, and compete in live 1v1 Space Battles.",
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
      
        {/* for ads */}
        <Script src="https://abscloud.org/1/592ec7429696819bdbed6840e82ee112" strategy="beforeInteractive" data-cfasync="false" />
      </head>

      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} ${interFont.variable} antialiased`}
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

        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MTZR6TH8');`,
          }}
        />

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
        </Providers>

        {/* for ads */}
        <Script src="https://bauval.org/21/ba6cbf6be7b27882ce717d652ad0acb8" strategy="afterInteractive" data-cfasync="false" />
        <div id="container-ba6cbf6be7b27882ce717d652ad0acb8"></div>

        <Script id="ad-468x60" strategy="afterInteractive">
          {`atOptions = {'key' : 'd539f5aaa7b22bda531b299161a0c850','format' : 'iframe','height' : 60,'width' : 468,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/d539f5aaa7b22bda531b299161a0c850" strategy="afterInteractive" />

        <Script id="ad-728x90" strategy="afterInteractive">
          {`atOptions = {'key' : '72aa18b347c03cdf69f297374fe51641','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/72aa18b347c03cdf69f297374fe51641" strategy="afterInteractive" />

        <Script id="ad-320x50" strategy="afterInteractive">
          {`atOptions = {'key' : '727d83ce8b8c81b2bfba7f3004b874db','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/727d83ce8b8c81b2bfba7f3004b874db" strategy="afterInteractive" />

        <Script id="ad-300x250" strategy="afterInteractive">
          {`atOptions = {'key' : 'f2ee77db0d55d16f49153c92557d2335','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/f2ee77db0d55d16f49153c92557d2335" strategy="afterInteractive" />

        <Script id="ad-160x600" strategy="afterInteractive">
          {`atOptions = {'key' : '61703135af5a650f8cb66273750cdd56','format' : 'iframe','height' : 600,'width' : 160,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/61703135af5a650f8cb66273750cdd56" strategy="afterInteractive" />

        <Script id="ad-160x300" strategy="afterInteractive">
          {`atOptions = {'key' : '92f110926312f17cb4aa68de007cabbf','format' : 'iframe','height' : 300,'width' : 160,'params' : {}};`}
        </Script>
        <Script src="https://bauval.org/22/92f110926312f17cb4aa68de007cabbf" strategy="afterInteractive" />
      </body>
    </html>
  );
}
