// Family-friendly movie discovery hook — Netflix/Prime/Disney+ with PG-13 filter (DINR-01)

import { useState, useEffect, useCallback, useRef } from "react";
import { tmdbFetch } from "@/services/tmdb/client";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { useRegionStore } from "@/stores/regionStore";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import type { TMDBDiscoverResponse, TMDBMovieDetails } from "@/types/movie";

// Streaming service provider IDs (TMDB)
export const DINNER_TIME_SERVICES = {
  NETFLIX: 8,
  PRIME: 9,
  DISNEY_PLUS: 337,
} as const;

// Widened to accept any TMDB provider ID (not just the 3 featured services)
export type DinnerTimeServiceId = number;

// Family-friendly genre IDs: Family(10751), Animation(16), Adventure(12), Comedy(35)
const FAMILY_GENRES = "10751|16|12|35";
const FAMILY_GENRE_IDS = new Set([10751, 16, 12, 35]);

// Genres to explicitly exclude — not suitable for family movie night even when
// combined with a family-friendly genre (e.g. a Horror-Comedy or Crime-Adventure)
const EXCLUDED_GENRE_IDS = new Set([27, 53, 80, 10752]); // Horror, Thriller, Crime, War
const EXCLUDED_GENRES = [...EXCLUDED_GENRE_IDS].join(",");

/** Client-side guard: movie must have at least one family genre and no excluded genres */
function isFamilyFriendly(movie: TMDBMovieDetails): boolean {
  const genreIds = movie.genres?.map((g) => g.id) ?? [];
  if (genreIds.some((id) => EXCLUDED_GENRE_IDS.has(id))) return false;
  return genreIds.some((id) => FAMILY_GENRE_IDS.has(id));
}

/** Fetch details for candidates in parallel, return first that passes family-friendly check */
async function findFamilyFriendlyMovie(
  candidateIds: number[],
  signal: AbortSignal,
): Promise<TMDBMovieDetails | null> {
  // Fetch up to 5 candidates in parallel for speed
  const batch = candidateIds.slice(0, 5);
  const results = await Promise.allSettled(
    batch.map((id) => fetchMovieDetails(id, signal)),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && isFamilyFriendly(result.value)) {
      return result.value;
    }
  }

  // If first batch had no match, try remaining candidates sequentially
  for (const id of candidateIds.slice(5)) {
    signal.throwIfAborted();
    const details = await fetchMovieDetails(id, signal);
    if (isFamilyFriendly(details)) return details;
  }

  return null;
}

export interface UseDinnerTimeReturn {
  movie: TMDBMovieDetails | null;
  isLoading: boolean;
  error: string | null;
  nextMovie: () => void;
  setService: (id: DinnerTimeServiceId) => void;
  currentService: DinnerTimeServiceId;
  /** Abort any in-flight fetch immediately (used to prevent state updates during page exit) */
  forceAbort: () => void;
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
 *
 * Uses AbortController to cancel in-flight requests when switching services
 * or unmounting, preventing race conditions and state updates on unmounted components.
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

  // Ref to hold the current AbortController so nextMovie can cancel the previous fetch
  const abortRef = useRef<AbortController | null>(null);

  const fetchNext = useCallback(
    async (serviceId: DinnerTimeServiceId, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      const maxRetries = 3;

      const discoverParams = {
        certification_country: "US",
        "certification.lte": "PG-13",
        with_genres: FAMILY_GENRES,
        without_genres: EXCLUDED_GENRES,
        include_adult: false,
        "vote_average.gte": 6.0,
        with_watch_providers: serviceId,
        watch_region: region,
        sort_by: "popularity.desc",
      };

      try {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          signal.throwIfAborted();

          const randomPage = Math.floor(Math.random() * 5) + 1;

          const response = await tmdbFetch<TMDBDiscoverResponse>(
            "/discover/movie",
            { ...discoverParams, page: randomPage },
            3,
            signal,
          );

          const excludeSet = getExcludeSet();
          let candidates = response.results.filter(
            (m) => !excludeSet.has(m.id),
          );

          if (candidates.length === 0) {
            // Try page 1 without the exclude filter as a fallback
            const fallback = await tmdbFetch<TMDBDiscoverResponse>(
              "/discover/movie",
              { ...discoverParams, page: 1 },
              3,
              signal,
            );
            candidates = fallback.results;
          }

          if (candidates.length === 0) {
            setError(
              `No family-friendly movies found on this service in your region. Try another service.`,
            );
            setMovie(null);
            return;
          }

          // Shuffle candidates
          const shuffled = [...candidates].sort(() => Math.random() - 0.5);
          const candidateIds = shuffled.map((c) => c.id);

          // Fetch details in parallel — return first family-friendly match
          const found = await findFamilyFriendlyMovie(candidateIds, signal);
          if (found) {
            trackShown(found.id);
            setMovie(found);
            return;
          }
          // All candidates on this page failed — retry with a different page
        }

        // Exhausted retries — show error
        setError(
          "Could not find a suitable family-friendly movie. Please try again.",
        );
        setMovie(null);
      } catch (err) {
        // Don't update state if the request was intentionally aborted
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load family-friendly movies",
        );
        setMovie(null);
      } finally {
        // Only clear loading if this fetch wasn't aborted (a new one is already running)
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [trackShown, getExcludeSet, region],
  );

  // Fetch movie on mount, when service changes, or when region changes.
  // Aborts the previous fetch to prevent race conditions.
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchNext(currentService, controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentService, fetchNext]);

  const nextMovie = useCallback(() => {
    // Abort any in-flight fetch before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchNext(currentService, controller.signal);
  }, [currentService, fetchNext]);

  const setService = useCallback((id: DinnerTimeServiceId) => {
    setCurrentService(id);
    // Don't null the movie — let the old movie stay visible while the new
    // one loads so the backdrop and hero crossfade smoothly (DINR-05).
  }, []);

  const forceAbort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    movie,
    isLoading,
    error,
    nextMovie,
    setService,
    currentService,
    forceAbort,
  };
}
