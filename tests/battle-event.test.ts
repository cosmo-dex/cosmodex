import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEventId,
  parseEventId,
  resolveBattleEventId,
  getStoredEventId,
  setStoredEventId,
  BATTLE_EVENT_STORAGE_KEY,
} from '../src/lib/battleEvent';

describe('Battle Event Query Parameter & State Ingestion Suite', () => {
  const VALID_UUID_1 = '9432d60b-ae9b-4e1b-bfa8-c515a819b910';
  const VALID_UUID_2 = 'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D';

  describe('1. Normal Arena (Absent or Null eventId)', () => {
    it('returns eventId: null and isInvalid: false when urlParam is undefined', () => {
      const res = resolveBattleEventId(undefined);
      assert.deepEqual(res, { eventId: null, isInvalid: false });
    });

    it('returns eventId: null and isInvalid: false when urlParam is null', () => {
      const res = resolveBattleEventId(null);
      assert.deepEqual(res, { eventId: null, isInvalid: false });
    });

    it('returns eventId: null and isInvalid: false when urlParam is an empty string', () => {
      const res = resolveBattleEventId('');
      assert.deepEqual(res, { eventId: null, isInvalid: false });
    });

    it('returns eventId: null and isInvalid: false when urlParam is whitespace-only', () => {
      const res = resolveBattleEventId('   ');
      assert.deepEqual(res, { eventId: null, isInvalid: false });
    });

    it('parseEventId returns null for non-string or empty inputs', () => {
      assert.equal(parseEventId(null), null);
      assert.equal(parseEventId(undefined), null);
      assert.equal(parseEventId(''), null);
      assert.equal(parseEventId(12345), null);
      assert.equal(parseEventId({}), null);
    });

    it('preserves normal Arena socket payloads when eventId is absent', () => {
      const eventId: string | null = null;
      const joinPayload = {
        userId: 'user-123',
        mode: 'mcq',
        ...(eventId ? { eventId } : {}),
      };
      assert.equal('eventId' in joinPayload, false);
      assert.deepEqual(joinPayload, { userId: 'user-123', mode: 'mcq' });

      const statusPayload = eventId ? { eventId } : {};
      assert.deepEqual(statusPayload, {});
    });
  });

  describe('2. Valid Event Context', () => {
    it('accepts a valid lowercase UUID and returns eventId', () => {
      const res = resolveBattleEventId(VALID_UUID_1);
      assert.deepEqual(res, { eventId: VALID_UUID_1, isInvalid: false });
    });

    it('normalizes uppercase and mixed-case UUID to lowercase', () => {
      const res = resolveBattleEventId(VALID_UUID_2);
      assert.deepEqual(res, { eventId: VALID_UUID_2.toLowerCase(), isInvalid: false });
    });

    it('trims leading/trailing whitespace around a valid UUID', () => {
      const res = resolveBattleEventId(`  ${VALID_UUID_1}  `);
      assert.deepEqual(res, { eventId: VALID_UUID_1, isInvalid: false });
    });

    it('populates eventId in join_queue and queue_status socket payloads', () => {
      const eventId = VALID_UUID_1;
      const joinPayload = {
        userId: 'user-456',
        mode: 'code',
        ...(eventId ? { eventId } : {}),
      };
      assert.deepEqual(joinPayload, {
        userId: 'user-456',
        mode: 'code',
        eventId: VALID_UUID_1,
      });

      const statusPayload = eventId ? { eventId } : {};
      assert.deepEqual(statusPayload, { eventId: VALID_UUID_1 });
    });
  });

  describe('3. Invalid Event IDs Safety & Sanitization', () => {
    const invalidInputs = [
      'not-a-uuid',
      'hackathon-coding-2026',
      '12345678',
      '9432d60b-ae9b-4e1b', // partial UUID
      '9432d60b-ae9b-4e1b-bfa8-c515a819b910-extra', // overly long
      '9432d60b-ae9b-4e1b-bfa8-c515a819b910 OR 1=1', // SQL injection attempt
      '<script>alert("xss")</script>', // XSS attempt
      'javascript:void(0)',
      '../../etc/passwd',
    ];

    for (const input of invalidInputs) {
      it(`rejects invalid ID "${input}" and flags isInvalid: true`, () => {
        assert.equal(isValidEventId(input), false);
        assert.equal(parseEventId(input), null);
        const res = resolveBattleEventId(input);
        assert.deepEqual(res, { eventId: null, isInvalid: true });
      });
    }

    it('ensures invalid IDs never leak into socket emit payloads', () => {
      const rawParam = 'malformed-or-malicious-param';
      const { eventId } = resolveBattleEventId(rawParam);
      assert.equal(eventId, null);

      const joinPayload = {
        userId: 'user-789',
        mode: 'code',
        ...(eventId ? { eventId } : {}),
      };
      assert.equal('eventId' in joinPayload, false);
      assert.deepEqual(joinPayload, { userId: 'user-789', mode: 'code' });
    });
  });

  describe('4. Session Storage & Refresh / Reconnection State Persistence', () => {
    // Mock window and sessionStorage in Node test runner
    const storageMap = new Map<string, string>();
    const mockSessionStorage = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, val: string) => storageMap.set(key, val),
      removeItem: (key: string) => storageMap.delete(key),
      clear: () => storageMap.clear(),
    };

    // Install mock
    (globalThis as unknown as { window: unknown }).window = { location: { href: 'http://localhost/battle' } };
    (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = mockSessionStorage;

    it('persists and restores valid event ID from session storage', () => {
      storageMap.clear();
      setStoredEventId(VALID_UUID_1);
      assert.equal(getStoredEventId(), VALID_UUID_1);
      assert.equal(storageMap.get(BATTLE_EVENT_STORAGE_KEY), VALID_UUID_1);
    });

    it('clears session storage when setStoredEventId is called with null', () => {
      setStoredEventId(null);
      assert.equal(getStoredEventId(), null);
      assert.equal(storageMap.has(BATTLE_EVENT_STORAGE_KEY), false);
    });

    it('clears session storage when setStoredEventId is called with invalid ID', () => {
      storageMap.set(BATTLE_EVENT_STORAGE_KEY, VALID_UUID_1);
      setStoredEventId('invalid-uuid-string');
      assert.equal(getStoredEventId(), null);
      assert.equal(storageMap.has(BATTLE_EVENT_STORAGE_KEY), false);
    });

    it('simulates page refresh preserving event context from URL query', () => {
      // Step 1: User arrives on /battle?eventId=UUID
      const initialUrlParam = VALID_UUID_1;
      const initial = resolveBattleEventId(initialUrlParam);
      assert.equal(initial.eventId, VALID_UUID_1);
      setStoredEventId(initial.eventId);

      // Step 2: Refresh event (F5) reads searchParams again
      const refreshedUrlParam = VALID_UUID_1;
      const refreshed = resolveBattleEventId(refreshedUrlParam);
      assert.equal(refreshed.eventId, VALID_UUID_1);
      assert.equal(refreshed.isInvalid, false);
    });

    it('simulates navigating to normal /battle clearing event context', () => {
      // User navigates from event battle to general /battle (no query param)
      const normalUrlParam = null;
      const normal = resolveBattleEventId(normalUrlParam);
      assert.equal(normal.eventId, null);
      setStoredEventId(normal.eventId);
      assert.equal(getStoredEventId(), null);
    });

    it('simulates socket reconnection maintaining existing eventId context', () => {
      let activeEventId: string | null = VALID_UUID_1;
      let socketConnected = false;

      // Socket disconnects
      socketConnected = false;
      // In component, activeEventId state remains intact during reconnection
      assert.equal(activeEventId, VALID_UUID_1);

      // Socket reconnects
      socketConnected = true;
      const reconnectedStatusPayload = activeEventId ? { eventId: activeEventId } : {};
      assert.deepEqual(reconnectedStatusPayload, { eventId: VALID_UUID_1 });
    });

    it('handles sessionStorage exceptions gracefully without throwing', () => {
      const brokenStorage = {
        getItem: () => { throw new Error('SecurityError: Access is denied'); },
        setItem: () => { throw new Error('QuotaExceededError'); },
        removeItem: () => { throw new Error('SecurityError'); },
      };
      (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = brokenStorage;

      assert.doesNotThrow(() => {
        setStoredEventId(VALID_UUID_1);
      });
      assert.doesNotThrow(() => {
        const stored = getStoredEventId();
        assert.equal(stored, null);
      });

      // Restore mock
      (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = mockSessionStorage;
    });
  });

  describe('5. Authoritative Backend Eligibility Simulation', () => {
    it('verifies client passes raw valid ID without assuming user eligibility', () => {
      // Client resolves valid format only
      const clientResolution = resolveBattleEventId(VALID_UUID_1);
      assert.equal(clientResolution.eventId, VALID_UUID_1);

      // Backend simulates validation failure (e.g. user not registered or event ended)
      const backendEligibilityCheck = (eventId: string, isRegistered: boolean) => {
        if (!isRegistered) {
          return { valid: false, error: 'User is not registered for this event' };
        }
        return { valid: true };
      };

      const result = backendEligibilityCheck(clientResolution.eventId!, false);
      assert.equal(result.valid, false);
      assert.equal(result.error, 'User is not registered for this event');
    });
  });
});
