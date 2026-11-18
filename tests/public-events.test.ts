import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeBattleArenaConfig,
  sanitizePublicEventDetail,
} from '../src/lib/publicEvents.js';

test('Public Event Sanitizer - Battle Arena Configuration Suite', async (t) => {
  await t.test('1. Missing or falsy battle_arena returns undefined', () => {
    assert.strictEqual(sanitizeBattleArenaConfig(undefined), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig(null), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig(''), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig(123), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig([]), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({}), undefined);
  });

  await t.test('2. Disabled battle_arena (enabled === false) returns undefined', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: false,
      allowed_modes: ['code', 'mcq'],
    });
    assert.strictEqual(res, undefined, 'Must reject when enabled is false');
  });

  await t.test('3. Non-boolean enabled values return undefined', () => {
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: 'true', allowed_modes: ['code'] }), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: 1, allowed_modes: ['code'] }), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: null, allowed_modes: ['code'] }), undefined);
  });

  await t.test('4. Missing or non-array allowed_modes returns undefined', () => {
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: true }), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: true, allowed_modes: null }), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: true, allowed_modes: 'code' }), undefined);
    assert.strictEqual(sanitizeBattleArenaConfig({ enabled: true, allowed_modes: { mode: 'code' } }), undefined);
  });

  await t.test('5. Empty allowed_modes array returns undefined', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: true,
      allowed_modes: [],
    });
    assert.strictEqual(res, undefined, 'Must reject empty allowed_modes array');
  });

  await t.test('6. Malformed array with invalid mode strings is rejected entirely (not silently filtered)', () => {
    assert.strictEqual(
      sanitizeBattleArenaConfig({ enabled: true, allowed_modes: ['code', 'hackathon'] }),
      undefined,
      'Must reject array containing unexpected mode'
    );
    assert.strictEqual(
      sanitizeBattleArenaConfig({ enabled: true, allowed_modes: ['invalid'] }),
      undefined
    );
    assert.strictEqual(
      sanitizeBattleArenaConfig({ enabled: true, allowed_modes: ['code', 123] }),
      undefined
    );
    assert.strictEqual(
      sanitizeBattleArenaConfig({ enabled: true, allowed_modes: ['CODE', 'MCQ'] }),
      undefined,
      'Must be strict about lowercase mode names'
    );
  });

  await t.test('7. Valid single mode: code only', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: true,
      allowed_modes: ['code'],
    });
    assert.deepStrictEqual(res, {
      enabled: true,
      allowed_modes: ['code'],
    });
  });

  await t.test('8. Valid single mode: mcq only', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: true,
      allowed_modes: ['mcq'],
    });
    assert.deepStrictEqual(res, {
      enabled: true,
      allowed_modes: ['mcq'],
    });
  });

  await t.test('9. Valid dual modes: code and mcq', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: true,
      allowed_modes: ['code', 'mcq'],
    });
    assert.deepStrictEqual(res, {
      enabled: true,
      allowed_modes: ['code', 'mcq'],
    });
  });

  await t.test('10. Deduplicates valid modes in array', () => {
    const res = sanitizeBattleArenaConfig({
      enabled: true,
      allowed_modes: ['code', 'code', 'mcq'],
    });
    assert.deepStrictEqual(res, {
      enabled: true,
      allowed_modes: ['code', 'mcq'],
    });
  });

  await t.test('11. Full sanitizePublicEventDetail preserves existing fields and attaches battle_arena', () => {
    const rawEvent = {
      id: '00000000-0000-4000-8000-000000000099',
      title: 'Full Sanitizer Test Event',
      slug: 'full-sanitizer-test-event',
      tagline: 'Test Tagline',
      description: 'Test Description',
      event_type: 'coding_contest',
      banner_url: 'https://example.com/banner.png',
      status: 'published',
      registration_open: true,
      max_participants: 100,
      prize_pool: '1000',
      starts_at: new Date('2026-11-20T10:00:00Z'),
      ends_at: new Date('2026-11-20T18:00:00Z'),
      registration_deadline: new Date('2026-11-19T23:59:59Z'),
      tags_json: ['algorithms', 'competitive'],
      rules_json: ['Rule 1', 'Rule 2'],
      timeline_json: [{ label: 'Start', date: 'Nov 20' }],
      faqs_json: [{ question: 'How to play?', answer: 'Join battle' }],
      sponsors_json: [],
      rounds_json: [],
      prizes_json: [],
      participation_type: 'individual',
      min_team_size: 1,
      max_team_size: 1,
      eligibility: 'All',
      registration_fee: 'Free',
      results_published: false,
      created_at: new Date('2026-11-01T00:00:00Z'),
      updated_at: new Date('2026-11-01T00:00:00Z'),
      _count: { event_registrations: 25 },
      submission_config: {
        mode: 'platform',
        required_fields: ['submission_url', 'description'],
        battle_arena: {
          enabled: true,
          allowed_modes: ['code', 'mcq'],
        },
        private_access: {
          is_private: true,
          passcode: 'SECRET_PASSCODE_NEVER_EXPOSE',
        },
      },
    };

    const sanitized = sanitizePublicEventDetail(rawEvent as any);

    // Verifies battle_arena is exposed
    assert.deepStrictEqual(sanitized.submission_config.battle_arena, {
      enabled: true,
      allowed_modes: ['code', 'mcq'],
    });
    assert.deepStrictEqual(sanitized.battle_arena, {
      enabled: true,
      allowed_modes: ['code', 'mcq'],
    });

    // Verifies private_access is strictly stripped from submission_config
    assert.strictEqual((sanitized.submission_config as any).private_access, undefined);

    // Verifies existing fields are preserved
    assert.strictEqual(sanitized.id, rawEvent.id);
    assert.strictEqual(sanitized.title, rawEvent.title);
    assert.strictEqual(sanitized.slug, rawEvent.slug);
    assert.strictEqual(sanitized.submission_config.mode, 'platform');
    assert.deepStrictEqual(sanitized.submission_config.required_fields, ['submission_url', 'description']);
    assert.strictEqual(sanitized.total_registrations, 25);
  });

  await t.test('12. Full sanitizePublicEventDetail with disabled battle_arena leaves battle_arena undefined', () => {
    const rawEvent = {
      id: '00000000-0000-4000-8000-000000000098',
      title: 'Disabled Battle Arena Event',
      slug: 'disabled-battle-arena-event',
      tagline: null,
      description: null,
      event_type: 'hackathon',
      banner_url: null,
      status: 'ongoing',
      registration_open: true,
      max_participants: 50,
      prize_pool: null,
      starts_at: null,
      ends_at: null,
      registration_deadline: null,
      tags_json: [],
      rules_json: [],
      timeline_json: [],
      faqs_json: [],
      sponsors_json: [],
      rounds_json: [],
      prizes_json: [],
      participation_type: 'individual',
      min_team_size: 1,
      max_team_size: 1,
      eligibility: null,
      registration_fee: null,
      results_published: false,
      created_at: null,
      updated_at: null,
      _count: { event_registrations: 0 },
      submission_config: {
        mode: 'platform',
        battle_arena: {
          enabled: false,
          allowed_modes: ['code'],
        },
      },
    };

    const sanitized = sanitizePublicEventDetail(rawEvent as any);
    assert.strictEqual(sanitized.submission_config.battle_arena, undefined);
    assert.strictEqual(sanitized.battle_arena, undefined);
  });
});
