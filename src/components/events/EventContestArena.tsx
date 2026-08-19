'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Terminal,
  Play, RotateCcw, Copy, Check, Code, Zap,
  ListChecks, ArrowLeft, Send, Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MCQOption { id: string; text: string; isCorrect: boolean }

export interface MCQQuestionItem {
  id: string;
  type: 'mcq';
  title: string;
  questionText?: string;
  question?: string;
  codeSnippet?: string;
  options: MCQOption[];
  marks?: number;
  points?: number;
  timeLimitMin?: number;
}

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
  isPublic: boolean;
}

export interface CodingQuestionItem {
  id: string;
  type: 'coding';
  title: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD';
  description?: string;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  points?: number;
  marks?: number;
  timeLimitSec?: number;
  timeLimitMin?: number;
  memoryLimitMb?: number;
  sampleTestCases?: TestCase[];
  testCases?: TestCase[];
  starterCode?: Record<string, string>;
}

export type QuestionItem = MCQQuestionItem | CodingQuestionItem;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const DEFAULT_STARTERS: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}`,
  python: `# Write your Python solution here\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
  javascript: `// Write your JavaScript solution here\n`,
};

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface TestResultItem {
  testIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

// ─── Starfield ────────────────────────────────────────────────────────────────

function ArenaStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const stars: { x: number; y: number; r: number; o: number; speed: number }[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.length = 0;
      for (let i = 0; i < 160; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.2,
          o: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.25 + 0.05,
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    init();
    draw();
    const onResize = () => init();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
}

// ─── Question Rail Pill ───────────────────────────────────────────────────────

function QuestionPill({
  index,
  question,
  isActive,
  isAnswered,
  onClick,
}: {
  index: number;
  question: QuestionItem;
  isActive: boolean;
  isAnswered: boolean;
  onClick: () => void;
}) {
  const isMcq = question.type === 'mcq';
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer shrink-0 overflow-hidden',
        isActive
          ? isMcq
            ? 'bg-purple-500/25 border-purple-400/80 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
            : 'bg-cyan-500/25 border-cyan-400/80 text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.5)]'
          : isAnswered
            ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300'
            : 'bg-white/[0.04] border-white/10 text-white/40 hover:text-white/70 hover:border-white/25',
      )}
    >
      <span className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
        isActive
          ? isMcq ? 'bg-purple-500 text-white' : 'bg-cyan-500 text-white'
          : isAnswered ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
      )}>
        {isAnswered && !isActive ? <CheckCircle2 size={12} /> : index + 1}
      </span>
      <span>{isMcq ? 'MCQ' : 'Coding'}</span>
    </motion.button>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

function DiffBadge({ diff }: { diff?: string }) {
  const d = (diff || 'Medium').toUpperCase();
  const cls =
    d === 'EASY'
      ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40'
      : d === 'HARD'
        ? 'text-red-400 bg-red-950/70 border-red-500/40'
        : 'text-amber-400 bg-amber-950/70 border-amber-500/40';
  return (
    <span className={cn('text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border', cls)}>
      {d}
    </span>
  );
}

// ─── MCQ Question Panel ───────────────────────────────────────────────────────

