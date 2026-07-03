'use client';

import Link from 'next/link';
import { Instagram, Facebook, Send, Phone } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { useLanguage } from '@/components/providers/LanguageProvider';

// ✅ Hardcoded to avoid SSR/client mismatch with new Date()
const CURRENT_YEAR = 2026;

const quickLinks = [
  { key: 'nav.home', href: '/', fallback: 'Home' },
  { key: 'nav.menu', href: '/menu', fallback: 'Menu' },
  { key: 'nav.reservations', href: '/reservations', fallback: 'Reservations' },
  { key: 'nav.about', href: '/about', fallback: 'About' },
  { key: 'nav.contact', href: '/contact', fallback: 'Contact' },
];

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', ariaLabel: 'Follow us on Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', ariaLabel: 'Follow us on Facebook' },
  { icon: Send, href: 'https://tiktok.com', label: 'TikTok', ariaLabel: 'Follow us on TikTok' },
  { icon: Phone, href: 'https://wa.me/1234567890', label: 'WhatsApp', ariaLabel: 'Contact us on WhatsApp' },
];

export function Footer() {
  const { t, mounted } = useLanguage();

  return (
    <footer className="border-t border-espresso/10 bg-espresso dark:border-cream/10 dark:bg-espresso">
      <Container size="xl">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo size="lg" />
            <p className="text-sm leading-relaxed text-cream/60" suppressHydrationWarning>
              {mounted ? t('footer.brand') : ''}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-caramel hover:text-espresso"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream" suppressHydrationWarning>
              {mounted ? t('footer.quickLinks') : ''}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 transition-colors hover:text-caramel"
                    suppressHydrationWarning
                  >
                    {mounted ? t(link.key) : link.fallback}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream" suppressHydrationWarning>
              {mounted ? t('footer.openingHours') : ''}
            </h3>
            <ul className="space-y-3 text-sm text-cream/60">
              <li suppressHydrationWarning>{mounted ? t('footer.hours.weekdays') : ''}</li>
              <li suppressHydrationWarning>{mounted ? t('footer.hours.saturday') : ''}</li>
              <li suppressHydrationWarning>{mounted ? t('footer.hours.sunday') : ''}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream" suppressHydrationWarning>
              {mounted ? t('footer.newsletter') : ''}
            </h3>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={mounted ? t('footer.newsletterPlaceholder') : ''}
                className="w-full rounded-xl border border-cream/20 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-caramel focus:ring-1 focus:ring-caramel"
                aria-label={mounted ? t('footer.newsletter') : ''}
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-caramel px-4 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel/90"
                suppressHydrationWarning
              >
                {mounted ? t('footer.subscribe') : ''}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-6 sm:flex-row">
          <p className="text-xs text-cream/40" suppressHydrationWarning>
            &copy; {CURRENT_YEAR} ORIGIN. {mounted ? t('footer.rights') : ''}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-cream/40 transition-colors hover:text-cream" suppressHydrationWarning>
              {mounted ? t('footer.privacy') : ''}
            </Link>
            <Link href="/terms" className="text-xs text-cream/40 transition-colors hover:text-cream" suppressHydrationWarning>
              {mounted ? t('footer.terms') : ''}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
