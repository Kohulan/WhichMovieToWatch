---
phase: 07-3d-experience
plan: 04
subsystem: ui
tags: [spline, three-js, webgl, zustand, react-router, framer-motion, react-lazy, code-splitting, camera-transitions, page-transitions]

requires:
  - phase: 07-3d-experience
    plan: 02
    provides: splineApp (Application | null) in scene3dStore, sceneLoaded state, Spline scene lazy-loaded for full-3d/reduced-3d

provides:
  - CameraTransitionManager renderless component watching route changes and firing Spline camera transitions
  - ROUTE_CAMERA_MAP: 5 routes mapped to named camera states (home-view, discover-view, trending-view, dinner-view, free-view)
  - triggerCameraTransition action in scene3dStore: finds Camera by name, calls camera.transition() with 400ms EASE_IN_OUT, graceful error handling
  - currentCameraState tracker in scene3dStore with deduplication (skips redundant transitions)
  - pageVariants3D and pageTransition3D exports from PageTransition.tsx (fade-only, 0.3s easeInOut)
  - AppShell dynamically selects between 3D-aware and standard page transitions based on capability + sceneLoaded

affects:
  - 07-05 (Theme variable sync uses same splineApp ref; CameraTransitionManager pattern reusable)

tech-stack:
  added: []
  patterns:
    - Renderless route-watching component pattern: returns null, useEffect on location.pathname, triggers store actions
    - Layered cinematic transition pattern: Spline camera (400ms spatial) + Framer Motion content (300ms fade) in concert
    - Dynamic variant selection pattern: activeVariants/activeTransition derived from capability + sceneLoaded guards
    - Camera state deduplication: currentCameraState tracker prevents redundant transition calls on re-renders

key-files:
  created:
    - src/components/3d/CameraTransitionManager.tsx
  modified:
    - src/stores/scene3dStore.ts
    - src/components/animation/PageTransition.tsx
    - src/components/layout/AppShell.tsx

key-decisions:
  - "CameraTransitionManager lazy-loaded via React.lazy (Suspense fallback=null) — adds only 0.50 kB chunk, preserves code-splitting boundary"
  - "currentCameraState deduplication in scene3dStore — avoids firing redundant Spline transitions on re-renders without route changes"
  - "pageTransition3D at 0.3s (faster than camera 0.4s) — content fades in while camera settles, creating layered cinematic feel"
  - "CameraTransitionManager excludes currentCameraState/triggerCameraTransition from useEffect deps — stable store refs, intentional to avoid re-triggering mid-transition"
  - "triggerCameraTransition updates currentCameraState even on error — prevents repeated failed transitions to same state on subsequent renders"

patterns-established:
  - "Renderless route-watching pattern: component returns null, owns one useEffect on pathname, delegates to store action"
  - "Two-system cinematic transition: Spline camera provides spatial movement, Framer Motion content provides fade reveal — neither competes"

requirements-completed: [3DXP-03]

duration: 2min
completed: 2026-02-19
---

# Phase 7 Plan 04: Camera State Transitions Summary

**Spline camera state transitions on route change via renderless CameraTransitionManager — lateral track for sibling pages, dolly push for home navigation — with AppShell dynamically switching between 3D fade-only and standard slide+scale+fade page transitions**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-19T08:38:03Z
- **Completed:** 2026-02-19T08:40:52Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 updated)

## Accomplishments

- CameraTransitionManager: renderless component, watches `useLocation().pathname`, maps 5 routes to Spline camera states, only fires transition when state actually changes
- scene3dStore: added `currentCameraState` (default 'home-view'), `setCameraState`, and `triggerCameraTransition` — finds Camera object via `splineApp.findObjectByName('Camera')`, calls `camera.transition({ to, duration: 0.4, easing: 'EASE_IN_OUT' })`, wraps in try/catch for graceful handling of scenes without defined camera states
- PageTransition.tsx: added `pageVariants3D` (fade-only) and `pageTransition3D` (0.3s easeInOut) alongside the existing standard variants — no breaking changes
- AppShell: derives `use3DTransitions` from `capability + sceneLoaded`, selects `activeVariants`/`activeTransition` accordingly, mounts `LazyCameraTransitionManager` only when 3D scene is live

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CameraTransitionManager and camera state mapping** - `4626702` (feat)
2. **Task 2: Add 3D-aware page transitions and wire into AppShell** - `06184f3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/3d/CameraTransitionManager.tsx` - Renderless route-watcher: ROUTE_CAMERA_MAP for 5 routes, useEffect on pathname, triggers scene3dStore.triggerCameraTransition only when camera state changes
- `src/stores/scene3dStore.ts` - Added currentCameraState state, setCameraState action, triggerCameraTransition action with splineApp camera lookup, transition call, error handling, and state tracking
- `src/components/animation/PageTransition.tsx` - Added pageVariants3D (fade-only initial/animate/exit) and pageTransition3D (0.3s easeInOut); original pageVariants and pageTransition unchanged
- `src/components/layout/AppShell.tsx` - Added sceneLoaded from scene3dStore, derives use3DTransitions, selects activeVariants/activeTransition, mounts LazyCameraTransitionManager when 3D active

## Decisions Made

- CameraTransitionManager is lazy-loaded (React.lazy + Suspense fallback=null) — it compiles to 0.50 kB chunk, keeps code-splitting clean, same pattern as LazySplineHero
- `currentCameraState` deduplication prevents redundant Spline API calls when the component re-renders without a route change
- Content transition at 0.3s (camera at 0.4s) creates layered reveal — spatial context from camera lands first, content fades in while camera still settling, feels cinematic rather than mechanical
- useEffect excludes `currentCameraState` and `triggerCameraTransition` from deps — these are stable store refs; including them could re-trigger transitions on unrelated store updates mid-navigation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

The camera transitions will fire on route change but require the Spline scene to have named camera states matching the ROUTE_CAMERA_MAP values (home-view, discover-view, trending-view, dinner-view, free-view). Until these are configured in the .splinecode scene file, transitions log warnings and fall through gracefully — the app continues to work with content-only fade transitions.

## Next Phase Readiness

- `splineApp` reference in scene3dStore ready for Plan 07-05 theme variable sync via `splineApp.setVariable()`
- `sceneLoaded` and `sceneError` flags available for Plan 07-05 to guard theme operations
- CameraTransitionManager renderless pattern established — reusable for any future route-triggered Spline interactions
- Build passes (TypeScript clean, 29 precached entries, 1029 KiB)

## Self-Check: PASSED

- FOUND: src/components/3d/CameraTransitionManager.tsx
- FOUND: src/stores/scene3dStore.ts (updated with currentCameraState + triggerCameraTransition)
- FOUND: src/components/animation/PageTransition.tsx (updated with pageVariants3D + pageTransition3D)
- FOUND: src/components/layout/AppShell.tsx (updated with use3DTransitions + LazyCameraTransitionManager)
- FOUND: commit 4626702 (Task 1)
- FOUND: commit 06184f3 (Task 2)

---
*Phase: 07-3d-experience*
*Completed: 2026-02-19*
