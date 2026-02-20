// SWR movie details hook — shows cached data immediately, refreshes stale

import { useState, useEffect } from "react";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import { fetchMovieDetails } from "@/services/tmdb/details";
import type { TMDBMovieDetails } from "@/types/movie";

export function useMovieDetails(movieId: number | null) {
  const [data, setData] = useState<TMDBMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId === null) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const cacheKey = `movie-details-${movieId}`;

    async function load() {
      // Step 1: Check cache
      const cached = await getCached<TMDBMovieDetails>(cacheKey);

      if (cancelled) return;

      if (cached.value) {
        // Step 2: Show cached data immediately
        setData(cached.value);

        if (!cached.isStale) {
          // Fresh cache — nothing more to do
          return;
        }
        // Stale cache — refresh in background (no loading indicator since we have data)
      } else {
        // No cache at all — show loading indicator
        setIsLoading(true);
      }

      // Step 3: Fetch fresh data
      try {
        const fresh = await fetchMovieDetails(movieId);
        if (cancelled) return;

        setData(fresh);
        setError(null);

        // fetchMovieDetails already caches internally, but ensure our key is fresh
        await setCache(cacheKey, fresh, TTL.MOVIE_DETAILS);
      } catch (err) {
        if (cancelled) return;

        // Only set error if we don't have cached fallback
        if (!cached.value) {
          setError(
            err instanceof Error ? err.message : "Failed to load movie details",
          );
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

  return { data, isLoading, error };
}
