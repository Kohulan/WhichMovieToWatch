---
phase: 06-bento-grid-layouts
plan: 02
subsystem: ui
tags: [bento-grid, glassmorphism, claymorphism, react-router, framer-motion, homepage, navigation]
dependency_graph:
  requires:
    - src/components/bento/BentoGrid.tsx (12-col responsive grid container from Plan 06-01)
    - src/components/bento/BentoCell.tsx (glass/clay cell wrapper from Plan 06-01)
    - src/hooks/useTrending.ts (live movie data for poster/rating cells)
    - src/components/animation/StaggerContainer.tsx (staggered scroll entrance animation)
    - src/components/ui/MetalButton.tsx (CTA button in DiscoverHeroCell)
  provides:
    - src/pages/HomePage.tsx (bento grid hero landing page with 7 cells)
    - src/components/bento/cells/DiscoverHeroCell.tsx (glassmorphism hero cell with trending backdrop)
    - src/components/bento/cells/TrendingPreviewCell.tsx (live poster fan from useTrending)
    - src/components/bento/cells/RatingShowcaseCell.tsx (live vote_average display)
    - src/components/bento/cells/ProviderLogosCell.tsx (6 streaming service logos)
    - src/components/bento/cells/DinnerTimeCell.tsx (feature CTA to /dinner-time)
    - src/components/bento/cells/FreeMoviesCell.tsx (feature CTA to /free-movies)
    - src/components/bento/cells/SearchCell.tsx (feature CTA to /discover)
  affects:
    - Plan 06-03 (page bento sections — uses same cells pattern)
    - All future pages (home page is now entry point)
tech-stack:
  added: []
  patterns:
    - Cell content components are pure layout/data — no BentoCell wrapper inside (parent composes that)
    - StaggerContainer wraps BentoGrid with 0.12s stagger; StaggerItem wraps each BentoCell
    - Glass cells for hero/live-data sections; clay cells for feature CTAs
    - Navigate from cells via useNavigate(); cell onClick prop passed to BentoCell for tap-to-expand
key-files:
  created:
    - src/pages/HomePage.tsx
    - src/components/bento/cells/DiscoverHeroCell.tsx
    - src/components/bento/cells/TrendingPreviewCell.tsx
    - src/components/bento/cells/RatingShowcaseCell.tsx
    - src/components/bento/cells/ProviderLogosCell.tsx
    - src/components/bento/cells/DinnerTimeCell.tsx
    - src/components/bento/cells/FreeMoviesCell.tsx
    - src/components/bento/cells/SearchCell.tsx
  modified:
    - src/main.tsx (HomePage at index /, DiscoverPage moved to /discover)
    - src/components/layout/TabBar.tsx (5 tabs with Home first)
key-decisions:
  - "SearchCell navigates to /discover as fallback — SearchModal open mechanism not accessible from static cell context without global store coupling"
  - "StaggerItem wraps BentoCell (not inside BentoCell children) — StaggerContainer needs direct motion.div children to inherit stagger timing via variants propagation"
  - "ProviderLogosCell uses static TMDB logo paths for 6 known providers — avoids runtime API call for decorative UI"
  - "DiscoverHeroCell uses gradient placeholder background while trending data loads — no skeleton flash for hero area"
patterns-established:
  - "Cell pattern: pure content component (no BentoCell inside); parent HomePage composes cell + BentoCell"
  - "Live data cells (DiscoverHero, TrendingPreview, RatingShowcase) all use useTrending hook — single hook instance via React"
requirements-completed: [BENT-02, BENT-03]
duration: 2min
completed: 2026-02-19
---

# Phase 06 Plan 02: HomePage with Bento Grid and Cell Components Summary

**HomePage with 7-cell bento grid hero: glassmorphism Discover+Trending cells with live TMDB data, clay feature CTAs (Dinner Time, Free Movies, Search), 5-tab TabBar with Home, and routing change (DiscoverPage to /discover)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T02:20:40Z
- **Completed:** 2026-02-19T02:22:40Z
- **Tasks:** 2
- **Files modified:** 10 (8 created, 2 updated)

## Accomplishments

