import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      children,
      size = 'md',
      variant = 'ghost',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel focus-visible:ring-offset-2',
          {
            'h-9 w-9 text-sm': size === 'sm',
            'h-11 w-11 text-base': size === 'md',
            'h-14 w-14 text-lg': size === 'lg',
          },
          {
            'text-espresso hover:bg-espresso/10 dark:text-cream dark:hover:bg-cream/10': variant === 'ghost',
            'border border-espresso/20 dark:border-cream/20 text-espresso hover:bg-espresso/10 dark:text-cream dark:hover:bg-cream/10': variant === 'outline',
            'bg-caramel text-espresso hover:bg-caramel/90 shadow-lg shadow-caramel/25': variant === 'solid',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
