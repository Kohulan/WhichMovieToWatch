// Region detection and override hook — detects once, persists, invalidates cache on change

import { useState, useEffect, useCallback } from 'react';
import { detectCountry } from '@/services/ipinfo/client';
import { useRegionStore } from '@/stores/regionStore';
import { invalidateByPrefix } from '@/services/cache/cache-manager';

export function useRegion() {
  const detectedCountry = useRegionStore((s) => s.detectedCountry);
  const manualOverride = useRegionStore((s) => s.manualOverride);
  const region = useRegionStore((s) => s.effectiveRegion)();
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect country on every app load so it always reflects current location
  useEffect(() => {
    let cancelled = false;

    async function detect() {
      setIsDetecting(true);

      try {
        const country = await detectCountry();
        if (!cancelled) {
          useRegionStore.getState().setDetectedCountry(country);
        }
      } catch (err) {
        // Detection failed — keep existing value
        console.warn('[region] Country detection failed:', err);
      } finally {
        if (!cancelled) {
          setIsDetecting(false);
        }
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual override that also invalidates provider cache
  const setOverride = useCallback(async (country: string | null) => {
    useRegionStore.getState().setManualOverride(country);

    // Invalidate provider-related caches so stale regional data is cleared
    await invalidateByPrefix('providers-');
  }, []);

  return {
    region,
    detectedCountry,
    manualOverride,
    setOverride,
    isDetecting,
  };
}
