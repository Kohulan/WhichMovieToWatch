import type { ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "muted";
type BadgeSize = "sm" | "md";

interface ClayBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-white/[0.08] backdrop-blur-sm border border-white/10 text-clay-text",
  accent: "bg-accent/80 text-white border border-accent/20",
  muted: "bg-clay-surface/70 text-clay-text border border-white/15",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

/**
 * ClayBadge — Glassmorphic badge for labels, tags, and ratings.
 */
export function ClayBadge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: ClayBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        font-body font-medium
        transition-colors duration-300
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
