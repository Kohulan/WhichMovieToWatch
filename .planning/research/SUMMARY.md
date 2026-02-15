# Project Research Summary

**Project:** WhichMovieToWatch React Rewrite
**Domain:** Movie Discovery PWA with 3D/Animation
**Researched:** 2026-02-15
**Confidence:** HIGH

## Executive Summary

This research covers a complete rewrite of an existing vanilla JavaScript movie discovery app to a modern React 19 PWA with cutting-edge visual features: React Three Fiber 3D experiences, Framer Motion animations, claymorphism design system, and animated bento grid layouts. The recommended approach uses Vite 6 + React 19 + TypeScript 5.7 as the foundation, with Tailwind CSS v4 for styling (no config files), Zustand for state management, and vite-plugin-pwa for offline functionality. The stack prioritizes developer experience, build performance, and modern web capabilities while maintaining zero-runtime dependencies for static deployment to GitHub Pages.

The primary risk is feature parity loss during migration. The existing app has 25+ validated features including advanced search filters, dinner time mode, random discovery, free YouTube movies, voice search, and multiple API integrations (TMDB, OMDB, IPInfo.io). The research identifies a critical pattern: full rewrites often ship with far fewer features than the original application, breaking user workflows. Prevention requires explicit feature inventory tracking, behavioral parity validation, and deferring major UX enhancements until functional parity is achieved. Secondary risks include Three.js bundle size explosion (5x increase causing 10+ second mobile load times), mobile 3D performance collapse (60fps desktop to 5-10fps mobile), service worker caching issues preventing updates from reaching users, and GitHub Pages SPA routing limitations requiring HashRouter or platform migration.

The recommended phased approach prioritizes foundation and data layer first, then core features without animation polish, followed by progressive enhancement with PWA capabilities, 2D animations, bento grid layouts, and finally 3D experiences. This order validates the data layer early, provides testable features before visual complexity, and treats 3D as an additive enhancement to a working application rather than a core dependency that could block delivery.

## Key Findings

### Recommended Stack

The stack is optimized for a visually stunning React PWA with 3D animations, claymorphism design, and GitHub Pages deployment. Core is React 19 + Vite 6 + TypeScript 5.7 with Tailwind CSS v4 for styling, Framer Motion for animations, and React Three Fiber for 3D. All choices prioritize developer experience, build performance, and modern web capabilities while maintaining zero-runtime dependencies for static hosting.

**Core technologies:**
- **React 19 + Vite 6 + TypeScript 5.7:** Latest stable stack with <100ms HMR in development, sub-2s production builds. Vite is 40x faster than CRA and natively supports React 19's features.
- **Tailwind CSS v4:** Zero-config setup (just `@import "tailwindcss"`), uses modern CSS features (cascade layers, @property, color-mix). No config file needed.
- **Framer Motion 12:** Industry standard for React animations. Hardware-accelerated transforms, useScroll improvements, perfect for scroll-triggered movie card reveals.
- **React Three Fiber 9 + Drei 10:** Declarative 3D with React components. Drei reduces boilerplate by 70%. Supports WebGPU, LOD for performance, Draco compression for 90% size reduction.
- **Zustand 5:** Minimal boilerplate (50% less than Redux), ~1KB, selective subscriptions prevent unnecessary re-renders. Ideal for small-to-medium apps.
- **vite-plugin-pwa 0.22:** Zero-config PWA with auto-generated manifest and service worker. Use `registerType: 'autoUpdate'` for automatic updates.

**Critical decision:** Use Vite's build-time environment variable injection (VITE_ prefix) for API keys instead of runtime injection. GitHub Actions will replace these during build. This is the only viable approach for GitHub Pages static hosting.

**Version requirements:** Node.js 20.19+ or 22.12+ required for Vite 6.

### Expected Features

Research identifies 28 features across table stakes (expected by users) and differentiators (competitive advantages). Feature complexity ranges from low (1-3 days) to very high (2-4 weeks).

