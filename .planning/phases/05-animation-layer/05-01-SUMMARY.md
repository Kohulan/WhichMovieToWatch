---
phase: 05-animation-layer
plan: 01
subsystem: ui
tags: [framer-motion, animation, reduced-motion, css-keyframes, splash-screen, loading-states]

# Dependency graph
requires:
  - phase: 04-pwa-infrastructure
    provides: App.tsx entry point and component tree to wrap with MotionProvider
  - phase: 01-foundation-design-system
    provides: CSS custom properties (--accent, --clay-*) used in animations and splash
provides:
  - MotionProvider global wrapper with reducedMotion="user" for ANIM-05/A11Y-05 compliance
  - animations.css with glow pulse, film-reel spinner, material enhancement classes, reduced-motion overrides
  - Netflix-style SplashScreen with dark background, ambient light bloom, specular glow, cinematic progress bar
  - LoadingQuotes component with rotating movie quotes and film-reel spinner for in-app loading states
affects: [05-02, 05-03, 05-04, 05-05, all-animation-plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - MotionProvider wraps entire App.tsx tree — all subsequent motion components inherit reducedMotion="user"
    - animations.css for CSS-only keyframes (glow pulse, film-reel spin); MotionProvider for JS animations
    - LoadingQuotes replaces ClaySkeletonCard for full-page and modal loading states
    - film-reel-spin CSS class drives icon rotation; AnimatePresence manages quote fade in/out

key-files:
  created:
    - src/components/animation/MotionProvider.tsx
    - src/components/animation/LoadingQuotes.tsx
    - src/styles/animations.css
  modified:
    - src/App.tsx
    - src/styles/app.css
    - src/components/SplashScreen.tsx
    - src/components/discovery/DiscoveryPage.tsx
    - src/components/search/SearchResults.tsx
    - src/components/trending/TrendingPage.tsx

key-decisions:
  - "MotionProvider uses reducedMotion='user' — disables transforms/layout, preserves opacity/color for graceful degradation"
  - "CSS @media prefers-reduced-motion block also kills all CSS keyframe animations (animations.css) as MotionConfig cannot reach CSS"
  - "SplashScreen always on bg-black regardless of app theme — like Netflix's N animation, always cinematic dark"
  - "LoadingQuotes integrated into SearchResults.tsx (not SearchModal.tsx) as SearchResults owns the loading display"
  - "film-reel-spin uses CSS animation (not Framer Motion) — simpler for infinite loops, more performant on JS thread"

patterns-established:
  - "Pattern 1: animation/MotionProvider.tsx — global motion config wrapper, import and wrap in App.tsx"
  - "Pattern 2: animations.css @keyframes — CSS-only infinite loops, never Framer Motion for infinite animations"
  - "Pattern 3: LoadingQuotes size='sm' for compact contexts (search), size='md' (default) for full-page loading"
  - "Pattern 4: accent-glow-active CSS class applies the glow pulse animation to any element"

requirements-completed: [ANIM-05, ANIM-06, A11Y-05]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Phase 05 Plan 01: Animation Infrastructure Summary

**MotionProvider global reduced-motion wrapper, animations.css with CSS keyframes, Netflix-style splash screen redesign, and LoadingQuotes movie-themed loading component with film-reel spinner**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-18T21:11:16Z
- **Completed:** 2026-02-18T21:15:11Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- MotionProvider wraps the entire App.tsx tree with MotionConfig reducedMotion="user" — all Framer Motion transform/layout animations globally respect prefers-reduced-motion
- animations.css provides CSS @keyframes (accent-glow-pulse, film-reel-spin), material enhancement classes (metal-knob-enhanced, metal-track-deep, ceramic-ripple), and comprehensive prefers-reduced-motion overrides for all CSS-driven animations
- SplashScreen redesigned from clay-themed to Netflix-style: bg-black always, ambient radial light bloom, specular glow behind Film icon, bold white text with 12px blur-in stagger, thin cinematic progress bar, dramatic scale+blur exit
- LoadingQuotes component cycles 12 classic movie quotes with film-reel spinner, integrated into DiscoveryPage, SearchResults (inside SearchModal), and TrendingPage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MotionProvider, animations.css, and wire into App** - `e1ce90b` (feat)
2. **Task 2: Netflix-style splash screen redesign** - `eea3cf7` (feat)
3. **Task 3: Create LoadingQuotes component and integrate into loading states** - `1bb1a74` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified

- `src/components/animation/MotionProvider.tsx` - Global MotionConfig wrapper with reducedMotion="user"
- `src/styles/animations.css` - CSS keyframes: accent-glow-pulse, film-reel-spin, material classes, reduced-motion overrides
- `src/styles/app.css` - Added @import './animations.css' after metal.css
- `src/App.tsx` - Wrapped root JSX in MotionProvider
- `src/components/SplashScreen.tsx` - Netflix-style redesign: dark bg, ambient bloom, specular glow, white bold text, cinematic bar
- `src/components/animation/LoadingQuotes.tsx` - 12 classic quotes, film-reel spinner, 4s rotation interval, size prop
- `src/components/discovery/DiscoveryPage.tsx` - Loading state replaced with LoadingQuotes
- `src/components/search/SearchResults.tsx` - Initial skeleton grid replaced with LoadingQuotes size="sm"
- `src/components/trending/TrendingPage.tsx` - Loading skeleton row replaced with LoadingQuotes

## Decisions Made

- `MotionProvider` uses `reducedMotion="user"` — when OS reduced-motion is enabled, all transform/layout animations are disabled but opacity/color remain, providing graceful degradation rather than total animation removal
- CSS `@media (prefers-reduced-motion: reduce)` block in animations.css kills all CSS keyframe animations (MotionConfig cannot reach CSS keyframes)
- `SplashScreen` always renders on `bg-black` regardless of the current app theme — cinematic dark background is the brand moment, always consistent
- `LoadingQuotes` integrated into `SearchResults.tsx` rather than `SearchModal.tsx` because `SearchResults` owns the loading display — it renders the skeleton/loading state from its `isLoading && results.length === 0` check
- `film-reel-spin` uses CSS `@keyframes` animation class (not Framer Motion) — CSS infinite loops are more performant and don't occupy the JS animation thread

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- MotionProvider is the foundation all subsequent animation plans depend on — Plans 05-02 through 05-05 can now use Framer Motion with guaranteed reduced-motion compliance
- animations.css classes (accent-glow-active, film-reel-spin, metal-knob-enhanced, metal-track-deep, ceramic-ripple) ready for use in Plans 05-03 and 05-04
- SplashScreen brand moment established — subsequent plans should not re-visit splash screen
- LoadingQuotes available for any future loading state that needs movie-themed content

## Self-Check: PASSED

All created files confirmed present on disk. All task commits confirmed in git log.

- FOUND: src/components/animation/MotionProvider.tsx
- FOUND: src/styles/animations.css
- FOUND: src/components/animation/LoadingQuotes.tsx
- FOUND: .planning/phases/05-animation-layer/05-01-SUMMARY.md
- FOUND: e1ce90b (Task 1 commit)
- FOUND: eea3cf7 (Task 2 commit)
- FOUND: 1bb1a74 (Task 3 commit)

---
*Phase: 05-animation-layer*
*Completed: 2026-02-18*
