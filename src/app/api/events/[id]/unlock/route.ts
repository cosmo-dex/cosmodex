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

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const xff = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    if (xff) forwardHeaders['x-forwarded-for'] = xff;
    const clientCookie = req.headers.get('cookie');
    if (clientCookie) forwardHeaders['cookie'] = clientCookie;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText || res.statusText };
    }

    const resHeaders: Record<string, string> = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    };
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      resHeaders['set-cookie'] = setCookie;
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error(`[POST /api/events/${id}/unlock proxy] Error:`, err);
    return NextResponse.json({ error: 'Event backend service unreachable' }, { status: 503 });
  }
}
