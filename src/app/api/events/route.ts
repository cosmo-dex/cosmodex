import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  PUBLIC_EVENT_STATUSES,
  PublicEventStatus,
  isPrivateEvent,
  sanitizePublicEventSummary,
} from '@/lib/publicEvents';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

async function queryEventsFromDatabase(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search')?.trim() ?? '';
  const eventType = (searchParams.get('event_type') || searchParams.get('type'))?.trim() ?? '';
  const statusParam = searchParams.get('status')?.trim() ?? '';
  const participationParam = searchParams.get('participation')?.trim() ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') ?? searchParams.get('pageSize') ?? '12', 10) || 12)
  );

  let allowedStatuses: PublicEventStatus[] = [...PUBLIC_EVENT_STATUSES];
  if (statusParam) {
    if (PUBLIC_EVENT_STATUSES.includes(statusParam as PublicEventStatus)) {
      allowedStatuses = [statusParam as PublicEventStatus];
    } else {
      return {
        events: [],
        total: 0,
        page,
        pageSize: limit,
        totalPages: 0,
      };
    }
  }

  const where: NonNullable<Parameters<typeof prisma.events.findMany>[0]>['where'] = {
    status: { in: allowedStatuses },
  };

  if (eventType) {
    where.event_type = eventType;
  }

  if (participationParam) {
    where.participation_type = participationParam;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tagline: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const eventsData = await prisma.events.findMany({
    where,
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
      starts_at: true,
      ends_at: true,
      registration_deadline: true,
      tags_json: true,
      participation_type: true,
      min_team_size: true,
      max_team_size: true,
      eligibility: true,
      registration_fee: true,
      submission_config: true,
      enter_event_url: true,
      created_at: true,
      updated_at: true,
      _count: { select: { event_registrations: { where: { status: 'registered' } } } },
    },
    orderBy: [{ starts_at: 'asc' }, { created_at: 'desc' }],
  });

  const publicEvents = eventsData.filter((event) => !isPrivateEvent(event.submission_config));
  const total = publicEvents.length;
  const startIndex = (page - 1) * limit;
  const paginatedEvents = publicEvents.slice(startIndex, startIndex + limit);

  return {
    events: paginatedEvents.map(sanitizePublicEventSummary),
    total,
    page,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function GET(req: NextRequest) {
  // 1. Direct Prisma DB query first (fastest, ~5-15ms)
  try {
    const dbData = await queryEventsFromDatabase(req);
    return NextResponse.json(dbData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
      },
    });
  } catch (dbErr) {
    console.error('[GET /api/events DB first] Error:', dbErr);
  }

  // 2. Fallback to external backend if DB lookup failed
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${EVENT_BACKEND_URL}/api/events${searchParams ? `?${searchParams}` : ''}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        },
      });
    }
  } catch {
    // Backend service unreachable, timed out, or connection refused
  }

  return NextResponse.json(
    {
      events: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      error: 'Failed to retrieve events',
    },
    { status: 500 }
  );
}
