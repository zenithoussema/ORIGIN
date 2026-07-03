type RedisType = import('@upstash/redis').Redis;

let redisClient: RedisType | null = null;
let initialized = false;

async function getRedisClient(): Promise<RedisType | null> {
  if (initialized) return redisClient;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('UPSTASH_REDIS_REST_URL/TOKEN not set. Redis features disabled.');
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token });
    console.info('Redis client initialized');
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis client', error);
    return null;
  }
}

let redisPromise: Promise<RedisType | null> | null = null;

export function getRedis(): Promise<RedisType | null> {
  if (!redisPromise) {
    redisPromise = getRedisClient();
  }
  return redisPromise;
}

export async function redisHealthCheck(): Promise<{
  status: 'healthy' | 'unavailable';
  latency?: number;
  error?: string;
}> {
  const client = await getRedis();
  if (!client) {
    return { status: 'unavailable', error: 'Redis not configured' };
  }

  try {
    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;
    return { status: 'healthy', latency };
  } catch (error) {
    return {
      status: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
