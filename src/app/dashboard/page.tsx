import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import GetStartedCard from "@/components/dashboard/GetStartedCard";
import CourseSuggestions from "@/components/dashboard/CourseSuggestions";
import Achievements from "@/components/dashboard/Achievements";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import CrewPromoCard from "@/components/dashboard/CrewPromoCard";
import Footer from "@/components/dashboard/Footer";
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const user = await verifySession(sessionCookie?.value);

  let username = 'Explorer';
  let level = 1;
  let xpTotal = 0;
  let avatarId: string | null = null;
  let experienceLevel: string | null = 'Beginner';
  let userId: string | null = null;

  if (user) {
    username = user.username || username;
    level = user.level ?? level;
    xpTotal = user.xpTotal ?? xpTotal;
    avatarId = user.avatarId || null;
    experienceLevel = user.experienceLevel || experienceLevel;
    userId = user.userId || null;
  }

  // Fetch dynamic data server-side in parallel
  let streak = 0;
  let codeElo = 1000;
  let badgeCount = 0;
  let badges: Array<{ id: string; name: string; description: string | null; earnedAt: string | null }> = [];
  let activities: Array<{ id: string; type: string; label: string; timestamp: string; xp?: number }> = [];
  let enrollments: Array<{
    id: string;
    languageName: string;
    languageCode: string;
    iconUrl: string | null;
    currentModuleTitle: string | null;
    totalModules: number;
    completedModules: number;
  }> = [];

  if (userId) {
    try {
      // First fetch enrollments to get language IDs
      const userEnrollments = await prisma.enrollments.findMany({
        where: { user_id: userId, is_active: true },
        include: {
          languages: { select: { id: true, name: true, code: true, icon_url: true } },
          modules: { select: { title: true } },
        },
        orderBy: { enrolled_at: 'desc' },
        take: 5,
      });

      const languageIds = userEnrollments.map((e) => e.language_id);

      // Then fetch other data in parallel
      const [dbUser, arenaStats, battleStats, userBadges, recentProgress, languageModules, userModuleCompletions] = await Promise.all([
        prisma.users.findUnique({
          where: { id: userId },
          select: { avatar_url: true, username: true, experience_level: true, level: true, xp_total: true },
        }),
        prisma.arena_stats.findUnique({
          where: { user_id: userId },
          select: { current_streak: true, total_xp: true, total_solved: true },
        }),
        prisma.battle_user_stats.findUnique({
          where: { user_id: userId },
          select: { elo_rating: true },
        }),
        prisma.user_badges.findMany({
          where: { user_id: userId },
          include: {
            badges: { select: { name: true, description: true, badge_type: true } },
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
          take: 8,
        }),
        // Fetch total modules per language for enrolled languages
        prisma.modules.findMany({
          where: {
            language_id: { in: languageIds },
            is_published: true,
          },
          select: { language_id: true, id: true },
        }),
        // Fetch user's completed modules for enrolled languages
        prisma.module_completions.findMany({
          where: {
            user_id: userId,
            modules: {
              language_id: { in: languageIds },
            },
          },
          select: { module_id: true, modules: { select: { language_id: true } } },
        }),
      ]);

      if (dbUser) {
        if (dbUser.avatar_url) avatarId = dbUser.avatar_url;
        if (dbUser.username) username = dbUser.username;
        if (dbUser.level) level = dbUser.level;
        if (dbUser.xp_total !== null && dbUser.xp_total !== undefined) xpTotal = dbUser.xp_total;
        if (dbUser.experience_level) experienceLevel = dbUser.experience_level;
      }

      streak = arenaStats?.current_streak ?? 0;
      codeElo = battleStats?.elo_rating ?? 1000;
      badgeCount = userBadges.length;

      badges = userBadges.map((ub) => ({
        id: ub.id,
        name: ub.badges.name,
        description: ub.badges.description ?? null,
        earnedAt: ub.earned_at?.toISOString() ?? null,
      }));

      // Build activity feed
      const activityList: typeof activities = [];
      for (const p of recentProgress.slice(0, 5)) {
        activityList.push({
          id: p.id,
          type: 'lesson',
          label: `Completed ${p.modules?.title ?? 'a lesson'} in ${p.modules?.languages?.name ?? 'a course'}`,
          timestamp: p.completed_at?.toISOString() ?? new Date().toISOString(),
          xp: p.xp_earned ?? 0,
        });
      }
      for (const ub of userBadges.slice(0, 3)) {
        activityList.push({
          id: ub.id,
          type: 'badge',
          label: `Earned badge: ${ub.badges.name}`,
          timestamp: ub.earned_at?.toISOString() ?? new Date().toISOString(),
        });
      }
      activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      activities = activityList.slice(0, 8);

      // Process module data
      const languageModuleCounts = new Map<string, number>();
      for (const m of languageModules) {
        languageModuleCounts.set(m.language_id, (languageModuleCounts.get(m.language_id) ?? 0) + 1);
      }

      const userCompletedByLanguage = new Map<string, number>();
      for (const mc of userModuleCompletions) {
        const langId = mc.modules?.language_id;
        if (langId) {
          userCompletedByLanguage.set(langId, (userCompletedByLanguage.get(langId) ?? 0) + 1);
        }
      }

      enrollments = userEnrollments.map((e) => ({
        id: e.id,
        languageName: e.languages.name,
        languageCode: e.languages.code,
        iconUrl: e.languages.icon_url ?? null,
        currentModuleTitle: e.modules?.title ?? null,
        totalModules: languageModuleCounts.get(e.language_id) ?? 0,
        completedModules: userCompletedByLanguage.get(e.language_id) ?? 0,
      }));
    } catch (e) {
      console.error('[dashboard] Failed to fetch user stats:', e);
    }
  }

  return (
    <div className="min-h-screen bg-[#080312] flex flex-col relative overflow-x-hidden">
      <DashboardBackground />

      <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-8 pt-24 relative flex-1 z-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <WelcomeBanner username={username} />
            <GetStartedCard enrollments={enrollments} />
            <CourseSuggestions />
            <Achievements badges={badges} />
            
            {/* Subscription Promo inside left column to avoid empty space */}
            <CrewPromoCard />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <ProfileCard 
              username={username}
              level={level}
              xpTotal={xpTotal}
              avatarId={avatarId}
              experienceLevel={experienceLevel}
              streak={streak}
              badgeCount={badgeCount}
              codeElo={codeElo}
            />
            <ActivityFeed activities={activities} />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
