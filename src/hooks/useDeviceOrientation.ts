import { useState, useEffect, useCallback, useRef } from 'react';

/** Raw orientation angles from the DeviceOrientationEvent. */
export interface OrientationData {
  /** Rotation around the z-axis (compass heading, 0-360). null when unavailable. */
  alpha: number | null;
  /**
   * Rotation around the x-axis (front-back tilt, -180..180).
   * Normalized to -1..1 as betaNorm for parallax input.
   */
  beta: number | null;
  /**
   * Rotation around the y-axis (left-right tilt, -90..90).
   * Normalized to -1..1 as gammaNorm for parallax input.
   */
  gamma: number | null;
  /** beta normalized to -1..1 range for parallax calculations. */
  betaNorm: number;
  /** gamma normalized to -1..1 range for parallax calculations. */
  gammaNorm: number;
}

/**
 * Device orientation permission state.
 *
 * 'prompt'      — iOS 13+: needs user gesture to request permission
 * 'granted'     — Android or after iOS user approves; event listener is active
 * 'denied'      — user denied the iOS permission dialog
 * 'unsupported' — browser/device does not support DeviceOrientationEvent
 */
export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface DeviceOrientationResult {
  orientation: OrientationData;
  permissionState: PermissionState;
  /** Call from a user gesture (button click) to trigger iOS permission dialog. */
  requestPermission: () => Promise<void>;
  /** True when orientation events are available (not 'unsupported'). */
  isAvailable: boolean;
}

const INITIAL_ORIENTATION: OrientationData = {
  alpha: null,
  beta: null,
  gamma: null,
  betaNorm: 0,
  gammaNorm: 0,
};

const LS_KEY_GRANTED = 'wmtw-gyro-granted';

/**
 * useDeviceOrientation — Device orientation API with iOS 13+ permission handling.
 *
 * Detection flow on mount:
 *   1. DeviceOrientationEvent undefined → 'unsupported'
 *   2. 'requestPermission' in DeviceOrientationEvent (iOS 13+) → 'prompt' (needs user gesture)
 *   3. Otherwise (Android, desktop) → 'granted'; starts listening immediately
 *
 * iOS caching note:
 *   iOS does NOT persist DeviceOrientation permission across sessions. Even if the user
 *   previously granted permission, iOS requires a fresh requestPermission() call from a
 *   user gesture on each page load. The cached 'wmtw-gyro-granted' localStorage key is
 *   used only to know we should surface the permission button again (not to auto-grant).
 *
 * Returns normalized betaNorm/gammaNorm (-1..1) suitable for CSS parallax transforms:
 *   betaNorm:  beta  / 90  (beta  range is -180..180, but practical tilt is -90..90)
 *   gammaNorm: gamma / 45  (gamma range is  -90..90,  but practical tilt is  -45..45)
 * Values are clamped to -1..1.
 */
export function useDeviceOrientation(): DeviceOrientationResult {
  const [orientation, setOrientation] = useState<OrientationData>(INITIAL_ORIENTATION);
  const [permissionState, setPermissionState] = useState<PermissionState>('unsupported');
  const listenerActiveRef = useRef(false);

  /** Start listening to deviceorientation events. */
  const startListening = useCallback(() => {
    if (listenerActiveRef.current) return;
    listenerActiveRef.current = true;

    function handleOrientation(e: DeviceOrientationEvent) {
      const beta = e.beta;
      const gamma = e.gamma;
      setOrientation({
        alpha: e.alpha,
        beta,
        gamma,
        // Normalize beta: clamp to ±90 practical range then divide
        betaNorm: beta !== null ? Math.max(-1, Math.min(1, beta / 90)) : 0,
        // Normalize gamma: clamp to ±45 practical range then divide
        gammaNorm: gamma !== null ? Math.max(-1, Math.min(1, gamma / 45)) : 0,
      });
    }

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    // Store cleanup reference on the window for unmount — using a module-level symbol
    // is cleaner, but closure capture works fine here.
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      listenerActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Guard: SSR / environments without window
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setPermissionState('unsupported');
      return;
    }

    // iOS 13+ requires an explicit requestPermission() call from a user gesture
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'
    ) {
      // Surface the permission button to the user (prompt state)
      setPermissionState('prompt');
      // Note: we do NOT auto-call requestPermission here — iOS requires user gesture
      return;
    }

    // Android / desktop: events are freely available — start listening immediately
    setPermissionState('granted');
    const cleanup = startListening();
    return cleanup;
  }, [startListening]);

  /** Call this from a button click handler to trigger the iOS permission dialog. */
  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') return;

    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DOE.requestPermission !== 'function') {
      // Non-iOS path: already granted via useEffect; this is a no-op
      setPermissionState('granted');
      startListening();
      return;
    }

    try {
      const result = await DOE.requestPermission();
      if (result === 'granted') {
        setPermissionState('granted');
        localStorage.setItem(LS_KEY_GRANTED, '1');
        startListening();
      } else {
        setPermissionState('denied');
      }
    } catch (err) {
      // requestPermission throws when called outside user gesture context
      console.warn('[useDeviceOrientation] requestPermission failed:', err);
      setPermissionState('denied');
    }
  }, [startListening]);

  return {
    orientation,
    permissionState,
    requestPermission,
    isAvailable: permissionState !== 'unsupported',
  };
}
