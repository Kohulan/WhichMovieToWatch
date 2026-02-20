# Phase 3: Core Features - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Achieve 100% feature parity with existing vanilla JS app — all 25+ features rebuilt in React. Includes: random movie discovery, movie detail display, triple ratings, streaming availability, user interactions (love/watched/not interested), preferences onboarding, basic + advanced search, voice search, trending, dinner time mode, free YouTube movies, accessibility basics, and security basics. No animation polish — that's Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Discovery Flow & Navigation
- Single movie focus for main discovery — one movie at a time, immersive, full attention on current recommendation
- Tab bar / bottom nav for mode switching — Discover, Trending, Dinner Time, Free Movies accessible via persistent tabs
- Dinner Time is a dedicated modal/overlay experience — launches its own focused UI, not just a filtered discovery
- Trending shows movies in a horizontal scroll row — poster thumbnails in a scrollable strip, tap to expand
- Free Movies uses one-at-a-time discovery — same single-movie focus as main discover, but drawing from the free YouTube pool
- Deep links (?movie=123) land on discovery screen with that movie pre-loaded — not a separate detail page
- Action buttons (Love, Watched, Not Interested, Next) — match the existing vanilla app placement (below the movie card)

### Movie Card & Detail Presentation
- Cinematic hero style for discovery view — full-bleed backdrop image with title overlay, minimal info at a glance, tap to reveal details
- Colored rating badges — each rating (TMDB, IMDb, Rotten Tomatoes) displayed as a colored badge/chip with source logo, green/yellow/red based on score
- Streaming availability as grouped list — vertical list grouped by Stream/Rent/Buy, provider logo + name + link
- Genre badges as clay-styled pills — claymorphism-styled rounded pills with soft shadows, matching the design system

### Search & Filter Experience
- Search accessed via icon in navbar — tap search icon to expand into search bar overlay or modal
- Advanced filters as expandable section above results — filter controls expand/collapse above the search results grid
- Voice search with animated microphone — pulsing/glowing mic icon with waveform visualization while listening

### First-Visit Onboarding
- Multi-step wizard — Step 1: Pick providers, Step 2: Pick genres, Done. Progress indicator, one thing at a time.
- Provider selection as logo grid with toggle — grid of provider logos, tap to toggle on/off, selected ones get highlighted ring
- Genre selection as clay pill chips — claymorphism-styled pill chips, multi-select, with "Any" option at the top
- Clean claymorphism style for wizard — standard clay modal style, no extra cinematic flair
- Research visually stunning websites for design inspiration across all components

### Claude's Discretion
- Detail view behavior when tapping movies from trending/search — Claude picks best approach for claymorphism design (full page vs modal)
- Search results layout — Claude picks best layout for the design system
- Skip preferences behavior — Claude decides what happens when user skips onboarding

</decisions>

<specifics>
## Specific Ideas

- Discovery should feel immersive — "cinematic hero" with full-bleed backdrop, not a traditional card layout
- User explicitly wants visually stunning design — research beautiful web experiences for inspiration during implementation
- Claymorphism design system from Phase 1 should be showcased through genre pills, rating badges, and onboarding wizard
- The existing vanilla app's action button placement should be preserved for familiarity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-core-features*
*Context gathered: 2026-02-18*
