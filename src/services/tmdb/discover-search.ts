import { tmdbFetch } from "@/services/tmdb/client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import { useSearchStore } from "@/stores/searchStore";
import type { TMDBDiscoverResponse } from "@/types/movie";

type AdvancedFilters = ReturnType<
  typeof useSearchStore.getState
>["advancedFilters"];

interface RunDiscoverSearchOptions {
  advancedFilters: AdvancedFilters;
  sortBy: string;
  region: string;
  page: number;
  isStale: () => boolean;
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Build a deterministic cache key from discover search params, mirroring
 * browse.ts's buildCacheKey shape. Distinct "discover-" prefix so it never
 * collides with browse.ts's "browse-" keys or search.ts's "search-" keys.
 */
function buildCacheKey(
  advancedFilters: AdvancedFilters,
  sortBy: string,
  page: number,
  region: string,
): string {
  const filterParts = [
    advancedFilters.genres.length > 0
      ? `g${[...advancedFilters.genres].sort((a, b) => a - b).join(".")}`
      : "",
    advancedFilters.yearRange[0] !== 1900 ||
    advancedFilters.yearRange[1] !== CURRENT_YEAR
      ? `y${advancedFilters.yearRange[0]}-${advancedFilters.yearRange[1]}`
      : "",
    advancedFilters.ratingRange[0] !== 0 ||
    advancedFilters.ratingRange[1] !== 10
      ? `r${advancedFilters.ratingRange[0]}-${advancedFilters.ratingRange[1]}`
      : "",
    advancedFilters.runtimeRange[0] !== 0 ||
    advancedFilters.runtimeRange[1] !== 300
      ? `rt${advancedFilters.runtimeRange[0]}-${advancedFilters.runtimeRange[1]}`
      : "",
    advancedFilters.language ? `l${advancedFilters.language}` : "",
    advancedFilters.providerId ? `p${advancedFilters.providerId}` : "",
  ]
    .filter(Boolean)
    .join("-");

  // CRITICAL: with_watch_providers ALWAYS paired with watch_region (see the
  // guard below) — fold region into the key ONLY when providerId is set, so
  // identical filters without a provider aren't fragmented by region.
  const regionPart = advancedFilters.providerId ? `-${region}` : "";

  return `discover-${sortBy}${regionPart}${filterParts ? `-${filterParts}` : ""}-p${page}`;
}

export async function runDiscoverSearch({
  advancedFilters,
  sortBy,
  region,
  page,
  isStale,
}: RunDiscoverSearchOptions): Promise<void> {
  const { setLoading, setError, setResults, appendResults } =
    useSearchStore.getState();

  setLoading(true);
  setError(null);

  try {
    const params: Record<string, string | number | boolean> = {
      sort_by: sortBy,
      include_adult: "false",
      page,
    };

    if (advancedFilters.genres.length > 0) {
      params.with_genres = advancedFilters.genres.join(",");
    }

    if (advancedFilters.yearRange[0] !== 1900) {
      params["primary_release_date.gte"] =
        `${advancedFilters.yearRange[0]}-01-01`;
    }
    if (advancedFilters.yearRange[1] !== new Date().getFullYear()) {
      params["primary_release_date.lte"] =
        `${advancedFilters.yearRange[1]}-12-31`;
    }

    if (advancedFilters.ratingRange[0] !== 0) {
      params["vote_average.gte"] = advancedFilters.ratingRange[0];
    }
    if (advancedFilters.ratingRange[1] !== 10) {
      params["vote_average.lte"] = advancedFilters.ratingRange[1];
    }

    if (advancedFilters.runtimeRange[0] !== 0) {
      params["with_runtime.gte"] = advancedFilters.runtimeRange[0];
    }
    if (advancedFilters.runtimeRange[1] !== 300) {
      params["with_runtime.lte"] = advancedFilters.runtimeRange[1];
    }

    if (advancedFilters.language) {
      params.with_original_language = advancedFilters.language;
    }

    if (advancedFilters.providerId) {
      params.with_watch_providers = advancedFilters.providerId;
      // CRITICAL: with_watch_providers ALWAYS paired with watch_region
      params.watch_region = region;
    }

    const cacheKey = buildCacheKey(advancedFilters, sortBy, page, region);
    const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
    let response = cached.value && !cached.isStale ? cached.value : undefined;
    if (!response) {
      response = await tmdbFetch<TMDBDiscoverResponse>(
        "/discover/movie",
        params,
      );
      await setCache(cacheKey, response, TTL.SEARCH_RESULTS);
    }
    if (isStale()) return;

    if (page === 1) {
      setResults(
        response.results,
        response.total_results,
        response.total_pages,
        response.page,
      );
    } else {
      appendResults(response.results, response.page);
    }
  } catch (err) {
    if (isStale()) return;
    setError(err instanceof Error ? err.message : "Discover failed");
  } finally {
    if (!isStale()) setLoading(false);
  }
}
