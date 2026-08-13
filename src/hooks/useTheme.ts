import { useEffect, useRef } from "react";
import { useThemeStore, type ColorPreset } from "@/stores/themeStore";

const PRESET_CLASSES: ColorPreset[] = ["warm-orange", "gold", "clean-white"];
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function useTheme() {
  const { mode, preset, setMode, toggleMode, setPreset } = useThemeStore();
  const hasManuallyToggled = useRef(false);

  // On mount: detect system preference if first visit (no stored preferences)
  useEffect(() => {
    const stored = localStorage.getItem("theme-preferences");
    if (!stored) {
      const prefersDark =
        window.matchMedia && window.matchMedia(MEDIA_QUERY).matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, [setMode]);

  const isInitialMount = useRef(true);

  // Apply CSS classes to <html> whenever mode or preset changes
  useEffect(() => {
    const root = document.documentElement;

    // Only enable smooth transition on user-initiated changes, not initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      root.classList.add("theme-transitioning");
    }
    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 550);

    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    for (const p of PRESET_CLASSES) {
      root.classList.remove(`theme-${p}`);
    }
    root.classList.add(`theme-${preset}`);

    return () => clearTimeout(timer);
  }, [mode, preset]);

  // Listen for system preference changes (only if user hasn't manually toggled)
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      if (!hasManuallyToggled.current) {
        setMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [setMode]);

  const handleToggleMode = () => {
    hasManuallyToggled.current = true;
    toggleMode();
  };

  return {
    mode,
    preset,
    toggleMode: handleToggleMode,
    setPreset,
    setMode,
  };
}
