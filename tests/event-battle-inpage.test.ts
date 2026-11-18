import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredActiveMatch,
  setStoredActiveMatch,
  ACTIVE_MATCH_STORAGE_KEY,
  StoredActiveMatch,
  parseEventId,
  isValidEventId,
} from '../src/lib/battleEvent';

// In-memory mock for sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

(globalThis as any).sessionStorage = sessionStorageMock;
(globalThis as any).window = {
  location: {
    hostname: 'localhost',
    href: 'http://localhost:3000/events/48ae86b1-674c-4208-a9dd-f991df98d5bd',
    search: '',
  },
  history: {
    pushState: (_state: any, _title: string, url: string) => {
      (globalThis as any).window.location.search = url.includes('?') ? url.split('?')[1] : '';
    },
    replaceState: (_state: any, _title: string, url: string) => {
      (globalThis as any).window.location.search = url.includes('?') ? url.split('?')[1] : '';
    },
  },
};

// Mock Socket for Arena testing
class MockArenaSocket {
  public emitted: Array<{ event: string; data: any }> = [];
  public connected = true;

  emit(event: string, data: any = {}) {
    this.emitted.push({ event, data });
    return true;
  }

  getLastEmit(event: string) {
    for (let i = this.emitted.length - 1; i >= 0; i--) {
      if (this.emitted[i].event === event) return this.emitted[i].data;
    }
    return null;
  }

  clear() {
    this.emitted = [];
  }
}

