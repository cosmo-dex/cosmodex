import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

const BATTLE_URL = process.env.BATTLE_ARENA_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  let isAuth = false;

  // 1. Check cosmo_session cookie with cryptographic signature
  const sessionCookie = req.cookies.get(SESSION_COOKIE);
  const user = await verifySession(sessionCookie?.value);
  if (user?.userId) {
    isAuth = true;
  }

  // 2. Fallback to NextAuth session
  if (!isAuth) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      isAuth = true;
    }
  }

  if (!isAuth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(`${BATTLE_URL}/api/room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Battle Arena backend unreachable' }, { status: 503 });
  }
}
