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
 * Used for fallback-2d mode when no 3D camera provides spatial movement.
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
 * Used for fallback-2d mode.
 */
export const pageTransition: Transition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * pageVariants3D — Simplified fade-only variant for when 3D camera provides spatial movement.
 *
 * When the Spline camera does a lateral track or dolly push during navigation,
 * competing slide/scale transforms on the page content create visual noise.
 * These variants strip motion down to a pure opacity fade so the camera movement
 * provides all the spatial feedback — content just fades cleanly in/out.
 *
 * Duration 0.3s is intentionally faster than the camera's 0.4s transition:
 * content fades in while the camera is still settling, creating a layered
 * cinematic feel (spatial context first, then content reveals).
 */
export const pageVariants3D: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * pageTransition3D — Fade timing for 3D-active mode.
 *
 * 0.3s easeInOut — slightly faster than camera's 0.4s so content fades in
 * while the camera is still completing its cinematic movement.
 */
export const pageTransition3D: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};
