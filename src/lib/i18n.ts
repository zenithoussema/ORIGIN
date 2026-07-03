export type Locale = 'en' | 'ar' | 'fr';

export const locales: Locale[] = ['en', 'ar', 'fr'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
};

export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export async function getMessages(locale: Locale) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/en.json`)).default;
  }
}
