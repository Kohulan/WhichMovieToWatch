import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * MotionProvider — Global MotionConfig wrapper with reducedMotion="user".
 *
 * When the user has enabled prefers-reduced-motion in their OS settings,
 * all Framer Motion transform and layout animations (x, y, scale, rotate,
 * layoutId morphs) are automatically disabled. Opacity and color transitions
 * remain active for graceful degradation. This is the single entry point
 * for accessibility compliance across all animation components. (ANIM-05, A11Y-05)
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
