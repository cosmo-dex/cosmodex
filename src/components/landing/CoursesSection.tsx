"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const courses = [
  {
    id: "python",
    title: "Python",
    description: "Master the most versatile language in the cosmos. From basics to advanced patterns.",
    level: "Beginner",
    lessons: 42,
    xp: 2100,
    color: "#ff2d78",
    rgb: "255,45,120",
    category: "Popular",
    href: "/learn#python",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4C9.373 4 10 7 10 7v3h6v1H7S4 10.627 4 17s3.373 7 3.373 7H9v-3.5S8.9 17 12 17h8c2.761 0 3-2.239 3-5V9c0-2.761-2.239-5-5-5h-2zm-1.5 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="currentColor" opacity="0.9"/>
        <path d="M16 28c6.627 0 6-3 6-3v-3h-6v-1h9S28 21.373 28 15s-3.373-7-3.373-7H23v3.5S23.1 15 20 15h-8c-2.761 0-3 2.239-3 5v3c0 2.761 2.239 5 5 5h2zm1.5-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: "html",
    title: "HTML5 & Web Semantics",
    description: "Build semantic, accessible, SEO-ready web documents and responsive page architectures.",
    level: "Beginner",
    lessons: 7,
    xp: 500,
    color: "#ea580c",
    rgb: "234,88,12",
    category: "Popular",
    href: "/learn/html",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 3l2 22 9 3 9-3 2-22H5zm18 5l-.5 4.5H11.5l.3 3.5h10.4l-1 10.5-5.2 1.7-5.2-1.7-.3-4h3.5l.2 1.8 1.8.5 1.8-.5.2-2.3H8l-.7-8.5H23.5L23 8z" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
  },
  {
    id: "cpp",
    title: "C++",
    description: "Build fast, powerful software with systems-level programming and memory management.",
    level: "Coming Soon",
    lessons: 0,
    xp: 0,
    color: "#9b30ff",
    rgb: "155,48,255",
    category: "Popular",
    placeholder: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 3L4 9.5v13L16 29l12-6.5v-13L16 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 16h4M13 14v4M19 16h4M21 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "java",
    title: "Java",
    description: "Write once, run anywhere. Object-oriented design and enterprise engineering patterns.",
    level: "Coming Soon",
    lessons: 0,
    xp: 0,
    color: "#c084fc",
    rgb: "192,132,252",
    category: "Popular",
    placeholder: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M12 22s-2 1.2-2 2.2c0 1.5 4 2.3 7 2.3s6-.7 6-2.2c0-1-.8-1.8-2-2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 18.5s-1.5.9-1.5 1.8c0 1.2 3 1.8 6.5 1.8s5.5-.6 5.5-1.8c0-.8-.8-1.5-1.5-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 4c0 0 6 3 2 7-3 3 2 5.5 2 5.5s-7-2-3-6c3-3-1-6.5-1-6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "placeholder-1",
    title: "Coming Soon",
    description: "More courses launching soon. Stay tuned for the next expedition.",
    level: "—",
    lessons: 0,
    xp: 0,
    color: "#ff6ba8",
    rgb: "255,107,168",
    category: "Popular",
    placeholder: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "placeholder-2",
    title: "Coming Soon",
    description: "More courses launching soon. Stay tuned for the next expedition.",
    level: "—",
    lessons: 0,
    xp: 0,
    color: "#9b30ff",
    rgb: "155,48,255",
    category: "AI",
    placeholder: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "placeholder-3",
    title: "Coming Soon",
    description: "More courses launching soon. Stay tuned for the next expedition.",
    level: "—",
    lessons: 0,
    xp: 0,
    color: "#ff2d78",
    rgb: "255,45,120",
    category: "Games",
    placeholder: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" as const },
  },
};

