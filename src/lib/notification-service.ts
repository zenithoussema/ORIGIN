import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';
import type { Prisma } from '@prisma/client';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROMO';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntityId?: string;
  relatedType?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedEntityId: string | null;
  relatedType: string | null;
  metadata: unknown;
  createdAt: Date;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationRecord | null> {
  if (!prisma) return null;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || 'INFO',
        relatedEntityId: input.relatedEntityId || null,
        relatedType: input.relatedType || null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return notification as NotificationRecord;
  } catch (error) {
    logger.error('Failed to create notification', 'Notification', error);
    return null;
  }
}

export async function sendToUser(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'INFO',
  options?: { relatedEntityId?: string; relatedType?: string; metadata?: Record<string, unknown> }
): Promise<NotificationRecord | null> {
  return createNotification({
    userId,
    title,
    message,
    type,
    relatedEntityId: options?.relatedEntityId,
    relatedType: options?.relatedType,
    metadata: options?.metadata,
  });
}

export async function sendToAllUsers(
  title: string,
  message: string,
  type: NotificationType = 'INFO',
  options?: { userIds?: string[]; metadata?: Record<string, unknown> }
): Promise<number> {
  if (!prisma) return 0;

  try {
    let targetUserIds: string[];

    if (options?.userIds && options.userIds.length > 0) {
      targetUserIds = options.userIds;
    } else {
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = users.map((user) => user.id);
    }

    if (targetUserIds.length === 0) return 0;

    const notifications = targetUserIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      metadata: (options?.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    }));

    const result = await prisma.notification.createMany({
      data: notifications,
    });

    return result.count;
  } catch (error) {
    logger.error('Failed to send to all users', 'Notification', error);
    return 0;
  }
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  if (!prisma) return false;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return false;
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return true;
  } catch {
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<number> {
  if (!prisma) return 0;

  try {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return result.count;
  } catch {
    return 0;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!prisma) return 0;

  try {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return count;
  } catch {
    return 0;
  }
}

export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
): Promise<NotificationRecord[]> {
  if (!prisma) return [];

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return notifications as NotificationRecord[];
  } catch {
    return [];
  }
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  if (!prisma) return false;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return false;
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return true;
  } catch {
    return false;
  }
}

export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  if (!prisma) return 0;

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoff },
        read: true,
      },
    });

    return result.count;
  } catch {
    return 0;
  }
}
