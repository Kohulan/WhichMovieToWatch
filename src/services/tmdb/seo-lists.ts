// Curated list fetchers for SEO hub pages. The prerender script
// (tools/lib/tmdb-build.mjs) mirrors these params — keep in sync.

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { TMDBDiscoverResponse, TMDBMovie } from "@/types/movie";

async function cachedDiscover(
  cacheKey: string,
  params: Record<string, string | number | boolean>,
): Promise<TMDBMovie[]> {
  const cached = await getCached<TMDBMovie[]>(cacheKey);
  if (cached.value && !cached.isStale) return cached.value;
  const response = await tmdbFetch<TMDBDiscoverResponse>(
    "/discover/movie",
    params,
  );
  const movies = response.results.slice(0, 20);
  await setCache(cacheKey, movies, TTL.TRENDING);
  return movies;
}

export function fetchTonightList(): Promise<TMDBMovie[]> {
  return cachedDiscover("seo-tonight", {
    sort_by: "popularity.desc",
    "vote_average.gte": 7,
    "vote_count.gte": 500,
    include_adult: false,
    page: 1,
  });
}

export function fetchGenreList(genreId: number): Promise<TMDBMovie[]> {
  return cachedDiscover(`seo-genre-${genreId}`, {
    with_genres: genreId,
    sort_by: "popularity.desc",
    "vote_count.gte": 200,
    include_adult: false,
    page: 1,
  });
}

export function fetchProviderList(
  providerId: number,
  region: string,
): Promise<TMDBMovie[]> {
  return cachedDiscover(`seo-provider-${providerId}-${region}`, {
    with_watch_providers: providerId,
    watch_region: region,
    with_watch_monetization_types: "flatrate",
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
    include_adult: false,
    page: 1,
  });
}
