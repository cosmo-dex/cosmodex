import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

/**
 * GET /api/battle/leaderboard
 * Temporary dummy data.
 * Uncomment the Prisma code later when the database is ready.
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode') === 'mcq' ? 'mcq' : 'code';

  try {
    // Temporary mock data
    const stats = Array.from({ length: 20 }, (_, i) => ({
      user_id: `user-${i + 1}`,
      elo_rating: 2000 - i * 25,
      mcq_elo_rating: 2200 - i * 20,
      wins: 40 - i,
      losses: i,
      draws: i % 3,
      users: {
        username: `Player${i + 1}`,
      },
    }));

    const entries = stats.map((item, idx) => ({
      rank: idx + 1,
      userId: item.user_id,
      username: item.users?.username ?? 'Anonymous',
      elo: mode === 'mcq' ? item.mcq_elo_rating : item.elo_rating,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
    }));

    return NextResponse.json(entries);

    /*
    // Restore this when the database is ready

    const stats = await prisma.battle_user_stats.findMany({
      orderBy: {
        [mode === 'mcq' ? 'mcq_elo_rating' : 'elo_rating']: 'desc',
      },
      take: 20,
      include: {
        users: {
          select: {
            username: true,
          },
        },
      },
    });

    const entries = stats.map((item, idx) => ({
      rank: idx + 1,
      userId: item.user_id,
      username: item.users?.username ?? 'Anonymous',
      elo: mode === 'mcq' ? item.mcq_elo_rating : item.elo_rating,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
    }));

    return NextResponse.json(entries);
    */
  } catch (err) {
    console.error('[battle/leaderboard]', err);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}