**Must have (table stakes):**
- Instant search with real-time results (<200ms update time)
- Advanced filtering (genre, year, rating, streaming service) with real-time updates
- Responsive mobile-first design (320px-4K displays)
- Dark mode with light/dark + system preference detection
- Fast loading with skeleton states (matching claymorphic design)
- PWA offline functionality (service workers for caching)
- Social sharing (Web Share API + fallback)
- Accessibility (WCAG 2.2 Level AA - legal requirement in 2025)
- Push notifications (PWA support now works across iOS/Android/desktop)
- Personalized recommendations (75% of Netflix viewing comes from recommendations)
- Trending/Popular section (reduces decision fatigue)
- Movie detail pages (cast, crew, ratings, where to watch, trailers)
- Watchlist/favorites with persistence

**Should have (differentiators):**
- Claymorphism design system (soft, tactile aesthetic stands out from flat/glassmorphic competitors)
- Animated bento grid hero section ("hottest UI trend 2025")
- React Three Fiber 3D experiences (interactive posters, hero scenes, transitions)
- Framer Motion scroll/page animations (creates premium, polished feel)
- 2-3 curated color scheme presets (Classic, Neon, Nature)
- Animated theme switching (delightful micro-interaction)
- Dinner time mode (existing unique feature - random pick with constraints)
- Random discovery with visual flair (enhanced with 3D animations)
- Free movies filter (existing feature - users value free content)
- Voice search with visual feedback (Web Speech API with waveform)

**Defer (v2+):**
- Cross-device cloud sync (requires backend infrastructure)
- Multi-platform social integration (Instagram Stories, etc.)
- AI smart filters (NLP for natural language search)

**Keep from existing vanilla JS app:**
- Dinner time mode (unique feature - enhance with 3D animation)
- Random discovery (enhance with animations)
- Free movies filter (integrate in initial phase)
- Voice search (enhance with visual feedback)
- Social sharing (keep basic, enhance later)

**Anti-features (explicitly avoid):**
- Autoplay trailers on hover (major pain point in streaming UX)
- Infinite scroll without pagination (causes performance issues with 3D)
- Uncategorized homepage chaos (confusing, overwhelming)
- Hidden search in hamburger menu (users expect search on top)
- Unclear pricing/availability (breaks trust)
- Complex onboarding flow (users want to browse immediately)
- Feature bloat (focus on core: discover → decide → watch info)

### Architecture Approach

