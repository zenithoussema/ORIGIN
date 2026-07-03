import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile/', '/orders/', '/checkout/', '/receipt/'],
      },
    ],
    sitemap: 'https://origin.sa/sitemap.xml',
  };
}
