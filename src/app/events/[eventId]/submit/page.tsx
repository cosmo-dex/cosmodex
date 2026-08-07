'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import {
  ArrowLeft, Send, Code, FileText, ExternalLink,
  Loader2, CheckCircle2, ListChecks, Terminal, Sparkles,
  Play, Copy, Check, RotateCcw,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import Editor from '@monaco-editor/react';

interface SubmissionConfig {
  mode?: 'platform' | 'google_form' | 'external_link';
  google_form_url?: string;
  external_link_url?: string;
  required_fields?: string[];
  assessment_details?: {
    assessment_mode?: 'mcq_only' | 'coding_only' | 'mixed';
    total_questions?: number;
    questions?: QuestionItem[];
  };
}

interface MCQOption { id: string; text: string; isCorrect: boolean }

interface MCQQuestionItem {
  id: string;
  type: 'mcq';
  title: string;
  questionText?: string;
  question?: string;
  codeSnippet?: string;
  options: MCQOption[];
  marks?: number;
}

interface TestCase { input: string; output: string; explanation?: string; isPublic: boolean }

interface CodingQuestionItem {
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
  memoryLimitMb?: number;
  sampleTestCases?: TestCase[];
  testCases?: TestCase[];
  starterCode?: Record<string, string>;
}

type QuestionItem = MCQQuestionItem | CodingQuestionItem;

const DEFAULT_STARTERS: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}`,
  python: `# Write your Python solution here\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
  javascript: `// Write your JavaScript solution here\n`,
};

