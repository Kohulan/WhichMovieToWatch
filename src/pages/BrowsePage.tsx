import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, AlertCircle, Tv } from "lucide-react";
import { motion } from "motion/react";
import { useBrowseStore } from "@/stores/browseStore";
import { useBrowseMovies } from "@/hooks/useBrowseMovies";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { hasNonDefaultFilters } from "@/services/tmdb/browse";
import { MetalDropdown } from "@/components/ui";
import { BrowseMovieGrid } from "@/components/browse/BrowseMovieGrid";
import { BrowseFilterSidebar } from "@/components/browse/BrowseFilterSidebar";
import { BrowseBentoHero } from "@/components/browse/BrowseBentoHero";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "title.asc", label: "A \u2192 Z" },
  { value: "title.desc", label: "Z \u2192 A" },
];

export default function BrowsePage() {
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedProviderId = useBrowseStore((s) => s.selectedProviderId);
  const sortBy = useBrowseStore((s) => s.sortBy);
  const filters = useBrowseStore((s) => s.filters);
  const setProvider = useBrowseStore((s) => s.setProvider);
  const setSortBy = useBrowseStore((s) => s.setSortBy);
  const resetFilters = useBrowseStore((s) => s.resetFilters);

  const { results, isLoading, error, hasMore, totalResults, loadMore, browse } =
    useBrowseMovies();

  const { providers: regionProviders } = useRegionProviders();
  const myServices = usePreferencesStore((s) => s.myServices);

  // Pre-select user's first myServices provider on mount
  useEffect(() => {
    if (selectedProviderId !== null) return;
    if (myServices.length > 0) {
      setProvider(myServices[0]);
    }
  }, [myServices, selectedProviderId, setProvider]);

  // Provider dropdown options
  const providerOptions = [
    { value: "", label: "Select a platform" },
    ...regionProviders.map((p) => ({
      value: String(p.provider_id),
      label: p.provider_name,
    })),
  ];

  // Find selected provider name for display
  const selectedProviderName =
    regionProviders.find((p) => p.provider_id === selectedProviderId)
      ?.provider_name ?? null;

  const handleFilterClose = useCallback(() => setFilterOpen(false), []);

  const filtersActive = hasNonDefaultFilters(filters);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Most Popular";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Bento Hero */}
      <BrowseBentoHero
        providerName={selectedProviderName}
        totalResults={totalResults}
        isLoading={isLoading}
        sortLabel={currentSortLabel}
      />

      {/* Toolbar — glass surface with clay depth */}
      <div
        className="
          sticky top-14 z-30
          -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3
          bg-clay-base/92 sm:bg-clay-base/70 backdrop-blur-xl
          border-b border-white/[0.08]
          transition-colors duration-500
        "
        style={{
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Mobile: stack provider on top, sort + filter below */}
        {/* Desktop: all in one row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Provider dropdown */}
          <div className="flex-1 min-w-0">
            <MetalDropdown
              label=""
              options={providerOptions}
              value={selectedProviderId ? String(selectedProviderId) : ""}
              onChange={(val) => setProvider(val === "" ? null : Number(val))}
              placeholder="Select a platform"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort dropdown */}
            <div className="flex-1 min-w-0">
              <MetalDropdown
                label=""
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={setSortBy}
              />
            </div>

            {/* Filter button — metal hardware style */}
            <motion.button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="
                relative flex-shrink-0 p-2.5 rounded-xl cursor-pointer
                bg-clay-surface clay-shadow-sm clay-texture
                text-clay-text-muted hover:text-accent
                transition-colors duration-200
                outline-none focus-visible:ring-2 focus-visible:ring-accent
                border border-white/[0.08]
              "
              style={{
                boxShadow: filtersActive
                  ? "0 0 12px color-mix(in oklch, var(--accent) 30%, transparent), 4px 4px 8px var(--clay-shadow), -2px -2px 6px var(--clay-highlight)"
                  : undefined,
              }}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              {/* Active filter indicator — glowing dot */}
              {filtersActive && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent"
                  style={{
                    boxShadow:
                      "0 0 6px var(--accent), 0 0 12px color-mix(in oklch, var(--accent) 50%, transparent)",
                  }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* No provider selected prompt */}
      {selectedProviderId === null && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex flex-col items-center gap-4 py-24 text-center"
        >
          <div
            className="p-4 rounded-2xl"
            style={{
              background: "color-mix(in oklch, var(--accent) 10%, transparent)",
              boxShadow:
                "0 0 40px color-mix(in oklch, var(--accent) 10%, transparent)",
            }}
          >
            <Tv className="w-8 h-8 text-accent/60" aria-hidden="true" />
          </div>
          <p className="text-clay-text-muted text-sm max-w-xs">
            Select a streaming platform above to explore its movie catalog.
          </p>
        </motion.div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
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

      {/* Movie grid */}
      {selectedProviderId !== null && !error && (
        <div className="mt-5">
          <BrowseMovieGrid
            results={results}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            totalResults={totalResults}
            providerName={selectedProviderName}
            onClearFilters={resetFilters}
          />
        </div>
      )}

      {/* Filter sidebar */}
      <BrowseFilterSidebar open={filterOpen} onClose={handleFilterClose} />
    </div>
  );
}
