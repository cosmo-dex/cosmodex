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
const CACHE_TTL_MS = 60_000;

export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get('mode');
  const mode = modeParam === 'mcq' ? 'mcq' : modeParam === 'global' ? 'global' : 'code';
  const now = Date.now();

  const cached = memoryCache.get(mode);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'HIT',
      },
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stats = await prisma.battle_user_stats.findMany({
        where: {
          updated_at: { gte: today },
          users: {
            is_active: true,
            role: { notIn: ['bot', 'admin', 'super_admin', 'learning_admin', 'arena_admin'] },
            email: {
              notIn: ['cosmodex_admin@admin.com', 'learning_admin@admin.com', 'arena_admin@admin.com', 'admin@cosmodex.com', 'learning@cosmodex.com', 'arena@cosmodex.com'],
              not: {
                endsWith: '@cosmodex.ai',
              },
            },
            NOT: [
              { email: { startsWith: 'bot_' } },
              { username: { startsWith: 'bot_' } },
              { username: { startsWith: 'Bot_' } },
            ],
          },
        },
        orderBy: mode === 'mcq' 
          ? [{ mcq_elo_rating: 'desc' }, { wins: 'desc' }]
          : [{ elo_rating: 'desc' }, { mcq_elo_rating: 'desc' }, { wins: 'desc' }],
        take: 500,
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
        const filtered = stats.filter((item) => {
          const uname = item.users?.username?.toLowerCase() ?? '';
          return !uname.startsWith('bot_') && !uname.startsWith('bot-') && uname !== 'bot';
        });
        const mapped = filtered.map((item) => {
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
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'X-Cache': 'MISS',
          },
        });
      }
    } catch (err) {
      console.warn('[battle/leaderboard] DB query failed:', err);
    }
  }

  return NextResponse.json([], {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Cache': 'EMPTY',
    },
  });
}
