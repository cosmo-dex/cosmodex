import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserDashboardData, getUserProfileData } from '@/lib/userService';
import { withCache, CacheKeys, CacheTTL } from '@/lib/cache';
import prisma from '@/lib/prisma';

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
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      });
    }

    // Use optimized cached service for basic data
    const dashboardData = await getUserDashboardData(userId);
    
    // Get detailed match data with caching (this was the N+1 problem)
    const matchData = await withCache(
      `user:match_stats:${userId}`,
      async () => {
        // Fetch recent matches efficiently
        const [recentCodeMatches, recentMcqMatches] = await Promise.all([
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

        // Batch fetch opponent stats (fixes N+1 query pattern)
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

        return {
          recentCodeMatches,
          recentMcqMatches,
          opponentStats: new Map(opponentStatsList.map((s) => [s.user_id, s])),
        };
      },
      30 // Cache for 30 seconds since battle data changes quickly
    );

    // Get recent activities with caching
    const activityData = await withCache(
      `user:activities:${userId}`,
      async () => {
        const [recentProgress, userBadges] = await Promise.all([
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
            take: 3,
          }),
        ]);

        return { recentProgress, userBadges };
      },
      60 // Cache activities for 1 minute
    );

    // Build mode statistics efficiently
    const buildModeStats = (
      matches: any[],
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
        const oppStat = matchData.opponentStats.get(oppId);
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

    const codeUserRating = dashboardData.stats?.battleStats?.elo_rating ?? 1000;
    const mcqUserRating = dashboardData.stats?.battleStats?.mcq_elo_rating ?? 1000;
    const codeStats = buildModeStats(matchData.recentCodeMatches, 'code', codeUserRating);
    const mcqStats = buildModeStats(matchData.recentMcqMatches, 'mcq', mcqUserRating);

    // Process activities efficiently
    type ActivityItem = {
      id: string;
      type: 'lesson' | 'badge' | 'xp';
      label: string;
      timestamp: string;
      xp?: number;
    };
    const activities: ActivityItem[] = [];

    for (const p of activityData.recentProgress.slice(0, 5)) {
      activities.push({
        id: p.id,
        type: 'lesson',
        label: `Completed ${p.modules?.title ?? 'a lesson'} in ${p.modules?.languages?.name ?? 'a course'}`,
        timestamp: p.completed_at?.toISOString() ?? new Date().toISOString(),
        xp: p.xp_earned ?? 0,
      });
    }

    for (const ub of activityData.userBadges) {
      activities.push({
        id: ub.id,
        type: 'badge',
        label: `Earned badge: ${ub.badges.name}`,
        timestamp: ub.earned_at?.toISOString() ?? new Date().toISOString(),
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      username: dashboardData.profile?.username ?? '',
      avatarUrl: dashboardData.profile?.avatar_url ?? null,
      level: dashboardData.profile?.level ?? 1,
      experienceLevel: dashboardData.profile?.experience_level ?? 'Beginner',
      elo: dashboardData.stats?.battleStats?.elo_rating ?? 1000,
      mcqElo: dashboardData.stats?.battleStats?.mcq_elo_rating ?? 1000,
      wins: dashboardData.stats?.battleStats?.wins ?? 0,
      losses: dashboardData.stats?.battleStats?.losses ?? 0,
      draws: dashboardData.stats?.battleStats?.draws ?? 0,
      streak: dashboardData.stats?.arenaStats?.current_streak ?? 0,
      bestStreak: dashboardData.stats?.arenaStats?.current_streak ?? 0,
      arenaXp: dashboardData.stats?.arenaStats?.total_xp ?? 0,
      totalSolved: dashboardData.stats?.arenaStats?.total_solved ?? 0,
      badgeCount: dashboardData.badges.length,
      badges: dashboardData.badges.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        type: badge.badgeType,
        section: badge.section,
        earnedAt: badge.earnedAt,
      })),
      activities: activities.slice(0, 8),
      recentMatches: [...codeStats.recentMatches, ...mcqStats.recentMatches].slice(0, 3),
      avgTime: "—", // Calculate this if needed
      codeStats,
      mcqStats,
      enrollments: dashboardData.enrollments.map((e) => ({
        id: e.id,
        languageId: e.languageCode, // Using code as fallback
        languageName: e.languageName,
        languageCode: e.languageCode,
        iconUrl: e.iconUrl,
        currentModuleTitle: e.currentModuleTitle,
        enrolledAt: null, // Not available in current service
      })),
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('[user/stats] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
