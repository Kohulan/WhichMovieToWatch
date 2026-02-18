---
phase: 03-core-features
plan: 04
subsystem: ui
tags: [react, typescript, tmdb, zustand, tailwind, claymorphism, youtube, lucide-react]

# Dependency graph
requires:
  - phase: 03-core-features/03-01
    provides: MovieHero, RatingBadges, GenreBadges, ExternalLink, showToast, ClaySkeletonCard, MetalButton
  - phase: 02-data-layer
    provides: useTrending, useOmdbRatings, movieHistoryStore, regionStore, tmdbFetch, fetchMovieDetails, searchMovies, getPosterUrl

provides:
  - TrendingPage: horizontal scroll now-playing strip with 30-min auto-refresh and popular fallback (TRND-01, TRND-02, TRND-03)
  - useDinnerTime: family-friendly (PG-13) movie discovery on Netflix/Prime/Disney+ via TMDB discover API (DINR-01)
  - DinnerTimePage: dedicated full-page service selector + Watch on [Service] button + like/dislike tracking (DINR-02, DINR-03, DINR-04)
  - ServiceBranding: Netflix/Prime/Disney+ themed badge + watch URL generation component
  - useFreeMovies: parses movies.txt via BASE_URL, picks random entries, enriches with TMDB + OMDB metadata (FREE-01, FREE-02)
  - FreeMoviesPage: YouTube movie discovery with Watch on YouTube + Next Suggestion + regional disclaimer (FREE-03, FREE-04)
  - movieHistoryStore extended: dinnerTimeLikes/dinnerTimeDislikes arrays + markDinnerLike/markDinnerDislike actions

affects:
  - 03-05-navigation (tab bar routing to TrendingPage, DinnerTimePage, FreeMoviesPage)
  - 03-06-discovery-page (may compose TrendingPage as section)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service branding pattern: serviceId mapped to config object (name, color, bgColor, gradient, watchUrl factory)
    - Module-level cache pattern: movies.txt parsed once per session, stored in module scope, shared across re-mounts
    - BASE_URL prefix for static asset fetching — required for GitHub Pages subdirectory compatibility
    - Dinner Time like/dislike mutual exclusion: marking like removes from dislikes and vice versa
    - Free movie TMDB enrichment: non-fatal — YouTube movie shown with title-only if TMDB search fails

key-files:
  created:
    - src/components/trending/TrendingPage.tsx
    - src/hooks/useDinnerTime.ts
    - src/hooks/useFreeMovies.ts
    - src/pages/TrendingPage.tsx
    - src/components/dinner-time/DinnerTimePage.tsx
    - src/components/dinner-time/ServiceBranding.tsx
    - src/components/free-movies/FreeMoviesPage.tsx
    - src/pages/DinnerTimePage.tsx
    - src/pages/FreeMoviesPage.tsx
  modified:
    - src/stores/movieHistoryStore.ts (added dinnerTimeLikes, dinnerTimeDislikes, markDinnerLike, markDinnerDislike + partialize)

key-decisions:
  - "useFreeMovies uses import.meta.env.BASE_URL prefix for movies.txt fetch — required for GitHub Pages base path compatibility"
  - "Module-level movies.txt cache in useFreeMovies — single fetch per session shared across all hook instances"
  - "TMDB enrichment in useFreeMovies is non-fatal — FreeMoviesPage shows YouTube movie with title-only if TMDB lookup fails"
  - "markDinnerLike/markDinnerDislike are mutually exclusive — marking like removes from dislikes and vice versa"
  - "ServiceBranding exports both component and getServiceConfig() function — DinnerTimePage needs config for gradient+watchUrl, not just the badge"
  - "DinnerTimePage uses service-branded background gradient from gradientFrom/gradientTo CSS classes for visual service identity"

patterns-established:
  - "Service config pattern: serviceId integer mapped to full config object (name, color, bgColor, gradient classes, watchUrl factory function)"
  - "Non-fatal enrichment: secondary data sources (TMDB title search, OMDB ratings) wrapped in try/catch — UI degrades gracefully rather than blocking"

requirements-completed: [TRND-01, TRND-02, TRND-03, TRND-04, DINR-01, DINR-02, DINR-03, DINR-04, FREE-01, FREE-02, FREE-03, FREE-04]

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 3 Plan 04: Trending, Dinner Time, and Free Movies Summary

