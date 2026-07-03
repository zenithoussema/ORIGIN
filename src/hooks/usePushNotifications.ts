'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  isPushSupported,
  requestPushPermission,
} from '@/lib/push-provider';

interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
}

function getInitialPushState(): PushSubscriptionState {
  if (typeof window === 'undefined') {
    return { isSupported: false, permission: null, subscription: null, isSubscribed: false };
  }
  return {
    isSupported: isPushSupported(),
    permission: typeof Notification !== 'undefined' ? Notification.permission : null,
    subscription: null,
    isSubscribed: false,
  };
}

export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>(getInitialPushState);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!state.isSupported) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setState((prev) => ({
          ...prev,
          subscription,
          isSubscribed: !!subscription,
        }));
      });
    });
  }, [state.isSupported]);

  const subscribe = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const permission = await requestPushPermission();
      if (!permission) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getVapidPublicKey(),
      });

      setState((prev) => ({
        ...prev,
        permission: 'granted',
        subscription,
        isSubscribed: true,
      }));

      await sendSubscriptionToServer(subscription);

      return true;
    } catch (err) {
      console.error('[Push] Subscribe failed:', err);
      return false;
    }
  }, [state.isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return false;

    try {
      await state.subscription.unsubscribe();
      setState((prev) => ({
        ...prev,
        subscription: null,
        isSubscribed: false,
      }));
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
      return false;
    }
  }, [state.subscription]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!state.isSupported) return 'denied';
    const granted = await requestPushPermission();
    const permission: NotificationPermission = granted ? 'granted' : 'denied';
    setState((prev) => ({ ...prev, permission }));
    return permission;
  }, [state.isSupported]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}

function getVapidPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) {
    return 'BEl62iUYgUivxIkv69yViEuuiJqlzGzFOhX9WGLVHkS-kBhPMqEJDuYCTGUhJcA1YvJmU3VPLp3hE4M3FJYHfc0';
  }
  return key;
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const data = subscription.toJSON();
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: data.endpoint,
        p256dh: data.keys?.p256dh,
        auth: data.keys?.auth,
      }),
    });
  } catch (err) {
    console.error('[Push] Failed to send subscription to server:', err);
  }
}
