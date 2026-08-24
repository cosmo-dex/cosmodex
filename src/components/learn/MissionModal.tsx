"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Rocket,
  Star,
  Terminal,
  Sparkles,
  Trophy,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  Lock,
  CheckCircle2,
  HelpCircle,
  GripVertical,
  Timer,
  Clock,
  Unlock,
  Tag,
  FileCode2,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Copy,
  Check,
  Building2,
  Cpu,
  Layers,
  Code2,
  Share2,
  History,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import { Chapter, Exercise } from "./pythonData";
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="text-cyan-300 font-bold drop-shadow-sm">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#020108] border border-cyan-500/35 font-mono text-cyan-300 text-[11px] inline-block my-0.5 shadow-inner"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function TheoryParagraph({ text }: { text: string }) {
  if (text.startsWith("**Step")) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#03010c] border border-cyan-500/30 space-y-1.5 my-2.5 shadow-inner font-mono text-xs sm:text-sm leading-relaxed text-white/95">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
          <span>Implementation Step</span>
        </div>
        <div>{parseInlineMarkdown(text)}</div>
      </div>
    );
  }

  if (text.toLowerCase().startsWith("example:")) {
    return (
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-1.5 my-3 font-mono text-xs sm:text-sm leading-relaxed text-purple-100 shadow-inner">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
          <Code2 size={14} className="text-purple-400 shrink-0" />
          <span>Code Example</span>
        </div>
        <div>{parseInlineMarkdown(text)}</div>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs sm:text-sm leading-relaxed text-white/85 my-2">
      {parseInlineMarkdown(text)}
    </div>
  );
}

function safeEvalExpr(
  expr: string,
  variables: Record<string, unknown>
): { result: unknown; isError: boolean; errorMsg?: string } {
  let sanitized = expr
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null");

  for (const [vName, vVal] of Object.entries(variables)) {
    if (["__proto__", "constructor", "prototype"].includes(vName)) continue;
    sanitized = sanitized.replace(
      new RegExp(`\\b${vName}\\b`, "g"),
      JSON.stringify(vVal)
    );
  }

  const unparsedTokens = sanitized.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g);
  if (unparsedTokens) {
    for (const token of unparsedTokens) {
      if (
        ![
          "true",
          "false",
          "null",
          "undefined",
          "Math",
          "String",
          "Number",
          "Boolean",
        ].includes(token)
      ) {
        return {
          result: null,
          isError: true,
          errorMsg: `NameError: name '${token}' is not defined`,
        };
      }
    }
  }

  try {
    const fn = new Function(`"use strict"; return (${sanitized});`);
    return { result: fn(), isError: false };
  } catch {
    return {
      result: null,
      isError: true,
      errorMsg: "SyntaxError: invalid syntax",
    };
  }
}

