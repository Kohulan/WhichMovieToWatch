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
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

/** Builds a 4-layer claymorphism box-shadow: outer depth, outer highlight, inner depth, inner highlight. */
function buildClayShadow(
  outerDark: [number, number, number],
  outerLight: [number, number, number],
  innerDark: [number, number, number],
  innerLight: [number, number, number],
): string {
  const [odS, odB, odA] = outerDark;
  const [olS, olB, olA] = outerLight;
  const [idS, idB, idA] = innerDark;
  const [ilS, ilB, ilA] = innerLight;
  return [
    `${odS}px ${odS}px ${odB}px rgba(0,0,0,${odA})`,
    `-${olS}px -${olS}px ${olB}px rgba(255,255,255,${olA})`,
    `inset -${idS}px -${idS}px ${idB}px rgba(0,0,0,${idA})`,
    `inset ${ilS}px ${ilS}px ${ilB}px rgba(255,255,255,${ilA})`,
  ].join(', ');
}

/* Claymorphism shadows — puffy 3D with inner highlight + outer depth */
const clayShadow: Record<MetalButtonVariant, { rest: string; hover: string; tap: string }> = {
  primary: {
    rest:  buildClayShadow([5, 10, 0.20], [2, 6, 0.06], [2, 5, 0.15], [2, 5, 0.25]),
    hover: buildClayShadow([7, 14, 0.25], [3, 8, 0.08], [2, 5, 0.12], [3, 6, 0.30]),
    tap:   buildClayShadow([2,  4, 0.12], [0, 0, 0.00], [4, 8, 0.20], [2, 4, 0.15]),
  },
  secondary: {
    rest:  buildClayShadow([4,  8, 0.18], [2, 5, 0.05], [2, 4, 0.12], [2, 4, 0.18]),
    hover: buildClayShadow([6, 12, 0.22], [3, 7, 0.07], [2, 4, 0.10], [3, 5, 0.22]),
    tap:   buildClayShadow([1,  3, 0.10], [0, 0, 0.00], [3, 6, 0.18], [2, 4, 0.12]),
  },
  ghost: {
    rest:  buildClayShadow([3, 6, 0.12], [1, 4, 0.04], [1, 3, 0.08], [1, 3, 0.12]),
    hover: buildClayShadow([4, 8, 0.16], [2, 5, 0.06], [1, 3, 0.06], [2, 4, 0.16]),
    tap:   buildClayShadow([1, 2, 0.08], [0, 0, 0.00], [2, 5, 0.14], [1, 3, 0.10]),
  },
};

const variantClasses: Record<MetalButtonVariant, string> = {
  primary: 'bg-accent text-white font-semibold',
  secondary: 'bg-clay-surface text-clay-text font-semibold',
  ghost: 'bg-clay-elevated/70 text-clay-text-muted font-medium',
};

export function MetalButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}: MetalButtonProps) {
  const shadow = clayShadow[variant];

  return (
    <motion.button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-2xl
        cursor-pointer select-none
        inline-flex items-center justify-center gap-2
        transition-colors duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ boxShadow: shadow.rest, ...style }}
      whileHover={
        disabled
          ? undefined
          : {
              y: -2,
              scale: 1.02,
              boxShadow: shadow.hover,
              transition: { type: 'spring', stiffness: 400, damping: 20 },
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              y: 1,
              scale: 0.97,
              boxShadow: shadow.tap,
              transition: { type: 'spring', stiffness: 500, damping: 25 },
            }
      }
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
