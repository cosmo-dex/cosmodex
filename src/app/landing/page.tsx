import NavbarNew from "@/components/landing/NavbarNew";
import HeroSection from "@/components/landing/HeroSection";
import CoursesSection from "@/components/landing/CoursesSection";
import BattleArenaSection from "@/components/landing/BattleArenaSection";
import LevelUpSection from "@/components/landing/LevelUpSection";
import JoinClubSection from "@/components/landing/JoinClubSection";
import DevsSection from "@/components/landing/DevsSection";
import Footer from "@/components/landing/Footer";
import ScrollAnimation from "@/components/landing/ScrollAnimation";
import SmoothScroll from "@/components/landing/SmoothScroll";
import ClickParticles from "@/components/landing/ClickParticles";
import FAQSection from "@/components/faq/FAQSection";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata = {
  title: "CosmoDeX — Start Your Coding Expedition",
  description:
    "Learn to code through interactive courses, battle challenges, and level up your skills. One expedition at a time.",
  alternates: {
    canonical: appUrl,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <main
      style={{
        background: "#050508",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/*
       * Layer order (z-index):
       *   0    — #050508 body background
       *   1    — ScrollAnimation canvas
       *   2    — ScrollAnimation vignette overlay
       *   3    — All page sections
       *   3    — RisingStars canvas
       *   50   — Navbar pill
       *   200  — Loading screen
       *   9999 — ClickParticles canvas
       */}

      {/* Scroll-driven 240-frame animation — fixed behind all content */}
      <ScrollAnimation />

      {/* Lenis smooth scrolling */}
      <SmoothScroll />

      {/* Navigation */}
      <NavbarNew />

      {/* Click particle burst effect */}
      <ClickParticles />

      {/* ─────────────────────────────────────────────────────────────
          ANIMATION ZONE
          Sections with semi-transparent backgrounds so the
          scroll animation can bleed through underneath.
         ───────────────────────────────────────────────────────────── */}

      <HeroSection />

      <CoursesSection />

      <BattleArenaSection />

      <LevelUpSection />

      {/* ─────────────────────────────────────────────────────────────
          SOLID SECTIONS
         ───────────────────────────────────────────────────────────── */}

      <JoinClubSection />

      <DevsSection />

      {/* ─────────────────────────────────────────────────────────────
          FAQ
          SEO-friendly FAQ section with interactive accordion.
         ───────────────────────────────────────────────────────────── */}

      <FAQSection />

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
         ───────────────────────────────────────────────────────────── */}

      <div
        style={{
          position: "relative",
          zIndex: 3,
          background: "#050508",
        }}
      >
        <Footer />
      </div>
    </main>
  );
}