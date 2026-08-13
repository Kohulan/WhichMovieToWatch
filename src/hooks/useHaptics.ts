// Lightweight haptic vibration feedback for mobile devices
// Gracefully degrades on desktop / non-supporting browsers

import { useCallback } from "react";

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning";

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 22,
  heavy: 40,
  success: [12, 40, 18],
  warning: [25, 40, 25],
};

export function useHaptics() {
  const trigger = useCallback((style: HapticStyle = "light") => {
    if (typeof window === "undefined" || !("navigator" in window)) return;
    if (typeof navigator.vibrate !== "function") return;

    try {
      const pattern = HAPTIC_PATTERNS[style];
      navigator.vibrate(pattern);
    } catch {
      // Ignore errors on restricted devices/browsers
    }
  }, []);

  return { trigger };
}
