'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Clock, ChevronDown, ChevronUp,
  Zap, Star, Hammer, BookOpen, CheckCircle, AlertCircle,
  UserCheck, ArrowLeft, ExternalLink,
  Flame, Award, ShieldCheck, Copy, Check, Send, Sparkles,
  UsersRound, Globe, Medal, CheckCircle2, Lock, Eye, EyeOff, ShieldAlert, KeyRound, Code2
} from 'lucide-react';
import CosmoDexRegistrationModal, { CosmoDexRegistrationDetails, CosmoDexRegistrationFieldsConfig } from '@/components/events/CosmoDexRegistrationModal';
import RisingStars from '@/components/RisingStar';
import Footer from '@/components/landing/Footer';

interface EventRound {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  desc?: string;
  type?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  action_url?: string | null;
}

interface EventPrize {
  rank?: string | number;
  title?: string;
  prize?: string;
  amount?: string;
  reward?: string;
  perks?: string;
  description?: string;
  badge_name?: string;
}

interface EventTimelineEntry {
  label?: string;
  title?: string;
  name?: string;
  date?: string;
  time?: string;
  datetime?: string;
  done?: boolean;
  is_completed?: boolean;
  completed?: boolean;
  description?: string;
  desc?: string;
}

interface EventRuleItem {
  text?: string;
  rule?: string;
  title?: string;
}

interface EventFaqItem {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
  title?: string;
  description?: string;
}

interface HackathonTrackItem {
  title?: string;
  name?: string;
  description?: string;
  desc?: string;
  prize?: string;
  reward?: string;
}

