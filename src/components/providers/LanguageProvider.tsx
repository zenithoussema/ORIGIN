'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from 'react';

import { type Locale, defaultLocale, isRTL, locales } from '@/lib/i18n';

import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';
import arMessages from '@/messages/ar.json';

const messagesMap = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return defaultLocale;
    const saved = localStorage.getItem('origin-locale') as Locale | null;
    return saved && locales.includes(saved) ? saved : defaultLocale;
  });

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const messages = useMemo(() => {
    return messagesMap[locale] ?? messagesMap.en;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('origin-locale', newLocale);
  }, []);

  const t = useCallback(
    (key: string) => {
      return getNestedValue(messages, key) ?? key;
    },
    [messages]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isRTL: isRTL(locale),
      mounted,
    }),
    [locale, setLocale, t, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}