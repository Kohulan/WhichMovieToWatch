import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useSearchMovies } from '@/hooks/useSearchMovies';
import { useSearchStore } from '@/stores/searchStore';
import { useRegionStore } from '@/stores/regionStore';
import { tmdbFetch } from '@/services/tmdb/client';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { AdvancedFilters } from './AdvancedFilters';
import { FilterPresets } from './FilterPresets';
import type { TMDBDiscoverResponse } from '@/types/movie';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProviderId?: number | null;
}

/** Check if any advanced filters are non-default */
function hasNonDefaultFilters(
  filters: ReturnType<typeof useSearchStore.getState>['advancedFilters'],
  sortBy: string,
): boolean {
  const currentYear = new Date().getFullYear();
  return (
    filters.genres.length > 0 ||
    filters.yearRange[0] !== 1900 ||
    filters.yearRange[1] !== currentYear ||
    filters.ratingRange[0] !== 0 ||
    filters.ratingRange[1] !== 10 ||
    filters.runtimeRange[0] !== 0 ||
    filters.runtimeRange[1] !== 300 ||
    filters.language !== null ||
    filters.providerId !== null ||
    sortBy !== 'popularity.desc'
  );
}

/**
 * SearchModal — Full-screen search overlay with text search, voice input,
 * advanced filters, filter presets, and paginated results.
 *
 * Backdrop close (SRCH-05) and Escape key close (SRCH-05).
 * Auto-focuses search input on open (A11Y-03).
 * Uses useSearchMovies for text-only search.
 * Uses tmdbFetch /discover/movie when advanced filters are active.
 * onSelectMovie navigates to /#/?movie={id} for deep-link (SRCH-04).
 */
export function SearchModal({ isOpen, onClose, initialProviderId }: SearchModalProps) {
  const { search, loadMore, results, isLoading, hasMore } = useSearchMovies();
  const advancedFilters = useSearchStore((s) => s.advancedFilters);
  const sortBy = useSearchStore((s) => s.sortBy);
  const setResults = useSearchStore((s) => s.setResults);
  const appendResults = useSearchStore((s) => s.appendResults);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);
  const reset = useSearchStore((s) => s.reset);
  const setAdvancedFilters = useSearchStore((s) => s.setAdvancedFilters);
  const currentPage = useSearchStore((s) => s.currentPage);
  const totalPages = useSearchStore((s) => s.totalPages);

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const region = useRegionStore((s) => s.effectiveRegion)();

  // Apply initialProviderId when modal opens with a preset
  useEffect(() => {
    if (isOpen && initialProviderId != null) {
      setAdvancedFilters({ providerId: initialProviderId });
    }
  }, [isOpen, initialProviderId, setAdvancedFilters]);

  // Close on Escape key + lock body scroll (SRCH-05)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Reset search state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentQuery('');
      setActivePresetId(null);
    }
  }, [isOpen, reset]);

  // Run discover search when advanced filters change and filters are non-default
  useEffect(() => {
    if (!isOpen) return;

    const filtersActive = hasNonDefaultFilters(advancedFilters, sortBy);
    if (!filtersActive) {
      // No advanced filters — use text search or clear results
      if (currentQuery) {
        search(currentQuery);
      } else {
        reset();
      }
      return;
    }

    // Build discover params from advancedFilters
    runDiscoverSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters, sortBy, isOpen]);

  async function runDiscoverSearch(page: number) {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number | boolean> = {
        sort_by: sortBy,
        include_adult: 'false',
        page,
      };

      if (advancedFilters.genres.length > 0) {
        params.with_genres = advancedFilters.genres.join(',');
      }

      if (advancedFilters.yearRange[0] !== 1900) {
        params['primary_release_date.gte'] = `${advancedFilters.yearRange[0]}-01-01`;
      }
      if (advancedFilters.yearRange[1] !== new Date().getFullYear()) {
        params['primary_release_date.lte'] = `${advancedFilters.yearRange[1]}-12-31`;
      }

      if (advancedFilters.ratingRange[0] !== 0) {
        params['vote_average.gte'] = advancedFilters.ratingRange[0];
      }
      if (advancedFilters.ratingRange[1] !== 10) {
        params['vote_average.lte'] = advancedFilters.ratingRange[1];
      }

      if (advancedFilters.runtimeRange[0] !== 0) {
        params['with_runtime.gte'] = advancedFilters.runtimeRange[0];
      }
      if (advancedFilters.runtimeRange[1] !== 300) {
        params['with_runtime.lte'] = advancedFilters.runtimeRange[1];
      }

      if (advancedFilters.language) {
        params.with_original_language = advancedFilters.language;
      }

      if (advancedFilters.providerId) {
        params.with_watch_providers = advancedFilters.providerId;
        // CRITICAL: with_watch_providers ALWAYS paired with watch_region
        params.watch_region = region;
      }

      const response = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', params);

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
      setError(err instanceof Error ? err.message : 'Discover failed');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = useCallback(
    (query: string) => {
      setCurrentQuery(query);

      // If advanced filters are active, add text query as part of them
      // Note: TMDB /discover/movie doesn't support text search — so if query
      // is present AND filters are active, use text search endpoint with filters
      // For simplicity: text query uses /search/movie; no text = /discover/movie
      const filtersActive = hasNonDefaultFilters(
        useSearchStore.getState().advancedFilters,
        useSearchStore.getState().sortBy,
      );

      if (!filtersActive) {
        search(query);
      }
      // If filters active: the filters useEffect above handles it
      // (search query is passed via the text search only when no filters)
    },
    [search],
  );

  const handleLoadMore = useCallback(() => {
    const filtersActive = hasNonDefaultFilters(advancedFilters, sortBy);

    if (filtersActive) {
      runDiscoverSearch(currentPage + 1);
    } else {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters, sortBy, currentPage, loadMore]);

  const handleSelectMovie = useCallback(
    (movieId: number) => {
      onClose();
      // Navigate to discovery page with deep-link
      window.location.hash = `/?movie=${movieId}`;
    },
    [onClose],
  );

  const hasMoreResults = hasMore || currentPage < totalPages;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — click to close (SRCH-05). Animates backdrop-filter blur for cinematic entrance. */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Content panel — dramatic slide-up from bottom with spring entrance */}
          <motion.div
            key="search-panel"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed inset-x-0 bottom-0 z-50
              bg-clay-base/80 backdrop-blur-2xl border-t border-white/10
              rounded-t-[24px]
              max-h-[90vh]
              flex flex-col
              overflow-hidden
            "
            role="dialog"
            aria-modal="true"
            aria-label="Search movies"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden="true" />
            </div>

            {/* Header: title + close button */}
            <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
              <h2 className="font-heading font-bold text-lg text-clay-text">
                Search
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="
                  p-2 rounded-full text-clay-text-muted
                  hover:text-clay-text hover:bg-clay-base/40
                  transition-colors
                  outline-none focus-visible:ring-2 focus-visible:ring-accent
                "
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Search bar with focus trap */}
            <div className="px-4 pb-3 flex-shrink-0">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Filter presets */}
              <div className="pb-2">
                <FilterPresets
                  activePresetId={activePresetId}
                  onPresetSelect={setActivePresetId}
                />
              </div>

              {/* Advanced filters */}
              <div className="pb-2 border-b border-clay-base/30">
                <AdvancedFilters />
              </div>

              {/* Search results */}
              <SearchResults
                results={results}
                onSelectMovie={handleSelectMovie}
                isLoading={isLoading}
                hasMore={hasMoreResults}
                onLoadMore={handleLoadMore}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
