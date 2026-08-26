"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    question: "What is CosmoDex?",
    answer:
      "CosmoDex is a coding learning platform that helps students and developers learn programming through interactive courses, coding practice, Coding Battles, and skill-based challenges.",
  },
  {
    question: "How does CosmoDex help students learn coding?",
    answer:
      "CosmoDex helps students learn coding by combining structured programming courses with hands-on practice and challenges that reinforce technical concepts.",
  },
  {
    question: "Is CosmoDex free to use?",
    answer:
      "CosmoDex provides a free way to explore its core learning experience, while some features or courses may depend on the plan selected.",
  },
  {
    question: "How does coding practice work on CosmoDex?",
    answer:
      "Coding practice on CosmoDex gives learners opportunities to apply programming concepts through exercises and problem-solving challenges.",
  },
  {
    question: "What are Coding Battles on CosmoDex?",
    answer:
      "Coding Battles are competitive programming challenges where learners solve coding problems in a timed format to practice problem-solving and technical skills.",
  },
  {
    question: "Does CosmoDex use AI for coding feedback?",
    answer:
      "Yes. CosmoDex Pro includes AI-powered code review that provides automated feedback on code and helps learners improve their programming skills.",
  },
  {
    question: "What is AI-powered code review on CosmoDex?",
    answer:
      "AI-powered code review is a CosmoDex Pro feature that analyzes a learner’s code and provides automated programming feedback for improvement.",
  },
  {
    question: "Can CosmoDex help me improve my programming skills?",
    answer:
      "CosmoDex can help learners improve programming skills through courses, repeated coding practice, and challenges that encourage practical problem-solving.",
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
      className="relative isolate overflow-hidden bg-[#080612] px-4 py-20 text-[#fffaff] sm:px-6 lg:px-8 lg:py-28"
      style={{
        position: "relative",
        zIndex: 3,
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

      {/* Background grid and glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px), radial-gradient(circle at 50% 0%, rgba(81,31,142,0.28), transparent 52%), radial-gradient(circle at 100% 70%, rgba(168,43,255,0.22), transparent 42%)",
          backgroundSize: "48px 48px, 48px 48px, auto, auto",
        }}
      />

      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#ff3ca6]">
            FAQ
          </p>

          <h2
            id="faq-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-[#fff8f0] sm:text-4xl lg:text-5xl"
          >
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-6 text-[#aaa1bb] sm:text-base">
            Everything you need to know about learning, competing, and growing
            with CosmoDex.
          </p>
        </header>

        {/* FAQ accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            const questionId = `faq-question-${index}`;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? "border-[#ff2b9d]/70 bg-[#24103d]/80 shadow-[0_0_28px_rgba(255,43,157,0.16)]"
                    : "border-[#32175b]/80 bg-[#120d24]/90 hover:border-[#a82bff]/65"
                }`}
                style={{
                  borderRadius: "0.9rem",
                }}
              >
                <h3 className="m-0 text-base font-normal">
                  <button
                    id={questionId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="flex min-h-16 w-full items-center justify-between gap-5 px-5 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ff3ca6] focus-visible:ring-inset sm:px-6"
                  >
                    <span className="text-sm font-medium leading-6 text-[#fff8f0] sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "border-[#ff3ca6]/70 bg-[#ff3ca6] text-[#080612]"
                          : "border-[#9e00f6]/60 text-[#ff3ca6]"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={16} strokeWidth={2.5} />
                      ) : (
                        <Plus size={16} strokeWidth={2.5} />
                      )}
                    </span>
                  </button>
                </h3>

                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-[#aaa1bb] sm:px-6 sm:pb-6">
                      {faq.answer}
                    </p>
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