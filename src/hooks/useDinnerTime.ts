// Family-friendly movie discovery hook — Netflix/Prime/Disney+ with PG-13 filter (DINR-01)

import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbFetch } from '@/services/tmdb/client';
import { fetchMovieDetails } from '@/services/tmdb/details';
import { useRegionStore } from '@/stores/regionStore';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import type { TMDBDiscoverResponse, TMDBMovieDetails } from '@/types/movie';

// Streaming service provider IDs (TMDB)
export const DINNER_TIME_SERVICES = {
  NETFLIX: 8,
  PRIME: 9,
  DISNEY_PLUS: 337,
} as const;

export type DinnerTimeServiceId = (typeof DINNER_TIME_SERVICES)[keyof typeof DINNER_TIME_SERVICES];

// Family-friendly genre IDs: Family(10751), Animation(16), Adventure(12), Comedy(35)
const FAMILY_GENRES = '10751|16|12|35';

interface UseDinnerTimeReturn {
  movie: TMDBMovieDetails | null;
  isLoading: boolean;
  error: string | null;
  nextMovie: () => void;
  setService: (id: DinnerTimeServiceId) => void;
  currentService: DinnerTimeServiceId;
}

/**
 * useDinnerTime — Discovers family-friendly movies available on a selected streaming service.
 *
 * Filters by:
 * - Certification: PG-13 and below (US certification_country)
 * - Genres: Family, Animation, Adventure, Comedy
 * - Minimum rating: 6.0
 * - Watch provider: Netflix (8), Prime (9), or Disney+ (337) for user's region
 *
 * Returns random movies from discover results, avoiding already-shown movies.
 * Fetches full TMDBMovieDetails for the selected movie. (DINR-01)
 */
export function useDinnerTime(
  initialService: DinnerTimeServiceId = DINNER_TIME_SERVICES.NETFLIX,
): UseDinnerTimeReturn {
  const [currentService, setCurrentService] =
    useState<DinnerTimeServiceId>(initialService);
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = useRegionStore((s) => s.effectiveRegion)();
  const regionRef = useRef(region);
  regionRef.current = region;

  const trackShown = useMovieHistoryStore((s) => s.trackShown);
  const getExcludeSet = useMovieHistoryStore((s) => s.getExcludeSet);

  const fetchNext = useCallback(
    async (serviceId: DinnerTimeServiceId) => {
      setIsLoading(true);
      setError(null);

      const currentRegion = regionRef.current;

      try {
        // Fetch a random page of family-friendly movies on the selected service
        const randomPage = Math.floor(Math.random() * 5) + 1;

        const response = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', {
          certification_country: 'US',
          'certification.lte': 'PG-13',
          with_genres: FAMILY_GENRES,
          'vote_average.gte': 6.0,
          with_watch_providers: serviceId,
          watch_region: currentRegion,
          sort_by: 'popularity.desc',
          page: randomPage,
        });

        const excludeSet = getExcludeSet();
        const available = response.results.filter((m) => !excludeSet.has(m.id));

        if (available.length === 0) {
          // Try page 1 without the exclude filter as a fallback
          const fallback = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', {
            certification_country: 'US',
            'certification.lte': 'PG-13',
            with_genres: FAMILY_GENRES,
            'vote_average.gte': 6.0,
            with_watch_providers: serviceId,
            watch_region: currentRegion,
            sort_by: 'popularity.desc',
            page: 1,
          });

          if (fallback.results.length === 0) {
            setError(
              `No family-friendly movies found on this service in your region. Try another service.`,
            );
            setMovie(null);
            return;
          }

          const randomFallback =
            fallback.results[Math.floor(Math.random() * fallback.results.length)];
          const details = await fetchMovieDetails(randomFallback.id);
          trackShown(details.id);
          setMovie(details);
          return;
        }

        // Pick a random movie from available results
        const selected = available[Math.floor(Math.random() * available.length)];

        // Fetch full movie details
        const details = await fetchMovieDetails(selected.id);
        trackShown(details.id);
        setMovie(details);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load family-friendly movies',
        );
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    },
    [trackShown, getExcludeSet],
  );

  // Fetch initial movie on mount and when service changes
  useEffect(() => {
    fetchNext(currentService);
  }, [currentService, fetchNext]);

  const nextMovie = useCallback(() => {
    fetchNext(currentService);
  }, [currentService, fetchNext]);

  const setService = useCallback(
    (id: DinnerTimeServiceId) => {
      setCurrentService(id);
      setMovie(null);
    },
    [],
  );

  return { movie, isLoading, error, nextMovie, setService, currentService };
}
