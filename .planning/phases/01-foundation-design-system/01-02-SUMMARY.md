---
phase: 01-foundation-design-system
plan: 02
subsystem: ui
tags: [zustand, themes, oklch, css-custom-properties, localStorage, fouc-prevention, dark-mode]

# Dependency graph
requires:
  - phase: 01-01
    provides: "React 19 + Vite 6 scaffold with Tailwind v4 @theme inline tokens and zustand installed"
provides:
  - "Zustand theme store with persist middleware (useThemeStore)"
  - "useTheme hook with system preference detection and media query listener"
  - "6 CSS variable theme variants (Cinema Gold, Ocean Blue, Neon Purple x light/dark)"
  - "FOUC prevention inline script reading 'theme-preferences' from localStorage"
  - "Temporary theme test buttons in App.tsx for visual verification"
affects: [01-03, 01-04, 01-05, 01-06, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand persist middleware with createJSONStorage for theme state"
    - "Compound CSS selectors: .theme-{preset} for light, .dark.theme-{preset} for dark"
    - "oklch color space for all 6 theme variant blocks"
    - "FOUC prevention via inline script in <head> reading localStorage before React mounts"
    - "useTheme hook applies classList on documentElement for theme switching"
    - "hasManuallyToggled ref to prevent system preference override after user interaction"

key-files:
  created: [src/stores/themeStore.ts, src/hooks/useTheme.ts]
  modified: [src/styles/app.css, index.html, src/App.tsx]

key-decisions:
  - "localStorage key 'theme-preferences' shared between Zustand persist and FOUC inline script"
  - "System preference detection only on first visit (no stored preferences); manual toggle disables auto-follow"
  - "oklch colors chosen for WCAG AA 4.5:1 contrast minimum across all 6 variants"
  - "Temporary test buttons in App.tsx (replaced by RotaryDial in Plan 05)"

patterns-established:
  - "Theme store as single source of truth: useThemeStore drives all theme state"
  - "CSS class-based theming: .dark and .theme-* classes on <html> element"
  - "All color values via CSS custom properties, overridden per-theme block"
  - "FOUC prevention pattern: synchronous inline script reads localStorage before any rendering"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 1 Plan 02: Theme System Summary

**Zustand-persisted theme store with 6 oklch CSS variants (Cinema Gold, Ocean Blue, Neon Purple x light/dark), system preference detection, and FOUC prevention**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T07:50:59Z
- **Completed:** 2026-02-15T07:53:39Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Zustand theme store with persist middleware storing mode and preset under 'theme-preferences' localStorage key
- useTheme hook detecting system color scheme on first visit, applying CSS classes to documentElement, and listening for media query changes
- All 6 CSS variable theme variants with distinct color palettes using oklch color space for perceptual uniformity
- FOUC prevention inline script in index.html preventing theme flash before React hydration
- Temporary theme test buttons in App.tsx enabling visual verification of all 6 variants

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand theme store with localStorage persistence** - `4109b35` (feat)
2. **Task 2: Create useTheme hook, 6 CSS variants, FOUC prevention, App integration** - `42aabfe` (feat)

## Files Created/Modified
- `src/stores/themeStore.ts` - Zustand store with ColorPreset/ThemeMode types, persist middleware, setMode/toggleMode/setPreset actions
- `src/hooks/useTheme.ts` - Theme hook with system preference detection, classList application, media query listener, manual toggle tracking
- `src/styles/app.css` - All 6 theme variant CSS variable blocks (Cinema Gold, Ocean Blue, Neon Purple each in light and dark)
- `index.html` - Inline FOUC prevention script reading 'theme-preferences' from localStorage
- `src/App.tsx` - Wired useTheme hook with temporary toggle dark/light button and preset selection buttons

## Decisions Made
- **localStorage key 'theme-preferences' shared contract:** The Zustand persist middleware and the FOUC prevention inline script both use the exact same key and state structure, creating a reliable contract between server-side rendering prevention and client-side state.
- **Manual toggle disables system preference auto-follow:** A `hasManuallyToggled` ref prevents the media query listener from overriding user's explicit choice, but still follows system preference on first visit.
- **oklch color space for all variants:** Perceptually uniform colors ensure consistent lightness/chroma relationships across all 6 theme variants.
- **Temporary test buttons replaced in Plan 05:** Dev controls in App.tsx allow immediate visual verification without building the full RotaryDial component.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Theme system complete, all CSS custom properties available for clay components in Plan 03
- useThemeStore available for any component needing theme state
- useTheme hook ready to be called from App.tsx (already wired in)
- Temporary test buttons in App.tsx will be replaced by RotaryDial in Plan 05
- All 6 theme variants define --clay-*, --metal-*, and --accent-* variables for consistent component styling

## Self-Check: PASSED

All 5 files verified present. Commits 4109b35 and 42aabfe verified in git log. Production build succeeds with all 6 theme variant CSS blocks in output.

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-15*
