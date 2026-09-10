"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    question: "What is CosmoDex?",
    answer:
      "CosmoDex is a gamified coding platform designed for students and developers to learn programming through interactive courses, coding practice, 1v1 Space Battles, and skill-based challenges.",
  },
  {
    question: "How does CosmoDex help students learn coding?",
    answer:
      "CosmoDex combines structured programming courses in Python, SQL, and CS fundamentals with hands-on practice, gamified level progression, and real-time multiplayer coding challenges.",
  },
  {
    question: "Is CosmoDex free to use?",
    answer:
      "CosmoDex offers free access to core learning courses, coding practice, and battle matches, with optional Pro features like AI-powered automated code reviews.",
  },
  {
    question: "How does coding practice work on CosmoDex?",
    answer:
      "Coding practice gives learners hands-on opportunities to solve real programming exercises, terminal challenges, and quizzes with instant automated test validation.",
  },
  {
    question: "What are 1v1 Space Battles on CosmoDex?",
    answer:
      "1v1 Space Battles are competitive real-time coding matches where two players compete head-to-head in a timed format to solve coding problems and MCQ challenges.",
  },
  {
    question: "How does progression and ranking work?",
    answer:
      "Earn XP from solving lessons, winning battle matches, and maintaining daily streaks to level up and climb across 6 Cosmic League Ranks (Explorer to Celestial Master).",
  },
  {
    question: "Does CosmoDex support AI-powered code reviews?",
    answer:
      "Yes! CosmoDex includes AI-powered code analysis that evaluates code style, performance, edge cases, and provides actionable recommendations to improve your programming skills.",
  },
  {
    question: "How is CosmoDex different from LeetCode or HackerRank?",
    answer:
      "Unlike traditional problem sets, CosmoDex is student-focused and combines gamified level progression (XP, streaks, ranks) with real-time 1v1 Space Coding Battles and tangible rewards.",
  },
  {
    question: "Is CosmoDex a good alternative to Codédex and LeetCode for students?",
    answer:
      "Yes. CosmoDex offers interactive, beginner-friendly coding quests with XP and daily streaks like Codédex, but bridges the gap to technical interview readiness with real-time 1v1 coding battles, algorithmic challenges, and college hackathons.",
  },
  {
    question: "How do 1v1 coding battles compare to Clash of Code?",
    answer:
      "CosmoDex Space Battles offer head-to-head multiplayer coding duels and speed MCQ rounds. You match against peers by Elo rating, solve code challenges under pressure, pass automated test cases, and climb cosmic league ranks.",
  },
  {
    question: "Where can I find free coding practice sites to learn Python and Java?",
    answer:
      "CosmoDex is a top free coding practice platform for students. You can learn programming from scratch with interactive courses in Python, Java, SQL, and OOP, solve practice problems with instant automated feedback, and build a daily streak.",
  },
  {
    question: "What makes CosmoDex a fun coding game for students?",
    answer:
      "Unlike conventional coding websites, CosmoDex turns programming practice into a multiplayer coding game with XP progression, 6 Cosmic League ranks, and real-time 1v1 Space Battles where your code is your weapon.",
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative isolate overflow-hidden section-padding text-[#fffaff] !pt-14 sm:!pt-20 lg:!pt-24"
      style={{
        position: "relative",
        zIndex: 3,
        background: "rgba(5,5,8,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* FAQ structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Subtle Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(155,48,255,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header (Guapd Editorial Style - Clean Title) */}
        <header className="mb-12 text-center sm:mb-14">
          <h2
            id="faq-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              lineHeight: 1.15,
            }}
          >
            FAQ <span className="italic font-serif font-normal text-[#c084fc]">Answered</span>
          </h2>

          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base"
            style={{
              color: "rgba(240,230,255,0.5)",
              fontFamily: "var(--font-body), 'Fira Code', monospace",
            }}
          >
            Everything you need to know about learning, competing, leveling up, and growing with CosmoDex.
          </p>
        </header>

        {/* FAQ Line Item List (Guapd Grid Layout: Number - Question/Answer - Toggle Icon) */}
        <div className="flex flex-col border-b border-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            const questionId = `faq-question-${index}`;
            const formattedIndex = String(index + 1).padStart(2, "0");

            return (
              <div
                key={faq.question}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`group border-t border-white/10 py-6 sm:py-7 px-3 sm:px-5 transition-all duration-200 cursor-pointer ${
                  isOpen
                    ? "bg-white/[0.035]"
                    : "hover:bg-white/[0.02]"
                }`}
                style={{
                  borderRadius: "12px",
                }}
              >
                <div className="grid grid-cols-[40px_1fr_24px] sm:grid-cols-[56px_1fr_28px] items-baseline gap-3 sm:gap-4">
                  {/* Column 1: Index Counter (Serif Italic) */}
                  <span
                    className={`font-serif italic text-xl sm:text-2xl transition-colors duration-200 ${
                      isOpen ? "text-[#c084fc]" : "text-white/25 group-hover:text-white/45"
                    }`}
                  >
                    {formattedIndex}
                  </span>

                  {/* Column 2: Question & Slide-Down Answer */}
                  <div className="flex flex-col">
                    <h3 className="m-0 text-base sm:text-lg lg:text-xl font-bold tracking-tight">
                      <button
                        id={questionId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        className="w-full text-left outline-none transition-colors"
                        style={{
                          fontFamily: "var(--font-display), sans-serif",
                          color: isOpen ? "#ffffff" : "rgba(240,230,255,0.85)",
                        }}
                      >
                        {faq.question}
                      </button>
                    </h3>

                    {/* Expandable Answer */}
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3 sm:mt-4"
                          : "grid-rows-[0fr] opacity-0 mt-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{
                            color: "rgba(240,230,255,0.55)",
                            fontFamily: "var(--font-body), 'Fira Code', monospace",
                            margin: 0,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Toggle Icon (+ / -) */}
                  <div className="flex items-center justify-end self-center">
                    <span
                      aria-hidden="true"
                      className={`flex size-7 sm:size-8 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "bg-[#9b30ff] text-white shadow-[0_0_12px_rgba(155,48,255,0.6)]"
                          : "text-white/40 group-hover:text-white group-hover:bg-white/10"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={15} strokeWidth={2.5} />
                      ) : (
                        <Plus size={15} strokeWidth={2.5} />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;