function parsePythonCode(inputCode: string): { output: string; isError: boolean } {
  const lines = inputCode.split("\n");
  const outputLogs: string[] = [];
  const variables: Record<string, unknown> = {};
  let executableCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines & comments
    if (!line || line.startsWith("#")) continue;

    executableCount++;
    const cleanLine = line.replace(/;$/, "");

    // Handle print(...)
    const printMatch = cleanLine.match(/^print\s*\((.*)\)$/);
    if (printMatch) {
      const content = printMatch[1].trim();

      if (!content) {
        outputLogs.push("");
        continue;
      }

      // Check for quote mismatches inside print(...)
      const singleQ = (content.match(/'/g) || []).length;
      const doubleQ = (content.match(/"/g) || []).length;
      if (singleQ % 2 !== 0 || doubleQ % 2 !== 0) {
        return {
          output: `  File "main.py", line ${i + 1}\n    ${rawLine}\nSyntaxError: EOL while scanning string literal`,
          isError: true,
        };
      }

      // Parse comma-separated arguments inside print(...)
      const args = content.split(/,(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/);
      const evaluatedArgs: string[] = [];
      let hasError = false;
      let errorOutput = "";

      for (const rawArg of args) {
        const arg = rawArg.trim();
        if (
          (arg.startsWith('"') && arg.endsWith('"')) ||
          (arg.startsWith("'") && arg.endsWith("'"))
        ) {
          evaluatedArgs.push(arg.slice(1, -1));
        } else if (!isNaN(Number(arg))) {
          evaluatedArgs.push(arg);
        } else if (
          arg in variables &&
          !["__proto__", "constructor", "prototype"].includes(arg)
        ) {
          evaluatedArgs.push(String(variables[arg]));
        } else {
          const evalRes = safeEvalExpr(arg, variables);
          if (evalRes.isError) {
            hasError = true;
            errorOutput = `  File "main.py", line ${i + 1}\n    ${rawLine}\n${evalRes.errorMsg}`;
            break;
          }
          evaluatedArgs.push(String(evalRes.result));
        }
      }

      if (hasError) {
        return { output: errorOutput, isError: true };
      }

      outputLogs.push(evaluatedArgs.join(" "));
      continue;
    }

    // Variable assignment (e.g. x = 10, name = "Cosmo")
    const assignMatch = cleanLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const varValRaw = assignMatch[2].trim();

      if (
        (varValRaw.startsWith('"') && varValRaw.endsWith('"')) ||
        (varValRaw.startsWith("'") && varValRaw.endsWith("'"))
      ) {
        variables[varName] = varValRaw.slice(1, -1);
        continue;
      }

      if (!isNaN(Number(varValRaw))) {
        variables[varName] = Number(varValRaw);
        continue;
      }

      if (varValRaw === "True") {
        variables[varName] = true;
        continue;
      }
      if (varValRaw === "False") {
        variables[varName] = false;
        continue;
      }

      const evalRes = safeEvalExpr(varValRaw, variables);
      if (evalRes.isError) {
        return {
          output: `  File "main.py", line ${i + 1}\n    ${rawLine}\n${evalRes.errorMsg}`,
          isError: true,
        };
      }
      variables[varName] = evalRes.result;
      continue;
    }

    // Keyword statements (if, elif, else, for, while, def, import, from, return)
    if (/^(if|elif|else|for|while|def|import|from|class|return)\b/.test(cleanLine)) {
      if (
        !cleanLine.endsWith(":") &&
        !cleanLine.startsWith("import") &&
        !cleanLine.startsWith("from")
      ) {
        return {
          output: `  File "main.py", line ${i + 1}\n    ${rawLine}\nSyntaxError: expected ':'`,
          isError: true,
        };
      }
      continue;
    }

    // Arbitrary non-Python text
    return {
      output: `  File "main.py", line ${i + 1}\n    ${rawLine}\nSyntaxError: invalid syntax`,
      isError: true,
    };
  }

  if (executableCount === 0) {
    return {
      output:
        "Error: No Python code found to execute. Please write your Python solution code before submitting!",
      isError: true,
    };
  }

  if (outputLogs.length > 0) {
    return {
      output: outputLogs.join("\n") + "\n\n[Process finished with exit code 0]",
      isError: false,
    };
  }

  return {
    output: "Code executed successfully.\n[Process finished with exit code 0]",
    isError: false,
  };
}

/**
 * Dynamically computes target output for any exercise.
 */
function getExerciseTargetOutput(exercise: Exercise): string {
  if (exercise.initialCode) {
    const res = parsePythonCode(exercise.initialCode);
    if (!res.isError && res.output) {
      const clean = res.output.split("\n\n[Process finished")[0].trim();
      if (clean) return clean;
    }
  }

  const singleMatch = exercise.instruction?.match(/'([^']+)'/);
  if (singleMatch) return singleMatch[1];

  const doubleMatch = exercise.instruction?.match(/"([^"]+)"/);
  if (doubleMatch) return doubleMatch[1];

  return `Expected stdout for ${exercise.title}`;
}

/**
 * Dynamically derives topics list for any exercise.
 */
function getExerciseTopics(chapter: Chapter, exercise: Exercise): string[] {
  const topics: string[] = ["Python 3.11"];
  const text = (
    chapter.title +
    " " +
    exercise.title +
    " " +
    (exercise.instruction || "")
  ).toLowerCase();

  if (text.includes("print") || text.includes("hello") || text.includes("output")) {
    topics.push("print() Output", "Strings");
  }
  if (
    text.includes("var") ||
    text.includes("bmi") ||
    text.includes("age") ||
    text.includes("assign")
  ) {
    topics.push("Variables", "Data Types");
  }
  if (
    text.includes("if") ||
    text.includes("else") ||
    text.includes("flow") ||
    text.includes("condition")
  ) {
    topics.push("Control Flow", "Booleans");
  }
  if (
    text.includes("for") ||
    text.includes("while") ||
    text.includes("loop") ||
    text.includes("range")
  ) {
    topics.push("For Loops", "range() Function");
  }
  if (text.includes("list") || text.includes("array") || text.includes("append")) {
    topics.push("Lists & Indexing");
  }
  if (text.includes("def") || text.includes("func") || text.includes("return")) {
    topics.push("Functions & Parameters");
  }

  if (topics.length < 3) {
    topics.push("Basic Syntax", "Console Output");
  }

  return Array.from(new Set(topics));
}

/**
 * Returns 3 progressive hints for the given exercise.
 */
function getExerciseHints(exercise: Exercise): string[] {
  if (exercise.hints && exercise.hints.length >= 2) {
    return exercise.hints.slice(0, 3);
  }

  const instr =
    exercise.instruction || "Solve the mission using standard Python 3.11 syntax.";
  const code = exercise.initialCode || "";

  const hint1 = `Goal Overview: ${instr}`;

  let hint2 =
    "Syntax Tip: Double check string quote matches (' or \"), closing parentheses, and exact capitalization.";
  if (code.includes("print(")) {
    hint2 =
      "Output Helper: Make sure the string passed inside print(...) exactly matches the requested prompt.";
  } else if (code.includes("=")) {
    hint2 =
      "Variable Assignment: Define your variable on the left of '=' and assign the required string/number on the right.";
  } else if (code.includes("if ") || code.includes("else:")) {
    hint2 =
      "Control Flow: Ensure your condition evaluates properly and remember the colon ':' at the end of the line.";
  }

  const hint3 =
    "Execution Check: Click 'RUN CODE' to verify the terminal output before clicking 'SUBMIT MISSION'.";

  return [hint1, hint2, hint3];
}

interface MissionModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  exercise: Exercise | null;
  onClose: () => void;
  onCompleteExercise?: (chapterId: string, exerciseId: string) => void;
  onNextMission?: () => void;
}

