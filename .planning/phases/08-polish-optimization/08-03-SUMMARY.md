---
phase: 08-polish-optimization
plan: 03
subsystem: ui
tags: [react, canvas, web-share-api, social-sharing, open-graph, twitter-card, instagram-story]

# Dependency graph
requires:
  - phase: 03-core-features
    provides: Discovery page and routing
  - phase: 01-foundation-design-system
    provides: themeStore with ColorPreset and mode, claymorphism design tokens

provides:
  - Canvas-based 1080x1920 Instagram story card generator with theme-aware gradients
  - Floating share FAB on Discovery page (bottom-right, z-30)
  - Desktop share menu with copy link, story card download, Twitter/X, WhatsApp
  - Native Web Share API on mobile with custom menu fallback
  - Dynamic OG and Twitter Card meta tags via React 19 hoisting
  - useShare hook for Web Share API detection and clipboard operations

affects: [future marketing, social sharing, SEO notes, phase 09 if any]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - corsproxy.io for TMDB image CORS bypass in canvas context
    - React 19 native <title>/<meta> hoisting without react-helmet
    - Floating FAB with AnimatePresence and portal-like fixed positioning
    - StoryCardMovie interface decoupled from TMDBMovieDetails for portability

key-files:
  created:
    - src/components/share/StoryCardGenerator.ts
    - src/components/share/ShareButton.tsx
    - src/components/share/ShareMenu.tsx
    - src/components/share/MovieMetaTags.tsx
    - src/hooks/useShare.ts
  modified:
    - src/components/discovery/DiscoveryPage.tsx

key-decisions:
  - "CORS proxy via corsproxy.io for TMDB poster fetch in canvas (canvas cannot use TMDB direct due to CORS)"
  - "React 19 native metadata hoisting (no react-helmet) — client-side only, accepted SPA limitation for OG/Twitter tags"
  - "StoryCardMovie interface separate from TMDBMovieDetails — share module decoupled from TMDB types"
  - "Share button fixed bottom-24 right-4 — above TabBar (bottom-16) without overlap"
  - "AbortError from navigator.share silently handled — user cancel is expected behavior, not an error"
  - "ShareMenu uses AnimatePresence slide-up from bottom — matches mobile sheet UX pattern"

patterns-established:
  - "Canvas story card: draw gradient bg, add star overlay, load proxy image, clip poster, draw text sections"
  - "Floating FAB: fixed position, z-30, AnimatePresence for attached menu"
  - "Native share with custom menu fallback: canNativeShare check, try native, fallback on failure"

requirements-completed: [SOCL-01, SOCL-02, SOCL-03, SOCL-04]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 08 Plan 03: Social Sharing Summary

**Canvas-based Instagram story card generator (1080x1920) with theme-aware gradients, floating share FAB with Web Share API + desktop menu fallback, and React 19 native OG/Twitter Card meta tag hoisting**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T18:58:30Z
- **Completed:** 2026-02-19T19:01:36Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Story card generator using canvas API with CORS proxy for TMDB posters, theme-aware gradient backgrounds per preset (warm-orange, gold, clean-white) in dark/light modes
- Floating share FAB renders on Discovery page only when a movie is loaded; native Web Share API on mobile, custom 4-option menu on desktop
- Dynamic OG and Twitter Card meta tags update per movie via React 19 native `<title>` and `<meta>` hoisting — no react-helmet dependency

## Task Commits

Each task was committed atomically:

1. **Task 1: Create story card generator and share hooks** - `aab8ff8` (feat)
2. **Task 2: Create share UI and integrate into Discovery page** - `3e928ac` (feat)

**Plan metadata:** (docs commit following)

## Files Created/Modified
- `src/components/share/StoryCardGenerator.ts` - Canvas 1080x1920 PNG generator with CORS proxy, theme gradients, poster/info/branding layout
- `src/hooks/useShare.ts` - Web Share API detection, share() with AbortError handling, copyToClipboard()
- `src/components/share/MovieMetaTags.tsx` - React 19 native OG and Twitter Card meta tag hoisting
- `src/components/share/ShareMenu.tsx` - Desktop fallback menu (copy link, Instagram story, Twitter/X, WhatsApp) with slide-up animation
- `src/components/share/ShareButton.tsx` - Floating FAB with native share on mobile, ShareMenu on desktop
- `src/components/discovery/DiscoveryPage.tsx` - Added ShareButton and MovieMetaTags imports and rendering when currentMovie loaded

## Decisions Made
- CORS proxy via corsproxy.io required for TMDB image fetch in canvas context (TMDB direct URLs blocked by CORS in canvas taint model)
- React 19 native `<title>`/`<meta>` hoisting used directly — no react-helmet. OG/Twitter tags are client-side only (accepted SPA limitation per research)
- StoryCardMovie interface defined separately from TMDBMovieDetails to keep share module independent of TMDB service types
- Share button fixed at bottom-24 right-4 to sit above the TabBar (bottom-16) without obscuring content
- AbortError from navigator.share silently swallowed — user dismissing native share sheet is expected behavior

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- DiscoveryPage.tsx had been modified by a prior plan (08-02) with additional srcSet imports — read the updated file before editing to avoid merge conflict. Handled cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Social sharing infrastructure complete (SOCL-01 through SOCL-04)
- ShareButton only visible on Discovery page, other pages unaffected
- corsproxy.io is a free public proxy — if it goes down, poster fails gracefully with gradient placeholder
- OG meta tags are client-side only; server-side rendering or a meta proxy would be needed for full social crawler support (documented limitation)

## Self-Check: PASSED

- FOUND: src/components/share/StoryCardGenerator.ts
- FOUND: src/components/share/ShareButton.tsx
- FOUND: src/components/share/ShareMenu.tsx
- FOUND: src/components/share/MovieMetaTags.tsx
- FOUND: src/hooks/useShare.ts
- FOUND commit: aab8ff8 (Task 1)
- FOUND commit: 3e928ac (Task 2)

---
*Phase: 08-polish-optimization*
*Completed: 2026-02-19*
