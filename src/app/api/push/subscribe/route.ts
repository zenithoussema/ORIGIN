import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';

export async function POST(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { endpoint, p256dh, auth: authKey } = body;

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    if (typeof endpoint !== 'string' || endpoint.length > 2048) {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    if (typeof p256dh !== 'string' || p256dh.length > 1024) {
      return NextResponse.json({ error: 'Invalid p256dh key' }, { status: 400 });
    }

    if (typeof authKey !== 'string' || authKey.length > 256) {
      return NextResponse.json({ error: 'Invalid auth key' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    await prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId: auth.session.user.id, endpoint } },
      update: { p256dh, auth: authKey, isActive: true },
      create: {
        userId: auth.session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
        userAgent: request.headers.get('user-agent') || null,
        isActive: true,
      },
    });

    logger.info('Push subscription stored', 'Push', { userId: auth.session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Push subscribe error', 'Push', error);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { endpoint } = await request.json();

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint, userId: auth.session.user.id },
      data: { isActive: false },
    });

    logger.info('Push subscription removed', 'Push', { userId: auth.session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Push unsubscribe error', 'Push', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
