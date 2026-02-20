import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useSearchMovies } from "@/hooks/useSearchMovies";
import { useSearchStore } from "@/stores/searchStore";
import { useRegionStore } from "@/stores/regionStore";
import { tmdbFetch } from "@/services/tmdb/client";
import { SpotlightInput } from "./SpotlightInput";
import { SpotlightResults } from "./SpotlightResults";
import { NetflixResults } from "./NetflixResults";
import { AdvancedFilters } from "./AdvancedFilters";
import { FilterPresets } from "./FilterPresets";
import type { TMDBDiscoverResponse } from "@/types/movie";

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  initialProviderId?: number | null;
  netflixMode?: boolean;
}

/** Check if any advanced filters are non-default */
function hasNonDefaultFilters(
  filters: ReturnType<typeof useSearchStore.getState>["advancedFilters"],
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
    sortBy !== "popularity.desc"
  );
}

export function SpotlightSearch({
  isOpen,
  onClose,
  initialProviderId,
  netflixMode = false,
}: SpotlightSearchProps) {
  const { search, loadMore, results, isLoading, hasMore } = useSearchMovies();
  const advancedFilters = useSearchStore((s) => s.advancedFilters);
  const sortBy = useSearchStore((s) => s.sortBy);
  const setResults = useSearchStore((s) => s.setResults);
  const appendResults = useSearchStore((s) => s.appendResults);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);
  const reset = useSearchStore((s) => s.reset);
  const setAdvancedFilters = useSearchStore((s) => s.setAdvancedFilters);
  const resetAdvancedFilters = useSearchStore((s) => s.resetAdvancedFilters);
  const currentPage = useSearchStore((s) => s.currentPage);
  const totalPages = useSearchStore((s) => s.totalPages);

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const region = useRegionStore((s) => s.effectiveRegion)();

  // A11Y-01: Capture the element that triggered the modal open, so we can
  // return focus to it when the modal closes.
  const triggerRef = useRef<Element | null>(null);

  // Apply initialProviderId when overlay opens with a non-Netflix preset.
  // Netflix mode uses text search — no provider filter needed.
  useEffect(() => {
    if (isOpen && initialProviderId != null && !netflixMode) {
      setAdvancedFilters({ providerId: initialProviderId });
    }
  }, [isOpen, initialProviderId, netflixMode, setAdvancedFilters]);

  // A11Y-01: Save trigger element on open, restore focus on close.
  // Deferred via RAF to allow AnimatePresence exit animation to play first.
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current instanceof HTMLElement) {
      const trigger = triggerRef.current;
      const raf = requestAnimationFrame(() => {
        trigger.focus();
        triggerRef.current = null;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  // Close on Escape key + lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Full cleanup when overlay closes — reset results AND advanced filters
  // to prevent stale filters from contaminating the next search session.
  useEffect(() => {
    if (!isOpen) {
      reset();
      resetAdvancedFilters();
      setCurrentQuery("");
      setActivePresetId(null);
    }
  }, [isOpen, reset, resetAdvancedFilters]);

  // Run discover search when advanced filters change and filters are non-default
  useEffect(() => {
    if (!isOpen) return;

    const filtersActive = hasNonDefaultFilters(advancedFilters, sortBy);
    if (!filtersActive) {
      if (currentQuery) {
        search(currentQuery);
      } else {
        reset();
      }
      return;
    }

    runDiscoverSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters, sortBy, isOpen]);

  async function runDiscoverSearch(page: number) {
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

      const response = await tmdbFetch<TMDBDiscoverResponse>(
        "/discover/movie",
        params,
      );

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
      setError(err instanceof Error ? err.message : "Discover failed");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = useCallback(
    (query: string) => {
      setCurrentQuery(query);

      const filtersActive = hasNonDefaultFilters(
        useSearchStore.getState().advancedFilters,
        useSearchStore.getState().sortBy,
      );

      if (!filtersActive) {
        search(query);
      }
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
      // Navigate to discover page. Netflix mode adds providers=all to show global availability.
      const params = netflixMode
        ? `movie=${movieId}&providers=all`
        : `movie=${movieId}`;
      window.location.hash = `/discover?${params}`;
    },
    [onClose, netflixMode],
  );

  const hasMoreResults = hasMore || currentPage < totalPages;

  const ResultsComponent = netflixMode ? NetflixResults : SpotlightResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="spotlight-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[16px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Centered Spotlight container */}
          <motion.div
            key="spotlight-panel"
            role="dialog"
            aria-modal="true"
            aria-label={netflixMode ? "Netflix search" : "Search movies"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-center items-start pt-[5vh] sm:pt-[10vh] px-4 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.94, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={`
                w-full max-w-2xl
                max-h-[90vh] sm:max-h-[80vh]
                bg-clay-base/80 backdrop-blur-2xl
                rounded-2xl
                border ${netflixMode ? "border-[#E50914]/20" : "border-white/10"}
                flex flex-col
                overflow-hidden
                pointer-events-auto
                clay-shadow-lg
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
                <h2 className="font-heading font-bold text-lg text-clay-text flex items-center gap-2">
                  {netflixMode && (
                    <span className="text-[#E50914] font-bold text-xl leading-none">
                      N
                    </span>
                  )}
                  {netflixMode ? "Netflix Search" : "Search"}
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

              {/* Input */}
              <div className="px-4 pb-3 flex-shrink-0">
                <SpotlightInput
                  onSearch={handleSearch}
                  netflixMode={netflixMode}
                />
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                {!netflixMode && (
                  <>
                    <div className="pb-2">
                      <FilterPresets
                        activePresetId={activePresetId}
                        onPresetSelect={setActivePresetId}
                      />
                    </div>

                    <div className="pb-2 border-b border-clay-base/30">
                      <AdvancedFilters />
                    </div>
                  </>
                )}

                <ResultsComponent
                  results={results}
                  query={currentQuery}
                  onSelectMovie={handleSelectMovie}
                  isLoading={isLoading}
                  hasMore={hasMoreResults}
                  onLoadMore={handleLoadMore}
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