Feature-based organization with clear separation of concerns across UI layer, animation/visual layer, state management, and services. React Three Fiber runs in isolated render loop (60fps, doesn't trigger React re-renders). Framer Motion handles page/scroll animations via AnimatePresence and useScroll hooks. Claymorphism theme system uses CSS custom properties for zero-rerender theme switching.

**Major components:**
1. **UI Components Layer** — Pages (route-level), Layouts (bento grid containers), Features (Search, MovieCard, Trending, DinnerTime), UI primitives (Button, Card, Modal with claymorphism)
2. **Animation & Visual Layer** — Framer Motion (2D/page transitions), React Three Fiber (3D/full canvas), Claymorphism Theme System (CSS variables)
3. **State Management Layer** — Zustand (app state: movies, search, preferences), Context (theme/UI stable state), Local (useState for transient UI)
4. **Services Layer** — API Client (TMDB, OMDB, IPInfo with offline-first caching), PWA/SW (Workbox service worker), Storage (IndexedDB/localStorage)

**Data flow:** Offline-first API service checks IndexedDB cache before network requests. Zustand store updates trigger subscriber re-renders. Framer Motion transitions applied automatically. 3D/2D coordination via event bus or shared Zustand state.

**Integration patterns:**
- **Framer Motion + React:** AnimatePresence for page transitions, useScroll for scroll-triggered animations, layout prop for automatic FLIP animations
- **React Three Fiber + React:** Canvas in separate render loop with `frameloop="demand"` for static scenes, useFrame for animations (not React state), custom event emitter for DOM ↔ 3D communication
- **Claymorphism + Theme:** CSS Variables for theme colors/shadows, Context provider for theme switching, view-transition API for animated theme changes
- **Bento Grid + Responsive:** CSS Grid with named areas, react-grid-layout for dynamic resizing, Framer Motion layout animations for grid reflows

**Performance targets:**
- Bundle Size: <500KB gzipped (code splitting, tree-shaking, lazy load 3D scenes)
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- 3D Render FPS: 60fps (LOD with `<Detailed />`, instanced meshes, <100 draw calls)

### Critical Pitfalls

Research identified 15 pitfalls (5 critical, 6 moderate, 4 minor) with prevention strategies.

**Top 5 critical pitfalls:**

1. **Feature Parity Blindness During Migration** — Shipping rewrite with far fewer features than current vanilla JS app (25+ features), breaking user workflows. **Prevention:** Create feature inventory spreadsheet tracking ALL existing features, map to React components BEFORE starting, use automated behavioral parity validation, defer UX enhancements to post-migration, implement route-level checks and snapshot comparisons.

2. **Three.js Bundle Size Explosion** — Bundle jumps 5x after adding Three.js, causing 10+ second mobile load times. **Prevention:** Use named imports (not `import * as THREE`), dynamic imports for 3D (`lazy(() => import('./3DExperience'))`), Draco compression for geometry (90%+ reduction), KTX2 for textures, code-split React Three Fiber, monitor with bundle visualizer, set 500kB budget alert.

3. **Mobile 3D Performance Collapse** — 60fps desktop drops to 5-10fps on mid-range Android (60%+ of users). **Prevention:** Target <100 draw calls per frame (use R3F-Perf), use instancing for repeated objects (90%+ reduction), reuse materials/geometries with useMemo, avoid creating objects in useFrame, use LOD with Drei's `<Detailed>` (30-40% FPS improvement), implement adaptive quality for mobile, test on actual mid-range Android devices.

4. **Service Worker Caching Hell** — After deploying updates, users see old version for 24+ hours. Broken deployments get cached. **Prevention:** Set `Cache-Control: max-age=0, no-cache` header for `service-worker.js`, implement update notification prompting users when new version available, use Vite PWA plugin with `registerType: 'autoUpdate'` or `'prompt'`, never enable service worker in development, implement cache versioning (change cache name on each deployment), add manual "Check for updates" button.

5. **GitHub Pages SPA Routing Black Hole** — React Router works in development but all routes return 404 on GitHub Pages. Direct navigation to `/movie/12345` breaks. **Prevention:** Use HashRouter for GitHub Pages (URLs become `/#/movie/12345` — works immediately but ugly URLs, poor SEO) OR migrate to Cloudflare Pages/Vercel (both have native SPA support with proper routing). Configure `base: '/WhichMovieToWatch/'` in vite.config.ts (matches repo name).

**Moderate pitfalls to watch:**
- Framer Motion Layout Thrashing (animate only GPU-accelerated properties: x, y, scale, rotate, opacity — never width, height, top, left)
- Claymorphism Accessibility Disaster (WCAG 2.2 contrast failures, limit blur to 8-15px, ensure 4.5:1 contrast minimum, provide transparency toggle)
- Theme Switching Re-render Storm (use CSS Variables instead of ThemeProvider to avoid full app re-render on theme change)
- Bento Grid Performance Collapse (wrap children in React.memo, memoize layouts with useMemo, debounce layout change handlers)
- Framer Motion 3D + React Three Fiber Context Conflict (use R3F Canvas for 3D, Framer Motion for DOM/2D only — MotionCanvas breaks R3F context)
- TypeScript Strict Mode Migration Chaos (start with `strict: false` for migration, enable flags incrementally, allow temporary `any` types)

## Implications for Roadmap

Based on research findings, recommended 8-phase structure prioritizes foundation first, validates data layer early, delivers testable features before visual complexity, and treats 3D as additive enhancement.

### Phase 1: Foundation
**Rationale:** Establishes project structure, build system, type safety, and theme system that all other phases depend on. No external dependencies means can start immediately.
**Delivers:** Vite + React + TypeScript setup, project structure (feature-based organization), theme system (CSS variables, ThemeProvider, basic claymorphism styles), basic UI components (Button, Card, Modal), routing setup (React Router with HashRouter for GitHub Pages compatibility).
**Addresses:** Foundation for all features, TypeScript strict mode strategy (start with `strict: false`, enable incrementally), environment variable setup (VITE_ prefix with validation), GitHub Pages routing decision (HashRouter vs. platform migration).
**Avoids:** TypeScript Strict Mode Migration Chaos (Pitfall 12), GitHub Pages SPA Routing Black Hole (Pitfall 5), Vite Environment Variable Misconfiguration (Pitfall 13).
**Complexity:** Low

### Phase 2: Core Data Layer
**Rationale:** Features need data layer, but data layer doesn't need UI polish. Validates API integrations and caching strategy before building features.
**Delivers:** API service layer (client.ts, error handling, offline-first caching), TMDB service (search, details, trending), OMDB service (additional metadata), IPInfo service (user location), Storage service (IndexedDB setup), Zustand store structure (slices pattern), basic error boundaries.
**Addresses:** All API integrations from existing app, request throttling and caching to avoid rate limiting, offline-first architecture for PWA foundation.
**Avoids:** TMDB API Key Exposure + Rate Limiting Cascade (Pitfall 6).
**Complexity:** Medium

### Phase 3: Core Features (No Animation)
**Rationale:** Validates data layer with testable features before adding visual complexity. Ensures feature parity with existing vanilla JS app (25+ features).
**Delivers:** Search feature (SearchBar, SearchResults, filters), Movie detail view, Trending section, Random discovery, Dinner Time mode, Free YouTube movies section, Watchlist/favorites.
**Addresses:** Feature parity validation with existing app, all table stakes features (instant search, advanced filters, trending, details, watchlist), keeping existing unique features (Dinner Time, random discovery, free movies).
**Avoids:** Feature Parity Blindness During Migration (Pitfall 1).
**Complexity:** Medium-High
**Research flag:** Phase may need deeper research for behavioral parity validation patterns and integration testing strategies.

### Phase 4: PWA Infrastructure
**Rationale:** Core features exist and work, now make them work offline. PWA capabilities are table stakes for 2025 but don't block feature development.
**Delivers:** Vite PWA plugin configuration, Service worker setup (Workbox with proper cache strategies), Offline detection, Update notification UI, Manifest configuration, IndexedDB caching strategy, Background sync (optional).
**Addresses:** PWA offline functionality (table stakes), service worker caching with update notifications, cache versioning to prevent stale deployments.
**Avoids:** Service Worker Caching Hell (Pitfall 4).
**Complexity:** Medium
**Research flag:** May need phase-level research for Workbox configuration patterns and update flow UX.

### Phase 5: Animation Layer (2D)
**Rationale:** Features exist and work. Animations enhance but don't block core functionality. Can run in parallel with Phase 4.
**Delivers:** Framer Motion setup, Page transitions (AnimatePresence), Scroll-triggered animations (fade-in, parallax with `once: true`), Micro-interactions (hover, click, focus states), Layout animations (grid reflows, list reordering), Loading skeletons with motion.
**Addresses:** Premium polished feel (differentiator), scroll-triggered movie card reveals, animated theme switching, respecting `prefers-reduced-motion`.
**Avoids:** Framer Motion Layout Thrashing (Pitfall 7 — only animate GPU-accelerated properties).
**Complexity:** Medium
**Parallel work:** Can be developed simultaneously with Phase 4 (PWA) by different developers.

### Phase 6: Bento Grid Layout
**Rationale:** Requires understanding of feature components, benefits from Framer Motion layout animations from Phase 5.
**Delivers:** Bento grid component, react-grid-layout integration, Responsive breakpoints, Grid item components, Drag-and-drop (optional), Layout persistence, Claymorphism design system refinement.
**Addresses:** Animated bento grid hero section (differentiator, "hottest UI trend 2025"), claymorphism design system (differentiator), 2-3 color scheme presets.
**Avoids:** Bento Grid Performance Collapse (Pitfall 10 — memoize children and layouts), Claymorphism Accessibility Disaster (Pitfall 8 — WCAG 2.2 contrast testing).
**Complexity:** Medium
**Research flag:** May need phase-level research for bento grid performance optimization patterns and claymorphism accessibility techniques.

### Phase 7: 3D Experience
**Rationale:** Most complex, most performance-intensive. Should be additive to working app, not a blocker.
**Delivers:** React Three Fiber setup, 3D scene components, Models/materials/lighting, Camera controls, DOM ↔ 3D coordination, Performance optimizations (LOD, instancing, on-demand rendering), Device capability detection, Fallback experience for low-end devices.
**Addresses:** React Three Fiber 3D experiences (differentiator), interactive 3D movie posters, 3D hero scenes, 3D page transitions, progressive enhancement for device capabilities.
**Avoids:** Three.js Bundle Size Explosion (Pitfall 2 — code-splitting, Draco compression), Mobile 3D Performance Collapse (Pitfall 3 — <100 draw calls, LOD, adaptive quality), Framer Motion 3D + React Three Fiber Context Conflict (Pitfall 11 — use R3F for 3D, Motion for DOM only).
**Complexity:** Very High
**Research flag:** Needs phase-level research for 3D asset optimization, performance budgeting, and mobile testing strategies.

### Phase 8: Polish & Optimization
**Rationale:** Requires complete feature set to optimize. Polish makes sense when core is solid.
**Delivers:** Animated theme switching (view-transition API), Performance optimizations (code splitting, tree shaking), Accessibility improvements (ARIA, keyboard nav, screen reader), SEO optimizations (meta tags, OG images, sitemap), Analytics integration, Error monitoring (Sentry), Web Vitals tracking, Production build optimization, GitHub Pages deployment automation.
**Addresses:** Final polish for all features, WCAG 2.2 Level AA compliance, performance budgets, production deployment strategy.
**Avoids:** Theme Switching Re-render Storm (Pitfall 9 — CSS Variables already in place from Phase 1).
**Complexity:** Medium

### Phase Ordering Rationale

**Dependency-driven ordering:**
- Foundation → Data Layer → Core Features is the critical path. Features can't be built without data layer, data layer needs project structure.
- PWA and Animation can run in parallel after Core Features (Phase 4 and 5 simultaneously).
- Bento Grid depends on Animation for layout animations (Phase 6 after Phase 5).
- 3D Experience depends on Bento Grid for integration points (Phase 7 after Phase 6).
- Polish requires complete feature set (Phase 8 last).

**Risk mitigation ordering:**
- Phase 1 addresses routing strategy before any features are built (prevents GitHub Pages disaster).
- Phase 2 addresses API rate limiting and caching before features trigger the problem.
- Phase 3 addresses feature parity BEFORE adding visual enhancements that could distract from gaps.
- Phase 4 addresses service worker caching strategy before it becomes a deployment blocker.
- Phase 7 (3D) comes after app is functional, making it an enhancement not a dependency.

**Parallel work opportunities:**
- Phase 4 (PWA) and Phase 5 (Animation) can be done in parallel by different developers.
- Phase 6 (Bento) and Phase 7 (3D) can start in parallel if Phase 5 is complete (though coordination needed for integration).
- UI components in Phase 1 can be built progressively as needed by features.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Core Features):** Complex integration testing for feature parity validation. Existing app has 25+ features with edge cases that need documentation. May need research on behavioral parity testing patterns and automated comparison strategies.
- **Phase 4 (PWA Infrastructure):** Workbox configuration for multiple API endpoints with different caching strategies. Update notification UX patterns. May need phase-level research for optimal cache strategies and update flows.
- **Phase 6 (Bento Grid Layout):** Performance optimization for react-grid-layout with Framer Motion. Claymorphism accessibility techniques. May need research on memoization patterns and WCAG 2.2 compliance testing.
- **Phase 7 (3D Experience):** Most complex phase with highest uncertainty. Asset optimization, mobile performance budgeting, progressive enhancement strategies. Definitely needs phase-level research for Three.js performance optimization, Draco/KTX2 compression workflows, and device capability detection patterns.

