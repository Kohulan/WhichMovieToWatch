import { useEffect } from "react";
import { useLocation } from "react-router";
import { useScene3dStore } from "@/stores/scene3dStore";

/**
 * Route → camera state mapping.
 *
 * Each route maps to a named camera state in the Spline scene.
 * The Spline scene must define these camera states for transitions to fire.
 * If a camera state doesn't exist in the scene, triggerCameraTransition
 * catches the error gracefully and logs a warning.
 *
 * Lateral track movement: sibling pages (trending, dinner-time, free-movies)
 * use different horizontal camera positions for a side-scrolling studio feel.
 * Dolly push movement: home → feature page uses a forward camera push.
 */
const ROUTE_CAMERA_MAP: Record<string, string> = {
  "/": "home-view",
  "/discover": "discover-view",
  "/trending": "trending-view",
  "/dinner-time": "dinner-view",
  "/free-movies": "free-view",
};

/**
 * CameraTransitionManager — Renderless component that watches react-router
 * location changes and triggers Spline camera state transitions.
 *
 * This component returns null — it has no visual output.
 * It is rendered by AppShell only when 3D is active (capability !== 'fallback-2d'
 * AND sceneLoaded is true) so transitions only fire when the Spline canvas is ready.
 *
 * The Framer Motion page transition (content fade) and Spline camera movement
 * are intentionally separate concerns:
 *   - Camera:  lateral track or dolly push (400ms EASE_IN_OUT) — spatial context
 *   - Content: simple fade-only (300ms easeInOut)   — content reveal
 *
 * Content fades in while camera is still settling → layered cinematic feel.
 */
export default function CameraTransitionManager() {
  const location = useLocation();
  const { currentCameraState, triggerCameraTransition } = useScene3dStore();

  useEffect(() => {
    const targetState = ROUTE_CAMERA_MAP[location.pathname] ?? "home-view";

    // Only fire transition when route actually maps to a different camera state
    if (targetState !== currentCameraState) {
      triggerCameraTransition(targetState);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  // currentCameraState and triggerCameraTransition are stable store refs,
  // intentionally excluded to avoid re-triggering on store updates mid-transition.

  // Renderless — no DOM output
  return null;
}
