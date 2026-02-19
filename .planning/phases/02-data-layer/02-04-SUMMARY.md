---
phase: 02-data-layer
plan: "04"
subsystem: api
tags: [tmdb, omdb, ipinfo, fetch, cache, retry, rate-limit, geolocation]

# Dependency graph
requires:
  - phase: 02-data-layer
    plan: "01"
    provides: TypeScript type definitions (movie, provider, region) and IndexedDB cache layer with TTL-based SWR
provides:
  - TMDB base HTTP client with 3-retry exponential backoff and rate-limit handling
  - Movie discovery service with 5-step progressive filter relaxation
  - Movie details service with single-call append_to_response for credits, videos, providers
  - Movie search service with normalized query caching and pagination
  - Trending service for now_playing (region-aware) and popular endpoints
  - Streaming provider service for region providers, movie providers, and available regions
  - OMDB ratings client with aggressive caching to conserve 1000/day quota
  - IPInfo geolocation client with navigator.language fallback and DE default
affects: [02-05, 03-feature-parity]

# Tech tracking
tech-stack:
  added: []
  patterns: [cache-check-fetch-store service pattern, progressive filter relaxation, aggressive OMDB quota caching, navigator.language geolocation fallback]

key-files:
  created:
    - src/services/tmdb/client.ts
    - src/services/tmdb/discover.ts
    - src/services/tmdb/details.ts
    - src/services/tmdb/search.ts
    - src/services/tmdb/trending.ts
    - src/services/tmdb/providers.ts
    - src/services/omdb/client.ts
    - src/services/ipinfo/client.ts
  modified: []

key-decisions:
  - "OMDB returns any cached value (stale or fresh) to conserve 1000/day API quota -- only fetches when completely uncached"
  - "Discover filter relaxation is cumulative: each step merges onto the previous relaxed state"
  - "IPInfo uses unauthenticated free tier; navigator.language fallback extracts country from locale string"

patterns-established:
  - "Service pattern: cache-check -> fetch -> cache-store with TTL from cache-manager"
  - "with_watch_providers always paired with watch_region in TMDB queries (Pitfall 3)"
  - "Provider cache keys always include region suffix (Pitfall 4)"
  - "Pure async functions only -- no React, no Zustand in service layer"

requirements-completed: [DISC-05, DISC-06]

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 2 Plan 4: API Services Summary

**8 API service clients for TMDB (discover, details, search, trending, providers), OMDB (ratings), and IPInfo (geolocation) with IndexedDB caching, retry logic, and progressive filter relaxation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T08:08:56Z
- **Completed:** 2026-02-18T08:11:12Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Built complete TMDB API layer: base client with retry/rate-limit handling, 5 endpoint-specific services
- Implemented 5-step progressive filter relaxation in discover service for reliable movie finding
- Created OMDB client with aggressive caching strategy to conserve 1000/day quota
- Created IPInfo geolocation client with navigator.language fallback and DE default

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TMDB API client and endpoint services** - `f2e3233` (feat)
2. **Task 2: Create OMDB and IPInfo service clients** - `1952730` (feat)

## Files Created/Modified
- `src/services/tmdb/client.ts` - Base TMDB HTTP client with retry, rate-limit backoff, poster/backdrop URL helpers
- `src/services/tmdb/discover.ts` - Movie discovery with 5-step progressive filter relaxation and movie exclusion
- `src/services/tmdb/details.ts` - Movie details with append_to_response for credits, videos, watch/providers
- `src/services/tmdb/search.ts` - Movie search by query with normalized caching and pagination
- `src/services/tmdb/trending.ts` - Now playing (region-aware) and popular movie lists
- `src/services/tmdb/providers.ts` - Region providers, movie providers, and available regions
- `src/services/omdb/client.ts` - OMDB ratings lookup (IMDb/RT/Metascore) with aggressive quota-conserving cache
- `src/services/ipinfo/client.ts` - IP geolocation country detection with navigator.language fallback

## Decisions Made
- OMDB returns any cached value (stale or fresh) to conserve 1000/day API quota -- only fetches when completely uncached
- Discover filter relaxation is cumulative: each step merges onto the previous relaxed state (not just applying step N in isolation)
- IPInfo uses unauthenticated free tier; navigator.language fallback extracts country from browser locale string
- Provider cache keys include region to avoid serving incorrect regional data (per Pitfall 4)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 8 API service clients ready for React hook integration in plan 02-05
- Cache layer fully integrated -- all services use getCached/setCache with type-appropriate TTLs
- No blockers or concerns

---
*Phase: 02-data-layer*
*Completed: 2026-02-18*

## Self-Check: PASSED

All 8 created files verified on disk. Both task commits (f2e3233, 1952730) verified in git log.
