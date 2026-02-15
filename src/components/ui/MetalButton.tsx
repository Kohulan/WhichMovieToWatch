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
  primary: 'metal-gradient metal-shadow metal-text',
  secondary: 'bg-metal-dark/30 metal-shadow text-clay-text',
  ghost: 'bg-transparent text-clay-text hover:bg-metal-base/20',
};

/* Default raised shadow */
const defaultShadow =
  '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
/* Pressed shadow */
const pressedShadow =
  '0 1px 2px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)';
/* Hover shadow */
const hoverShadow =
  '0 5px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)';

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
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={
        disabled
          ? undefined
          : isInteractive
            ? { y: -1, boxShadow: hoverShadow }
            : { y: -1 }
      }
      whileTap={
        disabled
          ? undefined
          : isInteractive
            ? { y: 1, boxShadow: pressedShadow }
            : { y: 1 }
      }
      animate={
        isInteractive ? { boxShadow: defaultShadow } : undefined
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