interface HackathonJudgingItem {
  criteria?: string;
  name?: string;
  title?: string;
  weight?: string;
  description?: string;
  desc?: string;
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
  rules_json: (string | EventRuleItem)[] | null;
  timeline_json: EventTimelineEntry[] | null;
  faqs_json: EventFaqItem[] | null;
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
      tracks?: (string | HackathonTrackItem)[];
      judging_criteria?: (string | HackathonJudgingItem)[];
    };
    assessment_details?: {
      assessment_mode?: string;
      total_questions?: number;
      duration_minutes?: number;
    };
  };
  is_private?: boolean;
  secret_id?: string;
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
  team_members_json: { userId?: string; username?: string; email?: string; role?: string; joinedAt?: string }[] | null;
  submission_url: string | null;
  submission_details_json?: { demo_url?: string; video_url?: string; tech_stack?: string; description?: string; submitted_at?: string } | null;
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
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] backdrop-blur-md">
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
            <div className="px-5 pb-4 text-xs text-white/70 leading-relaxed border-t border-white/[0.06] pt-3">
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
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [showRegModal, setShowRegModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string>(() => {
    if (typeof window !== 'undefined' && eventId) {
      // Check by current eventId param (slug or UUID)
      return sessionStorage.getItem(`event_unlock_${eventId}`) || '';
    }
    return '';
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && eventId) {
      return Boolean(sessionStorage.getItem(`event_unlock_${eventId}`));
    }
    return false;
  });
  const [secretIdInput, setSecretIdInput] = useState<string>('');
  const [secretPassInput, setSecretPassInput] = useState<string>('');
  const [showSecretPass, setShowSecretPass] = useState<boolean>(false);
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>('');
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);

  const handleUnlockEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!secretPassInput.trim()) {
      setUnlockError("Please enter the secret password");
      return;
    }
    setUnlockLoading(true);
    setUnlockError("");
    try {
      const res = await fetch(`/api/events/${eventId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: secretPassInput.trim(),
          secret_id: secretIdInput.trim() || event?.secret_id || "",
          secret_password: secretPassInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.unlocked) {
        setIsUnlocked(true);
        if (data.unlock_token) {
          setUnlockToken(data.unlock_token);
          // Store under both the URL param key (slug/UUID) and the canonical UUID key
          // so retrieval works regardless of how the user navigated to the page
          sessionStorage.setItem(`event_unlock_${eventId}`, data.unlock_token);
          if (data.event_id && data.event_id !== eventId) {
            sessionStorage.setItem(`event_unlock_${data.event_id}`, data.unlock_token);
          }
        }
        if (data.event) {
          setEvent(data.event);
        }
        setShowUnlockModal(false);
        setRegMsg("🔓 Event unlocked successfully! You can now register.");
      } else {
        setUnlockError(data.error || "Invalid Secret Access ID or Password");
      }
    } catch {
      setUnlockError("Network error while unlocking event");
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleCopyTeamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const fetchEvent = useCallback(() => {
    const token = unlockToken || (typeof window !== 'undefined' ? sessionStorage.getItem(`event_unlock_${eventId}`) : '');
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    };
    if (token) {
      headers['x-unlock-token'] = token;
    }
    const storedEmail = typeof window !== 'undefined' ? (sessionStorage.getItem(`event_reg_email_${eventId}`) || userEmail) : userEmail;
    if (storedEmail) {
      headers['x-user-email'] = storedEmail;
    }

    const query = new URLSearchParams();
    query.set('t', Date.now().toString());
    if (storedEmail) {
      query.set('email', storedEmail);
    }

    fetch(`/api/events/${eventId}?${query.toString()}`, {
      headers,
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(data => {
        if (data.event) {
          setEvent(data.event);
          if (data.userRegistration && data.userRegistration.status === 'registered') {
            setUserRegistration(data.userRegistration);
            try {
              sessionStorage.setItem(`event_reg_${eventId}`, JSON.stringify(data.userRegistration));
            } catch { }
          } else {
            try {
              const cached = sessionStorage.getItem(`event_reg_${eventId}`);
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.status === 'registered') {
                  setUserRegistration(parsed);
                  return;
                }
              }
            } catch { }
            setUserRegistration(null);
          }
          setLeaderboard(data.leaderboard ?? []);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [eventId, unlockToken, userEmail]);

  useEffect(() => {
    fetchEvent();
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
      .catch(() => { });
  }, []);

  const isRegistered = Boolean(userRegistration && userRegistration.status === 'registered');
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
          unlock_token: unlockToken || undefined,
          secret_id: secretIdInput || event?.secret_id || undefined,
          secret_password: secretPassInput || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowRegModal(false);
        setRegMsg('🎉 Registered successfully! You are now enrolled.');
        if (data.registration) {
          const newReg: UserRegistration = {
            status: data.registration.status || 'registered',
            team_name: data.registration.team_name ?? null,
            team_code: data.registration.team_code ?? null,
            team_members_json: data.registration.team_members_json ?? data.registration.team_members ?? null,
            submission_url: data.registration.submission_url ?? null,
            submission_details_json: data.registration.submission_details_json ?? null,
          };
          setUserRegistration(newReg);
          try {
            sessionStorage.setItem(`event_reg_${eventId}`, JSON.stringify(newReg));
            if (payload.details.email) {
              sessionStorage.setItem(`event_reg_email_${eventId}`, payload.details.email);
            }
          } catch { }
        }
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
    try {
      sessionStorage.removeItem(`event_reg_${eventId}`);
      sessionStorage.removeItem(`event_reg_email_${eventId}`);
    } catch { }
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
  const contestEnterUrl = event.enter_event_url || (isCodingContest ? `/events/${event.slug || event.id}/submit` : submissionUrl);

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

  const hasSubmitted = Boolean(userRegistration?.submission_url);

  const modernHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display), "Hitchcut", sans-serif',
    letterSpacing: '0.04em',
  };

  const formatPrize = (val: string | null | undefined): string => {
    if (!val) return 'Rewards & Perks';
    const trimmed = String(val).trim();
    if (!trimmed) return 'Rewards & Perks';
    if (/^\d+$/.test(trimmed)) {
      return '₹' + Number(trimmed).toLocaleString('en-IN');
    }
    return trimmed;
  };

  const formatDisplayDateTime = (val: string | null | undefined): string => {
    if (!val) return 'TBA';
    const trimmed = String(val).trim();
    if (!trimmed) return 'TBA';
    if (/^\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?$/i.test(trimmed)) {
      return trimmed;
    }
    try {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) return trimmed;
      const dateStr = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const hours = d.getHours();
      const minutes = d.getMinutes();
      if (hours !== 0 || minutes !== 0) {
        const timeStr = d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return `${dateStr} • ${timeStr}`;
      }
      return dateStr;
    } catch {
      return trimmed;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      {/* ── Deep Space Cosmic Background FX ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />

        {/* Shooting Stars Animations */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: '150px', rotate: -35, top: '10%', right: '-10%' }}
          animate={{ x: [0, -1200], y: [0, 800], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: '120px', rotate: -35, top: '35%', right: '-5%' }}
          animate={{ x: [0, -1100], y: [0, 750], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 7, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          style={{ width: '180px', rotate: -35, top: '-5%', right: '25%' }}
          animate={{ x: [0, -1400], y: [0, 950], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 10, ease: 'linear' }}
        />
        <RisingStars size={600} speed={1.8} />
      </div>

      {/* Hero Banner */}
      <div className="relative z-10 w-full overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-12 border-b border-white/[0.06]">
        {event.banner_url ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={event.banner_url}
              alt={event.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/85 to-[#050508]/45" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#09041a] via-[#070314] to-[#050508]" />
            <div
              className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full blur-[140px] opacity-30"
              style={{ background: typeMeta.color }}
            />
            <div
              className="absolute top-10 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-[#8D37D6]/25 via-[#E873C3]/15 to-transparent rounded-full blur-[140px]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 flex flex-col gap-4">
          {/* Breadcrumb / Back Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-1">
            <button
              onClick={() => router.push('/events')}
              className="hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 backdrop-blur-md cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Events</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white/60 truncate max-w-xs">{event.title}</span>
          </div>

          {/* Badges Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm"
              style={{ color: typeMeta.color, background: `${typeMeta.color}18`, border: `1px solid ${typeMeta.color}45` }}
            >
              <TypeIcon size={13} />
              {typeMeta.label}
            </span>
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase backdrop-blur-md flex items-center gap-1.5 ${
                isOngoing
                  ? 'text-[#E873C3] bg-[#E873C3]/15 border border-[#E873C3]/40 shadow-[0_0_12px_rgba(232,115,195,0.3)]'
                  : isEnded
                  ? 'text-white/40 bg-white/[0.06] border border-white/10'
                  : 'text-[#3DCB7F] bg-[#3DCB7F]/15 border border-[#3DCB7F]/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? 'bg-[#E873C3] animate-ping' : isEnded ? 'bg-white/40' : 'bg-[#3DCB7F]'}`} />
              {isOngoing ? 'Live Now' : isEnded ? 'Ended' : 'Upcoming'}
            </span>
            {event.is_private && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,166,35,0.25)]">
                <Lock size={12} className="text-amber-300" />
                Private Event
              </span>
            )}
            {hasSubmitted && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#3DCB7F]/15 text-[#3DCB7F] border border-[#3DCB7F]/40 backdrop-blur-md flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Submitted
              </span>
            )}
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white/75 bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-1.5">
              {isTeam ? (
                <>
                  <UsersRound size={13} className="text-purple-300" /> Team Event ({event.min_team_size || 1}-{event.max_team_size || 4} members)
                </>
              ) : (
                <>
                  <UserCheck size={13} className="text-cyan-300" /> Individual Participation
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl"
            style={modernHeadingStyle}
          >
            {event.title}
          </h1>

          {/* Tagline */}
          {event.tagline ? (
            <p className="text-white/75 text-sm md:text-base max-w-3xl leading-relaxed font-sans">{event.tagline}</p>
          ) : (
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl font-sans">
              Compete, learn, and test your skills in this official CosmoDex platform event.
            </p>
          )}
        </div>
      </div>

      {/* 🔴 LIVE CODING CONTEST BANNER */}
      {isOngoing && isRegistered && !hasSubmitted && isCodingContest && contestEnterUrl && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 mt-6">
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
                  <h3 className="font-black text-xl text-white" style={modernHeadingStyle}>Contest is Live — Enter Contest Arena!</h3>
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

      {/* 🔒 PRIVATE EVENT LOCKED ACCESS BANNER */}
      {event.is_private && !isRegistered && !isUnlocked && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 mt-6">
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-2xl group transition-all"
            style={{
              background: 'radial-gradient(ellipse at top left, rgba(245, 166, 35, 0.16) 0%, rgba(141, 55, 214, 0.12) 45%, rgba(10, 6, 24, 0.96) 100%)',
              borderColor: 'rgba(245, 166, 35, 0.45)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(245, 166, 35, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Ambient cyber grid glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/25 to-purple-600/25 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(245,166,35,0.35)] backdrop-blur-md">
                  <Lock size={28} className="text-amber-300 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,166,35,0.2)]">
                    <ShieldAlert size={11} /> Restricted Access
                  </span>
                  {event.secret_id && (
                    <span className="text-[11px] text-amber-200/80 font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                      ID: {event.secret_id}
                    </span>
                  )}
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug"
                  style={modernHeadingStyle}
                >
                  Private Event Portal Locked
                </h2>
                <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl leading-relaxed font-sans">
                  This contest is invite-only. Enter the <strong className="text-amber-300 font-semibold">Secret Access ID</strong> & <strong className="text-amber-300 font-semibold">Passcode</strong> provided by your host to unlock registration and the contest arena.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowUnlockModal(true)}
              className="relative z-10 w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 shrink-0 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer group/btn"
              style={{
                background: 'linear-gradient(135deg, #F5A623 0%, #D95FD1 50%, #8D37D6 100%)',
                boxShadow: '0 4px 25px rgba(245, 166, 35, 0.45), 0 0 15px rgba(217, 95, 209, 0.3)',
              }}
            >
              <KeyRound size={16} className="text-amber-200 group-hover/btn:rotate-12 transition-transform duration-300" />
              <span>Unlock Event With Passcode</span>
            </button>
          </div>
        </div>
      )}

      {/* ⏳ UPCOMING REGISTERED EVENT REMINDER */}
      {!isOngoing && !isEnded && isRegistered && !hasSubmitted && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 mt-6">
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Tabs + Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Smooth Sliding Tabs Bar */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-1.5 overflow-x-auto backdrop-blur-md">
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-150 flex-1 cursor-pointer select-none ${
                    isActive
                      ? 'text-[#E873C3] bg-gradient-to-r from-[#E873C3]/20 via-[#8D37D6]/20 to-[#4ECDC4]/15 border border-[#E873C3]/50 shadow-[0_0_20px_rgba(232,115,195,0.3)]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Container */}
          <div key={activeTab} className="flex flex-col gap-6">
              {/* TAB 1: ABOUT / OVERVIEW */}
              {activeTab === 'about' && (
                <div className="flex flex-col gap-6">
                  {/* Highlights cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 shadow-lg backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        Participation
                      </p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {isTeam ? (
                          <><span className="p-1.5 rounded-lg bg-[#E873C3]/15 text-[#E873C3] shrink-0"><UsersRound size={14} /></span> Team ({event.min_team_size || 1}-{event.max_team_size || 4})</>
                        ) : (
                          <><span className="p-1.5 rounded-lg bg-[#3DCB7F]/15 text-[#3DCB7F] shrink-0"><UserCheck size={14} /></span> Individual</>
                        )}
                      </p>
                    </div>
                    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 shadow-lg backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Eligibility</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2 truncate">
                        <span className="p-1.5 rounded-lg bg-[#4ECDC4]/15 text-[#4ECDC4] shrink-0"><Globe size={14} /></span>
                        <span className="truncate">{event.eligibility ?? 'Open to All'}</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 shadow-lg backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Fee</p>
                      <p className="text-sm font-bold text-[#3DCB7F] flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#3DCB7F]/15 text-[#3DCB7F] shrink-0"><ShieldCheck size={14} /></span>
                        {event.registration_fee ?? 'Free'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 shadow-lg backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Prize Pool</p>
                      <p className="text-sm font-black text-[#FFD700] flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#FFD700]/15 text-[#FFD700] shrink-0"><Trophy size={14} /></span>
                        {formatPrize(event.prize_pool)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-md">
                      <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest" style={modernHeadingStyle}>About the Event</h2>
                      <div className="text-sm text-white/90 leading-relaxed whitespace-pre-line">{event.description}</div>
                    </div>
                  )}

                  {/* Hackathon Problem Statements / Tracks */}
                  {submissionConfig?.hackathon_details && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 backdrop-blur-md">
                      {submissionConfig.hackathon_details.problem_statement && (
                        <div className="flex flex-col gap-1.5 pb-4 border-b border-white/10">
                          <span className="text-[10px] font-bold text-[#E873C3] uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles size={13} /> Problem Statement
                          </span>
                          <p className="text-sm font-bold text-white leading-relaxed">
                            {submissionConfig.hackathon_details.problem_statement}
                          </p>
                        </div>
                      )}

                      {submissionConfig.hackathon_details.tracks && submissionConfig.hackathon_details.tracks.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <h2 className="text-xs font-bold text-[#E873C3] uppercase tracking-widest flex items-center gap-2" style={modernHeadingStyle}>
                            <Sparkles size={14} /> Hackathon Tracks & Challenges
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {submissionConfig.hackathon_details.tracks.map((tr, i) => {
                              const trackTitle = typeof tr === 'string' ? tr : (tr.title || tr.name || `Track ${i + 1}`);
                              const trackDesc = typeof tr === 'string' ? null : (tr.description || tr.desc || null);
                              const trackPrize = typeof tr === 'string' ? null : (tr.prize || tr.reward || null);

                              return (
                                <div key={i} className="p-4 bg-white/[0.04] border border-white/10 hover:border-[#E873C3]/40 transition-all rounded-xl flex flex-col gap-2 relative overflow-hidden">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-white">{trackTitle}</span>
                                    {trackPrize && <span className="text-xs font-black text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-0.5 rounded border border-[#FFD700]/30">{trackPrize}</span>}
                                  </div>
                                  {trackDesc && <p className="text-xs text-white/70 leading-relaxed">{trackDesc}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Judging Rubrics */}
                  {submissionConfig?.hackathon_details?.judging_criteria && submissionConfig.hackathon_details.judging_criteria.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-md">
                      <h3 className="text-xs font-bold text-[#4ECDC4] uppercase tracking-widest flex items-center gap-2" style={modernHeadingStyle}>
                        <Award size={14} /> Judging Rubrics & Criteria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {submissionConfig.hackathon_details.judging_criteria.map((jc, i) => {
                          const criteriaName = typeof jc === 'string' ? jc : (jc.criteria || jc.name || jc.title || `Criterion ${i + 1}`);
                          const criteriaWeight = typeof jc === 'string' ? null : (jc.weight || null);
                          const criteriaDesc = typeof jc === 'string' ? null : (jc.description || jc.desc || null);

                          return (
                            <div key={i} className="p-4 bg-white/[0.04] border border-white/10 rounded-xl flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white">{criteriaName}</span>
                                {criteriaWeight && <span className="text-[10px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 px-2 py-0.5 rounded">{criteriaWeight}</span>}
                              </div>
                              {criteriaDesc && <p className="text-xs text-white/60">{criteriaDesc}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Coding Contest Assessment Details */}
                  {event.event_type === 'coding_contest' && event.submission_config?.assessment_details && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#4ECDC4]/[0.08] via-purple-950/20 to-black/40 border border-[#4ECDC4]/30 rounded-2xl p-6 flex flex-col gap-3.5 shadow-xl backdrop-blur-md">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#4ECDC4]/15 border border-[#4ECDC4]/30 flex items-center justify-center text-[#4ECDC4]">
                            <Code2 size={16} />
                          </div>
                          <span
                            className="text-sm font-bold text-[#4ECDC4] tracking-wide"
                            style={modernHeadingStyle}
                          >
                            Contest Assessment Format
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.submission_config.assessment_details.duration_minutes && (
                            <span className="text-xs font-semibold text-white/70 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                              <Clock size={12} className="text-[#4ECDC4]" />
                              {event.submission_config.assessment_details.duration_minutes} Mins
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#4ECDC4] bg-[#4ECDC4]/15 px-3 py-1 rounded-full border border-[#4ECDC4]/40 uppercase tracking-wider">
                            {event.submission_config.assessment_details.assessment_mode?.replace('_', ' ') || 'Coding & MCQ'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
                        {event.submission_config.assessment_details.total_questions && event.submission_config.assessment_details.total_questions > 0 ? (
                          <>
                            This contest features <strong className="text-white font-bold">{event.submission_config.assessment_details.total_questions} challenge{event.submission_config.assessment_details.total_questions > 1 ? 's' : ''}</strong> evaluated in real-time in CosmoDex&apos;s online IDE.
                          </>
                        ) : (
                          <>
                            This contest features interactive challenges evaluated in real-time in CosmoDex&apos;s online IDE. Specific problems and IDE environment will activate when the arena opens.
                          </>
                        )}
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

                      {userRegistration.team_name && (
                        <p className="text-base font-black text-white">Team: {userRegistration.team_name}</p>
                      )}

                      {userRegistration.team_members_json && userRegistration.team_members_json.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <p className="text-xs font-bold text-white/40">Team Members ({userRegistration.team_members_json.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {userRegistration.team_members_json.map((m, idx) => {
                              const isMe = m.email === userEmail || m.username === userName;
                              const isLeader = m.role === 'leader' || idx === 0;
                              return (
                                <span
                                  key={idx}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                    isLeader
                                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                                      : 'bg-white/[0.06] border border-white/10 text-white/80'
                                  }`}
                                >
                                  {isLeader ? '👑' : '👤'} {m.username || m.email?.split('@')[0] || `Member ${idx + 1}`}
                                  {isMe && ' (You)'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sponsors */}
                  {event.sponsors_json && (event.sponsors_json as { name: string; tier: string }[]).length > 0 && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                      <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4" style={modernHeadingStyle}>Sponsors & Partners</h2>
                      <div className="flex flex-wrap gap-3">
                        {(event.sponsors_json as { name: string; tier: string }[]).map((sp, i) => (
                          <div key={i} className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-bold text-white/90">
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
                  {/* Event Rounds (if any) */}
                  {event.rounds_json && event.rounds_json.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest" style={modernHeadingStyle}>Event Rounds</h2>
                      <div className="flex flex-col gap-3">
                        {event.rounds_json.map((r, i) => {
                          const roundTitle = r.title || r.name || `Round ${i + 1}`;
                          const roundDesc = r.description || r.desc || '';
                          const roundType = r.type || 'Stage';
                          return (
                            <div key={r.id || i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#E873C3]/15 border border-[#E873C3]/30 text-[#E873C3] font-black text-sm flex items-center justify-center shrink-0">
                                  R{i + 1}
                                </div>
                                <div>
                                  <h3 className="font-bold text-white text-base" style={modernHeadingStyle}>{roundTitle}</h3>
                                  {roundDesc && <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{roundDesc}</p>}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] uppercase font-bold text-white/50">
                                      Type: {roundType}
                                    </span>
                                    {r.starts_at && (
                                      <span className="text-[11px] text-white/40 flex items-center gap-1">
                                        <Clock size={11} className="text-[#4ECDC4]" />
                                        {formatDisplayDateTime(r.starts_at)}
                                      </span>
                                    )}
                                  </div>
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
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Schedule & Timeline (if any) */}
                  {event.timeline_json && event.timeline_json.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest" style={modernHeadingStyle}>Timeline & Schedule</h2>
                      <div className="relative flex flex-col gap-0 pl-4 py-2">
                        <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[#4ECDC4]/60 via-[#E873C3]/30 to-transparent" />
                        {event.timeline_json.map((entry, i) => {
                          const title = entry.title || entry.label || entry.name || `Milestone ${i + 1}`;
                          const timeVal = entry.time || entry.date || entry.datetime;
                          const desc = entry.description || entry.desc;
                          let isPast = false;
                          if (entry.done !== undefined) {
                            isPast = Boolean(entry.done);
                          } else if (entry.completed !== undefined) {
                            isPast = Boolean(entry.completed);
                          } else if (timeVal) {
                            try {
                              const d = new Date(timeVal);
                              if (!isNaN(d.getTime())) {
                                isPast = new Date() >= d;
                              }
                            } catch {
                              isPast = false;
                            }
                          }

                          return (
                            <div key={i} className="relative flex gap-4 pl-8 pb-6 last:pb-2">
                              <div
                                className="absolute left-1.5 top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
                                style={isPast
                                  ? { background: '#4ECDC4', borderColor: '#4ECDC4', boxShadow: '0 0 10px rgba(78,205,196,0.6)' }
                                  : { background: '#120d20', borderColor: 'rgba(232,115,195,0.5)', boxShadow: '0 0 6px rgba(232,115,195,0.2)' }
                                }
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-bold ${isPast ? 'text-white' : 'text-white/90'}`}>{title}</p>
                                {timeVal && (
                                  <p className="text-xs text-[#4ECDC4] mt-0.5 font-mono">
                                    {formatDisplayDateTime(timeVal)}
                                  </p>
                                )}
                                {desc && (
                                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fallback milestone cards if both rounds and timeline are empty */}
                  {(!event.rounds_json || event.rounds_json.length === 0) &&
                   (!event.timeline_json || event.timeline_json.length === 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                        <span className="text-xs font-bold text-white/40 uppercase">Starts At</span>
                        <span className="text-sm font-bold text-white">{formatDisplayDateTime(event.starts_at)}</span>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                        <span className="text-xs font-bold text-white/40 uppercase">Ends At</span>
                        <span className="text-sm font-bold text-white">{formatDisplayDateTime(event.ends_at)}</span>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1">
                        <span className="text-xs font-bold text-white/40 uppercase">Registration Deadline</span>
                        <span className="text-sm font-bold text-white">{formatDisplayDateTime(event.registration_deadline)}</span>
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
                        const rankLabel = prize.rank !== undefined ? (typeof prize.rank === 'number' || !isNaN(Number(prize.rank)) ? `Rank #${prize.rank}` : String(prize.rank)) : `Rank #${idx + 1}`;
                        const displayTitle = prize.title || rankLabel;
                        const prizeValue = prize.prize || prize.amount || prize.reward;
                        const perks = prize.perks || prize.description;

                        return (
                          <div key={idx} className={`relative bg-gradient-to-b ${meta.bg} border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-3 overflow-hidden`}
                            style={{ borderColor: `${meta.border}50` }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${meta.border}20`, border: `1px solid ${meta.border}60` }}>
                              <Icon size={24} style={{ color: meta.text }} />
                            </div>
                            <h3 className="font-black text-lg text-white" style={modernHeadingStyle}>{displayTitle}</h3>
                            <p className="text-xl font-black font-mono" style={{ color: meta.text }}>{formatPrize(prizeValue)}</p>
                            {perks && <p className="text-xs text-white/60 border-t border-white/10 pt-2 w-full">{perks}</p>}
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
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center gap-3 backdrop-blur-md">
                      <Trophy size={40} className="text-[#FFD700]" />
                      <h3 className="font-black text-xl text-white" style={modernHeadingStyle}>Prize Pool: {formatPrize(event.prize_pool)}</h3>
                      <p className="text-xs text-white/60 max-w-md font-sans">Top performers will receive certificates, CosmoDex XP points, and platform badges upon completion.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RULES */}
              {activeTab === 'rules' && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4" style={modernHeadingStyle}>Rules & Guidelines</h2>
                  {!event.rules_json || event.rules_json.length === 0 ? (
                    <p className="text-white/40 text-sm">Standard CosmoDex competition rules apply.</p>
                  ) : (
                    <ol className="flex flex-col gap-3 font-sans">
                      {event.rules_json.map((rule, i) => {
                        const ruleText = typeof rule === 'string' ? rule : (rule.text || rule.rule || rule.title || JSON.stringify(rule));
                        return (
                          <li key={i} className="flex gap-3 text-sm text-white/80">
                            <span className="text-[#E873C3] font-black shrink-0 w-6 text-right font-mono">{i + 1}.</span>
                            <span className="leading-relaxed">{ruleText}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              )}

              {/* TAB 5: LEADERBOARD */}
              {activeTab === 'leaderboard' && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest" style={modernHeadingStyle}>Official Leaderboard</h2>
                    <span className="text-xs text-white/50">{leaderboard.length > 0 ? `${leaderboard.length} ranked entries` : 'Live Standings'}</span>
                  </div>
                  {leaderboard.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center gap-3">
                      <Trophy size={36} className="text-white/30 mx-auto mb-1" />
                      <h3 className="text-sm font-bold text-white/90" style={modernHeadingStyle}>No Standings Recorded Yet</h3>
                      <p className="text-white/50 text-xs max-w-sm font-sans">Participants and scores will appear on the leaderboard as soon as submissions are made.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {leaderboard.map((entry, i) => {
                        const rankNum = entry.rank ?? i + 1;
                        const totalSec = entry.totalTimeSeconds;
                        const m = totalSec !== undefined ? Math.floor(totalSec / 60) : null;
                        const s = totalSec !== undefined ? totalSec % 60 : null;
                        const timeStr = m !== null && s !== null ? (m > 0 ? `${m}m ${s}s` : `${s}s`) : null;
                        const displayName = entry.username || 'Anonymous';
                        const initialChar = (displayName.trim()[0] || 'U').toUpperCase();

                        return (
                          <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i < 3 ? 'bg-white/[0.02]' : ''}`}>
                            <span className="text-lg font-black w-8 text-center font-mono" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#6b7280' }}>
                              #{rankNum}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#E873C3]/20 border border-[#E873C3]/30 flex items-center justify-center text-xs font-black text-[#E873C3]">
                              {initialChar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-white block truncate">{displayName}</span>
                              {timeStr && (
                                <span className="text-[11px] font-mono text-cyan-300/80 flex items-center gap-1 mt-0.5">
                                  ⏱️ {timeStr}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black font-mono block" style={{ color: i === 0 ? '#FFD700' : '#E873C3' }}>
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
                  <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest" style={modernHeadingStyle}>Frequently Asked Questions</h2>
                  {!event.faqs_json || event.faqs_json.length === 0 ? (
                    <p className="text-white/40 text-sm">No specific FAQs added yet.</p>
                  ) : (
                    event.faqs_json.map((faq, i) => {
                      const q = faq.question || faq.q || faq.title || `Question ${i + 1}`;
                      const a = faq.answer || faq.a || faq.description || '';
                      return <FaqItem key={i} q={q} a={a} />;
                    })
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* Main Action Card */}
            <div className="bg-[#0c0818] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {/* Prize Pool Header */}
              {event.prize_pool && (
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-[#FFD700]" />
                    <span className="text-xs font-bold text-white/60">Prize Pool</span>
                  </div>
                  <span className="text-sm font-black text-[#FFD700]">{formatPrize(event.prize_pool)}</span>
                </div>
              )}

              {/* Registration Stats */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <Users size={13} className="text-[#E873C3]" /> Registered
                  </span>
                  <span className="text-white font-bold font-mono">
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
              <div className="flex flex-col gap-2.5 pt-3 border-t border-white/[0.08] text-xs">
                {event.starts_at && (
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#3DCB7F]" /> Starts</span>
                    <span className="font-bold text-white/90 font-mono text-[11px]">{formatDisplayDateTime(event.starts_at)}</span>
                  </div>
                )}
                {event.ends_at && (
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#E873C3]" /> Ends</span>
                    <span className="font-bold text-white/90 font-mono text-[11px]">{formatDisplayDateTime(event.ends_at)}</span>
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
                  {hasSubmitted ? (
                    <div className="w-full py-3 rounded-xl bg-[#3DCB7F]/15 border border-[#3DCB7F]/40 text-[#3DCB7F] text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={15} />
                      <span>Submitted</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-full py-3 rounded-xl bg-[#3DCB7F]/15 border border-[#3DCB7F]/40 text-[#3DCB7F] text-xs font-black text-center flex items-center justify-center gap-2">
                        <CheckCircle size={15} />
                        <span>Registered for Event</span>
                      </div>
                      {/* Enter Contest Arena Button when LIVE */}
                      {isOngoing && contestEnterUrl && (
                        <Link
                          href={contestEnterUrl}
                          className="w-full py-3.5 rounded-xl font-black text-xs text-white text-center flex items-center justify-center gap-1.5 transition-all shadow-lg hover:scale-[1.02]"
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
                    </>
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
              ) : event.is_private && !isUnlocked ? (
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #F5A623 0%, #D95FD1 50%, #8D37D6 100%)',
                    boxShadow: '0 4px 25px rgba(245, 166, 35, 0.45)',
                  }}
                >
                  <KeyRound size={16} className="text-amber-200" />
                  <span>Unlock to Register</span>
                </button>
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

      {/* 🔒 Secret ID & Password Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0b0717] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.3)]">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white" style={modernHeadingStyle}>Unlock Private Event</h3>
                    <p className="text-xs text-white/50">{event.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowUnlockModal(false); setUnlockError(''); }}
                  className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUnlockEvent} className="flex flex-col gap-4 relative z-10">
                <p className="text-xs text-white/70 leading-relaxed">
                  This is a restricted event. Please enter the <strong>Secret Access ID</strong> and <strong>Secret Password</strong> provided by your host to unlock the portal and register.
                </p>

                {unlockError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <ShieldAlert size={15} className="shrink-0 text-red-400" />
                    <span>{unlockError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/70">Secret Access ID</label>
                  <input
                    type="text"
                    value={secretIdInput || event?.secret_id || ""}
                    onChange={e => setSecretIdInput(e.target.value.toUpperCase())}
                    placeholder="e.g. PVT-X89ABC"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/70">Secret Password</label>
                  <div className="relative">
                    <input
                      type={showSecretPass ? 'text' : 'password'}
                      value={secretPassInput}
                      onChange={e => setSecretPassInput(e.target.value)}
                      placeholder="Enter secret passcode"
                      className="w-full px-4 py-2.5 pr-10 bg-white/[0.04] border border-white/15 rounded-xl text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showSecretPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08] mt-1">
                  <button
                    type="button"
                    onClick={() => { setShowUnlockModal(false); setUnlockError(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={unlockLoading}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 transition-all shadow-lg hover:scale-105 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#F5A623,#8D37D6)', boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
                  >
                    {unlockLoading ? 'Verifying...' : '⚡ Verify & Unlock'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
