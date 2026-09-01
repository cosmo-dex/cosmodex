import { NextRequest, NextResponse } from 'next/server';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(id)}/unlock`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[POST /api/events/${id}/unlock proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}
