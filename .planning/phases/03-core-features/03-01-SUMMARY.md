---
phase: 03-core-features
plan: 01
subsystem: ui
tags: [react, typescript, sonner, tailwind, claymorphism, tmdb, zustand, lucide-react]

# Dependency graph
requires:
  - phase: 02-data-layer
    provides: hooks (useOmdbRatings, useWatchProviders), stores (movieHistoryStore, preferencesStore), types (TMDBMovieDetails, MovieProviders), services (tmdbFetch, cache-manager)
  - phase: 01-foundation-design-system
    provides: ClayBadge, MetalButton, claymorphism design tokens, theme CSS variables

provides:
  - ExternalLink: secure anchor wrapper with rel=noopener noreferrer (SECU-04)
  - ScreenReaderAnnouncer + useAnnounce: ARIA live region for dynamic announcements (A11Y-04)
  - ToastProvider + showToast: sonner toast system with clay styling (INTR-05)
  - useDebouncedValue: generic debounce hook for search inputs
  - useSimilarMovies: fetches /movie/{id}/similar with cache-manager TTL
  - useDeepLink: reads ?movie=ID from HashRouter URL with clearDeepLink
  - MovieHero: cinematic full-bleed backdrop hero with poster, metadata, lazy loading
  - RatingBadges: TMDB/IMDb/RT/Metacritic colored clay badges with score thresholds
  - GenreBadges: clay pill chips with overflow count
  - ProviderSection: Stream/Rent/Buy/Free grouped provider logos with ARIA
  - MovieActions: Love/Watched/Not Interested/Next buttons with store integration
  - TrailerLink: YouTube trailer button via ExternalLink

affects:
  - 03-02-discovery-page
  - 03-03-trending-page
  - 03-04-search-page
  - 03-05-dinner-time-page

# Tech tracking
tech-stack:
  added:
    - sonner@^2.x (toast notifications, ~3KB)
  patterns:
    - ExternalLink wrapper enforces security attributes site-wide
    - useAnnounce hook pattern: returns [announce function, AnnouncerComponent] tuple
    - showToast(message, type?) helper wraps sonner for consistent API
    - Cancelled flag pattern used in useSimilarMovies (same as useMovieDetails)
    - Rating color coding: green (>=70%/7.0), yellow (>=50%/5.0), red (<50%/<5.0)
    - Provider tiers: flatrate=Stream, free+ads merged=Free, rent=Rent, buy=Buy
    - MovieActions decade computation: releaseYear.slice(0,3) + "0s"

key-files:
  created:
    - src/components/shared/ExternalLink.tsx
    - src/components/shared/ScreenReaderAnnouncer.tsx
    - src/components/shared/Toast.tsx
    - src/hooks/useDebouncedValue.ts
    - src/hooks/useSimilarMovies.ts
    - src/hooks/useDeepLink.ts
    - src/components/movie/MovieHero.tsx
    - src/components/movie/RatingBadges.tsx
    - src/components/movie/GenreBadges.tsx
    - src/components/movie/ProviderSection.tsx
    - src/components/movie/MovieActions.tsx
    - src/components/movie/TrailerLink.tsx
  modified:
    - src/stores/discoveryStore.ts (replaced local TMDBMovieDetails placeholder type with real import)
    - src/stores/searchStore.ts (replaced local TMDBMovie interface with real import)
    - src/hooks/useRandomMovie.ts (removed incorrect double cast to Record<string, unknown>)
    - package.json (added sonner dependency)

key-decisions:
  - "ExternalLink always enforces rel=noopener noreferrer + target=_blank — no escape hatch per SECU-04"
  - "useAnnounce returns [announce, AnnouncerComponent] tuple: hook owns state, component renders ARIA region"
  - "ToastProvider uses CSS variable references (var(--clay-surface)) so it adapts to all 6 theme variants"
  - "useSimilarMovies uses stale-while-revalidate: shows stale data immediately, refreshes in background"
  - "GenreBadges max 4 visible, overflow shown as '+N more' badge — prevents layout overflow on small screens"
  - "ProviderSection merges free + ads into single Free tier with deduplication by provider_id"
  - "MovieActions decade computed as releaseYear.slice(0,3)+'0s' matching preferencesStore recordLove/recordNotInterested signature"
  - "TrailerLink prefers type=Trailer over other YouTube video types, falls back to first YouTube video"

patterns-established:
  - "ExternalLink pattern: all external links flow through ExternalLink to enforce security attributes"
  - "Toast pattern: showToast(message, type?) called from action handlers, ToastProvider mounted once at app root"
  - "Movie component pattern: each MovieHero/RatingBadges/etc. accepts typed props from Phase 2 types, no internal fetching"
  - "Cancelled flag cleanup: all useEffect hooks with async operations use let cancelled = false pattern"

requirements-completed: [DISP-01, DISP-02, DISP-03, DISP-04, DISP-05, DISP-06, DISP-07, INTR-05, SECU-04, A11Y-02, A11Y-04]

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 3 Plan 01: Movie Display Components Summary

**Cinematic MovieHero, triple-rating clay badges, provider-tier streaming grid, and secure shared infrastructure (ExternalLink, sonner toasts, ARIA announcer) that all Phase 3 feature pages compose.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T17:08:32Z
- **Completed:** 2026-02-18T17:12:32Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments

- 6 shared infrastructure pieces: ExternalLink (SECU-04), ScreenReaderAnnouncer (A11Y-04), ToastProvider+showToast (INTR-05), useDebouncedValue, useSimilarMovies, useDeepLink
- 6 movie display components: MovieHero (DISP-01), RatingBadges (DISP-02), GenreBadges (DISP-07), ProviderSection (DISP-05), MovieActions (DISP-06), TrailerLink (DISP-03)
- sonner installed and integrated with claymorphism clay-surface CSS variables
- Pre-existing build-blocking type errors fixed in discoveryStore, searchStore, and useRandomMovie

## Task Commits

Each task was committed atomically:

1. **Task 1: Install sonner + shared infrastructure components and new hooks** - `61541eb` (feat)
2. **Task 2: Build movie display components** - `2d516ff` (feat)

**Plan metadata:** (to be added after docs commit)

## Files Created/Modified

- `src/components/shared/ExternalLink.tsx` - Secure anchor wrapper enforcing rel=noopener noreferrer (SECU-04)
- `src/components/shared/ScreenReaderAnnouncer.tsx` - ARIA live region + useAnnounce hook (A11Y-04)
- `src/components/shared/Toast.tsx` - sonner ToastProvider + showToast helper with clay theme
- `src/hooks/useDebouncedValue.ts` - Generic debounce hook for search inputs
- `src/hooks/useSimilarMovies.ts` - TMDB /movie/{id}/similar with stale-while-revalidate cache
- `src/hooks/useDeepLink.ts` - Reads ?movie=ID from HashRouter URL
- `src/components/movie/MovieHero.tsx` - Full-bleed backdrop with poster, metadata, lazy loading
- `src/components/movie/RatingBadges.tsx` - TMDB/IMDb/RT/MC colored clay badges
- `src/components/movie/GenreBadges.tsx` - Muted clay pills, max 4 visible + overflow count
- `src/components/movie/ProviderSection.tsx` - Stream/Rent/Buy/Free provider logos, ARIA labeled
- `src/components/movie/MovieActions.tsx` - Love/Watched/Not Interested/Next with store + toast
- `src/components/movie/TrailerLink.tsx` - YouTube trailer button via ExternalLink
- `src/stores/discoveryStore.ts` - Fixed: replaced local TMDBMovieDetails placeholder with real import
- `src/stores/searchStore.ts` - Fixed: replaced local TMDBMovie interface with real import
- `src/hooks/useRandomMovie.ts` - Fixed: removed incorrect cast to Record<string, unknown>
- `package.json` - Added sonner dependency

## Decisions Made

- ExternalLink is a mandatory wrapper with no escape hatch — ensures SECU-04 compliance site-wide
- useAnnounce returns a tuple [announce, AnnouncerComponent] so callers don't need to manage state
- ToastProvider uses CSS var() references for automatic adaptation to all 6 theme variants
- ProviderSection merges free + ads arrays into a single "Free" tier with deduplication
- GenreBadges limits display to 4 genres by default to prevent layout overflow on mobile

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing TypeScript build errors in Phase 2 stores/hooks**
- **Found during:** Task 1 (build verification)
- **Issue:** `discoveryStore.ts` and `searchStore.ts` each defined local placeholder types (TMDBMovieDetails, TMDBMovie) that mismatched the real types now defined in `@/types/movie`. This caused 3 TypeScript errors blocking the build. `useRandomMovie.ts` tried to cast TMDBMovieDetails to Record<string, unknown> which TypeScript rejected.
- **Fix:** Replaced local placeholder types in both stores with proper imports from `@/types/movie`. Removed the invalid cast in `useRandomMovie.ts`.
- **Files modified:** `src/stores/discoveryStore.ts`, `src/stores/searchStore.ts`, `src/hooks/useRandomMovie.ts`
- **Verification:** `npm run build` succeeds with zero TypeScript errors after fix
- **Committed in:** `61541eb` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed JSX.Element namespace error in ScreenReaderAnnouncer**
- **Found during:** Task 1 (build verification)
- **Issue:** useAnnounce return type used `JSX.Element` which requires the JSX namespace — not available without `@types/react` JSX global in this tsconfig setup
- **Fix:** Changed return type to `ReactElement` imported from 'react'
- **Files modified:** `src/components/shared/ScreenReaderAnnouncer.tsx`
- **Verification:** Build passes with zero TypeScript errors
- **Committed in:** `61541eb` (Task 1 commit)

**3. [Rule 1 - Bug] Removed invalid role prop from ClayBadge in GenreBadges**
- **Found during:** Task 2 (build verification)
- **Issue:** ClayBadge component doesn't accept arbitrary HTML attributes; passing role="listitem" caused TypeScript error
- **Fix:** Wrapped ClayBadge in `<span role="listitem">` for ARIA semantics without modifying ClayBadge interface
- **Files modified:** `src/components/movie/GenreBadges.tsx`
- **Verification:** Build passes with zero TypeScript errors
- **Committed in:** `2d516ff` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 bugs)
**Impact on plan:** Pre-existing build blockers fixed, one TypeScript refinement, one component API constraint worked around. No scope creep.

## Issues Encountered

None beyond the auto-fixed TypeScript errors above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All movie display components are ready for composition by Discovery page (03-02), Trending page (03-03), Search page (03-04), Dinner Time page (03-05), and Free Movies page
- ToastProvider needs to be added to app root (App.tsx) before toasts are visible — no toast will appear until then
- No circular dependencies between components: shared/ has no imports from movie/, movie/ may import from shared/

---
*Phase: 03-core-features*
*Completed: 2026-02-18*
