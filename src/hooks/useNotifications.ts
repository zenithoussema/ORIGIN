'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedEntityId: string | null;
  relatedType: string | null;
  metadata: unknown;
  createdAt: string;
}

interface UseNotificationsOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { pollingInterval = 15000, enabled = true } = options;
  const isMounted = useIsMounted();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchNotifications = useCallback(
    async (reset: boolean = false) => {
      if (!isMounted || !enabled) return;

      const currentOffset = reset ? 0 : offsetRef.current;
      const url = `/api/notifications?limit=20&offset=${currentOffset}`;

      try {
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        lastFetchRef.current = Date.now();

        if (!mountedRef.current) return;

        if (reset) {
          setNotifications(data.notifications);
          offsetRef.current = 20;
        } else {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newNotifications = data.notifications.filter(
              (n: Notification) => !existingIds.has(n.id)
            );
            return [...prev, ...newNotifications];
          });
          offsetRef.current = currentOffset + 20;
        }

        setUnreadCount(data.unreadCount);
        setHasMore(data.hasMore);
      } catch {
        // silent
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isMounted, enabled]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!isMounted || !enabled) return;

    try {
      const res = await fetch('/api/notifications?count=true');
      if (!res.ok) return;

      const data = await res.json();
      if (mountedRef.current) {
        setUnreadCount(data.count);
      }
    } catch {
      // silent
    }
  }, [isMounted, enabled]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'markRead', notificationId }),
        });

        if (!res.ok) return false;

        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });

      if (!res.ok) return false;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId }),
        });

        if (!res.ok) return false;

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        fetchUnreadCount();

        return true;
      } catch {
        return false;
      }
    },
    [fetchUnreadCount]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchNotifications(false);
  }, [hasMore, isLoading, fetchNotifications]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!enabled || !isMounted) return;

    fetchNotifications(true);

    intervalRef.current = setInterval(() => {
      if (Date.now() - lastFetchRef.current > pollingInterval) {
        fetchUnreadCount();
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, isMounted, pollingInterval, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
  };
}
