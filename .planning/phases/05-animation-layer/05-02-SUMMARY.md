---
phase: 05-animation-layer
plan: 02
subsystem: ui
tags: [motion, framer-motion, animation, page-transitions, layout-animation, morph, crossfade]

# Dependency graph
requires:
  - phase: 05-01
    provides: MotionProvider, animations.css, motion/react setup

provides:
  - PageTransition.tsx with pageVariants (fade+slide+scale) and pageTransition (350ms cubic-bezier)
  - AppShell enhanced with centralized route transition variants
  - DiscoveryPage morph transition (blur+scale) on Next Movie with backdrop crossfade and layoutId posters
  - MovieHero movieId prop and layoutId on poster for hero expand animation
  - DinnerTimePage morph transition and backdrop crossfade
  - FreeMoviesPage morph transition and backdrop crossfade

affects: [05-03, 05-04, 05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralized variant module pattern: pageVariants/pageTransition in PageTransition.tsx consumed by AppShell"
    - "AnimatePresence mode=wait + keyed motion element pattern for morph transitions across 3 pages"
    - "Backdrop crossfade: AnimatePresence wraps motion.img keyed by movie ID, gradient overlay stays outside"
    - "layoutId shared layout: similar-poster-{id} prefix connects thumbnail to hero poster"

key-files:
  created:
    - src/components/animation/PageTransition.tsx
  modified:
    - src/components/layout/AppShell.tsx
    - src/components/discovery/DiscoveryPage.tsx
    - src/components/movie/MovieHero.tsx
    - src/components/dinner-time/DinnerTimePage.tsx
    - src/components/free-movies/FreeMoviesPage.tsx

key-decisions:
  - "PageTransition.tsx is a pure data module (no JSX) — variants exported as constants, consumed by AppShell"
  - "Morph variants: initial blur(4px)+scale(0.95), exit blur(6px)+scale(1.02) for controlled dissolve (not bouncy)"
  - "layoutId prefix similar-poster-{movieId} avoids collisions with other page elements"
  - "FreeMoviesPage uses movie.youtubeId as AnimatePresence key (tmdb.id can be 0 for title-only stubs)"
  - "Gradient overlay stays outside AnimatePresence — it remains constant while backdrop crossfades beneath"

patterns-established:
  - "Morph transition pattern: AnimatePresence mode=wait > motion.section key={movie.id} > blur+scale variants"
  - "Backdrop crossfade pattern: AnimatePresence mode=wait > motion.img keyed by ID, gradient div outside AP"
  - "Hero expand pattern: layoutId=similar-poster-{id} on thumbnail, same layoutId on MovieHero poster"

requirements-completed: [ANIM-01, ANIM-04]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 5 Plan 02: Animation Layer - Page Transitions and Layout Animations Summary

**Cinematic route transitions (fade+slide+scale at 350ms) and Next Movie morph dissolve (blur+scale) across Discovery, DinnerTime, and FreeMovies, plus layoutId hero expand animation connecting similar posters to the MovieHero**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T21:18:24Z
- **Completed:** 2026-02-18T21:23:26Z
- **Tasks:** 2
- **Files modified:** 6 (1 created, 5 modified)

## Accomplishments
- Created centralized `PageTransition.tsx` module with `pageVariants` and `pageTransition` — AppShell now imports these instead of inline values
- Route transitions upgraded from simple fade+slide to combined fade+slide+scale (opacity 0→1, y 20→0, scale 0.98→1) at 350ms with premium cubic-bezier easing
- All 3 movie pages (Discovery, DinnerTime, FreeMovies) now morph-transition on movie change using blur(4px→0→6px)+scale(0.95→1→1.02) dissolve
- Backdrop images crossfade between movies using AnimatePresence-wrapped motion.img (0.5s fade) instead of hard-cutting
- MovieHero accepts optional `movieId` prop and applies `layoutId=similar-poster-{movieId}` on poster for spatial shared-layout animation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PageTransition variants and enhance AppShell route transitions** - `6f81908` (feat)
2. **Task 2: Add morph transitions, backdrop crossfade, and layoutId hero expand** - `8d0fc98` (feat)

**Plan metadata:** committed with docs commit below

## Files Created/Modified
- `src/components/animation/PageTransition.tsx` - Pure data module exporting pageVariants and pageTransition constants
- `src/components/layout/AppShell.tsx` - Imports pageVariants/pageTransition from PageTransition module
- `src/components/discovery/DiscoveryPage.tsx` - AnimatePresence morph on hero, backdrop crossfade, motion.img/div with layoutId on similar posters
- `src/components/movie/MovieHero.tsx` - Added movieId prop, motion.img/div on poster with optional layoutId
- `src/components/dinner-time/DinnerTimePage.tsx` - AnimatePresence morph on movie hero, backdrop crossfade
- `src/components/free-movies/FreeMoviesPage.tsx` - AnimatePresence morph on movie hero, backdrop crossfade

## Decisions Made
- PageTransition.tsx is a pure data module (no JSX) — variants exported as constants consumed by AppShell
- Morph transition uses tween (not spring) with cubic-bezier [0.25,0.1,0.25,1] — smooth and controlled, not bouncy
- layoutId prefix `similar-poster-{movieId}` avoids collisions with other page elements
- FreeMoviesPage uses `movie.youtubeId` as AnimatePresence key since tmdb.id can be 0 for title-only movie stubs
- Gradient overlay div stays outside AnimatePresence — it remains constant as the backdrop image crossfades beneath it

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- DinnerTimePage, DiscoveryPage, and FreeMoviesPage had already been modified by a prior execution (05-03 ScrollReveal/StaggerContainer was applied before 05-02 ran). The files were read fresh before each edit to pick up the current state. All changes were applied correctly on top of the existing 05-03 modifications.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Page transitions and layout animations are complete across all 4 tabs
- layoutId hero expand is ready for use — clicking a similar movie poster will animate it expanding into the hero position
- DinnerTime and FreeMovies have full morph+crossfade animation pipeline
- Ready for Plan 05-03 scroll-reveal animations (already applied by an earlier run)

---
*Phase: 05-animation-layer*
*Completed: 2026-02-18*

## Self-Check: PASSED

- `src/components/animation/PageTransition.tsx` — FOUND
- `src/components/layout/AppShell.tsx` — FOUND
- `.planning/phases/05-animation-layer/05-02-SUMMARY.md` — FOUND
- Commit `6f81908` (Task 1) — FOUND
- Commit `8d0fc98` (Task 2) — FOUND
