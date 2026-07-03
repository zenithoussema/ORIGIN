import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-3xl',
};

export function ProfileAvatar({ name, size = 'lg', className }: ProfileAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-caramel to-caramel/80 font-heading font-bold text-white shadow-lg shadow-caramel/25',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
