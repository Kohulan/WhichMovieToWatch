---
phase: 02-data-layer
plan: 01
subsystem: database
tags: [idb, indexeddb, typescript, cache, swr, tmdb, omdb]

# Dependency graph
requires:
  - phase: 01-foundation-design-system
    provides: Vite + TypeScript + Zustand project scaffold with path aliases
provides:
  - Shared TypeScript type definitions for TMDB movies, providers, regions, and preferences
  - IndexedDB cache layer with TTL-based stale-while-revalidate support
  - idb v8.0.3 dependency for IndexedDB wrapper
affects: [02-02, 02-03, 02-04, 02-05, 03-feature-parity]

# Tech tracking
tech-stack:
  added: [idb v8.0.3]
  patterns: [IndexedDB singleton connection, TTL-based SWR cache, typed DB schema via idb DBSchema]

key-files:
  created:
    - src/types/movie.ts
    - src/types/provider.ts
    - src/types/region.ts
    - src/types/preferences.ts
    - src/services/cache/types.ts
    - src/services/cache/db.ts
    - src/services/cache/cache-manager.ts
  modified:
    - package.json

key-decisions:
  - "Singleton DB connection via module-level promise variable to avoid opening multiple IndexedDB connections"
  - "CacheEntry stores TTL per-entry (not per-store) enabling mixed TTLs in one object store"

patterns-established:
  - "IndexedDB cache pattern: getDB() singleton, short-lived transactions, no fetch inside transactions"
  - "Type-only files: export interface/type only, no runtime code in src/types/"
  - "SWR cache return: { value: T | null, isStale: boolean } for stale-while-revalidate consumers"

requirements-completed: [DISC-05, DISC-06]

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 2 Plan 1: Types and Cache Summary

**TypeScript type definitions for TMDB/OMDB/provider/preference data plus IndexedDB cache layer with TTL-based stale-while-revalidate via idb v8**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T07:47:33Z
- **Completed:** 2026-02-18T07:49:34Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Installed idb v8.0.3 as IndexedDB wrapper dependency
- Created 4 type definition files covering TMDB movies, watch providers, regions, and taste preferences
- Built IndexedDB cache layer with typed schema, TTL-based staleness checks, prefix invalidation, and expired entry eviction

## Task Commits

Each task was committed atomically:

1. **Task 1: Install idb and create TypeScript type definitions** - `09d5434` (feat)
2. **Task 2: Build IndexedDB cache layer with TTL and SWR** - `daa6fb0` (feat)

## Files Created/Modified
- `src/types/movie.ts` - TMDBMovie, TMDBMovieDetails, WatchProvider, EnrichedMovie, TMDBDiscoverResponse, TMDBSearchResponse
- `src/types/provider.ts` - ProviderTier, ProviderInfo, MovieProviders, RegionProvider
- `src/types/region.ts` - RegionInfo, IPInfoResponse
- `src/types/preferences.ts` - TasteProfile, TasteSignal, MovieInteraction
- `src/services/cache/types.ts` - CacheEntry generic type for IndexedDB storage
- `src/services/cache/db.ts` - MovieCacheDB schema, singleton getDB() via idb openDB
- `src/services/cache/cache-manager.ts` - getCached, setCache, invalidateByPrefix, evictExpired, TTL constants
- `package.json` - Added idb ^8.0.3 dependency

## Decisions Made
- Singleton DB connection via module-level promise variable to avoid opening multiple IndexedDB connections
- CacheEntry stores TTL per-entry (not per-store) enabling mixed TTLs in a single api-cache object store
- Used `as CacheEntry` assertion in setCache to satisfy idb's strict typing while keeping the generic T parameter

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Type definitions ready for all subsequent data layer plans (TMDB client, stores, hooks)
- Cache layer ready for API service integration in plans 02-02 through 02-05
- No blockers or concerns

---
*Phase: 02-data-layer*
*Completed: 2026-02-18*

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (09d5434, daa6fb0) verified in git log.
