'use client';

import React from 'react';
import Link from 'next/link';
import { Swords, ListChecks, Terminal, Trophy, ShieldCheck, AlertCircle, Clock, Sparkles } from 'lucide-react';
import MatchmakingPanel from '@/components/battle/MatchmakingPanel';
import { ArenaSocket } from '@/lib/arenaWsClient';
import { MatchInfo, BattleUserSession } from '@/hooks/useEventBattleManager';

export interface BattleLeaderboardItem {
  rank: number;
  userId?: string;
  teamId?: string;
  username?: string;
  teamName?: string;
  avatarUrl?: string | null;
  memberCount?: number;
  wins: number;
  draws: number;
  losses: number;
  completedMatches?: number;
  winRate: number;
  coding?: {
    wins: number;
    draws: number;
    losses: number;
  };
  mcq?: {
    wins: number;
    draws: number;
    losses: number;
  };
  members?: Array<{
    userId: string;
    username: string;
    avatarUrl?: string | null;
    wins: number;
    draws: number;
    losses: number;
    completedMatches?: number;
  }>;
}

export interface BattleLeaderboardData {
  eventId: string;
  rankingType: 'individual' | 'team';
  leaderboard: BattleLeaderboardItem[];
}

interface EventBattleArenaSectionProps {
  event: {
    id: string;
    title: string;
    slug?: string | null;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    participation_type?: string | null;
    is_private?: boolean;
    submission_config?: {
      battle_arena?: {
        enabled: boolean;
        allowed_modes: ('code' | 'mcq')[];
      };
    } | null;
  };
  isRegistered: boolean;
  canRegister: boolean;
  isUnlocked: boolean;
  onRegisterClick: () => void;
  onUnlockClick: () => void;
  onNavigateToLeaderboard: () => void;
  battleLeaderboardData: BattleLeaderboardData | null;
  socket: ArenaSocket | null;
  user: BattleUserSession | null;
  authLoading: boolean;
  queueRefreshKey: number;
  onMatchFound: (info: MatchInfo) => void;
}