export default function MissionModal({
  isOpen,
  chapter,
  exercise,
  onClose,
  onCompleteExercise,
  onNextMission,
}: MissionModalProps) {
  const [code, setCode] = useState<string>(
    '# Write your Python code below\nprint("Hello, Python Galaxy!")'
  );
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRunCode, setHasRunCode] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Left Sidebar Tab Selection ('problem' | 'hints' | 'editorial' | 'submissions')
  const [leftTab, setLeftTab] = useState<"problem" | "hints" | "editorial" | "submissions">("problem");

  // GFG problem metadata states
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Editor Stopwatch Timer
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Custom Input Toggle & Value
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>("");

  // Accordion Open States (GFG-style accordions)
  const [accordionStates, setAccordionStates] = useState<{
    complexities: boolean;
    topicTags: boolean;
    companyTags: boolean;
    constraints: boolean;
  }>({
    complexities: true,
    topicTags: true,
    companyTags: true,
    constraints: true,
  });

  // Track revealed hints count (0 to 3)
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);

  // Time Cooldown timer in seconds for unlocking subsequent hints
  const [hintCooldownSeconds, setHintCooldownSeconds] = useState<number>(0);

  // Accordion open states for Hints
  const [openHintAccordions, setOpenHintAccordions] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  // Default Sidebar Width percentage set to 35% (Giving 65% to Code Editor area!)
  const [sidebarWidthPercent, setSidebarWidthPercent] = useState<number>(35);
  const [isDraggingDivider, setIsDraggingDivider] = useState<boolean>(false);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);
  const terminalOutputRef = useRef<HTMLDivElement>(null);

  const confettiFiredRef = useRef(false);

  // Stopwatch Timer Ticking Effect
  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Pause Lenis global smooth scroll while MissionModal is open, resume when closed
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.__lenis) {
      window.__lenis.stop();
      return () => {
        window.__lenis?.start();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (exercise) {
      setCode(
        exercise.initialCode ||
        `# Exercise: ${exercise.title}\n# Write your Python code below\n\nprint("Hello, ${exercise.title}!")`
      );
      setOutput("");
      setIsError(false);
      setHasRunCode(false);
      setIsCompleted(false);
      setShowCelebrationModal(false);
      setRevealedHintsCount(0);
      setHintCooldownSeconds(0);
      setLeftTab("problem");
      setIsTimerActive(false);
      setTimerSeconds(0);
      setShowCustomInput(false);
      setCustomInputVal("");
      setIsBookmarked(false);
      setOpenHintAccordions({ 1: false, 2: false, 3: false });
      confettiFiredRef.current = false;
    }
  }, [exercise]);

  // Auto-scroll to Terminal Output whenever new output is emitted
  useEffect(() => {
    if (output && terminalOutputRef.current) {
      terminalOutputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [output]);

  // Live Cooldown Timer interval
  useEffect(() => {
    if (hintCooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setHintCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [hintCooldownSeconds]);

  // Handle Drag Resizing of Sidebar (Left/Right Drag)
  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!workspaceContainerRef.current) return;
      const rect = workspaceContainerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      let newPercent = (offsetX / rect.width) * 100;

      // Clamp sidebar width between 20% and 60%
      if (newPercent < 20) newPercent = 20;
      if (newPercent > 60) newPercent = 60;

      setSidebarWidthPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      window.dispatchEvent(new Event("resize"));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Fire multi-burst confetti when celebration overlay appears
  useEffect(() => {
    if (showCelebrationModal && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          origin: { y: 0.5 },
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [showCelebrationModal]);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("Executing script against test cases...");
    setIsError(false);

    setTimeout(() => {
      setIsRunning(false);
      const res = parsePythonCode(code);
      if (res.isError) {
        setOutput(res.output);
        setIsError(true);
      } else {
        const cleanUserOutput = res.output.split("\n\n[Process finished")[0].trim();
        const expected = targetOutput.trim();
        const isMatch =
          cleanUserOutput === expected ||
          cleanUserOutput.toLowerCase() === expected.toLowerCase() ||
          cleanUserOutput.includes(expected);

        const testCaseSummary = `=== CLIENT-SIDE TEST SIMULATION (0 SERVER COST) ===\n` +
          `[Test Case 1]: ${isMatch ? "PASSED ✓" : "EXECUTED"}\n` +
          `-----------------------------------\n` +
          `Expected Output:\n${expected}\n\n` +
          `Your Output:\n${cleanUserOutput}\n\n` +
          `[Result]: ${isMatch ? "Correct Output Match! Ready for submission." : "Execution finished with exit code 0"}`;

        setOutput(testCaseSummary);
        setIsError(false);
      }
      setHasRunCode(true);
    }, 500);
  };

  const handleSubmit = () => {
    if (!hasRunCode) {
      setOutput(
        "Error: Please click 'COMPILE & RUN' to execute and test your code before submitting!"
      );
      setIsError(true);
      return;
    }

    const res = parsePythonCode(code);
    if (res.isError) {
      setOutput(res.output);
      setIsError(true);
      return;
    }

    setIsCompleted(true);
    setShowCelebrationModal(true);
    if (chapter && exercise && onCompleteExercise) {
      onCompleteExercise(chapter.id, exercise.id);
    }
  };

  const handleRevealHint = (hintNum: number) => {
    setRevealedHintsCount(hintNum);
    setOpenHintAccordions((prev) => ({ ...prev, [hintNum]: true }));
    if (hintNum === 1) {
      setHintCooldownSeconds(30);
    } else if (hintNum === 2) {
      setHintCooldownSeconds(45);
    }
  };

  const toggleHintAccordion = (hintNum: number) => {
    setOpenHintAccordions((prev) => ({ ...prev, [hintNum]: !prev[hintNum] }));
  };

  if (!isOpen || !chapter || !exercise) return null;

  const hintsList = getExerciseHints(exercise);
  const targetOutput = getExerciseTargetOutput(exercise);
  const topicList = getExerciseTopics(chapter, exercise);

  const defaultExamples = exercise.exampleBoxes || [
    {
      input: "main.py",
      output: targetOutput,
      explanation: "Execute your Python script in main.py to produce stdout matching the expected target output.",
    },
  ];

  const constraintsList = exercise.constraints || [
    "0 <= len(stdout) <= 500 characters",
    "Time Limit: 1.0 sec per test case",
    "Memory Limit: 256 MB",
    "Language: Python 3.11",
  ];

  const expectedComplexity = exercise.expectedComplexity || {
    time: "O(1)",
    space: "O(1)",
  };

  const companyTags = exercise.companyTags || [
    "SpaceX",
    "NASA",
    "Google",
    "Morgan Stanley",
    "Samsung",
    "Cosmodex Arena",
  ];

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetCode = () => {
    setCode(
      exercise.initialCode ||
      `# Exercise: ${exercise.title}\n# Write your Python code below\n\nprint("Hello, ${exercise.title}!")`
    );
    setHasRunCode(false);
    setOutput("");
    setIsError(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 bg-black/95 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-screen h-screen bg-[#070318] border-0 rounded-none overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Top Header Bar */}
          <div className="grid grid-cols-12 items-center px-4 sm:px-6 py-2.5 border-b border-white/10 bg-[#0a0622] shrink-0 gap-2 relative z-20">
            {/* Left Column: Back Button */}
            <div className="col-span-3 flex items-center justify-start">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm group"
                title="Back to Galaxy Map"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
                <span className="hidden sm:inline">Back to Galaxy</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>

            {/* Center Column: Station Title Badge */}
            <div className="col-span-6 flex items-center justify-center gap-2.5 sm:gap-3 min-w-0 text-center">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-wider shrink-0 whitespace-nowrap">
                {chapter.stationNumber}
              </span>
              <h2 className="text-xs sm:text-sm md:text-base font-mono font-bold text-white uppercase tracking-wider truncate">
                {chapter.title} — <span className="text-[#E873C3]">{exercise.title}</span>
              </h2>
            </div>

            {/* Right Column: Theory Link & Close Button */}
            <div className="col-span-3 flex items-center justify-end gap-2.5 shrink-0">
              {isCompleted && !showCelebrationModal && (
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm animate-pulse"
                  title="View Celebration Reward"
                >
                  <Trophy size={14} className="text-amber-400" />
                  <span className="hidden lg:inline">View Reward</span>
                </button>
              )}

              {chapter.theoryLessonId && (
                <Link
                  href={`/learn/py-1/theory/${chapter.theoryLessonId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                  title="Read Chapter Theory"
                >
                  <BookOpen size={14} />
                  <span className="hidden md:inline">Read Theory</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Close Workspace"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── EXPANSIVE IDE WORKSPACE ── */}
          <div className="relative flex-1 overflow-hidden min-h-0">
            <div
              ref={workspaceContainerRef}
              className={`flex flex-col lg:flex-row h-full overflow-hidden min-h-0 ${isDraggingDivider ? "select-none cursor-col-resize" : ""
                }`}
            >
              {/* Left Column: Problem Details & GFG Navigation Tabs */}
              <div
                style={{
                  width:
                    typeof window !== "undefined" && window.innerWidth >= 1024
                      ? `${sidebarWidthPercent}%`
                      : "100%",
                }}
                className="bg-[#08041c] flex flex-col h-full overflow-hidden shrink-0 border-r border-white/10"
              >
                {/* GFG-Style Top Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#050214] px-3 py-2 gap-1 shrink-0 overflow-x-auto custom-sidebar-scrollbar">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setLeftTab("problem")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${leftTab === "problem"
                          ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <Code2 size={14} className="text-emerald-400" />
                      <span>Problem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeftTab("hints")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${leftTab === "hints"
                          ? "bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <Lightbulb size={14} className={revealedHintsCount > 0 ? "text-amber-400" : ""} />
                      <span>Free Hints</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-200 rounded-full font-bold">
                        {revealedHintsCount}/3
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeftTab("editorial")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${leftTab === "editorial"
                          ? "bg-purple-950/70 text-purple-300 border border-purple-500/50 shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <BookOpen size={14} className="text-purple-400" />
                      <span>Editorial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeftTab("submissions")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${leftTab === "submissions"
                          ? "bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <History size={14} className="text-cyan-400" />
                      <span>Submissions</span>
                    </button>
                  </div>
                </div>

                {/* Left Column Scrollable Content */}
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-sidebar-scrollbar min-h-0 overscroll-contain"
                >
                  {leftTab === "problem" && (
                    <>
                      {/* 1. Problem Title Header (GFG Style) */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h1 className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide">
                            {exercise.numberLabel}: {exercise.title}
                          </h1>
                          <button
                            type="button"
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${isBookmarked
                                ? "bg-amber-400/20 border-amber-400 text-amber-300"
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                              }`}
                            title={isBookmarked ? "Bookmarked" : "Bookmark Problem"}
                          >
                            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                          </button>
                        </div>

                        {/* GFG Problem Metadata Stats Bar */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-0.5">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
                            Difficulty: {exercise.difficulty || "Easy"}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold text-[11px]">
                            Accuracy: {exercise.accuracy || "94.8%"}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-purple-950/90 border border-purple-500/40 text-purple-300 font-bold text-[11px]">
                            Submissions: {exercise.submissionsCount || "14.8K+"}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-amber-950/90 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                            <Star size={12} className="fill-amber-400" />
                            +{chapter.xpValue} XP
                          </span>
                        </div>
                      </div>

                      {/* 2. Problem Statement Description */}
                      <div className="text-xs sm:text-sm font-mono text-white/90 leading-relaxed space-y-2 border-t border-white/10 pt-4">
                        <p>{exercise.instruction || chapter.description}</p>
                        <p className="text-white/60 text-xs italic">
                          Write your Python code in <span className="text-cyan-300 font-bold">main.py</span> and click{" "}
                          <span className="text-emerald-400 font-bold">COMPILE & RUN</span> to test stdout.
                        </p>
                      </div>

                      {/* 3. GFG Structured Example Boxes */}
                      <div className="space-y-3 pt-1">
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Terminal size={14} className="text-emerald-400" />
                          Examples:
                        </h3>

                        {defaultExamples.map((exBox, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#03010b] border border-white/12 font-mono text-xs text-white/85 space-y-2.5 shadow-inner"
                          >
                            <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider border-b border-white/5 pb-1">
                              Example {idx + 1}:
                            </div>
                            <div className="space-y-1">
                              <div className="text-cyan-400 font-bold text-xs">Input:</div>
                              <pre className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-200 font-mono text-xs whitespace-pre-wrap">
                                {exBox.input}
                              </pre>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-400 font-bold text-xs">Output:</div>
                              <pre className="p-2 rounded-lg bg-white/5 border border-white/10 text-emerald-300 font-mono text-xs whitespace-pre-wrap">
                                {exBox.output}
                              </pre>
                            </div>
                            {exBox.explanation && (
                              <div className="text-white/60 text-[11px] pt-1.5 border-t border-white/5 leading-relaxed">
                                <span className="text-amber-300 font-bold">Explanation:</span> {exBox.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 4. GFG Constraints Section */}
                      <div className="rounded-2xl bg-[#040212] border border-white/10 p-4 space-y-2 font-mono text-xs">
                        <div
                          onClick={() =>
                            setAccordionStates((prev) => ({ ...prev, constraints: !prev.constraints }))
                          }
                          className="flex items-center justify-between font-bold text-white uppercase tracking-wider cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-2">
                            <Layers size={14} className="text-amber-400" />
                            Constraints:
                          </span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${accordionStates.constraints ? "rotate-180" : ""}`}
                          />
                        </div>

                        {accordionStates.constraints && (
                          <ul className="space-y-1 text-white/70 text-xs pt-1 list-disc list-inside">
                            {constraintsList.map((cItem, cIdx) => (
                              <li key={cIdx}>{cItem}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* 5. GFG Expected Complexities Section */}
                      <div className="rounded-2xl bg-[#040212] border border-white/10 p-4 space-y-2 font-mono text-xs">
                        <div
                          onClick={() =>
                            setAccordionStates((prev) => ({ ...prev, complexities: !prev.complexities }))
                          }
                          className="flex items-center justify-between font-bold text-cyan-300 uppercase tracking-wider cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-2">
                            <Cpu size={14} className="text-cyan-400" />
                            Expected Complexities:
                          </span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${accordionStates.complexities ? "rotate-180" : ""}`}
                          />
                        </div>

                        {accordionStates.complexities && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                              <span className="text-white/50 text-[10px] block uppercase">Time Complexity</span>
                              <span className="font-bold text-cyan-300">{expectedComplexity.time}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
                              <span className="text-white/50 text-[10px] block uppercase">Auxiliary Space</span>
                              <span className="font-bold text-purple-300">{expectedComplexity.space}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. GFG Company Tags Section */}
                      <div className="rounded-2xl bg-[#040212] border border-white/10 p-4 space-y-2 font-mono text-xs">
                        <div
                          onClick={() =>
                            setAccordionStates((prev) => ({ ...prev, companyTags: !prev.companyTags }))
                          }
                          className="flex items-center justify-between font-bold text-purple-300 uppercase tracking-wider cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-2">
                            <Building2 size={14} className="text-purple-400" />
                            Company &amp; Cosmic Tags:
                          </span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${accordionStates.companyTags ? "rotate-180" : ""}`}
                          />
                        </div>

                        {accordionStates.companyTags && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {companyTags.map((cTag, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] font-bold"
                              >
                                {cTag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 7. GFG Topic Tags Section */}
                      <div className="rounded-2xl bg-[#040212] border border-white/10 p-4 space-y-2 font-mono text-xs">
                        <div
                          onClick={() =>
                            setAccordionStates((prev) => ({ ...prev, topicTags: !prev.topicTags }))
                          }
                          className="flex items-center justify-between font-bold text-emerald-300 uppercase tracking-wider cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-2">
                            <Tag size={14} className="text-emerald-400" />
                            Topic Tags:
                          </span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${accordionStates.topicTags ? "rotate-180" : ""}`}
                          />
                        </div>

                        {accordionStates.topicTags && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {topicList.map((tp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px]"
                              >
                                {tp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {leftTab === "hints" && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-white/10">
                        <div>
                          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                            <Lightbulb size={16} className="text-amber-400" />
                            Progressive Hints (3 Free)
                          </h3>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            Attempt problem &amp; wait for timers to unlock hints.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/40">
                          {revealedHintsCount}/3 Unlocked
                        </span>
                      </div>

                      <div className="space-y-3 pt-1">
                        {hintsList.map((hintText, index) => {
                          const hintNum = index + 1;
                          const isRevealed = revealedHintsCount >= hintNum;
                          const canReveal = revealedHintsCount === hintNum - 1;

                          const isCooldownActive = canReveal && hintNum > 1 && hintCooldownSeconds > 0;
                          const needsAttemptFirst = canReveal && hintNum > 1 && !hasRunCode;
                          const isReadyToUnlock = canReveal && !isCooldownActive && !needsAttemptFirst;

                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-2xl border transition-all ${isRevealed
                                  ? "bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                                  : isReadyToUnlock
                                    ? "bg-purple-950/30 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                    : isCooldownActive || needsAttemptFirst
                                      ? "bg-purple-950/15 border-purple-500/30"
                                      : "bg-white/5 border-white/10 opacity-55"
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isRevealed ? (
                                    <CheckCircle2 size={15} className="text-emerald-400" />
                                  ) : isReadyToUnlock ? (
                                    <Unlock size={15} className="text-amber-400" />
                                  ) : isCooldownActive ? (
                                    <Timer size={15} className="text-amber-400 animate-spin" />
                                  ) : (
                                    <Lock size={15} className="text-white/40" />
                                  )}
                                  <span className="text-xs font-bold text-white">Hint {hintNum} of 3</span>
                                </div>
                                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                  {isRevealed
                                    ? "Unlocked"
                                    : isCooldownActive
                                      ? `Cooldown ${hintCooldownSeconds}s`
                                      : "Free"}
                                </span>
                              </div>

                              {isRevealed ? (
                                <p className="text-xs text-amber-100/90 leading-relaxed whitespace-pre-wrap pt-1 border-t border-amber-500/20 mt-2">
                                  {hintText}
                                </p>
                              ) : isReadyToUnlock ? (
                                <button
                                  type="button"
                                  onClick={() => handleRevealHint(hintNum)}
                                  className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md transform active:scale-98"
                                >
                                  <Unlock size={14} />
                                  <span>Reveal Hint {hintNum}</span>
                                </button>
                              ) : isCooldownActive ? (
                                <div className="w-full mt-2 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                                  <Clock size={14} className="animate-pulse" />
                                  <span>Cooldown: Unlocks in {hintCooldownSeconds}s</span>
                                </div>
                              ) : needsAttemptFirst ? (
                                <div className="w-full mt-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-[11px] font-bold flex items-center justify-center gap-2">
                                  <Lock size={14} className="text-purple-400" />
                                  <span>Click &apos;COMPILE &amp; RUN&apos; first</span>
                                </div>
                              ) : (
                                <div className="text-[11px] text-white/40 italic mt-1">
                                  Unlock Hint {hintNum - 1} first to view this hint.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {leftTab === "editorial" && (
                    <div className="space-y-5 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-400" />
                          Chapter Editorial &amp; Solution Theory
                        </h3>
                        <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          Station Overview
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Overview Banner Card */}
                        <div className="p-4 rounded-2xl bg-[#040212] border border-purple-500/30 space-y-2 shadow-inner">
                          <h4 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" />
                            {chapter.title}
                          </h4>
                          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                            {chapter.description}
                          </p>
                        </div>

                        {/* Formatted Sections */}
                        {chapter.documentation?.sections && (
                          <div className="space-y-4">
                            {chapter.documentation.sections.map((sec, idx) => (
                              <div
                                key={idx}
                                className="p-4 sm:p-5 rounded-2xl bg-[#040212] border border-white/10 space-y-3 shadow-md"
                              >
                                {sec.heading && (
                                  <div className="font-bold text-cyan-300 text-sm sm:text-base tracking-wide flex items-center gap-2 pb-2 border-b border-white/10">
                                    <div className="w-1.5 h-4 rounded-full bg-cyan-400" />
                                    <span>{sec.heading}</span>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {sec.content.map((pText, pIdx) => (
                                    <TheoryParagraph key={pIdx} text={pText} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {leftTab === "submissions" && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                          <History size={16} className="text-cyan-400" />
                          Submission History &amp; Benchmarks
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {isCompleted ? (
                          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 size={16} />
                                Status: Accepted
                              </span>
                              <span className="text-white/50 text-[11px]">Just Now</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                              <div>
                                <span className="text-white/50 text-[10px] block">Runtime</span>
                                <span className="font-bold text-emerald-300">12 ms (Faster than 96.2%)</span>
                              </div>
                              <div>
                                <span className="text-white/50 text-[10px] block">Memory</span>
                                <span className="font-bold text-cyan-300">14.1 MB (Better than 91.4%)</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-center py-8 italic">
                            No submissions recorded yet for this session. Complete &amp; submit your Python script!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── DRAGGABLE DIVIDER HANDLE ── */}
              <div
                onMouseDown={handleMouseDownDivider}
                className="hidden lg:flex items-center justify-center w-3 hover:w-3.5 bg-[#08041c] hover:bg-cyan-500/40 border-r border-l border-white/10 cursor-col-resize z-30 group transition-all shrink-0 select-none shadow-md"
                title="Drag left or right to resize sidebar"
              >
                <div className="flex flex-col items-center justify-center py-2 gap-1 text-white/40 group-hover:text-cyan-200 transition-colors">
                  <GripVertical size={16} />
                </div>
              </div>

              {/* ── RIGHT COLUMN: CODE EDITOR & GFG ACTION TOOLBAR ── */}
              <div
                style={{
                  width:
                    typeof window !== "undefined" && window.innerWidth >= 1024
                      ? `${100 - sidebarWidthPercent}%`
                      : "100%",
                }}
                className="flex-1 p-4 sm:p-5 flex flex-col gap-3 bg-[#040110] h-full min-h-0 overflow-hidden"
              >
                {/* File Header & GFG Editor Utility Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/60 shrink-0 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCode2 size={16} className="text-[#E873C3]" />
                    <span className="font-bold text-white text-sm">main.py</span>
                    <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20 text-[11px]">
                      Python 3.11
                    </span>
                  </div>

                  {/* Right Utilities: Start Timer & Reset/Copy */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerActive(!isTimerActive)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isTimerActive
                          ? "bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      title={isTimerActive ? "Pause Timer" : "Start Timer"}
                    >
                      <Timer size={14} className={isTimerActive ? "animate-spin text-amber-400" : ""} />
                      <span>{isTimerActive ? formatTimer(timerSeconds) : "Start Timer"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetCode}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                      title="Reset Code to Default"
                    >
                      <RotateCcw size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Monaco Code Editor Container */}
                <div className="w-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-purple-500/35 bg-[#03010b] shadow-2xl relative">
                  <Editor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => {
                      setCode(val || "");
                      setHasRunCode(false);
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 15,
                      fontFamily: "var(--font-mono), monospace",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      padding: { top: 16, bottom: 16 },
                      lineNumbersMinChars: 3,
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "hidden",
                        alwaysConsumeMouseWheel: true,
                      },
                    }}
                  />
                </div>

                {/* Custom Input Drawer (Collapsible) */}
                {showCustomInput && (
                  <div className="p-3 rounded-xl bg-[#03010b] border border-white/10 flex flex-col gap-1.5 shrink-0">
                    <label className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                      Custom Input (stdin):
                    </label>
                    <textarea
                      rows={2}
                      value={customInputVal}
                      onChange={(e) => setCustomInputVal(e.target.value)}
                      placeholder="Enter custom stdin parameters..."
                      className="w-full p-2 rounded-lg bg-[#020108] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Bottom Control Action Bar (GFG Style) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(!showCustomInput)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${showCustomInput
                          ? "bg-cyan-950/60 border-cyan-400 text-cyan-300"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      <Terminal size={14} />
                      <span>Custom Input</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeftTab("hints")}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Lightbulb size={14} className="text-amber-400" />
                      <span>Hint</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-6 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950/50"
                    >
                      <Play size={14} className="fill-emerald-300" />
                      <span>{isRunning ? "Compiling..." : "Compile & Run"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isCompleted}
                      className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#E000FF] to-[#9E00F6] hover:opacity-95 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Rocket size={16} />
                      <span>{isCompleted ? "Completed!" : "Submit Mission"}</span>
                    </button>
                  </div>
                </div>

                {/* Terminal Output Stream */}
                {output && (
                  <div
                    ref={terminalOutputRef}
                    className="flex flex-col gap-1.5 shrink-0 pt-2 border-t border-white/10 max-h-48"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-white/50">
                      <div className="flex items-center gap-2">
                        <Terminal
                          size={14}
                          className={isError ? "text-red-400" : "text-emerald-400"}
                        />
                        <span>Terminal Output Stream</span>
                      </div>
                      {showCustomInput && customInputVal && (
                        <span className="text-[10px] text-cyan-300 font-mono">[With Custom Input]</span>
                      )}
                    </div>
                    <pre
                      data-lenis-prevent
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto custom-sidebar-scrollbar shadow-inner ${isError
                          ? "bg-red-950/25 border border-red-500/40 text-red-300"
                          : "bg-[#020108] border border-white/10 text-emerald-400"
                        }`}
                    >
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* ── Celebration Overlay ── */}
            <AnimatePresence>
              {showCelebrationModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-8 text-center"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, #12073a 0%, #0a0520 60%, #060310 100%)",
                  }}
                >
                  {/* Glowing ring + Trophy */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 14,
                        delay: 0.1,
                      }}
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.55)]"
                    >
                      <Trophy size={44} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </div>

                  {/* Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <h3 className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 uppercase">
                      Mission Complete!
                    </h3>
                    <p className="text-white/55 font-mono text-sm">
                      {exercise.title} · {chapter.title}
                    </p>
                  </motion.div>

                  {/* XP earned badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 280,
                      damping: 16,
                    }}
                    className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/35 px-7 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.18)]"
                  >
                    <Star size={22} className="fill-amber-400 text-amber-400" />
                    <span className="text-amber-300 font-mono font-black text-2xl tracking-wider">
                      +{chapter.xpValue} XP
                    </span>
                    <Sparkles size={20} className="text-amber-400" />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-3 w-full"
                  >
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-2xl bg-[#1f1638] hover:bg-[#2a1e4a] border border-white/20 text-white/90 font-mono font-bold text-sm tracking-wider uppercase transition-all cursor-pointer"
                    >
                      Back to Galaxy
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCelebrationModal(false)}
                      className="px-6 py-3 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-sm tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      title="Review submitted code in editor"
                    >
                      <Code2 size={16} />
                      <span>Review Exercise</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNextMission) {
                          onNextMission();
                        } else {
                          onClose();
                        }
                      }}
                      className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] hover:opacity-90 text-[#ffffff] font-mono font-bold text-sm tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(196,83,214,0.4)] cursor-pointer"
                    >
                      <span>Next Mission</span>
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
