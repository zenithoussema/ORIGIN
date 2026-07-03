import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      children,
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-caramel text-espresso hover:bg-caramel/90 shadow-lg shadow-caramel/25': variant === 'primary',
            'bg-espresso text-cream hover:bg-espresso/90 dark:bg-cream dark:text-espresso dark:hover:bg-cream/90': variant === 'secondary',
            'border-2 border-caramel text-caramel hover:bg-caramel hover:text-espresso': variant === 'outline',
            'text-caramel hover:bg-caramel/10': variant === 'ghost',
            'text-caramel underline-offset-4 hover:underline': variant === 'link',
            'bg-caramel/10 text-caramel hover:bg-caramel/20 rounded-full': variant === 'pill',
          },
          {
            'h-9 px-4 text-sm gap-2': size === 'sm',
            'h-11 px-6 text-base gap-2.5': size === 'md',
            'h-14 px-8 text-lg gap-3': size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {leftIcon && <span className="mr-2 inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2 inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
