// Streaming provider list per region and per movie

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { WatchProviderCountry } from "@/types/movie";

interface TMDBProviderResult {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priorities: Record<string, number>;
}

interface TMDBProviderListResponse {
  results: TMDBProviderResult[];
}

interface TMDBMovieProviderResponse {
  id: number;
  results: Record<string, WatchProviderCountry>;
}

interface TMDBRegionResult {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

interface TMDBRegionResponse {
  results: TMDBRegionResult[];
}

export async function fetchProvidersForRegion(
  region: string,
): Promise<TMDBProviderResult[]> {
  // Fetch the GLOBAL provider list (no watch_region) and filter by
  // display_priorities[region]. TMDB's regional endpoint silently omits
  // providers it deems low-volume in that region — Disney+ has DE priority 3
  // (top tier) but is missing from /watch/providers/movie?watch_region=DE.
  // Filtering on display_priorities is the source of truth for "operates in
  // this region" and surfaces those omitted services correctly.
  const cacheKey = `providers-all-v2`;

  let allProviders: TMDBProviderResult[];
  const cached = await getCached<TMDBProviderResult[]>(cacheKey);
  if (cached.value && !cached.isStale) {
    allProviders = cached.value;
  } else {
    const response = await tmdbFetch<TMDBProviderListResponse>(
      "/watch/providers/movie",
    );
    allProviders = response.results;
    await setCache(cacheKey, allProviders, TTL.PROVIDER_LIST);
  }

  return allProviders
    .filter((p) => p.display_priorities?.[region] !== undefined)
    .sort(
      (a, b) =>
        (a.display_priorities[region] ?? Number.MAX_SAFE_INTEGER) -
        (b.display_priorities[region] ?? Number.MAX_SAFE_INTEGER),
    );
}

export async function fetchMovieProviders(
  movieId: number,
  region: string,
): Promise<WatchProviderCountry | null> {
  // Cache key includes region per Pitfall 4
  const cacheKey = `providers-movie-${movieId}-${region}`;

  const cached = await getCached<WatchProviderCountry | null>(cacheKey);
  if (cached.value !== null && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBMovieProviderResponse>(
    `/movie/${movieId}/watch/providers`,
  );

  const countryData = response.results[region] || null;

  await setCache(cacheKey, countryData, TTL.PROVIDER_LIST);

  return countryData;
}

export async function fetchAllMovieProviders(
  movieId: number,
): Promise<Record<string, WatchProviderCountry>> {
  const cacheKey = `providers-movie-${movieId}-all`;

  const cached =
    await getCached<Record<string, WatchProviderCountry>>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBMovieProviderResponse>(
    `/movie/${movieId}/watch/providers`,
  );

  await setCache(cacheKey, response.results, TTL.PROVIDER_LIST);

  return response.results;
}

export async function fetchAvailableRegions(): Promise<TMDBRegionResult[]> {
  const cacheKey = "provider-regions";

  const cached = await getCached<TMDBRegionResult[]>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBRegionResponse>(
    "/watch/providers/regions",
  );

  await setCache(cacheKey, response.results, TTL.PROVIDER_LIST);

  return response.results;
}
