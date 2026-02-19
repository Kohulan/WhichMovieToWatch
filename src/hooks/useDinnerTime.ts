// Family-friendly movie discovery hook — Netflix/Prime/Disney+ with PG-13 filter (DINR-01)

import { useState, useEffect, useCallback } from 'react';
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

// Widened to accept any TMDB provider ID (not just the 3 featured services)
export type DinnerTimeServiceId = number;

// Family-friendly genre IDs: Family(10751), Animation(16), Adventure(12), Comedy(35)
const FAMILY_GENRES = '10751|16|12|35';
const FAMILY_GENRE_IDS = new Set([10751, 16, 12, 35]);

// Genres to explicitly exclude — not suitable for family movie night even when
// combined with a family-friendly genre (e.g. a Horror-Comedy or Crime-Adventure)
const EXCLUDED_GENRE_IDS = new Set([27, 53, 80, 10752]); // Horror, Thriller, Crime, War
const EXCLUDED_GENRES = [...EXCLUDED_GENRE_IDS].join(',');

/** Client-side guard: movie must have at least one family genre and no excluded genres */
function isFamilyFriendly(movie: TMDBMovieDetails): boolean {
  const genreIds = movie.genres?.map((g) => g.id) ?? [];
  if (genreIds.some((id) => EXCLUDED_GENRE_IDS.has(id))) return false;
  return genreIds.some((id) => FAMILY_GENRE_IDS.has(id));
}

export interface UseDinnerTimeReturn {
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

  const trackShown = useMovieHistoryStore((s) => s.trackShown);
  const getExcludeSet = useMovieHistoryStore((s) => s.getExcludeSet);

  const fetchNext = useCallback(
    async (serviceId: DinnerTimeServiceId) => {
      setIsLoading(true);
      setError(null);

      const maxRetries = 3;

      const discoverParams = {
        certification_country: 'US',
        'certification.lte': 'PG-13',
        with_genres: FAMILY_GENRES,
        without_genres: EXCLUDED_GENRES,
        include_adult: false,
        'vote_average.gte': 6.0,
        with_watch_providers: serviceId,
        watch_region: region,
        sort_by: 'popularity.desc',
      };

      try {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const randomPage = Math.floor(Math.random() * 5) + 1;

          const response = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', {
            ...discoverParams,
            page: randomPage,
          });

          const excludeSet = getExcludeSet();
          let candidates = response.results.filter((m) => !excludeSet.has(m.id));

          if (candidates.length === 0) {
            // Try page 1 without the exclude filter as a fallback
            const fallback = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', {
              ...discoverParams,
              page: 1,
            });
            candidates = fallback.results;
          }

          if (candidates.length === 0) {
            setError(
              `No family-friendly movies found on this service in your region. Try another service.`,
            );
            setMovie(null);
            return;
          }

          // Shuffle and try candidates until one passes the client-side check
          const shuffled = [...candidates].sort(() => Math.random() - 0.5);

          for (const candidate of shuffled) {
            const details = await fetchMovieDetails(candidate.id);
            trackShown(details.id);

            if (isFamilyFriendly(details)) {
              setMovie(details);
              return;
            }
          }
          // All candidates on this page failed — retry with a different page
        }

        // Exhausted retries — show error
        setError(
          'Could not find a suitable family-friendly movie. Please try again.',
        );
        setMovie(null);
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
    [trackShown, getExcludeSet, region],
  );

  // Fetch movie on mount, when service changes, or when region changes
  useEffect(() => {
    fetchNext(currentService);
  }, [currentService, fetchNext]);

  const nextMovie = useCallback(() => {
    fetchNext(currentService);
  }, [currentService, fetchNext]);

  const setService = useCallback(
    (id: DinnerTimeServiceId) => {
      setCurrentService(id);
      // Don't null the movie — let the old movie stay visible while the new
      // one loads so the backdrop and hero crossfade smoothly (DINR-05).
    },
    [],
  );

  return { movie, isLoading, error, nextMovie, setService, currentService };
}
