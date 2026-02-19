import { create } from 'zustand';
import type { Application } from '@splinetool/runtime';
import type { Capability } from '@/hooks/use3DCapability';

/**
 * scene3dStore — Runtime store for the 3D experience layer.
 *
 * No persistence (intentional) — GPU capability is re-detected each session
 * because GPU drivers, browser settings, or prefers-reduced-motion can change.
 *
 * State:
 *   capability          — 'full-3d' | 'reduced-3d' | 'fallback-2d' | null (null = not yet detected)
 *   loading             — true while GPU detection is running
 *   sceneLoaded         — true once the Spline scene has fully loaded
 *   sceneError          — true if the Spline scene failed to load (placeholder file, network error, etc.)
 *   splineApp           — reference to the Spline Application instance for camera control
 *   currentCameraState  — current camera state name (tracks which view the camera is at)
 *   cameraAvailable     — null (not probed), true (Camera object found), false (missing in scene)
 *
 * Actions:
 *   setCapability           — called by Scene3DProvider once detection completes
 *   setLoading              — internal loading state
 *   setSceneLoaded          — called by SplineScene once scene canvas is ready
 *   setSceneError           — called by SplineScene on load failure
 *   setSplineApp            — stores Spline Application ref for camera control (Plans 07-03/07-04)
 *   setCameraState          — updates currentCameraState tracker
 *   triggerCameraTransition — fires a Spline camera state transition if splineApp is available
 */

interface Scene3dState {
  capability: Capability | null;
  loading: boolean;
  sceneLoaded: boolean;
  sceneError: boolean;
  splineApp: Application | null;
  currentCameraState: string;
  /** null = not yet probed, true = camera found, false = camera missing in scene */
  cameraAvailable: boolean | null;
  setCapability: (capability: Capability) => void;
  setLoading: (loading: boolean) => void;
  setSceneLoaded: (loaded: boolean) => void;
  setSceneError: (error: boolean) => void;
  setSplineApp: (app: Application | null) => void;
  setCameraState: (state: string) => void;
  triggerCameraTransition: (targetState: string) => void;
}

export const useScene3dStore = create<Scene3dState>()((set, get) => ({
  capability: null,
  loading: true,
  sceneLoaded: false,
  sceneError: false,
  splineApp: null,
  currentCameraState: 'home-view',
  cameraAvailable: null,
  setCapability: (capability) => set({ capability, loading: false }),
  setLoading: (loading) => set({ loading }),
  setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
  setSceneError: (sceneError) => set({ sceneError }),
  setSplineApp: (splineApp) => set({ splineApp, cameraAvailable: null }),
  setCameraState: (currentCameraState) => set({ currentCameraState }),
  triggerCameraTransition: (targetState) => {
    const { splineApp, cameraAvailable } = get();

    if (splineApp === null) {
      // 3D scene not loaded yet — skip silently
      return;
    }

    // Once we've determined the scene lacks a Camera object, skip all future attempts
    // until a new scene loads (setSplineApp resets cameraAvailable to null).
    if (cameraAvailable === false) {
      set({ currentCameraState: targetState });
      return;
    }

    try {
      const camera = splineApp.findObjectByName('Camera');
      if (!camera) {
        // First probe failed — cache the result so we never warn again for this scene.
        // Camera states will work once the Spline scene defines a "Camera" object
        // with named states (home-view, discover-view, etc.) per Plans 07-03/07-04.
        set({ cameraAvailable: false, currentCameraState: targetState });
        return;
      }

      // Camera found — cache success and fire transition
      if (cameraAvailable === null) {
        set({ cameraAvailable: true });
      }

      camera.transition({ to: targetState, duration: 0.4, easing: 'EASE_IN_OUT' });
    } catch {
      // Camera states may not exist in the current .splinecode — graceful degradation.
      // Don't disable cameraAvailable here — the Camera object exists but the
      // target state name might be missing. Other states may still work.
    }

    set({ currentCameraState: targetState });
  },
}));
