// Centralized page transition variants for route animations

import type { Transition, Variants } from 'motion/react';

/**
 * pageVariants — Combined fade + slide-up + scale variant for cinematic page transitions.
 *
 * - initial: slight scale-down + translate-up + fade-out — page enters from just below
 * - animate: natural position, full opacity, natural scale
 * - exit: slight scale-up + translate further up + fade-out — page departs upward
 *
 * Duration locked at 350ms (within 300-450ms range per ANIM-01 decision).
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.99,
  },
};

/**
 * pageTransition — Premium cubic-bezier easing for page transitions.
 *
 * 350ms with [0.25, 0.1, 0.25, 1] cubic-bezier — smooth deceleration into resting state.
 */
export const pageTransition: Transition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};
