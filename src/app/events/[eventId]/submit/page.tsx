'use client';

import { useState, useEffect, useCallback } from 'react';
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
    return (
      <EventContestArena
        eventTitle={eventTitle}
        eventId={eventId}
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
