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

          // Page-level match_found listener — guaranteed fallback so the match
          // always transitions even if the MatchmakingPanel timer fires late.
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
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.9, 0.7, 0.9],
              x: [0, -15, 0],
              y: [0, 15, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-pink-900/10 rounded-[100%] blur-[100px] mix-blend-screen"
          />
        </div>

        {/* Small stars layers */}
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10%]" style={{
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #ffffff, rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.4
          }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10%]" style={{
            backgroundImage: 'radial-gradient(1.5px 1.5px at 10px 10px, #e0b0ff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 150px, #fuchsia, rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
            opacity: 0.3
          }}
        />

        {/* Twinkling Stars */}
        <motion.div
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(2px 2px at 80px 120px, rgba(255,255,255,0.9), rgba(0,0,0,0)), radial-gradient(2px 2px at 250px 50px, rgba(158,0,246,0.8), rgba(0,0,0,0)), radial-gradient(2px 2px at 180px 300px, rgba(0,255,233,0.9), rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '350px 350px'
          }}
        />
        <motion.div
          animate={{ opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(2px 2px at 120px 220px, rgba(255,220,100,0.9), rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 300px 180px, rgba(255,255,255,1), rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 350px, rgba(255,100,200,0.8), rgba(0,0,0,0))',
            backgroundRepeat: 'repeat',
            backgroundSize: '450px 450px'
          }}
        />

        {/* Subtle Shooting Stars */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ width: "150px", rotate: -35, top: "10%", right: "-10%" }}
          animate={{
            x: [0, -1200],
            y: [0, 800],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 6,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none"
          style={{ width: "100px", rotate: -35, top: "40%", right: "-5%" }}
          animate={{
            x: [0, -1000],
            y: [0, 700],
            opacity: [0, 0.7, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 9,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none"
          style={{ width: "200px", rotate: -35, top: "-5%", right: "30%" }}
          animate={{
            x: [0, -1500],
            y: [0, 1000],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 14,
            ease: "linear"
          }}
        />
      </div>

      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0  pointer-events-none z-[5]" />

      {/* Main Content Area – pt-16 offsets fixed 64px Navbar */}
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
              <div className="-mt-8 sm:-mt-10 w-full flex justify-center">
                <div className="cosmo-glass w-full max-w-md p-10 sm:p-20 text-center border border-white/10 shadow-2xl relative">
                  {/* Outer decorative ring to match profile theme */}
                  <div className="absolute inset-0 ring-inset ring-2 ring-white/10 rounded-[24px] pointer-events-none" />

                  <h3 className="text-2xl font-bold tracking-wider text-white mb-3">
                    Sign In Required
                  </h3>
                  <p className="text-white/70 text-sm mb-6">
                    Please sign in to join matchmaking and enter 1v1 arenas.
                  </p>
                  <a
                    href="/onboarding?mode=login&next=/battle"
                    className="cosmo-btn-primary w-full py-3 text-sm h-11"
                  >
                    Sign In
                  </a>
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
