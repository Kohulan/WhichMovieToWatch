---
phase: 07-3d-experience
plan: 03
subsystem: ui
tags: [spline, zustand, gyroscope, device-orientation, framer-motion, ios-permission, mobile, theme-sync]

requires:
  - phase: 07-3d-experience
    plan: 02
    provides: SplineScene component, splineApp stored in scene3dStore (Application | null), sceneError state

provides:
  - useSplineTheme hook: subscribes to themeStore and pushes 4 variables to Spline scene on every preset/mode change
  - useDeviceOrientation hook: device orientation API with iOS 13+ permission handling and normalized parallax values
  - GyroscopeProvider component: tasteful clay-styled permission prompt UI (mobile-only, auto-dismiss after 8s)
  - SplineScene updated: gyroscope parallax via motion.div perspective transform (spring stiffness 50, damping 20)
  - GyroscopeProvider nested inside SplineScene — only visible on full-3d/reduced-3d devices

affects:
  - 07-04 (camera transitions continue to use splineApp from scene3dStore)

tech-stack:
  added: []
  patterns:
    - useSplineTheme side-effect hook pattern: no return value, pure Zustand subscription + imperative setVariable calls
    - iOS DeviceOrientationEvent.requestPermission() guard pattern with TypeScript cast
    - Spring-smoothed gyroscope parallax: useMotionValue -> useSpring -> useTransform -> motion.div rotateX/rotateY
    - localStorage caching for gyroscope grant/dismiss state across sessions
    - Try/catch per setVariable call — graceful degradation when Spline scene doesn't define expected variables

key-files:
  created:
    - src/hooks/useSplineTheme.ts
    - src/hooks/useDeviceOrientation.ts
    - src/components/3d/GyroscopeProvider.tsx
  modified:
    - src/components/3d/SplineScene.tsx

key-decisions:
  - "useSplineTheme wraps each splineApp.setVariable in try/catch — variables may not exist in placeholder .splinecode scene without crashing"
  - "useDeviceOrientation does NOT auto-call requestPermission on iOS mount — iOS requires user gesture, auto-call outside gesture context throws and denies"
  - "GyroscopeProvider nested inside SplineScene ensures fallback-2d devices (who never mount SplineScene) never see the gyroscope prompt"
  - "CSS perspective transform approach for gyroscope parallax — simpler than splineApp.emitEvent, works regardless of Spline scene design"
  - "spring stiffness:50 damping:20 matches ParallaxFallback pattern for visual consistency between 2D fallback and 3D gyroscope modes"
  - "GyroscopeProvider rendered as sibling outside aria-hidden div so screen readers can discover and interact with the permission prompt"
  - "rawRotateX.set() / rawRotateY.set() called during render (not in useEffect) for immediate responsiveness — motion values are imperative, safe to set outside effects"

patterns-established:
  - "Gyroscope parallax pattern: useDeviceOrientation -> betaNorm/gammaNorm -> useMotionValue.set() -> useSpring -> useTransform -> motion.div rotateX/rotateY"
  - "iOS permission gating pattern: check requestPermission exists -> show prompt state -> call from user gesture button -> start listener on grant"

requirements-completed: [3DXP-02, 3DXP-05]

duration: 4min
completed: 2026-02-19
---

# Phase 7 Plan 03: Theme-to-3D Sync and Gyroscope Parallax Summary

**useSplineTheme syncs all 6 theme variants (3 presets x 2 modes) to Spline lighting variables; useDeviceOrientation handles iOS permission flow; GyroscopeProvider shows tasteful one-time prompt on mobile 3D-capable devices; SplineScene applies spring-smoothed perspective transform from device tilt**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19T08:38:21Z
- **Completed:** 2026-02-19T08:42:21Z
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 updated)

## Accomplishments

