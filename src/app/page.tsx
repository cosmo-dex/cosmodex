import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CoursesSection from "@/components/landing/CoursesSection";
import BattleArenaSection from "@/components/landing/BattleArenaSection";
import LevelUpSection from "@/components/landing/LevelUpSection";
import JoinClubSection from "@/components/landing/JoinClubSection";
import DevsSection from "@/components/landing/DevsSection";
import Footer from "@/components/landing/Footer";
import ScrollAnimation from "@/components/landing/ScrollAnimation";
import ClickParticles from "@/components/landing/ClickParticles";
import FAQSection from "@/components/faq/FAQSection";
import WebsiteTour from "@/components/onboarding/WebsiteTour";

export default function Home() {
  return (
    <main
      style={{
        background: "#050508",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <ScrollAnimation />

      <Navbar />
      <ClickParticles />

      <HeroSection />
      <CoursesSection />
      <BattleArenaSection />
      <LevelUpSection />

      {/*
       * ── SOLID SECTIONS ───────────────────────────────────────────────
       * JoinClub, Devs, FAQ, and Footer sit after the animation zone.
       */}
      <JoinClubSection />
      <DevsSection />

      {/* ── FAQ SECTION (Last section before Footer) ── */}
      <FAQSection />

      <div style={{ position: "relative", zIndex: 3, background: "#050508" }}>
        <Footer />
      </div>
      <WebsiteTour />
    </main>
  );
}
