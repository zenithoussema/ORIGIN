'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

function NullComponent() {
  return null;
}

const InstallBanner = dynamic(
  () => import('@/components/pwa/InstallBanner').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

const UpdateNotification = dynamic(
  () => import('@/components/pwa/UpdateNotification').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

const OfflineBanner = dynamic(
  () => import('@/components/pwa/OfflineBanner').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <>
      <OfflineBanner />
      <UpdateNotification />
      {children}
      <InstallBanner />
    </>
  );
}
