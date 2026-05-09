# Browse by Streaming Platform — Design Document

**Date:** 2026-03-17
**Route:** `/browse`
**Approach:** Dedicated Store + Hook + Service Layer (Approach 1)

## Summary

A new top-level page that lets users browse movies currently available on a selected streaming platform. Shows a paginated grid of movies with TMDB ratings, sortable and filterable via a slide-in sidebar.

## User Decisions

| Decision | Choice |
|---|---|
| Navigation | Top-level navbar tab (`Tv` icon + "Browse") |
| Route | `/browse` |
| Provider selector | Dropdown menu (MetalDropdown) |
| Default state | Pre-select user's first `myServices` provider |
| Pagination | "Load More" button, 20 movies per load (TMDB native page size) |
| Ratings in grid | TMDB `vote_average` only; OMDB on detail view |
| Movie click | Navigate to `/discover?movie={id}&source=browse` |
| Grid layout | Poster grid (2 cols mobile, 3 tablet, 4 desktop) |
| Sort | TMDB server-side: Popular, Highest Rated, Newest, Oldest, A-Z, Z-A |
| Filters | Sidebar: Genre, Rating range, Year range, Language, Runtime range |
| Filter trigger | Filter icon button, collapsed by default on all sizes |
| Mobile filter | Slide-in drawer from left |
| Desktop filter | Slide-in panel from left with backdrop overlay |
| Mobile nav | 4th tab (Home, Discover, Browse, Dinner) |

## Architecture

### Data Layer

#### Service: `src/services/tmdb/browse.ts`

Wraps TMDB `/discover/movie` for paginated, sorted, filtered browsing by provider.

```typescript
interface BrowseParams {
  providerId: number;
  region: string;
  page: number;
  sortBy: string;
  genres?: number[];             // pipe-separated (OR) to TMDB
  ratingRange?: [number, number]; // vote_average.gte / .lte
  yearRange?: [number, number];   // primary_release_date.gte / .lte (YYYY-MM-DD)
  language?: string;              // with_original_language (ISO 639-1)
  runtimeRange?: [number, number]; // with_runtime.gte / .lte
}
```

**TMDB parameter mapping:**
- `with_watch_providers={providerId}` (single provider)
- `watch_region={region}`
- `with_watch_monetization_types=flatrate`
- `sort_by={sortBy}`
- `with_genres={genres joined by |}` (OR logic)
- `vote_average.gte` / `vote_average.lte`
- `primary_release_date.gte` / `primary_release_date.lte` (format: YYYY-MM-DD)
- `with_original_language={language}`
- `with_runtime.gte` / `with_runtime.lte`
- `vote_count.gte=50` (hardcoded noise filter)
- `include_adult=false`
- `page={page}`

**Sort options (all server-side):**

| Label | Value |
|---|---|
| Most Popular | `popularity.desc` |
| Highest Rated | `vote_average.desc` |
| Newest | `primary_release_date.desc` |
| Oldest | `primary_release_date.asc` |
| A to Z | `title.asc` |
| Z to A | `title.desc` |

#### Store: `src/stores/browseStore.ts`

Zustand store managing all browse-specific state:

```
State:
  selectedProviderId: number | null
  results: TMDBMovie[]
  currentPage: number
  totalPages: number
  totalResults: number
  isLoading: boolean
  error: string | null
  sortBy: string                     // default "popularity.desc"
  filters: BrowseFilters {
    genres: number[]
    ratingRange: [number, number]    // [0, 10]
    yearRange: [number, number]      // [1900, currentYear]
    language: string | null
    runtimeRange: [number, number]   // [0, 300]
  }

Actions:
  setProvider(id)        -> clears results, resets page to 1, triggers fetch
  setSortBy(sort)        -> clears results, resets page to 1
  setFilters(partial)    -> clears results, resets page to 1
  resetFilters()         -> restore defaults
  setResults(...)        -> page 1 results
  appendResults(...)     -> Load More results
  setLoading / setError
```

#### Hook: `src/hooks/useBrowseMovies.ts`

Orchestrates fetching and exposes: `{ browse, loadMore, results, isLoading, error, hasMore, totalResults }`

