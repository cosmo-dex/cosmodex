"use client";

import RisingStars from "@/components/landing/RisingStars";


export default function DevsSection() {

  return (
    <section
      id="our-devs"
      className="section-padding !pb-8 sm:!pb-12"
      style={{
        position: "relative",
        zIndex: 3,
        overflow: "hidden",
      }}
    >
      {/* Dark + blur overlay — sits above the scroll animation canvas but below RisingStars */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "rgba(5,5,8,0.82)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          pointerEvents: "none",
        }}
      />

      {/* Rising stars background — above the blur overlay */}
      <RisingStars count={60} intensity={0.6} style={{ zIndex: 1 }} />
      {/* Radial tint */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,45,120,0.03) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />


      <style>{`
        @media (max-width: 900px) {
          .devs-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .devs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
