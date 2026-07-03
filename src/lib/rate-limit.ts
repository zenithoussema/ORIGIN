import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger.server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

const ratelimits = new Map<string, Ratelimit>();

async function getRatelimit(name: string, windowSeconds: number, maxRequests: number): Promise<Ratelimit> {
  const key = `${name}:${windowSeconds}:${maxRequests}`;
  const existing = ratelimits.get(key);
  if (existing) return existing;

  const redis = await getRedis();
  if (!redis) {
    return createFallbackRatelimit(maxRequests, windowSeconds * 1000);
  }

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds}s`),
    analytics: true,
    prefix: `origin:ratelimit:${name}`,
  });

  ratelimits.set(key, rl);
  return rl;
}

function createFallbackRatelimit(maxRequests: number, windowMs: number): Ratelimit {
  const store = new Map<string, { count: number; resetAt: number }>();

  return {
    limit: async (key: string) => {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
      }

      if (entry.count >= maxRequests) {
        return { success: false, remaining: 0, reset: entry.resetAt };
      }

      entry.count++;
      return { success: true, remaining: maxRequests - entry.count, reset: entry.resetAt };
    },
  } as unknown as Ratelimit;
}

const LIMITS = {
  login: { windowSeconds: 900, maxRequests: 5 },
  register: { windowSeconds: 900, maxRequests: 3 },
  checkout: { windowSeconds: 300, maxRequests: 3 },
  payment: { windowSeconds: 300, maxRequests: 5 },
  broadcast: { windowSeconds: 300, maxRequests: 5 },
  password: { windowSeconds: 900, maxRequests: 3 },
  api: { windowSeconds: 60, maxRequests: 100 },
} as const;

function getLimitConfig(pathname: string): { name: string; windowSeconds: number; maxRequests: number } {
  if (pathname.includes('/login')) return { name: 'login', ...LIMITS.login };
  if (pathname.includes('/register')) return { name: 'register', ...LIMITS.register };
  if (pathname.includes('/checkout')) return { name: 'checkout', ...LIMITS.checkout };
  if (pathname.includes('/payment')) return { name: 'payment', ...LIMITS.payment };
  if (pathname.includes('/broadcast')) return { name: 'broadcast', ...LIMITS.broadcast };
  if (pathname.includes('/password')) return { name: 'password', ...LIMITS.password };
  return { name: 'api', ...LIMITS.api };
}

export async function rateLimit(
  request: Request,
  pathname: string
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const config = getLimitConfig(pathname);
  const ratelimit = await getRatelimit(config.name, config.windowSeconds, config.maxRequests);

  try {
    const { success, remaining, reset } = await ratelimit.limit(ip);

    return {
      allowed: success,
      remaining,
      resetAt: reset,
      retryAfter: success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    logger.warn('Rate limit check failed, allowing request', 'RateLimit', {
      error: (error as Error).message,
    });
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowSeconds * 1000,
      retryAfter: 0,
    };
  }
}

export async function rateLimitLogin(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, '/api/auth/login');
}

export async function rateLimitRegister(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, '/api/auth/register');
}

export async function rateLimitRequest(
  request: Request,
  endpoint: string,
  maxRequests: number = 5,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const windowSeconds = Math.ceil(windowMs / 1000);
  const ratelimit = await getRatelimit(endpoint, windowSeconds, maxRequests);

  try {
    const { success, remaining, reset } = await ratelimit.limit(`${endpoint}:${ip}`);

    return {
      allowed: success,
      remaining,
      resetAt: reset,
      retryAfter: success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    logger.warn('Rate limit check failed, allowing request', 'RateLimit', {
      error: (error as Error).message,
    });
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: Date.now() + windowMs,
      retryAfter: 0,
    };
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export function getClientIpFromRequest(request: Request): string {
  return getClientIp(request);
}

export function getLoginConfig() {
  return { maxAttempts: LIMITS.login.maxRequests, windowMs: LIMITS.login.windowSeconds * 1000 };
}

export function getRegisterConfig() {
  return { maxAttempts: LIMITS.register.maxRequests, windowMs: LIMITS.register.windowSeconds * 1000 };
}
