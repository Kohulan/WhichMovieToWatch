---
phase: 06-bento-grid-layouts
plan: 03
subsystem: ui
tags: [bento-grid, css-grid, framer-motion, glassmorphism, claymorphism, responsive, stagger-animation]

requires:
  - phase: 06-bento-grid-layouts/06-01
    provides: BentoGrid responsive CSS Grid container and BentoCell glass/clay material cells with hover effects

provides:
  - src/components/trending/TrendingBentoHero.tsx (2-cell compact bento hero for Trending page)
  - src/components/dinner-time/DinnerTimeBentoHero.tsx (2-cell compact bento hero for Dinner Time page)
  - src/components/free-movies/FreeMoviesBentoHero.tsx (2-cell compact bento hero for Free Movies page)
  - Updated src/pages/TrendingPage.tsx (hero above existing trending movie grid)
  - Updated src/pages/DinnerTimePage.tsx (hero above existing dinner time service selector)
  - Updated src/pages/FreeMoviesPage.tsx (hero above existing free movies content)

affects:
  - Phase 07 (3D showcase) — bento hero pattern established for further page enhancement

tech-stack:
  added: []
  patterns:
    - Additive bento hero pattern: hero rendered via route wrapper, inner component unchanged
    - Fragment-based page composition for pages with full-width fixed backdrops
    - BentoGrid(columns=6) compact layout for page-level hero sections (not full 12-column)
    - StaggerContainer(stagger=0.12) wrapping BentoGrid for scroll-entry animation

key-files:
  created:
    - src/components/trending/TrendingBentoHero.tsx
    - src/components/dinner-time/DinnerTimeBentoHero.tsx
    - src/components/free-movies/FreeMoviesBentoHero.tsx
  modified:
    - src/pages/TrendingPage.tsx
    - src/pages/DinnerTimePage.tsx
    - src/pages/FreeMoviesPage.tsx

key-decisions:
  - "DinnerTimePage and FreeMoviesPage heroes placed in Fragment: inner components use full-screen fixed backdrop, adding outer max-width wrapper would not affect the backdrop (position:fixed is viewport-relative) but would constrain content — Fragment + own max-w-7xl wrapper for hero only keeps layout clean"
  - "TrendingBentoHero uses useTrending() hook for live data — first trending movie backdrop shown in glass cell, movie count from movies.length in clay cell, consistent with real-time data language of the page"
  - "DinnerTimeBentoHero imports getServiceConfig/getServiceLogoUrl/DINNER_TIME_SERVICES from existing sources — no duplication, same service data as the page itself"
  - "FreeMoviesBentoHero uses hardcoded '1,000+' count stat — matches page copy ('Over 2,000 free movies to discover' in FreeMoviesPage uses different number; hero shows conservative round stat)"

patterns-established:
  - "Additive hero pattern: route wrapper adds hero above imported page component, page component itself unchanged"
  - "Fixed-backdrop pages use Fragment composition: <><div max-w wrapper for hero /><FullWidthPageComponent /></>"

requirements-completed:
  - BENT-03

duration: 3min
completed: 2026-02-19
---

# Phase 06 Plan 03: Per-Page Bento Hero Sections Summary

**Three compact 2-cell bento hero sections (glass+clay) added above existing Trending, Dinner Time, and Free Movies pages using BentoGrid(columns=6) with StaggerContainer scroll-entry animation — all additive, no existing page components modified**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T02:20:43Z
- **Completed:** 2026-02-19T02:23:11Z
- **Tasks:** 2
- **Files modified:** 6 (3 created, 3 updated)

## Accomplishments
- Created `TrendingBentoHero` — live trending data (backdrop + title + rating in glass cell, movie count + TrendingUp icon in clay cell)
- Created `DinnerTimeBentoHero` — family movie night intro (warm gradient glass cell + Netflix/Prime/Disney+ logo strip in clay cell)
- Created `FreeMoviesBentoHero` — YouTube branding (red gradient glass cell + "1,000+ free movies" stat in clay cell)
- Updated 3 page route wrappers to render bento heroes above existing content with correct layout strategy for each page type