export default function EventBattleArenaSection({
  event,
  isRegistered,
  canRegister,
  isUnlocked,
  onRegisterClick,
  onUnlockClick,
  onNavigateToLeaderboard,
  battleLeaderboardData,
  socket,
  user,
  authLoading,
  queueRefreshKey,
  onMatchFound,
}: EventBattleArenaSectionProps) {
  const battleConfig = event.submission_config?.battle_arena;
  const isEnabled = Boolean(
    battleConfig?.enabled &&
    Array.isArray(battleConfig?.allowed_modes) &&
    battleConfig.allowed_modes.length > 0
  );
  const allowedModes: ('code' | 'mcq')[] = isEnabled ? battleConfig!.allowed_modes : [];

  const isOngoing = event.status === 'ongoing';
  const isEnded = event.status === 'ended';
  const isLockedPrivate = Boolean(event.is_private && !isRegistered && !isUnlocked);

  // Top 3 leaderboard entries for preview
  const top3 = battleLeaderboardData?.leaderboard?.slice(0, 3) || [];
  const isTeam = battleLeaderboardData?.rankingType === 'team' || event.participation_type === 'team';

  // Format date helper
  const formatDate = (val: string | null) => {
    if (!val) return 'TBA';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return val;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── 1. ARENA INTRODUCTION & STATUS BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border backdrop-blur-2xl transition-all"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(232, 115, 195, 0.16) 0%, rgba(141, 55, 214, 0.12) 45%, rgba(10, 6, 24, 0.96) 100%)',
          borderColor: 'rgba(232, 115, 195, 0.35)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(232, 115, 195, 0.18)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF416C]/25 to-[#8A2387]/25 border border-[#FF416C]/40 flex items-center justify-center text-[#FF416C] shadow-[0_0_20px_rgba(255,65,108,0.3)] shrink-0">
              <Swords size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E873C3]/20 text-[#E873C3] border border-[#E873C3]/40">
                  {event.title}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isOngoing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : isEnded
                    ? 'bg-white/10 text-white/50 border-white/10'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isOngoing ? 'Arena Live Now' : isEnded ? 'Arena Concluded' : 'Upcoming Event'}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Global ELO Protected
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                1v1 Event Battle Arena
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
                Compete head-to-head in rapid duels scored strictly for {event.title}. Match results update the live event standings without modifying your global Arena rating.
              </p>
            </div>
          </div>

          {/* Quick eligibility badge / action */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {!isEnabled ? (
              <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>Battle Arena Disabled for this Event</span>
              </div>
            ) : isLockedPrivate ? (
              <button
                onClick={onUnlockClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 to-purple-600 border border-amber-500/40 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                Unlock Private Event First
              </button>
            ) : !isRegistered ? (
              canRegister ? (
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF416C] to-[#8A2387] border border-[#FF416C]/50 shadow-[0_0_15px_rgba(255,65,108,0.4)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Register to Battle</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold">
                  Registration Closed
                </div>
              )
            ) : isEnded ? (
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold">
                Matches Concluded
              </div>
            ) : !isOngoing ? (
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold flex items-center gap-2">
                <Clock size={14} className="text-[#E873C3]" />
                <span>Opens at {formatDate(event.starts_at)}</span>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={15} />
                <span>Registered & Eligible to Queue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. STANDINGS PREVIEW & ALLOWED MODES ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Allowed Modes Overview Card */}
        <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Swords size={14} className="text-[#E873C3]" /> Allowed Battle Modes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                allowedModes.includes('code')
                  ? 'bg-gradient-to-br from-[#E873C3]/15 to-transparent border-[#E873C3]/40'
                  : 'bg-white/[0.02] border-white/5 opacity-40'
              }`}>
                <div className="flex items-center justify-between">
                  <Terminal size={18} className={allowedModes.includes('code') ? 'text-[#E873C3]' : 'text-white/40'} />
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    allowedModes.includes('code')
                      ? 'bg-[#E873C3]/20 text-white border-[#E873C3]/40'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {allowedModes.includes('code') ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1">Coding Battle</p>
                <p className="text-[11px] text-white/60 leading-snug">
                  1v1 live algorithmic speed duel
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                allowedModes.includes('mcq')
                  ? 'bg-gradient-to-br from-[#8D37D6]/15 to-transparent border-[#8D37D6]/40'
                  : 'bg-white/[0.02] border-white/5 opacity-40'
              }`}>
                <div className="flex items-center justify-between">
                  <ListChecks size={18} className={allowedModes.includes('mcq') ? 'text-[#8D37D6]' : 'text-white/40'} />
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    allowedModes.includes('mcq')
                      ? 'bg-[#8D37D6]/20 text-white border-[#8D37D6]/40'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {allowedModes.includes('mcq') ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1">MCQ Battle</p>
                <p className="text-[11px] text-white/60 leading-snug">
                  Rapid 5-round concept quiz arena
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/50 flex items-center justify-between">
            <span>Format: {isTeam ? 'Team Aggregate (Option C)' : 'Individual 1v1'}</span>
            <span className="text-[#00FFE9]">Strict Event Isolation</span>
          </div>
        </div>

        {/* Live Leaderboard Preview Card */}
        <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                <Trophy size={14} className="text-[#FFD700]" /> Live Event Standings Preview
              </h3>
              <button
                onClick={onNavigateToLeaderboard}
                className="text-[11px] text-[#E873C3] hover:text-white font-bold transition-colors cursor-pointer"
              >
                View Full Standings &rarr;
              </button>
            </div>

            {top3.length > 0 ? (
              <div className="space-y-2">
                {top3.map((entry, idx) => {
                  const displayName = isTeam
                    ? (entry.teamName || entry.teamId || 'Team')
                    : (entry.username || 'Anonymous');
                  return (
                    <div
                      key={entry.userId || entry.teamId || idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                          idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                          'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                        }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="font-semibold text-white truncate">{displayName}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">{entry.wins}W</span>
                        <span className="text-amber-300">{entry.draws}D</span>
                        <span className="text-rose-400">{entry.losses}L</span>
                        <span className="text-white/40">({Math.round(entry.winRate * 100)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-white/40 text-xs font-mono">
                No event battle matches logged yet. Queue below to take Rank #1!
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] text-white/40 flex items-center justify-between">
            <span>Standings rank: Total Wins &rarr; Total Draws &rarr; Win Rate</span>
            <span>Live Aggregation</span>
          </div>
        </div>
      </div>

      {/* ── 3. MATCHMAKING PANEL / SIGN IN / REGISTRATION GATE ── */}
      <div className="w-full flex justify-center mt-2">
        {authLoading ? (
          <div className="text-center p-12 text-white/50 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D95FD1]" />
            <span className="text-xs font-mono">Connecting to Event Battle Arena...</span>
          </div>
        ) : !user ? (
          <div className="cosmo-glass w-full max-w-md p-8 sm:p-10 text-center border border-white/10 shadow-2xl relative rounded-3xl">
            <h3 className="text-xl font-bold tracking-wider text-white mb-2">
              Sign In Required
            </h3>
            <p className="text-white/70 text-xs mb-6">
              Please sign in with your CosmoDex account to enter event matchmaking.
            </p>
            <Link
              href={`/onboarding?mode=login&next=${encodeURIComponent(`/events/${event.slug || event.id}?tab=battle`)}`}
              className="cosmo-btn-primary w-full py-3 text-xs h-11 flex items-center justify-center font-bold uppercase tracking-wider"
            >
              Sign In
            </Link>
          </div>
        ) : !isEnabled ? (
          <div className="w-full max-w-lg p-8 text-center bg-white/[0.03] border border-white/10 rounded-2xl">
            <AlertCircle size={32} className="mx-auto text-amber-400 mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Battle Arena Not Enabled</h3>
            <p className="text-xs text-white/60">
              The event organizer has not enabled Battle Arena for this event.
            </p>
          </div>
        ) : isLockedPrivate ? (
          <div className="w-full max-w-lg p-8 text-center bg-white/[0.03] border border-amber-500/30 rounded-2xl">
            <AlertCircle size={32} className="mx-auto text-amber-400 mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Private Event Locked</h3>
            <p className="text-xs text-white/60 mb-4">
              Enter the secret passcode provided by your host to unlock event battle matchmaking.
            </p>
            <button
              onClick={onUnlockClick}
              className="px-6 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Unlock Event
            </button>
          </div>
        ) : !isRegistered ? (
          <div className="w-full max-w-lg p-8 text-center bg-white/[0.03] border border-white/10 rounded-2xl">
            <Sparkles size={32} className="mx-auto text-[#E873C3] mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Registration Required</h3>
            <p className="text-xs text-white/60 mb-4">
              You must be registered for this event to enter head-to-head battle matchmaking.
            </p>
            {canRegister ? (
              <button
                onClick={onRegisterClick}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF416C] to-[#8A2387] text-white text-xs font-bold hover:scale-105 transition-all shadow-lg cursor-pointer"
              >
                Register Now
              </button>
            ) : (
              <span className="text-xs text-white/40 font-mono">Registration is currently closed</span>
            )}
          </div>
        ) : isEnded ? (
          <div className="w-full max-w-lg p-8 text-center bg-white/[0.03] border border-white/10 rounded-2xl">
            <Trophy size={32} className="mx-auto text-[#FFD700] mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Event Concluded</h3>
            <p className="text-xs text-white/60 mb-3">
              The competition has ended. Check the official event leaderboard for final rankings.
            </p>
            <button
              onClick={onNavigateToLeaderboard}
              className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
            >
              View Final Standings
            </button>
          </div>
        ) : !isOngoing ? (
          <div className="w-full max-w-lg p-8 text-center bg-white/[0.03] border border-white/10 rounded-2xl">
            <Clock size={32} className="mx-auto text-[#E873C3] mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Event Starts Soon</h3>
            <p className="text-xs text-white/60">
              Battle Arena matchmaking opens promptly at {formatDate(event.starts_at)}.
            </p>
          </div>
        ) : (
          /* Live Matchmaking Panel */
          <div className="w-full">
            <MatchmakingPanel
              key={queueRefreshKey}
              socket={socket}
              userId={user.userId}
              username={user.username}
              eventId={event.id}
              allowedModes={allowedModes}
              isEventContext={true}
              onMatchFound={onMatchFound}
            />
          </div>
        )}
      </div>
    </div>
  );
}
