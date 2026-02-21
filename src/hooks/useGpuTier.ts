import { useState, useEffect } from "react";
import { getGPUTier } from "detect-gpu";

export interface GpuTierResult {
  tier: number;
  isMobile: boolean;
  gpu: string | undefined;
  loading: boolean;
}

// Module-level cache so detection runs only once per session
let cachedResult: Omit<GpuTierResult, "loading"> | null = null;
let detectionPromise: Promise<void> | null = null;

/**
 * Fallback GPU classification using the WebGL renderer string.
 * Used when detect-gpu can't fetch benchmarks (e.g. ad blocker blocks unpkg.com).
 *
 * detect-gpu needs to fetch benchmark JSON from unpkg.com to compare the GPU
 * against known performance data. When that fetch is blocked (ad blockers,
 * corporate firewalls, privacy extensions), the library returns type:'FALLBACK'
 * with tier:1 — too low for 3D. This function uses the WebGL renderer string
 * to make a more accurate local classification.
 */
function localGpuFallback(): Omit<GpuTierResult, "loading"> {
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0);

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      return { tier: 0, isMobile, gpu: undefined };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : "";

    // High-end discrete GPUs
    if (/NVIDIA|GeForce|Radeon RX|RTX|GTX/i.test(renderer)) {
      return { tier: 3, isMobile, gpu: renderer };
    }

    // Apple Silicon (M-series) and recent Apple GPUs
    if (/Apple M|Apple GPU/i.test(renderer)) {
      return { tier: isMobile ? 2 : 3, isMobile, gpu: renderer };
    }

    // Mid-range: Adreno 6xx+, Mali-G7x+, Intel Iris/UHD, AMD integrated
    if (
      /Adreno \(TM\) [6-9]|Mali-G[7-9]|Iris|UHD|Radeon Graphics/i.test(renderer)
    ) {
      return { tier: 2, isMobile, gpu: renderer };
    }

    // WebGL2 works — at least tier 2 for desktop, tier 1 for mobile
    if (canvas.getContext("webgl2")) {
      return { tier: isMobile ? 1 : 2, isMobile, gpu: renderer };
    }

    // WebGL1 only
    return { tier: 1, isMobile, gpu: renderer };
  } catch {
    return { tier: 0, isMobile, gpu: undefined };
  }
}

/**
 * useGpuTier — Detects GPU performance tier for 3D capability decisions.
 *
 * Uses detect-gpu to benchmark the GPU and return a tier (0-3):
 *   0 = no GPU / unsupported
 *   1 = low-end (mobile low, integrated graphics)
 *   2 = mid-range (mobile high, desktop integrated)
 *   3 = high-end (discrete desktop GPU)
 *
 * detect-gpu relies on fetching benchmark data from unpkg.com. When that
 * fetch is blocked (ad blockers, privacy extensions), the library returns
 * type:'FALLBACK' with tier:1 — which forces fallback-2d and hides the
 * Spline 3D scene. In that case, we use a local WebGL renderer heuristic
 * to get a more accurate tier.
 *
 * Module-level caching ensures detection runs only once per session,
 * even if multiple components mount this hook simultaneously.
 */
export function useGpuTier(): GpuTierResult {
  const [result, setResult] = useState<Omit<GpuTierResult, "loading"> | null>(
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

        // detect-gpu resolves (doesn't throw) even when benchmarks can't be fetched.
        // type:'FALLBACK' means benchmarks were unavailable (blocked by ad blocker,
        // network error, etc.) — tier will be inaccurately low. Use local heuristic.
        // type:'BLOCKLISTED' means the GPU is known to be problematic — trust it.
        // type:'BENCHMARK' means full benchmark comparison succeeded — trust it.
        if (gpuTier.type === "FALLBACK") {
          const localResult = localGpuFallback();
          // Use the better of detect-gpu's fallback and our local estimate
          cachedResult =
            localResult.tier > gpuTier.tier
              ? localResult
              : {
                  tier: gpuTier.tier,
                  isMobile: gpuTier.isMobile ?? false,
                  gpu: gpuTier.gpu,
                };
        } else {
          cachedResult = {
            tier: gpuTier.tier,
            isMobile: gpuTier.isMobile ?? false,
            gpu: gpuTier.gpu,
          };
        }
      } catch {
        // detect-gpu threw entirely (rare) — use local fallback
        cachedResult = localGpuFallback();
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
