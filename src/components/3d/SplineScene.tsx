import { useState, useCallback } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useScene3dStore } from '@/stores/scene3dStore';

interface SplineSceneProps {
  /** URL to the .splinecode scene file. Defaults to the self-hosted public asset. */
  sceneUrl?: string;
  /** Additional class names applied to the wrapper container. */
  className?: string;
  /**
   * When true, renders at lower fidelity for reduced-3d capability tier.
   * Currently applies a 75% scale transform to reduce GPU fill rate.
   */
  reduced?: boolean;
}

/**
 * SplineScene — Core Spline component with:
 *   - Fixed fullscreen container (CLS-free: container dimensions set before scene loads)
 *   - Opacity fade-in transition (0 → 1 over 0.8s) on scene load
 *   - splineApp reference stored in scene3dStore for camera control (Plans 07-03/07-04)
 *   - Error handling: logs warning and marks sceneLoaded(false) on load failure
 *   - aria-hidden + pointer-events-none so clicks pass through to content layer
 *   - Spline's built-in mouse tracking provides parallax depth (uses global mousemove,
 *     not click events, so pointer-events-none does not break parallax)
 *   - reduced prop: scales canvas to 75% to lower GPU fill rate on reduced-3d devices
 *
 * Default sceneUrl points to public/3d-models/scene.splinecode (self-hosted).
 * If user has not yet exported their scene, the component handles load failure gracefully.
 */
export function SplineScene({
  sceneUrl = `${import.meta.env.BASE_URL}3d-models/scene.splinecode`,
  className = '',
  reduced = false,
}: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);
  const { setSplineApp, setSceneLoaded } = useScene3dStore.getState();

  const handleLoad = useCallback(
    (splineApp: Application) => {
      setSplineApp(splineApp);
      setSceneLoaded(true);
      setLoaded(true);
    },
    [setSplineApp, setSceneLoaded],
  );

  const handleError = useCallback(
    (error: unknown) => {
      console.warn(
        '[SplineScene] Failed to load 3D scene:',
        error,
        '\nIf you have not yet exported your scene from Spline, place the .splinecode file at public/3d-models/scene.splinecode',
      );
      setSceneLoaded(false);
    },
    [setSceneLoaded],
  );

  return (
    <div
      className={`fixed inset-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        // Opacity transitions from 0 → 1 once scene signals onLoad
        // The fixed-size container is rendered immediately, preventing CLS
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
        // Reduced-3d mode: 75% scale lowers GPU fill rate while keeping scene visible
        transform: reduced ? 'scale(0.75)' : undefined,
        transformOrigin: reduced ? 'center center' : undefined,
        // Clicks pass through to content layer beneath — Spline parallax uses
        // global mousemove so pointer-events:none does not break mouse tracking
        pointerEvents: 'none',
      }}
      // Purely decorative — screen readers should not announce this layer
      aria-hidden="true"
    >
      <Spline
        scene={sceneUrl}
        onLoad={handleLoad}
        onError={handleError}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SplineScene;
