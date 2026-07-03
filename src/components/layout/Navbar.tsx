'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, LogIn, LogOut, Settings, ClipboardList, Calendar, Shield, ChevronDown, UserCircle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Container } from '@/components/ui/Container';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { MobileNav } from '@/components/layout/MobileNav';
import { CartBadge } from '@/components/cart/CartBadge';
import { useLanguage } from '@/components/providers/LanguageProvider';

function NullComponent() {
  return null;
}

const SearchModal = dynamic(
  () => import('@/components/search/SearchModal').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

const NotificationBell = dynamic(
  () => import('@/components/notifications/NotificationBell').then((m) => m.default).catch(() => NullComponent),
  { ssr: false }
);

const navLinks = [
  { key: 'nav.home', href: '/', fallback: 'Home' },
  { key: 'nav.menu', href: '/menu', fallback: 'Menu' },
  { key: 'nav.reservations', href: '/reservations', fallback: 'Reservations' },
  { key: 'nav.orders', href: '/profile?tab=orders', fallback: 'Orders' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ Get mounted from LanguageProvider — single source of truth
  const { t, mounted } = useLanguage();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, isCartOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    if (isUserMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isUserMenuOpen]);

  // ✅ Only treat as authenticated after client mount
  const isAuth = mounted && status === 'authenticated' && !!session;

  const userInitials =
    mounted && session?.user?.name
      ? session.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : null;

  const dropdownItems = [
    { label: 'My Profile', href: '/profile', icon: UserCircle, role: null },
    { label: 'My Orders', href: '/profile?tab=orders', icon: ClipboardList, role: null },
    { label: 'My Reservations', href: '/reservations', icon: Calendar, role: null },
    { label: 'Settings', href: '/profile?tab=settings', icon: Settings, role: null },
    ...(mounted && session?.user?.role === 'ADMIN'
      ? [{ label: 'Admin Panel', href: '/admin', icon: Shield, role: 'ADMIN' as const }]
      : []),
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-espresso/95 shadow-lg shadow-espresso/20 backdrop-blur-xl dark:bg-espresso/95'
            : 'bg-transparent'
        }`}
      >
        <Container size="xl">
          <nav className="flex h-20 items-center justify-between" role="navigation" aria-label="Main navigation">
            <Link href="/" className="flex-shrink-0" aria-label="ORIGIN Home">
              <Logo />
            </Link>

            {/* ✅ Use fallback on SSR, translated label after mount */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-lg px-4 py-2 text-sm font-medium text-cream/80 transition-colors hover:bg-cream/10 hover:text-caramel"
                  suppressHydrationWarning
                >
                  {mounted ? t(link.key) : link.fallback}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <SearchModal />
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>

              <CartBadge onClick={() => setIsCartOpen(true)} />

              {isAuth && <NotificationBell />}

              <div className="hidden lg:flex items-center gap-3">
                {/* ✅ Render nothing until mounted */}
                {!mounted ? null : isAuth ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                      className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-cream/10"
                    >
                      {userInitials ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-sm font-bold text-espresso">
                          {userInitials}
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10">
                          <User className="h-4 w-4 text-cream" />
                        </div>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-cream/60 transition-transform ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 shadow-xl overflow-hidden"
                          role="menu"
                        >
                          <div className="p-3 border-b border-espresso/10 dark:border-cream/10">
                            <p className="text-sm font-medium text-espresso dark:text-cream truncate">
                              {session?.user?.name}
                            </p>
                            <p className="text-xs text-smoke-300 dark:text-cream/40 truncate">
                              {session?.user?.email}
                            </p>
                          </div>
                          <div className="p-1">
                            {dropdownItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                                role="menuitem"
                              >
                                <item.icon size={16} />
                                {item.label}
                              </Link>
                            ))}
                            <div className="my-1 border-t border-espresso/10 dark:border-cream/10" />
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                signOut({ callbackUrl: '/' });
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              role="menuitem"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-2 rounded-full bg-caramel px-5 py-2 text-sm font-medium text-espresso transition-colors hover:bg-caramel/90 shadow-lg shadow-caramel/25"
                    >
                      <UserCircle size={16} />
                      Create Account
                    </Link>
                  </>
                )}
              </div>

              <IconButton
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </IconButton>
            </div>
          </nav>
        </Container>
      </motion.header>

      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
