import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ProfileContent from './ProfileContent';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getUserProfileData } from '@/lib/userService';

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

  // Fetch optimized data from cache-enabled service
  if (userId) {
    try {
      const userData = await getUserProfileData(userId);
      
      if (userData.profile) {
        username = userData.profile.username;
        email = userData.profile.email;
        avatarUrl = userData.profile.avatar_url || avatarUrl;
        interests = userData.profile.interests ?? [];
        xpTotal = userData.profile.xp_total ?? 0;
        level = userData.profile.level ?? 1;
        experienceLevel = userData.profile.experience_level || experienceLevel;
        createdAt = userData.profile.created_at?.toISOString() ?? createdAt;
      }

      if (userData.stats) {
        streak = userData.stats.arenaStats?.current_streak ?? 0;
        arenaWins = userData.stats.battleStats?.wins ?? 0;
        arenaLosses = userData.stats.battleStats?.losses ?? 0;
        arenaDraws = userData.stats.battleStats?.draws ?? 0;
        codeElo = userData.stats.battleStats?.elo_rating ?? 1000;
        mcqElo = userData.stats.battleStats?.mcq_elo_rating ?? 1000;
      }

      badgeCount = userData.badges.length;
      badges = userData.badges.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        earnedAt: badge.earnedAt,
      }));
    } catch (e) {
      console.error('[profile] Failed to fetch optimized data:', e);
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