import { NextRequest, NextResponse } from 'next/server';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

const memoryCache = new Map<string, { timestamp: number; data: LeaderboardEntry[] }>();
const CACHE_TTL_MS = 10_000;

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode') === 'mcq' ? 'mcq' : 'code';
  const now = Date.now();

  const cached = memoryCache.get(mode);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
        'X-Cache': 'HIT',
      },
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const stats = await prisma.battle_user_stats.findMany({
        orderBy: {
          [mode === 'mcq' ? 'mcq_elo_rating' : 'elo_rating']: 'desc',
        },
        take: 50,
        select: {
          user_id: true,
          elo_rating: true,
          mcq_elo_rating: true,
          wins: true,
          losses: true,
          draws: true,
          users: {
            select: {
              username: true,
            },
          },
        },
      });

      if (stats && stats.length > 0) {
        const entries: LeaderboardEntry[] = stats.map((item, idx) => ({
          rank: idx + 1,
          userId: item.user_id,
          username: item.users?.username ?? 'Anonymous',
          elo: mode === 'mcq' ? (item.mcq_elo_rating ?? 1000) : (item.elo_rating ?? 1000),
          wins: item.wins ?? 0,
          losses: item.losses ?? 0,
          draws: item.draws ?? 0,
        }));

        memoryCache.set(mode, { timestamp: now, data: entries });

        return NextResponse.json(entries, {
          headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
            'X-Cache': 'MISS',
          },
        });
      }
    } catch (err) {
      console.warn('[battle/leaderboard] DB query failed, using fallback:', err);
    }
  }

  const fallbackStats = Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    userId: `user-${i + 1}`,
    username: `Player${i + 1}`,
    elo: mode === 'mcq' ? 2200 - i * 20 : 2000 - i * 25,
    wins: 40 - i,
    losses: i,
    draws: i % 3,
  }));

  memoryCache.set(mode, { timestamp: now, data: fallbackStats });

  return NextResponse.json(fallbackStats, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
      'X-Cache': 'FALLBACK',
    },
  });
}