import type { Metadata } from 'next';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Explore our curated selection of premium dishes, artisanal coffee, and handcrafted desserts at ORIGIN. Browse categories, filter by preferences, and discover your next favorite.',
  openGraph: {
    title: 'ORIGIN Menu | Premium Dining Experience',
    description:
      'Discover flavors crafted with passion. Browse our coffee, main courses, desserts, and drinks.',
    url: 'https://origin.sa/menu',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'ORIGIN Menu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORIGIN Menu | Premium Dining Experience',
    description: 'Discover flavors crafted with passion at ORIGIN.',
  },
  alternates: { canonical: 'https://origin.sa/menu' },
};

export default function MenuPage() {
  return (
    <>
      <WebSiteJsonLd />
      <MenuPageClient />
    </>
  );
}
