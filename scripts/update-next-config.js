const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('C:/ORIGIN/package.json', 'utf8'));

const nextConfig = `import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      \"default-src 'self'\",
      \"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://browser.sentry-cdn.com\",
      \"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com\",
      \"font-src 'self' https://fonts.gstatic.com\",
      \"img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com\",
      \"media-src 'self'\",
      \"connect-src 'self' https://api.cloudinary.com https://*.sentry.io\",
      \"frame-ancestors 'none'\",
      \"base-uri 'self'\",
      \"form-action 'self'\",
      \"worker-src 'self' blob:\",
      \"require-trusted-document-origin 'none'\",
      \"speculation-rules 'self'\"
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
    scrollRestoration: true,
    optimizeServerReact: true,
    ppr: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: true,
  },
  webpack: {
    rules: {
      \*.css: {
        use: ['style-loader', 'css-loader'],
        type: 'javascript/auto'
      }
    },
    treeshake: {
      removeDebugLogging: true,
    },
  },
  tunnelRoute: '/api/sentry-tunnel',
});
`;

fs.writeFileSync('C:/ORIGIN/next.config.ts', nextConfig);
console.log('Next config updated!');