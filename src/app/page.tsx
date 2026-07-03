import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RestaurantJsonLd, WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';
import { HomePageClient } from './HomePageClient';

export const metadata: Metadata = {
  title: 'ORIGIN | Premium Restaurant & Café',
  description:
    'Experience culinary excellence at ORIGIN. Premium dishes crafted with passion and the finest ingredients from the world.',
  openGraph: {
    title: 'ORIGIN - Where Culinary Art Meets Luxury',
    description:
      'Discover a world of exceptional flavors at ORIGIN. Fine dining, artisanal café, and unforgettable experiences.',
    url: 'https://origin.sa',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ORIGIN Restaurant - Premium Dining Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORIGIN - Where Culinary Art Meets Luxury',
    description: 'Discover a world of exceptional flavors at ORIGIN.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://origin.sa',
  },
};

function HomeLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <RestaurantJsonLd />
      <WebSiteJsonLd />
      <OrganizationJsonLd />
      <Suspense fallback={<HomeLoading />}>
        <HomePageClient />
      </Suspense>
    </>
  );
}
