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

export async function fetchRegionProviders(
  region: string,
): Promise<TMDBProviderResult[]> {
  const cacheKey = `providers-region-${region}`;

  const cached = await getCached<TMDBProviderResult[]>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBProviderListResponse>(
    "/watch/providers/movie",
    { watch_region: region },
  );

  await setCache(cacheKey, response.results, TTL.PROVIDER_LIST);

  return response.results;
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
