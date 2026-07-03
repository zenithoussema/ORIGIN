'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';

function isServer(): boolean {
  return typeof window === 'undefined';
}

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  isOffline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => {
    if (isServer()) return true;
    return navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(true);
      setIsOnline(true);
    };

    const handleOffline = () => {
      setWasOffline(false);
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOffline = !isOnline;

  return { isOnline, wasOffline, isOffline };
}

type ItemStatus = 'pending' | 'processed' | 'failed';

interface QueuedItem {
  id: number;
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  status: ItemStatus;
  retryCount?: number;
}

function parseQueue(): QueuedItem[] {
  if (isServer()) return [];
  try {
    const stored = localStorage.getItem('syncQueue');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is QueuedItem =>
      item && typeof item.id === 'number' &&
      typeof item.endpoint === 'string' &&
      ['pending', 'processed', 'failed'].includes(item.status)
    );
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedItem[]) {
  if (isServer()) return;
  localStorage.setItem('syncQueue', JSON.stringify(queue));
}

export function useBackgroundSync() {
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>(() => parseQueue());
  const { isOnline } = useOnlineStatus();
  const processingRef = useRef(false);

  const submitQueuedItemRef = useRef<(item: QueuedItem) => Promise<unknown> | null>(null);
  const markItemAsProcessedRef = useRef<(id: number) => void | null>(null);
  const markItemAsFailedRef = useRef<(id: number) => void | null>(null);

  useLayoutEffect(() => {
    submitQueuedItemRef.current = async (item: QueuedItem) => {
      const response = await fetch(item.endpoint, {
        method: item.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...item.headers },
        body: item.body ? JSON.stringify(item.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`Failed to submit item: ${response.status}`);
      }

      return response.json();
    };

    markItemAsProcessedRef.current = (id: number) => {
      setQueuedItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status: 'processed' as ItemStatus } : item
        );
        saveQueue(updated);
        return updated;
      });
    };

    markItemAsFailedRef.current = (id: number) => {
      setQueuedItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status: 'failed' as ItemStatus, retryCount: (item.retryCount || 0) + 1 } : item
        );
        saveQueue(updated);
        return updated;
      });
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const pending = queuedItems.filter((item) => item.status === 'pending');

      for (const item of pending) {
        try {
          await submitQueuedItemRef.current!(item);
          markItemAsProcessedRef.current!(item.id);
        } catch (error) {
          console.error('Failed to submit queued item:', error);
          markItemAsFailedRef.current!(item.id);
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [queuedItems]);

  useEffect(() => {
    if (isOnline && queuedItems.some((item) => item.status === 'pending')) {
      processQueue();
    }
  }, [isOnline, queuedItems, processQueue]);

  const queueItem = useCallback((item: Omit<QueuedItem, 'id' | 'status'>) => {
    const newItem: QueuedItem = { ...item, id: Date.now(), status: 'pending' };
    const updated = [...parseQueue(), newItem];
    saveQueue(updated);
    setQueuedItems(updated);
  }, []);

  return { queuedItems, queueItem, processQueue };
}

export function useOfflineIndicator() {
  const { isOffline } = useOnlineStatus();

  return {
    show: isOffline,
    className: isOffline ? 'offline-indicator' : ''
  };
}
