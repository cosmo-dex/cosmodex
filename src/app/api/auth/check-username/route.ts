import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

// OPTIMIZATION: Simple in-memory cache for username checks
const usernameCache = new Map<string, { available: boolean; reason?: string; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

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

    // OPTIMIZATION: Check cache first
    const cacheKey = `${trimmed.toLowerCase()}:${currentUserId || 'anonymous'}`;
    const cached = usernameCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        available: cached.available,
        reason: cached.reason,
      }, { headers: { 'Cache-Control': 'private, max-age=30' } });
    }

    const existing = await prisma.users.findFirst({
      where: {
        username: { equals: trimmed, mode: 'insensitive' },
        ...(currentUserId ? { NOT: { id: currentUserId } } : {}),
      },
      select: { id: true },
    });

    const result = {
      available: !existing,
      reason: existing ? 'This name is already taken.' : undefined,
    };

    // OPTIMIZATION: Cache the result
    usernameCache.set(cacheKey, { ...result, timestamp: Date.now() });
    
    // OPTIMIZATION: Clean old cache entries periodically
    if (usernameCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of usernameCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          usernameCache.delete(key);
        }
      }
    }

    return NextResponse.json(result, { 
      headers: { 'Cache-Control': 'private, max-age=30' } 
    });
  } catch (err) {
    console.error('[check-username] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

