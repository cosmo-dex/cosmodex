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
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0518] text-white flex flex-col">
      {/* Background exact match via CSS */}
      <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none z-0">
        {/* Core dark space gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#1a0b2e_0%,#080312_100%)] opacity-90" />

        <RisingStars />

        {/* Nebula dust / subtle colored clouds */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
              rotate: [-45, -40, -45]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[30%] w-[40rem] h-[30rem] bg-indigo-900/20 rounded-[100%] blur-[100px] mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] right-[20%] w-[35rem] h-[25rem] bg-fuchsia-900/10 rounded-[100%] blur-[120px] mix-blend-screen"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col pt-16">
        <Navbar />
        <BattleArenaHero />

        <section className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center px-4 py-6">
          {loading ? (
            <div className="text-center p-10 text-white/50 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D95FD1]"></div>
              <span>Loading Battle Arena...</span>
            </div>
          ) : !user ? (
            <div className="-mt-8 sm:-mt-10 w-full flex flex-col items-center">
              <div className="cosmo-glass w-full max-w-md p-10 sm:p-14 text-center border border-white/10 shadow-2xl relative rounded-2xl">
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
            <div className="-mt-8 sm:-mt-12 w-full flex justify-center">
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
