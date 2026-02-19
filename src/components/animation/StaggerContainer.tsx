// StaggerContainer + StaggerItem — parent/child staggered entrance animation (ANIM-02)
//
// StaggerContainer: animate-on-mount wrapper that triggers staggered entrance for all children.
// StaggerItem: child component that inherits timing from the parent via variants propagation.
//
// Key pattern: StaggerItem does NOT set its own initial/animate — it relies entirely
// on the parent StaggerContainer's variants propagation. This is standard Framer Motion
// stagger choreography.
//
// Uses initial="hidden" + animate="visible" (NOT whileInView) so the stagger animation
// fires immediately on mount. This avoids a race condition where content stays at opacity:0
// because the Intersection Observer doesn't fire reliably during page transitions —
// particularly on pages with fixed full-viewport backdrops that render opaque while
// animated content is still invisible.

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

// Direction-based child variants map
const childVariantsMap = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
  left: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
  right: {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
} as const;

export { childVariantsMap };

// Container variants use custom prop for dynamic stagger value
const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1,
    },
  }),
};

// --- StaggerContainer ---

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between children in seconds (default 0.08) */
  stagger?: number;
  /** Entrance direction for children (default 'up') */
  direction?: 'up' | 'left' | 'right';
  /** ARIA role attribute */
  role?: string;
  /** ARIA label attribute */
  'aria-label'?: string;
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  role,
  'aria-label': ariaLabel,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      custom={stagger}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

// --- StaggerItem ---

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Entrance direction — must match or be compatible with parent StaggerContainer direction */
  direction?: 'up' | 'left' | 'right';
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
}: StaggerItemProps) {
  // Use variants prop (not initial/animate) so child inherits timing from parent StaggerContainer
  return (
    <motion.div
      className={className}
      variants={childVariantsMap[direction]}
    >
      {children}
    </motion.div>
  );
}
