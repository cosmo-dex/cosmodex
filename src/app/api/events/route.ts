import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
  if (status) {
    where.status = status;
  } else {
    where.status = { in: ['published', 'ongoing', 'ended'] };
  }
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
          tags_json: true,
          starts_at: true,
          ends_at: true,
          registration_deadline: true,
          participation_type: true,
          enter_event_url: true,
          eligibility: true,
          registration_fee: true,
          created_at: true,
          _count: { select: { event_registrations: true } },
        },
        orderBy: [
          { status: 'asc' },
          { starts_at: 'asc' },
          { created_at: 'desc' },
        ],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.events.count({ where }),
    ]);

    return NextResponse.json(
      {
        events: eventsData,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE) || 1,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/events] Error:', err);
    return NextResponse.json(
      {
        events: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 1,
        error: 'Failed to fetch events',
      },
      { status: 500 }
    );
  }
}

