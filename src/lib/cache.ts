import type { Redis as RedisType } from '@upstash/redis';

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 3600; // 1 hour
const MEMORY_CACHE_MAX_SIZE = 1000;

function getCacheKey(prefix: string, key: string): string {
  return `origin:${prefix}:${key}`;
}

function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data;
}

function setMemoryCache<T>(key: string, data: T, ttl: number): void {
  if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl * 1000,
  });
}

async function getRedisClient(): Promise<RedisType | null> {
  try {
    const { getRedis } = await import('@/lib/redis');
    return getRedis();
  } catch {
    return null;
  }
}

export async function cacheGet<T>(prefix: string, key: string): Promise<T | null> {
  const cacheKey = getCacheKey(prefix, key);

  const memResult = getFromMemoryCache<T>(cacheKey);
  if (memResult !== null) return memResult;

  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get<T>(cacheKey);
    if (data !== null) {
      setMemoryCache(cacheKey, data, 60);
    }
    return data;
  } catch (error) {
    console.warn('Cache GET failed', { key: cacheKey, error: (error as Error).message });
    return null;
  }
}

export async function cacheSet<T>(
  prefix: string,
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const cacheKey = getCacheKey(prefix, key);

  setMemoryCache(cacheKey, data, ttl);

  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.set(cacheKey, data, { ex: ttl });
  } catch (error) {
    console.warn('Cache SET failed', { key: cacheKey, error: (error as Error).message });
  }
}

export async function cacheDelete(prefix: string, key: string): Promise<void> {
  const cacheKey = getCacheKey(prefix, key);

  memoryCache.delete(cacheKey);

  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.del(cacheKey);
  } catch (error) {
    console.warn('Cache DELETE failed', { key: cacheKey, error: (error as Error).message });
  }
}

export async function cacheInvalidatePattern(prefix: string, pattern: string = '*'): Promise<void> {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`origin:${prefix}:`)) {
      memoryCache.delete(key);
    }
  }

  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const searchPattern = getCacheKey(prefix, pattern);
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: searchPattern, count: 100 });
      cursor = Number(result[0]);
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.warn('Cache INVALIDATE failed', { prefix, error: (error as Error).message });
  }
}

export async function cacheGetOrSet<T>(
  prefix: string,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheGet<T>(prefix, key);
  if (cached !== null) return cached;

  const data = await fetcher();
  await cacheSet(prefix, key, data, ttl);
  return data;
}

// Predefined cache prefixes
export const CachePrefix = {
  MENU: 'menu',
  USER: 'user',
  ORDER: 'order',
  SESSION: 'session',
  SEARCH: 'search',
  HEALTH: 'health',
} as const;

// Cache TTLs in seconds
export const CacheTTL = {
  MENU_LIST: 3600,        // 1 hour
  MENU_ITEM: 3600,        // 1 hour
  USER_SESSION: 900,      // 15 minutes
  USER_PROFILE: 600,      // 10 minutes
  ORDER_LIST: 300,        // 5 minutes
  ORDER_DETAIL: 60,       // 1 minute
  SEARCH_RESULTS: 300,    // 5 minutes
  HEALTH: 30,             // 30 seconds
} as const;
