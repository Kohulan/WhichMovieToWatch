// Now playing with auto-refresh hook — region-aware, 30-min interval

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNowPlaying, fetchPopular } from "@/services/tmdb/trending";
import { useRegionStore } from "@/stores/regionStore";
import type { TMDBMovie } from "@/types/movie";

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useTrending() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const region = useRegionStore((s) => s.effectiveRegion)();
  const regionRef = useRef(region);
  regionRef.current = region;
  // Per-call request id; incremented on every refresh so a slower in-flight
  // call that resolves after a faster newer call cannot overwrite the result.
  // The cleanup in the effect below clears the interval, so no new refresh
  // calls fire after unmount; this id alone covers stale-write protection.
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const currentRegion = regionRef.current;
    const requestId = ++requestIdRef.current;
    const isStale = () => requestId !== requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchNowPlaying(currentRegion, 1);
      if (isStale()) return;

      if (response.results.length > 0) {
        setMovies(response.results);
      } else {
        // Fall back to popular movies if now_playing is empty for this region
        const popular = await fetchPopular(1);
        if (isStale()) return;
        setMovies(popular.results);
      }
    } catch (err) {
      if (isStale()) return;
      setError(
        err instanceof Error ? err.message : "Failed to load trending movies",
      );
    } finally {
      if (!isStale()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Set up 30-minute auto-refresh
    const intervalId = setInterval(refresh, REFRESH_INTERVAL);

    return () => {
      // Bumping the id invalidates any in-flight refresh started before unmount.
      requestIdRef.current++;
      clearInterval(intervalId);
    };
  }, [region, refresh]);

  return { movies, isLoading, error, refresh };
}
