import { type ReactNode, useEffect } from 'react';
import { use3DCapability } from '@/hooks/use3DCapability';
import { useScene3dStore } from '@/stores/scene3dStore';

interface Scene3DProviderProps {
  children: ReactNode;
}

/**
 * Scene3DProvider — Runs GPU/WebGL/reduced-motion detection on mount
 * and writes the resulting Capability to scene3dStore.
 *
 * This is a thin wrapper component (not a React context provider) —
 * the scene3dStore IS the context. Any component in the tree can read
 * capability via `useScene3dStore((s) => s.capability)` without prop drilling.
 *
 * Usage:
 *   <Scene3DProvider>
 *     <AppShell>...</AppShell>
 *     <TabBar />
 *   </Scene3DProvider>
 *
 * This component does NOT render the parallax or 3D scene — AppShell
 * handles rendering based on store state. This separation means the
 * detection logic is independent of the visual output layer.
 *
 * Mounting point: Inside MotionProvider, outside AppShell (App.tsx).
 * Ensures detection runs once when post-splash app tree mounts.
 */
export function Scene3DProvider({ children }: Scene3DProviderProps) {
  const { capability, loading } = use3DCapability();
  const setCapability = useScene3dStore((s) => s.setCapability);
  const setLoading = useScene3dStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(loading);

    if (!loading && capability) {
      setCapability(capability);
    }
  }, [capability, loading, setCapability, setLoading]);

  return <>{children}</>;
}