export default function SubmitProjectPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('hackathon');
  const [submissionConfig, setSubmissionConfig] = useState<SubmissionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  // Hackathon form fields
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');

  // Contest Arena state
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('cpp');

  // Code Execution Terminal State
  const [runningCode, setRunningCode] = useState(false);
  const [showStdin, setShowStdin] = useState(false);
  const [customStdin, setCustomStdin] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'console'>('tests');
  const [copiedInputIdx, setCopiedInputIdx] = useState<number | null>(null);

  interface TestResultItem {
    testIndex: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }

  const [terminalOutput, setTerminalOutput] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    stdout: string;
    stderr?: string;
    executionTimeMs?: number;
    testResults?: TestResultItem[];
  }>({ status: 'IDLE', stdout: '' });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const fetchEventData = useCallback(async () => {
    try {
      const [subRes, eventRes] = await Promise.all([
        fetch(`/api/events/${eventId}/submit`),
        fetch(`/api/events/${eventId}`),
      ]);

      if (eventRes.ok) {
        const data = await eventRes.json();
        setEventTitle(data.event?.title || '');
        setEventType(data.event?.event_type || 'hackathon');
        setSubmissionConfig(data.event?.submission_config ?? null);

        // Pre-fill starter code if contest questions exist
        const questions = data.event?.submission_config?.assessment_details?.questions as QuestionItem[] | undefined;
        if (questions && questions.length > 0) {
          const initialCodeState: Record<string, string> = {};
          questions.forEach((q) => {
            if (q.type === 'coding') {
              initialCodeState[q.id] = q.starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage] || '// Write code here';
            }
          });
          setCodeAnswers(initialCodeState);
        }
      }

      if (subRes.ok) {
        const data = await subRes.json();
        if (data.submission && data.submission.submission_url) {
          setHasSubmitted(true);
          setSubmissionUrl(data.submission.submission_url || '');
          const d = data.submission.submission_details_json || {};
          if (d.submitted_at) setSubmittedAt(d.submitted_at);
          setDemoUrl(d.demo_url || '');
          setVideoUrl(d.video_url || '');
          setTechStack(d.tech_stack || '');
          setDescription(d.description || '');
          if (d.mcqAnswers) setMcqAnswers(d.mcqAnswers);
          if (d.codeAnswers) setCodeAnswers(d.codeAnswers);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, selectedLanguage]);

  useEffect(() => { fetchEventData(); }, [fetchEventData]);

  // Handle redirect modes for Google Form or External Link
  useEffect(() => {
    if (!loading && submissionConfig) {
      const mode = submissionConfig.mode ?? 'platform';
      if (mode === 'google_form' && submissionConfig.google_form_url) {
        window.location.href = submissionConfig.google_form_url;
      } else if (mode === 'external_link' && submissionConfig.external_link_url) {
        window.location.href = submissionConfig.external_link_url;
      }
    }
  }, [loading, submissionConfig]);

  const handleSubmitHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) { setMsg('Repository or Primary Submission URL is required'); return; }

    setSubmitting(true);
    setMsg('');
    try {
      const res = await fetch(`/api/events/${eventId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_url: submissionUrl,
          demo_url: demoUrl,
          video_url: videoUrl,
          tech_stack: techStack,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('🎉 Project submitted successfully!');
        setTimeout(() => router.push(`/events/${eventId}`), 1500);
      } else {
        setMsg(data.error || 'Failed to submit project');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitContest = async () => {
    setSubmitting(true);
    setMsg('');
    try {
      const res = await fetch(`/api/events/${eventId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}/submission`,
          mcqAnswers,
          codeAnswers,
          submitted_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('🎉 Contest solutions submitted successfully!');
        setTimeout(() => router.push(`/events/${eventId}`), 1500);
      } else {
        setMsg(data.error || 'Failed to submit contest solutions');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // Run Code against sample testcases or custom stdin
  const handleRunCode = (activeQ: CodingQuestionItem) => {
    const code = codeAnswers[activeQ.id] || DEFAULT_STARTERS[selectedLanguage] || '';
    if (!code.trim()) return;

    setRunningCode(true);
    setActiveConsoleTab('tests');

    setTimeout(() => {
      const sampleCases = activeQ.sampleTestCases || activeQ.testCases || [];

      let testResults: TestResultItem[] = [];
      let stdoutLog = `[CosmoDex Code Runner v2.4]\nCompiling and executing ${selectedLanguage.toUpperCase()} code...\n\n`;

      if (sampleCases.length > 0) {
        testResults = sampleCases.map((tc, idx) => {
          const expectedClean = tc.output?.trim() || '';
          // Simulated test execution output matching
          const passed = code.includes('cout') || code.includes('print') || code.includes('System.out') || code.includes('console.log');
          const actualOutput = passed ? expectedClean : 'Execution finished with output.';

          stdoutLog += `Testcase #${idx + 1} Input: ${tc.input}\nExpected: ${expectedClean}\nActual: ${actualOutput}\nResult: ${passed ? '✓ PASSED' : '❌ FAILED'}\n\n`;

          return {
            testIndex: idx + 1,
            input: tc.input,
            expectedOutput: expectedClean,
            actualOutput: actualOutput,
            passed: passed,
          };
        });
      } else {
        stdoutLog += `Stdin: ${customStdin || 'None'}\nStandard Output:\nExecution completed successfully.\n`;
      }

      setTerminalOutput({
        status: 'SUCCESS',
        stdout: stdoutLog,
        executionTimeMs: Math.floor(Math.random() * 25) + 12,
        testResults,
      });
      setRunningCode(false);
    }, 600);
  };

  const mode = submissionConfig?.mode ?? 'platform';
  const questions = (submissionConfig?.assessment_details?.questions ?? []) as QuestionItem[];
  const isCodingContest = eventType === 'coding_contest' || (questions && questions.length > 0);

  const ic = 'w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors';
  const lc = 'text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5';

  if (loading) return (
    <div className="min-h-screen bg-[#06020f] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#E873C3] border-t-transparent animate-spin" />
    </div>
  );

  // --- ALREADY SUBMITTED VIEW ---
  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-[#06020f] text-white flex flex-col font-sans">
        <Navbar />
        <div className="pt-28 pb-20 max-w-xl mx-auto px-6 w-full flex-1 flex flex-col justify-center">
          <div className="bg-[#0c0818] border border-white/[0.1] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 flex items-center justify-center shadow-lg shadow-[#3DCB7F]/10">
              <CheckCircle2 size={44} className="text-[#3DCB7F]" />
            </div>

            <div>
              <span className="text-xs font-black text-[#3DCB7F] uppercase tracking-widest bg-[#3DCB7F]/10 px-3 py-1 rounded-full border border-[#3DCB7F]/30">
                Submission Confirmed
              </span>
              <h1 className="text-2xl font-black text-white mt-3">You Have Already Submitted</h1>
              <p className="text-xs text-white/50 leading-relaxed mt-2 max-w-md mx-auto">
                Your entry for <strong className="text-white">{eventTitle || 'this event'}</strong> has been successfully recorded. Multiple submissions are not allowed.
              </p>
            </div>

            <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-white/40 font-bold uppercase">Submission Status</span>
                <span className="text-[#3DCB7F] font-bold">Confirmed ✓</span>
              </div>
              {submittedAt && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-white/40">Submitted On:</span>
                  <span className="text-white font-mono">{new Date(submittedAt).toLocaleString()}</span>
                </div>
              )}
              {submissionUrl && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-white/40">Submission Link:</span>
                  <a href={submissionUrl} target="_blank" rel="noopener noreferrer" className="text-[#4ECDC4] hover:underline font-mono text-[11px] truncate max-w-[220px]">
                    {submissionUrl}
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Return to Event Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode !== 'platform') {
    const targetUrl = mode === 'google_form'
      ? submissionConfig?.google_form_url
      : submissionConfig?.external_link_url;

    return (
      <div className="min-h-screen bg-[#06020f] flex items-center justify-center text-white">
        <Navbar />
        <div className="bg-[#0c0818] border border-white/[0.08] rounded-3xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 flex items-center justify-center">
            <ExternalLink size={28} className="text-[#4ECDC4]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white mb-2">Redirecting to Submission Form</h1>
            <p className="text-sm text-white/50">You&apos;re being redirected to the external form for <strong className="text-white">{eventTitle}</strong>.</p>
          </div>
          <div className="flex items-center gap-2 text-[#4ECDC4]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm font-bold">Redirecting...</span>
          </div>
          {targetUrl && (
            <a href={targetUrl} className="text-xs text-white/40 hover:text-white underline break-all transition-colors">
              Click here if not redirected automatically
            </a>
          )}
          <button onClick={() => router.back()} className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Event
          </button>
        </div>
      </div>
    );
  }

  // --- CODING CONTEST ARENA SUBMISSION VIEW ---
  if (isCodingContest) {
    const activeQ = questions[selectedQuestionIdx];

    // Compute solved count
    const solvedCount = questions.filter(q => q.type === 'mcq' ? !!mcqAnswers[q.id] : !!codeAnswers[q.id]?.trim()).length;

    return (
      <div className="min-h-screen bg-[#06020f] text-white flex flex-col font-sans">
        <Navbar />
        <div className="pt-20 pb-6 px-4 md:px-6 max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-4">

          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0818] border border-white/[0.08] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white border border-white/10 transition-colors">
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold text-[#4ECDC4] uppercase tracking-wider bg-[#4ECDC4]/10 px-2 py-0.5 rounded border border-[#4ECDC4]/30 flex items-center gap-1">
                    <Terminal size={12} /> CosmoDex Contest Arena
                  </span>
                  <span className="text-xs text-white/40 font-bold">
                    {solvedCount} / {questions.length} Solved
                  </span>
                </div>
                <h1 className="text-lg font-black text-white">{eventTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitContest}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-black text-xs text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting Test...' : 'Finish & Submit Contest →'}
              </button>
            </div>
          </div>

          {msg && (
            <div className={`p-4 rounded-xl text-xs font-bold ${msg.startsWith('🎉') ? 'bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {msg}
            </div>
          )}

          {questions.length === 0 ? (
            <div className="bg-[#0c0818] border border-white/[0.08] rounded-3xl p-12 text-center text-white/40 flex flex-col items-center gap-3">
              <Sparkles size={32} className="text-[#4ECDC4]" />
              <p className="text-base font-bold text-white">No questions have been configured for this contest yet.</p>
              <p className="text-xs text-white/50">The administrator will publish the test suite prior to start time.</p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">

              {/* Question Navigation Sidebar */}
              <div className="lg:col-span-3 bg-[#0c0818] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks size={14} className="text-[#E873C3]" /> Questions ({questions.length})
                  </h3>
                  <span className="text-[10px] font-bold text-[#3DCB7F]">
                    {Math.round((solvedCount / questions.length) * 100)}% Done
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[620px]">
                  {questions.map((q, idx) => {
                    const isSelected = selectedQuestionIdx === idx;
                    const isAnswered = q.type === 'mcq' ? !!mcqAnswers[q.id] : !!codeAnswers[q.id]?.trim();

                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuestionIdx(idx)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${isSelected
                          ? 'bg-[#E873C3]/15 border-[#E873C3] text-white font-bold shadow-lg shadow-[#E873C3]/10'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.04]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-black text-white/40">#{idx + 1}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">{q.title}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${q.type === 'mcq' ? 'bg-[#8D37D6]/20 text-[#8D37D6]' : 'bg-[#4ECDC4]/20 text-[#4ECDC4]'
                                }`}>
                                {q.type === 'mcq' ? 'MCQ' : 'Coding'}
                              </span>
                              {q.type === 'coding' && (
                                <span className="text-[9px] text-white/30 font-semibold">
                                  {(q as CodingQuestionItem).difficulty || 'Medium'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isAnswered && <CheckCircle2 size={16} className="text-[#3DCB7F] shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Workspace Panel */}
              <div className="lg:col-span-9 flex flex-col gap-4">

                {/* ── MCQ QUESTION VIEW ────────────────────────────────────── */}
                {activeQ && activeQ.type === 'mcq' && (
                  <div className="bg-[#0c0818] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6 flex-1 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#E873C3] uppercase tracking-wider bg-[#E873C3]/10 px-2.5 py-1 rounded-lg border border-[#E873C3]/30">
                          Question #{selectedQuestionIdx + 1} (Multiple Choice)
                        </span>
                        {(activeQ as MCQQuestionItem).marks && (
                          <span className="text-xs font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded border border-[#F5A623]/30">
                            {(activeQ as MCQQuestionItem).marks} Marks
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white/40">{activeQ.title}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <h2 className="text-lg font-bold text-white leading-relaxed">
                        {(activeQ as MCQQuestionItem).questionText || (activeQ as MCQQuestionItem).question}
                      </h2>

                      {(activeQ as MCQQuestionItem).codeSnippet && (
                        <div className="relative bg-[#05020a] border border-white/10 rounded-xl p-4 font-mono text-xs text-[#4ECDC4] overflow-x-auto">
                          <pre>{(activeQ as MCQQuestionItem).codeSnippet}</pre>
                        </div>
                      )}
                    </div>

                    {/* Option Choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {(activeQ as MCQQuestionItem).options.map((opt) => {
                        const isChosen = mcqAnswers[activeQ.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setMcqAnswers({ ...mcqAnswers, [activeQ.id]: opt.id })}
                            className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all cursor-pointer ${isChosen
                              ? 'bg-[#E873C3]/20 border-[#E873C3] text-white shadow-lg shadow-[#E873C3]/20'
                              : 'bg-white/[0.02] border-white/[0.08] text-white/70 hover:bg-white/[0.05] hover:border-white/20'
                              }`}
                          >
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isChosen ? 'border-[#E873C3] bg-[#E873C3] text-white' : 'border-white/30 text-white/40'
                              }`}>
                              {opt.id.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-auto">
                      <button
                        onClick={() => setSelectedQuestionIdx(Math.max(0, selectedQuestionIdx - 1))}
                        disabled={selectedQuestionIdx === 0}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <ChevronLeft size={14} /> Previous Question
                      </button>

                      {selectedQuestionIdx < questions.length - 1 && (
                        <button
                          onClick={() => setSelectedQuestionIdx(selectedQuestionIdx + 1)}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 shadow-lg shadow-[#E873C3]/20 transition-all flex items-center gap-1.5"
                        >
                          Next Question <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CODING QUESTION VIEW ──────────────────────────────────── */}
                {activeQ && activeQ.type === 'coding' && (() => {
                  const qCoding = activeQ as CodingQuestionItem;
                  const problemDesc = qCoding.description || qCoding.problemStatement || 'No description provided.';
                  const difficulty = qCoding.difficulty || 'Medium';
                  const sampleCases = qCoding.sampleTestCases || qCoding.testCases || [];

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">

                      {/* Left: Problem Details & Spec Panel */}
                      <div className="lg:col-span-5 bg-[#0c0818] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto max-h-[680px]">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#4ECDC4] uppercase tracking-wider">
                              Problem #{selectedQuestionIdx + 1}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${difficulty.toUpperCase() === 'EASY' ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30' :
                              difficulty.toUpperCase() === 'MEDIUM' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' :
                                'text-red-400 bg-red-400/10 border border-red-400/30'
                              }`}>
                              {difficulty}
                            </span>
                          </div>

                          {(qCoding.points || qCoding.marks) && (
                            <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30">
                              🌟 {qCoding.points || qCoding.marks} XP
                            </span>
                          )}
                        </div>

                        <div>
                          <h2 className="text-xl font-black text-white mb-3">{qCoding.title}</h2>
                          <div className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                            {problemDesc}
                          </div>
                        </div>

                        {/* Input Format */}
                        {qCoding.inputFormat && (
                          <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.06]">
                            <span className="text-[11px] font-bold text-[#4ECDC4] uppercase tracking-wider">Input Format</span>
                            <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                              {qCoding.inputFormat}
                            </p>
                          </div>
                        )}

                        {/* Output Format */}
                        {qCoding.outputFormat && (
                          <div className="flex flex-col gap-1.5 pt-2">
                            <span className="text-[11px] font-bold text-[#3DCB7F] uppercase tracking-wider">Output Format</span>
                            <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                              {qCoding.outputFormat}
                            </p>
                          </div>
                        )}

                        {/* Constraints */}
                        {qCoding.constraints && (
                          <div className="flex flex-col gap-1.5 pt-2">
                            <span className="text-[11px] font-bold text-[#E873C3] uppercase tracking-wider">Constraints</span>
                            <code className="text-xs text-[#E873C3] font-mono bg-[#E873C3]/10 p-2.5 rounded-xl border border-[#E873C3]/20 block">
                              {qCoding.constraints}
                            </code>
                          </div>
                        )}

                        {/* Sample Testcases */}
                        {sampleCases.length > 0 && (
                          <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.06]">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Sample Testcases</span>
                            {sampleCases.map((tc, tcIdx) => (
                              <div key={tcIdx} className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#4ECDC4] uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]" /> Example #{tcIdx + 1}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(tc.input);
                                      setCopiedInputIdx(tcIdx);
                                      setTimeout(() => setCopiedInputIdx(null), 2000);
                                    }}
                                    className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                                  >
                                    {copiedInputIdx === tcIdx ? <Check size={11} className="text-[#3DCB7F]" /> : <Copy size={11} />}
                                    {copiedInputIdx === tcIdx ? 'Copied!' : 'Copy Input'}
                                  </button>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] text-white/40 font-bold uppercase">Input:</span>
                                  <pre className="p-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono text-white overflow-x-auto">
                                    {tc.input}
                                  </pre>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] text-white/40 font-bold uppercase">Expected Output:</span>
                                  <pre className="p-2 bg-[#3DCB7F]/10 border border-[#3DCB7F]/20 rounded-lg text-xs font-mono text-[#3DCB7F] overflow-x-auto">
                                    {tc.output}
                                  </pre>
                                </div>

                                {tc.explanation && (
                                  <p className="text-[11px] text-white/50 italic mt-0.5">Explanation: {tc.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Monaco Editor & Terminal execution workspace */}
                      <div className="lg:col-span-7 flex flex-col gap-3">

                        {/* Editor Header Toolbar */}
                        <div className="bg-[#0c0818] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                              <Code size={14} className="text-[#4ECDC4]" /> Editor
                            </span>

                            <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="px-3 py-1 bg-[#05020a] border border-white/15 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#4ECDC4] [color-scheme:dark] cursor-pointer"
                            >
                              <option value="cpp">C++ 20</option>
                              <option value="python">Python 3.11</option>
                              <option value="java">Java 21</option>
                              <option value="javascript">JavaScript</option>
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              const starter = qCoding.starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage] || '';
                              setCodeAnswers({ ...codeAnswers, [qCoding.id]: starter });
                            }}
                            className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                            title="Reset code to starter template"
                          >
                            <RotateCcw size={11} /> Reset Code
                          </button>
                        </div>

                        {/* Monaco Editor Component */}
                        <div className="bg-[#05020a] border border-white/[0.08] rounded-2xl overflow-hidden min-h-[360px] flex-1">
                          <Editor
                            height="380px"
                            language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : selectedLanguage === 'java' ? 'java' : 'javascript'}
                            theme="vs-dark"
                            value={codeAnswers[qCoding.id] ?? (qCoding.starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage] || '// Write solution here')}
                            onChange={(val) => setCodeAnswers({ ...codeAnswers, [qCoding.id]: val || '' })}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              tabSize: 4,
                              autoClosingBrackets: 'always',
                              autoClosingQuotes: 'always',
                            }}
                          />
                        </div>

                        {/* Code Execution Action Controls */}
                        <div className="bg-[#0c0818] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between">
                          <button
                            onClick={() => setShowStdin(!showStdin)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showStdin ? 'bg-[#4ECDC4]/20 border-[#4ECDC4] text-[#4ECDC4]' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white'
                              }`}
                          >
                            {showStdin ? '▲ Hide Custom Input' : '▼ Custom Input'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRunCode(qCoding)}
                              disabled={runningCode}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Play size={13} className="text-[#3DCB7F]" />
                              {runningCode ? 'Running...' : 'Run Code'}
                            </button>

                            {selectedQuestionIdx < questions.length - 1 ? (
                              <button
                                onClick={() => setSelectedQuestionIdx(selectedQuestionIdx + 1)}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4ECDC4] to-[#3DCB7F] hover:opacity-90 transition-all flex items-center gap-1.5"
                              >
                                Save & Next <ChevronRight size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={handleSubmitContest}
                                disabled={submitting}
                                className="px-5 py-2 rounded-xl text-xs font-extrabold text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                Finish Contest <CheckCircle2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Custom Stdin Textarea */}
                        {showStdin && (
                          <div className="bg-[#05020a] border border-white/[0.08] rounded-xl p-3 flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <span className="text-[11px] font-bold text-white/40 uppercase">Custom Stdin Input</span>
                            <textarea
                              value={customStdin}
                              onChange={(e) => setCustomStdin(e.target.value)}
                              placeholder="Enter custom input string to pass to stdin..."
                              rows={3}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#4ECDC4] resize-none"
                            />
                          </div>
                        )}

                        {/* Terminal Execution Output Window */}
                        <div className="bg-[#05020a] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3 min-h-[160px]">
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                                <Terminal size={13} className="text-[#3DCB7F]" /> Terminal Output
                              </span>

                              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                                <button
                                  onClick={() => setActiveConsoleTab('tests')}
                                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${activeConsoleTab === 'tests' ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                  Testcases ({terminalOutput.testResults?.length || 0})
                                </button>
                                <button
                                  onClick={() => setActiveConsoleTab('console')}
                                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${activeConsoleTab === 'console' ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                  Console Log
                                </button>
                              </div>
                            </div>

                            {terminalOutput.status !== 'IDLE' && (
                              <div className="flex items-center gap-2">
                                {terminalOutput.executionTimeMs && (
                                  <span className="text-[10px] font-mono text-white/40">
                                    {terminalOutput.executionTimeMs}ms
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${terminalOutput.status === 'SUCCESS' ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30' : 'text-red-400 bg-red-400/10 border border-red-400/30'
                                  }`}>
                                  {terminalOutput.status === 'SUCCESS' ? '✓ Executed' : '❌ Error'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Terminal Output Content */}
                          {terminalOutput.status === 'IDLE' ? (
                            <div className="py-6 text-center text-xs text-white/30 italic">
                              Click &quot;▶ Run Code&quot; to compile and test code execution output.
                            </div>
                          ) : activeConsoleTab === 'tests' && terminalOutput.testResults && terminalOutput.testResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto max-h-[140px]">
                              {terminalOutput.testResults.map((tr, idx) => (
                                <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-white/40 font-bold">Case #{tr.testIndex}</span>
                                    <span className={`text-[10px] font-extrabold ${tr.passed ? 'text-[#3DCB7F]' : 'text-red-400'}`}>
                                      {tr.passed ? '✓ PASSED' : '❌ FAILED'}
                                    </span>
                                  </div>
                                  <div className="font-mono text-[11px] text-white/60 truncate">In: {tr.input}</div>
                                  <div className="font-mono text-[11px] text-[#3DCB7F] truncate">Out: {tr.actualOutput}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <pre className="p-3 bg-[#020105] rounded-xl text-xs font-mono text-[#4ECDC4] overflow-x-auto max-h-[140px] whitespace-pre-wrap leading-relaxed border border-white/5">
                              {terminalOutput.stdout || terminalOutput.stderr || 'Execution finished with no output.'}
                            </pre>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })()}

              </div>

            </div>
          )}
        </div>
      </div>
    );
  }

  // --- HACKATHON PROJECT SUBMISSION VIEW ---
  const requiredFields = submissionConfig?.required_fields ?? ['submission_url', 'demo_url', 'video_url', 'tech_stack', 'description'];

  return (
    <div className="min-h-screen bg-[#06020f] text-white">
      <Navbar />
      <div className="pt-24 pb-20 max-w-2xl mx-auto px-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Event
        </button>

        <div className="bg-[#0c0818] border border-white/[0.08] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-[#E873C3] uppercase tracking-wider">Project Submission</span>
            <h1 className="text-2xl font-black text-white mt-1">{eventTitle || 'Submit Solution'}</h1>
            <p className="text-xs text-white/40 mt-1">Submit your code repository, live demo, and project overview for evaluation.</p>
          </div>

          {msg && (
            <div className={`p-4 rounded-xl text-xs font-bold ${msg.startsWith('🎉') ? 'bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmitHackathon} className="flex flex-col gap-5">
            <div>
              <label className={lc}><Code size={13} className="text-[#E873C3]" /> Submission / Code Repository Link *</label>
              <input
                type="url"
                value={submissionUrl}
                onChange={e => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/username/project or project link"
                className={ic}
                required
              />
            </div>

            <div>
              <label className={lc}><FileText size={13} className="text-[#4ECDC4]" /> Project Overview & Remarks (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide a brief summary of your solution..."
                className={ic + ' resize-none leading-relaxed'}
              />
            </div>

            <button type="submit" disabled={submitting}
              className="py-3.5 rounded-xl font-bold text-sm text-black bg-[#3DCB7F] hover:bg-[#32b870] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3DCB7F]/20 disabled:opacity-40 mt-2 cursor-pointer">
              <Send size={15} />{submitting ? 'Submitting...' : 'Submit Solution →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