**Phases with standard patterns (can skip phase-level research):**
- **Phase 1 (Foundation):** Vite + React + TypeScript setup is well-documented. Established patterns from multiple 2026 sources.
- **Phase 2 (Core Data Layer):** API client with offline-first caching is standard pattern. Zustand slices pattern is well-documented.
- **Phase 5 (Animation Layer):** Framer Motion integration patterns are well-established. Official docs comprehensive.
- **Phase 8 (Polish):** Standard deployment and optimization practices. GitHub Actions workflows are well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core recommendations verified through official documentation (React 19, Vite 6, Tailwind v4, Framer Motion 12, R3F 9) and multiple current 2026 sources. Version numbers reflect latest stable releases as of Feb 2026. |
| Features | MEDIUM | Table stakes features verified via WebSearch with multiple sources (PWA standards, accessibility requirements, UX best practices). Existing app features inferred from project context (25+ features including Dinner Time, voice search, free movies). Differentiators based on 2026 design trends (claymorphism, bento grids, 3D). |
| Architecture | HIGH | Component architecture patterns verified via official React, R3F, and Framer Motion docs. Feature-based organization and API service layer patterns confirmed by multiple 2026 sources. Integration patterns for R3F + Motion + Theme system verified. |
| Pitfalls | HIGH | Critical pitfalls verified through official docs (R3F performance pitfalls, TMDB rate limiting, GitHub Pages routing limitations) and multiple current migration guides. Moderate/minor pitfalls confirmed by specialized sources (Axess Lab for accessibility, Epic React for theme performance). |

