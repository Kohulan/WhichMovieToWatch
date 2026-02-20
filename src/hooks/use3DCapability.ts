import { useGpuTier } from "./useGpuTier";

/**
 * Capability enum for 3D rendering decisions:
 *   'full-3d'     — Desktop tier 2+ or any tier 3: full Spline scene
 *   'reduced-3d'  — Mobile tier 2: reduced-quality Spline scene
 *   'fallback-2d' — Low GPU (tier 0-1), no WebGL, or prefers-reduced-motion: CSS parallax only
 */
export type Capability = "full-3d" | "reduced-3d" | "fallback-2d";

export interface CapabilityResult {
  capability: Capability;
  loading: boolean;
  tier: number;
}

/**
 * Checks if WebGL (v2 or v1) is available in the current browser.
 * A missing WebGL context means 3D scenes cannot render — force fallback.
 */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const webgl2 = canvas.getContext("webgl2");
    if (webgl2) return true;
    const webgl1 = canvas.getContext("webgl");
    return webgl1 !== null;
  } catch {
    return false;
  }
}

/**
 * use3DCapability — Combines GPU tier + WebGL availability + prefers-reduced-motion
 * into a single Capability classification for use across the 3D experience layer.
 *
 * Classification logic:
 *   1. prefers-reduced-motion: reduce  -> 'fallback-2d' (accessibility override)
 *   2. WebGL unavailable               -> 'fallback-2d' (no 3D possible)
 *   3. GPU tier 0-1                    -> 'fallback-2d' (device too slow)
 *   4. GPU tier 2 + mobile             -> 'reduced-3d'  (mid-range phone)
 *   5. GPU tier 2 + desktop            -> 'full-3d'     (capable desktop)
 *   6. GPU tier 3 (any device)         -> 'full-3d'     (high-end)
 */
export function use3DCapability(): CapabilityResult {
  const { tier, isMobile, loading } = useGpuTier();

  // While GPU detection is in progress, report as loading
  // Capability will be determined once detection completes
  if (loading) {
    return { capability: "fallback-2d", loading: true, tier: 0 };
  }

  // Accessibility: user prefers reduced motion — always fallback
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    return { capability: "fallback-2d", loading: false, tier };
  }

  // WebGL check: without WebGL, Spline cannot render
  const hasWebGL = checkWebGLSupport();
  if (!hasWebGL) {
    return { capability: "fallback-2d", loading: false, tier };
  }

  // GPU tier classification
  if (tier <= 1) {
    return { capability: "fallback-2d", loading: false, tier };
  }

  if (tier === 2 && isMobile) {
    return { capability: "reduced-3d", loading: false, tier };
  }

  // tier 2 desktop or tier 3 (any device)
  return { capability: "full-3d", loading: false, tier };
}
