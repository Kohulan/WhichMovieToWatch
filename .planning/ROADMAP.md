# Roadmap: WhichMovieToWatch React Rewrite

## Overview

Transform a fully functional vanilla JavaScript movie discovery PWA into a modern React 19 application featuring claymorphism design, bento grid layouts, Framer Motion animations, and full Three.js 3D experiences. The roadmap delivers feature parity with the existing 25+ features while progressively enhancing the visual experience from foundation through 3D. Eight phases prioritize data layer validation early, deliver testable features before visual complexity, and treat 3D as an additive enhancement to a working application.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Design System** - Vite + React + TypeScript stack with claymorphism theme system
- [x] **Phase 2: Data Layer** - API services, caching strategy, state management foundation (completed 2026-02-18)
- [ ] **Phase 3: Core Features** - All 25+ features from vanilla JS app with feature parity
- [x] **Phase 4: PWA Infrastructure** - Offline support, service worker, installability (completed 2026-02-18)
- [x] **Phase 5: Animation Layer** - Framer Motion page transitions and micro-interactions (completed 2026-02-18)
- [x] **Phase 6: Bento Grid Layouts** - Animated bento grid hero and feature showcases (completed 2026-02-19)
- [ ] **Phase 7: 3D Experience** - Spline 3D cinematic scenes with graceful degradation
- [ ] **Phase 8: Polish & Optimization** - Accessibility, performance, deployment automation

## Phase Details

### Phase 1: Foundation & Design System
**Goal**: Establish React 19 + Vite 6 + TypeScript 5.7 foundation with claymorphism design system that adapts to light and dark modes.
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, DSGN-09, DSGN-10, DSGN-11, SECU-03, A11Y-06
**Success Criteria** (what must be TRUE):
  1. Developer can run `npm run dev` and see a working React app with hot module replacement under 100ms
  2. User can toggle between light and dark modes with animated transitions, claymorphism automatically adapts
  3. User can switch between 2-3 color scheme presets (Cinema Gold, Ocean Blue, Neon Purple) with smooth animations
  4. All claymorphism components (buttons, cards, modals, inputs) display correctly at 375px, 768px, 1024px, 1440px breakpoints
  5. Application respects system color scheme preference on first visit
**Plans**: 6 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold (Vite + React + TS + Tailwind v4 + routing + fonts + icons)
- [ ] 01-02-PLAN.md — Theme system (Zustand store, 6 CSS variants, system detection, FOUC prevention)
- [ ] 01-03-PLAN.md — Clay component library (ClayCard, ClayModal, ClayInput, ClayBadge, ClaySkeletonCard)
- [ ] 01-04-PLAN.md — Metal/hardware component library (MetalButton, MetalToggle, MetalSlider, MetalCheckbox, MetalDropdown)
- [ ] 01-05-PLAN.md — Theme controls and layout (RotaryDial, ThemeToggle, Navbar, AppShell, clay reshape animation)
- [ ] 01-06-PLAN.md — Responsive showcase page, deploy workflow, visual verification checkpoint

### Phase 2: Data Layer
**Goal**: Build offline-first API service layer with TMDB, OMDB, and IPInfo integrations, Zustand state management, and caching strategy.
**Depends on**: Phase 1
**Requirements**: DISC-05, DISC-06
**Success Criteria** (what must be TRUE):
  1. API client successfully fetches movie data from TMDB with rate limiting protection (max 40 requests per 10 seconds)
  2. OMDB integration enriches TMDB data with IMDb ratings and Rotten Tomatoes scores
  3. IP geolocation detects user region and defaults to DE for content filtering
  4. API responses are cached in IndexedDB, subsequent requests load from cache before network fallback
  5. Zustand store persists user preferences to localStorage and hydrates on page load
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — TypeScript types + idb install + IndexedDB cache layer (TTL, SWR)
- [ ] 02-02-PLAN.md — Zustand stores (preferences, movieHistory, region, discovery, search) + legacy migration
- [ ] 02-03-PLAN.md — Utility modules (genre map, country names, provider registry, taste engine)
- [ ] 02-04-PLAN.md — API services (TMDB client + 5 endpoints, OMDB ratings, IPInfo geolocation)
- [ ] 02-05-PLAN.md — React hooks (discovery, details, ratings, search, trending, providers, region)