- Created 7 bento cell content components, each focused on a single feature/data concern
- Built HomePage composing cells into a 12-column bento grid with StaggerContainer scroll entry stagger
- Updated routing: HomePage is now the landing page (`/`), DiscoverPage moved to `/discover`
- Updated TabBar from 4 to 5 tabs with Home (House icon) as first tab

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all bento cell content components** - `d8bedd9` (feat)
2. **Task 2: Create HomePage, update routing and TabBar** - `efb7052` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/components/bento/cells/DiscoverHeroCell.tsx` - Glassmorphism hero cell: trending movie backdrop + "Start Discovering" CTA button, gradient placeholder while loading
- `src/components/bento/cells/TrendingPreviewCell.tsx` - 3 poster fan layout from useTrending, skeleton shimmer loading state, click navigates /trending
- `src/components/bento/cells/RatingShowcaseCell.tsx` - Live vote_average in large font with Star icon, shows movie title below, clay material
- `src/components/bento/cells/ProviderLogosCell.tsx` - Static 6 provider logos (Netflix, Disney+, Prime, Apple TV+, HBO Max, Paramount+) in 3x2 grid
- `src/components/bento/cells/DinnerTimeCell.tsx` - UtensilsCrossed icon + text + ArrowRight, navigates /dinner-time
- `src/components/bento/cells/FreeMoviesCell.tsx` - Film icon + text + ArrowRight, navigates /free-movies
- `src/components/bento/cells/SearchCell.tsx` - Search icon + text + ArrowRight, navigates /discover
- `src/pages/HomePage.tsx` - 12-col BentoGrid with StaggerContainer(0.12s), 7 BentoCell slots with correct materials/colSpans/rowSpans
- `src/main.tsx` - Added HomePage import; index route → HomePage; discover route → DiscoverPage
- `src/components/layout/TabBar.tsx` - 5 tabs: Home(/,end=true), Discover(/discover), Trending, Dinner, Free; Home icon from lucide-react

## Decisions Made

- SearchCell navigates to `/discover` as fallback — the SearchModal open mechanism requires access to a Zustand store action; accessing a store action from a static bento cell would create tight coupling with search state management. The fallback keeps the cell decoupled.
- StaggerItem wraps each BentoCell at the HomePage level — this ensures StaggerContainer's variants propagation reaches the motion.div in StaggerItem correctly.
- ProviderLogosCell uses static TMDB logo paths — avoids a runtime API call for a decorative cell that never needs to be dynamic.
- DiscoverHeroCell uses a gradient placeholder (not skeleton) — the backdrop image area is large; a gradient provides better visual continuity than a grey shimmer while the API loads.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HomePage with bento grid is the new landing experience
- All 7 cell components are ready; pattern established for Plan 06-03 page bento sections
- DiscoverPage accessible at `/#/discover`, deep links via `?movie=ID` still work (window.location.search is path-independent)
- TabBar 5-tab layout ready for any additional page integrations

---
*Phase: 06-bento-grid-layouts*
*Completed: 2026-02-19*

## Self-Check: PASSED

### Files Verified
- [x] `src/pages/HomePage.tsx` — FOUND
- [x] `src/components/bento/cells/DiscoverHeroCell.tsx` — FOUND
- [x] `src/components/bento/cells/TrendingPreviewCell.tsx` — FOUND
- [x] `src/components/bento/cells/RatingShowcaseCell.tsx` — FOUND
- [x] `src/components/bento/cells/ProviderLogosCell.tsx` — FOUND
- [x] `src/components/bento/cells/DinnerTimeCell.tsx` — FOUND
- [x] `src/components/bento/cells/FreeMoviesCell.tsx` — FOUND
- [x] `src/components/bento/cells/SearchCell.tsx` — FOUND
- [x] `src/main.tsx` — MODIFIED
- [x] `src/components/layout/TabBar.tsx` — MODIFIED

### Commits Verified
- [x] `d8bedd9` — feat(06-02): create 7 bento cell content components — FOUND
- [x] `efb7052` — feat(06-02): create HomePage, update routing and TabBar — FOUND

### TypeScript
- [x] `npx tsc --noEmit` passes with zero errors

### Build
- [x] `npm run build` succeeds (1.86s, 207.82 kB bundle)
