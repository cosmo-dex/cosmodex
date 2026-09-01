import { NextRequest, NextResponse } from 'next/server';
import { getEventAuthHeaders } from '@/lib/eventAuth';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const authHeaders = await getEventAuthHeaders(req);
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(id)}/responses`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'private, no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error(`[GET /api/events/${id}/responses proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}