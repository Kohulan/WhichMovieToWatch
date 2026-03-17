import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useBrowseStore } from "@/stores/browseStore";
import { useBrowseMovies } from "@/hooks/useBrowseMovies";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { hasNonDefaultFilters } from "@/services/tmdb/browse";
import { MetalDropdown } from "@/components/ui";
import { BrowseMovieGrid } from "@/components/browse/BrowseMovieGrid";
import { BrowseFilterSidebar } from "@/components/browse/BrowseFilterSidebar";

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

  const { results, isLoading, error, hasMore, totalResults, loadMore } =
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

  const filtersActive = hasNonDefaultFilters(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Sticky top bar */}
      <div className="sticky top-14 z-30 bg-clay-base/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
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

          {/* Sort dropdown */}
          <div className="flex-1 min-w-0">
            <MetalDropdown
              label=""
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>

          {/* Filter button */}
          <motion.button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              relative p-2.5 rounded-xl cursor-pointer
              bg-clay-surface clay-shadow-sm
              text-clay-text-muted hover:text-clay-text
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent
            "
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {/* Active filter indicator dot */}
            {filtersActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            )}
          </motion.button>
        </div>
      </div>

      {/* No provider selected prompt */}
      {selectedProviderId === null && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-clay-text-muted text-sm">
            Select a streaming platform to browse movies.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-clay-text-muted text-sm">{error}</p>
          <button
            onClick={() => setProvider(selectedProviderId)}
            className="text-sm text-clay-text underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Try again
          </button>
        </div>
      )}

      {/* Movie grid */}
      {selectedProviderId !== null && !error && (
        <div className="mt-4">
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
      <BrowseFilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
