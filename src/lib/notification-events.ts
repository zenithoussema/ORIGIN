import { sendToUser, sendToAllUsers, type NotificationType } from '@/lib/notification-service';
import { logger } from '@/lib/logger.server';

export type NotificationEvent =
  | 'order:created'
  | 'order:status_updated'
  | 'payment:success'
  | 'payment:failed'
  | 'reservation:confirmed'
  | 'reservation:cancelled'
  | 'reservation:completed'
  | 'admin:announcement'
  | 'admin:promo'
  | 'wallet:funded'
  | 'wallet:payment';

interface EventPayload {
  userId?: string;
  orderNumber?: string;
  orderStatus?: string;
  amount?: number;
  reservationDate?: string;
  reservationTime?: string;
  guestCount?: number;
  title?: string;
  message?: string;
  method?: string;
  guestName?: string;
}

type EventHandler = (payload: EventPayload) => Promise<void>;

const handlers = new Map<NotificationEvent, EventHandler[]>();

export function onNotificationEvent(
  event: NotificationEvent,
  handler: EventHandler
): () => void {
  const existing = handlers.get(event) || [];
  existing.push(handler);
  handlers.set(event, existing);

  return () => {
    const current = handlers.get(event) || [];
    handlers.set(
      event,
      current.filter((h) => h !== handler)
    );
  };
}

export async function emitNotificationEvent(
  event: NotificationEvent,
  payload: EventPayload
): Promise<void> {
  const eventHandlers = handlers.get(event) || [];

  const promises = eventHandlers.map(async (handler) => {
    try {
      await handler(payload);
    } catch (err) {
      logger.error(`Error in handler for ${event}`, 'NotificationEvent', err);
    }
  });

  await Promise.allSettled(promises);
}

function registerDefaultHandlers(): void {
  onNotificationEvent('order:created', async (payload) => {
    if (!payload.userId || !payload.orderNumber) return;

    await sendToUser(
      payload.userId,
      'Order Confirmed',
      `Your order ${payload.orderNumber} has been confirmed and is being prepared.`,
      'SUCCESS',
      { relatedEntityId: payload.orderNumber, relatedType: 'ORDER' }
    );
  });

  onNotificationEvent('order:status_updated', async (payload) => {
    if (!payload.userId || !payload.orderNumber || !payload.orderStatus) return;

    const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
      CONFIRMED: {
        title: 'Order Confirmed',
        message: `Your order ${payload.orderNumber} has been confirmed.`,
        type: 'SUCCESS',
      },
      PREPARING: {
        title: 'Order Being Prepared',
        message: `Your order ${payload.orderNumber} is now being prepared by our kitchen.`,
        type: 'INFO',
      },
      COOKING: {
        title: 'Order Cooking',
        message: `Your order ${payload.orderNumber} is being cooked to perfection.`,
        type: 'INFO',
      },
      READY: {
        title: 'Order Ready',
        message: `Your order ${payload.orderNumber} is ready for ${payload.orderStatus === 'READY' ? 'pickup' : 'delivery'}!`,
        type: 'SUCCESS',
      },
      DELIVERED: {
        title: 'Order Delivered',
        message: `Your order ${payload.orderNumber} has been delivered. Enjoy your meal!`,
        type: 'SUCCESS',
      },
      COMPLETED: {
        title: 'Order Completed',
        message: `Your order ${payload.orderNumber} has been completed. Thank you!`,
        type: 'SUCCESS',
      },
      CANCELLED: {
        title: 'Order Cancelled',
        message: `Your order ${payload.orderNumber} has been cancelled.`,
        type: 'WARNING',
      },
    };

    const config = statusMessages[payload.orderStatus];
    if (config) {
      await sendToUser(
        payload.userId,
        config.title,
        config.message,
        config.type,
        { relatedEntityId: payload.orderNumber, relatedType: 'ORDER' }
      );
    }
  });

  onNotificationEvent('payment:success', async (payload) => {
    if (!payload.userId || !payload.amount) return;

    const method = payload.method || 'card';
    await sendToUser(
      payload.userId,
      'Payment Successful',
      `Your payment of ${payload.amount.toFixed(3)} DT via ${method} has been processed successfully.`,
      'SUCCESS',
      { relatedEntityId: payload.orderNumber, relatedType: 'PAYMENT', metadata: { amount: payload.amount, method } }
    );
  });

  onNotificationEvent('payment:failed', async (payload) => {
    if (!payload.userId) return;

    await sendToUser(
      payload.userId,
      'Payment Failed',
      'Your payment could not be processed. Please try again or use a different payment method.',
      'ERROR',
      { relatedEntityId: payload.orderNumber, relatedType: 'PAYMENT' }
    );
  });

  onNotificationEvent('reservation:confirmed', async (payload) => {
    if (!payload.userId) return;

    const dateStr = payload.reservationDate || 'your reserved date';
    const timeStr = payload.reservationTime || '';
    const guests = payload.guestCount || 1;

    await sendToUser(
      payload.userId,
      'Reservation Confirmed',
      `Your reservation for ${guests} guest${guests > 1 ? 's' : ''} on ${dateStr}${timeStr ? ` at ${timeStr}` : ''} has been confirmed.`,
      'SUCCESS',
      { relatedType: 'RESERVATION' }
    );
  });

  onNotificationEvent('reservation:cancelled', async (payload) => {
    if (!payload.userId) return;

    await sendToUser(
      payload.userId,
      'Reservation Cancelled',
      'Your reservation has been cancelled successfully.',
      'WARNING',
      { relatedType: 'RESERVATION' }
    );
  });

  onNotificationEvent('reservation:completed', async (payload) => {
    if (!payload.userId) return;

    await sendToUser(
      payload.userId,
      'Reservation Completed',
      'Thank you for dining with us! We hope you had a wonderful experience.',
      'SUCCESS',
      { relatedType: 'RESERVATION' }
    );
  });

  onNotificationEvent('wallet:funded', async (payload) => {
    if (!payload.userId || !payload.amount) return;

    await sendToUser(
      payload.userId,
      'Wallet Funded',
      `Your wallet has been funded with ${payload.amount.toFixed(3)} DT.`,
      'SUCCESS',
      { relatedType: 'WALLET', metadata: { amount: payload.amount } }
    );
  });

  onNotificationEvent('wallet:payment', async (payload) => {
    if (!payload.userId || !payload.amount) return;

    await sendToUser(
      payload.userId,
      'Wallet Payment',
      `A payment of ${payload.amount.toFixed(3)} DT has been deducted from your wallet for order ${payload.orderNumber || 'N/A'}.`,
      'INFO',
      { relatedEntityId: payload.orderNumber, relatedType: 'WALLET', metadata: { amount: payload.amount } }
    );
  });

  onNotificationEvent('admin:announcement', async (payload) => {
    if (!payload.title || !payload.message) return;

    await sendToAllUsers(
      payload.title,
      payload.message,
      (payload as unknown as { type?: NotificationType }).type || 'INFO'
    );
  });

  onNotificationEvent('admin:promo', async (payload) => {
    if (!payload.title || !payload.message) return;

    await sendToAllUsers(
      payload.title,
      payload.message,
      'PROMO'
    );
  });
}

let initialized = false;

export function initializeNotificationEvents(): void {
  if (initialized) return;
  initialized = true;
  registerDefaultHandlers();
}
