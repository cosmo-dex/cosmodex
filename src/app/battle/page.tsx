'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import Navbar from '@/components/navbar/Navbar';
import BattleArenaHero from '@/components/battle/BattleArenaHero';
import MatchmakingPanel from '@/components/battle/MatchmakingPanel';
import ActiveMatchView from '@/components/battle/ActiveMatchView';
import BattleTour from '@/components/battle/BattleTour';
import { createArenaSocket, ArenaSocket } from '@/lib/arenaWsClient';
import RisingStars from '@/components/RisingStar';
import { resolveBattleEventId, setStoredEventId, getStoredActiveMatch, setStoredActiveMatch } from '@/lib/battleEvent';
import { Swords, AlertTriangle, X } from 'lucide-react';

interface UserSession {
  userId: string;
  username: string;
}

interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  opponentAvatar?: string | null;
  mode: 'code' | 'mcq';
  eventId?: string | null;
}

function getArenaUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && process.env.NEXT_PUBLIC_BATTLE_ARENA_URL?.includes('localhost')) {
      return 'https://battle-arena-golang-316713590727.us-central1.run.app';
    }
  }
  return (
    process.env.NEXT_PUBLIC_BATTLE_ARENA_WS_URL ||
    process.env.NEXT_PUBLIC_BATTLE_ARENA_URL ||
    'https://battle-arena-golang-316713590727.us-central1.run.app'
  );
}

function BattlePageContent() {
  const searchParams = useSearchParams();
  const rawEventId = searchParams.get('eventId');
  const { eventId, isInvalid } = useMemo(() => resolveBattleEventId(rawEventId), [rawEventId]);
  const [dismissedWarningFor, setDismissedWarningFor] = useState<string | null>(null);
  const invalidEventWarning = isInvalid && dismissedWarningFor !== rawEventId
    ? `Invalid event ID format "${rawEventId}". Normal Battle Arena loaded.`
    : null;

  useEffect(() => {
    setStoredEventId(eventId);
  }, [eventId]);

  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(() => getStoredActiveMatch());
  const [socket, setSocket] = useState<ArenaSocket | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const matchInfoRef = useRef<MatchInfo | null>(null);

  // Keep ref in sync so socket callbacks always see latest value
  useEffect(() => {
    matchInfoRef.current = matchInfo;
  }, [matchInfo]);

  useEffect(() => {
    let activeSocket: ArenaSocket | null = null;
    const arenaUrl = getArenaUrl();

    fetch('/api/battle/token')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.token && data.userId) {
          setUser({ userId: data.userId, username: data.username });

          activeSocket = createArenaSocket(arenaUrl, {
            auth: { token: data.token },
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
          });

          activeSocket.on('match_found', () => {});

          setSocket(activeSocket);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      activeSocket?.disconnect();
    };
  }, []);




  // ── ACTIVE MATCH: full-screen takeover (no navbar / hero) ──────────────────
  if (matchInfo && user) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#050508', color: '#fff', overflow: 'hidden' }}>
        <ActiveMatchView
          socket={socket}
          matchInfo={matchInfo}
          userId={user.userId}
          username={user.username}
          onLeave={() => {
            setMatchInfo(null);
            setStoredActiveMatch(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      </div>
    );
  }


  // ── LOBBY / MATCHMAKING ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col starfield">
      {/* Background: Leaderboard-style dark space gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep dark base matching leaderboard */}
        <div className="absolute inset-0 bg-[#050508]" />
        {/* Radial purple glow top-left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        {/* Radial fuchsia glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        {/* Subtle center purple bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />

        {/* Dashboard Shooting Stars Animations */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: "150px", rotate: -35, top: "10%", right: "-10%" }}
          animate={{
            x: [0, -1200],
            y: [0, 800],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: "120px", rotate: -35, top: "35%", right: "-5%" }}
          animate={{
            x: [0, -1100],
            y: [0, 750],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 7,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          style={{ width: "180px", rotate: -35, top: "-5%", right: "25%" }}
          animate={{
            x: [0, -1400],
            y: [0, 950],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 10,
            ease: "linear"
          }}
        />

        <RisingStars />

        {/* Lightweight static ambient glows */}
        <div className="absolute top-[15%] left-[30%] w-[35rem] h-[22rem] bg-indigo-900/15 rounded-full blur-[90px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[30rem] h-[20rem] bg-fuchsia-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 pointer-events-none z-[5]" />

      {/* Main Content Area – pt-14 offsets fixed Navbar */}
      <div className="relative z-10 w-full flex-1 flex flex-col pt-14 overflow-hidden">
        <Navbar />
        <BattleArenaHero />

        <section className="w-full max-w-[1360px] mx-auto flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-1 pb-3 overflow-hidden">
          {/* Invalid Event ID Warning Banner */}
          {invalidEventWarning && (
            <div className="w-full max-w-2xl mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span>{invalidEventWarning}</span>
              </div>
              <button
                onClick={() => setDismissedWarningFor(rawEventId)}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Dismiss warning"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Active Event Arena Context Banner */}
          {eventId && (
            <div className="w-full max-w-2xl mb-4 px-4 py-2.5 rounded-xl bg-[#8D37D6]/15 border border-[#8D37D6]/35 flex items-center justify-between text-xs text-purple-200 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[#FF416C] shrink-0" />
                <span>
                  <strong className="text-white font-semibold">Event Battle Arena Active</strong> &bull; Match results will be recorded for this event.
                </span>
              </div>
              <Link
                href={`/events/${eventId}`}
                className="text-[#E873C3] hover:text-white font-semibold transition-colors underline shrink-0 ml-3"
              >
                View Event Details &rarr;
              </Link>
            </div>
          )}

          {loading ? (
            <div className="text-center p-10 text-white/50 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D95FD1]"></div>
              <span>Loading Battle Arena...</span>
            </div>
          ) : !user ? (
            <div className="w-full flex justify-center">
              <div className="cosmo-glass w-full max-w-md p-8 sm:p-14 text-center border border-white/10 shadow-2xl relative">
                {/* Outer decorative ring to match profile theme */}
                <div className="absolute inset-0 ring-inset ring-2 ring-white/10 rounded-[24px] pointer-events-none" />

                <h3 className="text-2xl font-bold tracking-wider text-white mb-3">
                  Sign In Required
                </h3>
                <p className="text-white/70 text-sm mb-6">
                  Please sign in to join matchmaking and enter 1v1 arenas.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={`/onboarding?mode=login&next=${encodeURIComponent(eventId ? `/battle?eventId=${eventId}` : '/battle')}`}
                    className="cosmo-btn-primary w-full py-3 text-sm h-11 flex items-center justify-center"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full flex justify-center">
                <MatchmakingPanel
                  key={refreshKey}
                  socket={socket}
                  userId={user.userId}
                  username={user.username}
                  eventId={eventId}
                  onMatchFound={(info) => {
                    setMatchInfo(info);
                    setStoredActiveMatch(info);
                  }}
                />
              </div>
              <BattleTour />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-[#050508] text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D95FD1]" />
        </div>
      }
    >
      <BattlePageContent />
    </Suspense>
  );
}
