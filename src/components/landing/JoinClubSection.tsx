"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import RisingStars from "@/components/landing/RisingStars";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface PricingPlan {
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  accentColor: string;
  accentRgb: string;
  gradient: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    period: "month",
    features: [
      "5 courses per month",
      "Community Discord access",
      "Progress tracking",
      "Mobile app included",
    ],
    description: "Perfect for exploring the cosmos at your own pace.",
    buttonText: "Start Free",
    href: "/onboarding",
    isPopular: false,
    accentColor: "#c084fc",
    accentRgb: "192,132,252",
    gradient: "linear-gradient(135deg, #c084fc 0%, #9b30ff 100%)",
  },
  {
    name: "Pro",
    price: 19,
    originalPrice: 49,
    period: "month",
    features: [
      "Unlimited courses",
      "Battle Arena",
      "Priority community support",
      "Advanced analytics",
      "AI-powered code review",
      "Certificate of completion",
    ],
    description: "For serious learners ready to level up fast.",
    buttonText: "Upgrade to Pro",
    href: "/dashboard",
    isPopular: true,
    accentColor: "#ff2d78",
    accentRgb: "255,45,120",
    gradient: "linear-gradient(135deg, #ff2d78 0%, #9b30ff 100%)",
  },
  {
    name: "Elite",
    price: 49,
    originalPrice: 99,
    period: "month",
    features: [
      "Everything in Pro",
      "Battle Arena",
      "1-on-1 mentorship sessions",
      "Early feature access",
      "Private elite community",
      "Job placement support",
    ],
    description: "The full cosmic experience for the elite few.",
    buttonText: "Get Elite",
    href: "/dashboard",
    isPopular: false,
    accentColor: "#ff6ba8",
    accentRgb: "255,107,168",
    gradient: "linear-gradient(135deg, #ff6ba8 0%, #c084fc 100%)",
  },
];

