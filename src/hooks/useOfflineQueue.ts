'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface OfflineAction {
  id: string;
  type: 'order' | 'reservation' | 'profile' | 'favorite' | 'custom';
  endpoint: string;
  method: string;
  body: unknown;
  headers?: Record<string, string>;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

const STORAGE_KEY = 'origin-offline-queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function generateId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineAction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable
  }
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineAction[]>(loadQueue);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef(queue);

  // Keep ref in sync via effect
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const addAction = useCallback(
    (action: Omit<OfflineAction, 'id' | 'createdAt' | 'retryCount' | 'status'>) => {
      const newAction: OfflineAction = {
        ...action,
        id: generateId(),
        createdAt: Date.now(),
        retryCount: 0,
        status: 'pending',
      };

      setQueue((prev) => {
        const updated = [...prev, newAction];
        saveQueue(updated);
        return updated;
      });

      return newAction.id;
    },
    []
  );

  const removeAction = useCallback((id: string) => {
    setQueue((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveQueue(updated);
      return updated;
    });
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<OfflineAction>) => {
    setQueue((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      saveQueue(updated);
      return updated;
    });
  }, []);

  const syncAction = useCallback(
    async (action: OfflineAction): Promise<boolean> => {
      try {
        updateAction(action.id, { status: 'syncing' });

        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            ...action.headers,
          },
          body: JSON.stringify(action.body),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        updateAction(action.id, { status: 'completed' });
        return true;
      } catch (error) {
        const newRetryCount = action.retryCount + 1;
        const status = newRetryCount >= MAX_RETRIES ? 'failed' : 'pending';

        updateAction(action.id, {
          status,
          retryCount: newRetryCount,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return false;
      }
    },
    [updateAction]
  );

  const syncPending = useCallback(async () => {
    const pendingActions = queueRef.current.filter((a) => a.status === 'pending');
    if (pendingActions.length === 0) return;

    setIsSyncing(true);

    for (const action of pendingActions) {
      const delay = RETRY_DELAY * Math.pow(2, action.retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
      await syncAction(action);
    }

    setIsSyncing(false);
  }, [syncAction]);

  // Auto-sync when online
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(syncPending, 2000);
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [syncPending]);

  // Listen for SW sync messages
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.serviceWorker) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_PENDING_ACTIONS') {
        syncPending();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [syncPending]);

  const pendingCount = queue.filter((a) => a.status === 'pending').length;
  const failedCount = queue.filter((a) => a.status === 'failed').length;
  const completedCount = queue.filter((a) => a.status === 'completed').length;

  return {
    queue,
    pendingCount,
    failedCount,
    completedCount,
    isSyncing,
    addAction,
    removeAction,
    updateAction,
    syncPending,
    retryAction: (id: string) => {
      updateAction(id, { status: 'pending', retryCount: 0, error: undefined });
    },
  };
}
