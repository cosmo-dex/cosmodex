import { NextRequest, NextResponse } from 'next/server';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams.toString();
    const targetUrl = `${EVENT_BACKEND_URL}/api/events${searchParams ? `?${searchParams}` : ''}`;

    const res = await fetch(targetUrl, {
      next: { revalidate: 10 },
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    console.error('[GET /api/events proxy] Error:', err);
    return NextResponse.json(
      {
        events: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 1,
        error: 'Event backend service unreachable',
      },
      { status: 503 }
    );
  }
}
