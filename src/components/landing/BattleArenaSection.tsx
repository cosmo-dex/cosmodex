"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Challenge {
  id: string;
  num: string;
  title: string;
  description: string;
  initialCode: string[];
  solvedCode: string[];
  testCount: number;
}

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    num: "#042",
    title: "Two Sum Target",
    description: "Given a list of integers, return indices of the two numbers that add up to the target sum.",
    initialCode: [
      "# Your solution here",
      "def two_sum(nums, target):",
      "    seen = {}",
      "    for i, num in enumerate(nums):",
      "        diff = target - num",
      "        if diff in seen:",
      "            return [seen[diff], i]",
      "        seen[num] = i",
    ],
    solvedCode: [
      "# Optimized O(n) Hash Map Solution",
      "def two_sum(nums, target):",
      "    seen = {}",
      "    for i, num in enumerate(nums):",
      "        diff = target - num",
      "        if diff in seen:",
      "            return [seen[diff], i]",
      "        seen[num] = i",
    ],
    testCount: 5,
  },
  {
    id: "valid-palindrome",
    num: "#043",
    title: "Space Cipher Palindrome",
    description: "Verify whether a telemetry string reads the same forward and backward, ignoring non-alphanumeric characters.",
    initialCode: [
      "# Cosmic Telemetry Validator",
      "def is_palindrome(s: str) -> bool:",
      "    cleaned = ''.join(c.lower() for c in s if c.isalnum())",
      "    return cleaned == cleaned[::-1]",
    ],
    solvedCode: [
      "# Efficient Two-Pointer Validation",
      "def is_palindrome(s: str) -> bool:",
      "    cleaned = ''.join(c.lower() for c in s if c.isalnum())",
      "    return cleaned == cleaned[::-1]",
    ],
    testCount: 8,
  },
  {
    id: "binary-search",
    num: "#044",
    title: "Quantum Orbit Search",
    description: "Find the position of target satellite signal in a sorted orbital array in O(log n) logarithmic time.",
    initialCode: [
      "# Binary Orbit Search Algorithm",
      "def search_orbit(satellites, target):",
      "    low, high = 0, len(satellites) - 1",
      "    while low <= high:",
      "        mid = (low + high) // 2",
      "        if satellites[mid] == target:",
      "            return mid",
      "        elif satellites[mid] < target:",
      "            low = mid + 1",
      "        else:",
      "            high = mid - 1",
      "    return -1",
    ],
    solvedCode: [
      "# Optimized Logarithmic Search",
      "def search_orbit(satellites, target):",
      "    low, high = 0, len(satellites) - 1",
      "    while low <= high:",
      "        mid = (low + high) // 2",
      "        if satellites[mid] == target:",
      "            return mid",
      "        elif satellites[mid] < target:",
      "            low = mid + 1",
      "        else:",
      "            high = mid - 1",
      "    return -1",
    ],
    testCount: 6,
  },
];

const TICKER_MESSAGES = [
  "⚡ nova_coder just solved Test 4/5 (+50 ✦)",
  "🔥 stardev_x submitted solution in 1.2s",
  "✦ cyber_sam entered the arena",
  "⚡ nova_coder unlocked speed bonus (+100 ✦)",
  "🚀 142 coders competing live right now",
];