### Phase 3: Core Features
**Goal**: Achieve 100% feature parity with existing vanilla JS app — all 25+ features working without animation polish.
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISP-01, DISP-02, DISP-03, DISP-04, DISP-05, DISP-06, DISP-07, INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, PREF-01, PREF-02, PREF-03, PREF-04, PREF-05, SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, ADVS-01, ADVS-02, ADVS-03, ADVS-04, ADVS-05, ADVS-06, ADVS-07, TRND-01, TRND-02, TRND-03, TRND-04, DINR-01, DINR-02, DINR-03, DINR-04, FREE-01, FREE-02, FREE-03, FREE-04, A11Y-02, A11Y-03, A11Y-04, A11Y-07, SECU-02, SECU-04
**Success Criteria** (what must be TRUE):
  1. User can discover random movies with smart filtering (genre, provider, rating >=6.0) and retry with relaxed filters
  2. User can view full movie details with poster, metadata, triple ratings (TMDB, IMDb, Rotten Tomatoes), and streaming availability across 60+ services
  3. User can search movies via text input (300ms debounce) or voice search with visual feedback
  4. User can use advanced search with multi-criteria filters (genre, year, rating, runtime, language, provider, sort) and quick presets
  5. User can access trending "Now Playing" movies, Dinner Time family-friendly finder, and 1,000+ free YouTube movies
  6. User can interact with movies (Love for similar recommendations, Watched to skip forever, Not Interested to avoid similar)
  7. User can set streaming provider and genre preferences on first visit, preferences persist and apply to all discovery
  8. Movie history prevents repeats across last 1,000 movies, deep linking works via ?movie=ID URL parameter
**Plans**: 5 plans

Plans:
- [ ] 03-01-PLAN.md — Movie display components, shared utilities, new hooks (sonner, ExternalLink, RatingBadges, ProviderSection, MovieHero, MovieActions)
- [ ] 03-02-PLAN.md — Discovery page with cinematic hero, user interactions (Love/Watched/Not Interested), onboarding wizard
- [ ] 03-03-PLAN.md — Search modal with debounced text, voice search, advanced filters, dual-range sliders, presets
- [ ] 03-04-PLAN.md — Trending (Now Playing), Dinner Time (family-friendly), Free YouTube Movies pages
- [ ] 03-05-PLAN.md — Tab navigation, routing, navbar search integration, toast provider, end-to-end verification

### Phase 4: PWA Infrastructure
**Goal**: Transform app into installable PWA with offline support, update notifications, and multi-layer caching strategy.
**Depends on**: Phase 3
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06
**Success Criteria** (what must be TRUE):
  1. User can install app to home screen on iOS, Android, and desktop via install prompts
  2. User can browse previously viewed movies offline via cached API responses and images
  3. User receives notification when app update is available with option to refresh
  4. Service worker caches static assets (cache-first), API responses (network-first), and images (cache-first)
  5. Offline fallback page displays when user navigates to uncached route without network
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Service worker + Workbox caching, web app manifest, offline fallback page, icon setup
- [ ] 04-02-PLAN.md — Install prompts (Chromium + iOS), update notifications (ReloadPrompt), App.tsx integration

### Phase 5: Animation Layer
**Goal**: Add Framer Motion animations for page transitions, scroll-triggered reveals, and micro-interactions while respecting prefers-reduced-motion.
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, A11Y-05
**Design References**: See `.planning/references/SKEUOMORPHISM-REFERENCES.md` — enhance metal/clay components with:
  - Dramatic directional lighting (specular highlights, rim light on knobs/toggles)
  - Deeper inset track shadows on MetalToggle and MetalSlider
  - Accent glow rings on active controls (orange dark mode, cyan light mode)
  - Interaction bloom/glow effects on hover and drag
**Success Criteria** (what must be TRUE):
  1. User experiences smooth page transitions when navigating between routes (fade, slide, scale variants)
  2. Movie cards and sections reveal with staggered animations as user scrolls into view
  3. Interactive elements provide immediate visual feedback on hover, tap, and focus (color shifts, subtle scale)
  4. Dynamic content changes (grid reflows, list reordering) animate smoothly with layout animations
  5. All animations disable automatically when user sets prefers-reduced-motion in system settings
**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — MotionProvider (reduced-motion), animations.css (glow pulse, material classes), Netflix-style splash screen
- [ ] 05-02-PLAN.md — Page transitions (fade+slide+scale), morph transitions (Next Movie), backdrop crossfade, layoutId hero expand
- [ ] 05-03-PLAN.md — ScrollReveal and StaggerContainer components, integration into Trending/Discovery/DinnerTime/FreeMovies
- [ ] 05-04-PLAN.md — Animated action icons (heart/check/X), TabBar sliding indicator, SearchModal entrance, theme gradient animation
- [ ] 05-05-PLAN.md — Skeuomorphic CSS material enhancements (specular highlights, deep tracks, accent glow, ceramic texture)

### Phase 6: Bento Grid Layouts
**Goal**: Create animated bento grid layouts for hero section and feature showcases with responsive breakpoints.
**Depends on**: Phase 5
**Requirements**: BENT-01, BENT-02, BENT-03, BENT-04, BENT-05
**Success Criteria** (what must be TRUE):
  1. Hero section displays animated bento grid with trending movies, ratings, and streaming providers
  2. Feature showcase sections (discovery, dinner mode, free movies, search) use bento grid layouts with variable column/row spanning
  3. Bento cards scale on hover with staggered reveal animations when entering viewport
  4. Bento grids stack vertically on mobile (375px), display 2 columns on tablet (768px), full grid on desktop (1024px+)
  5. Grid layout reflows smoothly when viewport resizes with Framer Motion layout animations
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — BentoGrid + BentoCell foundation components (responsive grid, glass/clay materials, hover effects, layout animation)
- [ ] 06-02-PLAN.md — HomePage with bento hero grid, 7 cell components, routing update, TabBar 5-tab navigation
- [ ] 06-03-PLAN.md — Per-page bento hero sections for Trending, Dinner Time, and Free Movies pages

