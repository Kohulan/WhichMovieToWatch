// Top streaming movies from Netflix, Prime Video, and Disney+ — for the home hero cell

import { useState, useEffect } from "react";
import { tmdbFetch } from "@/services/tmdb/client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import { useRegionStore } from "@/stores/regionStore";
import { useReloadKey } from "@/hooks/useReloadKey";
import type { TMDBDiscoverResponse, TMDBMovie } from "@/types/movie";

// TMDB provider IDs
const NETFLIX = 8;
const PRIME_VIDEO = 9;
const DISNEY_PLUS = 337;

const PROVIDERS = [NETFLIX, PRIME_VIDEO, DISNEY_PLUS].join("|");

export function useTopStreaming() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, retry] = useReloadKey();
  const region = useRegionStore((s) => s.effectiveRegion());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cacheKey = `top-streaming-${region}`;
      const cached = await getCached<TMDBMovie[]>(cacheKey);
      if (cancelled) return;

      // Cache-hit fast path: no spinner flash on warm reloads.
      if (cached.value && !cached.isStale) {
        setMovies(cached.value);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await tmdbFetch<TMDBDiscoverResponse>(
          "/discover/movie",
          {
            sort_by: "popularity.desc",
            watch_region: region,
            with_watch_providers: PROVIDERS,
            with_watch_monetization_types: "flatrate",
            "vote_count.gte": 100,
            "vote_average.gte": 6,
            include_adult: "false",
            page: 1,
          },
        );

        if (cancelled) return;

        const results = response.results.slice(0, 20);
        setMovies(results);
        await setCache(cacheKey, results, TTL.TRENDING);
      } catch (err) {
        console.warn("[useTopStreaming] Failed to load:", err);
        if (!cancelled) {
          // Only surface the error when we have nothing cached to show,
          // otherwise keep displaying stale data silently.
          if (!cached.value) {
            setMovies([]);
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load top streaming movies",
            );
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [region, reloadKey]);

  return { movies, isLoading, error, retry };
}
