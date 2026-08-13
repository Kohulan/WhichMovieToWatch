import { useEffect, useMemo, useState, useCallback } from "react";
import { SlidersHorizontal, AlertCircle, Dices, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useBrowseStore } from "@/stores/browseStore";
import { useBrowseMovies } from "@/hooks/useBrowseMovies";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useScrolled } from "@/hooks/useScrolled";
import { useHaptics } from "@/hooks/useHaptics";
import { hasNonDefaultFilters } from "@/services/tmdb/browse";
import { getGenreName } from "@/lib/genre-map";
import { moviePath } from "@/lib/movie-url";
import { showToast } from "@/components/shared/Toast";
import { MetalDropdown } from "@/components/ui";
import { BrowseMovieGrid } from "@/components/browse/BrowseMovieGrid";
import { BrowseFilterSidebar } from "@/components/browse/BrowseFilterSidebar";
import { BrowseProviderLauncher } from "@/components/browse/BrowseProviderLauncher";
import { BrowseProviderChip } from "@/components/browse/BrowseProviderChip";
import { Seo, routeSeoProps } from "@/components/seo/Seo";
import { getRouteMeta } from "@/seo/meta";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "title.asc", label: "A → Z" },
  { value: "title.desc", label: "Z → A" },
];

// Only the exit is animated. Entering panels start at opacity 1 so the
// card→chip layoutId morph carries the motion alone; an enter fade would
// just fight the morph and create a blank mid-transition gap.
const EXIT_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function BrowsePage() {
  const navigate = useNavigate();
  const { trigger: triggerHaptics } = useHaptics();
  const [filterOpen, setFilterOpen] = useState(false);
  const scrolled = useScrolled(8);

  const selectedProviderId = useBrowseStore((s) => s.selectedProviderId);
  const userDidClear = useBrowseStore((s) => s.userDidClear);
  const sortBy = useBrowseStore((s) => s.sortBy);
  const filters = useBrowseStore((s) => s.filters);
  const setProvider = useBrowseStore((s) => s.setProvider);
  const setSortBy = useBrowseStore((s) => s.setSortBy);
  const setFilters = useBrowseStore((s) => s.setFilters);
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

  const handleLuckyPick = useCallback(() => {
    if (results.length === 0) return;
    const randomMovie = results[Math.floor(Math.random() * results.length)];
    triggerHaptics("success");
    showToast(`🎲 Surprise Pick: ${randomMovie.title}`, "success");
    navigate(moviePath(randomMovie));
  }, [results, triggerHaptics, navigate]);

  const activeFilterCount = useMemo(() => {
    let count = filters.genres.length;
    if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) count++;
    if (filters.runtimeRange[0] !== 0 || filters.runtimeRange[1] !== 300) count++;
    if (filters.language) count++;
    return count;
  }, [filters]);

  const filtersActive = hasNonDefaultFilters(filters);
  const isEmpty = selectedProviderId === null;

  // Launcher ⇄ results is a full content swap on the SAME route, so AppShell's
  // route-keyed scroll reset never fires. Without this, clearing the chip while
  // deep in a long grid strands the viewport below the (much shorter) launcher.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isEmpty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Seo {...routeSeoProps(getRouteMeta("/browse")!)} />
      <AnimatePresence mode="sync" initial={false}>
        {isEmpty ? (
          <motion.section
            key="launcher"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: EXIT_TRANSITION }}
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
            exit={{ opacity: 0, transition: EXIT_TRANSITION }}
            className="pt-1"
            aria-label={
              selectedProvider
                ? `${selectedProvider.provider_name} catalog`
                : "Movie catalog"
            }
          >
            {/* Command Island Header — frosted glass floating console */}
            <div className="sticky top-14 z-30 py-2 sm:py-2.5">
              <div
                className="
                  rounded-2xl sm:rounded-3xl p-1.5 sm:p-2
                  bg-clay-base/90 sm:bg-clay-base/80
                  backdrop-blur-2xl
                  border border-black/[0.06] dark:border-white/[0.08]
                  transition-all duration-300
                "
                style={{
                  boxShadow: scrolled
                    ? "0 14px 34px -10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 4px 20px -4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selectedProvider && (
                    <BrowseProviderChip
                      provider={selectedProvider}
                      onClear={handleClearProvider}
                    />
                  )}

                  {totalResults > 0 && (
                    <div className="hidden sm:inline-flex items-center gap-1.5 px-3 h-10 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-clay-text-muted text-xs font-medium tabular-nums flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                      <span>{totalResults.toLocaleString()} {totalResults === 1 ? "movie" : "movies"}</span>
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Surprise Lucky Pick with interactive spinning dice */}
                    <motion.button
                      type="button"
                      onClick={handleLuckyPick}
                      disabled={results.length === 0}
                      title="Pick a random movie from this list"
                      aria-label="Pick a random movie from this list"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      className="
                        relative flex-shrink-0 h-10 px-3.5 rounded-2xl cursor-pointer
                        hidden sm:inline-flex items-center gap-2
                        bg-accent/10 hover:bg-accent/20 active:bg-accent/25
                        text-accent font-semibold text-xs sm:text-sm
                        border border-accent/25 hover:border-accent/40
                        transition-all duration-200
                        outline-none focus-visible:ring-2 focus-visible:ring-accent
                      "
                    >
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex-shrink-0"
                      >
                        <Dices className="w-4 h-4 text-accent" />
                      </motion.div>
                      <span>Surprise</span>
                    </motion.button>

                    <div className="w-[140px] sm:w-[165px] flex-shrink-0">
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
                          ? `Open filters (${activeFilterCount} active)`
                          : "Open filters"
                      }
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative flex-shrink-0 h-10 rounded-2xl cursor-pointer
                        flex items-center justify-center gap-1.5 px-3
                        transition-all duration-200
                        outline-none focus-visible:ring-2 focus-visible:ring-accent
                        ${
                          filtersActive
                            ? "bg-accent text-white shadow-md shadow-accent/25 border border-accent"
                            : "bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-clay-text-muted hover:text-clay-text border border-black/[0.06] dark:border-white/[0.08] hover:border-accent/40"
                        }
                      `}
                    >
                      <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                      {filtersActive && (
                        <span className="text-xs font-bold px-1 py-0.2 rounded-full bg-white/25 tabular-nums">
                          {activeFilterCount}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filter Removable Pills */}
            {filtersActive && (
              <div className="flex items-center gap-1.5 flex-wrap pt-3 px-1">
                <span className="text-2xs text-clay-text-muted uppercase tracking-wider font-semibold mr-0.5">
                  Filters:
                </span>
                {filters.genres.map((gId) => (
                  <button
                    key={gId}
                    type="button"
                    onClick={() => {
                      triggerHaptics("light");
                      setFilters({ genres: filters.genres.filter((id) => id !== gId) });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors cursor-pointer"
                  >
                    <span>{getGenreName(gId)}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {(filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptics("light");
                      setFilters({ ratingRange: [0, 10] });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors cursor-pointer"
                  >
                    <span>★ {filters.ratingRange[0]}–{filters.ratingRange[1]}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {(filters.runtimeRange[0] !== 0 || filters.runtimeRange[1] !== 300) && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptics("light");
                      setFilters({ runtimeRange: [0, 300] });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors cursor-pointer"
                  >
                    <span>{filters.runtimeRange[0]}–{filters.runtimeRange[1]}m</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {filters.language && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptics("light");
                      setFilters({ language: null });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors cursor-pointer"
                  >
                    <span>Lang: {filters.language}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptics("light");
                    resetFilters();
                  }}
                  className="text-2xs text-clay-text-muted hover:text-accent underline ml-1 cursor-pointer font-medium"
                >
                  Clear All
                </button>
              </div>
            )}

            {totalResults > 0 && !filtersActive && (
              <p className="sm:hidden text-clay-text-muted text-xs mt-1.5 tabular-nums">
                {totalResults.toLocaleString()}{" "}
                {totalResults === 1 ? "movie" : "movies"}
              </p>
            )}

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
              <div className="mt-3">
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
