'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CalendarDays, Users, Trophy, Settings, ArrowLeft,
  Save, Zap, Search, Ban, RotateCcw, Plus, Trash2,
  ExternalLink, FileText, Mail, Download, X, Send, Copy,
  Sparkles, Code2, ListChecks
} from 'lucide-react';

type Tab = 'overview' | 'questions' | 'registrations' | 'leaderboard' | 'settings';
type SubmissionMode = 'platform' | 'google_form' | 'external_link';

// Hackathon specific structures
interface TrackEntry { title: string; description: string; prize: string }
interface JudgingCriteriaEntry { criteria: string; weight: string; description: string }

// Contest / Assessment specific structures
interface MCQOption { id: string; text: string; isCorrect: boolean }
interface MCQQuestion {
  id: string;
  type: 'mcq';
  title: string;
  questionText: string;
  codeSnippet?: string;
  options: MCQOption[];
  explanation?: string;
  marks: number;
}

interface TestCase { input: string; output: string; explanation?: string; isPublic: boolean }
interface CodingQuestion {
  id: string;
  type: 'coding';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  timeLimitSec: number;
  memoryLimitMb: number;
  points: number;
  sampleTestCases: TestCase[];
}

type QuestionItem = MCQQuestion | CodingQuestion;

interface RoundEntry {
  id: string; title: string; description: string;
  type: 'quiz' | 'coding' | 'submission' | 'interview' | 'custom';
  assessmentMode?: 'mcq_only' | 'coding_only' | 'mixed';
  starts_at: string; ends_at: string; action_url: string;
}
interface PrizeEntry { rank: string; prize: string; perks: string; badge_name: string }
interface TimelineEntry { label: string; date: string; done: boolean }
interface FaqEntry { question: string; answer: string }
interface SponsorEntry { name: string; tier: string; logo_url: string }

interface SubmissionConfig {
  mode?: SubmissionMode;
  google_form_url?: string;
  external_link_url?: string;
  required_fields?: string[];
  results_published?: boolean;
  registration_fields_config?: Record<string, { enabled: boolean; required: boolean }>;
  hackathon_details?: {
    problem_statement?: string;
    tracks?: TrackEntry[];
    judging_criteria?: JudgingCriteriaEntry[];
  };
  assessment_details?: {
    assessment_mode?: 'mcq_only' | 'coding_only' | 'mixed';
    total_questions?: number;
    questions?: QuestionItem[];
  };
}

interface EventData {
  id: string; title: string; slug: string; tagline: string | null;
  description: string | null; event_type: string; banner_url: string | null;
  status: string; registration_open: boolean | null; max_participants: number | null;
  prize_pool: string | null; prizes_json: PrizeEntry[] | null;
  tags_json: string[] | null; rules_json: string[] | null;
  timeline_json: TimelineEntry[] | null; faqs_json: FaqEntry[] | null;
  sponsors_json: SponsorEntry[] | null; starts_at: string | null;
  ends_at: string | null; registration_deadline: string | null;
  participation_type: string | null; min_team_size: number | null;
  max_team_size: number | null; enter_event_url: string | null;
  rounds_json: RoundEntry[] | null; eligibility: string | null;
  registration_fee: string | null; submission_config: SubmissionConfig | null;
  created_at: string | null;
  _count: { event_registrations: number; event_leaderboard: number };
}

interface RegistrationDetails {
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  user_type?: string;
  college_org?: string;
  degree?: string;
  branch?: string;
  year_of_study?: string;
  city_state?: string;
  github_url?: string;
  linkedin_url?: string;
  referral_source?: string;
}

interface Registration {
  id: string;
  user_id: string;
  status: string;
  registered_at: string | null;
  submission_url: string | null;
  submission_details_json: {
    demo_url?: string;
    video_url?: string;
    tech_stack?: string;
    description?: string;
    codeAnswers?: Record<string, string>;
    mcqAnswers?: Record<string, string>;
    submitted_at?: string;
  } | null;
  team_name: string | null;
  team_code: string | null;
  email?: string | null;
  details_json?: RegistrationDetails | null;
  users: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
}

