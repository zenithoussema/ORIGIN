'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, WifiOff, ShoppingCart, BookOpen, User } from 'lucide-react';

export default function OfflinePage() {
  const [cachedMenuCount, setCachedMenuCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check cached content
    if ('caches' in window) {
      caches.keys().then((names) => {
        let count = 0;
        Promise.all(
          names.map((name) =>
            caches.open(name).then((cache) => cache.keys().then((keys) => { count += keys.length; }))
          )
        ).then(() => setCachedMenuCount(count));
      });
    }
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setRetryKey((k) => k + 1);
    }
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {/* Animated offline icon */}
        <div className="relative mx-auto mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-espresso/5 dark:bg-cream/5">
            <WifiOff className="h-12 w-12 text-espresso/30 dark:text-cream/30" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
          </div>
        </div>

        <h1 className="mb-2 font-playfair text-3xl font-bold text-espresso dark:text-cream">
          You&apos;re Offline
        </h1>
        <p className="mb-8 text-espresso/60 dark:text-cream/60">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry — you can
          still browse some content that&apos;s been cached.
        </p>

        {/* Quick actions */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <Link
            href="/menu"
            className="flex flex-col items-center gap-2 rounded-2xl border border-espresso/10 dark:border-cream/10 p-4 transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            <BookOpen className="h-6 w-6 text-caramel" />
            <span className="text-xs font-medium text-espresso dark:text-cream">Menu</span>
          </Link>
          <Link
            href="/menu"
            className="flex flex-col items-center gap-2 rounded-2xl border border-espresso/10 dark:border-cream/10 p-4 transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            <ShoppingCart className="h-6 w-6 text-caramel" />
            <span className="text-xs font-medium text-espresso dark:text-cream">Cart</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-2 rounded-2xl border border-espresso/10 dark:border-cream/10 p-4 transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            <User className="h-6 w-6 text-caramel" />
            <span className="text-xs font-medium text-espresso dark:text-cream">Profile</span>
          </Link>
        </div>

        {cachedMenuCount > 0 && (
          <p className="mb-6 text-xs text-espresso/40 dark:text-cream/40">
            {cachedMenuCount} cached items available
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/menu"
            className="rounded-xl bg-espresso/10 px-6 py-3 text-center text-sm font-semibold text-espresso transition-colors hover:bg-espresso/20 dark:bg-cream/10 dark:text-cream dark:hover:bg-cream/20"
          >
            Browse Cached Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
