import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger.server';
import type { Session } from 'next-auth';

export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    logger.error('Failed to get session', 'ServerAuth', error);
    return null;
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session || !session.user) {
    logger.security('Unauthorized access attempt', 'ServerAuth');
    redirect('/login');
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || !session.user) {
    logger.security('Unauthenticated admin access attempt', 'ServerAuth');
    redirect('/login');
  }
  if (session.user.role !== 'ADMIN') {
    logger.security('Non-admin access attempt to admin resource', 'ServerAuth', {
      userId: session.user.id,
      role: session.user.role,
    });
    redirect('/');
  }
  return session;
}

export async function requireRole(role: 'USER' | 'ADMIN' | 'GUEST'): Promise<Session> {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login');
  }
  if (role === 'ADMIN' && session.user.role !== 'ADMIN') {
    redirect('/');
  }
  return session;
}

export async function getServerUser() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role as 'USER' | 'ADMIN' | 'GUEST',
  };
}

export async function assertApiAuth(request: Request): Promise<
  | { authorized: true; session: Session }
  | { authorized: false; response: Response }
> {
  const session = await getSession();

  if (!session || !session.user) {
    logger.security('Unauthenticated API access', 'ServerAuth', {
      path: new URL(request.url).pathname,
    });
    return {
      authorized: false,
      response: Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true, session };
}

export async function assertAdminApi(request: Request): Promise<
  | { authorized: true; session: Session }
  | { authorized: false; response: Response }
> {
  const session = await getSession();

  if (!session || !session.user) {
    logger.security('Unauthenticated admin API access', 'ServerAuth', {
      path: new URL(request.url).pathname,
    });
    return {
      authorized: false,
      response: Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== 'ADMIN') {
    logger.security('Non-admin API access attempt', 'ServerAuth', {
      userId: session.user.id,
      role: session.user.role,
      path: new URL(request.url).pathname,
    });
    return {
      authorized: false,
      response: Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, session };
}
