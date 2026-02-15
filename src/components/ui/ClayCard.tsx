import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type ClayCardElement = 'div' | 'section' | 'article';

interface ClayCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  as?: ClayCardElement;
}

/**
 * ClayCard — Elevated clay surface component with hover/press animations and texture.
 *
 * Renders a puffy 3D clay card with visible plasticine grain texture,
 * layered shadows for depth, and spring-physics hover/press interactions.
 * Automatically adapts to active theme preset and light/dark mode via CSS variables.
 */
export function ClayCard({
  children,
  className = '',
  elevated = true,
  as = 'div',
}: ClayCardProps) {
  const MotionComponent = motion[as] as React.ComponentType<HTMLMotionProps<typeof as>>;

  const shadowClass = elevated ? 'clay-shadow-lg' : 'clay-shadow-sm';

  return (
    <MotionComponent
      className={`bg-clay-surface rounded-clay-lg clay-texture ${shadowClass} relative overflow-hidden transition-colors duration-300 ${className}`}
      whileHover={{
        y: -2,
        boxShadow:
          '20px 20px 40px var(--clay-shadow), inset -8px -8px 16px rgba(0,0,0,0.12), inset 0 10px 20px var(--clay-highlight)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{
        y: 1,
        scale: 0.98,
        boxShadow:
          '8px 8px 16px var(--clay-shadow), inset -4px -4px 8px rgba(0,0,0,0.08), inset 0 4px 8px var(--clay-highlight)',
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
    >
      <div className="relative z-10">{children}</div>
    </MotionComponent>
  );
}