- `browse()` reads store state, calls `browseMovies()` service, sets results
- `loadMore()` increments page, calls service, appends results
- Auto-triggers `browse()` when provider/sort/filters change via `useEffect`
- Uses `AbortController` to cancel in-flight requests on param changes

### UI Layer

#### Page: `src/pages/BrowsePage.tsx`

Layout: sticky top bar + movie grid + load more.

**Top bar (sticky below navbar):**
- Provider dropdown (left) — MetalDropdown, pre-selects first myServices provider
- Sort dropdown (center) — MetalDropdown with 6 sort options
- Filter icon button (right) — opens sidebar, dot indicator when filters active

**Results count** below top bar: e.g., "1,247 movies on Netflix"

**Movie grid** — same card pattern as SearchResults:
- 2 cols mobile, 3 tablet, 4 desktop
- Poster (2/3 aspect) with TMDB rating badge overlay (color-coded green/yellow/red)
- Title + year below
- Click navigates to `/discover?movie={id}&source=browse`
- StaggerContainer for entrance animations

**Load More** — MetalButton at bottom
**Loading** — LoadingQuotes on initial; spinner on Load More
**Empty** — message + Clear Filters button

#### Filter Sidebar: `src/components/browse/BrowseFilterSidebar.tsx`

Slide-in drawer from left (both mobile and desktop), ~300px wide, backdrop overlay.
Framer Motion slide + fade animation.

Contents:
1. Header — "Filters" + close (X) button
2. Genre — multi-select MetalCheckbox (getAllGenres)
3. Rating — DualRangeSlider [0, 10] step 0.5
4. Release Year — DualRangeSlider [1900, 2026] step 1
5. Language — MetalDropdown
6. Runtime — DualRangeSlider [0, 300] step 15 (Xh Ym format)
7. Footer — "Clear Filters" + "Apply" buttons

#### Movie Grid: `src/components/browse/BrowseMovieGrid.tsx`

Extracted grid component for clarity. Receives results, loading state, handlers.

### Navigation Changes

- `src/main.tsx` — add `{ path: "browse", element: <BrowsePage /> }`
- `src/components/layout/Navbar.tsx` — add Browse to `allTabs` and `mobileTabs` (Tv icon)
- `src/components/layout/MoreSheet.tsx` — add Browse link

### New Files

| File | Purpose |
|---|---|
| `src/pages/BrowsePage.tsx` | Route wrapper, layout, top bar |
| `src/components/browse/BrowseFilterSidebar.tsx` | Filter drawer |
| `src/components/browse/BrowseMovieGrid.tsx` | Movie card grid + Load More |
| `src/services/tmdb/browse.ts` | TMDB discover call |
| `src/stores/browseStore.ts` | Zustand store |
| `src/hooks/useBrowseMovies.ts` | Fetch orchestration hook |

### Reused Components

MetalDropdown, MetalButton, MetalCheckbox, DualRangeSlider, LoadingQuotes,
ClaySkeletonCard, StaggerContainer/StaggerItem, useRegionProviders, getAllGenres,
getPosterUrl, tmdbPosterSrcSet, posterSizes

## Edge Cases

| Scenario | Handling |
|---|---|
| No myServices (skipped onboarding) | Show all region providers, no pre-selection, "Select a platform" prompt |
| Provider returns 0 results | "No movies found on {provider} in your region" |
| Filters narrow to 0 | "No movies match your filters" + Clear Filters button |
| Provider change | Clear results, reset page + filters, fetch fresh |
| Sort change | Clear results, reset page, fetch with same filters |
| Filter apply | Clear results, reset page, fetch with new filters |
| API error | Error state with "Try again" button |
| Rate limiting (429) | Handled by tmdbFetch retry with exponential backoff |
| Region change | Re-fetch provider list + results for new region |

## Cache Strategy

- Key pattern: `browse-{providerId}-{region}-{sortBy}-{filterHash}-page{n}`
- Uses existing cache-manager with TTL.SEARCH_RESULTS
- Provider list via fetchRegionProviders with TTL.PROVIDER_LIST

## Performance

- Lazy image loading (loading="lazy" + decoding="async")
- Responsive srcSet via tmdbPosterSrcSet
- StaggerContainer for entrance animations
- No OMDB calls in grid (zero quota impact)
- AbortController cancels in-flight requests on param changes
