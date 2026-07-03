'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h2 className="mb-2 font-playfair text-2xl font-bold text-espresso dark:text-cream">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-espresso/60 dark:text-cream/60">
        We encountered an unexpected error. Please try again or return to our homepage.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
