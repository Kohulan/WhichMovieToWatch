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

// The /watch/providers endpoint returns ALL regions in one payload, so a
// single per-movie cache entry serves every region — the old per-region
// cache keys meant a region change (e.g. IPinfo detection landing after the
// first fetch) re-downloaded the identical URL. Region is picked on read.
export async function fetchMovieProviders(
  movieId: number,
  region: string,
): Promise<WatchProviderCountry | null> {
  const all = await fetchAllMovieProviders(movieId);
  return all[region] || null;
}

// Concurrent mounts (e.g. a remounting hero cell) can request the same
// movie's providers before the first response lands in the IndexedDB cache —
// dedupe identical in-flight requests, same pattern as trending.ts.
const inFlightAllProviders = new Map<
  number,
  Promise<Record<string, WatchProviderCountry>>
>();

export async function fetchAllMovieProviders(
  movieId: number,
): Promise<Record<string, WatchProviderCountry>> {
  const pending = inFlightAllProviders.get(movieId);
  if (pending) return pending;

  const request = (async () => {
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
  })();

  inFlightAllProviders.set(movieId, request);
  try {
    return await request;
  } finally {
    inFlightAllProviders.delete(movieId);
  }
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
