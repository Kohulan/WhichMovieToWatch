import { useEffect, useRef } from 'react';
import { useThemeStore } from '../stores/themeStore';
import type { ColorPreset } from '../stores/themeStore';

const PRESET_CLASSES: ColorPreset[] = ['cinema-gold', 'ocean-blue', 'neon-purple'];
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function useTheme() {
  const { mode, preset, setMode, toggleMode, setPreset } = useThemeStore();
  const hasManuallyToggled = useRef(false);

  // On mount: detect system preference if first visit (no stored preferences)
  useEffect(() => {
    const stored = localStorage.getItem('theme-preferences');
    if (!stored) {
      const prefersDark =
        window.matchMedia && window.matchMedia(MEDIA_QUERY).matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, [setMode]);

  // Apply CSS classes to <html> whenever mode or preset changes
  useEffect(() => {
    const root = document.documentElement;

    // Toggle dark class
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Remove all preset classes, then add the current one
    for (const p of PRESET_CLASSES) {
      root.classList.remove(`theme-${p}`);
    }
    root.classList.add(`theme-${preset}`);
  }, [mode, preset]);

  // Listen for system preference changes (only if user hasn't manually toggled)
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      if (!hasManuallyToggled.current) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [setMode]);

  // Wrap toggleMode to track manual toggles
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
