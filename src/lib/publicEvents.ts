export interface SanitizedBattleArenaConfig {
  enabled: boolean;
  allowed_modes: ('code' | 'mcq')[];
}

export function sanitizeBattleArenaConfig(raw: unknown): SanitizedBattleArenaConfig | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const ba = raw as Record<string, unknown>;
  if (ba.enabled !== true) return undefined;
  if (!Array.isArray(ba.allowed_modes) || ba.allowed_modes.length === 0) return undefined;

  for (const mode of ba.allowed_modes) {
    if (mode !== 'code' && mode !== 'mcq') {
      return undefined; // Reject malformed arrays entirely; do not silently sanitize
    }
  }

  const uniqueModes = Array.from(new Set(ba.allowed_modes)) as ('code' | 'mcq')[];
  return {
    enabled: true,
    allowed_modes: uniqueModes,
  };
}

export const PUBLIC_EVENT_STATUSES = ['published', 'ongoing', 'ended'] as const;
export type PublicEventStatus = (typeof PUBLIC_EVENT_STATUSES)[number];

export function isPrivateEvent(submissionConfig: unknown): boolean {
  if (!submissionConfig || typeof submissionConfig !== 'object') return false;
  const cfg = submissionConfig as Record<string, unknown>;
  const privateAccess = cfg.private_access;
  if (!privateAccess || typeof privateAccess !== 'object') return false;
  const val = (privateAccess as Record<string, unknown>).is_private;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.trim().toLowerCase() === 'true';
  return Boolean(val);
}

export interface SanitizedMCQOption {
  id: string;
  text: string;
}

export interface SanitizedMCQQuestion {
  id: string;
  type: 'mcq';
  title: string;
  questionText: string;
  codeSnippet?: string;
  options: SanitizedMCQOption[];
  marks: number;
  timeLimitMin?: number;
}

export interface SanitizedTestCase {
  input: string;
  output: string;
  explanation?: string;
  isPublic: boolean;
}

export interface SanitizedCodingQuestion {
  id: string;
  type: 'coding';
  title: string;
  difficulty: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  timeLimitSec: number;
  memoryLimitMb: number;
  points: number;
  timeLimitMin?: number;
  sampleTestCases: SanitizedTestCase[];
}

export type SanitizedPublicQuestion = SanitizedMCQQuestion | SanitizedCodingQuestion;

export function sanitizePublicQuestions(rawQuestions: unknown): SanitizedPublicQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  const sanitized: SanitizedPublicQuestion[] = [];

  for (const q of rawQuestions) {
    if (!q || typeof q !== 'object') continue;
    const item = q as Record<string, unknown>;

    if (item.type === 'mcq') {
      const rawOptions = Array.isArray(item.options) ? item.options : [];
      const options: SanitizedMCQOption[] = rawOptions.map((opt: unknown) => {
        if (!opt || typeof opt !== 'object') return { id: '', text: '' };
        const o = opt as Record<string, unknown>;
        return {
          id: String(o.id ?? ''),
          text: String(o.text ?? ''),
        };
      });

      sanitized.push({
        id: String(item.id ?? ''),
        type: 'mcq',
        title: String(item.title ?? ''),
        questionText: String(item.questionText ?? ''),
        codeSnippet: item.codeSnippet ? String(item.codeSnippet) : undefined,
        options,
        marks: Number(item.marks ?? 5),
        timeLimitMin: item.timeLimitMin ? Number(item.timeLimitMin) : undefined,
      });
    } else if (item.type === 'coding') {
      const rawCases = Array.isArray(item.sampleTestCases)
        ? item.sampleTestCases
        : Array.isArray(item.testCases)
        ? item.testCases
        : [];

      const sampleTestCases: SanitizedTestCase[] = rawCases
        .filter((tc: unknown) => {
          if (!tc || typeof tc !== 'object') return false;
          const t = tc as Record<string, unknown>;
          return t.isPublic !== false;
        })
        .map((tc: unknown) => {
          const t = tc as Record<string, unknown>;
          return {
            input: String(t.input ?? ''),
            output: String(t.output ?? ''),
            explanation: t.explanation ? String(t.explanation) : undefined,
            isPublic: true,
          };
        });

      sanitized.push({
        id: String(item.id ?? ''),
        type: 'coding',
        title: String(item.title ?? ''),
        difficulty: String(item.difficulty ?? 'Easy'),
        description: String(item.description ?? ''),
        inputFormat: String(item.inputFormat ?? ''),
        outputFormat: String(item.outputFormat ?? ''),
        constraints: String(item.constraints ?? ''),
        timeLimitSec: Number(item.timeLimitSec ?? 1),
        memoryLimitMb: Number(item.memoryLimitMb ?? 128),
        points: Number(item.points ?? 50),
        timeLimitMin: item.timeLimitMin ? Number(item.timeLimitMin) : undefined,
        sampleTestCases,
      });
    }
  }

  return sanitized;
}

