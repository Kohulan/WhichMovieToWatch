// Movie details with appended credits, videos, and watch providers

import { tmdbFetch } from './client';
import { getCached, setCache, TTL } from '@/services/cache/cache-manager';
import type { TMDBMovieDetails } from '@/types/movie';

export async function fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  const cacheKey = `movie-details-${movieId}`;

  // Check cache first — return if fresh
  const cached = await getCached<TMDBMovieDetails>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  // Fetch full details with credits, videos, and providers in a single call
  const details = await tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: 'watch/providers,credits,videos',
  });

  // Cache result
  await setCache(cacheKey, details, TTL.MOVIE_DETAILS);

  return details;
}
