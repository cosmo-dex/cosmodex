import { NextRequest, NextResponse } from 'next/server';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams.toString();
    const targetUrl = `${EVENT_BACKEND_URL}/api/events${searchParams ? `?${searchParams}` : ''}`;

    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    const rawText = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { events: [], total: 0, error: rawText || res.statusText };
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
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
