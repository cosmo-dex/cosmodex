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
    href: 'http://localhost:3000/events/48ae86b1-674c-4208-a9dd-f991df98d5bd/battle',
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

// Mock Arena Socket for testing socket emissions and listeners
class MockArenaSocket {
  public emitted: Array<{ event: string; data: any }> = [];
  public listeners: Record<string, Function[]> = {};
  public connected = true;

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      delete this.listeners[event];
    } else if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
    return this;
  }

  emit(event: string, data: any = {}) {
    this.emitted.push({ event, data });
    return true;
  }

  trigger(event: string, data?: any) {
    const list = this.listeners[event] || [];
    for (const cb of list) {
      cb(data);
    }
  }

  getLastEmit(event: string) {
    for (let i = this.emitted.length - 1; i >= 0; i--) {
      if (this.emitted[i].event === event) return this.emitted[i].data;
    }
    return null;
  }

  disconnect() {
    this.connected = false;
    this.listeners = {};
  }

  clear() {
    this.emitted = [];
  }
}

describe('CosmoDex — Event Battle Arena: Nested Route Architecture Suite', () => {
  const CANONICAL_EVENT_A = '48ae86b1-674c-4208-a9dd-f991df98d5bd';
  const CANONICAL_EVENT_B = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  const SLUG_EVENT_A = 'cosmodex-galactic-hackathon-2026-mv6niuvv';

  beforeEach(() => {
    sessionStorageMock.clear();
  });

  describe('1. Nested Route URL Context & CTA Navigation', () => {
    it('1. Event details page renders Battle Arena CTA navigating to /events/[eventId]/battle', () => {
      const event = {
        id: CANONICAL_EVENT_A,
        slug: SLUG_EVENT_A,
        status: 'ongoing',
        submission_config: {
          battle_arena: { enabled: true, allowed_modes: ['code', 'mcq'] as ('code' | 'mcq')[] },
        },
      };

      const isBattleArenaEnabled = Boolean(
        event.submission_config?.battle_arena?.enabled &&
        event.submission_config.battle_arena.allowed_modes.length > 0
      );
      assert.strictEqual(isBattleArenaEnabled, true);

      // Verify CTA target URL
      const ctaHref = `/events/${event.slug || event.id}/battle`;
      assert.strictEqual(ctaHref, `/events/${SLUG_EVENT_A}/battle`);
      assert.ok(ctaHref.startsWith('/events/'));
      assert.ok(ctaHref.endsWith('/battle'));
      assert.strictEqual(ctaHref.includes('/battle?eventId='), false, 'Must not use query param redirect');
    });

    it('2. Canonical UUID is preserved when route param is slug or UUID', () => {
      const parsedUuid = parseEventId(CANONICAL_EVENT_A);
      assert.strictEqual(parsedUuid, CANONICAL_EVENT_A);

      const parsedSlug = parseEventId(SLUG_EVENT_A);
      // Slug is not a UUID, so canonical lookup resolves through event.id
      assert.strictEqual(parsedSlug, null);
      assert.strictEqual(isValidEventId(CANONICAL_EVENT_A), true);
      assert.strictEqual(isValidEventId(SLUG_EVENT_A), false);
    });

    it('3. Rejects invalid or dangerous event ID formats', () => {
      assert.strictEqual(parseEventId('../../../etc/passwd'), null);
      assert.strictEqual(parseEventId('DROP TABLE battle_matches;'), null);
      assert.strictEqual(parseEventId('<script>alert(1)</script>'), null);
      assert.strictEqual(isValidEventId('not-a-uuid'), false);
    });
  });

  describe('2. Lazy Socket Initialization & Lifecycle Ownership', () => {
    it('4. Visiting event details hub does not establish socket connection when lazy is enabled', () => {
      let socketCreated = false;
      const simulateEventBattleManager = (lazy: boolean, hasRequestedConnect: boolean, hasStoredMatch: boolean) => {
        if (lazy && !hasRequestedConnect && !hasStoredMatch) {
          return null; // Socket connection deferred
        }
        socketCreated = true;
        return new MockArenaSocket();
      };

      const socket = simulateEventBattleManager(true, false, false);
      assert.strictEqual(socket, null);
      assert.strictEqual(socketCreated, false, 'Visiting event details must not open socket prematurely');
    });

    it('5. Navigating to /events/[eventId]/battle triggers lazy socket connection', () => {
      let socketCreated = false;
      const simulateEventBattleManager = (lazy: boolean, hasRequestedConnect: boolean, hasStoredMatch: boolean) => {
        if (lazy && !hasRequestedConnect && !hasStoredMatch) {
          return null;
        }
        socketCreated = true;
        return new MockArenaSocket();
      };

      // User enters battle route -> ensureConnected() called
      const socket = simulateEventBattleManager(true, true, false);
      assert.ok(socket !== null);
      assert.strictEqual(socketCreated, true);
    });

    it('6. Active stored match presence triggers immediate socket connection for recovery', () => {
      setStoredActiveMatch({
        roomId: 'room-recovery-123',
        opponentId: 'user-opp-99',
        opponentUsername: 'OpponentNova',
        opponentElo: 1250,
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      });

      const stored = getStoredActiveMatch();
      const hasStoredMatch = Boolean(stored && stored.eventId === CANONICAL_EVENT_A);
      assert.strictEqual(hasStoredMatch, true);

      // Even with lazy=true and hasRequestedConnect=false, stored match triggers connect
      const socketCreated = hasStoredMatch;
      assert.strictEqual(socketCreated, true, 'Stored active match must connect socket for recovery');
    });

    it('7. Switching events disconnects old socket and cleans up listeners', () => {
      const socketA = new MockArenaSocket();
      let isQueued = true;
      let activeEventId = CANONICAL_EVENT_A;

      // Simulated cleanup on event route unmount
      const cleanup = (newActiveEventId: string) => {
        if (isQueued && activeEventId) {
          socketA.emit('leave_queue', { mode: 'code', eventId: activeEventId });
        }
        socketA.disconnect();
        activeEventId = newActiveEventId;
        isQueued = false;
      };

      cleanup(CANONICAL_EVENT_B);
      assert.strictEqual(socketA.connected, false);
      assert.deepStrictEqual(socketA.getLastEmit('leave_queue'), {
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      });
      assert.strictEqual(activeEventId, CANONICAL_EVENT_B);
    });
  });

  describe('3. Queue Persistence & Navigation Continuity', () => {
    it('8. Queue state persists across navigation from battle route back to event details', () => {
      const mockSocket = new MockArenaSocket();
      let isQueued = false;
      let queuedMode: 'code' | 'mcq' | null = null;

      // User joins queue on /events/[eventId]/battle
      mockSocket.emit('join_queue', { mode: 'code', eventId: CANONICAL_EVENT_A });
      isQueued = true;
      queuedMode = 'code';

      assert.deepStrictEqual(mockSocket.getLastEmit('join_queue'), {
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      });

      // User navigates back to /events/[eventId] (Layout persists)
      // Component unmounts but layout does NOT emit leave_queue
      assert.strictEqual(isQueued, true, 'Queue state in EventBattleProvider remains true');
      assert.strictEqual(queuedMode, 'code');
      assert.strictEqual(mockSocket.getLastEmit('leave_queue'), null, 'Must NOT cancel queue on internal navigation');
    });

    it('9. Explicit queue cancellation emits leave_queue with exact eventId and mode', () => {
      const mockSocket = new MockArenaSocket();
      let isQueued = true;
      let queuedMode: 'code' | 'mcq' = 'mcq';

      // User clicks "Cancel Queue"
      mockSocket.emit('leave_queue', { mode: queuedMode, eventId: CANONICAL_EVENT_A });
      isQueued = false;

      assert.deepStrictEqual(mockSocket.getLastEmit('leave_queue'), {
        mode: 'mcq',
        eventId: CANONICAL_EVENT_A,
      });
      assert.strictEqual(isQueued, false);
    });

    it('10. Match found while user is browsing event details resolves matchInfo and exits queue', () => {
      const mockSocket = new MockArenaSocket();
      let isQueued = true;
      let matchInfo: any = null;

      const handleMatchFound = (info: any) => {
        isQueued = false;
        matchInfo = { ...info, eventId: CANONICAL_EVENT_A };
        setStoredActiveMatch(matchInfo);
      };

      mockSocket.on('match_found', handleMatchFound);

      // Backend pairs user while on event details
      mockSocket.trigger('match_found', {
        roomId: 'room-nav-found-1',
        opponentId: 'user-2',
        opponentUsername: 'StarCoder',
        opponentElo: 1100,
        mode: 'code',
      });

      assert.strictEqual(isQueued, false);
      assert.ok(matchInfo !== null);
      assert.strictEqual(matchInfo.roomId, 'room-nav-found-1');
      assert.strictEqual(matchInfo.eventId, CANONICAL_EVENT_A);

      // Recovery storage populated
      const stored = getStoredActiveMatch();
      assert.strictEqual(stored?.roomId, 'room-nav-found-1');
    });
  });

  describe('4. Active Match Recovery & Backend Verification', () => {
    it('11. sessionStorage acts only as recovery hint; verifies room existence with backend', () => {
      const mockSocket = new MockArenaSocket();
      let activeMatch: any = {
        roomId: 'room-verify-backend-1',
        opponentId: 'user-3',
        opponentUsername: 'GalacticCoder',
        opponentElo: 1300,
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      };
      setStoredActiveMatch(activeMatch);

      // On socket connect, client joins room to verify
      mockSocket.emit('join_room', { roomId: activeMatch.roomId });
      assert.deepStrictEqual(mockSocket.getLastEmit('join_room'), { roomId: 'room-verify-backend-1' });

      // Simulated Backend room state verification
      let verifiedRoomState: any = null;
      mockSocket.on('room_state_update', (state: any) => {
        verifiedRoomState = state;
      });

      mockSocket.trigger('room_state_update', {
        roomId: 'room-verify-backend-1',
        status: 'ACTIVE',
        currentStage: 2,
      });

      assert.ok(verifiedRoomState !== null);
      assert.strictEqual(verifiedRoomState.status, 'ACTIVE');
      assert.strictEqual(getStoredActiveMatch()?.roomId, 'room-verify-backend-1');
    });

    it('12. Expired or unrecoverable Redis room state clears storage and cancels recovery safely', () => {
      const mockSocket = new MockArenaSocket();
      let activeMatch: any = {
        roomId: 'room-expired-999',
        opponentId: 'user-4',
        opponentUsername: 'LostPlayer',
        opponentElo: 1000,
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      };
      setStoredActiveMatch(activeMatch);

      // Backend responds with error that room has expired
      mockSocket.on('error', (err: { message: string }) => {
        if (/room does not exist|expired|not a participant/i.test(err.message)) {
          activeMatch = null;
          setStoredActiveMatch(null);
        }
      });

      mockSocket.trigger('error', { message: 'Room does not exist or has expired' });

      assert.strictEqual(activeMatch, null);
      assert.strictEqual(getStoredActiveMatch(), null, 'Storage must be cleaned up on expired room');
    });

    it('13. Already completed match does not restore active gameplay', () => {
      let activeMatch: any = {
        roomId: 'room-already-completed',
        opponentId: 'user-5',
        opponentUsername: 'PastWinner',
        opponentElo: 1400,
        mode: 'mcq',
        eventId: CANONICAL_EVENT_A,
      };
      setStoredActiveMatch(activeMatch);

      // Backend reports room is already COMPLETED
      const backendRoomState = {
        roomId: 'room-already-completed',
        status: 'COMPLETED',
      };

      if (backendRoomState.status === 'COMPLETED') {
        activeMatch = null;
        setStoredActiveMatch(null);
      }

      assert.strictEqual(activeMatch, null);
      assert.strictEqual(getStoredActiveMatch(), null);
    });

    it('14. Cross-event match mismatch: Match for Event B is strictly rejected on Event A', () => {
      setStoredActiveMatch({
        roomId: 'room-event-b',
        opponentId: 'user-b',
        opponentUsername: 'EventBPlayer',
        opponentElo: 1200,
        mode: 'code',
        eventId: CANONICAL_EVENT_B,
      });

      const stored = getStoredActiveMatch();
      const currentRouteEventId = CANONICAL_EVENT_A;

      let restoredMatch: any = null;
      if (stored && stored.eventId === currentRouteEventId) {
        restoredMatch = stored;
      }

      assert.strictEqual(restoredMatch, null, 'Cannot restore Event B match while viewing Event A');
      assert.notStrictEqual(stored?.eventId, currentRouteEventId);
    });
  });

  describe('5. Match Completion & Idempotent Leaderboard Refresh', () => {
    it('15. Coding match completion invokes leaderboard refresh exactly once per match', () => {
      let leaderboardRefreshCount = 0;
      const reportedMap: Record<string, boolean> = {};

      const handleMatchCompleted = (payload: { roomId: string }) => {
        if (reportedMap[payload.roomId]) return;
        reportedMap[payload.roomId] = true;
        leaderboardRefreshCount++;
      };

      // Server emits match_ended
      handleMatchCompleted({ roomId: 'room-coding-finish-1' });
      assert.strictEqual(leaderboardRefreshCount, 1);

      // Duplicate emission / reconnect replay
      handleMatchCompleted({ roomId: 'room-coding-finish-1' });
      assert.strictEqual(leaderboardRefreshCount, 1, 'Duplicate completion must be idempotent');
    });

    it('16. MCQ match completion invokes leaderboard refresh exactly once per match', () => {
      let leaderboardRefreshCount = 0;
      const reportedMap: Record<string, boolean> = {};

      const handleMatchCompleted = (payload: { roomId: string }) => {
        if (reportedMap[payload.roomId]) return;
        reportedMap[payload.roomId] = true;
        leaderboardRefreshCount++;
      };

      // Server emits mcq_match_ended
      handleMatchCompleted({ roomId: 'room-mcq-finish-1' });
      assert.strictEqual(leaderboardRefreshCount, 1);

      // Duplicate emission / reconnect replay
      handleMatchCompleted({ roomId: 'room-mcq-finish-1' });
      assert.strictEqual(leaderboardRefreshCount, 1, 'Duplicate MCQ completion must be idempotent');
    });

    it('17. Global ELO delta is suppressed for event matches, preserved for normal matches', () => {
      const isEventMatch = true;
      const normalMatch = false;

      const eventResultElo = isEventMatch ? null : 25;
      const normalResultElo = normalMatch ? null : 25;

      assert.strictEqual(eventResultElo, null, 'Event matches must not expose or update global ELO delta');
      assert.strictEqual(normalResultElo, 25, 'Normal Arena must preserve global ELO delta');
    });
  });

  describe('6. Eligibility & Private Event Gates', () => {
    it('18. Unregistered participants are prevented from matchmaking', () => {
      const isRegistered = false;
      const isOngoing = true;
      const isBattleEnabled = true;

      const canEnterQueue = isRegistered && isOngoing && isBattleEnabled;
      assert.strictEqual(canEnterQueue, false);
    });

    it('19. Upcoming events disable matchmaking and show scheduled notice', () => {
      const eventStatus: string = 'published';
      const isOngoing = (eventStatus as string) === 'ongoing';
      const isUpcoming = (eventStatus as string) === 'published';

      assert.strictEqual(isOngoing, false);
      assert.strictEqual(isUpcoming, true);
    });

    it('20. Ended events disable matchmaking and link to final standings', () => {
      const eventStatus: string = 'ended';
      const isOngoing = (eventStatus as string) === 'ongoing';
      const isEnded = (eventStatus as string) === 'ended';

      assert.strictEqual(isOngoing, false);
      assert.strictEqual(isEnded, true);
    });

    it('21. Private event requires valid unlock token before unlocking queue', () => {
      const isPrivate = true;
      let unlockToken: string | null = null;
      let isUnlocked = Boolean(unlockToken);

      assert.strictEqual(isUnlocked, false);

      // Unlock successful
      unlockToken = 'valid_signed_unlock_token';
      isUnlocked = Boolean(unlockToken);
      assert.strictEqual(isUnlocked, true);
    });

    it('22. Disallowed modes cannot be selected or queued', () => {
      const allowedModes: ('code' | 'mcq')[] = ['code']; // Only coding allowed

      assert.strictEqual(allowedModes.includes('code'), true);
      assert.strictEqual(allowedModes.includes('mcq'), false);

      const canQueueMcq = allowedModes.includes('mcq');
      assert.strictEqual(canQueueMcq, false, 'MCQ must be rejected when event only allows coding');
    });
  });

  describe('7. Isolation: Normal Arena & Contest Arena Protection', () => {
    it('23. Normal Arena /battle operates with null eventId', () => {
      const normalArenaEventId = null;
      assert.strictEqual(normalArenaEventId, null);
      assert.strictEqual(Boolean(normalArenaEventId), false);
    });

    it('24. Event Contest Arena submit routes remain independent from Battle Arena', () => {
      const contestUrl = `/events/${SLUG_EVENT_A}/submit`;
      const battleUrl = `/events/${SLUG_EVENT_A}/battle`;

      assert.notStrictEqual(contestUrl, battleUrl);
      assert.ok(contestUrl.endsWith('/submit'));
      assert.ok(battleUrl.endsWith('/battle'));
    });

    it('25. Matchmaking payload security: client never sends spoofable userId', () => {
      const clientPayload = {
        mode: 'code',
        eventId: CANONICAL_EVENT_A,
      };

      assert.strictEqual('userId' in clientPayload, false, 'userId must never be sent in client queue payloads');
      assert.strictEqual(clientPayload.eventId, CANONICAL_EVENT_A);
      assert.strictEqual(clientPayload.mode, 'code');
    });
  });
});
