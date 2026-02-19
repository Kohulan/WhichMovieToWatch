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
  setCapability: (capability) => set({ capability, loading: false }),
  setLoading: (loading) => set({ loading }),
  setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
  setSceneError: (sceneError) => set({ sceneError }),
  setSplineApp: (splineApp) => set({ splineApp }),
  setCameraState: (currentCameraState) => set({ currentCameraState }),
  triggerCameraTransition: (targetState) => {
    const { splineApp } = get();

    if (splineApp === null) {
      // 3D scene not loaded yet — skip transition silently
      return;
    }

    try {
      // Attempt to find the camera object in the Spline scene
      const camera = splineApp.findObjectByName('Camera');
      if (camera) {
        // TransitionParams: { to: string, from?: string, duration: number, delay?: number, easing?: string }
        // 400ms ≈ 350ms page transition, EASE_IN_OUT for cinematic feel
        camera.transition({ to: targetState, duration: 0.4, easing: 'EASE_IN_OUT' });
        console.debug('[3D] Camera transition → %s (400ms EASE_IN_OUT)', targetState);
      } else {
        console.warn('[3D] Camera object not found in Spline scene — transition skipped');
      }
    } catch (err) {
      // Camera states may not exist in the current .splinecode — graceful degradation
      console.warn('[3D] Camera transition to "%s" failed (camera states may not be defined in scene):', targetState, err);
    }

    // Always update local state tracker so CameraTransitionManager avoids redundant calls
    set({ currentCameraState: targetState });
  },
}));
