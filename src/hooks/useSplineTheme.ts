import { useEffect } from 'react';
import { useThemeStore, type ColorPreset, type ThemeMode } from '@/stores/themeStore';
import { useScene3dStore } from '@/stores/scene3dStore';

/**
 * Lighting configuration per color preset.
 * These values are passed to the Spline scene's lighting variables when the user
 * switches theme presets via the RotaryDial.
 *
 * warm-orange: cinematic amber warmth (hue ~38°, mild saturation)
 * gold:        rich golden tones (hue ~80°, subtle saturation)
 * clean-white: neutral studio white (hue ~250°, near-zero saturation)
 */
const PRESET_LIGHTING: Record<ColorPreset, { hue: number; saturation: number }> = {
  'warm-orange': { hue: 38, saturation: 0.22 },
  'gold':        { hue: 80, saturation: 0.14 },
  'clean-white': { hue: 250, saturation: 0.003 },
};

/**
 * Lighting configuration per theme mode.
 * dark:  noir atmosphere — reduced intensity, isDarkMode flag for scene logic
 * light: bright studio — full intensity, light mode flag
 */
const MODE_LIGHTING: Record<ThemeMode, { intensity: number; isDarkMode: boolean }> = {
  'dark':  { intensity: 0.7, isDarkMode: true },
  'light': { intensity: 1.0, isDarkMode: false },
};

/**
 * useSplineTheme — Side-effect hook that synchronizes the app's theme preset and
 * mode to the Spline 3D scene via the scene's variable API.
 *
 * Subscribes to themeStore (preset, mode) and scene3dStore (splineApp).
 * When any of these change, pushes four variables into the Spline scene:
 *   - lightingHue        (number, 0-360)
 *   - lightingSaturation (number, 0-1)
 *   - lightingIntensity  (number, 0-1)
 *   - isDarkMode         (boolean)
 *
 * Error handling: Each setVariable call is wrapped in try/catch. Variables that
 * don't exist in the current .splinecode scene log a warning but do NOT crash.
 * This allows the hook to work before the final Spline scene design is complete.
 *
 * No return value — this is a pure side-effect hook.
 */
export function useSplineTheme(): void {
  const preset = useThemeStore((s) => s.preset);
  const mode = useThemeStore((s) => s.mode);
  const splineApp = useScene3dStore((s) => s.splineApp);

  useEffect(() => {
    // Guard: only run when Spline runtime is ready
    if (!splineApp) return;

    const presetValues = PRESET_LIGHTING[preset];
    const modeValues = MODE_LIGHTING[mode];

    const variables: Array<[string, number | boolean]> = [
      ['lightingHue', presetValues.hue],
      ['lightingSaturation', presetValues.saturation],
      ['lightingIntensity', modeValues.intensity],
      ['isDarkMode', modeValues.isDarkMode],
    ];

    for (const [name, value] of variables) {
      try {
        splineApp.setVariable(name, value);
        console.log(`[useSplineTheme] setVariable(${name}, ${value})`);
      } catch (err) {
        // Variable may not exist in the current .splinecode scene design — non-fatal
        console.warn(
          `[useSplineTheme] Failed to set Spline variable "${name}":`,
          err,
          '\nThis is expected if the .splinecode scene has not yet defined this variable.',
        );
      }
    }
  }, [preset, mode, splineApp]);
}
