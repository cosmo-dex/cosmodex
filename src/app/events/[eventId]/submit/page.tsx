'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import {
  ArrowLeft, Send, Code, FileText, ExternalLink,
  Loader2, CheckCircle2,
} from 'lucide-react';
import EventContestArena, { QuestionItem as ArenaQuestionItem } from '@/components/events/EventContestArena';

interface SubmissionConfig {
  mode?: 'platform' | 'google_form' | 'external_link';
  google_form_url?: string;
  external_link_url?: string;
  required_fields?: string[];
  assessment_details?: {
    assessment_mode?: 'mcq_only' | 'coding_only' | 'mixed';
    duration_minutes?: number;
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

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleWithSeed<T>(array: T[], seedStr: string): T[] {
  const arr = [...array];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(seed + i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SubmitProjectPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('hackathon');
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [submissionConfig, setSubmissionConfig] = useState<SubmissionConfig | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
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



  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const fetchEventData = useCallback(async () => {
    try {
      const [subRes, eventRes, sessionRes] = await Promise.all([
        fetch(`/api/events/${eventId}/submit`),
        fetch(`/api/events/${eventId}`),
        fetch(`/api/auth/session`).catch(() => null),
      ]);

      if (sessionRes && sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.userId || sessionData?.user?.id) {
          setCurrentUserId(sessionData.user.userId || sessionData.user.id);
        }
      }

      if (eventRes.ok) {
        const data = await eventRes.json();
        setEventTitle(data.event?.title || '');
        setEventType(data.event?.event_type || 'hackathon');
        setEndsAt(data.event?.ends_at || null);
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



  const mode = submissionConfig?.mode ?? 'platform';

  // Deterministically shuffle questions & options per user
  const questions = useMemo(() => {
    const rawQuestions = (submissionConfig?.assessment_details?.questions ?? []) as QuestionItem[];
    if (!rawQuestions || rawQuestions.length === 0) return [];
    const userSeed = (currentUserId || 'cosmodex-participant') + '-' + eventId;
    // 1. Shuffle question order for this user
    const shuffledQList = shuffleWithSeed(rawQuestions, `${userSeed}-questions`);

    // 2. For each MCQ, shuffle option order for this user
    return shuffledQList.map((q) => {
      if (q.type === 'mcq' && q.options && q.options.length > 0) {
        const shuffledOptions = shuffleWithSeed(q.options, `${userSeed}-${q.id}-opts`);
        return { ...q, options: shuffledOptions };
      }
      return q;
    });
  }, [submissionConfig?.assessment_details?.questions, currentUserId, eventId]);

  const isCodingContest = eventType === 'coding_contest' || (questions && questions.length > 0);

  const ic = 'w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors';
  const lc = 'text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5';

  if (loading) return (
    <div className="min-h-screen bg-[#06020f] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#E873C3] border-t-transparent animate-spin" />
    </div>
  );



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
    return (
      <EventContestArena
        eventTitle={eventTitle}
        eventId={eventId}
        endsAt={endsAt}
        durationMinutes={submissionConfig?.assessment_details?.duration_minutes}
        questions={questions as ArenaQuestionItem[]}
        mcqAnswers={mcqAnswers}
        codeAnswers={codeAnswers}
        selectedQuestionIdx={selectedQuestionIdx}
        selectedLanguage={selectedLanguage}
        submitting={submitting}
        msg={msg}
        onMcqAnswer={(qId, optId) => setMcqAnswers(prev => ({ ...prev, [qId]: optId }))}
        onCodeChange={(qId, code) => setCodeAnswers(prev => ({ ...prev, [qId]: code }))}
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
        onNavigate={(idx) => setSelectedQuestionIdx(idx)}
        onSubmit={handleSubmitContest}
        onBack={() => router.back()}
      />
    );
  }

  // --- HACKATHON PROJECT SUBMISSION VIEW ---

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

          {hasSubmitted && (
            <div className="p-3.5 bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#3DCB7F] font-bold">
                <CheckCircle2 size={16} />
                <span>Existing submission on record</span>
              </div>
              {submittedAt && (
                <span className="text-white/40 text-[11px]">
                  Last updated: {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

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
              <Send size={15} />{submitting ? 'Submitting...' : hasSubmitted ? 'Update Project Submission →' : 'Submit Solution →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
