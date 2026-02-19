---
phase: 07-3d-experience
plan: 02
subsystem: ui
tags: [spline, three-js, webgl, zustand, react-lazy, suspense, vite, code-splitting, pwa, workbox]

requires:
  - phase: 07-3d-experience
    plan: 01
    provides: scene3dStore capability state, spline-vendor Vite chunk, AppShell route-aware opacity wrapper, use3DCapability hook

provides:
  - SplineScene component with fixed fullscreen CLS-free container and opacity fade-in
  - SplineHero default-exported wrapper for React.lazy dynamic import
  - AppShell lazy-loads SplineHero for full-3d/reduced-3d devices via Suspense
  - splineApp (Application instance) stored in scene3dStore on scene load
  - sceneError state in scene3dStore for load failure tracking
  - Workbox globIgnores for spline-vendor chunk (excluded from SW precache)
  - public/3d-models/scene.splinecode placeholder for Spline scene export

affects:
  - 07-03 (Theme sync via splineApp ref in scene3dStore)
  - 07-04 (Camera transitions via splineApp ref in scene3dStore)

tech-stack:
  added: []
  patterns:
    - React.lazy + Suspense for deferred 3D runtime loading (Spline runtime only fetched on capable devices)
    - CLS-free fixed container pattern: fixed inset-0 dimensions set before asset loads, opacity transitions from 0 to 1
    - Workbox globIgnores for large lazy chunks that should not be SW-precached
    - sceneError state pattern for graceful 3D load failure with gradient blob fallback

key-files:
  created:
    - src/components/3d/SplineScene.tsx
    - src/components/3d/SplineHero.tsx
    - public/3d-models/scene.splinecode
  modified:
    - src/components/layout/AppShell.tsx
    - src/stores/scene3dStore.ts
    - vite.config.ts

key-decisions:
  - "Workbox globIgnores excludes spline-vendor and SplineHero chunks from SW precache — 4.62 MB 3D runtime is lazy-loaded per capability tier and should never bloat the SW install"
  - "Suspense fallback=null in AppShell — gradient blobs visible during Spline load, seamless progressive enhancement with no loading indicator"
  - "scene3dStore.splineApp typed as Application | null (from @splinetool/runtime) instead of unknown — enables type-safe camera control in Plans 07-03/07-04"
  - "sceneError boolean added to scene3dStore — allows future UI to detect scene failure and stay in gradient-blob fallback gracefully"

patterns-established:
  - "CLS-free 3D canvas pattern: outer div at fixed inset-0 with opacity:0 + transition, inner Spline fills 100%/100%, opacity goes to 1 on onLoad"
  - "Lazy 3D integration pattern: React.lazy at AppShell level, capability check guards the Suspense boundary, fallback=null"

requirements-completed: [3DXP-01, 3DXP-04, 3DXP-06]

duration: 4min
completed: 2026-02-19
---

# Phase 7 Plan 02: SplineHero Integration Summary

**SplineScene + SplineHero lazy-loaded into AppShell's route-aware wrapper with CLS-free fixed container, opacity fade-in, splineApp reference in scene3dStore, and Workbox precache exclusion for the 4.62 MB Spline runtime chunk**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19T08:31:17Z
- **Completed:** 2026-02-19T08:35:17Z
- **Tasks:** 2
- **Files modified:** 6 (3 created, 3 updated)

## Accomplishments

