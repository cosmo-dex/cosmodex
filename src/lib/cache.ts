/**
 * In-memory caching layer for optimizing database queries
 * This provides a simple TTL-based cache to reduce database load
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) { // Cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const ttl = ttlSeconds * 1000; // Convert to milliseconds
    const timestamp = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp,
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    const expired = (now - item.timestamp) > item.ttl;
    
    if (expired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      const expired = (now - item.timestamp) > item.ttl;
      if (expired) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
const cache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userStats: (userId: string) => `user:stats:${userId}`,
  userBadges: (userId: string) => `user:badges:${userId}`,
  userEnrollments: (userId: string) => `user:enrollments:${userId}`,
  battleStats: (userId: string) => `battle:stats:${userId}`,
  arenaStats: (userId: string) => `arena:stats:${userId}`,
} as const;

// Cache TTL constants (in seconds)
export const CacheTTL = {
  USER_PROFILE: 300,        // 5 minutes - profile data changes infrequently
  USER_STATS: 60,           // 1 minute - stats can change during gameplay
  USER_BADGES: 180,         // 3 minutes - badges don't change often
  USER_ENROLLMENTS: 900,    // 15 minutes - enrollments are relatively static
  BATTLE_STATS: 30,         // 30 seconds - battle stats can change quickly
  ARENA_STATS: 30,          // 30 seconds - arena stats can change quickly
} as const;

export default cache;

// Helper functions for common cache operations
export const getCached = <T>(key: string): T | null => cache.get<T>(key);

export const setCached = <T>(key: string, data: T, ttlSeconds: number): void => {
  cache.set(key, data, ttlSeconds);
};

export const deleteCached = (key: string): boolean => cache.delete(key);

export const clearCache = (): void => cache.clear();

export const getCacheStats = () => cache.getStats();

// Helper to wrap database queries with caching
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> => {
  // Try to get from cache first
  const cached = getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch from database
  const data = await fetcher();
  
  // Store in cache for future requests
  setCached(key, data, ttlSeconds);
  
  return data;
};