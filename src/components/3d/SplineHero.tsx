import { SplineScene } from './SplineScene';

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
 * Hero-specific logic (camera state management, route-based camera transitions)
 * will be added here in Plans 07-03 and 07-04.
 */
export default function SplineHero({ reduced = false }: SplineHeroProps) {
  return <SplineScene reduced={reduced} />;
}