**Horizontal scroll Now Playing strip, family-friendly Netflix/Prime/Disney+ finder with like/dislike tracking, and YouTube free movies discovery from 2000+ movies.txt entries — three distinct discovery modes ready for tab navigation.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T17:17:14Z
- **Completed:** 2026-02-18T17:21:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- TrendingPage: horizontal snap-scroll strip of now-playing movies with refresh button, rating badges, popular fallback, and deep-link navigation to `/#/?movie={id}`
- DinnerTimePage: service selector (Netflix/Prime/Disney+), full movie details with ratings+genres, Watch on [Service] ExternalLink, ThumbsUp/ThumbsDown preference tracking with auto-advance to next
- FreeMoviesPage: random free movie from movies.txt, TMDB title-search enrichment, poster+overview, Watch on YouTube (red), Next Suggestion, and regional availability disclaimer
- ServiceBranding: maps service IDs to branded badges + watch URL factories (Netflix search, Amazon instant-video, Disney+ search)
- movieHistoryStore: dinnerTimeLikes/dinnerTimeDislikes persisted to localStorage via partialize, with mutual exclusion between like/dislike states

## Task Commits

Each task was committed atomically:

1. **Task 1: Build TrendingPage + useDinnerTime hook + useFreeMovies hook + extend movieHistoryStore** - `f9b4562` (feat)
2. **Task 2: Build DinnerTimePage and FreeMoviesPage with full UI** - `5f6f63b` (feat)

**Plan metadata:** (to be added after docs commit)

## Files Created/Modified

- `src/components/trending/TrendingPage.tsx` - Horizontal scroll now-playing strip with auto-refresh, rating badges, snap scrolling (TRND-01–TRND-03)
- `src/hooks/useDinnerTime.ts` - Family-friendly discovery (PG-13, Family genres, rating >=6.0) on Netflix/Prime/Disney+ (DINR-01)
- `src/hooks/useFreeMovies.ts` - Parses movies.txt via BASE_URL, module-level cache, TMDB title-search enrichment (FREE-01, FREE-02)
- `src/pages/TrendingPage.tsx` - Route wrapper for TrendingPage
- `src/components/dinner-time/ServiceBranding.tsx` - Netflix/Prime/Disney+ themed badge + watchUrl factory + getServiceConfig() export
- `src/components/dinner-time/DinnerTimePage.tsx` - Full-page service selector, movie details, Watch button, ThumbsUp/ThumbsDown actions (DINR-02–DINR-04)
- `src/components/free-movies/FreeMoviesPage.tsx` - YouTube movie discovery with TMDB metadata, Watch on YouTube, Next, disclaimer (FREE-03, FREE-04)
- `src/pages/DinnerTimePage.tsx` - Route wrapper for DinnerTimePage
- `src/pages/FreeMoviesPage.tsx` - Route wrapper for FreeMoviesPage
- `src/stores/movieHistoryStore.ts` - Added dinnerTimeLikes/dinnerTimeDislikes arrays and actions (DINR-04)

## Decisions Made

- `import.meta.env.BASE_URL` prefix for movies.txt fetch: required for GitHub Pages deployment where base path may not be `/`
- Module-level movies.txt cache: single fetch per session, shared across all useFreeMovies instances — no repeated network calls on re-mounts
- TMDB enrichment is non-fatal: FreeMoviesPage gracefully shows YouTube movie with title-only (Film icon placeholder) if TMDB lookup fails — don't block the core value
- Like/dislike mutual exclusion in movieHistoryStore: marking a movie liked automatically removes from dislikes array and vice versa
- ServiceBranding exports both the visual `<ServiceBranding>` badge component and a `getServiceConfig()` function so DinnerTimePage can access gradient colors and watchUrl factory without coupling to badge internals

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three discovery modes (TrendingPage, DinnerTimePage, FreeMoviesPage) are complete self-contained page components ready for tab navigation routing
- Route wrappers created at `src/pages/{TrendingPage,DinnerTimePage,FreeMoviesPage}.tsx` — need to be wired into the router (App.tsx)
- ToastProvider must be mounted at app root for like-tracking toasts to be visible
- data/movies.txt must be present in the public directory for useFreeMovies to work (it's already in repo root `data/` — Vite serves from public)

---
*Phase: 03-core-features*
*Completed: 2026-02-18*

## Self-Check: PASSED

Files verified:
- src/components/trending/TrendingPage.tsx: FOUND
- src/hooks/useDinnerTime.ts: FOUND
- src/hooks/useFreeMovies.ts: FOUND
- src/pages/TrendingPage.tsx: FOUND
- src/components/dinner-time/ServiceBranding.tsx: FOUND
- src/components/dinner-time/DinnerTimePage.tsx: FOUND
- src/components/free-movies/FreeMoviesPage.tsx: FOUND
- src/pages/DinnerTimePage.tsx: FOUND
- src/pages/FreeMoviesPage.tsx: FOUND
- src/stores/movieHistoryStore.ts: FOUND (modified)

Commits verified:
- f9b4562: FOUND (feat(03-04): add TrendingPage, useDinnerTime, useFreeMovies, extend movieHistoryStore)
- 5f6f63b: FOUND (feat(03-04): build DinnerTimePage, ServiceBranding, FreeMoviesPage)