**Overall confidence:** HIGH

Research quality is very strong across all domains. Stack recommendations are current (Feb 2026) and verified against official sources. Architecture patterns are proven and well-documented. Pitfalls are concrete with clear prevention strategies.

### Gaps to Address

**Feature inventory validation:** Research infers 25+ existing features from project context but doesn't have explicit feature list from current vanilla JS app. During Phase 1 planning, create comprehensive feature inventory by auditing existing codebase, user documentation, and production app. This is critical for preventing Feature Parity Blindness (Pitfall 1).

**OMDB API specifics:** Research found TMDB API documentation and rate limiting details but less concrete information about OMDB API integration patterns. During Phase 2 implementation, review OMDB API docs directly and test rate limiting behavior. May need fallback strategy if OMDB has similar rate limit issues as TMDB.

**GitHub Pages vs. platform migration decision:** Research presents two viable options (HashRouter for GitHub Pages with ugly URLs/poor SEO vs. migration to Cloudflare Pages/Vercel with proper routing). This architectural decision should be made in Phase 1 before building features. Recommendation: Start with HashRouter for immediate deployment, plan migration to Cloudflare Pages in Phase 8 if SEO becomes important.

**Mobile device testing strategy:** Research emphasizes importance of testing on actual mid-range Android devices (60%+ of users) but doesn't specify device models or testing infrastructure. During Phase 3-7 planning, establish device lab (physical devices or BrowserStack) and define performance baselines for different GPU tiers.

