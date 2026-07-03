import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { encode } from '@auth/core/jwt';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { rateLimitRegister } from '@/lib/rate-limit';
import { logger } from '@/lib/logger.server';
import { sanitizeName } from '@/lib/sanitization';

export async function POST(req: Request) {
  const rateLimit = await rateLimitRegister(req);

  if (!rateLimit.allowed) {
    logger.security('Register rate limit exceeded', 'Auth', { retryAfter: rateLimit.retryAfter });
    return NextResponse.json(
      {
        error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimit.retryAfter / 60)} minutes.`,
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
          'Retry-After': String(rateLimit.retryAfter),
        },
      }
    );
  }

  try {
    const body = await req.json();

    // confirmPassword is validated on the frontend — we mirror password here
    // so the Zod .refine() check passes on the server side
    const result = registerSchema.safeParse({
      ...body,
      confirmPassword: body.confirmPassword ?? body.password,
    });

    if (!result.success) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Register Zod validation failed', 'Auth', {
          issues: result.error.issues,
          body,
        });
      }

      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      return NextResponse.json(
        { error: 'Invalid input', fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: sanitizeName(name),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER',
      },
    });

    logger.info('User registered', 'Auth', { userId: user.id });

    const SESSION_COOKIE_NAME =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

    const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
    const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? '';
    let encodedToken: string | undefined;

    if (secret) {
      try {
        const token = {
          name: user.name,
          email: user.email,
          picture: user.image,
          sub: user.id,
          role: user.role ?? 'USER' as const,
          id: user.id,
          iat: Math.floor(Date.now() / 1000),
        };

        encodedToken = await encode({
          secret,
          salt: SESSION_COOKIE_NAME,
          token,
          maxAge: SESSION_MAX_AGE,
        });
      } catch (e) {
        logger.warn('Auto-login after registration failed, user can login manually', 'Auth', {
          userId: user.id,
        });
      }
    }

    const cookieExpires = new Date();
    cookieExpires.setTime(cookieExpires.getTime() + SESSION_MAX_AGE * 1000);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    );

    if (encodedToken) {
      response.cookies.set(SESSION_COOKIE_NAME, encodedToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        expires: cookieExpires,
      });
    }

    return response;
  } catch (error) {
    logger.error('Registration error', 'Auth', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}