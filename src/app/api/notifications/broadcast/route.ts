import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import { sendToAllUsers } from '@/lib/notification-service';
import { logger } from '@/lib/logger.server';
import { z } from 'zod';

const broadcastSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PROMO']).default('INFO'),
  userIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = broadcastSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { title, message, type, userIds } = result.data;

    const count = await sendToAllUsers(title, message, type, { userIds });

    logger.info('Broadcast sent', 'Admin', {
      userId: auth.session.user.id,
      count,
      type,
    });

    return NextResponse.json({
      success: true,
      count,
      message: `Notification sent to ${count} user${count !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    logger.error('Broadcast error', 'Admin', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}
