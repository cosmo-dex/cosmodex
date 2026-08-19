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
    const event = await prisma.events.findFirst({
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
    });

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

    const session = await getEventUserSession(req);
    if (session?.userId) {
      userRegistration = await prisma.event_registrations.findUnique({
        where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
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

    let leaderboard: {
      rank: number | null;
      score: number;
      username: string;
      avatar_url: string | null;
      totalTimeSeconds?: number;
      correctCount?: number;
    }[] = [];
    if (event.status === 'ongoing' || event.status === 'ended') {
      const lb = await prisma.event_leaderboard.findMany({
        where: { event_id: event.id },
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
    }

    const subCfg = event.submission_config as Record<string, unknown> | null;
    const registration_fields_config = subCfg?.registration_fields_config ?? null;
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
