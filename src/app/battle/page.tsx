'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Navbar from '@/components/navbar/Navbar';
import BattleArenaHero from '@/components/battle/BattleArenaHero';
import MatchmakingPanel from '@/components/battle/MatchmakingPanel';
import ActiveMatchView from '@/components/battle/ActiveMatchView';
import { io, Socket } from 'socket.io-client';
import RisingStars from '@/component/RisingStar';

interface UserSession {
  userId: string;
  username: string;
}

interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  mode: 'code' | 'mcq';
}

const ARENA_URL = process.env.NEXT_PUBLIC_BATTLE_ARENA_URL || 'http://localhost:3001';

export default function BattlePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const matchInfoRef = useRef<MatchInfo | null>(null);

  // Keep ref in sync so socket callbacks always see latest value
  useEffect(() => {
    matchInfoRef.current = matchInfo;
  }, [matchInfo]);

  useEffect(() => {
    let activeSocket: Socket | null = null;

    fetch('/api/battle/token')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.token && data.userId) {
          setUser({ userId: data.userId, username: data.username });

          activeSocket = io(ARENA_URL, {
            auth: { token: data.token },
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
          });

          activeSocket.on('match_found', (payload: MatchInfo) => {
            if (!matchInfoRef.current) {
              console.log('[BattlePage] match_found → entering arena', payload);
              setMatchInfo(payload);
            }
          });

          setSocket(activeSocket);
        }
      })
      .catch((err) => console.log('Auth check:', err.message))
      .finally(() => setLoading(false));

    return () => {
      activeSocket?.disconnect();
    };
  }, []);

  const handleDevBypassLobby = () => {
    setUser({ userId: 'dev-user-1', username: 'rishi' });
  };

  // ── ACTIVE MATCH: full-screen takeover (no navbar / hero) ──────────────────
  if (matchInfo && user) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#050508', color: '#fff', overflow: 'hidden' }}>
        <ActiveMatchView
          socket={socket}
          matchInfo={matchInfo}
          userId={user.userId}
          username={user.username}
          onLeave={() => setMatchInfo(null)}
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
                    href="/onboarding?mode=login&next=/battle"
                    className="cosmo-btn-primary w-full py-3 text-sm h-11 flex items-center justify-center"
                  >
                    Sign In
                  </a>
                  <button
                    onClick={handleDevBypassLobby}
                    className="w-full py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-all cursor-pointer"
                  >
                    🔓 Bypass Sign-In (Enter Lobby)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <MatchmakingPanel
                socket={socket}
                userId={user.userId}
                username={user.username}
                onMatchFound={(info) => setMatchInfo(info)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
