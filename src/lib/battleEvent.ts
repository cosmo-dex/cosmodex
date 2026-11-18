const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates whether a value is a non-empty RFC 4122 / UUID formatted string.
 */
export function isValidEventId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  return UUID_REGEX.test(trimmed);
}

/**
 * Parses and sanitizes an event ID. Returns a trimmed lowercase UUID if valid, or null.
 */
export function parseEventId(param: unknown): string | null {
  if (!param || typeof param !== 'string') return null;
  const trimmed = param.trim();
  if (!isValidEventId(trimmed)) return null;
  return trimmed.toLowerCase();
}

export const BATTLE_EVENT_STORAGE_KEY = 'cosmodex_battle_event_id';
export const ACTIVE_MATCH_STORAGE_KEY = 'cosmodex_active_match';

export interface StoredActiveMatch {
  roomId: string;
  opponentId: string;
  opponentUsername: string;
  opponentElo: number;
  opponentAvatar?: string | null;
  mode: 'code' | 'mcq';
  eventId?: string | null;
}

/**
 * Reads any saved active match from sessionStorage for page refresh / reconnection recovery.
 */
export function getStoredActiveMatch(): StoredActiveMatch | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_MATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.roomId || typeof parsed.roomId !== 'string') return null;
    if (parsed.mode !== 'code' && parsed.mode !== 'mcq') return null;
    return {
      roomId: parsed.roomId,
      opponentId: parsed.opponentId || '',
      opponentUsername: parsed.opponentUsername || 'Opponent',
      opponentElo: typeof parsed.opponentElo === 'number' ? parsed.opponentElo : 1000,
      opponentAvatar: parsed.opponentAvatar ?? null,
      mode: parsed.mode,
      eventId: parseEventId(parsed.eventId),
    };
  } catch {
    return null;
  }
}

/**
 * Saves or clears active match info in sessionStorage.
 */
export function setStoredActiveMatch(match: StoredActiveMatch | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (match && match.roomId) {
      sessionStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, JSON.stringify(match));
    } else {
      sessionStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or access errors safely
  }
}

/**
 * Reads any saved event ID from sessionStorage.
 */
export function getStoredEventId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(BATTLE_EVENT_STORAGE_KEY);
    return parseEventId(stored);
  } catch {
    return null;
  }
}

/**
 * Saves or clears the active event ID in sessionStorage.
 */
export function setStoredEventId(eventId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (eventId && isValidEventId(eventId)) {
      sessionStorage.setItem(BATTLE_EVENT_STORAGE_KEY, eventId.toLowerCase());
    } else {
      sessionStorage.removeItem(BATTLE_EVENT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or access errors safely
  }
}

export interface BattleEventResolution {
  eventId: string | null;
  isInvalid: boolean;
}

/**
 * Resolves the effective event ID given a query parameter.
 * - When param is omitted or empty: returns { eventId: null, isInvalid: false } (Normal Arena).
 * - When param is a valid UUID: returns { eventId: <lowercaseUuid>, isInvalid: false }.
 * - When param is present but malformed: returns { eventId: null, isInvalid: true }.
 */
export function resolveBattleEventId(urlParam?: string | null): BattleEventResolution {
  if (urlParam === undefined || urlParam === null || urlParam.trim() === '') {
    return { eventId: null, isInvalid: false };
  }
  const parsed = parseEventId(urlParam);
  if (!parsed) {
    return { eventId: null, isInvalid: true };
  }
  return { eventId: parsed, isInvalid: false };
}
