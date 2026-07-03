import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  color: string;
  bg: string;
  className?: string;
}

export function StatusBadge({ label, color, bg, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        bg,
        className
      )}
    >
      {label}
    </span>
  );
}
