import { create } from 'zustand';
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
 *   sceneLoaded  — true once the Spline scene has fully loaded (Plan 07-02)
 *   splineApp    — reference to the Spline Application instance (Plan 07-02)
 *
 * Actions:
 *   setCapability   — called by Scene3DProvider once detection completes
 *   setLoading      — internal loading state
 *   setSceneLoaded  — called by SplineHero once scene canvas is ready
 *   setSplineApp    — stores Spline Application ref for camera control (Plan 07-04)
 */

interface Scene3dState {
  capability: Capability | null;
  loading: boolean;
  sceneLoaded: boolean;
  splineApp: unknown; // Typed as SplineApp in Plan 07-02 when Spline is integrated
  setCapability: (capability: Capability) => void;
  setLoading: (loading: boolean) => void;
  setSceneLoaded: (loaded: boolean) => void;
  setSplineApp: (app: unknown) => void;
}

export const useScene3dStore = create<Scene3dState>()((set) => ({
  capability: null,
  loading: true,
  sceneLoaded: false,
  splineApp: null,
  setCapability: (capability) => set({ capability, loading: false }),
  setLoading: (loading) => set({ loading }),
  setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
  setSplineApp: (splineApp) => set({ splineApp }),
}));
