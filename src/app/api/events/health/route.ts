import { NextResponse } from 'next/server';

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';

export async function GET() {
  try {
    const res = await fetch(`${EVENT_BACKEND_URL}/health`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: 'UNREACHABLE', services: { database: 'UNKNOWN' }, service: 'event-backend-golang' },
      { status: 503 }
    );
  }
}
