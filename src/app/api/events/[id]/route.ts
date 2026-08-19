import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEventUserSession } from '@/lib/eventAuth';

const DEMO_EVENTS_MAP: Record<string, unknown> = {
  "cosmo-hackathon-2026": {
    id: "demo-hackathon-1",
    title: "CosmoHack 2026: Galactic Innovation",
    slug: "cosmo-hackathon-2026",
    tagline: "Build futuristic space AI apps, dApps, and developer tools to win $10,000+ in prizes.",
    description: "Welcome to CosmoHack 2026! Over 48 hours, developers, designers, and visionaries team up to construct high-impact projects. Challenge categories include AI Agents, Space Tech, and Web3 Infrastructure.",
    event_type: "hackathon",
    banner_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    status: "ongoing",
    registration_open: true,
    max_participants: 500,
    prize_pool: "$10,000 USD",
    prizes_json: [
      { rank: "1st Place", prize: "$5,000 USD", perks: "CosmoDex Champion Trophy + Swag Box" },
      { rank: "2nd Place", prize: "$3,000 USD", perks: "CosmoDex Silver Medal" },
      { rank: "3rd Place", prize: "$2,000 USD", perks: "CosmoDex Bronze Medal" }
    ],
    tags_json: ["Next.js", "AI", "TypeScript", "SpaceTech"],
    rules_json: [
      "Submissions must be original work created during the hackathon timeline.",
      "Teams can consist of 1 to 4 members.",
      "Projects must include a public GitHub repository link and demo video/URL."
    ],
    timeline_json: [
      { label: "Registration Opens", date: "Aug 15, 2026", done: true },
      { label: "Hackathon Kickoff", date: "Aug 18, 2026", done: true },
      { label: "Project Submissions Due", date: "Aug 22, 2026", done: false },
      { label: "Winners Announced", date: "Aug 25, 2026", done: false }
    ],
    faqs_json: [
      { question: "Is participation free?", answer: "Yes! CosmoHack is 100% free for all developers." },
      { question: "Can I participate solo?", answer: "Yes, both solo hackers and teams of up to 4 are welcome." }
    ],
    sponsors_json: [],
    starts_at: new Date(Date.now() - 86400000).toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    registration_deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    participation_type: "team",
    min_team_size: 1,
    max_team_size: 4,
    enter_event_url: "/events/cosmo-hackathon-2026/submit",
    rounds_json: [
      { id: "r1", title: "Round 1: Project Submission", description: "Submit GitHub repo & video", type: "submission", starts_at: null, ends_at: null, action_url: null }
    ],
    eligibility: "Open to All Developers",
    registration_fee: "Free",
    registration_fields_config: {
      phone: { enabled: true, required: true },
      college_org: { enabled: true, required: true },
      degree: { enabled: true, required: false },
      branch: { enabled: true, required: false },
      year_of_study: { enabled: true, required: false },
      city_state: { enabled: true, required: false },
      gender: { enabled: true, required: false },
      github_url: { enabled: true, required: true },
      linkedin_url: { enabled: true, required: false },
      portfolio_url: { enabled: true, required: false },
      resume_url: { enabled: true, required: false },
      coding_handle: { enabled: true, required: false },
      preferred_language: { enabled: true, required: false },
      referral_source: { enabled: true, required: false }
    },
    submission_config: {
      mode: "platform",
      required_fields: ["github_url", "demo_url", "description"]
    },
    created_at: new Date().toISOString(),
    _count: { event_registrations: 142 }
  },
  "demo-hackathon-1": {
    id: "demo-hackathon-1",
    title: "CosmoHack 2026: Galactic Innovation",
    slug: "cosmo-hackathon-2026",
    tagline: "Build futuristic space AI apps, dApps, and developer tools to win $10,000+ in prizes.",
    description: "Welcome to CosmoHack 2026! Over 48 hours, developers, designers, and visionaries team up to construct high-impact projects. Challenge categories include AI Agents, Space Tech, and Web3 Infrastructure.",
    event_type: "hackathon",
    banner_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    status: "ongoing",
    registration_open: true,
    max_participants: 500,
    prize_pool: "$10,000 USD",
    prizes_json: [
      { rank: "1st Place", prize: "$5,000 USD", perks: "CosmoDex Champion Trophy + Swag Box" },
      { rank: "2nd Place", prize: "$3,000 USD", perks: "CosmoDex Silver Medal" },
      { rank: "3rd Place", prize: "$2,000 USD", perks: "CosmoDex Bronze Medal" }
    ],
    tags_json: ["Next.js", "AI", "TypeScript", "SpaceTech"],
    rules_json: [
      "Submissions must be original work created during the hackathon timeline.",
      "Teams can consist of 1 to 4 members.",
      "Projects must include a public GitHub repository link and demo video/URL."
    ],
    timeline_json: [
      { label: "Registration Opens", date: "Aug 15, 2026", done: true },
      { label: "Hackathon Kickoff", date: "Aug 18, 2026", done: true },
      { label: "Project Submissions Due", date: "Aug 22, 2026", done: false },
      { label: "Winners Announced", date: "Aug 25, 2026", done: false }
    ],
    faqs_json: [
      { question: "Is participation free?", answer: "Yes! CosmoHack is 100% free for all developers." },
      { question: "Can I participate solo?", answer: "Yes, both solo hackers and teams of up to 4 are welcome." }
    ],
    sponsors_json: [],
    starts_at: new Date(Date.now() - 86400000).toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    registration_deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    participation_type: "team",
    min_team_size: 1,
    max_team_size: 4,
    enter_event_url: "/events/cosmo-hackathon-2026/submit",
    rounds_json: [
      { id: "r1", title: "Round 1: Project Submission", description: "Submit GitHub repo & video", type: "submission", starts_at: null, ends_at: null, action_url: null }
    ],
    eligibility: "Open to All Developers",
    registration_fee: "Free",
    registration_fields_config: {
      phone: { enabled: true, required: true },
      college_org: { enabled: true, required: true },
      degree: { enabled: true, required: false },
      branch: { enabled: true, required: false },
      year_of_study: { enabled: true, required: false },
      city_state: { enabled: true, required: false },
      gender: { enabled: true, required: false },
      github_url: { enabled: true, required: true },
      linkedin_url: { enabled: true, required: false },
      portfolio_url: { enabled: true, required: false },
      resume_url: { enabled: true, required: false },
      coding_handle: { enabled: true, required: false },
      preferred_language: { enabled: true, required: false },
      referral_source: { enabled: true, required: false }
    },
    submission_config: {
      mode: "platform",
      required_fields: ["github_url", "demo_url", "description"]
    },
    created_at: new Date().toISOString(),
    _count: { event_registrations: 142 }
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    let event: Record<string, unknown> | null = null;
    try {
      event = (await prisma.events.findFirst({
        where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
        select: {
          id: true,
          title: true,
          slug: true,
          tagline: true,
          description: true,
          event_type: true,
          banner_url: true,
          status: true,
          registration_open: true,
          max_participants: true,
          prize_pool: true,
          prizes_json: true,
          tags_json: true,
          rules_json: true,
          timeline_json: true,
          faqs_json: true,
          sponsors_json: true,
          starts_at: true,
          ends_at: true,
          registration_deadline: true,
          participation_type: true,
          min_team_size: true,
          max_team_size: true,
          enter_event_url: true,
          rounds_json: true,
          eligibility: true,
          registration_fee: true,
          submission_config: true,
          created_at: true,
          _count: { select: { event_registrations: true } },
        },
      })) as Record<string, unknown> | null;
    } catch {
      event = null;
    }

    if (!event && DEMO_EVENTS_MAP[id]) {
      event = DEMO_EVENTS_MAP[id] as Record<string, unknown>;
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let userRegistration: {
      status: string;
      team_name: string | null;
      team_code: string | null;
      team_members_json: unknown;
      submission_url: string | null;
      submission_details_json: unknown;
    } | null = null;

    try {
      const session = await getEventUserSession(req);
      if (session?.userId && event?.id) {
        userRegistration = await prisma.event_registrations.findUnique({
          where: { event_id_user_id: { event_id: event.id as string, user_id: session.userId } },
          select: {
            status: true,
            team_name: true,
            team_code: true,
            team_members_json: true,
            submission_url: true,
            submission_details_json: true,
          },
        });
      }
    } catch {
      userRegistration = null;
    }

    let leaderboard: {
      rank: number | null;
      score: number;
      username: string;
      avatar_url: string | null;
      totalTimeSeconds?: number;
      correctCount?: number;
    }[] = [];
    if (event.status === 'ongoing' || event.status === 'ended') {
      try {
        const lb = await prisma.event_leaderboard.findMany({
          where: { event_id: event.id as string },
          orderBy: [{ rank: 'asc' }, { score: 'desc' }],
          take: 50,
          include: { users: { select: { username: true, avatar_url: true } } },
        });
        leaderboard = lb.map((entry) => {
          const meta = (entry.metadata_json as Record<string, unknown>) || {};
          return {
            rank: entry.rank,
            score: entry.score,
            username: entry.users.username,
            avatar_url: entry.users.avatar_url,
            totalTimeSeconds: typeof meta.totalTimeSeconds === 'number' ? meta.totalTimeSeconds : undefined,
            correctCount: typeof meta.correctCount === 'number' ? meta.correctCount : undefined,
          };
        });
      } catch {
        leaderboard = [];
      }
    }

    const subCfg = event.submission_config as Record<string, unknown> | null;
    const registration_fields_config = (event.registration_fields_config ?? subCfg?.registration_fields_config ?? null);
    const results_published = Boolean(subCfg?.results_published ?? false);

    return NextResponse.json({
      event: {
        ...event,
        registration_fields_config,
        results_published,
      },
      userRegistration,
      leaderboard,
    });
  } catch (err) {
    console.error('[GET /api/events/[id]] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
