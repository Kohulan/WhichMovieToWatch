// ScrollReveal — scroll-triggered or mount-triggered reveal animation (ANIM-02)
//
// When once=true (above-fold content): animates immediately on mount via initial+animate.
// When once=false (below-fold content): uses whileInView for scroll-triggered reveal with
// replay on scroll-back using shorter duration and reduced travel.

import { motion, type Variants } from 'motion/react';
import { useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel distance in px (default 80) */
  travel?: number;
  /** Delay before animation starts in seconds (default 0) */
  delay?: number;
  /** Only animate once — no replay on scroll-back (default false).
   *  When true, uses animate-on-mount instead of whileInView to avoid
   *  content staying invisible behind fixed backdrops. */
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

  const animationProps = once
    ? { initial: 'hidden' as const, animate: 'visible' as const }
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { amount: 0.2 },
      };

  return (
    <motion.div
      className={className}
      {...animationProps}
      variants={variants}
      onAnimationComplete={() => setHasAnimated(true)}
    >
      {children}
    </motion.div>
  );
}