interface LeaderboardEntry {
  id: string;
  rank: number | null;
  score: number;
  users: { id: string; username: string; avatar_url: string | null };
}

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  draft: { text: '#F5A623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.3)' },
  published: { text: '#3DCB7F', bg: 'rgba(61,203,127,0.1)', border: 'rgba(61,203,127,0.3)' },
  ongoing: { text: '#E873C3', bg: 'rgba(232,115,195,0.1)', border: 'rgba(232,115,195,0.3)' },
  ended: { text: '#F5A623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.3)' },
  archived: { text: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EventControlPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  // Registrations
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regStatus, setRegStatus] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regActionLoading, setRegActionLoading] = useState<string | null>(null);
  const [regTotal, setRegTotal] = useState(0);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [inspectSubmissionReg, setInspectSubmissionReg] = useState<Registration | null>(null);
  // Questions / Problem Statements state
  const [problemStatement, setProblemStatement] = useState('');
  const [tracks, setTracks] = useState<TrackEntry[]>([]);
  const [judgingCriteria, setJudgingCriteria] = useState<JudgingCriteriaEntry[]>([]);
  const [assessmentMode, setAssessmentMode] = useState<'mcq_only' | 'coding_only' | 'mixed'>('mixed');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [questionsSaving, setQuestionsSaving] = useState(false);
  const [questionsMsg, setQuestionsMsg] = useState('');

  // Export CSV
  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) return;
    const headers = [
      'Username', 'Account Email', 'Registration Email', 'Full Name', 'Phone', 'Gender',
      'User Category', 'College / Organization', 'Degree', 'Branch', 'Year of Study',
      'City & State', 'GitHub Profile', 'LinkedIn Profile', 'Referral Source',
      'Team Name', 'Team Code', 'Status', 'Registered At'
    ];

    const rows = registrations.map(reg => {
      const d = reg.details_json || {};
      return [
        reg.users?.username || '',
        reg.users?.email || '',
        reg.email || d.email || '',
        d.full_name || '',
        d.phone || '',
        d.gender || '',
        d.user_type || '',
        d.college_org || '',
        d.degree || '',
        d.branch || '',
        d.year_of_study || '',
        d.city_state || '',
        d.github_url || '',
        d.linkedin_url || '',
        d.referral_source || '',
        reg.team_name || '',
        reg.team_code || '',
        reg.status || '',
        reg.registered_at ? new Date(reg.registered_at).toLocaleString('en-IN') : '',
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event?.slug || 'event'}_registrations_unstop.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState('');

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [editScores, setEditScores] = useState<Record<string, number>>({});
  const [newEntry, setNewEntry] = useState({ userId: '', score: 0 });
  const [lbSaving, setLbSaving] = useState(false);

  // Settings Form
  const [form, setForm] = useState<Partial<EventData>>({});
  const [roundsForm, setRoundsForm] = useState<RoundEntry[]>([]);
  const [prizesForm, setPrizesForm] = useState<PrizeEntry[]>([]);
  const [timelineForm, setTimelineForm] = useState<TimelineEntry[]>([]);
  const [faqsForm, setFaqsForm] = useState<FaqEntry[]>([]);
  const [rulesForm, setRulesForm] = useState<string[]>([]);
  const [sponsorsForm, setSponsorsForm] = useState<SponsorEntry[]>([]);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('platform');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [externalLinkUrl, setExternalLinkUrl] = useState('');
  const [regFieldsConfig, setRegFieldsConfig] = useState<Record<string, { enabled: boolean; required: boolean }>>({
    phone: { enabled: true, required: true },
    college_org: { enabled: true, required: true },
    degree: { enabled: true, required: false },
    branch: { enabled: true, required: false },
    year_of_study: { enabled: true, required: false },
    city_state: { enabled: true, required: true },
    gender: { enabled: true, required: false },
    github_url: { enabled: true, required: false },
    linkedin_url: { enabled: true, required: false },
    portfolio_url: { enabled: false, required: false },
    resume_url: { enabled: false, required: false },
    coding_handle: { enabled: true, required: false },
    preferred_language: { enabled: true, required: false },
    referral_source: { enabled: true, required: false },
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/super/events/${eventId}`);
      const data = await res.json();
      if (data.event) {
        const ev: EventData = data.event;
        setEvent(ev);
        setForm(ev);
        setRoundsForm(ev.rounds_json ?? []);
        setPrizesForm(ev.prizes_json ?? []);
        setTimelineForm(ev.timeline_json ?? []);
        setFaqsForm(ev.faqs_json ?? []);
        setRulesForm((ev.rules_json as string[] | null) ?? []);
        setSponsorsForm(ev.sponsors_json ?? []);
        const sc = ev.submission_config ?? {};
        setSubmissionMode(sc.mode ?? 'platform');
        setGoogleFormUrl(sc.google_form_url ?? '');
        setExternalLinkUrl(sc.external_link_url ?? '');

        // Load hackathon or contest assessment details
        if (sc.registration_fields_config) {
          setRegFieldsConfig(sc.registration_fields_config);
        }
        if (sc.hackathon_details) {
          setProblemStatement(sc.hackathon_details.problem_statement || '');
          setTracks(sc.hackathon_details.tracks || []);
          setJudgingCriteria(sc.hackathon_details.judging_criteria || []);
        }
        if (sc.assessment_details) {
          setAssessmentMode(sc.assessment_details.assessment_mode || 'mixed');
          setQuestions(sc.assessment_details.questions || []);
        }
      }
    } finally { setLoading(false); }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    setRegLoading(true);
    const p = new URLSearchParams();
    if (regSearch) p.set('search', regSearch);
    if (regStatus) p.set('status', regStatus);
    try {
      const res = await fetch(`/api/admin/super/events/${eventId}/registrations?${p}`);
      const data = await res.json();
      setRegistrations(data.registrations ?? []);
      setRegTotal(data.total ?? 0);
    } finally { setRegLoading(false); }
  }, [eventId, regSearch, regStatus]);

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch(`/api/admin/super/events/${eventId}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard ?? []);
      const scores: Record<string, number> = {};
      (data.leaderboard ?? []).forEach((e: LeaderboardEntry) => { scores[e.users.id] = e.score; });
      setEditScores(scores);
    } finally { setLbLoading(false); }
  }, [eventId]);

  useEffect(() => {
    void (async () => {
      await fetchEvent();
    })();
  }, [fetchEvent]);

  useEffect(() => {
    void (async () => {
      if (activeTab === 'registrations') await fetchRegistrations();
    })();
  }, [activeTab, fetchRegistrations]);

  useEffect(() => {
    void (async () => {
      if (activeTab === 'leaderboard') await fetchLeaderboard();
    })();
  }, [activeTab, fetchLeaderboard]);

  const handleRegStatusChange = async (regId: string, status: string) => {
    setRegActionLoading(regId);
    await fetch(`/api/admin/super/events/${eventId}/registrations`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId: regId, status }),
    });
    setRegActionLoading(null);
    fetchRegistrations();
  };

  const handleEventStatusChange = async (status: string) => {
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchEvent();
  };

  const handleStartEventNow = async () => {
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ongoing', start_now: true }),
    });
    fetchEvent();
  };

  const handleStartRegistrationNow = async () => {
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_open: true, auto_publish: true }),
    });
    fetchEvent();
  };

  const handleCloseRegistrationNow = async () => {
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_open: false }),
    });
    fetchEvent();
  };

  const handleEndEventNow = async () => {
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ended', registration_open: false }),
    });
    fetchEvent();
  };

  const handleTogglePublishResults = async () => {
    const isCurrentlyPublished = Boolean(event?.submission_config?.results_published);
    const updatedSubConfig = {
      ...(event?.submission_config || {}),
      results_published: !isCurrentlyPublished,
    };
    await fetch(`/api/admin/super/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_config: updatedSubConfig }),
    });
    fetchEvent();
  };

  const handleSaveQuestionsOrProblemStatement = async () => {
    setQuestionsSaving(true);
    setQuestionsMsg('');
    try {
      const existingConfig = event?.submission_config || {};
      const updatedConfig: SubmissionConfig = {
        ...existingConfig,
        hackathon_details: event?.event_type === 'hackathon' ? {
          problem_statement: problemStatement,
          tracks: tracks,
          judging_criteria: judgingCriteria,
        } : existingConfig.hackathon_details,
        assessment_details: event?.event_type === 'coding_contest' ? {
          assessment_mode: assessmentMode,
          total_questions: questions.length,
          questions: questions,
        } : existingConfig.assessment_details,
      };

      const res = await fetch(`/api/admin/super/events/${eventId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_config: updatedConfig }),
      });
      if (res.ok) {
        setQuestionsMsg('✓ Saved successfully!');
        fetchEvent();
      } else {
        setQuestionsMsg('Failed to save.');
      }
    } catch {
      setQuestionsMsg('Network error.');
    } finally {
      setQuestionsSaving(false);
    }
  };

  const handleLbSave = async () => {
    setLbSaving(true);
    const entries = leaderboard.map(e => ({ userId: e.users.id, score: editScores[e.users.id] ?? e.score }));
    if (newEntry.userId) entries.push({ userId: newEntry.userId, score: newEntry.score });
    await fetch(`/api/admin/super/events/${eventId}/leaderboard`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    setNewEntry({ userId: '', score: 0 });
    setLbSaving(false);
    fetchLeaderboard();
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;
    setSendingBroadcast(true);
    setBroadcastStatus('');
    try {
      const res = await fetch(`/api/admin/super/events/${eventId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notify_participants: true, update_subject: broadcastSubject, update_message: broadcastMessage }),
      });
      if (res.ok) {
        setBroadcastStatus('🎉 Email broadcast sent to all registered participants!');
        setTimeout(() => { setShowBroadcastModal(false); setBroadcastSubject(''); setBroadcastMessage(''); setBroadcastStatus(''); }, 2000);
      } else {
        setBroadcastStatus('Failed to send broadcast.');
      }
    } catch { setBroadcastStatus('Network error'); }
    finally { setSendingBroadcast(false); }
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const submissionConfig: SubmissionConfig = {
        ...event?.submission_config,
        mode: submissionMode,
        registration_fields_config: regFieldsConfig,
      };
      if (submissionMode === 'google_form') submissionConfig.google_form_url = googleFormUrl;
      if (submissionMode === 'external_link') submissionConfig.external_link_url = externalLinkUrl;

      const payload = {
        ...form,
        rounds_json: roundsForm,
        prizes_json: prizesForm,
        timeline_json: timelineForm,
        faqs_json: faqsForm,
        rules_json: rulesForm,
        sponsors_json: sponsorsForm,
        submission_config: submissionConfig,
      };
      const res = await fetch(`/api/admin/super/events/${eventId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setSettingsError(data.error ?? 'Failed to save settings');
      else { setSettingsSuccess('✓ Settings saved successfully!'); fetchEvent(); }
    } catch { setSettingsError('Network error'); }
    finally { setSettingsSaving(false); }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#E873C3] border-t-transparent animate-spin" />
      </div>
    </AdminLayout>
  );

  if (!event) return (
    <AdminLayout>
      <div className="text-center py-20 text-white/30">Event not found.</div>
    </AdminLayout>
  );

  const sc = STATUS_COLORS[event.status] ?? STATUS_COLORS.draft;
  const ic = 'w-full px-4 py-2.5 bg-[#0e0a1c] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors [color-scheme:dark]';
  const selectStyle = 'w-full px-4 py-2.5 bg-[#0e0a1c] text-white border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-[#E873C3] transition-colors [color-scheme:dark] cursor-pointer';
  const lc = 'text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 block';

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'overview', label: 'Overview', icon: CalendarDays },
    { key: 'questions', label: event.event_type === 'hackathon' ? 'Themes & Problems' : 'Question Bank', icon: Code2 },
    { key: 'registrations', label: `Registrations (${event._count.event_registrations})`, icon: Users },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <button onClick={() => router.push('/super-admin/events')}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Events
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{event.title}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}>
                  {event.status}
                </span>
                <span className="text-xs text-[#E873C3] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E873C3]/10 rounded border border-[#E873C3]/30">
                  {event.event_type.replace('_', ' ')}
                </span>
              </div>
              {event.tagline && <p className="text-sm text-white/40">{event.tagline}</p>}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#8D37D6]/20 border border-[#8D37D6]/40 hover:bg-[#8D37D6]/30 transition-all">
                <Mail size={13} /> Broadcast Email
              </button>

              {event.status !== 'ongoing' ? (
                <button onClick={handleStartEventNow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 shadow-lg shadow-[#E873C3]/20 transition-all">
                  <Zap size={13} /> Start Event NOW (Go LIVE)
                </button>
              ) : (
                <button onClick={handleEndEventNow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#F5A623]/20 border border-[#F5A623]/40 hover:bg-[#F5A623]/30 transition-all">
                  🏁 End Event NOW
                </button>
              )}

              {!event.registration_open ? (
                <button onClick={handleStartRegistrationNow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all">
                  🔓 Start Registration NOW
                </button>
              ) : (
                <button onClick={handleCloseRegistrationNow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-all">
                  🔒 End Registration NOW
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 justify-center"
              style={activeTab === key ? { background: 'rgba(232,115,195,0.15)', color: '#E873C3' } : { color: 'rgba(255,255,255,0.4)' }}>
              <Icon size={14} /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">

            {/* Event & Registration Control Center */}
            <div className="bg-gradient-to-r from-[#120a28] to-[#0a0618] border border-white/[0.1] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-[#E873C3]" /> Event & Registration Lifecycle Control Center
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Start or end registration, set the event LIVE, or override event status at any time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/40">Status Override:</span>
                  <select
                    value={event.status}
                    onChange={(e) => handleEventStatusChange(e.target.value)}
                    className="bg-[#0e0a1c] text-white border border-white/[0.15] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#E873C3] cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing (LIVE)</option>
                    <option value="ended">Ended</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Registration Control Box */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Candidate Registration</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${event.registration_open ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}>
                      {event.registration_open ? '🔓 Open for Signups' : '🔒 Closed'}
                    </span>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed">
                    {event.registration_open
                      ? 'Candidates can currently view the event page and submit registration details.'
                      : 'Candidate registrations are locked. Users cannot register until opened.'}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    {!event.registration_open ? (
                      <button
                        onClick={handleStartRegistrationNow}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        🔓 Start / Open Registration NOW
                      </button>
                    ) : (
                      <button
                        onClick={handleCloseRegistrationNow}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        🔒 End / Close Registration NOW
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Event Live Status Control Box */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Event Execution State</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase" style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}>
                      {event.status === 'ongoing' ? '🔴 LIVE NOW' : event.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed">
                    {event.status === 'ongoing'
                      ? 'The event is LIVE. Participants can access contest arenas, submit projects, or attempt questions.'
                      : 'Setting event LIVE activates live arenas, timers, and submission portals instantly.'}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    {event.status !== 'ongoing' ? (
                      <button
                        onClick={handleStartEventNow}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 shadow-lg shadow-[#E873C3]/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        ⚡ Start Event NOW (Go LIVE)
                      </button>
                    ) : (
                      <button
                        onClick={handleEndEventNow}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#F5A623]/20 border border-[#F5A623]/40 hover:bg-[#F5A623]/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        🏁 End Event NOW
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Registrations', value: event._count.event_registrations, color: '#E873C3' },
                { label: 'Participation', value: event.participation_type === 'team' ? `Team (${event.min_team_size}-${event.max_team_size})` : 'Individual', color: '#4ECDC4' },
                { label: 'Starts At', value: fmt(event.starts_at), color: '#F5A623' },
                { label: 'Ends At', value: fmt(event.ends_at), color: '#3DCB7F' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">{label}</p>
                  <p className="font-black text-white text-sm" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Event Configuration Overview</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-white/40">Type: </span><span className="text-white font-medium capitalize">{event.event_type}</span></div>
                <div><span className="text-white/40">Prize Pool: </span><span className="text-white font-medium">{event.prize_pool ?? '—'}</span></div>
                <div><span className="text-white/40">Fee: </span><span className="text-[#3DCB7F] font-bold">{event.registration_fee || 'Free'}</span></div>
                <div><span className="text-white/40">Eligibility: </span><span className="text-white">{event.eligibility || 'Open to All'}</span></div>
                <div><span className="text-white/40">Evaluation Engine: </span><span className="text-[#4ECDC4] font-bold capitalize">{event.event_type === 'coding_contest' ? 'CosmoDex Online IDE' : (event.submission_config?.mode ?? 'platform')}</span></div>
                <div><span className="text-white/40">Rounds: </span><span className="text-white font-bold">{event.rounds_json?.length || 0}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: QUESTIONS / PROBLEM STATEMENTS MANAGER */}
        {activeTab === 'questions' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">
                  {event.event_type === 'hackathon' ? 'Hackathon Theme & Problem Statements' : 'Contest Assessment & Question Bank'}
                </h2>
                <p className="text-xs text-white/40">
                  {event.event_type === 'hackathon' ? 'Define tracks, rubrics, and the main problem statement.' : 'Configure MCQs and Coding Problems to be served via built-in IDE & Quiz engine.'}
                </p>
              </div>
              <button
                onClick={handleSaveQuestionsOrProblemStatement}
                disabled={questionsSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E873C3, #8D37D6)', boxShadow: '0 4px 20px rgba(232,115,195,0.4)' }}
              >
                <Save size={15} /> {questionsSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {questionsMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${questionsMsg.startsWith('✓') ? 'bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {questionsMsg}
              </div>
            )}

            {/* Hackathon problem statement view */}
            {event.event_type === 'hackathon' ? (
              <div className="flex flex-col gap-5">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                  <label className={lc}>Main Problem Statement & Brief</label>
                  <textarea
                    value={problemStatement}
                    onChange={e => setProblemStatement(e.target.value)}
                    rows={6}
                    placeholder="Enter full details of the problem statement..."
                    className={ic + ' resize-none leading-relaxed'}
                  />
                </div>

                {/* Tracks */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E873C3] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} /> Tracks & Themes
                    </span>
                    <button type="button" onClick={() => setTracks([...tracks, { title: '', description: '', prize: '' }])} className="text-xs font-bold text-[#E873C3] flex items-center gap-1">
                      <Plus size={13} /> Add Track
                    </button>
                  </div>
                  {tracks.length === 0 ? (
                    <p className="text-xs text-white/30 italic">No custom tracks created yet. Click &quot;Add Track&quot; above.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {tracks.map((tr, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl relative">
                          <input value={tr.title} onChange={e => setTracks(tracks.map((t, idx) => idx === i ? { ...t, title: e.target.value } : t))} placeholder="Track Name" className={ic} />
                          <input value={tr.description} onChange={e => setTracks(tracks.map((t, idx) => idx === i ? { ...t, description: e.target.value } : t))} placeholder="Description" className={ic} />
                          <div className="flex items-center gap-2">
                            <input value={tr.prize} onChange={e => setTracks(tracks.map((t, idx) => idx === i ? { ...t, prize: e.target.value } : t))} placeholder="Prize" className={ic} />
                            <button type="button" onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))} className="text-red-400 p-2">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Coding contest questions suite view */
              <div className="flex flex-col gap-5">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4ECDC4] uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks size={14} /> Contest Assessment Mode
                    </span>
                    <select value={assessmentMode} onChange={e => setAssessmentMode(e.target.value as SubmissionMode extends string ? 'mixed' | 'coding_only' | 'mcq_only' : never)}
                      className="px-3 py-1.5 bg-[#0c0818] text-[#4ECDC4] border border-[#4ECDC4]/40 text-xs font-bold rounded-lg focus:outline-none [color-scheme:dark] cursor-pointer">
                      <option value="mixed" className="bg-[#0c0818] text-white">Mixed (Coding + MCQ)</option>
                      <option value="coding_only" className="bg-[#0c0818] text-white">Coding Problems Only</option>
                      <option value="mcq_only" className="bg-[#0c0818] text-white">MCQ Questions Only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-xs text-white/50">{questions.length} total questions configured</span>
                    <div className="flex items-center gap-2">
                      {(assessmentMode === 'mcq_only' || assessmentMode === 'mixed') && (
                        <button
                          type="button"
                          onClick={() => setQuestions([...questions, {
                            id: `mcq-${Date.now()}`,
                            type: 'mcq',
                            title: 'New MCQ',
                            questionText: '',
                            options: [
                              { id: '1', text: 'Option A', isCorrect: true },
                              { id: '2', text: 'Option B', isCorrect: false },
                              { id: '3', text: 'Option C', isCorrect: false },
                              { id: '4', text: 'Option D', isCorrect: false },
                            ],
                            marks: 5
                          }])}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#E873C3] bg-[#E873C3]/10 border border-[#E873C3]/30 hover:bg-[#E873C3]/20"
                        >
                          + Add MCQ Question
                        </button>
                      )}
                      {(assessmentMode === 'coding_only' || assessmentMode === 'mixed') && (
                        <button
                          type="button"
                          onClick={() => setQuestions([...questions, { id: `code-${Date.now()}`, type: 'coding', title: 'New Coding Problem', difficulty: 'Medium', description: '', inputFormat: '', outputFormat: '', constraints: '', timeLimitSec: 1, memoryLimitMb: 256, points: 50, sampleTestCases: [] }])}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 hover:bg-[#4ECDC4]/20"
                        >
                          + Add Coding Problem
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of questions */}
                  {questions.length === 0 ? (
                    <div className="py-8 text-center text-white/30 text-xs italic border border-dashed border-white/10 rounded-xl">
                      No questions configured in the bank yet. Click + Add MCQ or + Add Coding Problem above.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {questions.map((q, idx) => {
                        if (q.type === 'mcq') {
                          return (
                            <div key={q.id || idx} className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E873C3]/20 text-[#E873C3] border border-[#E873C3]/30">MCQ</span>
                                  <input
                                    value={q.title}
                                    onChange={e => {
                                      const list = [...questions];
                                      list[idx] = { ...list[idx], title: e.target.value };
                                      setQuestions(list);
                                    }}
                                    className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-[#E873C3]"
                                    placeholder="MCQ Question Title"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-white/40">Marks:</span>
                                    <input
                                      type="number"
                                      value={q.marks}
                                      onChange={e => {
                                        const list = [...questions];
                                        (list[idx] as MCQQuestion).marks = Number(e.target.value);
                                        setQuestions(list);
                                      }}
                                      className="w-14 px-2 py-0.5 bg-[#0e0a1c] border border-white/[0.1] rounded text-xs text-center text-white"
                                    />
                                  </div>
                                  <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* MCQ Content */}
                              <div className="flex flex-col gap-2">
                                <textarea
                                  value={q.questionText}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as MCQQuestion).questionText = e.target.value;
                                    setQuestions(list);
                                  }}
                                  rows={2}
                                  placeholder="Enter the question text..."
                                  className={ic + ' resize-none'}
                                />
                                <input
                                  value={q.codeSnippet || ''}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as MCQQuestion).codeSnippet = e.target.value;
                                    setQuestions(list);
                                  }}
                                  placeholder="Optional code snippet for question..."
                                  className={ic + ' font-mono text-xs text-purple-300'}
                                />
                              </div>

                              {/* MCQ Options */}
                              <div className="flex flex-col gap-2 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-white/40 uppercase">Answer Options (Click letter to mark Correct Answer)</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...questions];
                                      const mcq = { ...(list[idx] as MCQQuestion) };
                                      const nextNum = (mcq.options?.length || 0) + 1;
                                      const letter = String.fromCharCode(64 + nextNum);
                                      mcq.options = [...(mcq.options || []), { id: String(Date.now()), text: `Option ${letter}`, isCorrect: false }];
                                      list[idx] = mcq;
                                      setQuestions(list);
                                    }}
                                    className="text-[11px] font-bold text-[#E873C3] hover:underline"
                                  >
                                    + Add Option
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {(q.options || []).map((opt, optIdx) => (
                                    <div key={opt.id || optIdx} className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-lg border border-white/[0.05]">
                                      <button
                                        type="button"
                                        title="Click to mark as correct answer"
                                        onClick={() => {
                                          const list = [...questions];
                                          const mcq = { ...(list[idx] as MCQQuestion) };
                                          mcq.options = mcq.options.map((o, i) => ({ ...o, isCorrect: i === optIdx }));
                                          list[idx] = mcq;
                                          setQuestions(list);
                                        }}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${opt.isCorrect ? 'bg-[#3DCB7F] text-black shadow-lg shadow-[#3DCB7F]/30' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}
                                      </button>
                                      <input
                                        value={opt.text}
                                        onChange={e => {
                                          const list = [...questions];
                                          const mcq = { ...(list[idx] as MCQQuestion) };
                                          mcq.options = mcq.options.map((o, i) => i === optIdx ? { ...o, text: e.target.value } : o);
                                          list[idx] = mcq;
                                          setQuestions(list);
                                        }}
                                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                                      />
                                      {q.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const list = [...questions];
                                            const mcq = { ...(list[idx] as MCQQuestion) };
                                            mcq.options = mcq.options.filter((_, i) => i !== optIdx);
                                            list[idx] = mcq;
                                            setQuestions(list);
                                          }}
                                          className="text-red-400/60 hover:text-red-400 p-1"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Coding Problem Render
                        const codingQ = q as CodingQuestion;
                        return (
                          <div key={q.id || idx} className="p-4 bg-white/[0.02] border border-[#4ECDC4]/20 rounded-xl flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30">CODING</span>
                                <input
                                  value={codingQ.title}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).title = e.target.value;
                                    setQuestions(list);
                                  }}
                                  className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-[#4ECDC4]"
                                  placeholder="Coding Problem Title"
                                />
                                <select
                                  value={codingQ.difficulty || 'Medium'}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).difficulty = e.target.value as 'Easy' | 'Medium' | 'Hard';
                                    setQuestions(list);
                                  }}
                                  className="px-2 py-1 bg-[#0c0818] text-white border border-white/10 rounded text-xs [color-scheme:dark] cursor-pointer"
                                >
                                  <option value="Easy" className="bg-[#0c0818] text-white">Easy</option>
                                  <option value="Medium" className="bg-[#0c0818] text-white">Medium</option>
                                  <option value="Hard" className="bg-[#0c0818] text-white">Hard</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-white/40">Points:</span>
                                  <input
                                    type="number"
                                    value={codingQ.points ?? 50}
                                    onChange={e => {
                                      const list = [...questions];
                                      (list[idx] as CodingQuestion).points = Number(e.target.value);
                                      setQuestions(list);
                                    }}
                                    className="w-14 px-2 py-0.5 bg-[#0e0a1c] border border-white/[0.1] rounded text-xs text-center text-white"
                                  />
                                </div>
                                <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Problem Statement Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="md:col-span-2">
                                <label className={lc}>Problem Description</label>
                                <textarea
                                  value={codingQ.description || ''}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).description = e.target.value;
                                    setQuestions(list);
                                  }}
                                  rows={3}
                                  placeholder="Write problem statement details..."
                                  className={ic + ' resize-none'}
                                />
                              </div>
                              <div>
                                <label className={lc}>Input Format</label>
                                <input
                                  value={codingQ.inputFormat || ''}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).inputFormat = e.target.value;
                                    setQuestions(list);
                                  }}
                                  placeholder="e.g. Line 1: N integers"
                                  className={ic}
                                />
                              </div>
                              <div>
                                <label className={lc}>Output Format</label>
                                <input
                                  value={codingQ.outputFormat || ''}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).outputFormat = e.target.value;
                                    setQuestions(list);
                                  }}
                                  placeholder="e.g. Single integer output"
                                  className={ic}
                                />
                              </div>
                              <div>
                                <label className={lc}>Constraints</label>
                                <input
                                  value={codingQ.constraints || ''}
                                  onChange={e => {
                                    const list = [...questions];
                                    (list[idx] as CodingQuestion).constraints = e.target.value;
                                    setQuestions(list);
                                  }}
                                  placeholder="1 <= N <= 10^5"
                                  className={ic}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className={lc}>Time Limit (sec)</label>
                                  <input
                                    type="number"
                                    value={codingQ.timeLimitSec ?? 1}
                                    onChange={e => {
                                      const list = [...questions];
                                      (list[idx] as CodingQuestion).timeLimitSec = Number(e.target.value);
                                      setQuestions(list);
                                    }}
                                    className={ic}
                                  />
                                </div>
                                <div>
                                  <label className={lc}>Memory Limit (MB)</label>
                                  <input
                                    type="number"
                                    value={codingQ.memoryLimitMb ?? 256}
                                    onChange={e => {
                                      const list = [...questions];
                                      (list[idx] as CodingQuestion).memoryLimitMb = Number(e.target.value);
                                      setQuestions(list);
                                    }}
                                    className={ic}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Sample Testcases */}
                            <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/50 uppercase">Sample Test Cases</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...questions];
                                    const cq = { ...(list[idx] as CodingQuestion) };
                                    cq.sampleTestCases = [...(cq.sampleTestCases || []), { input: '', output: '', isPublic: true }];
                                    list[idx] = cq;
                                    setQuestions(list);
                                  }}
                                  className="text-[11px] text-[#4ECDC4] font-bold hover:underline"
                                >
                                  + Add Sample Testcase
                                </button>
                              </div>
                              {(codingQ.sampleTestCases || []).map((tc, tcIdx) => (
                                <div key={tcIdx} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                                  <input
                                    value={tc.input}
                                    onChange={e => {
                                      const list = [...questions];
                                      const cq = { ...(list[idx] as CodingQuestion) };
                                      cq.sampleTestCases = cq.sampleTestCases.map((item, i) => i === tcIdx ? { ...item, input: e.target.value } : item);
                                      list[idx] = cq;
                                      setQuestions(list);
                                    }}
                                    placeholder="Sample Input"
                                    className={ic + ' font-mono text-xs'}
                                  />
                                  <div className="flex items-center gap-2">
                                    <input
                                      value={tc.output}
                                      onChange={e => {
                                        const list = [...questions];
                                        const cq = { ...(list[idx] as CodingQuestion) };
                                        cq.sampleTestCases = cq.sampleTestCases.map((item, i) => i === tcIdx ? { ...item, output: e.target.value } : item);
                                        list[idx] = cq;
                                        setQuestions(list);
                                      }}
                                      placeholder="Sample Output"
                                      className={ic + ' font-mono text-xs'}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...questions];
                                        const cq = { ...(list[idx] as CodingQuestion) };
                                        cq.sampleTestCases = cq.sampleTestCases.filter((_, i) => i !== tcIdx);
                                        list[idx] = cq;
                                        setQuestions(list);
                                      }}
                                      className="text-red-400 p-1"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={regSearch} onChange={e => { setRegSearch(e.target.value); fetchRegistrations(); }}
                  placeholder="Search by username or email..." className="w-full pl-9 pr-4 py-2.5 bg-[#0e0a1c] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3]/50" />
              </div>
              <select value={regStatus} onChange={e => { setRegStatus(e.target.value); fetchRegistrations(); }}
                className={selectStyle + ' max-w-[160px]'}>
                <option value="" className="bg-[#0c0818] text-white">All Status</option>
                <option value="registered" className="bg-[#0c0818] text-white">Registered</option>
                <option value="disqualified" className="bg-[#0c0818] text-white">Disqualified</option>
                <option value="withdrawn" className="bg-[#0c0818] text-white">Withdrawn</option>
              </select>
              <button
                onClick={handleExportCSV}
                disabled={registrations.length === 0}
                className="px-4 py-2.5 bg-[#3DCB7F]/10 hover:bg-[#3DCB7F]/20 border border-[#3DCB7F]/30 rounded-xl text-xs font-bold text-[#3DCB7F] flex items-center gap-2 transition-all disabled:opacity-40"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
            <p className="text-xs text-white/30">{regTotal} total registrations</p>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              {regLoading ? (
                <div className="p-4 flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
              ) : registrations.length === 0 ? (
                <div className="py-16 text-center text-white/30 text-sm">No registrations found.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {registrations.map((reg) => {
                    const d = reg.details_json || {};
                    return (
                      <div key={reg.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/30 flex items-center justify-center text-xs font-black text-[#E873C3]">
                          {(d.full_name || reg.users.username)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white truncate">{d.full_name || reg.users.username}</p>
                            <span className="text-[10px] font-mono text-white/40">(@{reg.users.username})</span>
                            {reg.team_name && <span className="text-[10px] font-bold text-[#E873C3] bg-[#E873C3]/10 px-2 py-0.5 rounded border border-[#E873C3]/30">Team: {reg.team_name} ({reg.team_code})</span>}
                          </div>
                          <p className="text-xs text-white/40 truncate">{reg.email || d.email || reg.users.email}</p>
                        </div>
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#E873C3] bg-[#E873C3]/10 border border-[#E873C3]/30 hover:bg-[#E873C3]/20 transition-all flex items-center gap-1 shrink-0"
                        >
                          <FileText size={11} /> Details
                        </button>
                        {reg.submission_url && (
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 hover:bg-[#3DCB7F]/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Send size={11} /> View Submission
                          </button>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${reg.status === 'registered' ? 'text-[#3DCB7F] bg-[#3DCB7F]/10' : reg.status === 'disqualified' ? 'text-red-400 bg-red-500/10' : 'text-white/30 bg-white/[0.05]'}`}>
                          {reg.status}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {reg.status === 'registered' && (
                            <button onClick={() => handleRegStatusChange(reg.id, 'disqualified')} disabled={regActionLoading === reg.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50">
                              <Ban size={11} /> DQ
                            </button>
                          )}
                          {reg.status === 'disqualified' && (
                            <button onClick={() => handleRegStatusChange(reg.id, 'registered')} disabled={regActionLoading === reg.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 hover:bg-[#3DCB7F]/20 transition-all disabled:opacity-50">
                              <RotateCcw size={11} /> Restore
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CANDIDATE FULL DETAILS MODAL */}
        {selectedReg && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0717] border border-white/[0.12] rounded-3xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl relative">
              <button onClick={() => setSelectedReg(null)} className="absolute top-5 right-5 text-white/40 hover:text-white">
                <X size={18} />
              </button>

              <div>
                <span className="text-[10px] font-bold text-[#E873C3] uppercase tracking-wider bg-[#E873C3]/10 px-2 py-0.5 rounded border border-[#E873C3]/30">Candidate Profile Pass</span>
                <h3 className="text-xl font-black text-white mt-1">{selectedReg.details_json?.full_name || selectedReg.users.username}</h3>
                <p className="text-xs text-white/50">Username: @{selectedReg.users.username}</p>
              </div>

              <div className="flex flex-col gap-3 text-xs bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06] max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Email Address</span>
                    <span className="text-white font-medium">{selectedReg.email || selectedReg.details_json?.email || selectedReg.users.email}</span>
                  </div>
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Phone Number</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.phone || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">User Category</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.user_type || '—'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Gender</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.gender || '—'}</span>
                  </div>
                </div>

                <div className="pb-3 border-b border-white/[0.06]">
                  <span className="text-white/40 font-bold block uppercase text-[10px]">College / Organization</span>
                  <span className="text-white font-medium">{selectedReg.details_json?.college_org || '—'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Degree & Stream</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.degree || ''} {selectedReg.details_json?.branch ? `(${selectedReg.details_json.branch})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Year of Study</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.year_of_study || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">City & State</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.city_state || '—'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Referral Source</span>
                    <span className="text-white font-medium">{selectedReg.details_json?.referral_source || '—'}</span>
                  </div>
                </div>

                {selectedReg.team_name && (
                  <div className="pb-3 border-b border-white/[0.06]">
                    <span className="text-white/40 font-bold block uppercase text-[10px]">Team Details</span>
                    <span className="text-[#E873C3] font-bold">{selectedReg.team_name} (Code: {selectedReg.team_code})</span>
                  </div>
                )}

                {/* SUBMISSION & SOLUTION EVALUATION SECTION */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#3DCB7F] uppercase tracking-wider flex items-center gap-1.5">
                      <Send size={13} /> Submission & Solution Evaluation
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${selectedReg.submission_url ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30' : 'text-white/30 bg-white/5'
                      }`}>
                      {selectedReg.submission_url ? '✓ Solution Submitted' : 'No Submission Yet'}
                    </span>
                  </div>

                  {selectedReg.submission_url ? (
                    <div className="flex flex-col gap-3 bg-black/40 p-3.5 rounded-xl border border-white/[0.08]">
                      {/* Submission URL */}
                      <div>
                        <span className="text-white/40 font-bold block uppercase text-[10px] mb-1">Submission URL / Link</span>
                        <a
                          href={selectedReg.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4ECDC4] font-mono text-xs hover:underline flex items-center gap-1 break-all"
                        >
                          {selectedReg.submission_url} <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Description / Remarks */}
                      {selectedReg.submission_details_json?.description && (
                        <div>
                          <span className="text-white/40 font-bold block uppercase text-[10px] mb-1">Project Description / Remarks</span>
                          <p className="text-xs text-white/80 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.05]">
                            {selectedReg.submission_details_json.description}
                          </p>
                        </div>
                      )}

                      {/* Submission Timestamp */}
                      {selectedReg.submission_details_json?.submitted_at && (
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-white/40">Submitted At:</span>
                          <span className="text-white/70 font-mono">{new Date(selectedReg.submission_details_json.submitted_at).toLocaleString()}</span>
                        </div>
                      )}

                      {/* Submitted Code Answers (for Contest) */}
                      {selectedReg.submission_details_json?.codeAnswers && Object.keys(selectedReg.submission_details_json.codeAnswers as unknown as Record<string, string>).length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                          <span className="text-white/50 font-bold uppercase text-[10px]">Submitted Code Answers ({Object.keys(selectedReg.submission_details_json.codeAnswers as unknown as Record<string, string>).length})</span>
                          {Object.entries(selectedReg.submission_details_json.codeAnswers as unknown as Record<string, string>).map(([qId, code], codeIdx) => (
                            <div key={qId} className="bg-[#05020a] border border-white/10 rounded-lg p-2.5 font-mono text-xs text-[#4ECDC4] overflow-x-auto">
                              <span className="text-[10px] text-white/40 font-sans block mb-1">Question #{codeIdx + 1} Code:</span>
                              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{code}</pre>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Submitted MCQ Answers */}
                      {selectedReg.submission_details_json?.mcqAnswers && Object.keys(selectedReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).length > 0 && (
                        <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.06]">
                          <span className="text-white/50 font-bold uppercase text-[10px]">Submitted MCQ Answers ({Object.keys(selectedReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).length})</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(selectedReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).map(([qId, optId], mcqIdx) => (
                              <span key={qId} className="px-2 py-1 bg-white/[0.04] border border-white/10 rounded text-[11px] font-mono text-white">
                                Q#{mcqIdx + 1}: Option <strong className="text-[#E873C3]">{optId.toUpperCase()}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 italic bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                      This participant has registered but has not submitted a solution yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {selectedReg.submission_url ? (
                  <button
                    onClick={() => {
                      const regToInspect = selectedReg;
                      setSelectedReg(null);
                      setInspectSubmissionReg(regToInspect);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#3DCB7F] hover:bg-[#32b870] transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#3DCB7F]/20"
                  >
                    <Send size={12} /> Open Full Submission Inspector
                  </button>
                ) : <div />}
                <button onClick={() => setSelectedReg(null)} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SUBMISSION INSPECTOR & EVALUATION MODAL */}
        {inspectSubmissionReg && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0b0717] border border-white/[0.15] rounded-3xl p-6 max-w-2xl w-full flex flex-col gap-5 shadow-2xl relative max-h-[85vh] overflow-hidden">
              <button onClick={() => setInspectSubmissionReg(null)} className="absolute top-5 right-5 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>

              {/* Header */}
              <div className="pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-[#3DCB7F] uppercase tracking-wider bg-[#3DCB7F]/10 px-2.5 py-0.5 rounded-full border border-[#3DCB7F]/30 flex items-center gap-1">
                    <Send size={11} /> Participant Submission Inspector
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {inspectSubmissionReg.submission_details_json?.submitted_at
                      ? new Date(inspectSubmissionReg.submission_details_json.submitted_at).toLocaleString()
                      : 'Submitted'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  {inspectSubmissionReg.details_json?.full_name || inspectSubmissionReg.users.username}&apos;s Submission
                </h2>
                <p className="text-xs text-white/50">
                  Username: @{inspectSubmissionReg.users.username} • {inspectSubmissionReg.email || inspectSubmissionReg.users.email}
                </p>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 text-xs">
                
                {/* 1. Submission Link / Target URL */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#4ECDC4] uppercase tracking-wider">Submission Link / Target URL</span>
                  <div className="flex items-center justify-between gap-3 bg-black/50 p-3 rounded-xl border border-white/10">
                    <span className="font-mono text-xs text-white/80 truncate">{inspectSubmissionReg.submission_url}</span>
                    <a
                      href={inspectSubmissionReg.submission_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg font-bold text-xs text-black bg-[#4ECDC4] hover:bg-[#3dbdb4] transition-all flex items-center gap-1 shrink-0"
                    >
                      Open Link <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* 2. Project Description / Remarks */}
                {inspectSubmissionReg.submission_details_json?.description && (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#E873C3] uppercase tracking-wider">Project Description / Remarks</span>
                    <p className="text-xs text-white/80 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                      {inspectSubmissionReg.submission_details_json.description}
                    </p>
                  </div>
                )}

                {/* 3. Submitted Code Answers */}
                {inspectSubmissionReg.submission_details_json?.codeAnswers &&
                Object.keys(inspectSubmissionReg.submission_details_json.codeAnswers as unknown as Record<string, string>).length > 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-[#3DCB7F] uppercase tracking-wider">
                      Submitted Coding Solutions ({Object.keys(inspectSubmissionReg.submission_details_json.codeAnswers as unknown as Record<string, string>).length})
                    </span>
                    {Object.entries(inspectSubmissionReg.submission_details_json.codeAnswers as unknown as Record<string, string>).map(([qId, code], codeIdx) => (
                      <div key={qId} className="flex flex-col gap-1.5 bg-[#05020a] border border-white/10 rounded-xl p-3">
                        <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/5 pb-1">
                          <span className="font-bold text-white">Coding Problem #{codeIdx + 1}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(code)}
                            className="text-white/40 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            <Copy size={10} /> Copy Code
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-[#4ECDC4] overflow-x-auto p-2 bg-black/60 rounded-lg leading-relaxed whitespace-pre-wrap max-h-[220px]">
                          {code}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* 4. Submitted MCQ Answers */}
                {inspectSubmissionReg.submission_details_json?.mcqAnswers &&
                Object.keys(inspectSubmissionReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).length > 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider">
                      Submitted MCQ Answers ({Object.keys(inspectSubmissionReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).length})
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(inspectSubmissionReg.submission_details_json.mcqAnswers as unknown as Record<string, string>).map(([qId, optId], mcqIdx) => (
                        <div key={qId} className="p-2.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                          <span className="text-white/50 font-bold">Question #{mcqIdx + 1}</span>
                          <span className="font-mono font-black text-[#E873C3] bg-[#E873C3]/10 px-2 py-0.5 rounded border border-[#E873C3]/30">
                            Option {optId.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* 5. Score & Evaluation Control */}
                <div className="bg-gradient-to-r from-[#140b28] to-[#0c0618] border border-white/15 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={14} className="text-[#FFD700]" /> Evaluation & Scoring
                    </span>
                    <p className="text-[11px] text-white/50">Update candidate score in leaderboard.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editScores[inspectSubmissionReg.users.id] ?? 100}
                      onChange={(e) => setEditScores({ ...editScores, [inspectSubmissionReg.users.id]: Number(e.target.value) })}
                      className="w-20 px-3 py-1.5 bg-[#05020a] text-white border border-white/20 rounded-xl text-center font-bold text-xs focus:outline-none focus:border-[#4ECDC4]"
                    />
                    <button
                      onClick={() => {
                        handleLbSave();
                        setInspectSubmissionReg(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-[#3DCB7F] hover:bg-[#32b870] transition-all cursor-pointer shadow-lg shadow-[#3DCB7F]/20"
                    >
                      Save Score
                    </button>
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => setInspectSubmissionReg(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-4">
            {/* Publish Results & Leaderboard Banner */}
            <div className="bg-gradient-to-r from-[#170e30] to-[#0d071d] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={16} className="text-[#FFD700]" /> Official Leaderboard Publishing
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${event.submission_config?.results_published
                    ? 'text-[#3DCB7F] bg-[#3DCB7F]/10 border border-[#3DCB7F]/30'
                    : 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                    }`}>
                    {event.submission_config?.results_published ? '📢 PUBLISHED TO CANDIDATES' : '🔒 UNPUBLISHED (HIDDEN)'}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {event.submission_config?.results_published
                    ? 'Official rankings are currently visible to all participants on the public event page.'
                    : 'Leaderboard results are hidden from participants. Click publish to make official results public.'}
                </p>
              </div>

              <button
                onClick={handleTogglePublishResults}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${event.submission_config?.results_published
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                  : 'text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/20'
                  }`}
              >
                {event.submission_config?.results_published ? '🔒 Unpublish Results' : '📢 Publish Results to Leaderboard'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-white/40">Edit scores directly and click Save Leaderboard.</p>
              <button onClick={handleLbSave} disabled={lbSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #E873C3, #8D37D6)' }}>
                <Save size={14} />{lbSaving ? 'Saving...' : 'Save Leaderboard'}
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              {lbLoading ? (
                <div className="p-4 flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
              ) : leaderboard.length === 0 ? (
                <div className="py-16 text-center text-white/30 text-sm">No leaderboard entries yet.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-lg font-black w-8 text-center" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#6b7280' }}>
                        #{entry.rank ?? i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/30 flex items-center justify-center text-xs font-black text-[#E873C3]">
                        {entry.users.username[0].toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm font-bold text-white">{entry.users.username}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={editScores[entry.users.id] ?? entry.score}
                          onChange={e => setEditScores(s => ({ ...s, [entry.users.id]: Number(e.target.value) }))}
                          className="w-24 px-3 py-1.5 bg-[#0e0a1c] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#E873C3]/50 text-center" />
                        <span className="text-xs text-white/30">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6">
            {settingsError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">{settingsError}</div>}
            {settingsSuccess && <div className="bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 rounded-xl p-4 text-sm text-[#3DCB7F] font-bold">{settingsSuccess}</div>}

            {/* Basic Info */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={lc}>Title</label>
                  <input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={ic} />
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Tagline</label>
                  <input value={form.tagline ?? ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className={ic} />
                </div>

                {/* ONLY HACKATHON AND CODING CONTEST */}
                <div>
                  <label className={lc}>Event Type</label>
                  <select value={form.event_type ?? 'hackathon'} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className={selectStyle}>
                    <option value="hackathon" className="bg-[#0c0818] text-white">🚀 Hackathon</option>
                    <option value="coding_contest" className="bg-[#0c0818] text-white">⌨️ Coding Contest</option>
                  </select>
                </div>

                <div>
                  <label className={lc}>Prize Pool Display</label>
                  <input value={form.prize_pool ?? ''} onChange={e => setForm(f => ({ ...f, prize_pool: e.target.value }))} placeholder="e.g. ₹1,00,000" className={ic} />
                </div>
              </div>
              <div>
                <label className={lc}>Description</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} className={ic + ' resize-none leading-relaxed'} />
              </div>
            </div>



            {/* Candidate Registration Form Fields */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-[#E873C3] uppercase tracking-widest flex items-center gap-1.5">
                    <ListChecks size={14} /> Candidate Registration Form Fields
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Configure which fields candidates will see and fill in the registration modal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                {[
                  { key: 'phone', label: 'Mobile / Phone Number', description: 'Collect candidate phone number for contact and updates' },
                  { key: 'college_org', label: 'College / Organization Name', description: 'Institute, university, or company name' },
                  { key: 'degree', label: 'Degree', description: 'Degree title (e.g. B.Tech, B.Sc)' },
                  { key: 'branch', label: 'Branch / Specialization', description: 'Field of study (e.g. Computer Science, AI)' },
                  { key: 'year_of_study', label: 'Year of Study', description: 'Current academic year' },
                  { key: 'city_state', label: 'City & State', description: 'Location details' },
                  { key: 'gender', label: 'Gender', description: 'Candidate gender selection' },
                  { key: 'github_url', label: 'GitHub Profile URL', description: 'Link to candidate GitHub profile' },
                  { key: 'linkedin_url', label: 'LinkedIn Profile URL', description: 'Link to candidate LinkedIn profile' },
                  { key: 'portfolio_url', label: 'Portfolio Website URL', description: 'Link to personal website or portfolio' },
                  { key: 'resume_url', label: 'Resume Drive Link', description: 'Google Drive or PDF link to candidate resume' },
                  { key: 'coding_handle', label: 'Coding Handle', description: 'Codeforces / LeetCode username' },
                  { key: 'preferred_language', label: 'Preferred Primary Language', description: 'Choice of primary programming language' },
                  { key: 'referral_source', label: 'Referral Source', description: 'How candidate discovered the event' },
                ].map(({ key, label, description }) => {
                  const isEnabled = regFieldsConfig[key]?.enabled ?? true;
                  const isRequired = regFieldsConfig[key]?.required ?? false;
                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isEnabled ? 'bg-white/[0.03] border-white/[0.12]' : 'bg-white/[0.01] border-white/[0.05] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{label}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setRegFieldsConfig((prev) => ({
                                  ...prev,
                                  [key]: {
                                    enabled: checked,
                                    required: checked ? (prev[key]?.required ?? false) : false,
                                  },
                                }));
                              }}
                              className="rounded accent-[#E873C3] cursor-pointer"
                            />
                            Enabled
                          </label>

                          {isEnabled && (
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E873C3] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isRequired}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setRegFieldsConfig((prev) => ({
                                    ...prev,
                                    [key]: {
                                      enabled: true,
                                      required: checked,
                                    },
                                  }));
                                }}
                                className="rounded accent-[#E873C3] cursor-pointer"
                              />
                              Required *
                            </label>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-white/40">{description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
              <button onClick={handleSettingsSave} disabled={settingsSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #E873C3, #8D37D6)', boxShadow: '0 4px 20px rgba(232,115,195,0.4)' }}>
                <Save size={15} />{settingsSaving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BROADCAST MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0818] border border-white/[0.12] rounded-3xl p-6 max-w-lg w-full flex flex-col gap-5 shadow-2xl relative">
            <button onClick={() => setShowBroadcastModal(false)} className="absolute top-5 right-5 text-white/40 hover:text-white">✕</button>
            <div>
              <span className="text-xs font-bold text-[#E873C3] uppercase tracking-wider">Email Broadcast</span>
              <h2 className="text-xl font-black text-white mt-0.5">Send Announcement to Participants</h2>
              <p className="text-xs text-white/50 mt-1">This will be sent to all {event._count.event_registrations} registered participants of <strong className="text-white">{event.title}</strong>.</p>
            </div>

            {broadcastStatus && (
              <div className={`p-3 rounded-xl text-xs font-bold ${broadcastStatus.startsWith('🎉') ? 'bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 text-[#3DCB7F]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {broadcastStatus}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className={lc}>Subject Line *</label>
                <input value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Round 1 Starts Today" className={ic} />
              </div>
              <div>
                <label className={lc}>Announcement Message *</label>
                <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} rows={5}
                  placeholder="Write the update message to send to participants..."
                  className={ic + ' resize-none leading-relaxed'} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowBroadcastModal(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white">Cancel</button>
              <button onClick={handleSendBroadcast} disabled={sendingBroadcast || !broadcastSubject.trim() || !broadcastMessage.trim()}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-all flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #E873C3, #8D37D6)', boxShadow: '0 4px 20px rgba(232,115,195,0.4)' }}>
                {sendingBroadcast ? 'Sending...' : '✉️ Send Announcement →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