export default function BattleArenaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Current active challenge
  const [challengeIndex, setChallengeIndex] = useState(0);
  const currentChallenge = SAMPLE_CHALLENGES[challengeIndex];

  // Countdown timer state (seconds)
  const [secondsLeft, setSecondsLeft] = useState(272); // 4m 32s

  // Live typing simulator state
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isTestPassing, setIsTestPassing] = useState(false);
  const [passedCount, setPassedCount] = useState(0);

  // Dynamic Leaderboard state
  const [leaderboard, setLeaderboard] = useState([
    { rank: "01", name: "nova_coder", xp: 850, color: "#ff2d78" },
    { rank: "02", name: "stardev_x", xp: 720, color: "#9b30ff" },
    { rank: "03", name: "you", xp: 0, status: "solving...", color: "#c084fc" },
  ]);

  // Live ticker state
  const [tickerIndex, setTickerIndex] = useState(0);

  // Active event info from API
  const [liveEventTitle, setLiveEventTitle] = useState<string | null>(null);

  // 1. Fetch real ongoing event & top 3 leaderboard players
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, lbRes] = await Promise.allSettled([
          fetch("/api/events?status=ongoing"),
          fetch("/api/battle/leaderboard?mode=code"),
        ]);

        if (eventRes.status === "fulfilled" && eventRes.value.ok) {
          const data = await eventRes.value.json();
          if (data.events && data.events.length > 0) {
            setLiveEventTitle(data.events[0].title);
          }
        }

        if (lbRes.status === "fulfilled" && lbRes.value.ok) {
          const lbData = await lbRes.value.json();
          if (Array.isArray(lbData) && lbData.length >= 3) {
            const colors = ["#ff2d78", "#9b30ff", "#c084fc"];
            setLeaderboard([
              { rank: "01", name: lbData[0].username, xp: lbData[0].elo || 850, color: colors[0] },
              { rank: "02", name: lbData[1].username, xp: lbData[1].elo || 720, color: colors[1] },
              { rank: "03", name: lbData[2].username, xp: lbData[2].elo || 650, color: colors[2] },
            ]);
          }
        }
      } catch {
        // Silently fallback to sample data
      }
    }
    fetchData();
  }, []);

  // 2. Real-time Ticking Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 300; // Reset to 5 mins when countdown reaches zero
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 3. Live Typing Simulation Loop
  useEffect(() => {
    const codeLines = currentChallenge.solvedCode;
    if (currentLineIdx >= codeLines.length) {
      // Finished typing code -> Run simulated test suite
      if (!isTestPassing) {
        const timer = setTimeout(() => {
          setIsTestPassing(true);
          let count = 0;
          const testInterval = setInterval(() => {
            count++;
            setPassedCount(count);
            if (count >= currentChallenge.testCount) {
              clearInterval(testInterval);
              // Update leaderboard "you" row
              setLeaderboard((prev) =>
                prev.map((entry) =>
                  entry.name === "you"
                    ? { ...entry, xp: 920, status: "completed!" }
                    : entry
                )
              );
            }
          }, 300);
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }

    const currentFullLine = codeLines[currentLineIdx];
    const typingSpeed = currentFullLine.startsWith("#") ? 18 : 30;

    const timeout = setTimeout(() => {
      setTypedLines((prev) => {
        const updated = [...prev];
        if (!updated[currentLineIdx]) {
          updated[currentLineIdx] = "";
        }
        updated[currentLineIdx] = currentFullLine.slice(0, currentCharIdx + 1);
        return updated;
      });

      if (currentCharIdx + 1 < currentFullLine.length) {
        setCurrentCharIdx((prev) => prev + 1);
      } else {
        setCurrentLineIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentLineIdx, currentCharIdx, currentChallenge, isTestPassing]);

  // 4. Live Leaderboard & Ticker Animation
  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);

      // Randomly tweak XP score for nova_coder to simulate live action
      setLeaderboard((prev) =>
        prev.map((entry) => {
          if (entry.name === "nova_coder" && Math.random() > 0.6) {
            return { ...entry, xp: entry.xp + 10 };
          }
          return entry;
        })
      );
    }, 4500);

    return () => clearInterval(tickerTimer);
  }, []);

  return (
    <section
      id="battle-arena"
      className="section-padding"
      style={{
        position: "relative",
        zIndex: 3,
        background: "rgba(5,5,8,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {/* Radial tint */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(255,45,120,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-custom" ref={ref}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "96px",
            alignItems: "center",
          }}
          className="battle-grid"
        >
          {/* Left: content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="badge" style={{ marginBottom: "22px" }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor" />
              </svg>
              Speed Quiz Live • Code Arena Season 2 Soon
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 700,
                letterSpacing: "0.03em",
                lineHeight: 1.28,
                paddingTop: "6px",
                marginBottom: "20px",
                fontFamily: "var(--font-display), sans-serif",
              }}
            >
              <span style={{ color: "rgba(240,230,255,0.9)" }}>Put your skills</span>
              <br />
              <span style={{ color: "#ffffff" }}>to the test.</span>
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(240,230,255,0.48)",
                lineHeight: 1.7,
                marginBottom: "28px",
                maxWidth: "420px",
                fontFamily: "var(--font-body), 'Fira Code', monospace",
              }}
            >
              Compete in real-time speed quiz duels, race against global coders, and climb the global leaderboard.
            </p>

            {/* Interactive Challenge Switcher Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "32px",
                flexWrap: "wrap",
              }}
            >
              {SAMPLE_CHALLENGES.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setChallengeIndex(idx);
                    setTypedLines([]);
                    setCurrentLineIdx(0);
                    setCurrentCharIdx(0);
                    setIsTestPassing(false);
                    setPassedCount(0);
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    background:
                      challengeIndex === idx
                        ? "rgba(255,45,120,0.18)"
                        : "rgba(255,255,255,0.03)",
                    color: challengeIndex === idx ? "#ff2d78" : "rgba(240,230,255,0.6)",
                    border:
                      challengeIndex === idx
                        ? "1px solid rgba(255,45,120,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {ch.num} {ch.title}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link
                href="/battle"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ff2d78 0%, #9b30ff 100%)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 0 20px rgba(255,45,120,0.3)",
                  transition: "all 0.25s ease",
                }}
              >
                <span>Enter Live Battle</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Right: arena visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(155,48,255,0.1)",
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "#ff2d78",
                      boxShadow: "0 0 10px #ff2d78",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "rgba(240,230,255,0.75)",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {liveEventTitle ? liveEventTitle.toUpperCase() : `CHALLENGE ${currentChallenge.num} — ACTIVE`}
                  </span>
                </div>

                {/* Real-time Ticking Countdown Timer */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#ff2d78" strokeWidth="1.5" />
                    <path d="M8 4V8L10.5 10.5" stroke="#ff2d78" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#ff2d78",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {formatTime(secondsLeft)} left
                  </span>
                </div>
              </div>

              {/* Challenge content */}
              <div style={{ padding: "24px 28px 28px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(240,230,255,0.4)",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    PROBLEM // {currentChallenge.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(192,132,252,0.8)",
                      background: "rgba(192,132,252,0.1)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    }}
                  >
                    {currentChallenge.testCount} Test Cases
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(240,230,255,0.82)",
                    lineHeight: 1.6,
                    marginBottom: "18px",
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  {currentChallenge.description}
                </p>

                {/* Animated Code Terminal */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    border: "1px solid rgba(155,48,255,0.25)",
                    borderLeft: "3px solid #9b30ff",
                    borderRadius: "10px",
                    padding: "16px 18px",
                    fontFamily: "var(--font-mono), 'Fira Code', monospace",
                    fontSize: "12.5px",
                    lineHeight: 1.8,
                    marginBottom: "20px",
                    minHeight: "160px",
                    position: "relative",
                  }}
                >
                  {typedLines.length === 0 ? (
                    <div style={{ color: "rgba(240,230,255,0.3)" }}>
                      # Initializing live code editor...
                    </div>
                  ) : (
                    typedLines.map((line, lIdx) => {
                      const isComment = line.trim().startsWith("#");
                      const isKeyword = line.includes("def ") || line.includes("return") || line.includes("for ") || line.includes("if ");
                      return (
                        <div key={lIdx} style={{ display: "flex", gap: "14px" }}>
                          <span
                            style={{
                              color: "rgba(240,230,255,0.2)",
                              userSelect: "none",
                              fontSize: "11px",
                              width: "16px",
                              textAlign: "right",
                            }}
                          >
                            {lIdx + 1}
                          </span>
                          <span
                            style={{
                              color: isComment
                                ? "rgba(240,230,255,0.32)"
                                : isKeyword
                                ? "#c084fc"
                                : "rgba(240,230,255,0.85)",
                            }}
                          >
                            {line}
                            {lIdx === currentLineIdx && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "7px",
                                  height: "14px",
                                  background: "#ff2d78",
                                  marginLeft: "2px",
                                  animation: "cdx-blink 1s step-end infinite",
                                  verticalAlign: "middle",
                                }}
                              />
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}

                  {/* Simulated Test Status Banner */}
                  {isTestPassing && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: "12px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background:
                          passedCount >= currentChallenge.testCount
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(255,45,120,0.12)",
                        border:
                          passedCount >= currentChallenge.testCount
                            ? "1px solid rgba(34,197,94,0.3)"
                            : "1px solid rgba(255,45,120,0.3)",
                        color:
                          passedCount >= currentChallenge.testCount
                            ? "#4ade80"
                            : "#ff2d78",
                        fontSize: "11.5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {passedCount >= currentChallenge.testCount
                          ? `✓ All ${currentChallenge.testCount}/${currentChallenge.testCount} Test Cases Passed!`
                          : `⚡ Executing test suite... (${passedCount}/${currentChallenge.testCount})`}
                      </span>
                      {passedCount >= currentChallenge.testCount && (
                        <span style={{ fontWeight: 700 }}>Passed</span>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Leaderboard mini */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background:
                          entry.name === "you"
                            ? "rgba(192,132,252,0.08)"
                            : "rgba(255,255,255,0.02)",
                        border:
                          entry.name === "you"
                            ? "1px solid rgba(192,132,252,0.25)"
                            : "1px solid rgba(255,255,255,0.04)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: entry.color,
                          fontFamily: "var(--font-mono), 'Fira Code', monospace",
                          minWidth: "20px",
                        }}
                      >
                        {entry.rank}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          color:
                            entry.name === "you"
                              ? "rgba(240,230,255,0.95)"
                              : "rgba(240,230,255,0.6)",
                          fontFamily: "var(--font-body), 'Fira Code', monospace",
                          fontWeight: entry.name === "you" ? 600 : 400,
                        }}
                      >
                        {entry.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          color: entry.color,
                          fontFamily: "var(--font-mono), 'Fira Code', monospace",
                          fontWeight: 600,
                        }}
                      >
                        #{entry.rank}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Live Activity Ticker Pill */}
                <div
                  style={{
                    marginTop: "16px",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 6px #22c55e",
                    }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={tickerIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: "11.5px",
                        color: "rgba(240,230,255,0.55)",
                        fontFamily: "var(--font-mono), 'Fira Code', monospace",
                      }}
                    >
                      {TICKER_MESSAGES[tickerIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .battle-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @keyframes cdx-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}

