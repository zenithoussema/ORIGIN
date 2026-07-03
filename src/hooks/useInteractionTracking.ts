'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useInteractionTracking() {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionIdRef.current) {
      sessionIdRef.current = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }
  }, []);

  const track = useCallback(
    async (
      action: string,
      itemId: string,
      metadata?: {
        category?: string;
        tags?: string[];
        query?: string;
        [key: string]: unknown;
      }
    ) => {
      try {
        await fetch('/api/recommendations/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            action,
            sessionId: sessionIdRef.current,
            ...metadata,
          }),
        });
      } catch {
        // Silent fail — tracking should never crash the app
      }
    },
    []
  );

  const trackView = useCallback(
    (itemId: string, category?: string, tags?: string[]) => {
      track('view', itemId, { category, tags });
    },
    [track]
  );

  const trackAddToCart = useCallback(
    (itemId: string, category?: string, tags?: string[]) => {
      track('add_to_cart', itemId, { category, tags });
    },
    [track]
  );

  const trackSearch = useCallback(
    (query: string) => {
      track('search', 'search_query', { query });
    },
    [track]
  );

  const trackFavorite = useCallback(
    (itemId: string, category?: string, tags?: string[]) => {
      track('favorite', itemId, { category, tags });
    },
    [track]
  );

  const trackClick = useCallback(
    (itemId: string, category?: string, tags?: string[]) => {
      track('click', itemId, { category, tags });
    },
    [track]
  );

  return {
    track,
    trackView,
    trackAddToCart,
    trackSearch,
    trackFavorite,
    trackClick,
  };
}
