'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  useEventBattleManager,
  MatchInfo,
  BattleUserSession,
} from '@/hooks/useEventBattleManager';
import { ArenaSocket } from '@/lib/arenaWsClient';
import { parseEventId } from '@/lib/battleEvent';
import { BattleLeaderboardData } from '@/components/events/EventBattleArenaSection';

export interface EventBattleContextValue {
  eventId: string;
  canonicalEventId: string | null;
  eventTitle?: string;
  eventStatus?: string;
  isBattleArenaEnabled: boolean;
  allowedModes: ('code' | 'mcq')[];
  socket: ArenaSocket | null;
  user: BattleUserSession | null;
  authLoading: boolean;
  matchInfo: MatchInfo | null;
  queueRefreshKey: number;
  isQueued: boolean;
  queuedMode: 'code' | 'mcq' | null;
  queueJoinedAt: number | null;
  ensureConnected: () => void;
  joinQueue: (mode: 'code' | 'mcq') => void;
  leaveQueue: () => void;
  handleMatchFound: (info: MatchInfo) => void;
  handleMatchCompleted: (payload?: { roomId?: string }) => void;
  handleLeaveMatch: () => void;
  battleLeaderboardData: BattleLeaderboardData | null;
  battleLeaderboardLoading: boolean;
  refreshLeaderboard: () => void;
}

const EventBattleContext = createContext<EventBattleContextValue | null>(null);

export interface EventBattleProviderProps {
  eventId: string;
  canonicalEventId?: string;
  eventTitle?: string;
  eventStatus?: string;
  isBattleArenaEnabled?: boolean;
  allowedModes?: ('code' | 'mcq')[];
  children: React.ReactNode;
}

export function EventBattleProvider({
  eventId,
  canonicalEventId: initialCanonicalId,
  eventTitle,
  eventStatus,
  isBattleArenaEnabled = true,
  allowedModes = ['code', 'mcq'],
  children,
}: EventBattleProviderProps) {
  const canonicalId = initialCanonicalId || parseEventId(eventId) || eventId;

  // Leaderboard state
  const [battleLeaderboardData, setBattleLeaderboardData] = useState<BattleLeaderboardData | null>(null);
  const [battleLeaderboardLoading, setBattleLeaderboardLoading] = useState(false);
  const inFlightLeaderboardRef = useRef<Promise<void> | null>(null);

  const fetchLeaderboard = useCallback((force = false) => {
    if (!canonicalId) return;
    if (!force && inFlightLeaderboardRef.current) return;

    setBattleLeaderboardLoading(true);
    const p = fetch(`/api/events/${canonicalId}/battle-leaderboard`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.leaderboard)) {
          setBattleLeaderboardData(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setBattleLeaderboardLoading(false);
        inFlightLeaderboardRef.current = null;
      });
    inFlightLeaderboardRef.current = p;
  }, [canonicalId]);

  const refreshLeaderboard = useCallback(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Initial leaderboard synchronization on mount
  useEffect(() => {
    if (isBattleArenaEnabled && canonicalId) {
      fetchLeaderboard(false);
    }
  }, [isBattleArenaEnabled, canonicalId, fetchLeaderboard]);

  // Hook into the persistent battle manager with lazy connection enabled
  const battleManager = useEventBattleManager({
    eventId: canonicalId,
    isBattleArenaEnabled,
    allowedModes,
    onLeaderboardRefresh: refreshLeaderboard,
    lazy: true,
  });

  const value = useMemo<EventBattleContextValue>(() => ({
    eventId,
    canonicalEventId: canonicalId,
    eventTitle,
    eventStatus,
    isBattleArenaEnabled,
    allowedModes,
    socket: battleManager.socket,
    user: battleManager.user,
    authLoading: battleManager.authLoading,
    matchInfo: battleManager.matchInfo,
    queueRefreshKey: battleManager.queueRefreshKey,
    isQueued: battleManager.isQueued,
    queuedMode: battleManager.queuedMode,
    queueJoinedAt: battleManager.queueJoinedAt,
    ensureConnected: battleManager.ensureConnected,
    joinQueue: battleManager.joinQueue,
    leaveQueue: battleManager.leaveQueue,
    handleMatchFound: battleManager.handleMatchFound,
    handleMatchCompleted: battleManager.handleMatchCompleted,
    handleLeaveMatch: battleManager.handleLeaveMatch,
    battleLeaderboardData,
    battleLeaderboardLoading,
    refreshLeaderboard,
  }), [
    eventId,
    canonicalId,
    eventTitle,
    eventStatus,
    isBattleArenaEnabled,
    allowedModes,
    battleManager,
    battleLeaderboardData,
    battleLeaderboardLoading,
    refreshLeaderboard,
  ]);

  return (
    <EventBattleContext.Provider value={value}>
      {children}
    </EventBattleContext.Provider>
  );
}

export function useEventBattleContext(): EventBattleContextValue | null {
  return useContext(EventBattleContext);
}
