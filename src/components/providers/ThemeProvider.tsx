'use client';

import { ThemeProvider as NextThemesProvider, type Attribute } from 'next-themes';
import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: Attribute | Attribute[];
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'origin-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      attribute={attribute}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}
