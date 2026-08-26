import Navbar from "@/components/navbar/Navbar";
import CoursesSection from "@/components/landing/CoursesSection";
import BattleArenaSection from "@/components/landing/BattleArenaSection";
import LevelUpSection from "@/components/landing/LevelUpSection";
import JoinClubSection from "@/components/landing/JoinClubSection";
import DevsSection from "@/components/landing/DevsSection";
import FAQSection from "@/components/faq/FAQSection";
import Footer from "@/components/landing/Footer";
import ScrollAnimation from "@/components/landing/ScrollAnimation";
import SmoothScroll from "@/components/landing/SmoothScroll";
import ClickParticles from "@/components/landing/ClickParticles";
import FAQSection from "@/components/faq/FAQSection";

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

      <SmoothScroll />

      <Navbar />
      <ClickParticles />

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
      <JoinClubSection />
      <DevsSection />

      <FAQSection />

      <div style={{ position: "relative", zIndex: 3, background: "#050508" }}>
        <Footer />
      </div>
    </main>
  );
}
