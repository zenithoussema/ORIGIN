import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthErrorClient from './AuthErrorClient';

export const metadata: Metadata = {
  title: 'Authentication Error | ORIGIN',
};

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      }
    >
      <AuthErrorClient />
    </Suspense>
  );
}
