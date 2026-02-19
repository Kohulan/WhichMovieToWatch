import { useState, useEffect } from 'react';
import { getGPUTier } from 'detect-gpu';

export interface GpuTierResult {
  tier: number;
  isMobile: boolean;
  gpu: string | undefined;
  loading: boolean;
}

// Module-level cache so detection runs only once per session
let cachedResult: Omit<GpuTierResult, 'loading'> | null = null;
let detectionPromise: Promise<void> | null = null;

/**
 * useGpuTier — Detects GPU performance tier for 3D capability decisions.
 *
 * Uses detect-gpu to benchmark the GPU and return a tier (0-3):
 *   0 = no GPU / unsupported
 *   1 = low-end (mobile low, integrated graphics)
 *   2 = mid-range (mobile high, desktop integrated)
 *   3 = high-end (discrete desktop GPU)
 *
 * Module-level caching ensures detection runs only once per session,
 * even if multiple components mount this hook simultaneously.
 */
export function useGpuTier(): GpuTierResult {
  const [result, setResult] = useState<Omit<GpuTierResult, 'loading'> | null>(
    cachedResult,
  );

  useEffect(() => {
    // Already cached — no re-detection needed
    if (cachedResult !== null) {
      setResult(cachedResult);
      return;
    }

    // Detection already in flight — subscribe to its completion
    if (detectionPromise !== null) {
      detectionPromise.then(() => {
        setResult(cachedResult);
      });
      return;
    }

    // First mount: run detection
    detectionPromise = (async () => {
      try {
        const gpuTier = await getGPUTier();
        cachedResult = {
          tier: gpuTier.tier,
          isMobile: gpuTier.isMobile ?? false,
          gpu: gpuTier.gpu,
        };
      } catch {
        // Detection failed — treat as lowest tier (safe fallback)
        cachedResult = { tier: 0, isMobile: false, gpu: undefined };
      } finally {
        setResult(cachedResult);
      }
    })();
  }, []);

  return {
    tier: result?.tier ?? 0,
    isMobile: result?.isMobile ?? false,
    gpu: result?.gpu,
    loading: result === null,
  };
}
