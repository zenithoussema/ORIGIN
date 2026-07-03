import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger.server';

interface RequestLog {
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

const SLOW_REQUEST_THRESHOLD_MS = 2000;
const REQUEST_LOG_EXCLUDE_PATHS = [
  '/_next/',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons/',
  '/images/',
];

function shouldLogRequest(pathname: string): boolean {
  return !REQUEST_LOG_EXCLUDE_PATHS.some((p) => pathname.startsWith(p));
}

function extractUserId(request: NextRequest): string | undefined {
  const sessionCookie = request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__Secure-next-auth.session-token')?.value;
  return sessionCookie ? `session_${sessionCookie.slice(0, 8)}` : undefined;
}

export function logApiRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  requestId: string
): void {
  const { pathname } = request.nextUrl;
  if (!shouldLogRequest(pathname)) return;

  const duration = Date.now() - startTime;
  const status = response.status;
  const method = request.method;
  const userId = extractUserId(request);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  logger.apiRequest({
    method,
    path: pathname,
    status,
    duration,
    userId,
    requestId,
    metadata: { ip, userAgent },
  });
}

export function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