**3D asset pipeline:** Research recommends Draco compression for geometry (90% reduction) and KTX2 for textures but doesn't detail asset creation workflow. During Phase 7 planning, research 3D asset optimization pipelines (Blender export settings, compression tools, format conversion). This will likely need phase-level research.

**Behavioral parity testing approach:** Research recommends automated behavioral parity validation between vanilla JS and React versions but doesn't specify tools or methodology. During Phase 3 planning, research integration testing strategies (Playwright for E2E, Vitest for component integration, snapshot testing for API responses).

## Sources

### Primary (HIGH confidence - official docs and current 2026 sources)

**Stack:**
- [Vite Getting Started](https://vite.dev/guide/) — Build tool configuration
- [Motion — JavaScript & React animation library](https://motion.dev/) — Framer Motion v12
- [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/) — R3F architecture and patterns
- [Tailwind CSS v4: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) — v4 zero-config setup
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) — PWA configuration
- [Complete Guide to Setting Up React with TypeScript and Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2) — Current setup guide

**Features:**
- [Essential PWA Features Every Website Needs in 2025](https://www.theadfirm.net/progressive-web-apps-in-2025-essential-features-every-website-needs/) — PWA standards
- [2025 WCAG & ADA Website Compliance Requirements](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/) — Accessibility requirements
- [Bento Grid Web Design Guide 2025](https://webtechneeq.com/blog/the-ultimate-guide-to-bento-grid-web-design-for-2025/) — Bento grid patterns
- [Glassmorphism vs. Claymorphism vs. Skeuomorphism: 2025 UI Design Guide](https://medium.com/design-bootcamp/glassmorphism-vs-claymorphism-vs-skeuomorphism-2025-ui-design-guide-e639ff73b389) — Design trends
- [7 UI/UX mistakes to Avoid When Building a Video Streaming App](https://www.fastpix.io/blog/7-mistakes-to-avoid-when-building-ui-for-streaming-app) — Anti-patterns

**Architecture:**
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) — Component patterns
- [React Three Fiber Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) — R3F optimization
- [Zustand vs Redux Toolkit: Which should you use in 2026?](https://medium.com/@sangramkumarp530/zustand-vs-redux-toolkit-which-should-you-use-in-2026-903304495e84) — State management
- [Use CSS Variables instead of React Context](https://www.epicreact.dev/css-variables) — Theme performance

**Pitfalls:**
- [Performance pitfalls - React Three Fiber](https://r3f.docs.pmnd.rs/advanced/pitfalls) — R3F official pitfalls
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) — Three.js optimization
- [Migrating Your Front-end To React, Step By Step](https://xebia.com/blog/migrating-to-react-step-by-step/) — Migration patterns
- [Rate Limiting - TMDB Developer](https://developer.themoviedb.org/docs/rate-limiting) — TMDB API limits
- [GitHub Pages does not support routing for single page apps](https://github.com/orgs/community/discussions/64096) — GitHub Pages limitation
- [Glassmorphism Meets Accessibility: Can Glass Be Inclusive?](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) — Accessibility concerns

### Secondary (MEDIUM confidence - community consensus)

- [React Migration Checklist: Legacy To AI Stack 2025](https://fullstacktechies.com/react-js-migration-checklist-legacy-to-ai/) — Migration best practices
- [Building Efficient Three.js Scenes: Optimize Performance While Maintaining Quality](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) — Three.js performance
- [Strategies for Service Worker Caching for Progressive Web Apps](https://hasura.io/blog/strategies-for-service-worker-caching-d66f3c828433) — Caching strategies
- [Framer Motion Tips for Performance in React](https://tillitsdone.com/blogs/framer-motion-performance-tips/) — Animation performance
- [The Perils of Hydration](https://www.joshwcomeau.com/react/the-perils-of-rehydration/) — Hydration issues

### Tertiary (LOW confidence - needs validation)

- OMDB API integration patterns (limited documentation found, needs validation during implementation)
- Behavioral parity testing for vanilla JS to React migration (inferred approach, needs methodology research)
- Specific device models for mobile testing (general guidance provided, specific devices need definition)

---
*Research completed: 2026-02-15*
*Ready for roadmap: yes*
