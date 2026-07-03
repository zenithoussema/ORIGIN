import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isMaintenanceMode } from '@/lib/flags';
import { getMiddlewareSession } from '@/lib/middleware-auth';

const CSRF_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

const CSRF_EXEMPT_PATHS = [
  '/api/auth/',
  '/api/webhooks/',
  '/api/health',
  '/api/ready',
];

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const MAINTENANCE_EXEMPT_PATHS = [
  '/api/health',
  '/api/ready',
  '/admin',
  '/api/auth/',
  '/api/webhooks/',
];

const GUEST_PROTECTED_ROUTES = [
  '/checkout',
  '/reservations',
  '/orders',
  '/profile',
];

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance - ORIGIN</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#1C0A00;color:#F5ECD7;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .container{text-align:center;padding:2rem;max-width:500px}
    .icon{font-size:4rem;margin-bottom:1.5rem}
    h1{font-family:Georgia,serif;font-size:2rem;color:#C8882A;margin-bottom:1rem}
    p{color:#F5ECD7AA;line-height:1.6;margin-bottom:1.5rem}
    .status{display:inline-block;padding:.5rem 1rem;border-radius:9999px;background:#C8882A20;color:#C8882A;font-size:.875rem}
    .status::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:#C8882A;margin-right:.5rem;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>We'll be right back</h1>
    <p>ORIGIN is currently undergoing scheduled maintenance. We're working hard to improve your experience.</p>
    <div class="status">Maintenance in progress</div>
  </div>
</body>
</html>`;

function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectSuspiciousPatterns(pathname: string): boolean {
  if (/\.\.\//.test(pathname)) return true;
  if (/\/etc\/passwd/i.test(pathname)) return true;
  if (/\/proc\//i.test(pathname)) return true;
  if (/\.env/i.test(pathname)) return true;
  if (/wp-admin|wp-login/i.test(pathname)) return true;
  if (/\x00/.test(pathname)) return true;
  if (/<script/i.test(pathname)) return true;
  if (/javascript:/i.test(pathname)) return true;
  return false;
}

function validateCsrfToken(request: NextRequest): boolean {
  if (SAFE_METHODS.includes(request.method)) return true;

  const { pathname } = request.nextUrl;
  if (CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return true;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    return false;
  }

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = createRequestId();

  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);

  if (detectSuspiciousPatterns(pathname)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  if (CSRF_METHODS.includes(request.method)) {
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }
  }

  let isMaintenance = false;
  try {
    isMaintenance = await isMaintenanceMode();
  } catch {
    isMaintenance = false;
  }

  if (isMaintenance) {
    const isExempt = MAINTENANCE_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
    if (!isExempt && !pathname.startsWith('/admin')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'System is under maintenance', maintenanceMode: true },
          { status: 503, headers: { 'Retry-After': '3600' } }
        );
      }
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: { 'Content-Type': 'text/html', 'Retry-After': '3600' },
      });
    }
  }

  const isProtected = GUEST_PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected) {
    const user = await getMiddlewareSession(request);
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'session_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
    let user;
    try { user = await getMiddlewareSession(request); } catch { user = null; }
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin/')) {
      let user;
      try { user = await getMiddlewareSession(request); } catch { user = null; }
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
};
