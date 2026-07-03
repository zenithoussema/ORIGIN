import type { MetadataRoute } from 'next';
import { menuItems } from '@/data/menu';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://origin.sa';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/reservations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'never', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'never', priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = menuItems
    .filter((item) => item.isAvailable)
    .map((item) => ({
      url: `${baseUrl}/menu/${item.id}`,
      lastModified: new Date(item.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticPages, ...productPages];
}