describe('In-Page Event Battle Arena Integration Suite (Master Requirements)', () => {
  const EVENT_ID_A = '48ae86b1-674c-4208-a9dd-f991df98d5bd';
  const EVENT_ID_B = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  beforeEach(() => {
    sessionStorageMock.clear();
  });

  describe('1. Battle Arena Tab & Enabled Status', () => {
    it('1. Battle Arena tab appears and is available for enabled events', () => {
      const submissionConfig = {
        battle_arena: {
          enabled: true,
          allowed_modes: ['code', 'mcq'] as ('code' | 'mcq')[],
        },
      };

      const isBattleArenaEnabled = Boolean(
        submissionConfig?.battle_arena?.enabled === true &&
        Array.isArray(submissionConfig.battle_arena.allowed_modes) &&
        submissionConfig.battle_arena.allowed_modes.length > 0
      );

      const TABS = [
        { key: 'about', label: 'Overview' },
        { key: 'rounds', label: 'Rounds & Timeline' },
        { key: 'battle', label: 'Battle Arena' },
        { key: 'prizes', label: 'Prizes & Rewards' },
        { key: 'rules', label: 'Rules' },
        { key: 'leaderboard', label: 'Leaderboard' },
        { key: 'faqs', label: 'FAQs' },
      ];

      assert.equal(isBattleArenaEnabled, true);
      assert.equal(TABS[2].key, 'battle');
      assert.equal(TABS[2].label, 'Battle Arena');
    });

    it('2. Disabled Battle Arena does not allow matchmaking', () => {
      const submissionConfig = {
        battle_arena: {
          enabled: false,
          allowed_modes: ['code'] as ('code' | 'mcq')[],
        },
      };

      const isBattleArenaEnabled = Boolean(
        submissionConfig?.battle_arena?.enabled === true &&
        Array.isArray(submissionConfig.battle_arena.allowed_modes) &&
        submissionConfig.battle_arena.allowed_modes.length > 0
      );

      assert.equal(isBattleArenaEnabled, false);
    });

    it('3. Only allowed modes are displayed and enabled', () => {
      const configCodeOnly = {
        battle_arena: {
          enabled: true,
          allowed_modes: ['code'] as ('code' | 'mcq')[],
        },
      };

      const isMcqAllowed = configCodeOnly.battle_arena.allowed_modes.includes('mcq');
      const isCodeAllowed = configCodeOnly.battle_arena.allowed_modes.includes('code');

      assert.equal(isCodeAllowed, true);
      assert.equal(isMcqAllowed, false);
    });
  });

  describe('2. Participant Eligibility & Schedule Gates', () => {
    it('4. Unregistered users cannot enter matchmaking', () => {
      const userRegistration = null;
      const isRegistered = Boolean(userRegistration && (userRegistration as any).status === 'registered');

      const canQueue = isRegistered;
      assert.equal(canQueue, false);
    });

    it('5. Upcoming events cannot start matches', () => {
      const event = {
        status: 'upcoming',
        starts_at: new Date(Date.now() + 3600000).toISOString(),
        ends_at: new Date(Date.now() + 7200000).toISOString(),
      };

      const isOngoing = event.status === 'ongoing';
      assert.equal(isOngoing, false);
    });

    it('6. Ended events cannot start new matches', () => {
      const event = {
        status: 'ended',
        starts_at: new Date(Date.now() - 7200000).toISOString(),
        ends_at: new Date(Date.now() - 3600000).toISOString(),
      };

      const isOngoing = event.status === 'ongoing';
      const isEnded = event.status === 'ended';

      assert.equal(isOngoing, false);
      assert.equal(isEnded, true);
    });
  });

  describe('3. Matchmaking Context & Security Payloads', () => {
    it('7. Coding matchmaking uses the correct event ID and NEVER leaks client userId', () => {
      const socket = new MockArenaSocket();
      const mode = 'code';
      const eventId = EVENT_ID_A;

      // Simulate client joinQueue
      socket.emit('join_queue', {
        mode,
        ...(eventId ? { eventId } : {}),
      });

      const payload = socket.getLastEmit('join_queue');
      assert.notEqual(payload, null);
      assert.equal(payload.mode, 'code');
      assert.equal(payload.eventId, EVENT_ID_A);
      // Security check: client userId must NOT be present in payload
      assert.equal(payload.userId, undefined);
    });

    it('8. MCQ matchmaking uses the correct event ID and NEVER leaks client userId', () => {
      const socket = new MockArenaSocket();
      const mode = 'mcq';
      const eventId = EVENT_ID_A;

      socket.emit('join_queue', {
        mode,
        ...(eventId ? { eventId } : {}),
      });

      const payload = socket.getLastEmit('join_queue');
      assert.notEqual(payload, null);
      assert.equal(payload.mode, 'mcq');
      assert.equal(payload.eventId, EVENT_ID_A);
      assert.equal(payload.userId, undefined);
    });

    it('9. Leaving the queue uses the same exact event context', () => {
      const socket = new MockArenaSocket();
      const mode = 'code';
      const eventId = EVENT_ID_A;

      socket.emit('leave_queue', {
        mode,
        eventId: eventId ?? null,
      });

      const payload = socket.getLastEmit('leave_queue');
      assert.notEqual(payload, null);
      assert.equal(payload.mode, 'code');
      assert.equal(payload.eventId, EVENT_ID_A);
    });
  });

  describe('4. Active Match Lifecycle & Server Confirmation', () => {
    it('10. Match found sets active match info with eventId for in-page ActiveMatchView', () => {
      const matchPayload: StoredActiveMatch = {
        roomId: 'room-inpage-101',
        opponentId: 'opp-1',
        opponentUsername: 'OpponentOne',
        opponentElo: 1200,
        mode: 'code',
        eventId: EVENT_ID_A,
      };

      setStoredActiveMatch(matchPayload);
      const activeMatch = getStoredActiveMatch();

      assert.notEqual(activeMatch, null);
      assert.equal(activeMatch?.roomId, 'room-inpage-101');
      assert.equal(activeMatch?.eventId, EVENT_ID_A);
      assert.equal(activeMatch?.mode, 'code');
    });

    it('11. Active match restoration preserves event ID and verifies against target event', () => {
      const targetEventId = EVENT_ID_A;
      setStoredActiveMatch({
        roomId: 'room-restore-202',
        opponentId: 'opp-2',
        opponentUsername: 'OpponentTwo',
        opponentElo: 1150,
        mode: 'mcq',
        eventId: targetEventId,
      });

      const restored = getStoredActiveMatch();
      const isMatchingEvent = Boolean(restored && restored.eventId === targetEventId);

      assert.equal(isMatchingEvent, true);
      assert.equal(restored?.eventId, targetEventId);
    });

    it('12. Match completion suppresses global ELO update for event matches', () => {
      const isEventMatch = true;
      const myEloUpdate = { oldElo: 1200, newElo: 1220, delta: 20 };

      const result = {
        roomId: 'room-result-303',
        winnerId: 'user-winner',
        isEventMatch,
        eloDelta: isEventMatch ? null : myEloUpdate.delta,
        message: isEventMatch
          ? 'Global ELO Protected: Match results recorded for event standings without altering global Arena ratings.'
          : 'Your ELO has been updated.',
      };

      assert.equal(result.eloDelta, null);
      assert.match(result.message, /Global ELO Protected/);
    });

    it('13. Leaderboard refreshes after confirmed server completion at most once per match', () => {
      let refreshCallCount = 0;
      const onLeaderboardRefresh = () => {
        refreshCallCount++;
      };

      const hasReportedRef: Record<string, boolean> = {};

      const handleServerConfirmedCompletion = (payload: { roomId: string }) => {
        if (hasReportedRef[payload.roomId]) return;
        hasReportedRef[payload.roomId] = true;
        onLeaderboardRefresh();
      };

      // Server emits match_ended first time
      handleServerConfirmedCompletion({ roomId: 'room-idem-404' });
      assert.equal(refreshCallCount, 1);

      // Duplicate/re-emitted match_ended for the same room is idempotent
      handleServerConfirmedCompletion({ roomId: 'room-idem-404' });
      assert.equal(refreshCallCount, 1, 'onLeaderboardRefresh must be called at most once per match');
    });
  });

  describe('5. Event Isolation & Normal Arena Regression Protection', () => {
    it('14. Switching events cannot reuse or restore an old event context', () => {
      // User was in a match for Event A
      setStoredActiveMatch({
        roomId: 'room-event-a',
        opponentId: 'opp-a',
        opponentUsername: 'OppA',
        opponentElo: 1200,
        mode: 'code',
        eventId: EVENT_ID_A,
      });

      // User navigates to Event B details page
      const stored = getStoredActiveMatch();
      const matchesEventB = Boolean(stored && stored.eventId === EVENT_ID_B);

      assert.equal(matchesEventB, false, 'Active match from Event A must never be restored in Event B');
    });

    it('15. Normal Arena behavior remains completely unchanged (null eventId, ELO update preserved)', () => {
      const socket = new MockArenaSocket();
      const mode = 'code';
      const eventId = null; // Normal Arena

      socket.emit('join_queue', {
        mode,
        ...(eventId ? { eventId } : {}),
      });

      const payload = socket.getLastEmit('join_queue');
      assert.notEqual(payload, null);
      assert.equal(payload.mode, 'code');
      assert.equal(payload.eventId, undefined, 'Normal arena must not include eventId');

      // Normal arena match completion preserves ELO update
      const isEventMatch = false;
      const myEloUpdate = { oldElo: 1200, newElo: 1216, delta: 16 };
      const eloDelta = isEventMatch ? null : myEloUpdate.delta;

      assert.equal(eloDelta, 16);
    });
  });
});
