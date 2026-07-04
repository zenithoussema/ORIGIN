'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { InstallBanner } from '@/components/pwa/InstallBanner';

export function PwaProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
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
