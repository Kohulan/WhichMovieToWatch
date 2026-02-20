// Signature SVG path-draw animations for Love, Watched, and Not Interested action icons.
// Each icon plays a unique animation when the action is triggered.
// ANIM-03: micro-interaction animations for action buttons.

import { motion } from "motion/react";

interface AnimatedIconProps {
  /** When true, plays the animation sequence. When false, renders a static icon. */
  animate: boolean;
  className?: string;
}

/**
 * HeartPulseIcon — Used for the Love action.
 *
 * Animation sequence:
 *   1. Heart path draws from pathLength 0 to 1 (0.4s)
 *   2. SVG scales [1, 1.3, 1] — heart "pulses" after drawing (0.5s, spring bounce)
 *
 * Spring stiffness 400, damping 15 for energetic bounce feel.
 */
export function HeartPulseIcon({ animate, className }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      animate={animate ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={
        animate
          ? {
              duration: 0.5,
              times: [0, 0.5, 1],
              type: "spring",
              stiffness: 400,
              damping: 15,
            }
          : { duration: 0 }
      }
    >
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={
          animate ? { duration: 0.4, ease: "easeOut" } : { duration: 0 }
        }
      />
    </motion.svg>
  );
}

/**
 * CheckDrawIcon — Used for the Watched action.
 *
 * Animation sequence:
 *   Checkmark path draws from pathLength 0 to 1 (0.4s, easeOut).
 *   Clean, decisive stroke that signals completion.
 */
export function CheckDrawIcon({ animate, className }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={
          animate ? { duration: 0.4, ease: "easeOut" } : { duration: 0 }
        }
      />
    </motion.svg>
  );
}

/**
 * XSlideIcon — Used for the Not Interested / Skip action.
 *
 * Animation sequence:
 *   1. Both X lines draw simultaneously from pathLength 0 to 1 (0.3s)
 *   2. Entire SVG slides right and snaps back: x [0, 8, 0] with spring — quick dismissal feel
 *
 * Spring stiffness 350, damping 22 for crisp snap with minimal overshoot.
 */
export function XSlideIcon({ animate, className }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      animate={animate ? { x: [0, 8, 0] } : { x: 0 }}
      transition={
        animate
          ? {
              duration: 0.4,
              times: [0, 0.5, 1],
              type: "spring",
              stiffness: 350,
              damping: 22,
            }
          : { duration: 0 }
      }
    >
      <motion.line
        x1={18}
        y1={6}
        x2={6}
        y2={18}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={
          animate ? { duration: 0.3, ease: "easeOut" } : { duration: 0 }
        }
      />
      <motion.line
        x1={6}
        y1={6}
        x2={18}
        y2={18}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={
          animate
            ? { duration: 0.3, ease: "easeOut", delay: 0.05 }
            : { duration: 0 }
        }
      />
    </motion.svg>
  );
}
