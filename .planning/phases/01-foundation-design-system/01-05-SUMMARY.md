---
phase: 01-foundation-design-system
plan: 05
subsystem: ui
tags: [rotary-dial, theme-toggle, navbar, app-shell, clay-reshape, web-audio, skeuomorphic, barrel-export]

# Dependency graph
requires:
  - phase: 01-03
    provides: "5 clay surface components (ClayCard, ClayModal, ClayInput, ClayBadge, ClaySkeletonCard)"
  - phase: 01-04
    provides: "5 metal hardware components (MetalButton, MetalToggle, MetalSlider, MetalCheckbox, MetalDropdown) and metal.css"
provides:
  - "RotaryDial: skeuomorphic rotary knob cycling 3 color presets with spring animation and tick sound"
  - "ThemeToggle: dark/light toggle switch with sliding metal knob, sun/moon icons"
  - "Navbar: fixed top bar with ThemeToggle + RotaryDial, clay surface, responsive"
  - "AppShell: root layout with AnimatePresence clay reshape animation on theme change"
  - "useSound: Web Audio API hook for zero-latency dial tick sound"
  - "Barrel export: all 12 UI components from @/components/ui"
affects: [01-06, 02-discovery-engine, 03-feature-parity, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Web Audio API with lazy AudioContext init on first user gesture for browser autoplay compliance"
    - "RotaryDial: 3 positions at 120-degree intervals with spring rotation and playTick sound"
    - "ThemeToggle: metal-knob sliding switch with Sun/Moon Lucide icons inside track"
    - "AppShell clay reshape: AnimatePresence mode=wait keyed on mode+preset, scaleY/scaleX spring"
    - "Navbar: fixed z-50 clay-surface with responsive title (full on desktop, abbrev on mobile)"
    - "Barrel export pattern for all UI components from single index.ts"

key-files:
  created:
    - src/hooks/useSound.ts
    - src/components/ui/RotaryDial.tsx
    - src/components/ui/ThemeToggle.tsx
    - src/components/layout/Navbar.tsx
    - src/components/layout/AppShell.tsx
    - src/components/ui/index.ts
    - public/sounds/dial-tick.mp3
  modified:
    - src/App.tsx

key-decisions:
  - "useSound uses module-level AudioContext with one-shot document listener for browser autoplay compliance"
  - "RotaryDial position markers as absolute-positioned dots using trigonometric placement"
  - "AppShell clay reshape uses AnimatePresence mode=wait with spring stiffness 150, damping 12 for soft clay feel"
  - "Navbar shows abbreviated title (WMTW) on mobile, full title on desktop via responsive classes"
  - "App.tsx imports all components from barrel export, removing individual file imports"

patterns-established:
  - "Layout pattern: AppShell wraps all content, Navbar is rendered inside AppShell"
  - "Theme controls live exclusively in Navbar (not scattered in content)"
  - "Clay reshape animation: key on mode+preset, spring scale transition with quick opacity"
  - "Sound effects via Web Audio API with graceful degradation (silent if audio fails)"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 1 Plan 05: Theme Controls and Layout Summary

**Skeuomorphic RotaryDial with tick sound for 3 color presets, ThemeToggle with sun/moon icons, fixed Navbar, and AppShell with clay reshape animation on theme change plus barrel export for all 12 UI components**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T08:04:16Z
- **Completed:** 2026-02-15T08:07:45Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- RotaryDial component: skeuomorphic metal knob rotating between 3 color presets (Cinema Gold, Ocean Blue, Neon Purple) at 120-degree intervals with spring animation and Web Audio tick sound
- ThemeToggle component: dark/light hardware toggle with sliding metal knob, Sun/Moon Lucide icons inside the track, and spring animation matching premium aesthetic
- useSound hook: Web Audio API with lazy AudioContext initialization on first user gesture, fetches and decodes dial-tick.mp3 for zero-latency playback
- Navbar: fixed top bar (z-50) with clay surface, app title on left (responsive abbreviation), ThemeToggle + RotaryDial side by side on right
- AppShell: root layout wrapper calling useTheme for class application, rendering Navbar, wrapping children in AnimatePresence clay reshape animation keyed on mode+preset
- Barrel export: all 12 UI components (5 clay + 5 metal + 2 theme controls) importable from single `@/components/ui`
- App.tsx cleaned up: wrapped in AppShell, imports from barrel, temporary dev test buttons removed (theme controls now live in Navbar exclusively)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useSound hook and RotaryDial + ThemeToggle components** - `0ce686b` (feat)
2. **Task 2: Build Navbar, AppShell with clay reshape animation, and barrel export** - `88af62f` (feat)

## Files Created/Modified
- `src/hooks/useSound.ts` - Web Audio API hook with lazy init, playTick for dial sound
- `src/components/ui/RotaryDial.tsx` - Skeuomorphic rotary knob cycling 3 presets with spring + tick
- `src/components/ui/ThemeToggle.tsx` - Dark/light toggle with metal knob, sun/moon icons
- `public/sounds/dial-tick.mp3` - Minimal tick sound for rotary dial feedback
- `src/components/layout/Navbar.tsx` - Fixed top bar with theme controls, clay surface
- `src/components/layout/AppShell.tsx` - Root layout with clay reshape AnimatePresence transition
- `src/components/ui/index.ts` - Barrel export for all 12 UI components
- `src/App.tsx` - Wrapped in AppShell, barrel imports, removed temp test controls

## Decisions Made
- **Lazy AudioContext with one-shot listener:** Satisfies browser autoplay policy by initializing Web Audio on first click/touchstart, then removing the listener. Silent degradation if audio fails.
- **Trigonometric position markers:** RotaryDial places 3 indicator dots using cos/sin at 24px radius for accurate angular placement around the knob.
- **Clay reshape spring parameters:** stiffness 150, damping 12, mass 0.8 chosen for soft clay-like feel (softer than metal components' stiffness 300) with quick 0.15s opacity fade.
- **Responsive navbar title:** Full "WhichMovieToWatch" on sm+ screens, abbreviated "WMTW" on mobile to preserve space for theme controls.
- **Barrel export consolidation:** App.tsx now imports all 10 components from `@/components/ui` in a single import statement, eliminating 10 individual file imports.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete theme control experience ready: RotaryDial + ThemeToggle + Navbar + AppShell with clay reshape
- All 12 UI components accessible from barrel export for use in Plan 06 (integration) and beyond
- Layout structure established: AppShell > Navbar + main content area with proper padding
- Clay reshape animation triggers on any theme change (mode or preset), providing visual feedback
- useSound pipeline functional: subsequent UI sounds can reuse the AudioContext and add new buffers
- Temporary component showcase still present in App.tsx body for visual verification; will be replaced by real content in later phases

## Self-Check: PASSED
