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
const CACHE_TTL_MS = 1000;

export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get('mode');
  const mode = modeParam === 'mcq' ? 'mcq' : modeParam === 'global' ? 'global' : 'code';
  const now = Date.now();

  const cached = memoryCache.get(mode);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Cache': 'HIT',
      },
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const stats = await prisma.battle_user_stats.findMany({
        orderBy: mode === 'mcq' 
          ? [{ mcq_elo_rating: 'desc' }, { wins: 'desc' }]
          : [{ elo_rating: 'desc' }, { mcq_elo_rating: 'desc' }, { wins: 'desc' }],
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
        const mapped = stats.map((item) => {
          const codeElo = item.elo_rating ?? 1000;
          const mcqElo = item.mcq_elo_rating ?? 1000;
          let effectiveElo = codeElo;
          if (mode === 'mcq') {
            effectiveElo = mcqElo;
          } else if (mode === 'global') {
            effectiveElo = Math.max(codeElo, mcqElo);
          }
          return {
            userId: item.user_id,
            username: item.users?.username ?? 'Anonymous',
            elo: effectiveElo,
            codeElo,
            mcqElo,
            wins: item.wins ?? 0,
            losses: item.losses ?? 0,
            draws: item.draws ?? 0,
          };
        });

        if (mode === 'global') {
          mapped.sort((a, b) => b.elo - a.elo || b.wins - a.wins);
        }

        const entries: LeaderboardEntry[] = mapped.map((item, idx) => ({
          rank: idx + 1,
          userId: item.userId,
          username: item.username,
          elo: item.elo,
          wins: item.wins,
          losses: item.losses,
          draws: item.draws,
        }));

        memoryCache.set(mode, { timestamp: now, data: entries });

        return NextResponse.json(entries, {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'X-Cache': 'MISS',
          },
        });
      }

      const realUsers = await prisma.users.findMany({
        where: { is_active: true },
        take: 20,
        orderBy: { xp_total: 'desc' },
        select: {
          id: true,
          username: true,
        },
      });

      if (realUsers && realUsers.length > 0) {
        const entries: LeaderboardEntry[] = realUsers.map((u, idx) => ({
          rank: idx + 1,
          userId: u.id,
          username: u.username || 'Explorer',
          elo: 1000,
          wins: 0,
          losses: 0,
          draws: 0,
        }));

        memoryCache.set(mode, { timestamp: now, data: entries });

        return NextResponse.json(entries, {
          headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
            'X-Cache': 'USERS',
          },
        });
      }
    } catch (err) {
      console.warn('[battle/leaderboard] DB query failed:', err);
    }
  }

  return NextResponse.json([], {
    headers: {
      'Cache-Control': 'no-store',
      'X-Cache': 'EMPTY',
    },
  });
}
