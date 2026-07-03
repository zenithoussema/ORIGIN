'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-espresso p-8" role="alert">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
          Authentication Error
        </h2>
        <p className="text-sm text-smoke-300 dark:text-cream/50 mb-6">
          Something went wrong during authentication. Please try again.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Link href="/login">
            <Button variant="outline">
              Go to Login
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
