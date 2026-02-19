# Which Movie To Watch — React Rewrite

## What This Is

A complete visual and architectural rewrite of WhichMovieToWatch — a movie discovery PWA that helps users find their next movie across streaming platforms. Rebuilding the existing vanilla JS app in React with a stunning modern UI featuring claymorphism, bento grids, Framer Motion animations, and full Three.js 3D experiences. Every existing feature preserved, nothing lost — just dramatically better.

## Core Value

Instantly discover your next movie with a visually immersive experience that makes browsing feel as cinematic as watching. One tap and you know what to watch, where to watch it, and why you'll love it.

## Requirements

### Validated

<!-- Existing capabilities confirmed working in current codebase -->

- ✓ Random movie discovery with smart filtering (genre, provider, popularity) — existing
- ✓ Triple ratings display: TMDB, IMDb, Rotten Tomatoes — existing
- ✓ Streaming availability with provider logos (60+ services: stream/rent/buy) — existing
- ✓ "Find Movie" cross-region availability search — existing
- ✓ Dinner Time Mode: family-friendly movie finder for Netflix/Prime/Disney+ — existing
- ✓ Free Movies: 1,000+ legally free YouTube movies with TMDB metadata — existing
- ✓ Basic search with debounced input and voice search (Web Speech API) — existing
- ✓ Advanced search: multi-criteria filters (genre, year, rating, runtime, language, provider, sort) — existing
- ✓ Quick filter presets (90s classics, trending, short films, etc.) — existing
- ✓ User interactions: Love (fetches similar), Watched, Not Interested — existing
- ✓ Genre preference learning from Love interactions — existing
- ✓ Preference system: provider + genre selection with first-visit modal — existing
- ✓ Trending: "Now Playing" in theaters with region detection, 30-min auto-refresh — existing
- ✓ Deep linking via `?movie=ID` URL parameters — existing
- ✓ Movie history tracking (prevents repeats, last 1,000 movies) — existing
- ✓ YouTube trailer links — existing
- ✓ Instagram story card generator (canvas-based social sharing) — existing
- ✓ Dynamic Open Graph / Twitter Card meta tags — existing
- ✓ Dark/light mode toggle with system preference detection — existing
- ✓ PWA: service worker, offline support, install prompts, update notifications — existing
- ✓ Responsive layout (mobile/tablet/desktop) — existing
- ✓ Accessibility: ARIA labels, keyboard navigation, screen reader support — existing
- ✓ IP geolocation for regional content filtering — existing
- ✓ Toast notification system — existing
- ✓ Privacy policy page — existing
- ✓ Simple Analytics integration — existing

### Active

<!-- New capabilities for the React rewrite -->

- [ ] Complete React rewrite with Vite + TypeScript
- [ ] Claymorphism design system with soft 3D depth, rounded elements, double shadows
- [ ] Bento grid layouts for feature showcases and movie discovery
- [ ] Framer Motion animations: page transitions, scroll-triggered reveals, micro-interactions
- [ ] Full Three.js 3D experience: interactive 3D movie poster scenes, hero section, transitions
- [ ] Animated bento grid hero section with trending movies, ratings, and providers
- [ ] Dynamic theme system: light/dark mode with smooth animated transitions
- [ ] 2-3 curated color scheme presets (e.g., Cinema Gold, Ocean Blue, Neon Purple), each with light+dark variants
- [ ] Theme switching with stunning transition animations
- [ ] Claymorphism that adapts automatically to light and dark modes
- [ ] Responsive claymorphism + 3D across desktop, tablet, and mobile
- [ ] Industry-standard security (CSP headers, input sanitization, secure API handling)
- [ ] Modern component architecture with proper state management
- [ ] Performance-optimized 3D with graceful degradation on low-end devices
- [ ] `prefers-reduced-motion` respected throughout all animations
- [ ] Skeleton loading states with clay-styled placeholders

### Out of Scope

- Backend/server — remains fully client-side
- User authentication/accounts — stays anonymous
- Database — localStorage persistence continues
- Mobile native app — PWA only
- Paid features or monetization

## Context

**Current state:** Fully functional vanilla JS PWA (~18,000 lines) with 20+ script modules, 8 CSS files, zero npm dependencies. Deployed to GitHub Pages via GitHub Actions with API key injection.

**APIs preserved:**
- TMDB (`api.themoviedb.org/3`) — movie metadata, posters, streaming availability
- OMDB (`omdbapi.com`) — IMDb and Rotten Tomatoes ratings
- IPInfo.io — geolocation for regional content

**Design research findings:**
- Claymorphism: soft 3D with inner+outer shadows, rounded corners (16-24px), thick borders (3-4px), adapts to both light and dark backgrounds
- Bento grids: modular card layouts inspired by Apple/Notion/Framer, variable column/row spans, hover scale effects, staggered reveal animations
- Framer Motion (Motion for React): scroll-linked animations via `useScroll`/`whileInView`, layout animations, page transitions, physics-based spring animations
- React Three Fiber: declarative 3D in React, Motion for R3F integration, Theatre.js for cinematic transitions
- 2025-2026 trends: dark glassmorphism evolving to "liquid glass" (Apple WWDC 2025), micro-animations for every interaction, parallax storytelling, AI-adaptive layouts

**Design system (from ui-ux-pro-max):**
- Style: Vibrant & block-based with cinematic depth
- Typography: Righteous (headings) / Poppins (body) — entertainment/energetic mood
- Key effects: Large section gaps (48px+), animated patterns, bold hover (color shift), scroll-snap, 200-300ms transitions
- Anti-patterns to avoid: flat design without depth, text-heavy pages, emojis as icons

**Codebase map:** `.planning/codebase/` — 7 documents covering stack, architecture, structure, conventions, testing, integrations, concerns

## Constraints

- **Deployment:** GitHub Pages (static export) — API keys injected via GitHub Secrets in CI
- **APIs:** TMDB and OMDB rate limits — must cache aggressively
- **3D Performance:** Three.js must gracefully degrade on mobile/low-end — detect capability and reduce complexity
- **Feature parity:** Every single feature from the current site must exist in the rewrite
- **No backend:** Fully client-side, localStorage for persistence
- **Accessibility:** WCAG 2.1 AA compliance, `prefers-reduced-motion` support for all animations
- **Bundle size:** Keep reasonable despite Three.js — code split, lazy load 3D scenes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + TypeScript | Modern DX, fast builds, type safety, static export for GitHub Pages | — Pending |
| Tailwind CSS for styling | Utility-first pairs well with claymorphism custom properties, responsive design | — Pending |
| Framer Motion (Motion for React) | Industry standard for React animations, scroll-linked, layout animations | — Pending |
| React Three Fiber for 3D | Declarative Three.js in React, integrates with Framer Motion | — Pending |
| Claymorphism design language | Soft 3D depth, playful yet cinematic, works in light+dark modes | — Pending |
| Bento grid layouts | Modern Apple-inspired showcase pattern, high info density without clutter | — Pending |
| 2-3 curated theme presets | Focused curation over infinite customization, each with light+dark variants | — Pending |
| GitHub Pages deployment | Keep existing infrastructure, API key injection via sed in CI | — Pending |

---
*Last updated: 2026-02-15 after initialization*
