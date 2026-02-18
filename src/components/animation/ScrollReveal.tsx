// ScrollReveal — whileInView wrapper with replay-aware animation (ANIM-02)
//
// First appearance: full animation (60-100px travel, 0.6s duration)
// Re-entry (after initial reveal): shorter duration (0.3s) and reduced travel (40%)
// This satisfies the "replay on scroll-back with shorter duration" user decision.

import { motion, type Variants } from 'motion/react';
import { useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel distance in px (default 80) */
  travel?: number;
  /** Delay before animation starts in seconds (default 0) */
  delay?: number;
  /** Only animate once — no replay on scroll-back (default false) */
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  travel = 80,
  delay = 0,
  once = false,
}: ScrollRevealProps) {
  // Track first-seen state to adjust re-entry animation duration and travel
  const [hasAnimated, setHasAnimated] = useState(false);

  // First appearance: full animation. Re-entries: shorter/subtler
  const duration = hasAnimated ? 0.3 : 0.6;
  const actualTravel = hasAnimated ? travel * 0.4 : travel;

  const variants: Variants = {
    hidden: { opacity: 0, y: actualTravel },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.2, once }}
      variants={variants}
      onAnimationComplete={() => setHasAnimated(true)}
    >
      {children}
    </motion.div>
  );
}
