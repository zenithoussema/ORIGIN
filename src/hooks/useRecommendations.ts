'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface RecommendationItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reason: string;
  score: number;
}

interface UseRecommendationsOptions {
  limit?: number;
  enabled?: boolean;
}

export function usePersonalizedRecommendations(
  options: UseRecommendationsOptions = {}
) {
  const { limit = 8, enabled = true } = options;
  const isMounted = useIsMounted();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isMounted || !enabled) return;
    fetch(`/api/recommendations?limit=${limit}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItems(data?.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isMounted, enabled, limit]);

  const refresh = useCallback(async () => {
    if (!isMounted || !enabled) return;
    try {
      const res = await fetch(`/api/recommendations?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, enabled, limit]);

  return { items, isLoading, refresh };
}

export function useTrendingRecommendations(
  options: UseRecommendationsOptions = {}
) {
  const { limit = 8, enabled = true } = options;
  const isMounted = useIsMounted();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isMounted || !enabled) return;
    fetch(`/api/recommendations/trending?limit=${limit}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItems(data?.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isMounted, enabled, limit]);

  return { items, isLoading };
}

export function useProductRecommendations(productId: string) {
  const isMounted = useIsMounted();
  const [similar, setSimilar] = useState<RecommendationItem[]>([]);
  const [fbt, setFbt] = useState<RecommendationItem[]>([]);
  const [meal, setMeal] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isMounted || !productId) return;

    Promise.all([
      fetch(`/api/recommendations/related/${productId}?limit=4`).then((r) =>
        r.ok ? r.json() : { items: [] }
      ),
      fetch(`/api/recommendations/fbt/${productId}?limit=4`).then((r) =>
        r.ok ? r.json() : { items: [] }
      ),
      fetch(`/api/recommendations/meal/${productId}?limit=4`).then((r) =>
        r.ok ? r.json() : { items: [] }
      ),
    ])
      .then(([similarData, fbtData, mealData]) => {
        setSimilar(similarData.items || []);
        setFbt(fbtData.items || []);
        setMeal(mealData.items || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isMounted, productId]);

  return { similar, fbt, meal, isLoading };
}

export function useCheckoutUpsells(cartItemIds: string[]) {
  const isMounted = useIsMounted();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cartKey = cartItemIds.join(',');

  useEffect(() => {
    if (!isMounted || cartItemIds.length === 0) return;

    fetch(`/api/recommendations/checkout?ids=${cartKey}&limit=4`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isMounted, cartKey, cartItemIds.length]);

  return { items, isLoading: cartItemIds.length === 0 ? false : isLoading };
}