/* ─── Pricing Card ───────────────────────────────────────────────────────────── */
function PricingCard({
  plan,
  index,
}: {
  plan: PricingPlan;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 48, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{
        opacity: { duration: 0.85, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{
        position: "relative",
        borderRadius: "24px",
        padding: "2px",
        background: isHovered ? plan.gradient : "rgba(255,255,255,0.07)",
        boxShadow: isHovered
          ? `0 20px 40px rgba(${plan.accentRgb}, 0.28)`
          : "0 4px 20px rgba(0,0,0,0.2)",
        zIndex: isHovered ? 10 : 1,
        flex: "1 1 0",
        minWidth: 0,
        transition: "background 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Inner card with Vercel/Apple style GPU hardware-accelerated frosted glass blur */}
      <div
        style={{
          borderRadius: "22px",
          background: "rgba(10,8,18,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          transform: "translateZ(0)",
          willChange: "backdrop-filter, transform",
          border: "1px solid rgba(255,255,255,0.09)",
          padding: "20px 20px 20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Plan name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: isHovered ? "#ffffff" : "rgba(240,230,255,0.75)",
              fontFamily: "var(--font-display), sans-serif",
              letterSpacing: "-0.01em",
              transition: "color 0.3s ease",
            }}
          >
            {plan.name}
          </span>
        </div>

        {/* Price / Strikethrough & Free */}
        <div
          style={{
            marginTop: "8px",
            marginBottom: "2px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {plan.originalPrice ? (
            <>
              <span
                style={{
                  fontSize: "clamp(18px, 1.8vw, 22px)",
                  fontWeight: 600,
                  textDecoration: "line-through",
                  color: "rgba(240,230,255,0.38)",
                  fontFamily: "var(--font-display), sans-serif",
                }}
              >
                ₹{plan.originalPrice}
              </span>
              <span
                style={{
                  fontSize: "clamp(30px, 3.2vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: isHovered ? "#ffffff" : "rgba(240,230,255,0.95)",
                  fontFamily: "var(--font-display), sans-serif",
                  lineHeight: 1,
                }}
              >
                Free
              </span>
            </>
          ) : (
            <span
              style={{
                fontSize: "clamp(30px, 3.2vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: isHovered ? "#ffffff" : "rgba(240,230,255,0.95)",
                fontFamily: "var(--font-display), sans-serif",
                lineHeight: 1,
              }}
            >
              Free
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "11.5px",
            color: "rgba(240,230,255,0.38)",
            fontFamily: "var(--font-body), 'Fira Code', monospace",
            marginBottom: "16px",
            minHeight: "16px",
            textAlign: "center",
          }}
        >
          100% free for limited time
        </p>

        {/* Features */}
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
            padding: 0,
            margin: 0,
          }}
        >
          {plan.features.map((feature, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "13px",
                color: "rgba(240,230,255,0.78)",
                fontFamily: "var(--font-body), 'Fira Code', monospace",
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: `rgba(${plan.accentRgb}, ${isHovered ? "0.22" : "0.12"})`,
                  border: `1px solid rgba(${plan.accentRgb}, ${isHovered ? "0.5" : "0.3"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: plan.accentColor,
                  transition: "all 0.3s ease",
                }}
              >
                <Check size={9} strokeWidth={3} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            margin: "16px 0 14px",
            background: `linear-gradient(90deg, transparent, rgba(${plan.accentRgb}, ${isHovered ? "0.45" : "0.2"}), transparent)`,
            transition: "background 0.3s ease",
          }}
        />

        {/* CTA button */}
        <a
          href={plan.href}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "var(--font-body), 'Fira Code', monospace",
            letterSpacing: "-0.01em",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: isHovered ? plan.gradient : "rgba(255,255,255,0.05)",
            color: isHovered ? "#ffffff" : "rgba(240,230,255,0.85)",
            border: isHovered
              ? "none"
              : `1px solid rgba(${plan.accentRgb}, 0.25)`,
            boxShadow: isHovered
              ? `0 8px 32px rgba(${plan.accentRgb}, 0.45)`
              : "none",
          }}
        >
          {plan.buttonText}
        </a>

        {/* Description */}
        <p
          style={{
            marginTop: "10px",
            fontSize: "11.5px",
            color: "rgba(240,230,255,0.28)",
            fontFamily: "var(--font-body), 'Fira Code', monospace",
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          {plan.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main Section ───────────────────────────────────────────────────────────── */
export default function JoinClubSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="join-club"
      className="section-padding !pb-8 sm:!pb-12"
      style={{
        position: "relative",
        zIndex: 3,
        overflow: "hidden",
        padding: "64px 0 44px",
      }}
    >
      {/* Dark overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "rgba(5,5,8,0.85)",
          pointerEvents: "none",
        }}
      />

      {/* Rising stars background */}
      <RisingStars count={70} intensity={0.75} style={{ zIndex: 1 }} />

      <div className="container-custom" ref={ref} style={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: "36px" }}
        >
          <div className="badge" style={{ marginBottom: "14px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor" />
            </svg>
            Early Access Pricing
          </div>

          <h2
            style={{
              fontSize: "clamp(30px, 4.5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "0.03em",
              lineHeight: 1.15,
              marginBottom: "12px",
              fontFamily: "var(--font-display), sans-serif",
            }}
          >
            <span style={{ color: "rgba(240,230,255,0.85)" }}>Join the </span>
            <span style={{ color: "#ffffff" }}>Crew.</span>
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(240,230,255,0.48)",
              maxWidth: "460px",
              margin: "0 auto",
              lineHeight: 1.55,
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            Simple, transparent pricing. No hidden fees.{" "}
            <span style={{ color: "rgba(240,230,255,0.72)" }}>
              All plans 100% free during early access.
            </span>
          </p>
        </motion.div>

        {/* ── Pricing cards ── */}
        <div
          style={{
            display: "flex",
            gap: "18px",
            alignItems: "stretch",
          }}
          className="pricing-grid"
        >
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={i}
            />
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "12.5px",
            color: "rgba(240,230,255,0.28)",
            fontFamily: "var(--font-body), 'Fira Code', monospace",
          }}
        >
          All plans include access to our mobile app, community Discord, and base course library.
        </motion.p>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .pricing-grid > * {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