export default function CoursesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) => {
    return search === "" || c.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <section
      id="courses"
      className="section-padding"
      style={{
        position: "relative",
        zIndex: 3,
        background: "rgba(5,5,8,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        paddingTop: "90px",
        paddingBottom: "80px",
        scrollMarginTop: "80px",
      }}
    >
      {/* Radial tint */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "700px",
          background: "radial-gradient(ellipse, rgba(155,48,255,0.045) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-custom" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: "28px" }}
        >
          <div className="badge" style={{ marginBottom: "14px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor" />
            </svg>
            Courses
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4.2vw, 48px)",
              fontWeight: 700,
              letterSpacing: "0.03em",
              lineHeight: 1.25,
              marginBottom: "12px",
              fontFamily: "var(--font-display), sans-serif",
            }}
          >
            <span style={{ color: "rgba(240,230,255,0.9)" }}>Start your course</span>
            <br />
            <span style={{ color: "#ffffff" }}>through the cosmos.</span>
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
            Pick a language, start learning, and earn ✦ as you go.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: "460px", margin: "0 auto 32px" }}
        >
          <div style={{ position: "relative" }}>
            <svg
              width="16" height="16" viewBox="0 0 18 18" fill="none"
              aria-hidden="true"
              style={{
                position: "absolute", left: "16px", top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(240,230,255,0.3)",
              }}
            >
              <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 44px",
                borderRadius: "100px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(240,230,255,0.88)",
                fontSize: "14px",
                fontFamily: "var(--font-body), 'Fira Code', monospace",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.4)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </motion.div>

        {/* Course grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((course) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              className="feature-card"
              style={{
                opacity: (course as { placeholder?: boolean }).placeholder ? 0.5 : 1,
                cursor: (course as { placeholder?: boolean }).placeholder ? "default" : "pointer",
                padding: "24px",
              }}
            >
              {/* Icon */}
              <div
                className="feature-icon"
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: `rgba(${course.rgb}, 0.1)`,
                  border: `1px solid rgba(${course.rgb}, 0.2)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  color: course.color,
                  boxShadow: `0 4px 16px rgba(${course.rgb}, 0.12)`,
                }}
              >
                {course.icon}
              </div>

              {/* Level or Coming Soon badge */}
              {(course as { placeholder?: boolean }).placeholder ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    color: "#c084fc",
                    marginBottom: "10px",
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  Coming Soon
                </div>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    background: `rgba(${course.rgb}, 0.1)`,
                    color: course.color,
                    marginBottom: "10px",
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  {course.level}
                </div>
              )}

              {/* Title */}
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "rgba(240,230,255,0.95)",
                  marginBottom: "8px",
                  letterSpacing: "0.025em",
                  lineHeight: 1.18,
                  fontFamily: "var(--font-display), sans-serif",
                }}
              >
                {course.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "13.5px",
                  color: "rgba(240,230,255,0.48)",
                  lineHeight: 1.55,
                  marginBottom: "14px",
                  fontFamily: "var(--font-body), 'Fira Code', monospace",
                }}
              >
                {course.description}
              </p>

              {/* Stats row */}
              {!(course as { placeholder?: boolean }).placeholder && (
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(240,230,255,0.38)",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {course.lessons} lessons
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: course.color,
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {course.xp.toLocaleString()} XP
                  </span>
                </div>
              )}

              {/* Action Button */}
              {!(course as { placeholder?: boolean }).placeholder ? (
                <Link
                  href={(course as { href?: string }).href || "/learn"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    marginTop: "12px",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                    textDecoration: "none",
                    background: `rgba(${course.rgb}, 0.12)`,
                    border: `1px solid rgba(${course.rgb}, 0.3)`,
                    color: "#ffffff",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `linear-gradient(135deg, rgba(${course.rgb}, 0.85), rgba(${course.rgb}, 0.45))`;
                    el.style.borderColor = `rgba(${course.rgb}, 0.9)`;
                    el.style.boxShadow = `0 6px 20px rgba(${course.rgb}, 0.4)`;
                    el.style.transform = "translateY(-1.5px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `rgba(${course.rgb}, 0.12)`;
                    el.style.borderColor = `rgba(${course.rgb}, 0.3)`;
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  Start Course
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    marginTop: "12px",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "rgba(240,230,255,0.3)",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  Coming Soon
                </div>
              )}

              {/* Bottom accent line */}
              <div
                className="card-accent-line"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(${course.rgb}, 0.4), transparent)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
