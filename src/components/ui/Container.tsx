import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full px-4 sm:px-6 lg:px-8',
          {
            'max-w-3xl': size === 'sm',
            'max-w-5xl': size === 'md',
            'max-w-7xl': size === 'lg',
            'max-w-[1400px]': size === 'xl',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };
