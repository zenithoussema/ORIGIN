export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

export interface PushProvider {
  sendPush(subscription: PushSubscriptionData, payload: PushNotificationPayload): Promise<{ success: boolean; error?: string }>;
  sendToAll(userId: string, payload: PushNotificationPayload): Promise<{ sent: number; failed: number }>;
}

class ConsolePushProvider implements PushProvider {
  async sendPush(
    _subscription: PushSubscriptionData,
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; error?: string }> {
    console.log('[PushProvider:Console] Push notification:', {
      title: payload.title,
      body: payload.body,
    });
    return { success: true };
  }

  async sendToAll(
    _userId: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    console.log('[PushProvider:Console] Broadcast push:', {
      title: payload.title,
      body: payload.body,
    });
    return { sent: 0, failed: 0 };
  }
}

let pushProvider: PushProvider = new ConsolePushProvider();

export function setPushProvider(provider: PushProvider): void {
  pushProvider = provider;
}

export function getPushProvider(): PushProvider {
  return pushProvider;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  return pushProvider.sendPush(subscription, payload);
}

export function buildOrderPushPayload(
  orderNumber: string,
  status: string
): PushNotificationPayload {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed!',
    PREPARING: 'Your order is being prepared.',
    COOKING: 'Your order is cooking!',
    READY: 'Your order is ready for pickup!',
    DELIVERED: 'Your order has been delivered!',
    COMPLETED: 'Thank you for your order!',
    CANCELLED: 'Your order has been cancelled.',
  };

  return {
    title: 'ORIGIN',
    body: statusMessages[status] || `Order ${orderNumber} updated`,
    tag: `order-${orderNumber}`,
    data: { orderNumber, status, url: `/order/${orderNumber}` },
  };
}

export function buildReservationPushPayload(
  action: string,
  date: string,
  time: string
): PushNotificationPayload {
  const titles: Record<string, string> = {
    confirmed: 'Reservation Confirmed',
    cancelled: 'Reservation Cancelled',
    completed: 'Thank You!',
  };

  return {
    title: 'ORIGIN',
    body: titles[action] || `Reservation ${action}`,
    tag: `reservation-${date}`,
    data: { action, date, time, url: '/profile' },
  };
}

export function buildPromoPushPayload(
  title: string,
  message: string
): PushNotificationPayload {
  return {
    title: 'ORIGIN - Special Offer',
    body: `${title}: ${message}`,
    tag: 'promo',
    data: { url: '/menu' },
  };
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}
