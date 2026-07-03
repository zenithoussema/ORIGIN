import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from '@/lib/notification-service';
import { logger } from '@/lib/logger.server';

export async function GET(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
  const countOnly = url.searchParams.get('count') === 'true';

  if (countOnly) {
    const count = await getUnreadCount(auth.session.user.id);
    return NextResponse.json({ count });
  }

  const notifications = await getUserNotifications(auth.session.user.id, {
    limit,
    offset,
    unreadOnly,
  });

  const unread = await getUnreadCount(auth.session.user.id);

  return NextResponse.json({
    notifications,
    unreadCount: unread,
    hasMore: notifications.length === limit,
  });
}

export async function POST(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action, notificationId } = body;

    if (action === 'markRead' && notificationId) {
      const success = await markAsRead(notificationId, auth.session.user.id);
      return NextResponse.json({ success });
    }

    if (action === 'markAllRead') {
      const count = await markAllAsRead(auth.session.user.id);
      return NextResponse.json({ success: true, count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Notification action error', 'API', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const success = await deleteNotification(notificationId, auth.session.user.id);
    return NextResponse.json({ success });
  } catch (error) {
    logger.error('Notification delete error', 'API', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
