// Paginated movie browsing by streaming provider

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { TMDBDiscoverResponse } from "@/types/movie";

export interface BrowseFilters {
  genres: number[];
  ratingRange: [number, number];
  yearRange: [number, number];
  language: string | null;
  runtimeRange: [number, number];
}

export interface BrowseParams {
  providerId: number;
  region: string;
  page: number;
  sortBy: string;
  filters: BrowseFilters;
}

const CURRENT_YEAR = new Date().getFullYear();

export const DEFAULT_FILTERS: BrowseFilters = {
  genres: [],
  ratingRange: [0, 10],
  yearRange: [1900, CURRENT_YEAR],
  language: null,
  runtimeRange: [0, 300],
};

/** Check whether any filter deviates from defaults */
export function hasNonDefaultFilters(filters: BrowseFilters): boolean {
  return (
    filters.genres.length > 0 ||
    filters.ratingRange[0] !== 0 ||
    filters.ratingRange[1] !== 10 ||
    filters.yearRange[0] !== 1900 ||
    filters.yearRange[1] !== CURRENT_YEAR ||
    filters.language !== null ||
    filters.runtimeRange[0] !== 0 ||
    filters.runtimeRange[1] !== 300
  );
}

/** Build a deterministic cache key from browse params */
function buildCacheKey(params: BrowseParams): string {
  const f = params.filters;
  const filterParts = [
    f.genres.length > 0
      ? `g${[...f.genres].sort((a, b) => a - b).join(".")}`
      : "",
    f.ratingRange[0] !== 0 || f.ratingRange[1] !== 10
      ? `r${f.ratingRange[0]}-${f.ratingRange[1]}`
      : "",
    f.yearRange[0] !== 1900 || f.yearRange[1] !== CURRENT_YEAR
      ? `y${f.yearRange[0]}-${f.yearRange[1]}`
      : "",
    f.language ? `l${f.language}` : "",
    f.runtimeRange[0] !== 0 || f.runtimeRange[1] !== 300
      ? `rt${f.runtimeRange[0]}-${f.runtimeRange[1]}`
      : "",
  ]
    .filter(Boolean)
    .join("-");

  return `browse-${params.providerId}-${params.region}-${params.sortBy}${filterParts ? `-${filterParts}` : ""}-p${params.page}`;
}

export async function browseMovies(
  params: BrowseParams,
  signal?: AbortSignal,
): Promise<TMDBDiscoverResponse> {
  const cacheKey = buildCacheKey(params);

  const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const { providerId, region, page, sortBy, filters } = params;

  const queryParams: Record<string, string | number | boolean> = {
    with_watch_providers: providerId,
    watch_region: region,
    with_watch_monetization_types: "flatrate",
    sort_by: sortBy,
    "vote_count.gte": 50,
    include_adult: false,
    page,
  };

  // Genre filter (OR logic — pipe-separated)
  if (filters.genres.length > 0) {
    queryParams.with_genres = filters.genres.join("|");
  }

  // Rating range
  if (filters.ratingRange[0] > 0) {
    queryParams["vote_average.gte"] = filters.ratingRange[0];
  }
  if (filters.ratingRange[1] < 10) {
    queryParams["vote_average.lte"] = filters.ratingRange[1];
  }

  // Year range (TMDB expects YYYY-MM-DD format)
  if (filters.yearRange[0] > 1900) {
    queryParams["primary_release_date.gte"] = `${filters.yearRange[0]}-01-01`;
  }
  if (filters.yearRange[1] < CURRENT_YEAR) {
    queryParams["primary_release_date.lte"] = `${filters.yearRange[1]}-12-31`;
  }

  // Language
  if (filters.language) {
    queryParams.with_original_language = filters.language;
  }

  // Runtime range
  if (filters.runtimeRange[0] > 0) {
    queryParams["with_runtime.gte"] = filters.runtimeRange[0];
  }
  if (filters.runtimeRange[1] < 300) {
    queryParams["with_runtime.lte"] = filters.runtimeRange[1];
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>(
    "/discover/movie",
    queryParams,
    3,
    signal,
  );

  await setCache(cacheKey, response, TTL.SEARCH_RESULTS);

  return response;
}