- SplineScene: fixed fullscreen CLS-free container, opacity 0 → 1 on scene load, splineApp stored in scene3dStore, pointer-events-none passes clicks through, reduced prop scales to 75% for reduced-3d devices
- SplineHero: thin default-exported wrapper enabling React.lazy in AppShell; lazy-imports SplineScene directly (AppShell owns the lazy boundary)
- AppShell: LazySplineHero rendered inside route-aware opacity wrapper for full-3d/reduced-3d; ParallaxFallback for fallback-2d; Suspense fallback=null for seamless progressive enhancement
- scene3dStore: typed splineApp as Application | null (proper @splinetool/runtime type); added sceneError/setSceneError for graceful load failure
- vite.config.ts: Workbox globIgnores excludes spline-vendor (4.62 MB) and SplineHero chunks from SW precache — build now succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SplineScene core component and SplineHero lazy wrapper** - `dff1cc9` (feat)
2. **Task 2: Integrate SplineHero into AppShell's route-aware opacity wrapper** - `3df62a5` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/3d/SplineScene.tsx` - Core Spline component: fixed fullscreen container, opacity fade-in, onLoad/onError handlers, splineApp stored in scene3dStore, reduced-3d scale support
- `src/components/3d/SplineHero.tsx` - Default-exported wrapper for React.lazy; passes reduced prop to SplineScene; entry point for Plans 07-03/07-04 hero logic
- `public/3d-models/scene.splinecode` - Placeholder file with instructions to design and export Spline scene; SplineScene logs warning and sets sceneError=true gracefully
- `src/components/layout/AppShell.tsx` - Added LazySplineHero via React.lazy; Suspense with fallback=null wraps LazySplineHero for full-3d/reduced-3d capability tiers
- `src/stores/scene3dStore.ts` - Added sceneError/setSceneError; typed splineApp as Application | null from @splinetool/runtime
- `vite.config.ts` - Added Workbox globIgnores for spline-vendor-*.js and SplineHero-*.js chunks

## Decisions Made

- Workbox globIgnores prevents the 4.62 MB Spline runtime from being SW-precached — this is a lazy-loaded asset fetched only on capable devices, precaching it would bloat every SW install
- Suspense fallback=null chosen over a loading spinner — gradient blobs already provide visual continuity during the Spline load window
- splineApp typed as Application | null (proper runtime type) instead of unknown — Plans 07-03/07-04 camera control will need typed access to Application methods
- sceneError state added proactively — enables Plans 07-03/07-04 to detect scene failure and stay in fallback gracefully without adding another store update later

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Workbox globIgnores to exclude spline-vendor chunk from SW precache**
- **Found during:** Task 2 (build verification)
- **Issue:** `npm run build` failed with Workbox error — spline-vendor-*.js is 4.62 MB, exceeding Workbox's 2 MiB precache limit. The plan didn't include this Workbox configuration change.
- **Fix:** Added `globIgnores: ['**/spline-vendor-*.js', '**/SplineHero-*.js']` to the Workbox config in vite.config.ts
- **Files modified:** `vite.config.ts`
- **Verification:** Build succeeds, PWA precaches 28 entries (1028 KiB)
- **Committed in:** `3df62a5` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix essential for build correctness — excluding lazy 3D chunks from SW precache is the correct architectural decision (3D assets are capability-gated, not for all users).

## Issues Encountered

None beyond the auto-fixed Workbox build failure above.

## User Setup Required

**External service requires manual configuration.**

To render the actual 3D cinematic studio scene (instead of the graceful gradient-blob fallback):

1. Open [app.spline.design](https://app.spline.design) and create a new project
2. Model film equipment props: clapperboard, film reel, movie camera, director chair, spotlights
3. Add floating movie poster objects with atmospheric haze
4. Configure camera states and variables for route transitions (Plan 07-04)
5. File > Export > Code (.splinecode)
6. Replace `public/3d-models/scene.splinecode` with the exported file

Until the scene file is replaced, the app renders gradient blobs as fallback (graceful degradation — no errors shown to users).

## Next Phase Readiness

- splineApp reference stored in scene3dStore.splineApp (Application | null) — ready for Plan 07-03 theme variable sync via `splineApp.setVariable()`
- scene3dStore.sceneLoaded tracks when Spline canvas is ready — Plan 07-03 can wait for this before applying theme variables
- sceneError flag available for Plan 07-03/07-04 to skip camera/theme operations when scene failed to load
- Global 3D layer stays mounted on all routes (opacity-controlled) — camera transitions in Plan 07-04 can fire on route change

## Self-Check: PASSED

- FOUND: src/components/3d/SplineScene.tsx
- FOUND: src/components/3d/SplineHero.tsx
- FOUND: public/3d-models/scene.splinecode
- FOUND: .planning/phases/07-3d-experience/07-02-SUMMARY.md
- FOUND: commit dff1cc9 (Task 1)
- FOUND: commit 3df62a5 (Task 2)

---
*Phase: 07-3d-experience*
*Completed: 2026-02-19*
