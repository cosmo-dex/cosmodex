import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEventUserSession } from '@/lib/eventAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const [event, session] = await Promise.all([
      prisma.events.findFirst({
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
          results_published: true,
          created_at: true,
          _count: { select: { event_registrations: true } },
        },
      }),
      getEventUserSession(req).catch(() => null),
    ]);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventId = event.id;

    // 2. Fetch user registration and leaderboard concurrently
    const [userRegistration, lbRaw] = await Promise.all([
      session?.userId
        ? prisma.event_registrations
            .findUnique({
              where: { event_id_user_id: { event_id: eventId, user_id: session.userId } },
              select: {
                status: true,
                team_name: true,
                team_code: true,
                team_members_json: true,
                submission_url: true,
                submission_details_json: true,
              },
            })
            .catch(() => null)
        : Promise.resolve(null),
      prisma.event_leaderboard
        .findMany({
          where: { event_id: eventId },
          orderBy: [{ score: 'desc' }, { updated_at: 'asc' }],
          take: 100,
          include: { users: { select: { username: true, avatar_url: true } } },
        })
        .catch(() => []),
    ]);

    let leaderboard = (lbRaw || []).map((entry, idx) => {
      const meta = (entry.metadata_json as Record<string, unknown>) || {};
      return {
        rank: entry.rank ?? idx + 1,
        score: entry.score,
        username: entry.users?.username || 'Participant',
        avatar_url: entry.users?.avatar_url || null,
        totalTimeSeconds: typeof meta.totalTimeSeconds === 'number' ? meta.totalTimeSeconds : undefined,
        correctCount: typeof meta.correctCount === 'number' ? meta.correctCount : undefined,
      };
    });

    // Fallback if event_leaderboard has not been populated yet: extract submitted registrations
    if (leaderboard.length === 0) {
      try {
        const submittedRegs = await prisma.event_registrations.findMany({
          where: {
            event_id: eventId,
            submission_url: { not: null },
            status: { notIn: ['disqualified', 'withdrawn'] },
          },
          include: { users: { select: { username: true, avatar_url: true } } },
          take: 50,
        });
        if (submittedRegs.length > 0) {
          leaderboard = submittedRegs.map((reg, idx) => {
            const details = (reg.submission_details_json as Record<string, unknown>) || {};
            return {
              rank: idx + 1,
              score: 100,
              username: reg.users?.username || 'Participant',
              avatar_url: reg.users?.avatar_url || null,
              totalTimeSeconds: typeof details.totalTimeSeconds === 'number' ? details.totalTimeSeconds : undefined,
              correctCount: undefined,
            };
          });
        }
      } catch { }
    }

    const subCfg = event.submission_config as Record<string, unknown> | null;
    const registration_fields_config = (event as Record<string, unknown>).registration_fields_config ?? subCfg?.registration_fields_config ?? null;
    const results_published = typeof event.results_published === 'boolean' ? event.results_published : Boolean(subCfg?.results_published ?? false);

    return NextResponse.json(
      {
        event: {
          ...event,
          registration_fields_config,
          results_published,
        },
        userRegistration,
        leaderboard,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-transform',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/events/[id]] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
