---
phase: 07-3d-experience
plan: 01
subsystem: ui
tags: [detect-gpu, spline, three-js, parallax, webgl, zustand, framer-motion, vite, code-splitting]

requires:
  - phase: 05-animation-layer
    provides: MotionProvider, Framer Motion setup, animations.css with film-reel-spin keyframe
  - phase: 06-bento-grid-layouts
    provides: AppShell structure with gradient blobs, HomePage routing

provides:
  - GPU tier detection hook (useGpuTier) with module-level session caching (tier 0-3)
  - 3D capability hook (use3DCapability) classifying devices into full-3d/reduced-3d/fallback-2d
  - Zustand scene3dStore for runtime 3D state (capability, loading, sceneLoaded, splineApp)
  - CSS perspective parallax fallback (ParallaxFallback) with 4 depth layers and mouse tracking
  - Scene3DProvider wrapper that runs detection and writes to scene3dStore
  - Vite spline-vendor manual chunk isolating @splinetool + detect-gpu from initial bundle
  - Route-aware opacity pattern in AppShell (opacity 1 on HomePage, 0.15 on feature pages)

affects:
  - 07-02 (SplineHero integration — reads capability from scene3dStore, mounts into AppShell placeholder)
  - 07-03 (Camera control — uses splineApp ref from scene3dStore)
  - 07-04 (Camera transitions between routes — relies on globally-mounted 3D layer in AppShell)

tech-stack:
  added:
    - detect-gpu 5.0.70 (GPU tier detection)
    - "@splinetool/react-spline 4.1.0" (Spline React component, Plan 07-02)
    - "@splinetool/runtime 1.12.58" (Spline runtime, Plan 07-02)
  patterns:
    - Module-level singleton cache for GPU detection (runs once per session)
    - Vite manualChunks for deferred 3D vendor isolation (spline-vendor chunk)
    - Zustand runtime store (no persist) for GPU-detected session state
    - Route-aware opacity via useLocation pathname check (isHomePage = pathname === '/')
    - Global layer mounting pattern — 3D layer rendered on all routes, opacity controlled per route

key-files:
  created:
    - src/hooks/useGpuTier.ts
    - src/hooks/use3DCapability.ts
    - src/stores/scene3dStore.ts
    - src/components/3d/ParallaxFallback.tsx
    - src/components/3d/Scene3DProvider.tsx
  modified:
    - vite.config.ts (spline-vendor manualChunk added)
    - src/App.tsx (Scene3DProvider wraps post-splash tree)
    - src/components/layout/AppShell.tsx (3D/parallax layer with route-aware opacity)

key-decisions:
  - "useGpuTier uses module-level cache variable (not React state) so detection runs once per session even if multiple components mount the hook simultaneously"
  - "scene3dStore has no persist middleware — GPU capability is re-detected each session because GPU drivers, browser settings, or prefers-reduced-motion can change between sessions"
  - "detect-gpu and @splinetool packages both go into spline-vendor chunk — they are always loaded together and share the same lazy-loading boundary"
  - "3D/parallax layer stays MOUNTED on all routes (not conditionally rendered) to support camera transitions in Plan 07-04 — opacity provides visual control without unmounting"
  - "ParallaxFallback uses inline <style> tag for parallax-dust-drift keyframes to avoid a separate CSS file for component-specific animations"
  - "Scene3DProvider is a thin wrapper (not React context) — scene3dStore IS the context, avoiding React.createContext overhead for a single global state"

patterns-established:
  - "Global background layer pattern: fixed inset-0 div between gradient blobs and content, opacity-controlled per route"
  - "Capability hook composition: raw hardware detection (useGpuTier) + accessibility check + WebGL check = final Capability enum"

requirements-completed: [3DXP-05, 3DXP-07, PERF-01]

duration: 4min
completed: 2026-02-19
---

# Phase 7 Plan 01: 3D Experience Foundation Summary

**GPU tier detection + 3D capability classification + CSS parallax fallback + Vite spline-vendor code-splitting, wired into AppShell as a globally-mounted route-aware background layer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T08:23:51Z
- **Completed:** 2026-02-19T08:27:51Z
- **Tasks:** 3
- **Files modified:** 7 (5 created, 2 updated)

## Accomplishments

- Installed detect-gpu, @splinetool/react-spline, @splinetool/runtime; Vite manualChunks isolates them into `spline-vendor` chunk (6.83 kB, confirmed in build output)
- GPU detection hook with tier 0-3, mobile flag, and module-level session cache; 3D capability hook classifying devices into full-3d/reduced-3d/fallback-2d via GPU + WebGL + prefers-reduced-motion
- Zustand scene3dStore (runtime, no persist) for capability/loading/sceneLoaded/splineApp state
- ParallaxFallback: 4-layer CSS perspective parallax (ambient glow, film reel SVG, spotlight beam, dust particles) with Framer Motion mouse-tracking tilt (desktop only)
- Scene3DProvider runs detection on mount and writes Capability to scene3dStore
- AppShell renders 3D/parallax layer globally with route-aware opacity (1.0 on HomePage, 0.15 on feature pages)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps, GPU hooks, scene3d store, Vite config** - `36157f5` (feat)
2. **Task 2: ParallaxFallback and Scene3DProvider** - `d41f9e3` (feat)
3. **Task 3: Wire Scene3DProvider + AppShell route-aware opacity** - `0bb3fac` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/hooks/useGpuTier.ts` - detect-gpu tier 0-3 with module-level session cache
- `src/hooks/use3DCapability.ts` - Capability enum from GPU tier + WebGL + prefers-reduced-motion
- `src/stores/scene3dStore.ts` - Zustand runtime store for 3D state (no persist)
- `src/components/3d/ParallaxFallback.tsx` - 4-layer CSS perspective parallax with mouse tracking
- `src/components/3d/Scene3DProvider.tsx` - Thin wrapper that runs detection and updates scene3dStore
- `vite.config.ts` - Added spline-vendor manualChunk for @splinetool + detect-gpu
- `src/App.tsx` - Wrapped post-splash tree in Scene3DProvider
- `src/components/layout/AppShell.tsx` - Added globally-mounted 3D/parallax layer with route-aware opacity

## Decisions Made

- Module-level cache in useGpuTier ensures detection runs once per session regardless of component mount count
- No persist on scene3dStore because GPU capability may legitimately change between sessions (driver updates, browser settings, reduced-motion preference)
- detect-gpu bundled with spline-vendor chunk because they share the same lazy-loading boundary
- 3D layer stays mounted on all routes (opacity control, not conditional render) to enable camera transitions in Plan 07-04
- ParallaxFallback uses inline `<style>` tag for component-specific keyframes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - build, TypeScript, and spline-vendor chunk all verified successfully.

## Next Phase Readiness

- scene3dStore capability state ready for Plan 07-02 to check and render SplineHero
- AppShell placeholder comment `{/* Plan 07-02: capability === 'full-3d' || capability === 'reduced-3d' -> <SplineHero /> */}` marks exact integration point
- splineApp ref slot in scene3dStore ready for Plan 07-03 camera control
- Global 3D layer mount pattern established for Plan 07-04 camera transitions

---
*Phase: 07-3d-experience*
*Completed: 2026-02-19*
