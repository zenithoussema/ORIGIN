import { NextResponse } from 'next/server';

const SENTRY_HOST = 'sentry.io';
const ALLOWED_SENTRY_PATHS = ['/api/', '/envelope/'];

export async function POST(request: Request) {
  try {
    const envelope = await request.text();
    const piece = envelope.split('\n')[0];
    const header = JSON.parse(piece);

    const dsn = new URL(header.dsn);

    if (dsn.hostname !== SENTRY_HOST) {
      return NextResponse.json({ error: 'Invalid Sentry host' }, { status: 403 });
    }

    const projectId = dsn.pathname.replace('/', '');
    const sentryUrl = `https://${dsn.hostname}/api/${projectId}/envelope/`;

    const response = await fetch(sentryUrl, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Sentry relay failed' }, { status: response.status });
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Tunnel error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
