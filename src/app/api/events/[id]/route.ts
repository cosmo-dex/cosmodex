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
    const unlockToken = req.headers.get('x-unlock-token');
    if (unlockToken) {
      authHeaders['x-unlock-token'] = unlockToken;
    }
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(id)}`;

    const res = await fetch(targetUrl, {
      headers: authHeaders,
      cache: 'no-store',
    });

    const rawText = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText || res.statusText };
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err) {
    console.error(`[GET /api/events/${id} proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}
