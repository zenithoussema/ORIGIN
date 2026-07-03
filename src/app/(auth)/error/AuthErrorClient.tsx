'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AuthErrorClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please try again later.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in with this account.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The verification link may have expired or already been used.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred. Please try again.',
    },
  };

  const errorInfo = errorMessages[error ?? ''] ?? errorMessages.Default;

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream mb-3">
            {errorInfo.title}
          </h1>
          <p className="text-smoke-300 dark:text-cream/50">
            {errorInfo.description}
          </p>
          {error && (
            <p className="mt-4 text-xs text-smoke-300/60 dark:text-cream/30 font-mono">
              Error code: {error}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
              Back to Sign In
            </Button>
          </Link>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw size={18} />}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
