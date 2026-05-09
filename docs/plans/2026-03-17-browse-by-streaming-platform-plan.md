# Browse by Streaming Platform — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `/browse` page that lets users browse movies on a selected streaming platform with sorting, filtering, and paginated Load More.

**Architecture:** Dedicated Zustand store + React hook + TMDB service function (Approach 1). New route at `/browse` with navbar tab integration. Filter sidebar as a slide-in drawer. All TMDB server-side sorting and filtering — no client-side sort hacks.

**Tech Stack:** React 19, TypeScript, Zustand, Framer Motion (`motion/react`), Tailwind CSS v4, TMDB `/discover/movie` API, Lucide icons

**Design Doc:** `docs/plans/2026-03-17-browse-by-streaming-platform-design.md`

---

### Task 1: Browse Service — TMDB API Integration

**Files:**
- Create: `src/services/tmdb/browse.ts`

**Step 1: Create the browse service**

```typescript
// Paginated movie browsing by streaming provider

import { tmdbFetch } from "./client";
import { getCached, setCache, TTL } from "@/services/cache/cache-manager";
import type { TMDBDiscoverResponse } from "@/types/movie";

export interface BrowseFilters {
  genres: number[];
  ratingRange: [number, number];
  yearRange: [number, number];
  language: string | null;
  runtimeRange: [number, number];
}

export interface BrowseParams {
  providerId: number;
  region: string;
  page: number;
  sortBy: string;
  filters: BrowseFilters;
}

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_FILTERS: BrowseFilters = {
  genres: [],
  ratingRange: [0, 10],
  yearRange: [1900, CURRENT_YEAR],
  language: null,
  runtimeRange: [0, 300],
};

/** Check whether any filter deviates from defaults */
function hasNonDefaultFilters(filters: BrowseFilters): boolean {
  return (
    filters.genres.length > 0 ||
    filters.ratingRange[0] !== 0 ||
    filters.ratingRange[1] !== 10 ||
    filters.yearRange[0] !== 1900 ||
    filters.yearRange[1] !== CURRENT_YEAR ||
    filters.language !== null ||
    filters.runtimeRange[0] !== 0 ||
    filters.runtimeRange[1] !== 300
  );
}

/** Build a deterministic cache key from browse params */
function buildCacheKey(params: BrowseParams): string {
  const f = params.filters;
  const filterParts = [
    f.genres.length > 0 ? `g${f.genres.sort((a, b) => a - b).join(".")}` : "",
    f.ratingRange[0] !== 0 || f.ratingRange[1] !== 10
      ? `r${f.ratingRange[0]}-${f.ratingRange[1]}`
      : "",
    f.yearRange[0] !== 1900 || f.yearRange[1] !== CURRENT_YEAR
      ? `y${f.yearRange[0]}-${f.yearRange[1]}`
      : "",
    f.language ? `l${f.language}` : "",
    f.runtimeRange[0] !== 0 || f.runtimeRange[1] !== 300
      ? `rt${f.runtimeRange[0]}-${f.runtimeRange[1]}`
      : "",
  ]
    .filter(Boolean)
    .join("-");

  return `browse-${params.providerId}-${params.region}-${params.sortBy}${filterParts ? `-${filterParts}` : ""}-p${params.page}`;
}

export async function browseMovies(
  params: BrowseParams,
  signal?: AbortSignal,
): Promise<TMDBDiscoverResponse> {
  const cacheKey = buildCacheKey(params);

  const cached = await getCached<TMDBDiscoverResponse>(cacheKey);
  if (cached.value && !cached.isStale) {
    return cached.value;
  }

  const { providerId, region, page, sortBy, filters } = params;

  const queryParams: Record<string, string | number | boolean> = {
    with_watch_providers: providerId,
    watch_region: region,
    with_watch_monetization_types: "flatrate",
    sort_by: sortBy,
    "vote_count.gte": 50,
    include_adult: false,
    page,
  };

  // Genre filter (OR logic — pipe-separated)
  if (filters.genres.length > 0) {
    queryParams.with_genres = filters.genres.join("|");
  }

  // Rating range
  if (filters.ratingRange[0] > 0) {
    queryParams["vote_average.gte"] = filters.ratingRange[0];
  }
  if (filters.ratingRange[1] < 10) {
    queryParams["vote_average.lte"] = filters.ratingRange[1];
  }

  // Year range (TMDB expects YYYY-MM-DD format)
  if (filters.yearRange[0] > 1900) {
    queryParams["primary_release_date.gte"] = `${filters.yearRange[0]}-01-01`;
  }
  if (filters.yearRange[1] < CURRENT_YEAR) {
    queryParams["primary_release_date.lte"] = `${filters.yearRange[1]}-12-31`;
  }

  // Language
  if (filters.language) {
    queryParams.with_original_language = filters.language;
  }

  // Runtime range
  if (filters.runtimeRange[0] > 0) {
    queryParams["with_runtime.gte"] = filters.runtimeRange[0];
  }
  if (filters.runtimeRange[1] < 300) {
    queryParams["with_runtime.lte"] = filters.runtimeRange[1];
  }

  const response = await tmdbFetch<TMDBDiscoverResponse>(
    "/discover/movie",
    queryParams,
    3,
    signal,
  );

  await setCache(cacheKey, response, TTL.SEARCH_RESULTS);

  return response;
}

export { DEFAULT_FILTERS, hasNonDefaultFilters };
export type { BrowseFilters as BrowseFiltersType };
```

