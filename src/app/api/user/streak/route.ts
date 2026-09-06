import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

function getUtcDayTimestamp(date: Date): number {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.userId;

    const arenaStats = await prisma.arena_stats.findUnique({
      where: { user_id: userId },
      select: {
        current_streak: true,
        best_streak: true,
        last_played_at: true,
        total_xp: true,
      },
    });

    return NextResponse.json({
      currentStreak: arenaStats?.current_streak ?? 0,
      bestStreak: arenaStats?.best_streak ?? 0,
      lastPlayedAt: arenaStats?.last_played_at?.toISOString() ?? null,
      totalXp: arenaStats?.total_xp ?? 0,
    });
  } catch (error) {
    console.error('[GET /api/user/streak] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.userId;
    const now = new Date();
    const todayTimestamp = getUtcDayTimestamp(now);
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const existing = await prisma.arena_stats.findUnique({
      where: { user_id: userId },
    });

    let currentStreak = 1;
    let bestStreak = 1;
    let streakIncreased = false;

    if (!existing) {
      currentStreak = 1;
      bestStreak = 1;
      streakIncreased = true;
    } else {
      const lastPlayed = existing.last_played_at ? new Date(existing.last_played_at) : null;

      if (!lastPlayed) {
        currentStreak = 1;
        bestStreak = Math.max(existing.best_streak ?? 1, 1);
        streakIncreased = true;
      } else {
        const lastPlayedTimestamp = getUtcDayTimestamp(lastPlayed);
        const dayDifference = Math.round((todayTimestamp - lastPlayedTimestamp) / ONE_DAY_MS);

        if (dayDifference === 0) {
          currentStreak = existing.current_streak ?? 1;
          bestStreak = existing.best_streak ?? currentStreak;
          streakIncreased = false;
        } else if (dayDifference === 1) {
          currentStreak = (existing.current_streak ?? 0) + 1;
          bestStreak = Math.max(existing.best_streak ?? 0, currentStreak);
          streakIncreased = true;
        } else {
          currentStreak = 1;
          bestStreak = existing.best_streak ?? 1;
          streakIncreased = true;
        }
      }
    }

    if (streakIncreased) {
      await prisma.arena_stats.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          current_streak: currentStreak,
          best_streak: bestStreak,
          total_xp: 0,
          total_solved: 0,
          last_played_at: now,
        },
        update: {
          current_streak: currentStreak,
          best_streak: bestStreak,
          last_played_at: now,
        },
      });
    }


    return NextResponse.json({
      success: true,
      currentStreak,
      bestStreak,
      streakIncreased,
      lastPlayedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('[POST /api/user/streak] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
