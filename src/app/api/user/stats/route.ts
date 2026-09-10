import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    if (session?.userId) {
      userId = session.userId;
    }

    if (!userId) {
      const nextAuthSession = await getServerSession(authOptions);
      if (nextAuthSession?.user?.email) {
        const dbUser = await prisma.users.findUnique({
          where: { email: nextAuthSession.user.email.trim().toLowerCase() },
          select: { id: true },
        });
        if (dbUser?.id) {
          userId = dbUser.id;
        }
      }
    }

    if (!process.env.DATABASE_URL || !userId) {
      const defaultModeStats = {
        elo: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
        avgTime: "—",
        recentMatches: [],
      };
      return NextResponse.json({
        username: 'Explorer',
        level: 1,
        experienceLevel: 'Initiate',
        elo: 1000,
        mcqElo: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
        bestStreak: 0,
        arenaXp: 0,
        totalSolved: 0,
        badgeCount: 0,
        badges: [],
        activities: [],
        enrollments: [],
        recentMatches: [],
        avgTime: "—",
        codeStats: defaultModeStats,
        mcqStats: defaultModeStats,
      }, {
        status: userId ? 200 : 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    const [arenaStats, user, battleStats, userBadges, recentProgress, enrollments, recentCodeMatches, recentMcqMatches] = await Promise.all([
      prisma.arena_stats.findUnique({
        where: { user_id: userId },
        select: {
          current_streak: true,
          best_streak: true,
          total_xp: true,
          total_solved: true,
          last_played_at: true,
        },
      }),

      prisma.users.findUnique({
        where: { id: userId },
        select: {
          username: true,
          level: true,
          experience_level: true,
          avatar_url: true,
        },
      }),

      prisma.battle_user_stats.findUnique({
        where: { user_id: userId },
        select: {
          elo_rating: true,
          mcq_elo_rating: true,
          wins: true,
          losses: true,
          draws: true,
        },
      }),

      prisma.user_badges.findMany({
        where: { user_id: userId },
        include: {
          badges: {
            select: {
              name: true,
              description: true,
              badge_type: true,
              section: true,
            },
          },
        },
        orderBy: { earned_at: 'desc' },
        take: 10,
      }),

      prisma.progress.findMany({
        where: { user_id: userId, is_correct: true },
        include: {
          modules: {
            select: {
              title: true,
              languages: { select: { name: true } },
            },
          },
        },
        orderBy: { completed_at: 'desc' },
        take: 10,
      }),

      prisma.enrollments.findMany({
        where: { user_id: userId, is_active: true },
        include: {
          languages: { select: { id: true, name: true, code: true, icon_url: true } },
          modules: { select: { id: true, title: true, description: true } },
        },
        orderBy: { enrolled_at: 'desc' },
        take: 5,
      }),

      prisma.battle_matches.findMany({
        where: {
          OR: [{ player1_id: userId }, { player2_id: userId }],
          status: 'COMPLETED',
        },
        orderBy: { started_at: 'desc' },
        take: 30,
      }),

      prisma.battle_mcq_matches.findMany({
        where: {
          OR: [{ player1_id: userId }, { player2_id: userId }],
          status: 'COMPLETED',
        },
        orderBy: { started_at: 'desc' },
        take: 30,
      }),
    ]);

    const allMatches = [...recentCodeMatches, ...recentMcqMatches];
    const opponentIds = Array.from(
      new Set(
        allMatches.map((m) => (m.player1_id === userId ? m.player2_id : m.player1_id))
      )
    );

    const opponentStatsList = opponentIds.length > 0
      ? await prisma.battle_user_stats.findMany({
          where: { user_id: { in: opponentIds } },
          select: { user_id: true, elo_rating: true, mcq_elo_rating: true },
        })
      : [];

    const oppStatsMap = new Map(opponentStatsList.map((s) => [s.user_id, s]));

    const buildModeStats = (
      matches: typeof recentCodeMatches,
      modeType: 'code' | 'mcq',
      userRating: number
    ) => {
      const sorted = [...matches].sort(
        (a, b) =>
          new Date(b.ended_at ?? b.started_at ?? 0).getTime() -
          new Date(a.ended_at ?? a.started_at ?? 0).getTime()
      );

      let streak = 0;
      for (const m of sorted) {
        if (m.winner_id === userId) {
          streak++;
        } else {
          break;
        }
      }

      const wins = sorted.filter((m) => m.winner_id === userId).length;
      const losses = sorted.filter((m) => m.winner_id && m.winner_id !== userId).length;
      const draws = sorted.filter((m) => !m.winner_id).length;

      const validDurations = sorted
        .filter((m) => m.ended_at && m.started_at)
        .map((m) =>
          Math.max(
            1,
            Math.round(
              (new Date(m.ended_at!).getTime() - new Date(m.started_at!).getTime()) / 1000
            )
          )
        );

      let avgTime = "—";
      if (validDurations.length > 0) {
        const avgSecsTotal = Math.round(
          validDurations.reduce((acc, curr) => acc + curr, 0) / validDurations.length
        );
        const avgMins = Math.floor(avgSecsTotal / 60);
        const avgSecsRem = avgSecsTotal % 60;
        avgTime = `${avgMins}m${avgSecsRem < 10 ? '0' : ''}${avgSecsRem}s`;
      }

      const recent = sorted.slice(0, 3).map((m) => {
        const isWin = m.winner_id === userId;
        const isDraw = !m.winner_id;
        const oppId = m.player1_id === userId ? m.player2_id : m.player1_id;
        const oppStat = oppStatsMap.get(oppId);
        const oppRating =
          modeType === 'code'
            ? (oppStat?.elo_rating ?? 1000)
            : (oppStat?.mcq_elo_rating ?? 1000);

        const matchWithDelta = m as { player1_elo_delta?: number | null; player2_elo_delta?: number | null };
        const rawDelta = m.player1_id === userId ? matchWithDelta.player1_elo_delta : matchWithDelta.player2_elo_delta;
        let delta: number;
        if (typeof rawDelta === 'number' && rawDelta !== 0) {
          delta = rawDelta;
        } else {
          const preMatchUserRating = isWin ? userRating - 16 : (!isDraw ? userRating + 16 : userRating);
          const preMatchOppRating = isWin ? oppRating + 16 : (!isDraw ? oppRating - 16 : oppRating);
          const exp = 1 / (1 + Math.pow(10, (preMatchOppRating - preMatchUserRating) / 400));
          const actual = isWin ? 1 : (isDraw ? 0.5 : 0);
          delta = Math.round(32 * (actual - exp));
          if (isWin && delta <= 0) delta = 16;
          if (!isWin && !isDraw && delta >= 0) delta = -16;
        }
        const eloChange = delta > 0 ? `+${delta}` : `${delta}`;

        const duration =
          m.ended_at && m.started_at
            ? Math.max(
                1,
                Math.round(
                  (new Date(m.ended_at).getTime() - new Date(m.started_at).getTime()) / 1000
                )
              )
            : 0;
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;

        return {
          id: m.id,
          isWin,
          isDraw,
          eloChange,
          time: duration > 0 ? `${mins}m${secs < 10 ? '0' : ''}${secs}s` : '—',
        };
      });

      return {
        elo: userRating,
        wins,
        losses,
        draws,
        streak,
        avgTime,
        recentMatches: recent,
      };
    };

    const codeUserRating = battleStats?.elo_rating ?? 1000;
    const mcqUserRating = battleStats?.mcq_elo_rating ?? 1000;
    const codeStats = buildModeStats(recentCodeMatches, 'code', codeUserRating);
    const mcqStats = buildModeStats(recentMcqMatches, 'mcq', mcqUserRating);

    const allCompletedMatches = [
      ...recentCodeMatches.map((m) => ({ ...m, battleType: 'code' as const })),
      ...recentMcqMatches.map((m) => ({ ...m, battleType: 'mcq' as const })),
    ].sort(
      (a, b) =>
        new Date(b.ended_at ?? b.started_at ?? 0).getTime() -
        new Date(a.ended_at ?? a.started_at ?? 0).getTime()
    );

    let overallStreak = 0;
    for (const m of allCompletedMatches) {
      if (m.winner_id === userId) {
        overallStreak++;
      } else {
        break;
      }
    }

    const wins = battleStats?.wins ?? (codeStats.wins + mcqStats.wins);
    const losses = battleStats?.losses ?? (codeStats.losses + mcqStats.losses);
    const draws = battleStats?.draws ?? (codeStats.draws + mcqStats.draws);

    const allValidDurations = allCompletedMatches
      .filter((m) => m.ended_at && m.started_at)
      .map((m) =>
        Math.max(
          1,
          Math.round(
            (new Date(m.ended_at!).getTime() - new Date(m.started_at!).getTime()) / 1000
          )
        )
      );

    let avgTime = "—";
    if (allValidDurations.length > 0) {
      const avgSecsTotal = Math.round(
        allValidDurations.reduce((acc, curr) => acc + curr, 0) / allValidDurations.length
      );
      const avgMins = Math.floor(avgSecsTotal / 60);
      const avgSecsRem = avgSecsTotal % 60;
      avgTime = `${avgMins}m${avgSecsRem < 10 ? '0' : ''}${avgSecsRem}s`;
    }

    type ActivityItem = {
      id: string;
      type: 'lesson' | 'badge' | 'xp';
      label: string;
      timestamp: string;
      xp?: number;
    };
    const activities: ActivityItem[] = [];

    for (const p of recentProgress.slice(0, 5)) {
      activities.push({
        id: p.id,
        type: 'lesson',
        label: `Completed ${p.modules?.title ?? 'a lesson'} in ${p.modules?.languages?.name ?? 'a course'}`,
        timestamp: p.completed_at?.toISOString() ?? new Date().toISOString(),
        xp: p.xp_earned ?? 0,
      });
    }

    for (const ub of userBadges.slice(0, 3)) {
      activities.push({
        id: ub.id,
        type: 'badge',
        label: `Earned badge: ${ub.badges.name}`,
        timestamp: ub.earned_at?.toISOString() ?? new Date().toISOString(),
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const recentMatches = [
      ...codeStats.recentMatches,
      ...mcqStats.recentMatches,
    ].slice(0, 3);

    return NextResponse.json({
      username: user?.username ?? '',
      avatarUrl: user?.avatar_url ?? null,
      level: user?.level ?? 1,
      experienceLevel: user?.experience_level ?? 'Beginner',
      elo: battleStats?.elo_rating ?? 1000,
      mcqElo: battleStats?.mcq_elo_rating ?? 1000,
      wins,
      losses,
      draws,
      avgTime,
      streak: overallStreak,
      bestStreak: Math.max(overallStreak, arenaStats?.best_streak ?? 0),
      arenaXp: arenaStats?.total_xp ?? 0,
      totalSolved: arenaStats?.total_solved ?? 0,
      badgeCount: userBadges.length,
      badges: userBadges.map((ub) => ({
        id: ub.id,
        name: ub.badges.name,
        description: ub.badges.description,
        type: ub.badges.badge_type,
        section: ub.badges.section,
        earnedAt: ub.earned_at?.toISOString() ?? null,
      })),
      activities: activities.slice(0, 8),
      recentMatches,
      codeStats,
      mcqStats,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        languageId: e.languages.id,
        languageName: e.languages.name,
        languageCode: e.languages.code,
        iconUrl: e.languages.icon_url,
        currentModuleTitle: e.modules?.title ?? null,
        enrolledAt: e.enrolled_at?.toISOString() ?? null,
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[user/stats] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
