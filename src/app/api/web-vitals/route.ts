import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.event === 'web-vitals') {
      // In production, send to analytics service (e.g., Vercel Analytics, Google Analytics, Sentry)
      // For now, just acknowledge receipt
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
