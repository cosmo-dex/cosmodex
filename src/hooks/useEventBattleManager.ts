'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createArenaSocket, ArenaSocket } from '@/lib/arenaWsClient';
import {
  getStoredActiveMatch,
  setStoredActiveMatch,
  parseEventId,
} from '@/lib/battleEvent';

export interface BattleUserSession {
  userId: string;
  username: string;
}

export interface MatchInfo {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  opponentAvatar?: string | null;
  mode: 'code' | 'mcq';
  eventId?: string | null;
}

export interface EventBattleManagerOptions {
  eventId: string; // Canonical event UUID
  isBattleArenaEnabled: boolean;
  allowedModes: ('code' | 'mcq')[];
  onLeaderboardRefresh?: () => void;
  lazy?: boolean; // When true, socket connects only on explicit demand or active match recovery
}

function getArenaUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && process.env.NEXT_PUBLIC_BATTLE_ARENA_URL?.includes('localhost')) {
      return 'https://battle-arena-golang.onrender.com';
    }
  }
  return (
    process.env.NEXT_PUBLIC_BATTLE_ARENA_WS_URL ||
    process.env.NEXT_PUBLIC_BATTLE_ARENA_URL ||
    'http://localhost:3001'
  );
}

export function useEventBattleManager({
  eventId,
  isBattleArenaEnabled,
  allowedModes,
  onLeaderboardRefresh,
  lazy = false,
}: EventBattleManagerOptions) {
  const [socket, setSocket] = useState<ArenaSocket | null>(null);
  const [user, setUser] = useState<BattleUserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);

  // Queue state tracking
  const [isQueued, setIsQueued] = useState(false);
  const [queuedMode, setQueuedMode] = useState<'code' | 'mcq' | null>(null);
  const [queueJoinedAt, setQueueJoinedAt] = useState<number | null>(null);
  const [hasRequestedConnect, setHasRequestedConnect] = useState(false);

  const socketRef = useRef<ArenaSocket | null>(null);
  const isQueuedRef = useRef(isQueued);
  const queuedModeRef = useRef(queuedMode);
  const hasRestoredRef = useRef(false);
  const hasReportedCompletionRef = useRef<Record<string, boolean>>({});
  const onLeaderboardRefreshRef = useRef(onLeaderboardRefresh);

  useEffect(() => {
    isQueuedRef.current = isQueued;
  }, [isQueued]);

  useEffect(() => {
    queuedModeRef.current = queuedMode;
  }, [queuedMode]);

  useEffect(() => {
    onLeaderboardRefreshRef.current = onLeaderboardRefresh;
  }, [onLeaderboardRefresh]);

  const ensureConnected = useCallback(() => {
    setHasRequestedConnect(true);
  }, []);

  // 1. Restore active match for this specific event on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const stored = getStoredActiveMatch();
    const canonicalEventId = parseEventId(eventId);
    if (stored && canonicalEventId && stored.eventId === canonicalEventId) {
      setMatchInfo({
        roomId: stored.roomId,
        opponentId: stored.opponentId,
        opponentUsername: stored.opponentUsername,
        opponentElo: stored.opponentElo,
        opponentAvatar: stored.opponentAvatar,
        mode: stored.mode,
        eventId: stored.eventId,
      });
      // Active match present -> request socket connection immediately to recover
      setHasRequestedConnect(true);
    }
  }, [eventId]);

  // 2. Persistent Event Arena Socket lifecycle (Lazy or Eager)
  useEffect(() => {
    if (!isBattleArenaEnabled) {
      setAuthLoading(false);
      return;
    }

    const stored = getStoredActiveMatch();
    const canonicalEventId = parseEventId(eventId);
    const hasStoredMatch = Boolean(stored && canonicalEventId && stored.eventId === canonicalEventId);

    // If lazy and no connection requested and no active match recovery needed, do not connect
    if (lazy && !hasRequestedConnect && !hasStoredMatch && !matchInfo) {
      return;
    }

    let isMounted = true;
    let activeSocket: ArenaSocket | null = null;
    const arenaUrl = getArenaUrl();
    setAuthLoading(true);

    fetch('/api/battle/token')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.token && data.userId) {
          const sessionUser: BattleUserSession = {
            userId: data.userId,
            username: data.username || 'Participant',
          };
          setUser(sessionUser);

          activeSocket = createArenaSocket(arenaUrl, {
            auth: { token: data.token },
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
          });

          // Matchmaking and Queue listeners
          activeSocket.on('queue_joined', (payload: { mode?: 'code' | 'mcq' }) => {
            if (!isMounted) return;
            setIsQueued(true);
            setQueuedMode(payload?.mode || null);
            setQueueJoinedAt(Date.now());
          });

          activeSocket.on('queue_left', () => {
            if (!isMounted) return;
            setIsQueued(false);
            setQueuedMode(null);
            setQueueJoinedAt(null);
          });

          activeSocket.on('match_found', (info: MatchInfo) => {
            if (!isMounted) return;
            setIsQueued(false);
            setQueuedMode(null);
            setQueueJoinedAt(null);
            handleMatchFound(info);
          });

          // Safe recovery validation: Handle expired or unrecoverable rooms
          activeSocket.on('error', (err: { message?: string }) => {
            if (!isMounted) return;
            if (err?.message && /room does not exist|expired|not a participant/i.test(err.message)) {
              setMatchInfo(null);
              setStoredActiveMatch(null);
            }
          });

          socketRef.current = activeSocket;
          setSocket(activeSocket);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    // Cleanup: When eventId changes or page completely unmounts
    return () => {
      isMounted = false;
      if (activeSocket) {
        // If actively queued when switching events/unmounting, emit leave_queue
        if (isQueuedRef.current && canonicalEventId) {
          activeSocket.emit('leave_queue', {
            mode: queuedModeRef.current || 'code',
            eventId: canonicalEventId,
          });
        }
        activeSocket.disconnect();
      }
      if (socketRef.current) {
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [eventId, isBattleArenaEnabled, lazy, hasRequestedConnect]);

  // 3. Callback when matchmaking succeeds and match begins
  const handleMatchFound = useCallback(
    (info: MatchInfo) => {
      const canonicalEventId = parseEventId(eventId);
      const enriched: MatchInfo = {
        ...info,
        eventId: canonicalEventId || info.eventId || null,
      };
      setMatchInfo(enriched);
      setStoredActiveMatch({
        roomId: enriched.roomId,
        opponentId: enriched.opponentId,
        opponentUsername: enriched.opponentUsername,
        opponentElo: enriched.opponentElo,
        opponentAvatar: enriched.opponentAvatar,
        mode: enriched.mode,
        eventId: enriched.eventId,
      });
    },
    [eventId]
  );

  // 4. Server-confirmed match completion (called as soon as match_ended / mcq_match_ended is received)
  const handleMatchCompleted = useCallback((completionPayload?: { roomId?: string }) => {
    const roomId = completionPayload?.roomId || matchInfo?.roomId;
    if (!roomId) return;

    // Idempotency: Trigger at most once per match session
    if (hasReportedCompletionRef.current[roomId]) {
      return;
    }
    hasReportedCompletionRef.current[roomId] = true;

    // Authoritative server confirmation received — refresh event leaderboard
    if (onLeaderboardRefreshRef.current) {
      onLeaderboardRefreshRef.current();
    }
  }, [matchInfo?.roomId]);

  // 5. Leave match / finish viewing results
  const handleLeaveMatch = useCallback(() => {
    setMatchInfo(null);
    setStoredActiveMatch(null);
    setQueueRefreshKey((k) => k + 1);

    // Secondary revalidation when returning to event view
    if (onLeaderboardRefreshRef.current) {
      onLeaderboardRefreshRef.current();
    }
  }, []);

  // 6. Explicit queue actions
  const joinQueue = useCallback((mode: 'code' | 'mcq') => {
    ensureConnected();
    const canonicalEventId = parseEventId(eventId);
    if (socketRef.current) {
      socketRef.current.emit('join_queue', {
        mode,
        ...(canonicalEventId ? { eventId: canonicalEventId } : {}),
      });
      setIsQueued(true);
      setQueuedMode(mode);
      setQueueJoinedAt(Date.now());
    }
  }, [eventId, ensureConnected]);

  const leaveQueue = useCallback(() => {
    const canonicalEventId = parseEventId(eventId);
    if (socketRef.current) {
      socketRef.current.emit('leave_queue', {
        mode: queuedModeRef.current || 'code',
        eventId: canonicalEventId ?? null,
      });
      setIsQueued(false);
      setQueuedMode(null);
      setQueueJoinedAt(null);
    }
  }, [eventId]);

  return {
    socket,
    user,
    authLoading,
    matchInfo,
    queueRefreshKey,
    isQueued,
    queuedMode,
    queueJoinedAt,
    ensureConnected,
    joinQueue,
    leaveQueue,
    handleMatchFound,
    handleMatchCompleted,
    handleLeaveMatch,
  };
}
