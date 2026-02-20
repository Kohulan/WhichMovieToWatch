---
phase: 05-animation-layer
plan: 03
subsystem: ui
tags: [react, framer-motion, motion, scroll-reveal, stagger, animation, whileInView]

# Dependency graph
requires:
  - phase: 05-animation-layer/05-01
    provides: MotionProvider with reducedMotion="user" wrapping the app, so ScrollReveal/StaggerContainer animations respect prefers-reduced-motion automatically
provides:
  - ScrollReveal component — whileInView wrapper with replay support (full first entry, shorter re-entry at 40% travel)
  - StaggerContainer + StaggerItem — parent/child stagger choreography with direction variants (up, left, right)
  - TrendingPage staggered card grid (stagger 0.05s, cascade entrance)
  - DiscoveryPage below-fold similar movies with ScrollReveal + horizontal StaggerContainer (direction left)
  - DinnerTimePage header ScrollReveal (once) + service buttons StaggerContainer (stagger 0.1s)
  - FreeMoviesPage header ScrollReveal (once)
affects:
  - 05-04 (micro-interactions plan — builds on same animation infrastructure)
  - 05-05 (material enhancements plan — coexists with same component files)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - whileInView with viewport.amount threshold for scroll-triggered reveal
    - hasAnimated state pattern for replay-aware first/re-entry animation variants
    - StaggerContainer parent propagates variants to StaggerItem children (children omit initial/animate)
    - once=true for above-fold headers that should animate only once

key-files:
  created:
    - src/components/animation/ScrollReveal.tsx
    - src/components/animation/StaggerContainer.tsx
  modified:
    - src/components/trending/TrendingPage.tsx
    - src/components/discovery/DiscoveryPage.tsx
    - src/components/dinner-time/DinnerTimePage.tsx
    - src/components/free-movies/FreeMoviesPage.tsx

key-decisions:
  - "ScrollReveal uses useState(hasAnimated) to reduce travel/duration on re-entry: first 0.6s/full travel, re-entry 0.3s/40% travel — per user decision"
  - "StaggerContainer passes role and aria-label through to underlying motion.div for ARIA accessibility on list containers"
  - "StaggerItem omits initial/whileInView — inherits timing purely from parent StaggerContainer variants propagation"
  - "viewport.amount: 0.2 on ScrollReveal and 0.15 on StaggerContainer prevents rapid-fire triggers during fast scroll"
  - "once=true on DinnerTimePage and FreeMoviesPage headers: near top of page, only needs first-view animation"

patterns-established:
  - "Replay-aware scroll reveal: track hasAnimated boolean state, vary duration/travel based on whether element has been seen"
  - "Parent-child stagger: StaggerContainer sets staggerChildren, StaggerItem uses variants prop only (no self-contained initial/animate)"
  - "Horizontal slide-in: direction='left' on StaggerContainer + StaggerItem for movie poster rows"

requirements-completed: [ANIM-02]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Phase 05 Plan 03: Scroll Reveal Animation Components Summary

**ScrollReveal and StaggerContainer components with replay-aware animations, integrated into all four content pages for staggered card entrances and horizontal slide-ins on scroll**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-18T21:18:21Z
- **Completed:** 2026-02-18T21:22:16Z
- **Tasks:** 2
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments
- Created `ScrollReveal` — whileInView wrapper that plays full animation (0.6s, 80px travel) on first entry and shorter replay (0.3s, 32px travel) on scroll-back
- Created `StaggerContainer` + `StaggerItem` — cascade choreography where parent controls stagger timing and children inherit via variants propagation; supports up/left/right directions
- Integrated into TrendingPage (stagger 0.05s card cascade), DiscoveryPage (similar movies scroll reveal + left slide-in stagger), DinnerTimePage (header once-reveal + service button stagger), FreeMoviesPage (header once-reveal)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScrollReveal and StaggerContainer animation components** - `f2b0d05` (feat)
2. **Task 2: Integrate scroll reveals into all content pages** - `e88b21d` (feat)

## Files Created/Modified
- `src/components/animation/ScrollReveal.tsx` — whileInView wrapper with hasAnimated state for replay-aware first/re-entry animation variants
- `src/components/animation/StaggerContainer.tsx` — StaggerContainer (parent) + StaggerItem (child) with direction variants (up/left/right), role/aria-label passthrough
- `src/components/trending/TrendingPage.tsx` — movie grid wrapped in StaggerContainer (stagger 0.05, direction up), each card in StaggerItem
- `src/components/discovery/DiscoveryPage.tsx` — below-fold similar movies section wrapped in ScrollReveal (travel 60), individual movie buttons in StaggerContainer (direction left, stagger 0.06)
- `src/components/dinner-time/DinnerTimePage.tsx` — page header in ScrollReveal (travel 40, once), service buttons in StaggerContainer (stagger 0.1, direction up) each wrapped in StaggerItem
- `src/components/free-movies/FreeMoviesPage.tsx` — page header in ScrollReveal (travel 40, once)

## Decisions Made
- `StaggerContainer` passes `role` and `aria-label` props to the underlying `motion.div` — necessary because TrendingPage uses `role="list"` on the container for accessibility
- `once=true` for page headers (DinnerTime, FreeMovies): these sit near the top of the page and don't benefit from replay behavior
- `viewport.amount: 0.2` (ScrollReveal) and `0.15` (StaggerContainer) thresholds per research recommendation to prevent rapid-fire jank during fast scroll
- Horizontal similar movies use `direction="left"` per user decision: "Horizontal lists slide in as a group from one side"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added role and aria-label prop passthrough to StaggerContainer**
- **Found during:** Task 2 (TrendingPage integration)
- **Issue:** Plan said to keep existing `role="list"` and `aria-label` on the grid div, but StaggerContainer interface didn't accept these props — would have silently dropped them
- **Fix:** Added `role?: string` and `aria-label?: string` to StaggerContainerProps interface and forwarded to underlying `motion.div`
- **Files modified:** `src/components/animation/StaggerContainer.tsx`
- **Verification:** Build passes, attributes properly forwarded
- **Committed in:** e88b21d (Task 2 commit, StaggerContainer also staged)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical accessibility prop passthrough)
**Impact on plan:** Essential for ARIA accessibility compliance. No scope creep.

## Issues Encountered
None — plan executed with one small ARIA fix.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ScrollReveal and StaggerContainer are generic, reusable wrappers — any future page can import and use them
- Animation infrastructure (MotionProvider + reducedMotion) properly wraps all scroll animations via App.tsx
- Ready for 05-04 (micro-interactions) and 05-05 (material enhancements) which modify overlapping component files

---
*Phase: 05-animation-layer*
*Completed: 2026-02-18*

## Self-Check: PASSED

- FOUND: src/components/animation/ScrollReveal.tsx
- FOUND: src/components/animation/StaggerContainer.tsx
- FOUND: .planning/phases/05-animation-layer/05-03-SUMMARY.md
- FOUND commit: f2b0d05 (Task 1)
- FOUND commit: e88b21d (Task 2)