### Phase 7: 3D Experience
**Goal**: Add Spline 3D cinematic studio scene with theme-adaptive lighting, camera page transitions, gyroscope parallax, and graceful degradation to 2D parallax on low-end devices.
**Depends on**: Phase 6
**Requirements**: 3DXP-01, 3DXP-02, 3DXP-03, 3DXP-04, 3DXP-05, 3DXP-06, 3DXP-07, PERF-01, PERF-04
**Success Criteria** (what must be TRUE):
  1. Desktop users see 3D hero scene with floating movie posters in 3D space at 60fps
  2. User can interact with 3D movie poster gallery via mouse movement creating parallax depth and camera movement
  3. Movie view transitions use cinematic 3D camera movements when 3D is enabled
  4. 3D scenes are lazy-loaded via code-splitting (not in main bundle), reducing initial load time
  5. Low-end devices automatically receive simplified 3D or fallback to 2D experience based on WebGL capability detection
  6. Mobile 3D maintains 30+ fps with reduced draw calls (<100), LOD, and instancing optimizations
**Plans**: 5 plans

Plans:
- [ ] 07-01-PLAN.md — GPU detection, 3D capability hooks, scene3d store, 2D parallax fallback, Vite chunk config
- [ ] 07-02-PLAN.md — Spline scene integration (SplineHero, SplineScene), progressive loading, AppShell background layer
- [ ] 07-03-PLAN.md — Theme-to-3D sync (useSplineTheme), mobile gyroscope parallax (useDeviceOrientation, GyroscopeProvider)
- [ ] 07-04-PLAN.md — Camera page transitions (CameraTransitionManager), 3D-aware Framer Motion variants
- [ ] 07-05-PLAN.md — Performance audit, Spline optimization, Lighthouse verification, human visual checkpoint

### Phase 8: Polish & Optimization
**Goal**: Finalize accessibility compliance (WCAG 2.1 AA), optimize performance, configure security headers, and automate deployment.
**Depends on**: Phase 7
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, A11Y-01, SECU-01, PERF-02, PERF-03, PERF-05, PRIV-01, PRIV-02
**Design References**: See `.planning/references/SKEUOMORPHISM-REFERENCES.md` — final visual polish:
  - Concentric ripple/wave surface texture on light-mode panels (Kosma reference)
  - Porcelain/ceramic material feel for light-mode rotary knobs
  - Multi-material contrast refinement (rubber push buttons vs ceramic panels)
  - Perforated dot-grid decorative textures where appropriate
  - LED indicator strips / cyan accents on panel edges (light mode)
**Success Criteria** (what must be TRUE):
  1. Application achieves WCAG 2.1 AA compliance with proper ARIA labels, keyboard navigation, and screen reader support across all components
  2. Lighthouse performance score reaches 90+ on desktop with bundle size under 500KB gzipped (excluding lazy-loaded 3D)
  3. Content Security Policy headers block inline scripts and restrict resource loading to trusted domains
  4. User can generate Instagram story cards (1080x1920 canvas) and share movies via Open Graph / Twitter Card meta tags
  5. GitHub Actions deployment workflow automatically builds, injects API keys, and deploys to GitHub Pages on main branch push
  6. Simple Analytics integration tracks usage while respecting user privacy, privacy policy page is accessible
**Plans**: 5 plans

Plans:
- [ ] 08-01-PLAN.md — WCAG 2.1 AA accessibility audit (color contrast, keyboard nav, focus management, ARIA)
- [ ] 08-02-PLAN.md — Performance optimization (responsive srcset images, bundle size, API caching verification)
- [ ] 08-03-PLAN.md — Social sharing (story card generator, share button, OG/Twitter meta tags)
- [ ] 08-04-PLAN.md — Privacy policy page, Simple Analytics integration, Content Security Policy
- [ ] 08-05-PLAN.md — Deployment pipeline (Lighthouse CI), default OG tags, final verification checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 6/6 | Complete | 2026-02-17 |
| 2. Data Layer | 5/5 | Complete    | 2026-02-18 |
| 3. Core Features | 5/5 | Complete | 2026-02-18 |
| 4. PWA Infrastructure | 2/2 | Complete    | 2026-02-18 |
| 5. Animation Layer | 5/5 | Complete    | 2026-02-18 |
| 6. Bento Grid Layouts | 3/3 | Complete   | 2026-02-19 |
| 7. 3D Experience | 5/5 | Complete   | 2026-02-19 |
| 8. Polish & Optimization | 0/TBD | Not started | - |
