import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type MetalButtonVariant = 'primary' | 'secondary' | 'ghost';
type MetalButtonSize = 'sm' | 'md' | 'lg';

interface MetalButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: MetalButtonVariant;
  size?: MetalButtonSize;
  children: ReactNode;
}

const sizeClasses: Record<MetalButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const variantStyles: Record<MetalButtonVariant, string> = {
  primary: 'metal-gradient metal-shadow metal-text metal-brushed relative overflow-hidden',
  secondary: 'bg-metal-dark/30 metal-shadow text-clay-text relative overflow-hidden',
  ghost: 'bg-transparent text-clay-text hover:bg-metal-base/20',
};

/* Multi-layer realistic shadows */
const defaultShadow =
  'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)';
const pressedShadow =
  'inset 0 2px 6px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 1px rgba(0,0,0,0.1)';
const hoverShadow =
  'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.08)';

export function MetalButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: MetalButtonProps) {
  const isInteractive = variant !== 'ghost';

  return (
    <motion.button
      className={`
        ${variantStyles[variant]}
        ${sizeClasses[size]}
        rounded-lg font-body font-semibold
        cursor-pointer select-none
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={
        disabled
          ? undefined
          : isInteractive
            ? { y: -2, boxShadow: hoverShadow, scale: 1.01 }
            : { y: -1 }
      }
      whileTap={
        disabled
          ? undefined
          : isInteractive
            ? { y: 1, boxShadow: pressedShadow, scale: 0.98 }
            : { y: 1 }
      }
      animate={
        isInteractive ? { boxShadow: defaultShadow } : undefined
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
