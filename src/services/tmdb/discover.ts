// Movie discovery with progressive filter relaxation

import { tmdbFetch } from './client';
import { getCached, setCache, TTL } from '@/services/cache/cache-manager';
import type { TMDBDiscoverResponse, TMDBMovie } from '@/types/movie';

export interface DiscoverFilters {
  genreId: string | null;
  providerId: number | null;
  minRating: number;
  minVoteCount: number;
  region: string;
}

interface RelaxationOverrides {
  minRating?: number;
  minVoteCount?: number;
  genreId?: null;
  providerId?: null;
}

// Progressive filter relaxation steps (5 steps per research doc):
// Step 0: Original filters unchanged
// Step 1: Lower rating and vote thresholds
// Step 2: Remove genre filter
// Step 3: Further lower rating and vote thresholds
// Step 4: Remove provider filter (widest possible search)
const RELAXATION_STEPS: RelaxationOverrides[] = [
  {}, // Step 0: original filters
  { minRating: 5.5, minVoteCount: 200 }, // Step 1: relax quality thresholds
  { genreId: null }, // Step 2: remove genre constraint
  { minRating: 5.0, minVoteCount: 50 }, // Step 3: further relax thresholds
  { providerId: null }, // Step 4: remove provider constraint
];

export async function discoverMovie(
  filters: DiscoverFilters,
  excludeIds: Set<number>,
  relaxationStep = 0,
): Promise<{ movie: TMDBMovie | null; relaxationStep: number }> {
  // Apply cumulative relaxation overrides up to current step
  const relaxed = { ...filters };
  for (let i = 0; i <= relaxationStep; i++) {
    const step = RELAXATION_STEPS[i];
    if (step.minRating !== undefined) relaxed.minRating = step.minRating;
    if (step.minVoteCount !== undefined) relaxed.minVoteCount = step.minVoteCount;
    if ('genreId' in step) relaxed.genreId = step.genreId!;
    if ('providerId' in step) relaxed.providerId = step.providerId!;
  }

  // Build TMDB discover params
  const params: Record<string, string | number | boolean> = {
    sort_by: 'popularity.desc',
    'vote_count.gte': relaxed.minVoteCount,
    'vote_average.gte': relaxed.minRating,
    include_adult: 'false',
    page: Math.floor(Math.random() * 20) + 1,
  };

  if (relaxed.genreId) {
    params.with_genres = relaxed.genreId;
  }

  // CRITICAL: with_watch_providers ALWAYS paired with watch_region (Pitfall 3)
  if (relaxed.providerId) {
    params.with_watch_providers = relaxed.providerId;
    params.watch_region = relaxed.region;
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', params);

  // Filter out already-seen movies
  const available = response.results.filter((m) => !excludeIds.has(m.id));

  if (available.length > 0) {
    // Pick a random movie from available results
    const randomIndex = Math.floor(Math.random() * available.length);
    return { movie: available[randomIndex], relaxationStep };
  }

  // No results at this relaxation level — try next step
  if (relaxationStep < RELAXATION_STEPS.length - 1) {
    return discoverMovie(filters, excludeIds, relaxationStep + 1);
  }

  // All relaxation steps exhausted
  return { movie: null, relaxationStep };
}
