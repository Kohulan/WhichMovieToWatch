// Now playing and popular movie lists

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { TMDBDiscoverResponse } from "@/types/movie";

export async function fetchNowPlaying(
  region: string,
  page = 1,
): Promise<TMDBDiscoverResponse> {
  const cacheKey = `now-playing-${region}-page${page}`;

  const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>("/movie/now_playing", {
    region,
    page,
  });

  await setCache(cacheKey, response, TTL.TRENDING);

  return response;
}

export async function fetchPopular(page = 1): Promise<TMDBDiscoverResponse> {
  const cacheKey = `popular-page${page}`;

  const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>("/movie/popular", {
    page,
  });

  await setCache(cacheKey, response, TTL.TRENDING);

  return response;
}
