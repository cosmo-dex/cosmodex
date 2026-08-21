import { NextRequest, NextResponse } from 'next/server';

const BATTLE_URL = process.env.BATTLE_ARENA_URL || 'http://localhost:3001';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${BATTLE_URL}/api/problems/${id}`, {
      next: { revalidate: 120 },
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Battle Arena backend unreachable' }, { status: 503 });
  }
}
