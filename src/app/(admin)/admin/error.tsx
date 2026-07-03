'use client';

import { useRouter } from 'next/navigation';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-2">
          Dashboard Error
        </h1>
        <p className="text-sm text-smoke-300 dark:text-cream/50 mb-2">
          Something went wrong in the admin dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-smoke-300/50 dark:text-cream/30 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl border border-espresso/15 dark:border-cream/15 px-6 py-3 text-sm font-medium text-espresso dark:text-cream transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
