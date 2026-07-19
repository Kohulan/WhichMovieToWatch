// Now playing and popular movie lists

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { TMDBDiscoverResponse } from "@/types/movie";

// In-flight request dedup: /trending mounts TrendingBentoHero and
// TrendingPageComponent together, both calling useTrending → these fetchers
// with the same cache key — a cold cache would otherwise fire duplicate
// identical requests. Keyed by cache key so concurrent callers share one
// getCached→tmdbFetch→setCache sequence instead of racing each other.
const inFlight = new Map<string, Promise<TMDBDiscoverResponse>>();

export async function fetchNowPlaying(
  region: string,
  page = 1,
): Promise<TMDBDiscoverResponse> {
  const cacheKey = `now-playing-${region}-page${page}`;

  let promise = inFlight.get(cacheKey);
  if (!promise) {
    promise = (async () => {
      const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
      if (cached.value && !cached.isStale) {
        return cached.value;
      }

      const response = await tmdbFetch<TMDBDiscoverResponse>(
        "/movie/now_playing",
        {
          region,
          page,
        },
      );

      await setCache(cacheKey, response, TTL.TRENDING);

      return response;
    })();
    inFlight.set(cacheKey, promise);
    promise.finally(() => {
      inFlight.delete(cacheKey);
    });
  }

  return promise;
}

export async function fetchPopular(page = 1): Promise<TMDBDiscoverResponse> {
  const cacheKey = `popular-page${page}`;

  let promise = inFlight.get(cacheKey);
  if (!promise) {
    promise = (async () => {
      const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
      if (cached.value && !cached.isStale) {
        return cached.value;
      }

      const response = await tmdbFetch<TMDBDiscoverResponse>("/movie/popular", {
        page,
      });

      await setCache(cacheKey, response, TTL.TRENDING);

      return response;
    })();
    inFlight.set(cacheKey, promise);
    promise.finally(() => {
      inFlight.delete(cacheKey);
    });
  }

  return promise;
}
