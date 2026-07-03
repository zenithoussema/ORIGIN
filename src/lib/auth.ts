import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_EMAIL_LENGTH = 320;
const MAX_PASSWORD_LENGTH = 128;

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS_STORE_SIZE = 10000;

function getFailedAttempts(email: string): { count: number; lockedUntil: number } {
  const record = failedAttempts.get(email);
  if (!record) return { count: 0, lockedUntil: 0 };

  if (Date.now() > record.lockedUntil) {
    failedAttempts.delete(email);
    return { count: 0, lockedUntil: 0 };
  }

  return record;
}

function recordFailedAttempt(email: string): { locked: boolean; remainingTime: number } {
  const record = getFailedAttempts(email);
  const newCount = record.count + 1;

  if (failedAttempts.size > MAX_FAILED_ATTEMPTS_STORE_SIZE) {
    const oldestKeys = Array.from(failedAttempts.keys()).slice(0, 1000);
    for (const key of oldestKeys) {
      failedAttempts.delete(key);
    }
  }

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    failedAttempts.set(email, { count: newCount, lockedUntil });
    logger.security('Account locked due to failed attempts', 'Auth', { email, attempts: newCount });
    return { locked: true, remainingTime: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  failedAttempts.set(email, { count: newCount, lockedUntil: 0 });
  return { locked: false, remainingTime: 0 };
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^\w@.\-+]/g, '');
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.security('Login attempt with missing credentials', 'Auth');
          return null;
        }

        const rawEmail = credentials.email as string;
        const password = credentials.password as string;

        if (rawEmail.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
          logger.security('Login attempt with oversized input', 'Auth', { emailLength: rawEmail.length });
          return null;
        }

        const email = sanitizeEmail(rawEmail);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return null;
        }

        const lockout = getFailedAttempts(email);
        if (lockout.lockedUntil > Date.now()) {
          const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000);
          logger.security('Login attempt during lockout', 'Auth', { email, remainingSeconds: remaining });
          return null;
        }

        const user = await prisma?.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          recordFailedAttempt(email);
          return null;
        }

        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } catch {
          logger.error('bcrypt compare failed', 'Auth', undefined, { email });
          return null;
        }

        if (!isPasswordValid) {
          const result = recordFailedAttempt(email);
          if (result.locked) {
            logger.security('Account locked after max failed attempts', 'Auth', { email });
          }
          return null;
        }

        clearFailedAttempts(email);
        logger.info('Successful login', 'Auth', { userId: user.id, email });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER';
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
      }

      if (trigger === 'update') {
        token.iat = Math.floor(Date.now() / 1000);
      }

      if (!token.role) {
        token.role = 'USER';
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? 'USER';
        session.user.id = (token.id as string) ?? '';
      }
      return session;
    },
    async authorized({ auth: authResult, request }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith('/admin')) {
        const isAuthed = !!authResult?.user;
        const isAdmin = authResult?.user?.role === 'ADMIN';
        if (!isAuthed) {
          logger.security('Unauthenticated access to admin', 'Auth', { pathname });
        } else if (!isAdmin) {
          logger.security('Non-admin access to admin', 'Auth', { userId: authResult.user.id, pathname });
        }
        return isAuthed && isAdmin;
      }

      if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
        return !!authResult?.user;
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

setInterval(() => {
  const now = Date.now();
  for (const [email, record] of failedAttempts.entries()) {
    if (now > record.lockedUntil && record.lockedUntil > 0) {
      failedAttempts.delete(email);
    }
  }
}, 60_000);
