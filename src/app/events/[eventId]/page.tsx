'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Clock, ChevronDown, ChevronUp,
  Zap, Star, Hammer, BookOpen, CheckCircle, AlertCircle,
  UserCheck, Wrench, ArrowLeft, ExternalLink,
  Flame, Award, ShieldCheck, Copy, Check, Send, Sparkles,
  UsersRound, Globe, Medal
} from 'lucide-react';
import CosmoDexRegistrationModal, { CosmoDexRegistrationDetails, CosmoDexRegistrationFieldsConfig } from '@/components/events/CosmoDexRegistrationModal';

interface EventRound {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'coding' | 'submission' | 'interview' | 'custom';
  starts_at: string | null;
  ends_at: string | null;
  action_url: string | null;
}

interface EventPrize {
  rank: string;
  prize: string;
  perks?: string;
  badge_name?: string;
}

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  event_type: string;
  banner_url: string | null;
  status: string;
  registration_open: boolean | null;
  max_participants: number | null;
  prize_pool: string | null;
  prizes_json: EventPrize[] | null;
  tags_json: string[] | null;
  rules_json: string[] | null;
  timeline_json: { label: string; date: string; done: boolean }[] | null;
  faqs_json: { question: string; answer: string }[] | null;
  sponsors_json: { name: string; tier: string; logo_url?: string }[] | null;
  starts_at: string | null;
  ends_at: string | null;
  registration_deadline: string | null;
  participation_type: string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  enter_event_url: string | null;
  rounds_json: EventRound[] | null;
  eligibility: string | null;
  registration_fee: string | null;
  registration_fields_config?: CosmoDexRegistrationFieldsConfig | null;
  results_published?: boolean;
  submission_config: {
    mode?: 'platform' | 'google_form' | 'external_link';
    google_form_url?: string;
    external_link_url?: string;
    required_fields?: string[];
    hackathon_details?: {
      problem_statement?: string;
      tracks?: { title: string; description: string; prize: string }[];
      judging_criteria?: { criteria: string; weight?: string; description?: string }[];
    };
    assessment_details?: {
      assessment_mode?: string;
      total_questions?: number;
    };
  };
  _count: { event_registrations: number };
}

interface LeaderboardEntry {
  rank: number | null;
  score: number;
  username: string;
  avatar_url: string | null;
  totalTimeSeconds?: number;
  correctCount?: number;
}
interface UserRegistration {
  status: string;
  team_name: string | null;
  team_code: string | null;
  team_members_json: { userId: string; username: string; joinedAt: string }[] | null;
  submission_url: string | null;
  submission_details_json: { demo_url?: string; video_url?: string; tech_stack?: string; description?: string; submitted_at?: string } | null;
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string; glow: string }> = {
  hackathon: { label: 'Hackathon', icon: Zap, color: '#E873C3', glow: 'rgba(232,115,195,0.4)' },
  coding_contest: { label: 'Coding Contest', icon: Hammer, color: '#4ECDC4', glow: 'rgba(78,205,196,0.4)' },
  workshop: { label: 'Workshop', icon: BookOpen, color: '#F5A623', glow: 'rgba(245,166,35,0.4)' },
  challenge: { label: 'Challenge', icon: Star, color: '#8D37D6', glow: 'rgba(141,55,214,0.4)' },
};