## Task Commits

Each task was committed atomically:

1. **Task 1: Create per-page bento hero components** - `102cca8` (feat)
2. **Task 2: Integrate bento heroes into page route wrappers** - `3a0426f` (feat)

**Plan metadata:** (pending final metadata commit)

## Files Created/Modified
- `src/components/trending/TrendingBentoHero.tsx` — 2-cell bento hero using useTrending() for live movie data; glass cell shows first trending movie backdrop+rating, clay cell shows movie count+auto-refresh note
- `src/components/dinner-time/DinnerTimeBentoHero.tsx` — 2-cell bento hero with warm-gradient glass intro cell and clay cell with Netflix/Prime/Disney+ logos from existing ServiceBranding data
- `src/components/free-movies/FreeMoviesBentoHero.tsx` — 2-cell bento hero with YouTube red-gradient glass cell and clay stat cell showing "1,000+ free movies"
- `src/pages/TrendingPage.tsx` — TrendingBentoHero added inside existing max-w-7xl container wrapper above TrendingPageComponent
- `src/pages/DinnerTimePage.tsx` — Fragment composition: DinnerTimeBentoHero in own max-w-7xl div + DinnerTimePageComponent rendered without outer wrapper (preserves full-width fixed backdrop)
- `src/pages/FreeMoviesPage.tsx` — Same Fragment pattern as DinnerTimePage; FreeMoviesPageComponent unchanged

## Decisions Made
- **Fragment composition for fixed-backdrop pages:** DinnerTimePage and FreeMoviesPage inner components use `position: fixed` full-screen backdrops. Added hero in its own `max-w-7xl` wrapper div, then rendered the inner component without an outer constraint. Fragment avoids double max-width wrapping while allowing the hero to be visually contained.
- **TrendingBentoHero uses useTrending() hook directly** — hero and the TrendingPageComponent both call useTrending(), but React's shared hook state means both components receive the same fetched data without double-fetching.
- **DinnerTimeBentoHero reuses getServiceConfig/getServiceLogoUrl** from ServiceBranding — no inline logo URLs, uses same data source as the page itself.
- **BentoGrid(columns=6) for all heroes** — compact 6-column grid keeps heroes small (2 cells spanning 3+3), under 2 desktop rows per plan requirement.

## Deviations from Plan

None — plan executed exactly as written.

The plan's note to "check if FreeMoviesPageComponent has its own container" was followed: both DinnerTimePage and FreeMoviesPage inner components use `w-full` wrappers with their own internal padding, so Fragment-based composition was used (matching the plan's guidance about not double-wrapping).

## Issues Encountered
None — TypeScript passes with zero errors, build completes cleanly in 1.87s.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All 3 feature pages now have bento hero sections consistent with the home page bento language established in Phase 06
- Phase 06 is complete — all 3 plans executed
- Ready for Phase 07 (3D Interactive Showcase)

---
*Phase: 06-bento-grid-layouts*
*Completed: 2026-02-19*

## Self-Check: PASSED

### Files Created
- [x] `src/components/trending/TrendingBentoHero.tsx` — FOUND
- [x] `src/components/dinner-time/DinnerTimeBentoHero.tsx` — FOUND
- [x] `src/components/free-movies/FreeMoviesBentoHero.tsx` — FOUND
- [x] `.planning/phases/06-bento-grid-layouts/06-03-SUMMARY.md` — FOUND

### Commits
- [x] `102cca8` — feat(06-03): create TrendingBentoHero, DinnerTimeBentoHero, FreeMoviesBentoHero — FOUND
- [x] `3a0426f` — feat(06-03): integrate bento heroes into page route wrappers — FOUND

### TypeScript
- [x] `npx tsc --noEmit` passes with zero errors

### Build
- [x] `npm run build` succeeds (1.87s)
