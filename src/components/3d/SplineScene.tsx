import { useState, useCallback, useRef, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useScene3dStore } from '@/stores/scene3dStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSplineTheme } from '@/hooks/useSplineTheme';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { GyroscopeProvider } from './GyroscopeProvider';

interface SplineSceneProps {
  sceneUrl?: string;
  className?: string;
  reduced?: boolean;
}

/**
 * Pre-validates the .splinecode file before mounting Spline.
 * For local files: fetches first 16 bytes to detect ASCII placeholder vs real binary.
 * For remote URLs (CDN): assumes valid — let the Spline component handle errors.
 */
async function validateSceneFile(url: string): Promise<boolean> {
  // Remote CDN URLs (prod.spline.design, etc.) — trust them, skip byte check
  if (url.startsWith('http://') || url.startsWith('https://')) return true;

  try {
    const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-15' } });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 4) return false;
    // Check if the response starts with ASCII text (our placeholder)
    const firstBytes = new Uint8Array(buf);
    const isAsciiText = firstBytes.every((b) => b >= 0x20 && b < 0x7f);
    return !isAsciiText; // Binary = valid scene, ASCII text = placeholder
  } catch {
    return false;
  }
}

export function SplineScene({
  sceneUrl = 'https://prod.spline.design/2fWjKvs9eEHSzk0P/scene.splinecode',
  className = '',
  reduced = false,
}: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);
  // null = checking, true = valid binary scene, false = placeholder/missing
  const [sceneValid, setSceneValid] = useState<boolean | null>(null);

  // Validate scene file before attempting to mount Spline.
  // Prevents the crash cascade from invalid/placeholder .splinecode files.
  useEffect(() => {
    let cancelled = false;
    validateSceneFile(sceneUrl).then((valid) => {
      if (cancelled) return;
      setSceneValid(valid);
      if (!valid) {
        useScene3dStore.getState().setSceneError(true);
      }
    });
    return () => { cancelled = true; };
  }, [sceneUrl]);

  // Deferred loading: Spline not instantiated until browser is idle + scene is validated.
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (sceneValid !== true) return; // Only defer-load when scene is validated
    let id: number | ReturnType<typeof setTimeout>;
    if ('requestIdleCallback' in window) {
      id = requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 });
    } else {
      id = setTimeout(() => setShouldLoad(true), 1000);
    }
    return () => {
      if ('requestIdleCallback' in window) cancelIdleCallback(id as number);
      else clearTimeout(id as ReturnType<typeof setTimeout>);
    };
  }, [sceneValid]);

  // Cleanup: dispose WebGL context on unmount
  useEffect(() => {
    return () => {
      const app = useScene3dStore.getState().splineApp;
      if (app) {
        try { app.dispose(); } catch { /* WebGL context may already be lost */ }
        useScene3dStore.getState().setSplineApp(null);
      }
    };
  }, []);

  const { setSplineApp, setSceneLoaded, setSceneError } = useScene3dStore.getState();

  // Theme sync — only runs side effects when splineApp is set
  useSplineTheme();

  // Gyroscope for mobile parallax
  const { orientation, permissionState } = useDeviceOrientation();
  const isMobileRef = useRef(
    typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
  );

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const springRotateX = useSpring(rawRotateX, { stiffness: 50, damping: 20 });
  const springRotateY = useSpring(rawRotateY, { stiffness: 50, damping: 20 });
  const tiltX = useTransform(springRotateX, [-1, 1], [3, -3]);
  const tiltY = useTransform(springRotateY, [-1, 1], [-3, 3]);

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
      console.warn('[SplineScene] Failed to load 3D scene:', error);
      setSceneLoaded(false);
      setSceneError(true);
    },
    [setSceneLoaded, setSceneError],
  );

  const useGyroscopeParallax = isMobileRef.current && permissionState === 'granted';

  const mode = useThemeStore((s) => s.mode);
  const sceneOffset = mode === 'light' ? 'translateX(-10%)' : 'translateX(15%)';
  const sceneScale = mode === 'light' ? 1.2 : 1;

  // If scene is invalid/placeholder, render nothing — AppShell will show ParallaxFallback
  if (sceneValid === false) return <GyroscopeProvider />;

  return (
    <>
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          width: '100vw',
          height: '100vh',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
          pointerEvents: 'none',
          transform: sceneOffset,
        }}
        aria-hidden="true"
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            perspective: useGyroscopeParallax ? '1000px' : undefined,
            rotateX: useGyroscopeParallax ? tiltX : 0,
            rotateY: useGyroscopeParallax ? tiltY : 0,
            scale: reduced ? sceneScale * 0.75 : sceneScale,
            transformOrigin: 'center center',
            willChange: reduced ? 'transform' : undefined,
          }}
        >
          {shouldLoad && (
            <Spline
              scene={sceneUrl}
              onLoad={handleLoad}
              onError={handleError}
              renderOnDemand={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </motion.div>
      </div>
      <GyroscopeProvider />
    </>
  );
}