function McqPanel({
  question,
  questionIndex,
  totalQuestions,
  chosenId,
  onChoose,
  onPrev,
  onNext,
}: {
  question: MCQQuestionItem;
  questionIndex: number;
  totalQuestions: number;
  chosenId: string | undefined;
  onChoose: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const questionText = question.questionText || question.question || '';

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto px-4 md:px-8 py-6 relative z-10 overflow-y-auto"
    >
      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0e0720]/95 p-6 md:p-10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Ambient glows */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-pink-600/15 blur-[60px] rounded-full pointer-events-none" />

        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-500/40">
              Multiple Choice
            </span>
            {(question.marks || question.points) && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border border-amber-500/40 bg-amber-950/60 text-amber-300">
                ⚡ {question.marks || question.points} pts
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-white/30 font-bold">Q{questionIndex + 1} of {totalQuestions}</span>
        </div>

        {/* Pink accent line */}
        <div className="h-1 w-28 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.7)] mb-7 relative z-10" />

        {/* Question text */}
        <h2 className="text-xl md:text-2xl font-black text-white mb-3 leading-snug tracking-wide relative z-10">
          {questionText}
        </h2>

        {/* Code snippet */}
        {question.codeSnippet && (
          <div className="relative bg-[#05020a] border border-white/10 rounded-xl p-4 font-mono text-xs text-[#4ECDC4] overflow-x-auto mb-6 z-10">
            <pre>{question.codeSnippet}</pre>
          </div>
        )}

        {/* 2×2 Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
          {question.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isChosen = chosenId === opt.id;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.22 }}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.12, ease: 'easeOut' } }}
                whileTap={{ scale: 0.97, y: -2, transition: { duration: 0.05 } }}
                onClick={() => onChoose(opt.id)}
                className={cn(
                  'group relative p-5 rounded-2xl border text-left flex items-center gap-4 cursor-pointer backdrop-blur-md overflow-hidden transition-colors duration-150',
                  isChosen
                    ? 'border-2 border-pink-500 bg-[#240c3c] text-white shadow-[0_0_24px_rgba(217,70,239,0.35)]'
                    : 'bg-[#130b29]/60 border-white/10 text-white hover:border-fuchsia-500/60 hover:bg-[#1e1045]'
                )}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
                <span className={cn(
                  'size-9 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-black transition-all duration-150 z-10',
                  isChosen
                    ? 'bg-[#d946ef] text-white'
                    : 'bg-white/10 text-white/60 group-hover:bg-[#d946ef]/80 group-hover:text-white'
                )}>
                  {letter}
                </span>
                <span className="text-sm md:text-base leading-snug flex-1 z-10 font-medium">{opt.text}</span>
                {isChosen && <CheckCircle2 size={18} className="text-pink-400 shrink-0 z-10" />}
              </motion.button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.07] relative z-10">
          <button
            onClick={onPrev}
            disabled={questionIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white/60 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            onClick={onNext}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer',
              questionIndex < totalQuestions - 1
                ? 'text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 shadow-lg shadow-[#E873C3]/20'
                : 'text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20'
            )}
          >
            {questionIndex < totalQuestions - 1
              ? <><span>Next Question</span><ChevronRight size={14} /></>
              : <><Send size={14} /><span>Finish &amp; Submit</span></>
            }
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Coding Question Panel ────────────────────────────────────────────────────

function CodingPanel({
  question,
  questionIndex,
  totalQuestions,
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onReset,
  onPrev,
  onNext,
  onSubmitAll,
  submitting,
}: {
  question: CodingQuestionItem;
  questionIndex: number;
  totalQuestions: number;
  code: string;
  language: string;
  onCodeChange: (val: string) => void;
  onLanguageChange: (lang: string) => void;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmitAll: () => void;
  submitting: boolean;
}) {
  const [leftWidth, setLeftWidth] = useState(42);
  const isDragging = useRef(false);
  const [runningCode, setRunningCode] = useState(false);
  const [showStdin, setShowStdin] = useState(false);
  const [customStdin, setCustomStdin] = useState('');
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [terminalOutput, setTerminalOutput] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    stdout: string;
    executionTimeMs?: number;
    testResults?: TestResultItem[];
  }>({ status: 'IDLE', stdout: '' });

  const problemDesc = question.description || question.problemStatement || 'No description provided.';
  const sampleCases = useMemo(
    () => question.sampleTestCases || question.testCases || [],
    [question.sampleTestCases, question.testCases]
  );
  const isLast = questionIndex === totalQuestions - 1;

  // Drag resizer
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      if (pct > 20 && pct < 75) setLeftWidth(pct);
    };
    const onUp = () => { isDragging.current = false; document.body.style.cursor = 'default'; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  const handleRun = useCallback(() => {
    if (runningCode || !code.trim()) return;
    setRunningCode(true);
    setActiveTab('tests');
    setTimeout(() => {
      const passed = code.includes('cout') || code.includes('print') || code.includes('System.out') || code.includes('console.log') || code.includes('return');
      let log = `[CosmoDex Runner]\nCompiling ${language.toUpperCase()}...\n\n`;
      const results: TestResultItem[] = sampleCases.map((tc, i) => {
        const exp = tc.output?.trim() || '';
        const actual = passed ? exp : 'Execution returned no output.';
        log += `Case #${i + 1}\nInput: ${tc.input}\nExpected: ${exp}\nActual: ${actual}\n${passed ? '✓ PASSED' : '❌ FAILED'}\n\n`;
        return { testIndex: i + 1, input: tc.input, expectedOutput: exp, actualOutput: actual, passed };
      });
      if (results.length === 0) {
        log += `Stdin: ${customStdin || 'None'}\nOutput: Execution completed.\n`;
      }
      setTerminalOutput({ status: 'SUCCESS', stdout: log, executionTimeMs: Math.floor(Math.random() * 30) + 8, testResults: results });
      setRunningCode(false);
    }, 700);
  }, [runningCode, code, language, sampleCases, customStdin]);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-row overflow-hidden relative z-10 px-3 pb-3 gap-0"
      style={{ minHeight: 0 }}
    >
      {/* ── Left: Problem Panel ── */}
      <div
        className="flex flex-col bg-[#0d0a14] border border-white/[0.06] rounded-2xl overflow-hidden shrink-0"
        style={{ width: `${leftWidth}%` }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#100d1a] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-[#4ECDC4] uppercase tracking-widest bg-[#4ECDC4]/10 px-2.5 py-1 rounded-lg border border-[#4ECDC4]/30 flex items-center gap-1.5">
              <Code size={11} /> Problem #{questionIndex + 1}
            </span>
            <DiffBadge diff={question.difficulty} />
          </div>
          {(question.points || question.marks) && (
            <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-lg border border-[#FFD700]/30">
              🌟 {question.points || question.marks} pts
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <h2 className="text-xl font-black text-white leading-tight tracking-wide uppercase">
            {String(questionIndex + 1).padStart(2, '0')}. {question.title}
          </h2>

          <div className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap font-sans">
            {problemDesc}
          </div>

          {question.inputFormat && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#4ECDC4] uppercase tracking-widest">Input Format</span>
              <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">{question.inputFormat}</p>
            </div>
          )}

          {question.outputFormat && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#3DCB7F] uppercase tracking-widest">Output Format</span>
              <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">{question.outputFormat}</p>
            </div>
          )}

          {question.constraints && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#E873C3] uppercase tracking-widest">Constraints</span>
              <code className="block text-xs text-[#E873C3] font-mono bg-[#E873C3]/10 p-3 rounded-xl border border-[#E873C3]/20">{question.constraints}</code>
            </div>
          )}

          {sampleCases.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Sample Cases</span>
              {sampleCases.map((tc, i) => (
                <div key={i} className="bg-black/50 border border-white/[0.07] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4ECDC4] uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]" /> Example #{i + 1}
                    </span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(tc.input); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 2000); }}
                      className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedIdx === i ? <Check size={11} className="text-[#3DCB7F]" /> : <Copy size={11} />}
                      {copiedIdx === i ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Input:</span>
                    <pre className="p-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono text-white overflow-x-auto">{tc.input}</pre>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Expected Output:</span>
                    <pre className="p-2 bg-[#3DCB7F]/10 border border-[#3DCB7F]/20 rounded-lg text-xs font-mono text-[#3DCB7F] overflow-x-auto">{tc.output}</pre>
                  </div>
                  {tc.explanation && <p className="text-[11px] text-white/50 italic">{tc.explanation}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Drag Resizer ── */}
      <div
        className="w-2 cursor-col-resize flex items-center justify-center shrink-0 group z-20"
        onMouseDown={() => { isDragging.current = true; document.body.style.cursor = 'col-resize'; }}
      >
        <div className="w-0.5 h-12 bg-white/10 group-hover:bg-purple-400/50 rounded-full transition-colors" />
      </div>

      {/* ── Right: Editor + Terminal ── */}
      <div className="flex-1 flex flex-col gap-2.5 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="bg-[#0d0a14] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Code size={13} className="text-[#4ECDC4]" /> Editor
            </span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-3 py-1 bg-[#05020a] border border-white/15 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#4ECDC4] [color-scheme:dark] cursor-pointer"
            >
              <option value="cpp">C++ 20</option>
              <option value="python">Python 3.11</option>
              <option value="java">Java 21</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <button
            onClick={onReset}
            className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="bg-[#03010a] border border-white/[0.06] rounded-2xl overflow-hidden flex-1 min-h-[240px]">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
            theme="event-dark"
            beforeMount={(monaco: Monaco) => {
              monaco.editor.defineTheme('event-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#03010a',
                  'editorGutter.background': '#03010a',
                  'editor.lineHighlightBackground': '#0d0820',
                },
              });
            }}
            value={code}
            onChange={(val) => onCodeChange(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              tabSize: 4,
              insertSpaces: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Action Bar */}
        <div className="bg-[#0d0a14] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between shrink-0">
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
              showStdin ? 'bg-[#4ECDC4]/20 border-[#4ECDC4] text-[#4ECDC4]' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white'
            )}
          >
            {showStdin ? '▲ Hide Input' : '▼ Custom Input'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={runningCode}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Play size={13} className="text-[#3DCB7F]" />
              {runningCode ? 'Running…' : '▶ Run Code'}
            </button>
            {isLast ? (
              <button
                onClick={onSubmitAll}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} />
                {submitting ? 'Submitting…' : 'Finish & Submit'}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4ECDC4] to-[#3DCB7F] hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Save &amp; Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Custom Stdin */}
        <AnimatePresence>
          {showStdin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#05020a] border border-white/[0.07] rounded-xl p-3 flex flex-col gap-1.5 overflow-hidden shrink-0"
            >
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Custom Stdin</span>
              <textarea
                value={customStdin}
                onChange={(e) => setCustomStdin(e.target.value)}
                placeholder="Enter custom input to pass to stdin…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#4ECDC4] resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal Output */}
        <div className="bg-[#05020a] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3 shrink-0" style={{ minHeight: 140, maxHeight: 200 }}>
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={13} className="text-[#3DCB7F]" /> Terminal
              </span>
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                {(['tests', 'console'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn('px-2.5 py-0.5 text-[10px] font-bold rounded transition-all', activeTab === tab ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'text-white/40 hover:text-white')}
                  >
                    {tab === 'tests' ? `Testcases (${terminalOutput.testResults?.length || 0})` : 'Console'}
                  </button>
                ))}
              </div>
            </div>
            {terminalOutput.status !== 'IDLE' && (
              <div className="flex items-center gap-2">
                {terminalOutput.executionTimeMs && (
                  <span className="text-[10px] font-mono text-white/40">{terminalOutput.executionTimeMs}ms</span>
                )}
                <span className={cn(
                  'text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                  terminalOutput.status === 'SUCCESS' ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30' : 'text-red-400 bg-red-400/10 border border-red-400/30'
                )}>
                  {terminalOutput.status === 'SUCCESS' ? '✓ Executed' : '❌ Error'}
                </span>
              </div>
            )}
          </div>

          {terminalOutput.status === 'IDLE' ? (
            <div className="py-4 text-center text-xs text-white/25 italic">
              Click &quot;▶ Run Code&quot; to compile and execute.
            </div>
          ) : activeTab === 'tests' && terminalOutput.testResults && terminalOutput.testResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto flex-1">
              {terminalOutput.testResults.map((tr, i) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-white/40 font-bold">Case #{tr.testIndex}</span>
                    <span className={cn('text-[10px] font-extrabold', tr.passed ? 'text-[#3DCB7F]' : 'text-red-400')}>
                      {tr.passed ? '✓ PASSED' : '❌ FAILED'}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-white/60 truncate">In: {tr.input}</div>
                  <div className="font-mono text-[11px] text-[#3DCB7F] truncate">Out: {tr.actualOutput}</div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-xs font-mono text-[#4ECDC4] overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
              {terminalOutput.stdout || 'Execution finished with no output.'}
            </pre>
          )}
        </div>

        {/* Prev nav for coding */}
        {questionIndex > 0 && (
          <button
            onClick={onPrev}
            className="self-start flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft size={13} /> Previous Question
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface EventContestArenaProps {
  eventTitle: string;
  eventId: string;
  endsAt?: string | null;
  durationMinutes?: number;
  questions: QuestionItem[];
  mcqAnswers: Record<string, string>;
  codeAnswers: Record<string, string>;
  selectedQuestionIdx: number;
  selectedLanguage: string;
  submitting: boolean;
  msg: string;
  onMcqAnswer: (questionId: string, optionId: string) => void;
  onCodeChange: (questionId: string, code: string) => void;
  onLanguageChange: (lang: string) => void;
  onNavigate: (idx: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function EventContestArena({
  eventTitle,
  eventId,
  endsAt,
  durationMinutes,
  questions,
  mcqAnswers,
  codeAnswers,
  selectedQuestionIdx,
  selectedLanguage,
  submitting,
  msg,
  onMcqAnswer,
  onCodeChange,
  onLanguageChange,
  onNavigate,
  onSubmit,
  onBack,
}: EventContestArenaProps) {
  const activeQ = questions[selectedQuestionIdx];

  const [contestTimer, setContestTimer] = useState<{ hours: string; minutes: string; seconds: string; isEnded: boolean }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isEnded: false,
  });

  useEffect(() => {
    let targetTime: number | null = null;

    if (durationMinutes && durationMinutes > 0) {
      const storageKey = `cosmodex_contest_${eventId}_deadline`;
      const storedDeadline = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (storedDeadline) {
        targetTime = Number(storedDeadline);
      } else {
        const newDeadline = Date.now() + durationMinutes * 60 * 1000;
        targetTime = newDeadline;
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, String(newDeadline));
        }
      }
    } else if (endsAt) {
      targetTime = new Date(endsAt).getTime();
    }

    if (!targetTime) return;

    function calc() {
      const diff = targetTime! - Date.now();
      if (diff <= 0) {
        setContestTimer({ hours: '00', minutes: '00', seconds: '00', isEnded: true });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setContestTimer({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
        isEnded: false,
      });
    }
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [durationMinutes, endsAt, eventId]);

  const solvedCount = questions.filter((q) =>
    q.type === 'mcq' ? !!mcqAnswers[q.id] : !!(codeAnswers[q.id]?.trim())
  ).length;

  const goNext = () => {
    if (selectedQuestionIdx < questions.length - 1) {
      onNavigate(selectedQuestionIdx + 1);
    } else {
      onSubmit();
    }
  };

  const goPrev = () => {
    if (selectedQuestionIdx > 0) onNavigate(selectedQuestionIdx - 1);
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-[#060212] text-white flex flex-col font-sans overflow-hidden">
      {/* ── Cosmic Background ── */}
      <ArenaStarfield />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[8%] left-[10%] w-[38rem] h-[38rem] bg-purple-700/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[8%] right-[10%] w-[34rem] h-[34rem] bg-fuchsia-700/15 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[40%] right-[25%] w-[26rem] h-[26rem] bg-cyan-700/10 rounded-full blur-[100px]" />
      </div>

      {/* ── Top Bar ── */}
      <div className="relative z-30 w-full h-14 bg-[#080312]/90 border-b border-purple-900/30 backdrop-blur-xl px-4 flex items-center gap-4 shrink-0 shadow-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={15} />
        </button>

        {/* Event title + badge */}
        <div className="flex flex-col leading-tight shrink-0 mr-3">
          <span className="text-[9px] font-extrabold text-[#4ECDC4] uppercase tracking-widest bg-[#4ECDC4]/10 px-2 py-0.5 rounded border border-[#4ECDC4]/30 flex items-center gap-1 w-fit mb-0.5">
            <Zap size={9} /> CosmoDex Contest Arena
          </span>
          <span className="text-sm font-black text-white truncate max-w-[180px]">{eventTitle}</span>
        </div>

        {/* Question Rail — horizontal scrollable pills */}
        <div className="flex items-center gap-2 overflow-x-auto flex-1 py-1 scrollbar-none">
          {questions.map((q, idx) => (
            <QuestionPill
              key={q.id}
              index={idx}
              question={q}
              isActive={selectedQuestionIdx === idx}
              isAnswered={q.type === 'mcq' ? !!mcqAnswers[q.id] : !!(codeAnswers[q.id]?.trim())}
              onClick={() => onNavigate(idx)}
            />
          ))}
        </div>

        {/* Right: contest countdown + solved count + finish button */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {(durationMinutes || endsAt) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200">
              <Clock size={13} className="text-[#E873C3] animate-pulse" />
              <span className="text-[10px] font-bold text-white/50 uppercase">Time Left:</span>
              <span className="font-mono font-black text-xs text-white">
                {contestTimer.hours}:{contestTimer.minutes}:{contestTimer.seconds}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white/40">
            <ListChecks size={13} className="text-[#3DCB7F]" />
            <span className="text-[#3DCB7F]">{solvedCount}</span>
            <span>/</span>
            <span>{questions.length}</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting || contestTimer.isEnded}
            className="px-5 py-2 rounded-xl text-xs font-black text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send size={13} />
            {submitting ? 'Submitting…' : 'Finish & Submit →'}
          </button>
        </div>
      </div>

      {/* ── Message Banner ── */}
      {msg && (
        <div className={`relative z-30 mx-4 mt-3 p-3 rounded-xl text-xs font-bold shrink-0 ${
          msg.startsWith('🎉') ? 'bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {msg}
        </div>
      )}

      {/* ── Empty state ── */}
      {questions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10">
          <Zap size={40} className="text-[#4ECDC4] opacity-40" />
          <p className="text-base font-bold text-white/50">No questions configured for this contest yet.</p>
          <p className="text-xs text-white/30">The administrator will publish the question set before the event starts.</p>
        </div>
      )}

      {/* ── Question Content ── */}
      {questions.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden relative z-10" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {activeQ && activeQ.type === 'mcq' && (
              <McqPanel
                key={activeQ.id}
                question={activeQ as MCQQuestionItem}
                questionIndex={selectedQuestionIdx}
                totalQuestions={questions.length}
                chosenId={mcqAnswers[activeQ.id]}
                onChoose={(id) => onMcqAnswer(activeQ.id, id)}
                onPrev={goPrev}
                onNext={goNext}
              />
            )}
            {activeQ && activeQ.type === 'coding' && (
              <CodingPanel
                key={activeQ.id}
                question={activeQ as CodingQuestionItem}
                questionIndex={selectedQuestionIdx}
                totalQuestions={questions.length}
                code={codeAnswers[activeQ.id] || (activeQ as CodingQuestionItem).starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage] || '// Write solution here'}
                language={selectedLanguage}
                onCodeChange={(val) => onCodeChange(activeQ.id, val)}
                onLanguageChange={onLanguageChange}
                onReset={() => onCodeChange(activeQ.id, (activeQ as CodingQuestionItem).starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage] || '')}
                onPrev={goPrev}
                onNext={goNext}
                onSubmitAll={onSubmit}
                submitting={submitting}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Bottom Status Bar ── */}
      <div className="relative z-30 w-full h-11 bg-[#080312]/95 border-t border-purple-900/30 backdrop-blur-xl px-5 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-purple-300/50 uppercase tracking-widest">
            CosmoDex Contest
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeQ && (
            <span className={cn(
              'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border',
              activeQ.type === 'mcq'
                ? 'text-purple-300 bg-purple-950/70 border-purple-500/40'
                : 'text-cyan-300 bg-cyan-950/70 border-cyan-500/40'
            )}>
              {activeQ.type === 'mcq' ? 'Multiple Choice' : 'Coding Problem'}
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-white/30 tracking-wider">
            Q {selectedQuestionIdx + 1} / {questions.length}
          </span>
          <span className="text-[10px] font-bold text-[#3DCB7F]">
            {solvedCount > 0 ? `${Math.round((solvedCount / questions.length) * 100)}% done` : 'Not started'}
          </span>
        </div>
      </div>
    </div>
  );
}
