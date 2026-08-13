// Movie discovery with progressive filter relaxation

import { tmdbFetch } from "./client";
import type { TMDBDiscoverResponse, TMDBMovie } from "@/types/movie";

export interface DiscoverFilters {
  genreId: string | null;
  providerIds: number[];
  minRating: number;
  minVoteCount: number;
  region: string;
  maxRuntime?: number | null;
  minRuntime?: number | null;
  mood?: "mind-bending" | "feel-good" | "adrenaline" | "tear-jerker" | null;
}

export interface DiscoverOptions {
  /** When true, genre and provider filters are user-set preferences and must never be relaxed */
  lockUserFilters?: boolean;
}

interface RelaxationOverrides {
  minRating?: number;
  minVoteCount?: number;
  genreId?: null;
  providerIds?: [];
}

const MOOD_GENRES: Record<string, string> = {
  "mind-bending": "878,9648", // Sci-Fi + Mystery
  "feel-good": "35,10751",    // Comedy + Family
  "adrenaline": "28,53",      // Action + Thriller
  "tear-jerker": "18,10749",  // Drama + Romance
};

// Progressive filter relaxation steps (5 steps per research doc):
// Step 0: Original filters unchanged
// Step 1: Lower rating and vote thresholds
// Step 2: Remove genre filter (skipped when user locked)
// Step 3: Further lower rating and vote thresholds
// Step 4: Remove provider filter (skipped when user locked)
const RELAXATION_STEPS: RelaxationOverrides[] = [
  {}, // Step 0: original filters
  { minRating: 5.5, minVoteCount: 200 }, // Step 1: relax quality thresholds
  { genreId: null }, // Step 2: remove genre constraint
  { minRating: 5.0, minVoteCount: 50 }, // Step 3: further relax thresholds
  { providerIds: [] }, // Step 4: remove provider constraint
];

// Apply cumulative relaxation overrides up to current step
function applyRelaxation(
  filters: DiscoverFilters,
  relaxationStep: number,
  lockUserFilters: boolean,
): DiscoverFilters {
  const relaxed = { ...filters };
  for (let i = 0; i <= relaxationStep; i++) {
    const step = RELAXATION_STEPS[i];
    if (step.minRating !== undefined) relaxed.minRating = step.minRating;
    if (step.minVoteCount !== undefined)
      relaxed.minVoteCount = step.minVoteCount;
    // Skip genre/provider relaxation when user has explicitly set them
    if ("genreId" in step && !(lockUserFilters && filters.genreId)) {
      relaxed.genreId = step.genreId ?? null;
    }
    if (
      "providerIds" in step &&
      !(lockUserFilters && filters.providerIds.length > 0)
    ) {
      relaxed.providerIds = step.providerIds ?? [];
    }
  }
  return relaxed;
}

// Build TMDB discover params, fetch page 1 to learn total_pages, then pick a
// random page within the valid range (TMDB caps at 500 pages).
async function fetchDiscoverPage(
  relaxed: DiscoverFilters,
): Promise<TMDBDiscoverResponse> {
  // Build TMDB discover params (page 1 first to learn total_pages)
  const params: Record<string, string | number | boolean> = {
    sort_by: "popularity.desc",
    "vote_count.gte": relaxed.minVoteCount,
    "vote_average.gte": relaxed.minRating,
    include_adult: "false",
    page: 1,
  };

  if (relaxed.maxRuntime) {
    params["with_runtime.lte"] = relaxed.maxRuntime;
  }
  if (relaxed.minRuntime) {
    params["with_runtime.gte"] = relaxed.minRuntime;
  }

  // If mood is selected, merge or prioritize mood genres
  if (relaxed.mood && MOOD_GENRES[relaxed.mood]) {
    params.with_genres = MOOD_GENRES[relaxed.mood];
  } else if (relaxed.genreId) {
    params.with_genres = relaxed.genreId;
  }

  // Always require streaming availability so every result is streamable
  params.watch_region = relaxed.region;
  params.with_watch_monetization_types = "flatrate";

  if (relaxed.providerIds.length > 0) {
    params.with_watch_providers = relaxed.providerIds.join("|");
  }

  // Fetch page 1 to learn total_pages, then pick a random page within the valid range
  const firstPage = await tmdbFetch<TMDBDiscoverResponse>(
    "/discover/movie",
    params,
  );

  let response = firstPage;
  if (firstPage.total_pages > 1) {
    const maxPage = Math.min(firstPage.total_pages, 500); // TMDB caps at 500
    const randomPage = Math.floor(Math.random() * maxPage) + 1;
    if (randomPage > 1) {
      const randomResponse = await tmdbFetch<TMDBDiscoverResponse>(
        "/discover/movie",
        {
          ...params,
          page: randomPage,
        },
      );
      if (randomResponse.results.length > 0) {
        response = randomResponse;
      }
      // If random page is somehow empty, fall back to page 1 data
    }
  }

  return response;
}

export async function discoverMovie(
  filters: DiscoverFilters,
  excludeIds: Set<number>,
  relaxationStep = 0,
  options: DiscoverOptions = {},
): Promise<{ movie: TMDBMovie | null; relaxationStep: number }> {
  const { lockUserFilters = false } = options;

  const relaxed = applyRelaxation(filters, relaxationStep, lockUserFilters);
  const response = await fetchDiscoverPage(relaxed);

  // Filter out already-seen movies
  const available = response.results.filter((m) => !excludeIds.has(m.id));

  if (available.length > 0) {
    // Pick a random movie from available results
    const randomIndex = Math.floor(Math.random() * available.length);
    return { movie: available[randomIndex], relaxationStep };
  }

  // No results at this relaxation level — try next step
  if (relaxationStep < RELAXATION_STEPS.length - 1) {
    return discoverMovie(filters, excludeIds, relaxationStep + 1, options);
  }

  // All relaxation steps exhausted
  return { movie: null, relaxationStep };
}

/**
 * Return a shuffled pool of candidate movies for provider verification.
 * Uses flatrate-only monetization so TMDB only returns movies genuinely
 * included in streaming subscriptions (not rent/buy).
 */
export async function discoverCandidates(
  filters: DiscoverFilters,
  excludeIds: Set<number>,
  options: DiscoverOptions = {},
): Promise<{ candidates: TMDBMovie[]; relaxationStep: number }> {
  const { lockUserFilters = false } = options;

  for (
    let relaxationStep = 0;
    relaxationStep < RELAXATION_STEPS.length;
    relaxationStep++
  ) {
    const relaxed = applyRelaxation(filters, relaxationStep, lockUserFilters);
    const response = await fetchDiscoverPage(relaxed);

    // Filter out already-seen movies
    const available = response.results.filter((m) => !excludeIds.has(m.id));

    if (available.length > 0) {
      // Shuffle (Fisher-Yates) so caller iterates in random order
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      return { candidates: available, relaxationStep };
    }
  }

  // All relaxation steps exhausted
  return { candidates: [], relaxationStep: RELAXATION_STEPS.length - 1 };
}
