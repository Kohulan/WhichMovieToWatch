import { SplineScene } from "./SplineScene";
import { useThemeStore, type ThemeMode } from "@/stores/themeStore";

const SCENE_URLS: Record<ThemeMode, string> = {
  dark: "https://prod.spline.design/2fWjKvs9eEHSzk0P/scene.splinecode",
  light: "https://prod.spline.design/uc2Zl43KCHmTStn5/scene.splinecode",
};

interface SplineHeroProps {
  /**
   * When true, renders the scene at reduced fidelity (75% scale).
   * Passed by AppShell when capability === 'reduced-3d'.
   */
  reduced?: boolean;
}

/**
 * SplineHero — Thin default-exported wrapper around SplineScene.
 *
 * This component is the lazy-loading boundary entry point.
 * AppShell imports it via React.lazy:
 *   const LazySplineHero = lazy(() => import('@/components/3d/SplineHero'));
 *
 * SplineHero does NOT itself use React.lazy — AppShell owns the lazy boundary.
 * This component exists as a separate default export so React.lazy can load it
 * as a standalone chunk (the spline-vendor chunk from vite.config.ts).
 *
 * Scene URL is mode-dependent — dark and light each have their own .splinecode
 * scene. Keying SplineScene on the URL ensures React fully unmounts the old
 * WebGL context and mounts a fresh scene when the user toggles mode.
 */
export default function SplineHero({ reduced = false }: SplineHeroProps) {
  const mode = useThemeStore((s) => s.mode);
  const sceneUrl = SCENE_URLS[mode];

  return <SplineScene key={sceneUrl} sceneUrl={sceneUrl} reduced={reduced} />;
}
