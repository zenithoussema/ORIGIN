import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <span
      className={cn(
        'font-playfair font-bold tracking-wider text-caramel',
        {
          'text-xl': size === 'sm',
          'text-2xl': size === 'md',
          'text-3xl': size === 'lg',
        },
        className
      )}
    >
      ORIGIN
    </span>
  );
}
