'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/landing/Footer';
import RisingStars from '@/components/RisingStar';
import MatchmakingPanel from '@/components/battle/MatchmakingPanel';
import ActiveMatchView from '@/components/battle/ActiveMatchView';
import { useEventBattleContext } from '@/providers/EventBattleContext';
import {
  Swords,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Terminal,
  ListChecks,
  AlertTriangle,
  Lock,
  Clock,
  Sparkles,
  Trophy,
  ExternalLink,
  Users,
} from 'lucide-react';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  participation_type?: string | null;
  banner_url?: string | null;
  is_private?: boolean;
  secret_id?: string;
  submission_config?: {
    battle_arena?: {
      enabled: boolean;
      allowed_modes: ('code' | 'mcq')[];
    };
  } | null;
  battle_arena?: {
    enabled: boolean;
    allowed_modes: ('code' | 'mcq')[];
  };
}

interface UserRegistration {
  id: string;
  user_id: string;
  status: string;
  team_id?: string | null;
}

export default function EventBattlePage() {
  const params = useParams();
  const rawEventId = params?.eventId as string;

  const eventBattleContext = useEventBattleContext();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'code' | 'mcq'>('code');

  // Private event unlock
  const [unlockToken, setUnlockToken] = useState<string>(() => {
    if (typeof window !== 'undefined' && rawEventId) {
      return sessionStorage.getItem(`event_unlock_${rawEventId}`) || '';
    }
    return '';
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && rawEventId) {
      return Boolean(sessionStorage.getItem(`event_unlock_${rawEventId}`));
    }
    return false;
  });
  const [secretPassInput, setSecretPassInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // 1. Fetch Event and Registration Data
  useEffect(() => {
    let isMounted = true;
    if (!rawEventId) return;

    const token = unlockToken || (typeof window !== 'undefined' ? sessionStorage.getItem(`event_unlock_${rawEventId}`) : '');
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };
    if (token) {
      headers['x-unlock-token'] = token;
    }

    fetch(`/api/events/${encodeURIComponent(rawEventId)}?t=${Date.now()}`, {
      headers,
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.event) {
          setEvent(data.event);
          if (data.userRegistration && data.userRegistration.status === 'registered') {
            setUserRegistration(data.userRegistration);
          } else {
            // Check session storage cached registration
            try {
              const cached = sessionStorage.getItem(`event_reg_${rawEventId}`);
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed?.status === 'registered') {
                  setUserRegistration(parsed);
                }
              }
            } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [rawEventId, unlockToken, dataRefreshKey]);

  // 2. Ensure Battle Socket connects when entering the battle page
  useEffect(() => {
    if (eventBattleContext?.ensureConnected) {
      eventBattleContext.ensureConnected();
    }
  }, [eventBattleContext]);

  // 3. Mode validation and fallback
  const battleConfig = event?.submission_config?.battle_arena || event?.battle_arena;
  const isBattleEnabled = Boolean(
    battleConfig?.enabled &&
    Array.isArray(battleConfig?.allowed_modes) &&
    battleConfig.allowed_modes.length > 0
  );
  const allowedModes = useMemo<('code' | 'mcq')[]>(() => {
    return isBattleEnabled && battleConfig?.allowed_modes ? battleConfig.allowed_modes : [];
  }, [isBattleEnabled, battleConfig]);

  const effectiveSelectedMode = allowedModes.length > 0 && !allowedModes.includes(selectedMode)
    ? allowedModes[0]
    : selectedMode;

  // 4. Unlock Private Event handler
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretPassInput.trim()) {
      setUnlockError('Please enter the secret password');
      return;
    }
    setUnlockLoading(true);
    setUnlockError('');
    try {
      const res = await fetch(`/api/events/${rawEventId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretPassInput.trim(),
          secret_password: secretPassInput.trim(),
          secret_id: event?.secret_id || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.unlocked) {
        setIsUnlocked(true);
        if (data.unlock_token) {
          setUnlockToken(data.unlock_token);
          sessionStorage.setItem(`event_unlock_${rawEventId}`, data.unlock_token);
          if (data.event_id && data.event_id !== rawEventId) {
            sessionStorage.setItem(`event_unlock_${data.event_id}`, data.unlock_token);
          }
        }
        setDataRefreshKey((k) => k + 1);
      } else {
        setUnlockError(data.error || 'Invalid secret password');
      }
    } catch {
      setUnlockError('Network error while unlocking event');
    } finally {
      setUnlockLoading(false);
    }
  };

  const isRegistered = Boolean(userRegistration && userRegistration.status === 'registered');
  const isOngoing = event?.status === 'ongoing';
  const isEnded = event?.status === 'ended';
  const isUpcoming = event?.status === 'published';
  const isPrivateLocked = Boolean(event?.is_private && !isRegistered && !isUnlocked);

  const activeMatch = eventBattleContext?.matchInfo ?? null;
  const user = eventBattleContext?.user ?? null;
  const socket = eventBattleContext?.socket ?? null;

  // ── ACTIVE MATCH TAKEOVER VIEW ──────────────────────────────────────────
  if (activeMatch && user) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#050508', color: '#fff', overflow: 'hidden' }}>
        <ActiveMatchView
          socket={socket}
          matchInfo={activeMatch}
          userId={user.userId}
          username={user.username}
          onLeave={() => {
            eventBattleContext?.handleLeaveMatch();
          }}
          onMatchCompleted={eventBattleContext?.handleMatchCompleted}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      {/* Background Starfield and Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />
        <RisingStars />
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/50 mb-6 font-semibold flex-wrap">
          <Link href="/events" className="hover:text-white transition-colors">
            Events
          </Link>
          <ChevronRight size={13} className="text-white/30" />
          <Link href={`/events/${rawEventId}`} className="hover:text-white transition-colors max-w-[200px] truncate">
            {event?.title || 'Event Details'}
          </Link>
          <ChevronRight size={13} className="text-white/30" />
          <span className="text-[#FF758C] font-bold">Battle Arena</span>
        </div>

        {/* Header and Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-[#FF416C]/20 to-[#8A2387]/20 border border-[#FF416C]/40 text-[#FF416C]">
                <Swords size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {event?.title ? `${event.title} Battle Arena` : 'Event Battle Arena'}
              </h1>
            </div>
            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              Real-time 1v1 competitive coding and MCQ battles scored specifically for this event&apos;s leaderboard.
            </p>
          </div>

          <Link
            href={`/events/${rawEventId}`}
            className="self-start md:self-center px-4 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 transition-all flex items-center gap-2 shrink-0"
          >
            <ArrowLeft size={14} />
            <span>Back to Event Details</span>
          </Link>
        </div>

        {/* Global ELO Protection Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/25 flex items-center gap-3 backdrop-blur-md">
          <ShieldCheck size={20} className="text-blue-400 shrink-0" />
          <div className="text-xs text-white/80">
            <span className="font-bold text-blue-300">Global ELO Protected: </span>
            Matches played in this event arena are scored exclusively for the event leaderboard and will not impact your global Battle Arena ELO or career win/loss records.
          </div>
        </div>

        {/* Active Queue Status Banner (when queued) */}
        {eventBattleContext?.isQueued && (
          <div className="mb-8 p-4 rounded-xl bg-[#FF416C]/15 border border-[#FF416C]/40 flex items-center justify-between gap-4 backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#FF416C] animate-ping" />
              <span className="text-sm font-bold text-white">
                Matchmaking in progress for {eventBattleContext.queuedMode === 'mcq' ? 'MCQ (1v1)' : 'Coding (1v1)'}...
              </span>
            </div>
            <button
              onClick={() => eventBattleContext.leaveQueue()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white/80 hover:text-white bg-black/40 hover:bg-black/60 border border-white/20 transition-all cursor-pointer"
            >
              Cancel Queue
            </button>
          </div>
        )}

        {/* Main Content Area based on Eligibility */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF416C] border-t-transparent animate-spin" />
            <p className="text-xs text-white/50">Verifying event battle eligibility...</p>
          </div>
        ) : !isBattleEnabled ? (
          <div className="py-16 text-center bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
            <AlertTriangle size={36} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Battle Arena Not Enabled</h3>
            <p className="text-sm text-white/60 max-w-md">
              1v1 Battle Arena matches are not enabled for this event. Please return to the event page for other activities.
            </p>
            <Link
              href={`/events/${rawEventId}`}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-white"
            >
              Return to Event
            </Link>
          </div>
        ) : isPrivateLocked ? (
          <div className="py-16 bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center max-w-md mx-auto text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Private Event Access Required</h3>
            <p className="text-xs text-white/60">
              This event is private. Enter the secret access password to unlock matchmaking.
            </p>
            <form onSubmit={handleUnlock} className="w-full space-y-3 mt-2">
              <input
                type="password"
                placeholder="Secret Password"
                value={secretPassInput}
                onChange={(e) => setSecretPassInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF416C]"
              />
              {unlockError && <p className="text-xs text-red-400 font-semibold">{unlockError}</p>}
              <button
                type="submit"
                disabled={unlockLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF416C] to-[#8A2387] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {unlockLoading ? 'Unlocking...' : 'Unlock Battle Arena'}
              </button>
            </form>
          </div>
        ) : !isRegistered ? (
          <div className="py-16 text-center bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
            <Users size={36} className="text-[#FF758C]" />
            <h3 className="text-lg font-bold text-white">Registration Required</h3>
            <p className="text-sm text-white/60 max-w-md">
              You must be registered for this event before entering the 1v1 Battle Arena matchmaking queue.
            </p>
            <Link
              href={`/events/${rawEventId}`}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF416C] to-[#8A2387] text-white shadow-lg hover:scale-105 transition-all"
            >
              Go to Event Page &amp; Register
            </Link>
          </div>
        ) : isUpcoming ? (
          <div className="py-16 text-center bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
            <Clock size={36} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Battle Arena Scheduled</h3>
            <p className="text-sm text-white/60 max-w-md">
              The event has not started yet. Matchmaking opens automatically as soon as the event goes LIVE.
            </p>
            <Link
              href={`/events/${rawEventId}`}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-white"
            >
              View Schedule on Event Page
            </Link>
          </div>
        ) : isEnded ? (
          <div className="py-16 text-center bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
            <Trophy size={36} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Event Concluded</h3>
            <p className="text-sm text-white/60 max-w-md">
              This event has ended and no new battle matches can be started. You can view the final event standings below.
            </p>
            <Link
              href={`/events/${rawEventId}?tab=leaderboard`}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-white"
            >
              View Full Standings
            </Link>
          </div>
        ) : isOngoing ? (
          <div className="space-y-10">
            {/* Mode Selection Cards */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF758C]" />
                <span>Select Battle Arena Mode</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coding Battle Card */}
                {allowedModes.includes('code') && (
                  <div
                    onClick={() => setSelectedMode('code')}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                      effectiveSelectedMode === 'code'
                        ? 'bg-gradient-to-br from-[#FF416C]/15 to-[#8A2387]/15 border-[#FF416C]/60 shadow-[0_0_25px_rgba(255,65,108,0.25)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#FF416C]/20 border border-[#FF416C]/40 text-[#FF416C]">
                          <Terminal size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">Coding Battle (1v1)</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF758C]">
                            Algorithm &amp; Implementation
                          </span>
                        </div>
                      </div>
                      {effectiveSelectedMode === 'code' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF416C] text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Race against your opponent to solve coding challenges with automated test execution, live score multipliers, and stage bonuses.
                    </p>
                  </div>
                )}

                {/* MCQ Battle Card */}
                {allowedModes.includes('mcq') && (
                  <div
                    onClick={() => setSelectedMode('mcq')}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                      effectiveSelectedMode === 'mcq'
                        ? 'bg-gradient-to-br from-[#FF416C]/15 to-[#8A2387]/15 border-[#FF416C]/60 shadow-[0_0_25px_rgba(255,65,108,0.25)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                          <ListChecks size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">MCQ Battle (1v1)</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                            Speed &amp; Accuracy
                          </span>
                        </div>
                      </div>
                      {effectiveSelectedMode === 'mcq' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF416C] text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Answer multiple-choice technical questions head-to-head under tight round timers with speed multipliers and streak bonuses.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reusable MatchmakingPanel with Event Scoping */}
            <div className="pt-2">
              <MatchmakingPanel
                key={`${eventBattleContext?.queueRefreshKey}-${effectiveSelectedMode}`}
                socket={socket}
                userId={user?.userId || ''}
                username={user?.username || ''}
                eventId={event?.id || rawEventId}
                allowedModes={allowedModes}
                isEventContext={true}
                onMatchFound={(info) => {
                  eventBattleContext?.handleMatchFound(info);
                }}
              />
            </div>

            {/* Event Standings Preview */}
            <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[#FFD700]" />
                  <h3 className="font-bold text-sm text-white">Live Event Standings</h3>
                </div>
                <Link
                  href={`/events/${rawEventId}?tab=leaderboard`}
                  className="text-xs font-semibold text-[#FF758C] hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>View Full Leaderboard</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {eventBattleContext?.battleLeaderboardLoading ? (
                <div className="py-8 text-center text-xs text-white/40">Loading current event standings...</div>
              ) : !eventBattleContext?.battleLeaderboardData?.leaderboard?.length ? (
                <div className="py-8 text-center text-xs text-white/40">
                  No matches completed yet. Enter the queue to establish the first standings!
                </div>
              ) : (
                <div className="space-y-2">
                  {eventBattleContext.battleLeaderboardData.leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={entry.userId || entry.teamId || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 text-center font-black ${idx === 0 ? 'text-[#FFD700]' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-white/40'}`}>
                          #{entry.rank}
                        </span>
                        <span className="font-bold text-white">
                          {entry.username || entry.teamName || 'Competitor'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/70">
                        <span>{entry.wins}W - {entry.draws}D - {entry.losses}L</span>
                        <span className="font-mono text-[#FF758C] font-bold">
                          {Math.round(entry.winRate * 100)}% Win Rate
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
