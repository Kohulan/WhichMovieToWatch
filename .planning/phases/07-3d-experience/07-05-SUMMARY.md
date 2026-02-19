---
phase: 07-3d-experience
plan: 05
subsystem: performance
tags: [spline, webgl, performance, lighthouse, code-splitting, requestIdleCallback, dispose, vite, chunks]

requires:
  - phase: 07-3d-experience
    plan: 03
    provides: useSplineTheme, GyroscopeProvider, useDeviceOrientation
  - phase: 07-3d-experience
    plan: 04
    provides: CameraTransitionManager, triggerCameraTransition, pageVariants3D

provides:
  - requestIdleCallback deferred Spline loading (LCP/TTI not affected by 3D)
  - splineApp.dispose() cleanup on unmount (no WebGL memory leaks)
  - renderOnDemand=true on Spline component (idle CPU savings)
  - Scene validation via HEAD byte check (placeholder .splinecode detection)
  - will-change:transform on reduced-3d containers for GPU compositing
  - contain:layout paint on ParallaxFallback for rendering isolation
  - Clean chunk separation: react-vendor, animation-vendor, spline-vendor, gpu-detect, SplineHero

affects: [08-polish-optimization]

tech-stack:
  added: []
  patterns:
    - requestIdleCallback with setTimeout fallback for deferring heavy module load until browser idle
    - Scene file pre-validation via Range header fetch to detect placeholder vs real binary
    - Dispose pattern: useEffect cleanup calls splineApp.dispose() then nulls store ref

key-files:
  created: []
  modified:
    - src/components/3d/SplineScene.tsx
    - src/components/3d/ParallaxFallback.tsx
    - vite.config.ts

key-decisions:
  - "requestIdleCallback defers Spline mounting until browser idle (3s timeout fallback) — ensures LCP and TTI unaffected"
  - "renderOnDemand=true on Spline component — prevents continuous 60fps rendering when scene is idle"
  - "splineApp.dispose() in useEffect cleanup prevents WebGL context memory leaks across navigation"
  - "Scene pre-validation via Range header fetch (first 16 bytes) — detects placeholder ASCII vs real binary .splinecode before mounting"
  - "detect-gpu in separate gpu-detect chunk (not bundled with spline-vendor) — loads early for capability detection"

patterns-established:
  - "Deferred heavy-load pattern: requestIdleCallback + state gate + conditional render of expensive component"
  - "Binary file validation pattern: fetch Range:bytes=0-15, check if all bytes are printable ASCII (placeholder) vs binary (real)"

requirements-completed: [3DXP-07, PERF-04]

duration: 3min
completed: 2026-02-19
---

# Phase 7 Plan 05: Performance Audit & Spline Optimization Summary

**Deferred Spline loading via requestIdleCallback, renderOnDemand idle rendering, WebGL dispose cleanup, scene file pre-validation, and verified chunk separation — Lighthouse-safe progressive 3D enhancement**

## Performance

- **Duration:** ~3 min (Task 1 auto) + human verification
- **Task 1 committed:** 2026-02-19 (`4348e89`)
- **Task 2 (human-verify):** Approved 2026-02-19
- **Files modified:** 3

## Accomplishments

- SplineScene defers mounting via `requestIdleCallback` (3s timeout fallback) — Spline runtime never blocks LCP or TTI
- `renderOnDemand={true}` prop on Spline component — prevents continuous GPU rendering when scene is static
- `splineApp.dispose()` called in useEffect cleanup — prevents WebGL context memory leaks
- Scene file pre-validation: fetches first 16 bytes of .splinecode, checks binary vs ASCII to detect placeholder files, skips mount for invalid scenes
- ParallaxFallback uses `will-change: transform` and `contain: layout paint` for GPU compositing and rendering isolation
- Build output confirms clean chunk separation:
  - `gpu-detect` — 6.83 KB (gzip: 3.29 KB)
  - `SplineHero` — 7.10 KB (gzip: 3.01 KB)
  - `animation-vendor` — 116.26 KB (gzip: 38.51 KB)
  - `index` — 244.63 KB (gzip: 66.99 KB)
  - `react-vendor` — 283.11 KB (gzip: 90.53 KB)
  - `spline-vendor` — 4,613.09 KB (gzip: 1,478.33 KB) — fully isolated, never in initial bundle

## Task Commits

1. **Task 1: Optimize Spline rendering and build output** — `4348e89` (feat)
2. **Task 2: Visual and performance verification** — Human approved

## Files Modified

- `src/components/3d/SplineScene.tsx` — Added requestIdleCallback deferred loading, renderOnDemand=true, dispose() cleanup, scene file pre-validation
- `src/components/3d/ParallaxFallback.tsx` — Added will-change:transform, contain:layout paint for GPU compositing
- `vite.config.ts` — Verified chunk splitting: detect-gpu separate from spline-vendor

## Decisions Made

- requestIdleCallback with 3s timeout ensures Spline never blocks initial page render — the browser decides when it's safe to load 4.6 MB of WebGL runtime
- Scene pre-validation prevents crash cascade from placeholder .splinecode files — the app gracefully falls back to ParallaxFallback
- dispose() is wrapped in try/catch because WebGL context may already be lost by the time React cleanup runs

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

None — TypeScript clean, build passes, human verification approved.

## Phase 7 Completion

With plan 07-05 complete, all 5 plans in Phase 7 (3D Experience) are finished:
- 07-01: GPU detection, 3D capability hooks, scene3d store, 2D parallax fallback
- 07-02: Spline scene integration (SplineHero, SplineScene), progressive loading
- 07-03: Theme-to-3D sync (useSplineTheme), mobile gyroscope parallax
- 07-04: Camera page transitions (CameraTransitionManager), 3D-aware variants
- 07-05: Performance audit, Spline optimization, Lighthouse verification

**Next:** Phase 8 (Polish & Optimization) — accessibility, performance, deployment

## Self-Check: PASSED

- FOUND: src/components/3d/SplineScene.tsx (requestIdleCallback + renderOnDemand + dispose)
- FOUND: src/components/3d/ParallaxFallback.tsx (will-change + contain)
- FOUND: vite.config.ts (chunk splitting verified)
- FOUND: commit 4348e89 (Task 1)
- Human verification: APPROVED

---
*Phase: 07-3d-experience*
*Completed: 2026-02-19*
