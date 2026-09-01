import { NextRequest, NextResponse } from 'next/server';
import { getEventAuthHeaders } from '@/lib/eventAuth';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const authHeaders = await getEventAuthHeaders(req);
    const body = await req.json().catch(() => ({}));
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(id)}/register`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[POST /api/events/${id}/register proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const authHeaders = await getEventAuthHeaders(req);
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(id)}/register`;

    const res = await fetch(targetUrl, {
      method: 'DELETE',
      headers: authHeaders,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[DELETE /api/events/${id}/register proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}
