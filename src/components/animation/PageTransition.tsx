// Centralized page transition variants for route animations
//
// AnimatePresence mode="sync" — both entering and exiting pages are in the DOM
// simultaneously. The exiting page is positioned absolutely so it doesn't push
// the entering page down. This avoids a known motion library bug where
// mode="wait" gets stuck on rapid state changes (e.g. fast service switching
// on Dinner Time), permanently blocking the entering page from mounting.

import type { Transition, Variants } from "motion/react";

/**
 * Shared exit style for sync-mode transitions.
 * Absolute positioning removes the exiting page from normal flow so the
 * entering page renders at the correct position. pointerEvents:'none'
 * prevents the fading-out page from intercepting clicks.
 */
const syncExit = {
  opacity: 0,
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  zIndex: 0,
  pointerEvents: "none" as const,
};

/**
 * pageVariants — Combined fade + slide-up + scale enter with sync-safe exit.
 *
 * - initial: slight scale-down + translate-up + fade — page enters from just below
 * - animate: natural position, full opacity, natural scale
 * - exit: fade-out with absolute positioning (sync mode)
 *
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
  exit: syncExit,
};

/**
 * pageTransition — Premium cubic-bezier easing for page transitions.
 * 300ms with smooth deceleration. Used for fallback-2d mode.
 */
export const pageTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * pageVariants3D — Fade-only variant for when 3D camera provides spatial movement.
 *
 * When the Spline camera does a lateral track or dolly push during navigation,
 * competing slide/scale transforms create visual noise. These variants use
 * pure opacity fade so the camera provides all spatial feedback.
 */
export const pageVariants3D: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: syncExit,
};

/**
 * pageTransition3D — Fade timing for 3D-active mode.
 * 0.25s easeInOut — faster than camera's 0.4s so content fades in
 * while the camera is still completing its cinematic movement.
 */
export const pageTransition3D: Transition = {
  duration: 0.25,
  ease: "easeInOut",
};
