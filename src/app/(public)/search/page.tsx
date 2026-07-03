import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageClient } from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Search | ORIGIN',
  description: 'Search our menu for dishes, ingredients, and categories.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
