---
phase: 08-polish-optimization
plan: 02
subsystem: ui
tags: [tmdb, images, srcset, responsive, bundle-size, workbox, caching, performance]

# Dependency graph
requires:
  - phase: 02-data-layer
    provides: TMDB client functions (getPosterUrl, getBackdropUrl)
  - phase: 04-pwa-infrastructure
    provides: Workbox service worker with runtime caching
provides:
  - Responsive srcset on all TMDB poster and backdrop images (w185/w342/w500/w780 posters, w300/w780/w1280 backdrops)
  - Shared utility src/hooks/useResponsiveImage.ts for consistent image URL generation
  - Verified production bundle 218 kB gzipped (excluding 3D lazy chunks) — well under 500 kB target
  - Confirmed dual-layer API caching: IndexedDB (service layer) + Workbox runtime (SW layer)
affects: [any future component adding TMDB images should import from useResponsiveImage]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "tmdbPosterSrcSet/tmdbBackdropSrcSet utilities for consistent srcset generation"
    - "variants={activeVariants} with string keys 'initial'/'animate'/'exit' avoids Framer Motion union type complexity"

key-files:
  created:
    - src/hooks/useResponsiveImage.ts
  modified:
    - src/components/movie/MovieHero.tsx
    - src/components/trending/TrendingPage.tsx
    - src/components/bento/cells/DiscoverHeroCell.tsx
    - src/components/bento/cells/TrendingPreviewCell.tsx
    - src/components/discovery/DiscoveryPage.tsx
    - src/components/free-movies/FreeMoviesPage.tsx
    - src/components/dinner-time/DinnerTimePage.tsx
    - src/components/search/SearchResults.tsx
    - src/components/search/SpotlightResults.tsx
    - src/components/search/NetflixResults.tsx
    - src/components/layout/AppShell.tsx

key-decisions:
  - "TMDB does not serve WebP natively; responsive srcset with w185/w342/w500/w780 is correct PERF-02 implementation"
  - "posterSizes: (max-width: 640px) 185px, (max-width: 1024px) 342px, 500px — matches real component widths"
  - "backdropSizes: (max-width: 640px) 300px, (max-width: 1024px) 780px, 1280px — full-bleed backdrop sizing"
  - "motion.main variants={activeVariants} with string key references (not .initial/.animate props) to avoid Framer Motion TS2590 union type complexity error"
  - "DinnerTimePage FEATURED_IDS.has() cast to 8|9|337 — DinnerTimeServiceId is widened to number, Set type requires exact literal match"

patterns-established:
  - "All new TMDB img elements: import from useResponsiveImage, set srcSet + sizes + loading=lazy + decoding=async"
  - "Backdrop images use loading=lazy (not eager) except DiscoverHeroCell hero which stays eager for LCP"

requirements-completed: [PERF-02, PERF-03, PERF-05]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 8 Plan 02: Image Optimization and Bundle Verification Summary

**Responsive srcset added to all TMDB poster/backdrop images via shared utility; production bundle verified at 218 kB gzipped (non-3D), dual-layer API caching confirmed**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T18:58:44Z
- **Completed:** 2026-02-19T19:02:44Z
- **Tasks:** 2
- **Files modified:** 12 (1 created, 11 modified)

## Accomplishments

- Created `src/hooks/useResponsiveImage.ts` with `tmdbPosterSrcSet`, `tmdbBackdropSrcSet`, `posterSizes`, `backdropSizes` exports — single source of truth for all TMDB image URL generation
- Applied responsive srcset to all 10 components rendering TMDB images: MovieHero, TrendingPage, DiscoverHeroCell, TrendingPreviewCell, DiscoveryPage, FreeMoviesPage, DinnerTimePage, SearchResults, SpotlightResults, NetflixResults
- Production build succeeds cleanly; non-3D bundle is 218.79 kB gzipped (target: under 500 kB) — breakdown: index.js 70.70 kB + react-vendor 90.53 kB + animation-vendor 38.51 kB + CSS 16.34 kB + misc 2.71 kB
- Confirmed Workbox dual-layer caching: TMDB API (NetworkFirst, 200 entries, 24h TTL, 10s timeout), OMDB API (NetworkFirst, 100 entries, 7-day TTL), TMDB Images (CacheFirst, 500 entries, 30-day TTL) + IndexedDB service layer with TTL constants

## Task Commits

Each task was committed atomically:

1. **Task 1: Add responsive srcset to all TMDB poster/backdrop images** - `3e928ac` (feat)
2. **Task 2: Verify bundle size and API caching effectiveness** - `2cf92d0` (fix — TypeScript errors blocking build)