export function sanitizePublicEventSummary(event: {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  event_type: string;
  banner_url: string | null;
  status: string;
  registration_open: boolean | null;
  max_participants: number | null;
  prize_pool: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  registration_deadline: Date | null;
  tags_json: unknown;
  participation_type: string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  eligibility: string | null;
  registration_fee: string | null;
  enter_event_url?: string | null;
  submission_config: unknown;
  created_at: Date | null;
  updated_at: Date | null;
  _count?: { event_registrations: number };
}) {
  const subConfig =
    event.submission_config && typeof event.submission_config === 'object'
      ? (event.submission_config as Record<string, unknown>)
      : {};

  const registrationFieldsConfig =
    subConfig.registration_fields_config && typeof subConfig.registration_fields_config === 'object'
      ? (subConfig.registration_fields_config as Record<string, unknown>)
      : null;

  const totalRegistrations = event._count?.event_registrations ?? 0;
  const tagsList = Array.isArray(event.tags_json) ? (event.tags_json as string[]) : [];

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    tagline: event.tagline,
    description: event.description,
    event_type: event.event_type,
    banner_url: event.banner_url,
    status: event.status,
    registration_open: Boolean(event.registration_open),
    max_participants: event.max_participants,
    prize_pool: event.prize_pool,
    starts_at: event.starts_at?.toISOString() ?? null,
    ends_at: event.ends_at?.toISOString() ?? null,
    registration_deadline: event.registration_deadline?.toISOString() ?? null,
    participation_type: event.participation_type ?? 'individual',
    min_team_size: event.min_team_size ?? 1,
    max_team_size: event.max_team_size ?? 4,
    eligibility: event.eligibility ?? 'Open to All',
    registration_fee: event.registration_fee ?? 'Free',
    enter_event_url: event.enter_event_url ?? null,
    registration_fields_config: registrationFieldsConfig,
    created_at: event.created_at?.toISOString() ?? null,
    updated_at: event.updated_at?.toISOString() ?? null,

    // Frontend compatibility
    tags_json: tagsList,
    _count: {
      event_registrations: totalRegistrations,
    },

    // Backward-compatible aliases
    tags: tagsList,
    total_registrations: totalRegistrations,
  };
}