**Step 2: Verify the project compiles**

Run: `cd /Volumes/Data_Drive/Project/2026/WhichMovieToWatch && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors related to `browse.ts`

**Step 3: Commit**

```bash
git add src/services/tmdb/browse.ts
git commit -m "feat(browse): add TMDB browse service with provider filtering, sorting, and caching"
```

---

### Task 2: Browse Store — Zustand State Management

**Files:**
- Create: `src/stores/browseStore.ts`

**Step 1: Create the browse store**

```typescript
import { create } from "zustand";
import type { TMDBMovie } from "@/types/movie";
import type { BrowseFilters } from "@/services/tmdb/browse";
import { DEFAULT_FILTERS } from "@/services/tmdb/browse";

interface BrowseState {
  selectedProviderId: number | null;
  results: TMDBMovie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  filters: BrowseFilters;

  setProvider: (id: number | null) => void;
  setSortBy: (sortBy: string) => void;
  setFilters: (filters: Partial<BrowseFilters>) => void;
  resetFilters: () => void;
  setResults: (
    results: TMDBMovie[],
    totalResults: number,
    totalPages: number,
    currentPage: number,
  ) => void;
  appendResults: (results: TMDBMovie[], currentPage: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBrowseStore = create<BrowseState>()((set) => ({
  selectedProviderId: null,
  results: [],
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  isLoading: false,
  error: null,
  sortBy: "popularity.desc",
  filters: { ...DEFAULT_FILTERS },

  setProvider: (id) =>
    set({
      selectedProviderId: id,
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setSortBy: (sortBy) =>
    set({
      sortBy,
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    })),

  resetFilters: () =>
    set({
      filters: { ...DEFAULT_FILTERS },
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setResults: (results, totalResults, totalPages, currentPage) =>
    set({ results, totalResults, totalPages, currentPage }),

  appendResults: (results, currentPage) =>
    set((state) => ({
      results: [...state.results, ...results],
      currentPage,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/stores/browseStore.ts
git commit -m "feat(browse): add Zustand browse store with provider, sort, filter, and pagination state"
```

---

### Task 3: Browse Hook — Fetch Orchestration

**Files:**
- Create: `src/hooks/useBrowseMovies.ts`

**Step 1: Create the browse hook**

```typescript
// Browse movies hook — orchestrates fetching with AbortController cleanup

import { useCallback, useEffect, useRef } from "react";
import { browseMovies } from "@/services/tmdb/browse";
import { useBrowseStore } from "@/stores/browseStore";
import { useRegionStore } from "@/stores/regionStore";

export function useBrowseMovies() {
  const selectedProviderId = useBrowseStore((s) => s.selectedProviderId);
  const results = useBrowseStore((s) => s.results);
  const currentPage = useBrowseStore((s) => s.currentPage);
  const totalPages = useBrowseStore((s) => s.totalPages);
  const totalResults = useBrowseStore((s) => s.totalResults);
  const isLoading = useBrowseStore((s) => s.isLoading);
  const error = useBrowseStore((s) => s.error);
  const sortBy = useBrowseStore((s) => s.sortBy);
  const filters = useBrowseStore((s) => s.filters);

  const region = useRegionStore((s) => s.effectiveRegion)();

  const abortRef = useRef<AbortController | null>(null);

  const browse = useCallback(async () => {
    if (selectedProviderId === null) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const store = useBrowseStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      const response = await browseMovies(
        {
          providerId: selectedProviderId,
          region,
          page: 1,
          sortBy,
          filters,
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .setResults(
            response.results,
            response.total_results,
            Math.min(response.total_pages, 500),
            response.page,
          );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .setError(
            err instanceof Error ? err.message : "Failed to load movies",
          );
      }
    } finally {
      if (!controller.signal.aborted) {
        useBrowseStore.getState().setLoading(false);
      }
    }
  }, [selectedProviderId, region, sortBy, filters]);

  const loadMore = useCallback(async () => {
    const store = useBrowseStore.getState();
    if (store.currentPage >= store.totalPages || store.isLoading) return;
    if (store.selectedProviderId === null) return;

    store.setLoading(true);

    try {
      const response = await browseMovies({
        providerId: store.selectedProviderId,
        region,
        page: store.currentPage + 1,
        sortBy: store.sortBy,
        filters: store.filters,
      });

      useBrowseStore
        .getState()
        .appendResults(response.results, response.page);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      useBrowseStore
        .getState()
        .setError(
          err instanceof Error ? err.message : "Failed to load more movies",
        );
    } finally {
      useBrowseStore.getState().setLoading(false);
    }
  }, [region]);

  // Auto-fetch when provider, sort, or filters change
  useEffect(() => {
    browse();
  }, [browse]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const hasMore = currentPage < totalPages;

  return {
    browse,
    loadMore,
    results,
    isLoading,
    error,
    hasMore,
    totalResults,
    selectedProviderId,
  };
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useBrowseMovies.ts
git commit -m "feat(browse): add useBrowseMovies hook with auto-fetch, pagination, and abort handling"
```

---

### Task 4: Browse Movie Grid Component

**Files:**
- Create: `src/components/browse/BrowseMovieGrid.tsx`

**Step 1: Create the movie grid component**

This component mirrors `src/components/search/SearchResults.tsx` in visual style. Key references:
- Poster URL: `getPosterUrl(movie.poster_path, "w185")` from `src/services/tmdb/client.ts`
- Responsive srcSet: `tmdbPosterSrcSet(movie.poster_path)` from `src/hooks/useResponsiveImage.ts`
- Sizes: `posterSizes` from `src/hooks/useResponsiveImage.ts`
- Skeleton: `ClaySkeletonCard` from `src/components/ui`
- Button: `MetalButton` from `src/components/ui`
- Loading: `LoadingQuotes` from `src/components/animation/LoadingQuotes`
- Stagger: `StaggerContainer`, `StaggerItem` from `src/components/animation/StaggerContainer`

```typescript
import { useNavigate } from "react-router";
import { getPosterUrl } from "@/services/tmdb/client";
import { tmdbPosterSrcSet, posterSizes } from "@/hooks/useResponsiveImage";
import { MetalButton } from "@/components/ui";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import type { TMDBMovie } from "@/types/movie";

interface BrowseMovieGridProps {
  results: TMDBMovie[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalResults: number;
  providerName: string | null;
  onClearFilters: () => void;
}

function getRatingColor(voteAverage: number): string {
  const pct = Math.round(voteAverage * 10);
  if (pct >= 70) return "bg-green-500/80 text-white";
  if (pct >= 50) return "bg-yellow-500/80 text-white";
  return "bg-red-500/80 text-white";
}

export function BrowseMovieGrid({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  totalResults,
  providerName,
  onClearFilters,
}: BrowseMovieGridProps) {
  const navigate = useNavigate();

  function handleMovieClick(movieId: number) {
    navigate(`/discover?movie=${movieId}&source=browse`);
  }

  // Initial loading state
  if (isLoading && results.length === 0) {
    return (
      <div aria-busy="true" aria-label="Loading movies">
        <LoadingQuotes size="sm" />
      </div>
    );
  }

  // Empty state
  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
        <p className="text-clay-text-muted text-sm">
          No movies found{providerName ? ` on ${providerName}` : ""}. Try
          adjusting your filters.
        </p>
        <MetalButton variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </MetalButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Results count */}
      {totalResults > 0 && providerName && (
        <p className="text-clay-text-muted text-xs px-4">
          {totalResults.toLocaleString()} movies on {providerName}
        </p>
      )}

      {/* Movie grid */}
      <StaggerContainer
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
        stagger={0.04}
        direction="up"
        role="list"
        aria-label="Browse movies"
      >
        {results.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, "w185");
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPct = Math.round(movie.vote_average * 10);
          const ratingColor = getRatingColor(movie.vote_average);

          return (
            <StaggerItem key={movie.id} direction="up">
              <button
                type="button"
                role="listitem"
                onClick={() => handleMovieClick(movie.id)}
                aria-label={`${movie.title}${year ? `, ${year}` : ""}, rated ${ratingPct}%`}
                className="
                  w-full text-left group
                  rounded-clay overflow-hidden
                  bg-clay-surface clay-shadow-md clay-texture
                  transition-all duration-200
                  hover:clay-shadow-lg hover:-translate-y-0.5
                  outline-none focus-visible:ring-2 focus-visible:ring-accent
                "
              >
                {/* Poster */}
                <div className="relative w-full aspect-[2/3] bg-clay-base overflow-hidden">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      srcSet={
                        movie.poster_path
                          ? tmdbPosterSrcSet(movie.poster_path)
                          : undefined
                      }
                      sizes={posterSizes}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-clay-text-muted text-xs text-center px-2">
                        No poster
                      </span>
                    </div>
                  )}

                  {/* Rating badge overlay */}
                  <div
                    className={`absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${ratingColor}`}
                    aria-hidden="true"
                  >
                    {ratingPct}%
                  </div>
                </div>

                {/* Title + year */}
                <div className="p-2">
                  <p className="text-clay-text text-xs font-semibold leading-tight line-clamp-2">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-clay-text-muted text-xs mt-0.5">
                      {year}
                    </p>
                  )}
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Load More button */}
      {hasMore && (
        <div className="flex justify-center px-4">
          <MetalButton
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            disabled={isLoading}
            aria-label="Load more movies"
          >
            {isLoading ? "Loading..." : "Load More"}
          </MetalButton>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/browse/BrowseMovieGrid.tsx
git commit -m "feat(browse): add BrowseMovieGrid component with poster cards, rating badges, and Load More"
```

---

### Task 5: Browse Filter Sidebar Component

**Files:**
- Create: `src/components/browse/BrowseFilterSidebar.tsx`

**Step 1: Create the filter sidebar**

References:
- Filter pattern: `src/components/search/AdvancedFilters.tsx` (genres, sliders, dropdowns)
- MoreSheet pattern: `src/components/layout/MoreSheet.tsx` (slide-in drawer with backdrop, body scroll lock)
- Components: `MetalCheckbox`, `MetalButton`, `MetalDropdown` from `src/components/ui`
- `DualRangeSlider` from `src/components/shared/DualRangeSlider`
- `getAllGenres` from `src/lib/genre-map`
- Framer Motion `AnimatePresence` + `motion` from `motion/react`

```typescript
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useBrowseStore } from "@/stores/browseStore";
import { MetalCheckbox, MetalButton, MetalDropdown } from "@/components/ui";
import { DualRangeSlider } from "@/components/shared/DualRangeSlider";
import { getAllGenres } from "@/lib/genre-map";

const CURRENT_YEAR = new Date().getFullYear();

const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
];

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface BrowseFilterSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function BrowseFilterSidebar({
  open,
  onClose,
}: BrowseFilterSidebarProps) {
  const filters = useBrowseStore((s) => s.filters);
  const setFilters = useBrowseStore((s) => s.setFilters);
  const resetFilters = useBrowseStore((s) => s.resetFilters);

  const allGenres = getAllGenres();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleGenreToggle = useCallback(
    (genreId: number, checked: boolean) => {
      const current = filters.genres;
      const updated = checked
        ? [...current, genreId]
        : current.filter((id) => id !== genreId);
      setFilters({ genres: updated });
    },
    [filters.genres, setFilters],
  );

  const handleClear = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar — slides in from left */}
          <motion.div
            key="filter-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="
              fixed top-0 left-0 bottom-0 z-50
              w-72 sm:w-80
              bg-clay-base/95 backdrop-blur-md
              border-r border-white/[0.12]
              shadow-[8px_0_40px_rgba(0,0,0,0.25)]
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] mt-4 mb-2">
              <span className="text-sm font-semibold text-clay-text">
                Filters
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="p-1.5 -mr-1.5 rounded-full text-clay-text-muted hover:text-clay-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
              {/* Genre multi-select */}
              <div>
                <p className="font-body text-sm font-medium text-clay-text mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <MetalCheckbox
                      key={genre.id}
                      checked={filters.genres.includes(genre.id)}
                      onChange={(checked) =>
                        handleGenreToggle(genre.id, checked)
                      }
                      label={genre.name}
                    />
                  ))}
                </div>
              </div>

              {/* Rating range */}
              <DualRangeSlider
                label="Rating"
                min={0}
                max={10}
                step={0.5}
                value={filters.ratingRange}
                onChange={(range) => setFilters({ ratingRange: range })}
                formatValue={(v) => v.toFixed(1)}
              />

              {/* Release year range */}
              <DualRangeSlider
                label="Release Year"
                min={1900}
                max={CURRENT_YEAR}
                step={1}
                value={filters.yearRange}
                onChange={(range) => setFilters({ yearRange: range })}
              />

              {/* Language */}
              <MetalDropdown
                label="Language"
                options={LANGUAGES}
                value={filters.language ?? ""}
                onChange={(val) =>
                  setFilters({ language: val === "" ? null : val })
                }
                placeholder="Any language"
              />

              {/* Runtime range */}
              <DualRangeSlider
                label="Runtime"
                min={0}
                max={300}
                step={15}
                value={filters.runtimeRange}
                onChange={(range) => setFilters({ runtimeRange: range })}
                formatValue={formatRuntime}
              />
            </div>

            {/* Footer — Clear Filters */}
            <div className="px-5 py-3 border-t border-white/[0.08]">
              <MetalButton
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                Clear Filters
              </MetalButton>
            </div>

            {/* Safe area bottom padding */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/browse/BrowseFilterSidebar.tsx
git commit -m "feat(browse): add BrowseFilterSidebar with genre, rating, year, language, and runtime filters"
```

---

### Task 6: Browse Page — Main Page Component

**Files:**
- Create: `src/pages/BrowsePage.tsx`

**Step 1: Create the browse page**

References:
- Provider list: `useRegionProviders()` from `src/hooks/useWatchProviders.ts`
- User prefs: `usePreferencesStore` from `src/stores/preferencesStore.ts`
- `MetalDropdown` from `src/components/ui`
- `SlidersHorizontal` icon from `lucide-react` for filter button
- `hasNonDefaultFilters` from `src/services/tmdb/browse`

```typescript
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
              onChange={(val) =>
                setProvider(val === "" ? null : Number(val))
              }
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
            onClick={() => useBrowseStore.getState().setProvider(selectedProviderId)}
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
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/BrowsePage.tsx
git commit -m "feat(browse): add BrowsePage with provider/sort dropdowns, filter sidebar, and movie grid"
```

---

### Task 7: Route Registration

**Files:**
- Modify: `src/main.tsx:11-15` (add import) and `src/main.tsx:40-45` (add route)

**Step 1: Add the route**

In `src/main.tsx`, add import after line 14 (the FreeMoviesPage import):

```typescript
import BrowsePage from "./pages/BrowsePage";
```

Add route entry after the `discover` route (line 41), before `trending`:

```typescript
{ path: "browse", element: <BrowsePage /> },
```

The children array should become:
```typescript
children: [
  { index: true, element: <HomePage /> },
  { path: "discover", element: <DiscoverPage /> },
  { path: "browse", element: <BrowsePage /> },
  { path: "trending", element: <TrendingPage /> },
  { path: "dinner-time", element: <DinnerTimePage /> },
  { path: "free-movies", element: <FreeMoviesPage /> },
  { path: "showcase", element: <Showcase /> },
  { path: "privacy", element: <PrivacyPage /> },
],
```

**Step 2: Verify compilation and dev server**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat(browse): register /browse route in hash router"
```

---

### Task 8: Navbar Integration

**Files:**
- Modify: `src/components/layout/Navbar.tsx:4-12` (add Tv import), `src/components/layout/Navbar.tsx:21-27` (add to allTabs), `src/components/layout/Navbar.tsx:30-34` (add to mobileTabs)

**Step 1: Add Tv to Lucide imports**

In `src/components/layout/Navbar.tsx`, add `Tv` to the Lucide import at line 4-12:

```typescript
import {
  Film,
  Search,
  Home,
  Compass,
  TrendingUp,
  UtensilsCrossed,
  Tv,
  Menu,
} from "lucide-react";
```

**Step 2: Add Browse to allTabs**

Insert after the Discover entry (line 23), before Trending (line 24):

```typescript
const allTabs = [
  { to: "/", end: true, icon: Home, label: "Home" },
  { to: "/discover", end: false, icon: Compass, label: "Discover" },
  { to: "/browse", end: false, icon: Tv, label: "Browse" },
  { to: "/trending", end: false, icon: TrendingUp, label: "Trending" },
  { to: "/dinner-time", end: false, icon: UtensilsCrossed, label: "Dinner" },
  { to: "/free-movies", end: false, icon: Film, label: "Free" },
];
```

**Step 3: Add Browse to mobileTabs**

Insert after Discover, before Dinner:

```typescript
const mobileTabs = [
  { to: "/", end: true, icon: Home, label: "Home" },
  { to: "/discover", end: false, icon: Compass, label: "Discover" },
  { to: "/browse", end: false, icon: Tv, label: "Browse" },
  { to: "/dinner-time", end: false, icon: UtensilsCrossed, label: "Dinner" },
];
```

**Step 4: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(browse): add Browse tab to desktop and mobile navbar"
```

---

### Task 9: MoreSheet Integration

**Files:**
- Modify: `src/components/layout/MoreSheet.tsx:4` (add Tv import), `src/components/layout/MoreSheet.tsx:9-12` (add to extraPages)

**Step 1: Add Tv to imports**

In `src/components/layout/MoreSheet.tsx`, update the Lucide import at line 4:

```typescript
import { TrendingUp, Film, Tv, X, Coffee, Github } from "lucide-react";
```

**Step 2: Add Browse to extraPages**

Update the `extraPages` array at line 9-12:

```typescript
const extraPages = [
  { to: "/browse", icon: Tv, label: "Browse" },
  { to: "/trending", icon: TrendingUp, label: "Trending" },
  { to: "/free-movies", icon: Film, label: "Free Movies" },
];
```

**Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/layout/MoreSheet.tsx
git commit -m "feat(browse): add Browse link to mobile MoreSheet"
```

---

### Task 10: AppShell 3D Opacity — Feature Page Treatment

**Files:**
- Modify: `src/components/layout/AppShell.tsx:190` (update isHomePage check)

**Step 1: Verify 3D background treatment**

Check `src/components/layout/AppShell.tsx` line 190:
```typescript
const isHomePage = location.pathname === "/";
```

The 3D background layer uses `opacity: isHomePage ? 1 : 0.15`. The Browse page is a feature page, so it should get 0.15 opacity — which it already will since `location.pathname` will be `/browse`, not `/`. **No change needed.**

**Step 2: Commit (skip — no changes)**

---

### Task 11: Manual Smoke Test

**Step 1: Start dev server**

Run: `npm run dev` (or `npx vite`)

**Step 2: Test navigation**

1. Verify "Browse" tab appears in desktop navbar (after Discover, before Trending)
2. Verify "Browse" tab appears in mobile navbar (4th tab)
3. Verify "Browse" appears in mobile MoreSheet
4. Click Browse tab — navigates to `/#/browse`

**Step 3: Test provider selection**

1. If user has completed onboarding (myServices set) — first provider should auto-select and movies load
2. If no myServices — "Select a platform" prompt should show
3. Change provider via dropdown — results clear and reload
4. Verify "X movies on {Provider}" count appears

**Step 4: Test sorting**

1. Change sort to "Highest Rated" — results re-fetch sorted by rating
2. Change sort to "A → Z" — results re-fetch alphabetically
3. Change sort to "Newest" — results re-fetch by release date

**Step 5: Test filters**

1. Click filter icon — sidebar slides in from left
2. Select a genre — results update (filtered)
3. Adjust rating slider — results update
4. Click "Clear Filters" — resets all filters
5. Press Escape — sidebar closes
6. Click backdrop — sidebar closes
7. Verify filter active dot appears on filter button when filters are non-default

**Step 6: Test pagination**

1. Scroll to bottom — "Load More" button should appear
2. Click Load More — 20 more movies append below existing results
3. Verify no duplicate movies appear

**Step 7: Test movie click**

1. Click any movie card — navigates to `/discover?movie={id}&source=browse`
2. Verify movie loads correctly in DiscoveryPage

**Step 8: Test edge cases**

1. Select a provider with few movies + add restrictive filters — verify empty state shows
2. Switch region via RegionPicker — verify provider list and results update
3. Rapidly switch providers — verify no stale results (AbortController)

**Step 9: Format code**

Run: `npx prettier --write src/services/tmdb/browse.ts src/stores/browseStore.ts src/hooks/useBrowseMovies.ts src/components/browse/BrowseMovieGrid.tsx src/components/browse/BrowseFilterSidebar.tsx src/pages/BrowsePage.tsx src/main.tsx src/components/layout/Navbar.tsx src/components/layout/MoreSheet.tsx`

**Step 10: Final commit**

```bash
git add -A
git commit -m "chore: format browse feature files with prettier"
```
