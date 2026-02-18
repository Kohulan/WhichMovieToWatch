// StaggerContainer + StaggerItem — parent/child staggered entrance animation (ANIM-02)
//
// StaggerContainer: whileInView wrapper that triggers staggered entrance for all children.
// StaggerItem: child component that inherits timing from the parent via variants propagation.
//
// Key pattern: StaggerItem does NOT set its own initial/whileInView — it relies entirely
// on the parent StaggerContainer's variants propagation. This is standard Framer Motion
// stagger choreography.

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
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.15 }}
      variants={containerVariants}
      custom={stagger}
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
