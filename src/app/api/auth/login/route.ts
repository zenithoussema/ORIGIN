import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { encode } from '@auth/core/jwt';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import { rateLimitLogin } from '@/lib/rate-limit';
import { logger } from '@/lib/logger.server';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS_STORE_SIZE = 10000;

function getFailedAttempts(email: string): { count: number; lockedUntil: number } {
  const record = failedAttempts.get(sanitizeEmail(email));
  if (!record) return { count: 0, lockedUntil: 0 };
  if (Date.now() > record.lockedUntil) {
    failedAttempts.delete(sanitizeEmail(email));
    return { count: 0, lockedUntil: 0 };
  }
  return record;
}

function recordFailedAttempt(email: string): { locked: boolean; remainingTime: number } {
  const key = sanitizeEmail(email);
  const record = getFailedAttempts(key);
  const newCount = record.count + 1;

  if (failedAttempts.size > MAX_FAILED_ATTEMPTS_STORE_SIZE) {
    const oldestKeys = Array.from(failedAttempts.keys()).slice(0, 1000);
    for (const k of oldestKeys) failedAttempts.delete(k);
  }

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    failedAttempts.set(key, { count: newCount, lockedUntil });
    logger.security('Account locked due to failed attempts', 'Auth', { email: key, attempts: newCount });
    return { locked: true, remainingTime: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  failedAttempts.set(key, { count: newCount, lockedUntil: 0 });
  return { locked: false, remainingTime: 0 };
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(sanitizeEmail(email));
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^\w@.\-+]/g, '');
}

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? '';
}

function rateLimitHeaders(rl: { remaining: number; resetAt: number }): Record<string, string> {
  return {
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
  };
}

export async function POST(req: Request) {
  const rateLimit = await rateLimitLogin(req);

  if (!rateLimit.allowed) {
    logger.security('Login rate limit exceeded', 'Auth', { retryAfter: rateLimit.retryAfter });
    return NextResponse.json(
      {
        error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter / 60)} minutes.`,
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
          'Retry-After': String(rateLimit.retryAfter),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const sanitizedEmail = sanitizeEmail(email);

    if (sanitizedEmail.length > 320 || password.length > 128) {
      logger.security('Login attempt with oversized input', 'Auth', { emailLength: sanitizedEmail.length });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const lockout = getFailedAttempts(sanitizedEmail);
    if (lockout.lockedUntil > Date.now()) {
      const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000);
      logger.security('Login attempt during lockout', 'Auth', { email: sanitizedEmail, remainingSeconds: remaining });
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429, headers: { ...rateLimitHeaders(rateLimit), 'Retry-After': String(remaining) } }
      );
    }

    if (!prisma) {
      logger.error('Database unavailable for login', 'Auth');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user || !user.password) {
      recordFailedAttempt(sanitizedEmail);
      logger.security('Failed login attempt - user not found', 'Auth', { email: sanitizedEmail });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: rateLimitHeaders(rateLimit) }
      );
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      logger.error('bcrypt compare failed', 'Auth', e);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      const result = recordFailedAttempt(sanitizedEmail);
      if (result.locked) {
        logger.security('Account locked after max failed attempts', 'Auth', { email: sanitizedEmail });
      }
      logger.security('Failed login attempt - invalid password', 'Auth', { email: sanitizedEmail });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: rateLimitHeaders(rateLimit) }
      );
    }

    clearFailedAttempts(sanitizedEmail);

    const secret = getSecret();
    if (!secret) {
      logger.error('AUTH_SECRET not configured', 'Auth');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      role: user.role ?? 'USER' as const,
      id: user.id,
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedToken = await encode({
      secret,
      salt: SESSION_COOKIE_NAME,
      token,
      maxAge: SESSION_MAX_AGE,
    });

    const cookieExpires = new Date();
    cookieExpires.setTime(cookieExpires.getTime() + SESSION_MAX_AGE * 1000);

    logger.info('Login successful', 'Auth', { email: sanitizedEmail });

    const response = NextResponse.json(
      { success: true },
      { headers: rateLimitHeaders(rateLimit) }
    );

    response.cookies.set(SESSION_COOKIE_NAME, encodedToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      expires: cookieExpires,
    });

    return response;
  } catch (error) {
    logger.error('Login error', 'Auth', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
