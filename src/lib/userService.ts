/**
 * Optimized user service with caching and batch queries
 */

import prisma from '@/lib/prisma';
import { withCache, CacheKeys, CacheTTL, deleteCached } from '@/lib/cache';

// Type definitions
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  interests: string[] | null;
  xp_total: number | null;
  level: number | null;
  experience_level: string | null;
  created_at: Date | null;
}

export interface UserStats {
  arenaStats: {
    current_streak: number | null;
    total_xp: number | null;
    total_solved: number | null;
  } | null;
  battleStats: {
    wins: number;
    losses: number;
    draws: number;
    elo_rating: number;
    mcq_elo_rating: number;
  } | null;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string | null;
  earnedAt: string | null;
  badgeType: string | null;
  section: string | null;
}

export interface UserEnrollment {
  id: string;
  languageName: string;
  languageCode: string;
  iconUrl: string | null;
  currentModuleTitle: string | null;
  totalModules: number;
  completedModules: number;
}

// Optimized user profile fetcher with caching
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return withCache(
    CacheKeys.userProfile(userId),
    async () => {
      return await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar_url: true,
          interests: true,
          xp_total: true,
          level: true,
          experience_level: true,
          created_at: true,
        },
      });
    },
    CacheTTL.USER_PROFILE
  );
};

// Optimized user stats fetcher with caching
export const getUserStats = async (userId: string): Promise<UserStats> => {
  return withCache(
    CacheKeys.userStats(userId),
    async () => {
      const [arenaStats, battleStats] = await Promise.all([
        prisma.arena_stats.findUnique({
          where: { user_id: userId },
          select: { 
            current_streak: true, 
            total_xp: true, 
            total_solved: true 
          },
        }),
        prisma.battle_user_stats.findUnique({
          where: { user_id: userId },
          select: { 
            wins: true, 
            losses: true, 
            draws: true, 
            elo_rating: true, 
            mcq_elo_rating: true 
          },
        }),
      ]);

      return { arenaStats, battleStats };
    },
    CacheTTL.USER_STATS
  );
};

// Optimized user badges fetcher with caching
export const getUserBadges = async (userId: string, limit: number = 20): Promise<UserBadge[]> => {
  return withCache(
    CacheKeys.userBadges(userId),
    async () => {
      const userBadges = await prisma.user_badges.findMany({
        where: { user_id: userId },
        include: { 
          badges: { 
            select: { 
              name: true, 
              description: true,
              badge_type: true,
              section: true,
            } 
          } 
        },
        orderBy: { earned_at: 'desc' },
        take: limit,
      });

      return userBadges.map((ub) => ({
        id: ub.id,
        name: ub.badges.name,
        description: ub.badges.description ?? null,
        earnedAt: ub.earned_at?.toISOString() ?? null,
        badgeType: ub.badges.badge_type ?? null,
        section: ub.badges.section ?? null,
      }));
    },
    CacheTTL.USER_BADGES
  );
};

// Optimized user enrollments fetcher with caching
export const getUserEnrollments = async (userId: string, limit: number = 5): Promise<UserEnrollment[]> => {
  return withCache(
    CacheKeys.userEnrollments(userId),
    async () => {
      // Fetch enrollments
      const userEnrollments = await prisma.enrollments.findMany({
        where: { user_id: userId, is_active: true },
        include: {
          languages: { select: { id: true, name: true, code: true, icon_url: true } },
          modules: { select: { title: true } },
        },
        orderBy: { enrolled_at: 'desc' },
        take: limit,
      });

      if (userEnrollments.length === 0) {
        return [];
      }

      const languageIds = userEnrollments.map((e) => e.language_id);

      // Batch fetch module counts and completions
      const [languageModules, userModuleCompletions] = await Promise.all([
        prisma.modules.findMany({
          where: {
            language_id: { in: languageIds },
            is_published: true,
          },
          select: { language_id: true, id: true },
        }),
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

      // Process module data efficiently
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

      return userEnrollments.map((e) => ({
        id: e.id,
        languageName: e.languages.name,
        languageCode: e.languages.code,
        iconUrl: e.languages.icon_url ?? null,
        currentModuleTitle: e.modules?.title ?? null,
        totalModules: languageModuleCounts.get(e.language_id) ?? 0,
        completedModules: userCompletedByLanguage.get(e.language_id) ?? 0,
      }));
    },
    CacheTTL.USER_ENROLLMENTS
  );
};

// Combined function to fetch all user data efficiently
export const getUserDashboardData = async (userId: string) => {
  // Fetch all data in parallel
  const [profile, stats, badges, enrollments] = await Promise.all([
    getUserProfile(userId),
    getUserStats(userId),
    getUserBadges(userId, 10),
    getUserEnrollments(userId, 5),
  ]);

  return {
    profile,
    stats,
    badges,
    enrollments,
  };
};

// Combined function to fetch all profile page data efficiently  
export const getUserProfileData = async (userId: string) => {
  // Fetch all data in parallel
  const [profile, stats, badges] = await Promise.all([
    getUserProfile(userId),
    getUserStats(userId),
    getUserBadges(userId, 20),
  ]);

  return {
    profile,
    stats,
    badges,
  };
};

// Cache invalidation helpers
export const invalidateUserCache = (userId: string): void => {
  deleteCached(CacheKeys.userProfile(userId));
  deleteCached(CacheKeys.userStats(userId));
  deleteCached(CacheKeys.userBadges(userId));
  deleteCached(CacheKeys.userEnrollments(userId));
};

export const invalidateUserStats = (userId: string): void => {
  deleteCached(CacheKeys.userStats(userId));
};

export const invalidateUserBadges = (userId: string): void => {
  deleteCached(CacheKeys.userBadges(userId));
};