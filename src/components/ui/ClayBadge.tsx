import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'muted';
type BadgeSize = 'sm' | 'md';

interface ClayBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-clay-surface text-clay-text',
  accent: 'bg-accent text-clay-base',
  muted: 'bg-clay-base text-clay-text-muted',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/**
 * ClayBadge — Small clay surface for labels, tags, and ratings.
 *
 * Compact clay element with subtle shadow and texture.
 * Supports default, accent, and muted variants in sm/md sizes.
 * Automatically adapts to theme via CSS variables.
 */
export function ClayBadge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: ClayBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-clay clay-shadow-sm clay-texture-subtle
        font-body font-medium
        relative overflow-hidden
        transition-colors duration-300
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </span>
  );
}
