# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Instantly discover your next movie with a visually immersive experience that makes browsing feel as cinematic as watching.
**Current focus:** Phase 7 - 3D Experience

## Current Position

Phase: 7 of 8 (3D Experience) -- IN PROGRESS
Plan: 1 of 4 in current phase (complete)
Status: Plan 07-01 complete — GPU detection infrastructure, parallax fallback, spline-vendor chunk, Scene3DProvider wired into AppShell
Last activity: 2026-02-19 — Plan 07-01 complete (GPU tier detection, use3DCapability, scene3dStore, ParallaxFallback, Scene3DProvider, route-aware opacity in AppShell)

Progress: [████████████████████░] 62%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 3.5 min
- Total execution time: 0.72 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Status |
|-------|-------|-------|----------|--------|
| 01-foundation-design-system | 6 | 24 min | 4 min | Complete |
| 02-data-layer | 5/5 | 13 min | 2.6 min | Complete |
| 03-core-features | 5/5 | 20 min | 4 min | Complete |
| 04-pwa-infrastructure | 2/2 | 7 min | 3.5 min | Complete |

**Recent Trend:**
- Last 5 plans: 03-02 (4 min), 03-03 (4 min), 03-04 (4 min), 03-05 (4 min), 04-01 (5 min)
- Trend: Stable

