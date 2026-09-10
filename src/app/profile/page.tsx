import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import ProfileContent from './ProfileContent';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export const metadata: Metadata = {
  title: "Profile | CosmoDex",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const parsed = await verifySession(sessionCookie?.value);

  // Default fallback values
  let userId: string | null = null;
  let username = 'Explorer';
  let email = '';
  let createdAt: string | null = null;
  let interests: string[] = [];
  let xpTotal = 0;
  let level = 1;
  let experienceLevel = 'Beginner';
  let streak = 0;
  let badgeCount = 0;
  let badges: Array<{ id: string; name: string; description: string | null; earnedAt: string | null }> = [];

  let arenaWins = 0;
  let arenaLosses = 0;
  let arenaDraws = 0;
  let codeElo = 1000;
  let mcqElo = 1000;
  let avatarUrl = '/images/avatars/nebula.webp';

  if (parsed) {
    userId = parsed.userId || null;
    username = parsed.username || username;
    email = parsed.email || '';
    createdAt = parsed.createdAt || null;
    interests = parsed.interests || [];
    xpTotal = parsed.xpTotal ?? xpTotal;
    level = parsed.level ?? level;
    experienceLevel = parsed.experienceLevel || experienceLevel;
    avatarUrl = parsed.avatarId || avatarUrl;
  }

  // Fetch live data from DB
  if (userId) {
    try {
      const [dbUser, arenaStats, battleStats, userBadges] = await Promise.all([
        prisma.users.findUnique({
          where: { id: userId },
          select: {
            username: true,
            email: true,
            avatar_url: true,
            interests: true,
            xp_total: true,
            level: true,
            experience_level: true,
            created_at: true,
          },
        }),
        prisma.arena_stats.findUnique({
          where: { user_id: userId },
          select: { current_streak: true },
        }),
        prisma.battle_user_stats.findUnique({
          where: { user_id: userId },
          select: { wins: true, losses: true, draws: true, elo_rating: true, mcq_elo_rating: true },
        }),
        prisma.user_badges.findMany({
          where: { user_id: userId },
          include: { badges: { select: { name: true, description: true } } },
          orderBy: { earned_at: 'desc' },
          take: 20,
        }),
      ]);

      if (dbUser) {
        username = dbUser.username;
        email = dbUser.email;
        avatarUrl = dbUser.avatar_url || avatarUrl;
        interests = dbUser.interests ?? [];
        xpTotal = dbUser.xp_total ?? 0;
        level = dbUser.level ?? 1;
        experienceLevel = dbUser.experience_level || experienceLevel;
        createdAt = dbUser.created_at?.toISOString() ?? createdAt;
      }

      streak = arenaStats?.current_streak ?? 0;
      arenaWins = battleStats?.wins ?? 0;
      arenaLosses = battleStats?.losses ?? 0;
      arenaDraws = battleStats?.draws ?? 0;
      codeElo = battleStats?.elo_rating ?? 1000;
      mcqElo = battleStats?.mcq_elo_rating ?? 1000;
      badgeCount = userBadges.length;
      badges = userBadges.map((ub) => ({
        id: ub.id,
        name: ub.badges.name,
        description: ub.badges.description ?? null,
        earnedAt: ub.earned_at?.toISOString() ?? null,
      }));
    } catch (e) {
      console.error('[profile] Failed to fetch DB data:', e);
    }
  }

  return (
    <ProfileContent
      userId={userId}
      username={username}
      email={email}
      createdAt={createdAt}
      interests={interests}
      xpTotal={xpTotal}
      level={level}
      experienceLevel={experienceLevel}
      streak={streak}
      badgeCount={badgeCount}
      badges={badges}
      bio=""
      avatarUrl={avatarUrl}
      arenaWins={arenaWins}
      arenaLosses={arenaLosses}
      arenaDraws={arenaDraws}
      codeElo={codeElo}
      mcqElo={mcqElo}
    />
  );
}