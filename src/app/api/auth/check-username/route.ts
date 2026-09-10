import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const trimmed = username.trim();

    if (trimmed.length < 3 || trimmed.length > 30) {
      return NextResponse.json({ available: false, reason: 'Username must be 3–30 characters.' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return NextResponse.json({ available: false, reason: 'Only letters, numbers, and underscores.' });
    }

    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    const currentUserId = session?.userId;

    const existing = await prisma.users.findFirst({
      where: {
        username: { equals: trimmed, mode: 'insensitive' },
        ...(currentUserId ? { NOT: { id: currentUserId } } : {}),
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        available: !existing,
        reason: existing ? 'This name is already taken.' : undefined,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[check-username] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

