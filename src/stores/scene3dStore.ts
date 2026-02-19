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
 *   capability   — 'full-3d' | 'reduced-3d' | 'fallback-2d' | null (null = not yet detected)
 *   loading      — true while GPU detection is running
 *   sceneLoaded  — true once the Spline scene has fully loaded
 *   sceneError   — true if the Spline scene failed to load (placeholder file, network error, etc.)
 *   splineApp    — reference to the Spline Application instance for camera control
 *
 * Actions:
 *   setCapability   — called by Scene3DProvider once detection completes
 *   setLoading      — internal loading state
 *   setSceneLoaded  — called by SplineScene once scene canvas is ready
 *   setSceneError   — called by SplineScene on load failure
 *   setSplineApp    — stores Spline Application ref for camera control (Plans 07-03/07-04)
 */

interface Scene3dState {
  capability: Capability | null;
  loading: boolean;
  sceneLoaded: boolean;
  sceneError: boolean;
  splineApp: Application | null;
  setCapability: (capability: Capability) => void;
  setLoading: (loading: boolean) => void;
  setSceneLoaded: (loaded: boolean) => void;
  setSceneError: (error: boolean) => void;
  setSplineApp: (app: Application | null) => void;
}

export const useScene3dStore = create<Scene3dState>()((set) => ({
  capability: null,
  loading: true,
  sceneLoaded: false,
  sceneError: false,
  splineApp: null,
  setCapability: (capability) => set({ capability, loading: false }),
  setLoading: (loading) => set({ loading }),
  setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
  setSceneError: (sceneError) => set({ sceneError }),
  setSplineApp: (splineApp) => set({ splineApp }),
}));
