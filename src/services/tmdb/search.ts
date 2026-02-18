// Movie search by query with pagination support

import { tmdbFetch } from './client';
import { getCached, setCache, TTL } from '@/services/cache/cache-manager';
import type { TMDBDiscoverResponse } from '@/types/movie';

export async function searchMovies(
  query: string,
  page = 1,
): Promise<TMDBDiscoverResponse> {
  const normalizedQuery = query.toLowerCase().trim();
  const cacheKey = `search-${normalizedQuery}-page${page}`;

  // Check cache first — return if fresh
  const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>('/search/movie', {
    query: normalizedQuery,
    page,
  });

  await setCache(cacheKey, response, TTL.SEARCH_RESULTS);

  return response;
}
