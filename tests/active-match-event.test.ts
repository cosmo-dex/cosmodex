import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredActiveMatch,
  setStoredActiveMatch,
  ACTIVE_MATCH_STORAGE_KEY,
  StoredActiveMatch,
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
(globalThis as any).window = {};

describe('ActiveMatchView Event Awareness & Session Recovery Suite (Step 3.5)', () => {
  const EVENT_ID_1 = '9432d60b-ae9b-4e1b-bfa8-c515a819b910';
  const EVENT_ID_UPPER = 'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D';

  beforeEach(() => {
    sessionStorageMock.clear();
  });

  describe('1. Active Match Session Storage & Recovery', () => {
    it('saves and restores an active event match with eventId preserved', () => {
      const match: StoredActiveMatch = {
        roomId: 'room-12345678',
        opponentId: 'user-opp-1',
        opponentUsername: 'OpponentOne',
        opponentElo: 1250,
        opponentAvatar: '/avatar.png',
        mode: 'code',
        eventId: EVENT_ID_1,
      };

      setStoredActiveMatch(match);
      const restored = getStoredActiveMatch();

      assert.notEqual(restored, null);
      assert.equal(restored?.roomId, 'room-12345678');
      assert.equal(restored?.opponentId, 'user-opp-1');
      assert.equal(restored?.opponentUsername, 'OpponentOne');
      assert.equal(restored?.opponentElo, 1250);
      assert.equal(restored?.mode, 'code');
      assert.equal(restored?.eventId, EVENT_ID_1);
    });

    it('normalizes uppercase eventId to lowercase upon restoration', () => {
      const match: StoredActiveMatch = {
        roomId: 'room-87654321',
        opponentId: 'user-opp-2',
        opponentUsername: 'OpponentTwo',
        opponentElo: 1100,
        mode: 'mcq',
        eventId: EVENT_ID_UPPER,
      };

      setStoredActiveMatch(match);
      const restored = getStoredActiveMatch();

      assert.equal(restored?.eventId, EVENT_ID_UPPER.toLowerCase());
    });

    it('saves and restores normal Arena match with eventId as null', () => {
      const match: StoredActiveMatch = {
        roomId: 'room-normal-1',
        opponentId: 'user-opp-3',
        opponentUsername: 'OpponentThree',
        opponentElo: 1000,
        mode: 'code',
        eventId: null,
      };

      setStoredActiveMatch(match);
      const restored = getStoredActiveMatch();

      assert.notEqual(restored, null);
      assert.equal(restored?.roomId, 'room-normal-1');
      assert.equal(restored?.eventId, null);
    });

    it('clears stored match on leave or completion (null payload)', () => {
      setStoredActiveMatch({
        roomId: 'room-temp',
        opponentId: 'user-1',
        opponentUsername: 'Temp',
        opponentElo: 1000,
        mode: 'code',
        eventId: EVENT_ID_1,
      });

      assert.notEqual(sessionStorageMock.getItem(ACTIVE_MATCH_STORAGE_KEY), null);

      setStoredActiveMatch(null);
      assert.equal(sessionStorageMock.getItem(ACTIVE_MATCH_STORAGE_KEY), null);
      assert.equal(getStoredActiveMatch(), null);
    });

    it('rejects corrupt JSON in sessionStorage safely without throwing', () => {
      sessionStorageMock.setItem(ACTIVE_MATCH_STORAGE_KEY, 'not-valid-json{{{');
      assert.equal(getStoredActiveMatch(), null);
    });

    it('rejects stored object missing roomId', () => {
      sessionStorageMock.setItem(ACTIVE_MATCH_STORAGE_KEY, JSON.stringify({ mode: 'code' }));
      assert.equal(getStoredActiveMatch(), null);
    });

    it('rejects stored object with invalid mode', () => {
      sessionStorageMock.setItem(
        ACTIVE_MATCH_STORAGE_KEY,
        JSON.stringify({ roomId: 'room-1', mode: 'invalid_mode' })
      );
      assert.equal(getStoredActiveMatch(), null);
    });

    it('sanitizes malformed non-UUID eventId to null in stored active match', () => {
      sessionStorageMock.setItem(
        ACTIVE_MATCH_STORAGE_KEY,
        JSON.stringify({ roomId: 'room-1', mode: 'code', eventId: 'not-a-uuid' })
      );
      const restored = getStoredActiveMatch();
      assert.notEqual(restored, null);
      assert.equal(restored?.eventId, null);
    });
  });

  describe('2. ActiveMatchView Event Match Distinction & ELO Suppression', () => {
    it('distinguishes event match from normal match using Boolean(matchInfo.eventId)', () => {
      const eventMatch: StoredActiveMatch = {
        roomId: 'r1',
        opponentId: 'o1',
        opponentUsername: 'Opp1',
        opponentElo: 1000,
        mode: 'code',
        eventId: EVENT_ID_1,
      };
      const normalMatch: StoredActiveMatch = {
        roomId: 'r2',
        opponentId: 'o2',
        opponentUsername: 'Opp2',
        opponentElo: 1000,
        mode: 'code',
        eventId: null,
      };
      const undefinedEventMatch: StoredActiveMatch = {
        roomId: 'r3',
        opponentId: 'o3',
        opponentUsername: 'Opp3',
        opponentElo: 1000,
        mode: 'mcq',
      };

      assert.equal(Boolean(eventMatch.eventId), true);
      assert.equal(Boolean(normalMatch.eventId), false);
      assert.equal(Boolean(undefinedEventMatch.eventId), false);
    });

    it('suppresses simulated global ELO in match result storage for event matches', () => {
      const isEventMatch = true;
      const myEloUpdate = { oldElo: 1200, newElo: 1216, delta: 16 };

      const storedResult = {
        points: 100,
        livesLeft: 0,
        submissions: 5,
        timeTaken: 120,
        opponentName: 'OpponentOne',
        myName: 'PlayerOne',
        eloDelta: isEventMatch ? null : (myEloUpdate?.delta ?? null),
        oldElo: isEventMatch ? null : (myEloUpdate?.oldElo ?? null),
        newElo: isEventMatch ? null : (myEloUpdate?.newElo ?? null),
        matchId: 'room-1',
        isWinner: true,
        eventId: isEventMatch ? EVENT_ID_1 : null,
      };

      assert.equal(storedResult.eloDelta, null, 'Event match must not store ELO delta');
      assert.equal(storedResult.oldElo, null, 'Event match must not store old ELO');
      assert.equal(storedResult.newElo, null, 'Event match must not store new ELO');
      assert.equal(storedResult.eventId, EVENT_ID_1);
    });

    it('preserves normal Arena ELO updates in match result storage when not an event match', () => {
      const isEventMatch = false;
      const myEloUpdate = { oldElo: 1200, newElo: 1216, delta: 16 };

      const storedResult = {
        points: 100,
        livesLeft: 0,
        submissions: 5,
        timeTaken: 120,
        opponentName: 'OpponentOne',
        myName: 'PlayerOne',
        eloDelta: isEventMatch ? null : (myEloUpdate?.delta ?? null),
        oldElo: isEventMatch ? null : (myEloUpdate?.oldElo ?? null),
        newElo: isEventMatch ? null : (myEloUpdate?.newElo ?? null),
        matchId: 'room-1',
        isWinner: true,
        eventId: null,
      };

      assert.equal(storedResult.eloDelta, 16);
      assert.equal(storedResult.oldElo, 1200);
      assert.equal(storedResult.newElo, 1216);
      assert.equal(storedResult.eventId, null);
    });

    it('generates event-specific victory description suppressing "Your ELO has been updated"', () => {
      const getVictoryMessage = (isEventMatch: boolean) =>
        isEventMatch
          ? 'You defeated your opponent! Event points recorded.'
          : 'You defeated your opponent! Your ELO has been updated.';

      assert.equal(getVictoryMessage(true), 'You defeated your opponent! Event points recorded.');
      assert.equal(getVictoryMessage(false), 'You defeated your opponent! Your ELO has been updated.');
    });

    it('generates event-specific draw description', () => {
      const getDrawMessage = (isEventMatch: boolean) =>
        isEventMatch
          ? 'Both fighters competed hard. Event points have been recorded.'
          : 'Both fighters competed hard. The battle ends in a draw.';

      assert.equal(getDrawMessage(true), 'Both fighters competed hard. Event points have been recorded.');
      assert.equal(getDrawMessage(false), 'Both fighters competed hard. The battle ends in a draw.');
    });
  });
});