- `useSplineTheme`: Subscribes to themeStore (preset, mode) and scene3dStore (splineApp). On any change, pushes `lightingHue`, `lightingSaturation`, `lightingIntensity`, `isDarkMode` to the Spline scene. Each `setVariable` wrapped in try/catch with console.warn for missing variables — allows the hook to work with placeholder .splinecode file without crashing.
- `useDeviceOrientation`: Detects iOS 13+ `requestPermission` presence. Auto-grants on Android/desktop, sets `'prompt'` state on iOS. Exposes `requestPermission()` async function for button-triggered permission dialog. Normalizes beta/gamma to `betaNorm`/`gammaNorm` (-1..1) for CSS parallax. Caches grant state to `wmtw-gyro-granted` localStorage key.
- `GyroscopeProvider`: Clay-styled floating card in bottom-right corner (above TabBar). Shows only on touch mobile devices with `permissionState === 'prompt'`. Auto-dismisses after 8 seconds. Manual dismiss cached to `wmtw-gyro-dismissed`. Smartphone icon from lucide-react. Entry animation via CSS `@keyframes`. Rendered outside `aria-hidden` div for accessibility.
- `SplineScene` updated: imports `useDeviceOrientation` and `GyroscopeProvider`. On mobile with granted permission, `rawRotateX.set(betaNorm)` / `rawRotateY.set(gammaNorm)` update motion values during render. `useSpring(stiffness:50, damping:20)` smooths them. `useTransform` maps to ±3deg tilt. `motion.div` wraps the Spline canvas with `perspective:1000px` + `rotateX/rotateY` for gyroscope parallax depth.

## Task Commits

Each task committed atomically:

1. **Task 1: Create useSplineTheme hook and integrate into SplineScene** - `2fdfb64` (feat)
2. **Task 2: Create useDeviceOrientation hook and GyroscopeProvider permission UI** - `8401db7` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/hooks/useSplineTheme.ts` — Side-effect hook; PRESET_LIGHTING and MODE_LIGHTING lookup tables; useEffect watching [preset, mode, splineApp]; 4 setVariable calls per change; try/catch per call
- `src/hooks/useDeviceOrientation.ts` — OrientationData and PermissionState types; iOS requestPermission detection; startListening() closure for event listener lifecycle; betaNorm/gammaNorm normalization; localStorage caching
- `src/components/3d/GyroscopeProvider.tsx` — Clay-styled floating permission prompt; 8s auto-dismiss timer via useRef; localStorage dismissed caching; Smartphone icon from lucide-react; slide-in CSS @keyframes
- `src/components/3d/SplineScene.tsx` — Added useDeviceOrientation, useSpring/useTransform/useMotionValue from motion/react, GyroscopeProvider; motion.div wrapper for gyroscope perspective parallax; GyroscopeProvider sibling outside aria-hidden container

## Decisions Made

- `useSplineTheme` wraps each `splineApp.setVariable` in try/catch — the placeholder `.splinecode` scene doesn't define `lightingHue`, `lightingSaturation` etc. yet; non-fatal warnings allow development to proceed without a production Spline scene
- iOS `requestPermission` is NOT auto-called on mount — calling it outside a user gesture throws and auto-denies; the hook correctly sets state to `'prompt'` and waits for a button click
- `GyroscopeProvider` nested inside `SplineScene` — this guarantees fallback-2d devices never see the gyroscope prompt since they never mount SplineScene (the 3D capability check lives in AppShell)
- CSS perspective transform approach over `splineApp.emitEvent('mouseMove', ...)` — simpler, doesn't depend on the Spline scene's built-in mouse interaction setup, works with placeholder scene
- Spring parameters `stiffness:50, damping:20` match `ParallaxFallback.tsx` exactly — ensures visual consistency between the CSS parallax fallback (shown on low-end devices) and the gyroscope parallax on capable mobile devices
- `GyroscopeProvider` placed as a sibling `<>...</>` fragment outside the `aria-hidden` div — the Spline canvas is decorative, but the permission prompt is interactive and must be accessible to screen readers and keyboard navigation

## Deviations from Plan

None — plan executed exactly as written. The `motion.div` wrapper approach for gyroscope parallax was the plan's recommended simpler CSS transform path and was implemented as specified.

## Issues Encountered

None. TypeScript passed without errors on both tasks. Build succeeded with PWA precaching 29 entries.

## Self-Check: PASSED

- FOUND: src/hooks/useSplineTheme.ts
- FOUND: src/hooks/useDeviceOrientation.ts
- FOUND: src/components/3d/GyroscopeProvider.tsx
- FOUND: src/components/3d/SplineScene.tsx (modified)
- FOUND: .planning/phases/07-3d-experience/07-03-SUMMARY.md
- FOUND: commit 2fdfb64 (Task 1)
- FOUND: commit 8401db7 (Task 2)

---
*Phase: 07-3d-experience*
*Completed: 2026-02-19*