export function sanitizePublicEventDetail(event: {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  event_type: string;
  banner_url: string | null;
  status: string;
  registration_open: boolean | null;
  max_participants: number | null;
  prize_pool: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  registration_deadline: Date | null;
  tags_json: unknown;
  rules_json: unknown;
  timeline_json: unknown;
  faqs_json: unknown;
  sponsors_json: unknown;
  rounds_json: unknown;
  prizes_json: unknown;
  participation_type: string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  eligibility: string | null;
  registration_fee: string | null;
  enter_event_url?: string | null;
  submission_config: unknown;
  results_published: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  _count?: { event_registrations: number };
}) {
  const summary = sanitizePublicEventSummary(event);
  const subConfig =
    event.submission_config && typeof event.submission_config === 'object'
      ? (event.submission_config as Record<string, unknown>)
      : {};

  const submissionMode = typeof subConfig.mode === 'string' ? subConfig.mode : 'platform';
  const requiredSubmissionFields = Array.isArray(subConfig.required_fields)
    ? (subConfig.required_fields as string[])
    : ['submission_url', 'demo_url', 'description'];

  let googleFormUrl: string | undefined = undefined;
  if (submissionMode === 'google_form' && typeof subConfig.google_form_url === 'string') {
    googleFormUrl = subConfig.google_form_url;
  }

  let externalLinkUrl: string | undefined = undefined;
  if (submissionMode === 'external_link' && typeof subConfig.external_link_url === 'string') {
    externalLinkUrl = subConfig.external_link_url;
  }

  let hackathonDetails: Record<string, unknown> | undefined = undefined;
  if (
    event.event_type === 'hackathon' &&
    subConfig.hackathon_details &&
    typeof subConfig.hackathon_details === 'object'
  ) {
    const hd = subConfig.hackathon_details as Record<string, unknown>;
    hackathonDetails = {
      problem_statement: hd.problem_statement ?? null,
      tracks: Array.isArray(hd.tracks) ? hd.tracks : [],
      judging_criteria: Array.isArray(hd.judging_criteria) ? hd.judging_criteria : [],
    };
  }

  let assessmentDetails: Record<string, unknown> | undefined = undefined;
  if (
    event.event_type === 'coding_contest' &&
    subConfig.assessment_details &&
    typeof subConfig.assessment_details === 'object'
  ) {
    const ad = subConfig.assessment_details as Record<string, unknown>;
    assessmentDetails = {
      assessment_mode: ad.assessment_mode ?? 'mixed',
      duration_minutes: Number(ad.duration_minutes ?? 60),
      total_questions: Number(
        ad.total_questions ?? (Array.isArray(ad.questions) ? ad.questions.length : 0)
      ),
      questions: sanitizePublicQuestions(ad.questions),
    };
  }

  const roundsList = Array.isArray(event.rounds_json) ? event.rounds_json : [];
  const prizesList = Array.isArray(event.prizes_json) ? event.prizes_json : [];
  const timelineList = Array.isArray(event.timeline_json) ? event.timeline_json : [];
  const rulesList = Array.isArray(event.rules_json) ? (event.rules_json as string[]) : [];
  const faqsList = Array.isArray(event.faqs_json) ? event.faqs_json : [];
  const sponsorsList = Array.isArray(event.sponsors_json) ? event.sponsors_json : [];

  const battleArenaConfig = sanitizeBattleArenaConfig(subConfig.battle_arena);

  // Safe sanitized submission_config without private_access
  const safeSubmissionConfig = {
    mode: submissionMode as 'platform' | 'google_form' | 'external_link',
    google_form_url: googleFormUrl,
    external_link_url: externalLinkUrl,
    required_fields: requiredSubmissionFields,
    hackathon_details: hackathonDetails,
    assessment_details: assessmentDetails,
    registration_fields_config: summary.registration_fields_config,
    battle_arena: battleArenaConfig,
  };

  return {
    ...summary,

    // Frontend expected fields (*_json)
    rounds_json: roundsList,
    prizes_json: prizesList,
    timeline_json: timelineList,
    rules_json: rulesList,
    faqs_json: faqsList,
    sponsors_json: sponsorsList,
    submission_config: safeSubmissionConfig,
    battle_arena: battleArenaConfig,

    // Backward-compatible aliases
    rounds: roundsList,
    prizes: prizesList,
    timeline: timelineList,
    rules: rulesList,
    faqs: faqsList,
    sponsors: sponsorsList,
    enter_event_url: event.enter_event_url ?? null,
    submission_mode: submissionMode,
    required_submission_fields: requiredSubmissionFields,
    google_form_url: googleFormUrl,
    external_link_url: externalLinkUrl,
    hackathon_details: hackathonDetails,
    assessment_details: assessmentDetails,
    results_published: Boolean(event.results_published || subConfig.results_published),
  };
}

