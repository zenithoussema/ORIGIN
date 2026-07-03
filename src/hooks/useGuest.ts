'use client';

import { useCallback } from 'react';

const GUEST_ID_KEY = 'origin-guest-id';
const GUEST_MODE_KEY = 'origin-guest-mode';

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useGuest() {
  const getGuestId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GUEST_ID_KEY);
  }, []);

  const isGuest = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(GUEST_MODE_KEY) === 'true';
  }, []);

  const continueAsGuest = useCallback(() => {
    const existingId = localStorage.getItem(GUEST_ID_KEY);
    if (!existingId) {
      localStorage.setItem(GUEST_ID_KEY, generateGuestId());
    }
    localStorage.setItem(GUEST_MODE_KEY, 'true');
  }, []);

  const clearGuest = useCallback(() => {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_MODE_KEY);
  }, []);

  const upgradeToAccount = useCallback(() => {
    clearGuest();
  }, [clearGuest]);

  return {
    getGuestId,
    isGuest,
    continueAsGuest,
    clearGuest,
    upgradeToAccount,
  };
}
