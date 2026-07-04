'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { InstallBanner } from '@/components/pwa/InstallBanner';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{children}</>;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  return (
    <>
      <OfflineBanner />
      <UpdateNotification />
      {children}
      <InstallBanner />
    </>
  );
}
