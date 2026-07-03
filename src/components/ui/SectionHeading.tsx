import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12 space-y-4',
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
        },
        className
      )}
    >
      <h2
        className={cn(
          'font-playfair text-3xl font-bold tracking-tight text-espresso dark:text-cream sm:text-4xl lg:text-5xl',
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-lg text-espresso/60 dark:text-cream/60',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          'h-1 w-20 rounded-full bg-caramel',
          {
            'mx-auto': align === 'center',
            'ml-0': align === 'left',
            'mr-0 ml-auto': align === 'right',
          }
        )}
      />
    </div>
  );
}
