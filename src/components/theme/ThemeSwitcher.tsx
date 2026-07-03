'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useIsMounted } from '@/hooks/useIsMounted';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {mounted
          ? resolvedTheme === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode'
          : 'Toggle theme'}
      </span>
    </IconButton>
  );
}
