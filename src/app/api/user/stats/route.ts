import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const SESSION_COOKIE = 'cosmo_session';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string;
    try {
      const session = JSON.parse(sessionCookie.value);
      userId = session.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user ID in session' }, { status: 401 });
    }

    // Fetch all data in parallel
    const [arenaStats, user, battleStats, userBadges, recentProgress, enrollments, recentCodeMatches, recentMcqMatches] = await Promise.all([
      // Arena stats: streak, total XP, problems solved
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

      // User basic info
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          username: true,
          level: true,
          experience_level: true,
        },
      }),

      // Battle stats
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

      // User badges
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

      // Recent progress (completed lessons)
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

      // Enrollments with current language & module
      prisma.enrollments.findMany({
        where: { user_id: userId, is_active: true },
        include: {
          languages: { select: { id: true, name: true, code: true, icon_url: true } },
          modules: { select: { id: true, title: true, description: true } },
        },
        orderBy: { enrolled_at: 'desc' },
        take: 5,
      }),

      // Recent Code Battle matches
      prisma.battle_matches.findMany({
        where: { OR: [{ player1_id: userId }, { player2_id: userId }] },
        orderBy: { started_at: 'desc' },
        take: 5,
      }),

      // Recent MCQ Battle matches
      prisma.battle_mcq_matches.findMany({
        where: { OR: [{ player1_id: userId }, { player2_id: userId }] },
        orderBy: { started_at: 'desc' },
        take: 5,
      }),
    ]);

    // Build recent battle match history (max 2 items)
    const recentMatches = [...recentCodeMatches, ...recentMcqMatches]
      .sort((a, b) => new Date(b.started_at ?? 0).getTime() - new Date(a.started_at ?? 0).getTime())
      .slice(0, 2)
      .map((m) => {
        const isWin = m.winner_id === userId;
        const isDraw = !m.winner_id && m.status === 'COMPLETED';
        const eloChange = isWin ? '+25' : (isDraw ? '0' : '-15');
        const duration = m.ended_at && m.started_at ? Math.max(1, Math.round((new Date(m.ended_at).getTime() - new Date(m.started_at).getTime()) / 1000)) : 180;
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        return {
          id: m.id,
          isWin,
          isDraw,
          eloChange,
          time: `${mins}m${secs < 10 ? '0' : ''}${secs}s`,
        };
      });

    // Build activity feed from progress + badge events
    type ActivityItem = {
      id: string;
      type: 'lesson' | 'badge' | 'xp';
      label: string;
      timestamp: string;
      xp?: number;
    };
    const activities: ActivityItem[] = [];

    // Add recent progress items
    for (const p of recentProgress.slice(0, 5)) {
      activities.push({
        id: p.id,
        type: 'lesson',
        label: `Completed ${p.modules?.title ?? 'a lesson'} in ${p.modules?.languages?.name ?? 'a course'}`,
        timestamp: p.completed_at?.toISOString() ?? new Date().toISOString(),
        xp: p.xp_earned ?? 0,
      });
    }

    // Add badge earned events
    for (const ub of userBadges.slice(0, 3)) {
      activities.push({
        id: ub.id,
        type: 'badge',
        label: `Earned badge: ${ub.badges.name}`,
        timestamp: ub.earned_at?.toISOString() ?? new Date().toISOString(),
      });
    }

    // Sort by timestamp desc
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Dynamic fallback calculation for wins/losses/draws from actual match tables
    const allMatches = [...recentCodeMatches, ...recentMcqMatches];
    const calcWins = allMatches.filter((m) => m.winner_id === userId).length;
    const calcLosses = allMatches.filter((m) => m.winner_id && m.winner_id !== userId).length;
    const calcDraws = allMatches.filter((m) => !m.winner_id && m.status === 'COMPLETED').length;

    const wins = (battleStats?.wins && battleStats.wins > 0) ? battleStats.wins : calcWins;
    const losses = (battleStats?.losses && battleStats.losses > 0) ? battleStats.losses : calcLosses;
    const draws = (battleStats?.draws && battleStats.draws > 0) ? battleStats.draws : calcDraws;

    // Calculate real average match duration
    const completedDurations = allMatches
      .map((m) => (m.ended_at && m.started_at ? Math.max(1, Math.round((new Date(m.ended_at).getTime() - new Date(m.started_at).getTime()) / 1000)) : null))
      .filter((d): d is number => d !== null);

    const avgSecsTotal = completedDurations.length > 0
      ? Math.round(completedDurations.reduce((acc, curr) => acc + curr, 0) / completedDurations.length)
      : 255;

    const avgMins = Math.floor(avgSecsTotal / 60);
    const avgSecsRem = avgSecsTotal % 60;
    const avgTime = `${avgMins}m${avgSecsRem < 10 ? '0' : ''}${avgSecsRem}s`;

    return NextResponse.json({
      username: user?.username ?? '',
      level: user?.level ?? 1,
      experienceLevel: user?.experience_level ?? 'Beginner',
      elo: battleStats?.elo_rating ?? 1000,
      mcqElo: battleStats?.mcq_elo_rating ?? 1000,
      wins,
      losses,
      draws,
      avgTime,
      streak: arenaStats?.current_streak ?? 0,
      bestStreak: arenaStats?.best_streak ?? 0,
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
      enrollments: enrollments.map((e) => ({
        id: e.id,
        languageId: e.languages.id,
        languageName: e.languages.name,
        languageCode: e.languages.code,
        iconUrl: e.languages.icon_url,
        currentModuleTitle: e.modules?.title ?? null,
        enrolledAt: e.enrolled_at?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    console.error('[user/stats] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
