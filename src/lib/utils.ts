import { clsx, type ClassValue } from 'clsx';
import { CURRENCY_CODE, CURRENCY_LOCALE, CURRENCY_DECIMALS } from '@/lib/currency';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatPrice(price: number, currency: string = CURRENCY_CODE): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: CURRENCY_DECIMALS,
    maximumFractionDigits: CURRENCY_DECIMALS,
  }).format(price);
}

export function getImageUrl(path: string): string {
  return path.startsWith('http') ? path : `/images${path}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