**Plan metadata:** See final metadata commit below.

## Files Created/Modified

- `src/hooks/useResponsiveImage.ts` - Pure utility functions: tmdbPosterSrcSet (w185/w342/w500/w780), tmdbBackdropSrcSet (w300/w780/w1280), posterSizes constant, backdropSizes constant
- `src/components/movie/MovieHero.tsx` - Poster img: added srcSet + sizes + decoding=async
- `src/components/trending/TrendingPage.tsx` - Trending card posters: added srcSet + sizes + decoding=async
- `src/components/bento/cells/DiscoverHeroCell.tsx` - Backdrop img: added srcSet + sizes + decoding=async
- `src/components/bento/cells/TrendingPreviewCell.tsx` - Fan poster imgs: added srcSet + sizes + decoding=async
- `src/components/discovery/DiscoveryPage.tsx` - Full-bleed backdrop + similar movie posters: added srcSet + sizes
- `src/components/free-movies/FreeMoviesPage.tsx` - Backdrop img: added srcSet + sizes + decoding=async
- `src/components/dinner-time/DinnerTimePage.tsx` - Backdrop img: added srcSet + sizes + decoding=async
- `src/components/search/SearchResults.tsx` - Grid poster imgs: added srcSet + sizes + decoding=async
- `src/components/search/SpotlightResults.tsx` - Grid poster imgs: added srcSet + sizes + decoding=async
- `src/components/search/NetflixResults.tsx` - Grid poster imgs: added srcSet + sizes + decoding=async
- `src/components/layout/AppShell.tsx` - Fixed variants prop pattern for motion.main (bug fix)

## Decisions Made

- TMDB does not serve WebP natively; responsive srcset with multiple JPEG resolution sizes is the correct PERF-02 implementation per research
- `posterSizes` maps to real component display widths: 185px mobile, 342px tablet, 500px desktop
- DiscoverHeroCell backdrop retains `loading="eager"` — this is the hero LCP element; changing to lazy would hurt LCP score
- `variants={activeVariants}` with string key references avoids Framer Motion `TS2590: union type too complex` error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript errors preventing production build**
- **Found during:** Task 2 (bundle size verification)
- **Issue 1:** `DinnerTimePage.tsx:59` — `FEATURED_IDS.has(currentService)` fails because `FEATURED_IDS` is `Set<8|9|337>` but `currentService` is typed as `number` (widened DinnerTimeServiceId). TypeScript requires exact literal type for Set.has() parameter
- **Issue 2:** `AppShell.tsx:214-220` — `TS2590: Expression produces union type too complex to represent` when passing `activeVariants.initial` and `activeVariants.animate` directly to Framer Motion props (union of `pageVariants | pageVariants3D`)
- **Fix 1:** Cast `currentService as 8 | 9 | 337` at the Set.has() call site
- **Fix 2:** Switch from `initial={activeVariants.initial} animate={activeVariants.animate}` to `variants={activeVariants} initial="initial" animate="animate" exit="exit"` — string keys avoid the union type resolution issue
- **Files modified:** src/components/dinner-time/DinnerTimePage.tsx, src/components/layout/AppShell.tsx
- **Verification:** `npx tsc --noEmit` exits 0; `npm run build` completes successfully
- **Committed in:** 2cf92d0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking issue, 2 sub-fixes)
**Impact on plan:** Both fixes essential for build to succeed. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in DinnerTimePage.tsx and AppShell.tsx (from Phase 7 uncommitted changes) blocked the production build. Both were fixed inline per deviation Rule 3 before bundle analysis could proceed. `npx tsc --noEmit` had passed without finding these because `tsc -b` (used by `npm run build`) does incremental build with strict checking.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Image optimization complete (PERF-02): all TMDB images have srcset + sizes + loading=lazy + decoding=async
- Bundle size verified (PERF-03): 218 kB gzipped excluding 3D chunks, well under 500 kB target
- API caching confirmed (PERF-05): IndexedDB + Workbox dual-layer with appropriate TTLs
- Ready for Plan 08-03 (accessibility audit / remaining polish tasks)

---
*Phase: 08-polish-optimization*
*Completed: 2026-02-19*

## Self-Check: PASSED

- FOUND: src/hooks/useResponsiveImage.ts
- FOUND: .planning/phases/08-polish-optimization/08-02-SUMMARY.md
- FOUND: commit 3e928ac (Task 1 - responsive srcset)
- FOUND: commit 2cf92d0 (Task 2 - build fix + bundle verification)