type Tab = 'about' | 'rounds' | 'prizes' | 'rules' | 'leaderboard' | 'faqs';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#E873C3] transition-colors cursor-pointer"
      >
        <span>{q}</span>
        {open ? <ChevronUp size={16} className="text-[#E873C3] shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/[0.04] pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userRegistration, setUserRegistration] = useState<{
    status: string;
    team_name: string | null;
    team_code: string | null;
    team_members_json: { username: string }[] | null;
    submission_url: string | null;
    submission_details_json?: { tech_stack?: string } | null;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [showRegModal, setShowRegModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyTeamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const fetchEvent = useCallback(() => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.json())
      .then(data => {
        if (data.event) {
          setEvent(data.event);
          setUserRegistration(data.userRegistration ?? null);
          setLeaderboard(data.leaderboard ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetch('/api/notifications')
      .then(() => {})
      .catch(() => {});
  }, [fetchEvent]);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUserEmail(data.user.email || '');
          setUserName(data.user.username || data.user.full_name || '');
        }
      })
      .catch(() => {});
  }, []);

  const isRegistered = Boolean(userRegistration);
  const isOngoing = event?.status === 'ongoing';
  const isEnded = event?.status === 'ended';

  const handleRegisterSubmit = async (payload: {
    details: CosmoDexRegistrationDetails;
    teamAction?: 'create' | 'join';
    teamName?: string;
    teamCode?: string;
  }) => {
    setRegistering(true);
    setRegMsg('');
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.details.email,
          action: payload.teamAction === 'create' ? 'create_team' : payload.teamAction === 'join' ? 'join_team' : undefined,
          team_name: payload.teamName,
          team_code: payload.teamCode,
          details: payload.details,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowRegModal(false);
        setRegMsg('🎉 Registered successfully! You are now enrolled.');
        fetchEvent();
      } else {
        setRegMsg(data.error ?? 'Failed to complete registration');
      }
    } catch {
      setRegMsg('Network error');
    } finally {
      setRegistering(false);
    }
  };

  const handleWithdraw = async () => {
    setRegistering(true);
    await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
    setUserRegistration(null);
    setRegMsg('Registration withdrawn.');
    setRegistering(false);
    fetchEvent();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#06020f] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#E873C3] border-t-transparent animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-[#06020f] flex flex-col items-center justify-center gap-4 text-white">
      <AlertCircle size={40} className="text-white/20" />
      <p className="text-white/40">Event not found.</p>
      <button onClick={() => router.push('/events')} className="text-[#E873C3] text-sm hover:underline flex items-center gap-1">
        <ArrowLeft size={14} /> Back to Events
      </button>
    </div>
  );

  const typeMeta = TYPE_META[event.event_type] ?? TYPE_META.challenge;
  const TypeIcon = typeMeta.icon;

  const slotsUsed = event._count.event_registrations;
  const slotsTotal = event.max_participants;
  const slotsPercent = slotsTotal ? Math.min(100, Math.round((slotsUsed / slotsTotal) * 100)) : null;

  const regDeadlinePassed = event.registration_deadline ? new Date() > new Date(event.registration_deadline) : false;
  const isFull = slotsTotal ? slotsUsed >= slotsTotal : false;
  const canRegister = Boolean(event.registration_open && !isFull && !isEnded);
  const isTeam = event.participation_type === 'team';

  const submissionConfig = event.submission_config;
  const submissionMode = submissionConfig?.mode ?? 'platform';
  const submissionUrl = submissionMode === 'google_form'
    ? (submissionConfig?.google_form_url ?? `/events/${event.slug || event.id}/submit`)
    : submissionMode === 'external_link'
    ? (submissionConfig?.external_link_url ?? `/events/${event.slug || event.id}/submit`)
    : `/events/${event.slug || event.id}/submit`;

  const isCodingContest = event.event_type === 'coding_contest';

  const contestEnterUrl = event.enter_event_url || (isCodingContest ? `/events/${event.slug || event.id}/submit` : null);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'about', label: 'Overview' },
    {
      key: 'rounds',
      label: isCodingContest
        ? 'Timeline & Schedule'
        : `Rounds & Timeline ${event.rounds_json?.length ? `(${event.rounds_json.length})` : ''}`,
    },
    { key: 'prizes', label: 'Prizes & Rewards' },
    { key: 'rules', label: 'Rules' },
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="min-h-screen bg-[#06020f] text-white">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden pt-16">
        {event.banner_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={event.banner_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${typeMeta.color}25 0%, #8D37D625 50%, #06020f 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06020f] via-[#06020f]/70 to-transparent" />

        {/* Back button */}
        <div className="absolute top-20 left-6 sm:left-10 z-10">
          <button onClick={() => router.push('/events')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all backdrop-blur-md">
            <ArrowLeft size={13} /> Back to Events
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-6 left-6 sm:left-10 right-6 sm:right-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
              style={{ color: typeMeta.color, background: `${typeMeta.color}20`, border: `1px solid ${typeMeta.color}40` }}
            >
              <TypeIcon size={12} />{typeMeta.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${
              isOngoing ? 'text-[#E873C3] bg-[#E873C3]/15 border border-[#E873C3]/40' :
              isEnded ? 'text-white/40 bg-white/[0.06] border border-white/10' :
              'text-[#3DCB7F] bg-[#3DCB7F]/15 border border-[#3DCB7F]/40'
            }`}>
              {isOngoing ? '🔴 LIVE NOW' : isEnded ? 'Ended' : '📋 Upcoming'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white/60 bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-1">
              {isTeam ? <><UsersRound size={12} /> Team Event ({event.min_team_size || 1}-{event.max_team_size || 4} members)</> : <><UserCheck size={12} /> Individual Participation</>}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{event.title}</h1>
          {event.tagline && <p className="text-white/60 text-sm md:text-base max-w-3xl">{event.tagline}</p>}
        </div>
      </div>

      {/* 🔴 LIVE CODING CONTEST BANNER */}
      {isOngoing && isRegistered && isCodingContest && contestEnterUrl && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 mt-6">
          <div
            className="relative overflow-hidden rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(61,203,127,0.1))',
              borderColor: 'rgba(78,205,196,0.5)',
              boxShadow: '0 0 35px rgba(78,205,196,0.25)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4ECDC4]/20 border border-[#4ECDC4]/40 flex items-center justify-center shrink-0">
                <Flame size={28} className="text-[#4ECDC4] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4] animate-pulse" />
                  <h3 className="font-black text-xl text-white">Contest is Live — Enter Contest Arena!</h3>
                </div>
                <p className="text-sm text-white/80">You are registered. The coding environment is active. Solve MCQs & Coding Problems in CosmoDex IDE.</p>
              </div>
            </div>
            <Link
              href={contestEnterUrl}
              className="px-6 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 shrink-0 transition-all shadow-lg hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#4ECDC4,#3DCB7F)', boxShadow: '0 4px 20px rgba(78,205,196,0.4)' }}
            >
              <span>Enter Contest Arena Now</span>
              <Send size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* ⏳ UPCOMING REGISTERED EVENT REMINDER */}
      {!isOngoing && !isEnded && isRegistered && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 mt-6">
          <div className="p-4 bg-[#8D37D6]/10 border border-[#8D37D6]/30 rounded-xl flex items-center justify-between gap-4">
            <span className="text-xs text-white/80 font-medium">
              🎉 You are registered for this event!
              {isCodingContest
                ? ' The "Enter Contest Arena" button will activate as soon as the contest begins.'
                : ' The project submission portal will open when the hackathon begins.'}
            </span>
            <span className="text-[10px] font-bold text-[#E873C3] bg-[#E873C3]/10 px-3 py-1 rounded-full border border-[#E873C3]/30 shrink-0">
              Registered
            </span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Tabs + Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Smooth Sliding Tabs Bar */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1.5 overflow-x-auto backdrop-blur-md">
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-colors duration-200 flex-1 cursor-pointer select-none ${
                    isActive ? 'text-[#E873C3]' : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-event-detail-tab"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E873C3]/20 via-[#8D37D6]/20 to-[#4ECDC4]/15 border border-[#E873C3]/50 shadow-[0_0_20px_rgba(232,115,195,0.3)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Smooth Tab Content Animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* TAB 1: ABOUT / OVERVIEW */}
              {activeTab === 'about' && (
                <div className="flex flex-col gap-6">
                  {/* Highlights cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Participation</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        {isTeam ? <><UsersRound size={13} className="text-[#E873C3]" /> Team ({event.min_team_size || 1}-{event.max_team_size || 4})</> : <><UserCheck size={13} className="text-[#3DCB7F]" /> Individual</>}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Eligibility</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        <Globe size={13} className="text-[#4ECDC4]" /> {event.eligibility ?? 'Open to All'}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Fee</p>
                      <p className="text-sm font-bold text-[#3DCB7F] flex items-center gap-1">
                        <ShieldCheck size={13} /> {event.registration_fee ?? 'Free'}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Prize Pool</p>
                      <p className="text-sm font-bold text-[#FFD700] flex items-center gap-1">
                        <Trophy size={13} /> {event.prize_pool || 'Rewards & Perks'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-3">
                      <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">About the Event</h2>
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{event.description}</div>
                    </div>
                  )}

                  {/* Hackathon Problem Statements / Tracks */}
                  {submissionConfig?.hackathon_details?.tracks && submissionConfig.hackathon_details.tracks.length > 0 && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                      <h2 className="text-xs font-bold text-[#E873C3] uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} /> Hackathon Tracks & Challenges
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.submission_config?.hackathon_details?.tracks?.map((tr, i) => (
                          <div key={i} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex flex-col gap-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-white">{tr.title}</span>
                              {tr.prize && <span className="text-xs font-black text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-0.5 rounded border border-[#FFD700]/30">{tr.prize}</span>}
                            </div>
                            {tr.description && <p className="text-xs text-white/60 leading-relaxed">{tr.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Judging Rubrics */}
                  {event.submission_config?.hackathon_details?.judging_criteria && event.submission_config.hackathon_details.judging_criteria.length > 0 && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-[#4ECDC4] uppercase tracking-widest flex items-center gap-2">
                        <Award size={14} /> Judging Rubrics & Criteria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {event.submission_config.hackathon_details.judging_criteria.map((jc, i) => (
                          <div key={i} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{jc.criteria}</span>
                              {jc.weight && <span className="text-[10px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 px-2 py-0.5 rounded">{jc.weight}</span>}
                            </div>
                            {jc.description && <p className="text-xs text-white/50">{jc.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Coding Contest Assessment Details */}
              {event.event_type === 'coding_contest' && event.submission_config?.assessment_details && (
                <div className="bg-[#4ECDC4]/[0.04] border border-[#4ECDC4]/30 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#4ECDC4] uppercase tracking-widest flex items-center gap-2">
                      <Wrench size={14} /> Contest Assessment Format
                    </h3>
                    <span className="text-xs font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 px-3 py-1 rounded-full border border-[#4ECDC4]/30 uppercase">
                      {event.submission_config.assessment_details.assessment_mode?.replace('_', ' ') || 'Coding & MCQ'}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    This contest will feature {event.submission_config.assessment_details.total_questions || 0} questions evaluated automatically in CosmoDex&apos;s online IDE.
                  </p>
                </div>
              )}

              {/* Tags */}
              {event.tags_json && (event.tags_json as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(event.tags_json as string[]).map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.08]">{tag}</span>
                  ))}
                </div>
              )}

              {/* User Team Card if registered */}
              {isRegistered && isTeam && userRegistration && (
                <div className="bg-[#8D37D6]/10 border border-[#8D37D6]/30 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E873C3] uppercase tracking-wider flex items-center gap-1.5">
                      <UsersRound size={14} /> Your Team Information
                    </span>
                    {userRegistration.team_code && (
                      <button
                        onClick={() => handleCopyTeamCode(userRegistration.team_code!)}
                        className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10 transition-colors"
                      >
                        {copiedCode ? <Check size={12} className="text-[#3DCB7F]" /> : <Copy size={12} />}
                        Code: <span className="font-mono text-[#E873C3]">{userRegistration.team_code}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-base font-black text-white">Team Name: {userRegistration.team_name || 'My Team'}</p>

                  {userRegistration.team_members_json && userRegistration.team_members_json.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-bold text-white/40">Team Members ({userRegistration.team_members_json.length + 1}):</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-bold flex items-center gap-1">
                          👑 (You)
                        </span>
                        {userRegistration.team_members_json.map((m, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white/70">
                            {m.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Submission Card if submitted */}
              {isRegistered && userRegistration?.submission_url && (
                <div className="bg-[#3DCB7F]/10 border border-[#3DCB7F]/30 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#3DCB7F] font-bold text-xs">
                    <CheckCircle size={14} /> Solution / Project Submitted
                  </div>
                  <a href={userRegistration.submission_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-white hover:text-[#3DCB7F] flex items-center gap-1.5 underline">
                    {userRegistration.submission_url} <ExternalLink size={12} />
                  </a>
                  {userRegistration.submission_details_json?.tech_stack && (
                    <p className="text-xs text-white/40">Tech Stack: {userRegistration.submission_details_json.tech_stack}</p>
                  )}
                </div>
              )}

              {/* Sponsors */}
              {event.sponsors_json && (event.sponsors_json as { name: string; tier: string }[]).length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Sponsors & Partners</h2>
                  <div className="flex flex-wrap gap-3">
                    {(event.sponsors_json as { name: string; tier: string }[]).map((sp, i) => (
                      <div key={i} className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-white/80">
                        {sp.name}
                        <span className="ml-2 text-[10px] font-bold text-[#E873C3] uppercase px-2 py-0.5 rounded bg-[#E873C3]/10 border border-[#E873C3]/20">{sp.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

              {/* TAB 2: ROUNDS & TIMELINE */}
              {activeTab === 'rounds' && (
                <div className="flex flex-col gap-6">
                                    {event.rounds_json && event.rounds_json.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Event Rounds</h2>
                      <div className="flex flex-col gap-3">
                        {event.rounds_json.map((r, i) => (
                          <div key={r.id || i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#E873C3]/15 border border-[#E873C3]/30 text-[#E873C3] font-black text-sm flex items-center justify-center shrink-0">
                                R{i + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-base">{r.title}</h3>
                                <p className="text-xs text-white/60 mt-0.5">{r.description}</p>
                                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] uppercase font-bold text-white/50">
                                  Type: {r.type}
                                </span>
                              </div>
                            </div>
                            {r.action_url && (
                              <a
                                href={r.action_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-[#E873C3]/20 hover:bg-[#E873C3]/30 text-[#E873C3] text-xs font-bold border border-[#E873C3]/40 flex items-center gap-1.5 self-start md:self-center shrink-0 transition-colors"
                              >
                                <span>Go to Round</span>
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : event.timeline_json && event.timeline_json.length > 0 ? (
                <div className="relative flex flex-col gap-0 pl-4">
                  <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[#4ECDC4]/60 via-white/10 to-transparent" />
                  {event.timeline_json.map((entry, i) => {
                    const isPast = entry.date ? new Date() >= new Date(entry.date) : entry.done;
                    return (
                      <div key={i} className="relative flex gap-4 pl-8 pb-6">
                        <div
                          className="absolute left-1.5 top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                          style={isPast
                            ? { background: '#4ECDC4', borderColor: '#4ECDC4', boxShadow: '0 0 10px rgba(78,205,196,0.6)' }
                            : { background: '#06020f', borderColor: 'rgba(255,255,255,0.2)' }
                          }
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${isPast ? 'text-white' : 'text-white/50'}`}>{entry.label}</p>
                          {entry.date && (
                            <p className="text-xs text-white/35 mt-0.5">
                              {new Date(entry.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-white/40 uppercase">Starts At</span>
                    <span className="text-sm font-bold text-white">{event.starts_at ? new Date(event.starts_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-white/40 uppercase">Ends At</span>
                    <span className="text-sm font-bold text-white">{event.ends_at ? new Date(event.ends_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-white/40 uppercase">Registration Deadline</span>
                    <span className="text-sm font-bold text-white">{event.registration_deadline ? new Date(event.registration_deadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Open'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRIZES & REWARDS */}
          {activeTab === 'prizes' && (
            <div className="flex flex-col gap-6">
              {event.prizes_json && event.prizes_json.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {event.prizes_json.map((prize, idx) => {
                    const colors = [
                      { bg: 'from-[#FFD700]/20 to-transparent', border: '#FFD700', text: '#FFD700', icon: Medal },
                      { bg: 'from-[#C0C0C0]/20 to-transparent', border: '#C0C0C0', text: '#C0C0C0', icon: Trophy },
                      { bg: 'from-[#CD7F32]/20 to-transparent', border: '#CD7F32', text: '#CD7F32', icon: Award },
                    ];
                    const meta = colors[idx] ?? colors[2];
                    const Icon = meta.icon;

                    return (
                      <div key={idx} className={`relative bg-gradient-to-b ${meta.bg} border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-3 overflow-hidden`}
                        style={{ borderColor: `${meta.border}50` }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${meta.border}20`, border: `1px solid ${meta.border}60` }}>
                          <Icon size={24} style={{ color: meta.text }} />
                        </div>
                        <h3 className="font-black text-lg text-white">{prize.rank}</h3>
                        <p className="text-xl font-black" style={{ color: meta.text }}>{prize.prize}</p>
                        {prize.perks && <p className="text-xs text-white/60 border-t border-white/10 pt-2 w-full">{prize.perks}</p>}
                        {prize.badge_name && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
                            🎖️ {prize.badge_name} Badge
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                  <Trophy size={40} className="text-[#FFD700]" />
                  <h3 className="font-black text-xl text-white">Prize Pool: {event.prize_pool || 'Perks & Badges'}</h3>
                  <p className="text-xs text-white/50 max-w-md">Top performers will receive certificates, CosmoDex XP points, and platform badges upon completion.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Rules & Guidelines</h2>
              {!event.rules_json || (event.rules_json as string[]).length === 0 ? (
                <p className="text-white/30 text-sm">Standard CosmoDex competition rules apply.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {(event.rules_json as string[]).map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#E873C3] font-black shrink-0 w-6 text-right">{i + 1}.</span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* TAB 5: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Official Leaderboard</h2>
                <span className="text-xs text-white/40">{event.results_published ? `${leaderboard.length} ranked entries` : 'Pending Publication'}</span>
              </div>
              {!event.results_published ? (
                <div className="py-16 px-6 text-center flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
                    <Trophy size={28} style={{ color: '#FFD700' }} />
                  </div>
                  <h3 className="text-base font-bold text-white">Leaderboard & Results Pending</h3>
                  <p className="text-xs text-white/50 max-w-md leading-relaxed">
                    The official leaderboard and evaluation results will be published by the event organizers once final scoring is completed.
                  </p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-16 text-center">
                  <Trophy size={36} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No leaderboard entries recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {leaderboard.map((entry, i) => {
                    const rankNum = entry.rank ?? i + 1;
                    const totalSec = entry.totalTimeSeconds;
                    const m = totalSec !== undefined ? Math.floor(totalSec / 60) : null;
                    const s = totalSec !== undefined ? totalSec % 60 : null;
                    const timeStr = m !== null && s !== null ? (m > 0 ? `${m}m ${s}s` : `${s}s`) : null;

                    return (
                      <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i < 3 ? 'bg-white/[0.01]' : ''}`}>
                        <span className="text-lg font-black w-8 text-center" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#6b7280' }}>
                          #{rankNum}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/30 flex items-center justify-center text-xs font-black text-[#E873C3]">
                          {entry.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-white block truncate">{entry.username}</span>
                          {timeStr && (
                            <span className="text-[11px] font-mono text-cyan-300/80 flex items-center gap-1 mt-0.5">
                              ⏱️ {timeStr}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black block" style={{ color: i === 0 ? '#FFD700' : '#E873C3' }}>
                            {entry.score.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

              {/* TAB 6: FAQS */}
              {activeTab === 'faqs' && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Frequently Asked Questions</h2>
                  {!event.faqs_json || (event.faqs_json as { question: string; answer: string }[]).length === 0 ? (
                    <p className="text-white/30 text-sm">No specific FAQs added yet.</p>
                  ) : (
                    (event.faqs_json as { question: string; answer: string }[]).map((faq, i) => (
                      <FaqItem key={i} q={faq.question} a={faq.answer} />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* Main Action Card */}
            <div className="bg-[#0c0818] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {/* Prize Pool Header */}
              {event.prize_pool && (
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-[#FFD700]" />
                    <span className="text-xs font-bold text-white/60">Prize Pool</span>
                  </div>
                  <span className="text-sm font-black text-[#FFD700]">{event.prize_pool}</span>
                </div>
              )}

              {/* Registration Stats */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <Users size={13} className="text-[#E873C3]" /> Registered
                  </span>
                  <span className="text-white font-bold">
                    {slotsUsed}{slotsTotal ? ` / ${slotsTotal}` : ''}
                  </span>
                </div>
                {slotsPercent !== null && (
                  <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#E873C3] to-[#8D37D6] h-full rounded-full transition-all duration-300"
                      style={{ width: `${slotsPercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Timeline Dates */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.06] text-xs">
                {event.starts_at && (
                  <div className="flex items-center justify-between text-white/60">
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#3DCB7F]" /> Starts</span>
                    <span className="font-bold text-white/80">{new Date(event.starts_at).toLocaleDateString()}</span>
                  </div>
                )}
                {event.ends_at && (
                  <div className="flex items-center justify-between text-white/60">
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#E873C3]" /> Ends</span>
                    <span className="font-bold text-white/80">{new Date(event.ends_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Registration Status Feedback Message */}
              {regMsg && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/90 leading-relaxed">
                  {regMsg}
                </div>
              )}

              {/* Dynamic Action Button */}
              {isRegistered ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full py-3 rounded-xl bg-[#3DCB7F]/15 border border-[#3DCB7F]/40 text-[#3DCB7F] text-xs font-black text-center flex items-center justify-center gap-2">
                    <CheckCircle size={15} />
                    <span>Registered for Event</span>
                  </div>
                  {/* Enter Contest Arena Button when LIVE */}
                  {isOngoing && contestEnterUrl && (
                    <Link
                      href={contestEnterUrl}
                      className="w-full py-3 rounded-xl font-black text-xs text-white text-center flex items-center justify-center gap-1.5 transition-all shadow-lg hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg,#E873C3,#8D37D6)', boxShadow: '0 4px 20px rgba(232,115,195,0.4)' }}
                    >
                      <Flame size={14} className="animate-pulse" />
                      <span>{isCodingContest ? 'Enter Contest Arena' : 'Submit Project'}</span>
                    </Link>
                  )}
                  {canRegister && (
                    <button
                      onClick={handleWithdraw}
                      disabled={registering}
                      className="text-[11px] font-semibold text-white/30 hover:text-red-400 text-center transition-colors cursor-pointer"
                    >
                      Withdraw Registration
                    </button>
                  )}
                </div>
              ) : isEnded ? (
                <div className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-xs font-bold text-center">
                  Event Concluded
                </div>
              ) : regDeadlinePassed ? (
                <div className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-xs font-bold text-center">
                  Registration Deadline Passed
                </div>
              ) : isFull ? (
                <div className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-xs font-bold text-center">
                  Registration Full ({slotsTotal} max)
                </div>
              ) : canRegister ? (
                <button
                  onClick={() => setShowRegModal(true)}
                  disabled={registering}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg,#E873C3,#8D37D6)',
                    boxShadow: '0 4px 25px rgba(232,115,195,0.4)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Register Now</span>
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-xs font-bold text-center">
                  Registration Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CosmoDex Candidate Pass Registration Modal */}
      <AnimatePresence>
        {showRegModal && event && (
          <CosmoDexRegistrationModal
            isOpen={showRegModal}
            onClose={() => setShowRegModal(false)}
            onSubmit={handleRegisterSubmit}
            eventTitle={event.title}
            isTeamEvent={isTeam}
            fieldsConfig={event.registration_fields_config}
            initialEmail={userEmail}
            initialName={userName}
            submitting={registering}
            errorMessage={regMsg}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
