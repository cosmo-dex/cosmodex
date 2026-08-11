"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Rocket, Star, Terminal, Sparkles, Trophy, ChevronRight, Maximize2, Minimize2, Code2, BookOpen } from "lucide-react";
import Editor from '@monaco-editor/react';
import confetti from "canvas-confetti";
import { Chapter, Exercise } from "./pythonData";

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
        if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          evaluatedArgs.push(arg.slice(1, -1));
        } else if (!isNaN(Number(arg))) {
          evaluatedArgs.push(arg);
        } else if (arg in variables) {
          evaluatedArgs.push(String(variables[arg]));
        } else {
          try {
            let evalExpr = arg;
            for (const [varName, varVal] of Object.entries(variables)) {
              evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, "g"), JSON.stringify(varVal));
            }
            // eslint-disable-next-line no-eval
            const res = Function(`"use strict"; return (${evalExpr})`)();
            evaluatedArgs.push(String(res));
          } catch {
            hasError = true;
            errorOutput = `  File "main.py", line ${i + 1}\n    ${rawLine}\nNameError: name '${arg}' is not defined`;
            break;
          }
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

      // Safe evaluation for variable expressions like a + b or x * 2
      try {
        let evalExpr = varValRaw;
        for (const [vName, vVal] of Object.entries(variables)) {
          evalExpr = evalExpr.replace(new RegExp(`\\b${vName}\\b`, "g"), JSON.stringify(vVal));
        }
        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${evalExpr})`)();
        variables[varName] = res;
        continue;
      } catch {
        return {
          output: `  File "main.py", line ${i + 1}\n    ${rawLine}\nSyntaxError: invalid syntax`,
          isError: true,
        };
      }
    }

    // Keyword statements (if, elif, else, for, while, def, import, from, return)
    if (/^(if|elif|else|for|while|def|import|from|class|return)\b/.test(cleanLine)) {
      if (!cleanLine.endsWith(":") && !cleanLine.startsWith("import") && !cleanLine.startsWith("from")) {
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
      output: "Error: No Python code found to execute. Please write your Python solution code before submitting!",
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
  const [code, setCode] = useState<string>('# Write your Python code below\nprint("Hello, Python Galaxy!")');
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRunCode, setHasRunCode] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isFullScreenIDE, setIsFullScreenIDE] = useState<boolean>(false);
  const confettiFiredRef = useRef(false);

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
      confettiFiredRef.current = false;
    }
  }, [exercise]);

  // Fire multi-burst confetti when the celebration overlay appears
  useEffect(() => {
    if (isCompleted && !confettiFiredRef.current) {
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
  }, [isCompleted]);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("Executing script...");
    setIsError(false);

    setTimeout(() => {
      setIsRunning(false);
      const res = parsePythonCode(code);
      setOutput(res.output);
      setIsError(res.isError);
      setHasRunCode(true);
    }, 500);
  };

  const handleSubmit = () => {
    // 1. Must run code first
    if (!hasRunCode) {
      setOutput("Error: Please click 'RUN CODE' to execute and test your code before submitting!");
      setIsError(true);
      return;
    }

    // 2. Validate code execution status
    const res = parsePythonCode(code);
    if (res.isError) {
      setOutput(res.output);
      setIsError(true);
      return;
    }

    setIsCompleted(true);
    if (chapter && exercise && onCompleteExercise) {
      onCompleteExercise(chapter.id, exercise.id);
    }
  };

  if (!isOpen || !chapter || !exercise) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative w-full bg-[#0a061d] border border-purple-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col transition-all duration-300 ${
            isFullScreenIDE
              ? "max-w-[96vw] h-[92vh]"
              : "max-w-4xl lg:max-w-5xl max-h-[92vh]"
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-[#0d0824] shrink-0 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-wider shrink-0 whitespace-nowrap">
                {chapter.stationNumber}
              </span>
              <h2 className="text-xs sm:text-sm md:text-base font-mono font-bold text-white uppercase tracking-wider truncate">
                {chapter.title} — <span className="text-[#E873C3]">{exercise.title}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Full Screen IDE Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFullScreenIDE(!isFullScreenIDE)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800 hover:to-pink-800 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              >
                {isFullScreenIDE ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span className="hidden sm:inline">
                  {isFullScreenIDE ? "Exit Full Screen" : "Full Screen IDE"}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal / IDE Workspace Container */}
          <div className="relative flex-1 overflow-hidden">
            {isFullScreenIDE ? (
              /* ── 2-COLUMN FULL SCREEN IDE WORKSPACE ── */
              <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
                {/* Left Column: Problem Instructions & Tasks Panel */}
                <div className="lg:col-span-4 p-6 border-r border-white/10 bg-[#0d0722] overflow-y-auto custom-sidebar-scrollbar flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    <BookOpen size={16} />
                    <span>Mission Requirements</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                      <Star size={14} className="fill-amber-400" />
                      <span>+{chapter.xpValue} XP REWARD</span>
                    </div>
                    <p className="text-sm font-mono text-white/85 leading-relaxed">
                      {exercise.instruction || chapter.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
                      Task Guidelines
                    </h4>
                    <ul className="space-y-2 text-xs font-mono text-white/75 leading-relaxed list-disc list-inside">
                      <li>Use Python 3.11 syntax in the editor panel.</li>
                      <li>Test your solution by clicking <span className="text-purple-300 font-bold">RUN CODE</span>.</li>
                      <li>Verify output in the terminal box below.</li>
                      <li>Click <span className="text-pink-400 font-bold">SUBMIT MISSION</span> to claim your XP!</li>
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
                    <span>CosmoDex IDE v2.4</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>

                {/* Right Column: Full Height Monaco Code Editor & Terminal Panel */}
                <div className="lg:col-span-8 p-6 flex flex-col gap-4 bg-[#070415] overflow-y-auto custom-sidebar-scrollbar">
                  <div className="flex items-center justify-between text-xs font-mono text-white/60">
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-[#E873C3]" />
                      <span className="font-bold text-white">main.py</span>
                    </div>
                    <span className="text-cyan-400 font-bold">Python 3.11</span>
                  </div>

                  {/* Monaco Editor in Full IDE Mode */}
                  <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-purple-500/30 bg-[#050312] shadow-inner">
                    <Editor
                      height="100%"
                      language="python"
                      theme="vs-dark"
                      value={code}
                      onChange={(val) => {
                        setCode(val || '');
                        setHasRunCode(false);
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'var(--font-mono), monospace',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 14, bottom: 14 },
                        lineNumbersMinChars: 3,
                      }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-6 py-3 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Play size={14} className="fill-purple-200" />
                      <span>{isRunning ? "Running..." : "Run Code"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isCompleted}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#E000FF] to-[#9E00F6] hover:opacity-95 text-white font-mono font-bold text-sm tracking-wider uppercase shadow-md transition-all transform active:scale-95 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Rocket size={16} />
                      <span>{isCompleted ? "Completed!" : "Submit Mission"}</span>
                    </button>
                  </div>

                  {/* Terminal Box */}
                  {output && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                        <Terminal size={14} className={isError ? "text-red-400" : "text-cyan-400"} />
                        <span>Terminal Output</span>
                      </div>
                      <pre
                        className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                          isError
                            ? "bg-red-950/25 border border-red-500/40 text-red-300"
                            : "bg-[#04020a] border border-white/10 text-emerald-400"
                        }`}
                      >
                        {output}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── STANDARD MODAL WORKSPACE VIEW ── */
              <div className="p-6 space-y-5 relative max-h-[82vh] overflow-y-auto custom-sidebar-scrollbar">
                {/* Description Banner */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span>+{chapter.xpValue} XP REWARD</span>
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-white/80 leading-relaxed">
                    {exercise.instruction || chapter.description}
                  </p>
                </div>

                {/* Code Editor Container */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50 px-1">
                    <span>main.py</span>
                    <button
                      type="button"
                      onClick={() => setIsFullScreenIDE(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Maximize2 size={12} />
                      <span>Open Full IDE</span>
                    </button>
                  </div>
                  <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-purple-500/30 bg-[#050312]">
                    <Editor
                      height="100%"
                      language="python"
                      theme="vs-dark"
                      value={code}
                      onChange={(val) => {
                        setCode(val || '');
                        setHasRunCode(false);
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: 'var(--font-mono), monospace',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 12, bottom: 12 },
                        lineNumbersMinChars: 3,
                      }}
                    />
                  </div>
                </div>

                {/* Control Bar */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-6 py-3 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={14} className="fill-purple-200" />
                    <span>{isRunning ? "Running..." : "Run Code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isCompleted}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#E000FF] to-[#9E00F6] hover:opacity-95 text-white font-mono font-bold text-sm tracking-wider uppercase shadow-md transition-all transform active:scale-95 cursor-pointer flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Rocket size={16} />
                    <span>{isCompleted ? "Completed!" : "Submit Mission"}</span>
                  </button>
                </div>

                {/* Simulated Terminal Output Box */}
                {output && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                      <Terminal size={14} className={isError ? "text-red-400" : "text-cyan-400"} />
                      <span>Terminal Output</span>
                    </div>
                    <pre
                      className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                        isError
                          ? "bg-red-950/25 border border-red-500/40 text-red-300"
                          : "bg-[#04020a] border border-white/10 text-emerald-400"
                      }`}
                    >
                      {output}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* ── Celebration Overlay (slides in over the content when completed) ── */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-8 text-center"
                  style={{ background: "radial-gradient(ellipse at center, #12073a 0%, #0a0520 60%, #060310 100%)" }}
                >
                  {/* Glowing ring + Trophy */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
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
                    transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 16 }}
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
                      className="px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 font-mono font-bold text-sm tracking-wider uppercase transition-all cursor-pointer"
                    >
                      Back to Galaxy
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
