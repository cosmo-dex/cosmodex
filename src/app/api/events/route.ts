import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEMO_EVENTS = [
  {
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
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? '';
  const status = searchParams.get('status') ?? '';
  const participation = searchParams.get('participation') ?? '';
  const search = searchParams.get('search')?.trim().toLowerCase() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const PAGE_SIZE = 12;

  const where: NonNullable<Parameters<typeof prisma.events.findMany>[0]>['where'] = {};

  if (type) where.event_type = type;
  if (status) where.status = status;
  if (participation) where.participation_type = participation;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  try {
    const [eventsData, total] = await Promise.all([
      prisma.events.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          tagline: true,
          event_type: true,
          banner_url: true,
          status: true,
          registration_open: true,
          max_participants: true,
          prize_pool: true,
          prizes_json: true,
          tags_json: true,
          starts_at: true,
          ends_at: true,
          registration_deadline: true,
          participation_type: true,
          enter_event_url: true,
          eligibility: true,
          registration_fee: true,
          rounds_json: true,
          created_at: true,
          _count: { select: { event_registrations: true } },
        },
        orderBy: [
          { status: 'asc' },
          { starts_at: 'asc' },
        ],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.events.count({ where }),
    ]);

    // Fallback to DEMO_EVENTS if database table has 0 events
    let finalEvents = eventsData;
    let finalTotal = total;

    if (eventsData.length === 0 && !search) {
      let filteredDemo = DEMO_EVENTS;
      if (type) filteredDemo = filteredDemo.filter(e => e.event_type === type);
      if (status) filteredDemo = filteredDemo.filter(e => e.status === status);
      if (participation) filteredDemo = filteredDemo.filter(e => e.participation_type === participation);
      if (search) filteredDemo = filteredDemo.filter(e => e.title.toLowerCase().includes(search));

      finalEvents = filteredDemo as unknown as typeof eventsData;
      finalTotal = filteredDemo.length;
    }

    return NextResponse.json({
      events: finalEvents,
      total: finalTotal,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(finalTotal / PAGE_SIZE) || 1,
    });
  } catch (err) {
    console.error('[GET /api/events] Error:', err);
    // Return demo events on database error / empty DB
    return NextResponse.json({
      events: DEMO_EVENTS,
      total: DEMO_EVENTS.length,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
    });
  }
}
