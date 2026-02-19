import { useState, useCallback, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useScene3dStore } from '@/stores/scene3dStore';
import { useSplineTheme } from '@/hooks/useSplineTheme';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { GyroscopeProvider } from './GyroscopeProvider';

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
 *   - useSplineTheme: syncs theme preset/mode to Spline lighting variables
 *   - Gyroscope parallax: CSS perspective transform driven by device tilt on mobile
 *   - GyroscopeProvider: permission prompt UI (only on touch mobile devices)
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
  const { setSplineApp, setSceneLoaded, setSceneError } = useScene3dStore.getState();

  // Sync theme preset and mode to Spline scene variables on every theme change.
  // Hook runs as side effect only — no rendering impact.
  useSplineTheme();

  // Gyroscope orientation for mobile parallax
  const { orientation, permissionState } = useDeviceOrientation();

  // Detect touch device (ref avoids re-renders)
  const isMobileRef = useRef(
    typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
  );

  // Spring-smoothed motion values for gyroscope parallax
  // useMotionValue feeds into useSpring for smooth easing
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const springRotateX = useSpring(rawRotateX, { stiffness: 50, damping: 20 });
  const springRotateY = useSpring(rawRotateY, { stiffness: 50, damping: 20 });

  // Map spring values to ±3 degrees of perspective tilt
  const tiltX = useTransform(springRotateX, [-1, 1], [3, -3]);
  const tiltY = useTransform(springRotateY, [-1, 1], [-3, 3]);

  // Update spring motion values when orientation changes (mobile with granted permission)
  // This runs on every render where orientation changes — intentional reactive update
  if (isMobileRef.current && permissionState === 'granted') {
    rawRotateX.set(orientation.betaNorm);
    rawRotateY.set(orientation.gammaNorm);
  }

  const handleLoad = useCallback(
    (splineApp: Application) => {
      setSplineApp(splineApp);
      setSceneLoaded(true);
      setSceneError(false);
      setLoaded(true);
    },
    [setSplineApp, setSceneLoaded, setSceneError],
  );

  const handleError = useCallback(
    (error: unknown) => {
      console.warn(
        '[SplineScene] Failed to load 3D scene:',
        error,
        '\nIf you have not yet exported your scene from Spline, place the .splinecode file at public/3d-models/scene.splinecode',
      );
      setSceneLoaded(false);
      setSceneError(true);
    },
    [setSceneLoaded, setSceneError],
  );

  // Whether to apply gyroscope perspective transform
  // Only on mobile with granted permission — desktop uses Spline's native mouse parallax
  const useGyroscopeParallax = isMobileRef.current && permissionState === 'granted';

  return (
    <>
      {/* Outer container: fixed fullscreen, CLS-free, opacity-controlled */}
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          width: '100vw',
          height: '100vh',
          // Opacity transitions from 0 → 1 once scene signals onLoad
          // The fixed-size container is rendered immediately, preventing CLS
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
          // Clicks pass through to content layer beneath — Spline parallax uses
          // global mousemove so pointer-events:none does not break mouse tracking
          pointerEvents: 'none',
        }}
        // Purely decorative — screen readers should not announce this layer
        aria-hidden="true"
      >
        {/*
          Gyroscope parallax wrapper (mobile only, granted permission):
          CSS perspective transform driven by device tilt.
          motion.div applies spring-smoothed rotateX/rotateY based on betaNorm/gammaNorm.

          On desktop: this is a static passthrough div (no transform applied).
          On mobile without permission: same — static passthrough.
          On mobile with permission: perspective 1000px + spring-eased ±3deg tilt.

          Reduced-3d scale is applied here too (75% to reduce GPU fill rate).
        */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            perspective: useGyroscopeParallax ? '1000px' : undefined,
            rotateX: useGyroscopeParallax ? tiltX : 0,
            rotateY: useGyroscopeParallax ? tiltY : 0,
            // Reduced-3d mode: 75% scale lowers GPU fill rate while keeping scene visible
            scale: reduced ? 0.75 : 1,
            transformOrigin: 'center center',
          }}
        >
          <Spline
            scene={sceneUrl}
            onLoad={handleLoad}
            onError={handleError}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      </div>

      {/*
        GyroscopeProvider: permission prompt UI for mobile users.
        Rendered as a sibling (outside the aria-hidden container) so it is accessible.
        This component is nested inside SplineScene, meaning:
          - fallback-2d devices never mount SplineScene → never see this prompt
          - The prompt only appears on full-3d / reduced-3d capable devices
      */}
      <GyroscopeProvider />
    </>
  );
}

export default SplineScene;
