'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { localeNames, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: Locale[] = ['en', 'ar', 'fr'];

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-5 w-5" />
      </IconButton>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-espresso/10 bg-white p-2 shadow-xl dark:border-cream/10 dark:bg-espresso"
        >
          {languages.map((lang) => (
            <button
              key={lang}
              role="option"
              aria-selected={locale === lang}
              onClick={() => {
                setLocale(lang);
                setIsOpen(false);
              }}
              className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                locale === lang
                  ? 'bg-caramel text-espresso font-medium'
                  : 'text-espresso hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5'
              }`}
            >
              {localeNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
