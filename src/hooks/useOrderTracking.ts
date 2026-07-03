'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrackingOrder, OrderStatus } from '@/lib/order-tracking';

interface UseOrderTrackingOptions {
  orderId: string;
  pollingInterval?: number;
}

interface UseOrderTrackingReturn {
  order: TrackingOrder | null;
  isLoading: boolean;
  error: string | null;
  previousStatus: OrderStatus | null;
  statusChanged: boolean;
  clearStatusChanged: () => void;
  refetch: () => void;
}

export function useOrderTracking({
  orderId,
  pollingInterval = 5000,
}: UseOrderTrackingOptions): UseOrderTrackingReturn {
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousStatus, setPreviousStatus] = useState<OrderStatus | null>(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const prevStatusRef = useRef<OrderStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/status`);

      if (response.status === 404) {
        if (isMountedRef.current) {
          setError('Order not found');
          setIsLoading(false);
        }
        return;
      }

      if (response.status === 401) {
        if (isMountedRef.current) {
          setError('Unauthorized');
          setIsLoading(false);
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      const newOrder: TrackingOrder = data.order;

      if (isMountedRef.current) {
        if (prevStatusRef.current && prevStatusRef.current !== newOrder.status) {
          setPreviousStatus(prevStatusRef.current);
          setStatusChanged(true);
        }
        prevStatusRef.current = newOrder.status;
        setOrder(newOrder);
        setError(null);
        setIsLoading(false);

        if (newOrder.status === 'COMPLETED' || newOrder.status === 'CANCELLED') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch {
      if (isMountedRef.current) {
        setError('Failed to load order');
        setIsLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchOrder(); // eslint-disable-line react-hooks/set-state-in-effect -- intentional data fetch on mount

    intervalRef.current = setInterval(fetchOrder, pollingInterval);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrder, pollingInterval]);

  const clearStatusChanged = useCallback(() => {
    setStatusChanged(false);
    setPreviousStatus(null);
  }, []);

  const refetch = useCallback(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    error,
    previousStatus,
    statusChanged,
    clearStatusChanged,
    refetch,
  };
}
