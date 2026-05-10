import { useEffect, useMemo, useState, useCallback } from "react";
import { SlidersHorizontal, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBrowseStore } from "@/stores/browseStore";
import { useBrowseMovies } from "@/hooks/useBrowseMovies";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useScrolled } from "@/hooks/useScrolled";
import { hasNonDefaultFilters } from "@/services/tmdb/browse";
import { MetalDropdown } from "@/components/ui";
import { BrowseMovieGrid } from "@/components/browse/BrowseMovieGrid";
import { BrowseFilterSidebar } from "@/components/browse/BrowseFilterSidebar";
import { BrowseProviderLauncher } from "@/components/browse/BrowseProviderLauncher";
import { BrowseProviderChip } from "@/components/browse/BrowseProviderChip";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "title.asc", label: "A → Z" },
  { value: "title.desc", label: "Z → A" },
];

// The visible motion during empty↔filled is carried by the card→chip
// layoutId morph. Panels enter instantly (no fade-in) and exit by fading
// out beneath the entering panel — eliminates the mid-transition blank gap
// a crossfade would create while the entering content is still at low opacity.
const PANEL_EXIT = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function BrowsePage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const scrolled = useScrolled(8);

  const selectedProviderId = useBrowseStore((s) => s.selectedProviderId);
  const userDidClear = useBrowseStore((s) => s.userDidClear);
  const sortBy = useBrowseStore((s) => s.sortBy);
  const filters = useBrowseStore((s) => s.filters);
  const setProvider = useBrowseStore((s) => s.setProvider);
  const setSortBy = useBrowseStore((s) => s.setSortBy);
  const resetFilters = useBrowseStore((s) => s.resetFilters);

  const { results, isLoading, error, hasMore, totalResults, loadMore, browse } =
    useBrowseMovies();

  const { providers: regionProviders } = useRegionProviders();
  const myServices = usePreferencesStore((s) => s.myServices);

  // Auto-pick first saved service on first arrival. Once the user clears
  // the chip, userDidClear is true and the launcher stays open until the
  // user picks again. setProvider(null) sets userDidClear=true; picking
  // any provider implicitly leaves userDidClear at whatever it was, but
  // selectedProviderId !== null guards subsequent runs anyway.
  useEffect(() => {
    if (selectedProviderId !== null || userDidClear) return;
    if (myServices.length > 0) setProvider(myServices[0]);
  }, [myServices, selectedProviderId, userDidClear, setProvider]);

  const selectedProvider = useMemo(
    () =>
      selectedProviderId === null
        ? null
        : (regionProviders.find((p) => p.provider_id === selectedProviderId) ??
          null),
    [regionProviders, selectedProviderId],
  );

  const handleClearProvider = useCallback(
    () => setProvider(null),
    [setProvider],
  );
  const handleFilterClose = useCallback(() => setFilterOpen(false), []);

  const filtersActive = hasNonDefaultFilters(filters);
  const isEmpty = selectedProviderId === null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="sync" initial={false}>
        {isEmpty ? (
          <motion.section
            key="launcher"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: PANEL_EXIT }}
            className="py-8 sm:py-12"
            aria-label="Pick a streaming service to browse"
          >
            <header className="mb-8 sm:mb-10">
              <h1
                data-testid="browse-heading"
                className="text-clay-text font-heading font-bold text-2xl sm:text-3xl tracking-tight"
              >
                Browse
              </h1>
              <p className="text-clay-text-muted text-sm sm:text-base mt-1.5 max-w-prose">
                Pick a service. The night is yours.
              </p>
            </header>

            <BrowseProviderLauncher onSelect={setProvider} />
          </motion.section>
        ) : (
          <motion.section
            key="results"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: PANEL_EXIT }}
            className="pt-3"
            aria-label={
              selectedProvider
                ? `${selectedProvider.provider_name} catalog`
                : "Movie catalog"
            }
          >
            {/* Box-shadow strengthens once scrolled so the bar reads as a
                floating panel only when it's actually floating. */}
            <div
              className="
                sticky top-14 z-30
                -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3
                bg-clay-base/92 sm:bg-clay-base/70 backdrop-blur-xl
                border-b border-white/[0.08]
                transition-shadow duration-300
              "
              style={{
                boxShadow: scrolled
                  ? "0 8px 24px -12px rgba(0,0,0,0.32)"
                  : "0 0 0 transparent",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {selectedProvider && (
                  <BrowseProviderChip
                    provider={selectedProvider}
                    onClear={handleClearProvider}
                  />
                )}

                <div className="ml-auto flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="w-[150px] sm:w-[180px]">
                    <MetalDropdown
                      label=""
                      options={SORT_OPTIONS}
                      value={sortBy}
                      onChange={setSortBy}
                    />
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    aria-label={
                      filtersActive
                        ? "Open filters (filters active)"
                        : "Open filters"
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      relative flex-shrink-0 p-2.5 rounded-xl cursor-pointer
                      bg-clay-surface clay-shadow-sm
                      text-clay-text-muted hover:text-clay-text
                      transition-colors duration-200
                      outline-none focus-visible:ring-2 focus-visible:ring-accent
                      border border-white/[0.08]
                    "
                  >
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    {filtersActive && (
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent"
                        aria-hidden="true"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.button>
                </div>
              </div>

              {totalResults > 0 && (
                <p className="text-clay-text-muted text-xs mt-2 tabular-nums">
                  {totalResults.toLocaleString()}{" "}
                  {totalResults === 1 ? "movie" : "movies"}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                }}
                className="flex flex-col items-center gap-4 py-16 text-center"
                role="alert"
              >
                <AlertCircle
                  className="w-8 h-8 text-clay-text-muted"
                  aria-hidden="true"
                />
                <p className="text-clay-text-muted text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => browse()}
                  className="text-sm text-accent font-medium underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Try again
                </button>
              </motion.div>
            )}

            {!error && (
              <div className="mt-5">
                <BrowseMovieGrid
                  results={results}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  totalResults={totalResults}
                  providerName={selectedProvider?.provider_name ?? null}
                  onClearFilters={resetFilters}
                />
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <BrowseFilterSidebar open={filterOpen} onClose={handleFilterClose} />
    </div>
  );
}
