---
phase: 02-data-layer
plan: 02
subsystem: state-management
tags: [zustand, localStorage, migration, preferences, movie-history, region]

# Dependency graph
requires:
  - phase: 01-foundation-design-system
    provides: "themeStore.ts Zustand persist pattern (create + persist + createJSONStorage)"
provides:
  - "usePreferencesStore: provider/genre prefs, myServices, taste profile with love/not-interested signals"
  - "useMovieHistoryStore: shown/watched/loved/notInterested with 2000-entry FIFO eviction and repeat prevention"
  - "useRegionStore: detected country (default DE), manual override, 24h detection expiry"
  - "useDiscoveryStore: current movie, loading/error state, filter relaxation (non-persisted)"
  - "useSearchStore: query, results, pagination, sort (non-persisted)"
  - "useMigration: one-time legacy localStorage to Zustand migration hook"
affects: [03-feature-parity, 04-discovery, 05-search, 06-settings]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Zustand partialize for excluding derived methods from persistence", "Legacy localStorage migration via useEffect with idempotency flag", "Runtime (non-persisted) Zustand stores for session state"]

key-files:
  created:
    - src/stores/preferencesStore.ts
    - src/stores/movieHistoryStore.ts
    - src/stores/regionStore.ts
    - src/stores/discoveryStore.ts
    - src/stores/searchStore.ts
    - src/hooks/useMigration.ts
  modified: []

key-decisions:
  - "TasteProfile defined inline in preferencesStore (types/ directory not yet created)"
  - "TMDBMovie type defined inline in searchStore with TODO to import from @/types/movie"
  - "TMDBMovieDetails placeholder type in discoveryStore (Record<string, unknown>) with TODO"
  - "Migration preserves old 'theme' key for backwards compatibility with vanilla app"

patterns-established:
  - "Persisted stores: create + persist + createJSONStorage + localStorage with unique 'wmtw-*' key prefix"
  - "partialize for excluding action methods from localStorage serialization"
  - "Runtime stores: plain create() without persist middleware"
  - "Legacy migration: safeParseJSON helper + idempotency flag + getState().importLegacy() pattern"

requirements-completed: [DISC-05]

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 2 Plan 2: Zustand Stores Summary

**5 Zustand stores (3 persisted, 2 runtime) with taste profile learning, 2000-entry FIFO movie history, and legacy localStorage migration hook**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T07:47:40Z
- **Completed:** 2026-02-18T07:49:42Z
- **Tasks:** 2
- **Files created:** 6

## Accomplishments
- Three persisted stores (preferences, movieHistory, region) with unique localStorage keys following themeStore pattern
- Movie history store implements DISC-05 repeat prevention with Set-based hasBeenShown() and 2000-entry FIFO eviction on shownMovies
- Taste profile learning tracks genres, decades, and directors with positive (love) and negative (not-interested) signals
- Two runtime stores for discovery session and search state without persistence overhead
- Legacy migration hook auto-imports vanilla app localStorage data into Zustand stores on first load

## Task Commits

Each task was committed atomically:

1. **Task 1: Create persisted Zustand stores** - `cb616a7` (feat)
2. **Task 2: Create runtime stores and legacy migration hook** - `63ed3e4` (feat)

## Files Created/Modified
- `src/stores/preferencesStore.ts` - Provider/genre prefs, myServices[], taste profile with love/not-interested signals
- `src/stores/movieHistoryStore.ts` - Shown/watched/loved/notInterested arrays with 2000 FIFO cap and Set-based repeat prevention
- `src/stores/regionStore.ts` - Detected country (default DE), manual override, 24h detection expiry, effectiveRegion getter
- `src/stores/discoveryStore.ts` - Current movie, loading/error, relaxation step, filters (non-persisted)
- `src/stores/searchStore.ts` - Query, results, pagination, sortBy (non-persisted)
- `src/hooks/useMigration.ts` - One-time migration of 6 legacy localStorage keys into Zustand stores

## Decisions Made
- TasteProfile interface defined inline in preferencesStore rather than importing from @/types/preferences (types/ directory not yet created; will be refactored when types plan is executed)
- TMDBMovie and TMDBMovieDetails types defined inline in runtime stores with TODO comments for future import
- Old 'theme' key kept in localStorage during migration for backwards compatibility with vanilla app (themeStore uses different key 'theme-preferences')

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 Zustand stores compile and export their hooks
- Stores ready for consumption by hooks (useMigration, useRandomMovie, useRegion, etc.) in upcoming plans
- Types are placeholder/inline -- will be replaced with proper imports when src/types/ is created in a types plan
- Migration hook ready to be called in App.tsx or a layout component

## Self-Check: PASSED

All 7 files verified present. Both commits (cb616a7, 63ed3e4) verified in git log.

---
*Phase: 02-data-layer*
*Completed: 2026-02-18*
