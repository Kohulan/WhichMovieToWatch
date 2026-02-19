// Now playing with auto-refresh hook — region-aware, 30-min interval

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNowPlaying, fetchPopular } from '@/services/tmdb/trending';
import { useRegionStore } from '@/stores/regionStore';
import type { TMDBMovie } from '@/types/movie';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useTrending() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const region = useRegionStore((s) => s.effectiveRegion)();
  const regionRef = useRef(region);
  regionRef.current = region;

  const refresh = useCallback(async () => {
    const currentRegion = regionRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchNowPlaying(currentRegion, 1);

      if (response.results.length > 0) {
        setMovies(response.results);
      } else {
        // Fall back to popular movies if now_playing is empty for this region
        const popular = await fetchPopular(1);
        setMovies(popular.results);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load trending movies',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Set up 30-minute auto-refresh
    const intervalId = setInterval(refresh, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [region, refresh]);

  return { movies, isLoading, error, refresh };
}
