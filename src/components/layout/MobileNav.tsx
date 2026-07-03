'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Sun, Moon, User, LogIn, LogOut, Shield, Settings, ClipboardList, Calendar, UserCircle, Home, Menu as MenuIcon, ChefHat } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useIsMounted } from '@/hooks/useIsMounted';
import { mobileMenuVariants, overlayVariants, staggerContainer, fadeUp } from '@/lib/animations';
import { localeNames, type Locale } from '@/lib/i18n';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinkItems = [
  { key: 'nav.home', fallback: 'Home', href: '/', icon: Home },
  { key: 'nav.menu', fallback: 'Menu', href: '/menu', icon: MenuIcon },
  { key: 'nav.reservations', fallback: 'Reservations', href: '/reservations', icon: Calendar },
  { key: 'nav.orders', fallback: 'Orders', href: '/profile?tab=orders', icon: ClipboardList },
];

const userMenuItems = [
  { key: 'nav.profile', fallback: 'My Profile', href: '/profile', icon: UserCircle },
  { key: 'nav.orders', fallback: 'My Orders', href: '/profile?tab=orders', icon: ClipboardList },
  { key: 'nav.reservations', fallback: 'My Reservations', href: '/reservations', icon: Calendar },
  { key: 'nav.settings', fallback: 'Settings', href: '/profile?tab=settings', icon: Settings },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { locale, setLocale, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const mounted = useIsMounted();
  const languages: Locale[] = ['en', 'ar', 'fr'];

  const currentTheme = mounted ? resolvedTheme : undefined;
  const isAuth = status === 'authenticated' && session;

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-[85] flex w-full max-w-sm flex-col bg-white dark:bg-espresso"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4 dark:border-cream/10">
              <Logo />
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full text-espresso transition-colors hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto p-6"
            >
              {isAuth ? (
                <motion.div variants={fadeUp} className="mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-espresso/5 dark:bg-cream/5">
                    {userInitials ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-caramel text-lg font-bold text-espresso">
                        {userInitials}
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-espresso/10 dark:bg-cream/10">
                        <User className="h-5 w-5 text-espresso dark:text-cream" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-espresso dark:text-cream truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-smoke-300 dark:text-cream/40 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    {session.user.role === 'ADMIN' && (
                      <Shield size={16} className="text-caramel" />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={fadeUp} className="mb-6 space-y-3">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-cream/20 text-cream font-medium transition-colors hover:bg-cream/10"
                  >
                    <LogIn size={18} />
                    {mounted ? t('auth.signIn') : 'Sign In'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-caramel text-espresso font-medium transition-colors hover:bg-caramel/90"
                  >
                    <UserCircle size={18} />
                    {mounted ? t('auth.createAccount') : 'Create Account'}
                  </Link>
                </motion.div>
              )}

              <div className="space-y-1">
                {navLinkItems.map((item) => (
                  <motion.div key={item.href} variants={fadeUp}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-espresso transition-colors hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5"
                    >
                      <item.icon size={20} className="text-caramel" />
                      {mounted ? t(item.key) : item.fallback}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {isAuth && (
                <>
                  <div className="my-4 border-t border-espresso/10 dark:border-cream/10" />
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <motion.div key={item.href} variants={fadeUp}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-espresso transition-colors hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5"
                        >
                          <item.icon size={20} className="text-caramel/70" />
                          {mounted ? t(item.key) : item.fallback}
                        </Link>
                      </motion.div>
                    ))}
                    {session?.user?.role === 'ADMIN' && (
                      <motion.div variants={fadeUp}>
                        <Link
                          href="/admin"
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-caramel transition-colors hover:bg-caramel/10"
                        >
                          <Shield size={20} />
                          {mounted ? t('nav.admin') : 'Admin Panel'}
                        </Link>
                      </motion.div>
                    )}
                    <motion.div variants={fadeUp}>
                      <button
                        onClick={() => {
                          onClose();
                          signOut({ callbackUrl: '/' });
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut size={20} />
                        {mounted ? t('auth.signOut') : 'Sign Out'}
                      </button>
                    </motion.div>
                  </div>
                </>
              )}

              <div className="mt-8 space-y-4">
                <motion.div variants={fadeUp}>
                  <div className="flex items-center gap-2 px-2 text-sm text-espresso/40 dark:text-cream/40 mb-3">
                    <Globe className="h-4 w-4" />
                    <span>{mounted ? t('nav.language') : 'Language'}</span>
                  </div>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLocale(lang)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          locale === lang
                            ? 'bg-caramel text-espresso shadow-lg shadow-caramel/25'
                            : 'bg-espresso/5 text-espresso hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream dark:hover:bg-cream/10'
                        }`}
                      >
                        {localeNames[lang]}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <div className="flex items-center gap-2 px-2 text-sm text-espresso/40 dark:text-cream/40 mb-3">
                    <Sun className="h-4 w-4" />
                    <span>{mounted ? t('nav.theme') : 'Theme'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        currentTheme === 'light'
                          ? 'bg-caramel text-espresso shadow-lg shadow-caramel/25'
                          : 'bg-espresso/5 text-espresso hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream dark:hover:bg-cream/10'
                      }`}
                    >
                      ☀️ {mounted ? t('theme.light') : 'Light'}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        currentTheme === 'dark'
                          ? 'bg-caramel text-espresso shadow-lg shadow-caramel/25'
                          : 'bg-espresso/5 text-espresso hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream dark:hover:bg-cream/10'
                      }`}
                    >
                      🌙 {mounted ? t('theme.dark') : 'Dark'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