*Updated after each plan completion*
| Phase 03 P02 | 6 | 2 tasks | 7 files |
| Phase 03-core-features P03 | 9 | 2 tasks | 14 files |
| Phase 04-pwa-infrastructure P01 | 5 | 2 tasks | 11 files |
| Phase 04-pwa-infrastructure P02 | 2 | 2 tasks | 4 files |
| Phase 05-animation-layer P05 | 3 | 2 tasks | 6 files |
| Phase 05-animation-layer P01 | 3 | 3 tasks | 9 files |
| Phase 05-animation-layer P03 | 3 | 2 tasks | 6 files |
| Phase 05-animation-layer P02 | 5 | 2 tasks | 6 files |
| Phase 06 P03 | 3 | 2 tasks | 6 files |
| Phase 06 P02 | 2 | 2 tasks | 10 files |
| Phase 07-3d-experience P01 | 4 | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: React + Vite + TypeScript for modern DX, fast builds, type safety, static export for GitHub Pages
- Phase 1: Tailwind CSS v4 for zero-config styling with claymorphism custom properties
- Phase 1: Claymorphism design language provides soft 3D depth, works in light and dark modes
- Phase 1: 2-3 curated theme presets (Cinema Gold, Ocean Blue, Neon Purple) with light+dark variants
- Phase 1: HashRouter for GitHub Pages SPA routing (decision pending, may migrate to Cloudflare Pages in Phase 8)
- Plan 01-01: Preserved old vanilla JS app as index.old.html during rewrite
- Plan 01-01: strict:false in TypeScript, will tighten incrementally
- Plan 01-01: base:'/' in Vite (custom domain active via CNAME)
- Plan 01-01: No tailwind.config.js or postcss.config.js (Tailwind v4 CSS-first via @tailwindcss/vite)
- Plan 01-02: localStorage key 'theme-preferences' shared between Zustand persist and FOUC inline script
- Plan 01-02: System preference detection only on first visit; manual toggle disables auto-follow
- Plan 01-02: oklch colors for all 6 theme variants, WCAG AA 4.5:1 contrast minimum
- Plan 01-02: Temporary test buttons in App.tsx (replaced by RotaryDial in Plan 05)
- Plan 01-04: HTMLMotionProps<'button'> over ButtonHTMLAttributes to avoid onDrag type conflict
- Plan 01-04: Two-material pattern: metal-gradient trigger + clay-elevated dropdown panel
- Plan 01-04: Spring stiffness 300-500 for metal (firm hardware feel), lower for clay (soft)
- Plan 01-04: Custom motion drag slider over native range for consistent skeuomorphic appearance
- [Phase 01-03]: Bold 3D clay shadows (16px/32px for lg) over subtle neumorphism for puffy clay toy aesthetic
- [Phase 01-03]: SVG feTurbulence texture at 0.08 opacity for visible plasticine grain without external assets
- [Phase 01-03]: forwardRef on ClayInput for form library and focus management compatibility
- [Phase 01-03]: Body scroll lock in ClayModal for proper UX, restored on close
- Plan 01-05: useSound uses module-level AudioContext with one-shot document listener for browser autoplay compliance
- Plan 01-05: AppShell clay reshape uses AnimatePresence mode=wait with spring stiffness 150, damping 12 for soft clay feel
- Plan 01-05: Navbar shows abbreviated title (WMTW) on mobile, full title on desktop
- Plan 01-05: All 12 UI components barrel-exported from @/components/ui; temp test buttons removed from App.tsx
- Plan 01-06: Route-based App.tsx with Outlet pattern for scalable page additions
- Plan 01-06: Showcase as index route during Phase 1 for design system verification
- Plan 01-06: CNAME in public/ for automatic inclusion in Vite dist output
- Plan 01-06: Deploy workflow uses actions/deploy-pages@v4 (official) instead of peaceiris third-party action
- Plan 02-01: Singleton DB connection via module-level promise variable to avoid opening multiple IndexedDB connections
- Plan 02-01: CacheEntry stores TTL per-entry (not per-store) enabling mixed TTLs in one object store
- Plan 02-02: TasteProfile defined inline in preferencesStore (types/ dir not yet created, will refactor later)
- Plan 02-02: Old 'theme' key preserved in localStorage during migration for vanilla app backwards compat
- Plan 02-02: Persisted stores use 'wmtw-*' key prefix; runtime stores have no persistence
- Plan 02-04: OMDB returns any cached value (stale or fresh) to conserve 1000/day API quota
- Plan 02-04: Discover filter relaxation is cumulative (each step merges onto previous relaxed state)
- Plan 02-04: IPInfo uses unauthenticated free tier; navigator.language fallback for country detection
- Plan 02-05: useRandomMovie cast to Record<string, unknown> removed in Plan 03-01 (discoveryStore now uses real TMDBMovieDetails type)
- Plan 02-05: useTrending uses useRef for region in interval to avoid stale closure
- Plan 02-05: useRegion invalidates providers- cache prefix on manual override for stale regional data
- [Phase 03-core-features]: ExternalLink wrapper enforces rel=noopener noreferrer site-wide with no escape hatch (SECU-04)
- [Phase 03-core-features]: ToastProvider uses CSS var() references for automatic adaptation to all 6 claymorphism theme variants
- [Phase 03-core-features]: useAnnounce returns [announce, AnnouncerComponent] tuple so callers don't manage ARIA state
- Plan 03-04: useFreeMovies uses import.meta.env.BASE_URL prefix for movies.txt fetch (GitHub Pages base path compatibility)
- Plan 03-04: Module-level movies.txt cache in useFreeMovies — single fetch per session, shared across all hook instances
- Plan 03-04: TMDB enrichment in useFreeMovies is non-fatal — FreeMoviesPage shows YouTube movie with title-only if TMDB lookup fails
- Plan 03-04: markDinnerLike/markDinnerDislike are mutually exclusive in movieHistoryStore
- Plan 03-04: ServiceBranding exports both visual badge component and getServiceConfig() function for gradient/watchUrl access
- [Phase 03-02]: DiscoverPage checks hasOnboarded via getState() snapshot — wizard only shows on first render, not reactively
- [Phase 03-02]: OnboardingWizard X button treated as Skip — no forced onboarding, user can always skip (PREF-02)
- [Phase 03-02]: Similar movies triggered by lovedMovieId state (null=hidden); clicking loads full movie via fetchMovieDetails (INTR-01)
- [Phase 03-03]: SearchModal dual-path: text search uses /search/movie via useSearchMovies; advanced filters uses /discover/movie via tmdbFetch
- [Phase 03-03]: DualRangeSlider uses two overlaid native inputs for native browser accessibility across platforms
- [Phase 03-03]: useVoiceSearch declares custom SpeechRecognition interface inline to avoid @types/dom-speech-recognition dependency
- [Phase 03-03]: FilterPresets reset-then-set pattern: resetAdvancedFilters() then setAdvancedFilters(preset.filters) for clean state
- Plan 04-01: registerType: 'prompt' over 'autoUpdate' — prevents SW reload from interrupting onboarding wizard UX
- Plan 04-01: Separate maskable icon entry (512x512 purpose='maskable') instead of combined 'any maskable' per web.dev best practice
- Plan 04-01: offline.html navigates to /#/ (not /) for HashRouter compatibility on GitHub Pages
- Plan 04-01: globPatterns includes html to prevent WorkboxError: non-precached-url for navigation fallback
- Plan 04-01: Icons live in public/favicon_io/ — Vite copies to dist/ at build time, manifest paths resolve at root
- Plan 04-02: ReloadPrompt and InstallBanner mounted outside splash guard — SW registers immediately regardless of onboarding state
- Plan 04-02: offlineReady auto-dismisses after 5s (informational); needRefresh persists until user acts (requires explicit reload)
- Plan 04-02: wmtw-pwa-install-dismissed localStorage key enforces 7-day install banner dismissal cooldown
- Plan 04-02: beforeinstallprompt e.preventDefault() defers native mini-infobar for user-controlled Chromium install
- Plan 05-05: accent-glow-pulse @keyframes defined in metal.css (not a separate animations.css) for colocation with metal components
- Plan 05-05: RotaryDial glow ring wraps the w-14 h-14 container div so glow surrounds full dial + indicator dots area
- Plan 05-05: isDark derived inline as mode === 'dark' in ClayCard (themeStore has no computed isDark property)
- Plan 05-05: Transient glow state pattern: useState boolean + useRef timer + clearTimeout on unmount for 2s interaction feedback
- Plan 05-01: MotionProvider uses reducedMotion='user' — disables transforms/layout, preserves opacity/color for graceful degradation
- Plan 05-01: CSS @media prefers-reduced-motion block in animations.css kills all CSS keyframe animations (MotionConfig cannot reach CSS)
- Plan 05-01: SplashScreen always on bg-black regardless of app theme — Netflix-style cinematic dark, always consistent
- Plan 05-01: LoadingQuotes integrated into SearchResults.tsx (not SearchModal.tsx) — SearchResults owns the loading display
- Plan 05-01: film-reel-spin uses CSS @keyframes animation (not Framer Motion) — simpler and more performant for infinite loops
- [Phase 05-03]: ScrollReveal uses hasAnimated state to play shorter re-entry animation (0.3s/40% travel) vs first entry (0.6s/full travel)
- [Phase 05-03]: StaggerContainer passes role and aria-label props to motion.div for ARIA list semantics
- [Phase 05-03]: StaggerItem uses variants prop only — inherits stagger timing from parent StaggerContainer, no own initial/whileInView
- [Phase 05-animation-layer]: Plan 05-02: PageTransition.tsx is a pure data module (no JSX) — variants exported as constants consumed by AppShell
- [Phase 05-animation-layer]: Plan 05-02: Morph transition uses tween with cubic-bezier [0.25,0.1,0.25,1] for smooth controlled dissolve (not bouncy spring)
- [Phase 05-animation-layer]: Plan 05-02: layoutId prefix similar-poster-{movieId} avoids collisions; FreeMoviesPage keys on youtubeId (tmdb.id can be 0 for stubs)
- [Phase 05-animation-layer]: Plan 05-02: Gradient overlay stays outside AnimatePresence — remains constant while backdrop crossfades beneath
- Plan 05-04: animatingAction setTimeout timing (love=600ms, watched=500ms, skip=400ms) decouples icon animation from action side-effect, ensuring animation is visible before movie changes
- Plan 05-04: TabBar active detection via useLocation() at component level (not NavLink callback) enables layoutId indicator render decision outside NavLink render prop scope
- Plan 05-04: AppShell blobs use AnimatePresence mode=sync (not mode=wait) for simultaneous crossfade on theme preset change, matching CSS transition-colors duration-500 feel
- Plan 05-04: SearchModal backdropFilter blur(0px→12px) animates the overlay's background blur separately from the panel's static backdrop-blur-2xl CSS class
- Plan 06-01: Static Tailwind lookup objects for all col-span/row-span values — Tailwind v4 static analysis cannot detect template literal class names
- Plan 06-01: Inline style borderRadius: 1rem on layout-animated motion.div — prevents FLIP scaleX/scaleY transform distortion
- Plan 06-01: Mobile tap-to-expand: first tap shows overlay, second tap calls onClick, auto-collapses after 4s
- Plan 06-01: lg:auto-rows-[minmax(120px,auto)] applied only at desktop breakpoint — mobile/tablet rows auto-size to content (avoids height collapse pitfall)
- Plan 06-01: grid-flow-dense on BentoGrid — prevents gaps when large cells push smaller ones to next row
- [Phase 06]: DinnerTimePage and FreeMoviesPage heroes placed in Fragment: inner components use full-screen fixed backdrop, Fragment + own max-w-7xl wrapper for hero only keeps layout clean
- [Phase 06]: TrendingBentoHero uses useTrending() hook for live data — both hero and TrendingPageComponent call useTrending but React shared hook state prevents double-fetching
- [Phase 06-02]: SearchCell navigates to /discover as fallback — SearchModal open mechanism not accessible from static cell context without global store coupling
- [Phase 06-02]: StaggerItem wraps BentoCell at HomePage level — ensures StaggerContainer variants propagation reaches motion.div in StaggerItem correctly
- [Phase 06-02]: ProviderLogosCell uses static TMDB logo paths — avoids runtime API call for decorative cell
- [Phase 06-02]: DiscoverHeroCell uses gradient placeholder while loading — better visual continuity than grey shimmer for large hero backdrop area
- Plan 07-01: useGpuTier uses module-level cache variable (not React state) so detection runs once per session even with multiple hook mounts
- Plan 07-01: scene3dStore has no persist middleware — GPU capability re-detected each session (GPU drivers, browser settings, prefers-reduced-motion can change)
- Plan 07-01: detect-gpu + @splinetool bundled together in spline-vendor chunk — share same lazy-loading boundary
- Plan 07-01: 3D/parallax layer stays MOUNTED on all routes (opacity control, not conditional render) to support camera transitions in Plan 07-04
- Plan 07-01: Scene3DProvider is a thin wrapper (not React context) — scene3dStore IS the context, avoiding React.createContext overhead

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1 considerations:**
- GitHub Pages routing strategy needs decision: HashRouter (works immediately, ugly URLs) vs. platform migration to Cloudflare Pages/Vercel (clean URLs, requires migration)
- TypeScript strict mode strategy: Start with `strict: false` for migration, enable flags incrementally to avoid chaos
- API key injection strategy validated: VITE_TMDB_API_KEY and VITE_OMDB_API_KEY injected as env vars during build in deploy.yml

**Phase 3 risk:**
- Feature parity with 25+ existing features is critical — requires explicit feature inventory validation during planning
- Existing vanilla JS app needs behavioral documentation to ensure no workflows break

**Phase 7 considerations:**
- Three.js bundle size and mobile performance require aggressive optimization (code-splitting, Draco compression, LOD, instancing)
- 3D asset pipeline needs definition during Phase 7 planning (Blender export, compression tools, format conversion)

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 07-01-PLAN.md (GPU detection, 3D capability hooks, scene3dStore, ParallaxFallback, Scene3DProvider, AppShell route-aware opacity)
Resume file: .planning/phases/07-3d-experience/07-01-SUMMARY.md
Dev server: http://localhost:5173/
