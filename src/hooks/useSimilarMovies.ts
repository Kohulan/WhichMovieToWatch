// Fetches similar movies for a given movie ID (used for Love action recommendations)

import { useState, useEffect } from 'react';
import { tmdbFetch } from '@/services/tmdb/client';
import { getCached, setCache, TTL } from '@/services/cache/cache-manager';
import type { TMDBMovie, TMDBDiscoverResponse } from '@/types/movie';

/**
 * useSimilarMovies — Fetches TMDB similar movies for a given movieId.
 *
 * Uses the cancelled flag pattern for cleanup and caches results
 * via cache-manager with TTL.SEARCH_RESULTS.
 *
 * @param movieId - TMDB movie ID (null means disabled)
 * @returns { movies, isLoading }
 */
export function useSimilarMovies(movieId: number | null) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (movieId === null) {
      setMovies([]);
      return;
    }

    let cancelled = false;
    const cacheKey = `similar-movies-${movieId}`;

    async function load() {
      // Check cache first
      const cached = await getCached<TMDBMovie[]>(cacheKey);

      if (cancelled) return;

      if (cached.value && !cached.isStale) {
        setMovies(cached.value);
        return;
      }

      if (cached.value) {
        // Show stale data immediately, refresh in background
        setMovies(cached.value);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await tmdbFetch<TMDBDiscoverResponse>(
          `/movie/${movieId}/similar`,
          { page: 1 },
        );

        if (!cancelled) {
          const results = response.results ?? [];
          setMovies(results);
          await setCache(cacheKey, results, TTL.SEARCH_RESULTS);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useSimilarMovies] Failed to fetch similar movies:', err);
          // Keep stale data if available, otherwise set empty
          if (!cached.value) {
            setMovies([]);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  return { movies, isLoading };
}
