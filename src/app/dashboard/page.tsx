import { cookies } from 'next/headers';
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import GetStartedCard from "@/components/dashboard/GetStartedCard";
import CourseSuggestions from "@/components/dashboard/CourseSuggestions";
import Achievements from "@/components/dashboard/Achievements";
import ProfileCard from "@/components/dashboard/ProfileCard";
import Footer from "@/components/dashboard/Footer";
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getUserDashboardData } from '@/lib/userService';

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

  // Initialize default values
  let streak = 0;
  let codeElo = 1000;
  let badgeCount = 0;
  let badges: Array<{ id: string; name: string; description: string | null; earnedAt: string | null }> = [];
  let enrollments: Array<{
    id: string;
    languageName: string;
    languageCode: string;
    iconUrl: string | null;
    currentModuleTitle: string | null;
    totalModules: number;
    completedModules: number;
  }> = [];

  // Fetch optimized data from cache-enabled service
  if (userId) {
    try {
      const userData = await getUserDashboardData(userId);
      
      if (userData.profile) {
        if (userData.profile.avatar_url) avatarId = userData.profile.avatar_url;
        if (userData.profile.username) username = userData.profile.username;
        if (userData.profile.level) level = userData.profile.level;
        if (userData.profile.xp_total !== null && userData.profile.xp_total !== undefined) xpTotal = userData.profile.xp_total;
        if (userData.profile.experience_level) experienceLevel = userData.profile.experience_level;
      }

      if (userData.stats) {
        streak = userData.stats.arenaStats?.current_streak ?? 0;
        codeElo = userData.stats.battleStats?.elo_rating ?? 1000;
      }

      badgeCount = userData.badges.length;
      badges = userData.badges.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        earnedAt: badge.earnedAt,
      }));

      enrollments = userData.enrollments;
    } catch (e) {
      console.error('[dashboard] Failed to fetch optimized user data:', e);
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
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
