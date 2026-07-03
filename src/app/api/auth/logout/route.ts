import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger.server';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

export async function POST() {
  try {
    logger.info('User signed out', 'Auth');
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    logger.error('Sign out error', 'Auth', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
