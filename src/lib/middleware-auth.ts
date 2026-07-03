import { getToken } from '@auth/core/jwt';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

export interface MiddlewareUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getMiddlewareSession(request: Request): Promise<MiddlewareUser | null> {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const token = await getToken({
      req: request,
      secret,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: SESSION_COOKIE_NAME,
    });

    if (!token || !token.sub) return null;

    return {
      id: token.sub as string,
      email: token.email as string,
      name: (token.name as string) ?? null,
      role: (token.role as string) ?? 'USER',
    };
  } catch {
    return null;
  }
}
