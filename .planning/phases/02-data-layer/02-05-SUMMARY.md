---
phase: 02-data-layer
plan: "05"
subsystem: hooks
tags: [react-hooks, zustand, swr, cache, tmdb, omdb, ipinfo, region, discovery, search, trending, providers]

# Dependency graph
requires:
  - phase: 02-data-layer
    plan: "01"
    provides: TypeScript types (movie, provider, region) and IndexedDB cache layer with TTL-based SWR
  - phase: 02-data-layer
    plan: "02"
    provides: 5 Zustand stores (preferences, movieHistory, region, discovery, search)
  - phase: 02-data-layer
    plan: "03"
    provides: Pure utility modules (genre-map, country-names, provider-registry, taste-engine)
  - phase: 02-data-layer
    plan: "04"
    provides: 8 API service clients (TMDB, OMDB, IPInfo) with caching and retry
provides:
  - "useRandomMovie: discovery with filter relaxation, taste scoring, and repeat prevention"
  - "useMovieDetails: SWR movie details (cached immediately, stale refreshed in background)"
  - "useOmdbRatings: lazy single-movie OMDB ratings (IMDb, Rotten Tomatoes, Metascore)"
  - "useSearchMovies: TMDB search with pagination and store integration"
  - "useTrending: region-aware now-playing with 30-min auto-refresh and popular fallback"
  - "useWatchProviders: provider categorization by tier (flatrate/rent/buy/free/ads) with myServices filtering"
  - "useRegionProviders: full provider list for region (settings UI)"
  - "useRegion: auto-detect country once, persist, invalidate provider cache on override"
affects: [03-feature-parity, 04-discovery, 05-search, 06-settings]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Zustand getState() for non-reactive reads inside useCallback", "SWR in useEffect: cache-check -> serve cached -> background refresh if stale", "useRef for region in intervals to avoid stale closure", "Cancelled flag pattern for async effect cleanup"]

key-files:
  created:
    - src/hooks/useRandomMovie.ts
    - src/hooks/useMovieDetails.ts
    - src/hooks/useOmdbRatings.ts
    - src/hooks/useSearchMovies.ts
    - src/hooks/useTrending.ts
    - src/hooks/useWatchProviders.ts
    - src/hooks/useRegion.ts
  modified: []

key-decisions:
  - "useRandomMovie casts TMDBMovieDetails to Record<string, unknown> for discoveryStore compatibility (store uses placeholder type)"
  - "useTrending uses useRef for region inside interval callback to avoid stale closure"
  - "useWatchProviders derives myProviders via useMemo filtering against myServices Set"
  - "useRegion invalidates providers- cache prefix on manual override to clear stale regional data"

patterns-established:
  - "Hook composition: hooks import services + stores + cache, never each other"
  - "Async effects use cancelled flag pattern for cleanup on unmount"
  - "useCallback with Zustand getState() for stable function references in discovery/search"
  - "Single-movie hooks (useOmdbRatings, useWatchProviders) designed for conditional rendering, never lists"

requirements-completed: [DISC-05, DISC-06]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 2 Plan 5: React Hooks Summary

**7 React hooks composing services, stores, and cache into consumable API: discovery with taste scoring, SWR details, lazy OMDB ratings, paginated search, auto-refreshing trending, tiered providers, and region detection with cache invalidation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T08:21:23Z
- **Completed:** 2026-02-18T08:27:01Z
- **Tasks:** 2
- **Files created:** 7

## Accomplishments
- Built 7 React hooks completing the data layer's public API for Phase 3+ UI components
- Discovery hook integrates 4 stores (discovery, history, preferences, region) with taste scoring and filter relaxation
- SWR pattern in useMovieDetails: serves cached data instantly, refreshes stale in background without loading flash
- Region hook detects country once via IPInfo, persists result, and invalidates provider cache on manual override

## Task Commits

Each task was committed atomically:

1. **Task 1: Create discovery, details, ratings, and search hooks** - `6b8301f` (feat)
2. **Task 2: Create trending, providers, and region hooks** - `af9274b` (feat)

## Files Created/Modified
- `src/hooks/useRandomMovie.ts` - Discovery with filter relaxation, taste scoring, history tracking via 4 stores
- `src/hooks/useMovieDetails.ts` - SWR cache pattern: show cached immediately, refresh stale in background
- `src/hooks/useOmdbRatings.ts` - Lazy single-movie OMDB ratings (IMDb, Rotten Tomatoes, Metascore)
- `src/hooks/useSearchMovies.ts` - TMDB search with pagination, store-backed state, loadMore support
- `src/hooks/useTrending.ts` - Region-aware now-playing with 30-min auto-refresh and popular fallback
- `src/hooks/useWatchProviders.ts` - Provider categorization by tier with myServices filtering + useRegionProviders
- `src/hooks/useRegion.ts` - Auto-detect country via IPInfo, persist, invalidate provider cache on override

## Decisions Made
- useRandomMovie casts TMDBMovieDetails to Record<string, unknown> for discoveryStore compatibility (store uses placeholder type from Plan 02-02; will be cleaned up when store types are unified)
- useTrending uses useRef for region inside setInterval callback to avoid stale closure capturing initial region value
- useWatchProviders derives myProviders via useMemo filtering against user's myServices Set for O(1) membership checks
- useRegion invalidates all `providers-` prefixed cache entries on manual override to ensure no stale regional provider data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 10 hooks in src/hooks/ provide complete data layer API for Phase 3 feature parity
- Discovery, search, trending, providers, and region hooks ready for direct consumption by UI components
- No blockers or concerns — Phase 2 data layer is complete

---
*Phase: 02-data-layer*
*Completed: 2026-02-18*

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (6b8301f, af9274b) verified in git log.
