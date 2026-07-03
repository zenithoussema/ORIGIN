import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import SkipToContent from '@/components/ui/SkipToContent';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://origin.sa'),
  title: {
    default: 'ORIGIN | Premium Restaurant & Café',
    template: '%s | ORIGIN',
  },
  description:
    'Experience culinary excellence at ORIGIN. Premium dishes crafted with passion and the finest ingredients from around the world.',
  keywords: ['restaurant', 'café', 'fine dining', 'luxury', 'premium', 'food', 'culinary', 'ORIGIN'],
  authors: [{ name: 'ORIGIN' }],
  creator: 'ORIGIN',
  publisher: 'ORIGIN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://origin.sa',
    siteName: 'ORIGIN',
    title: 'ORIGIN - Where Culinary Art Meets Luxury',
    description:
      'Discover a world of exceptional flavors at ORIGIN. Fine dining, artisanal café, and unforgettable experiences.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ORIGIN Restaurant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORIGIN - Where Culinary Art Meets Luxury',
    description: 'Discover a world of exceptional flavors at ORIGIN.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
  alternates: {
    canonical: 'https://origin.sa',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={inter.variable}>
      <body className={`min-h-screen bg-cream text-espresso antialiased dark:bg-espresso dark:text-cream ${inter.className} ${playfair.variable}`}>
        <SkipToContent />
        <ThemeProvider
          defaultTheme="dark"
          storageKey="origin-theme"
          attribute="class"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <LanguageProvider>
              <ErrorBoundary>
                <PwaProvider>
                  <Navbar />
                  <main id="main-content" className="min-h-screen" tabIndex={-1}>
                    {children}
                  </main>
                  <Footer />
                </PwaProvider>
              </ErrorBoundary>
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}