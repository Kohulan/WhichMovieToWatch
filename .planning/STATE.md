# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Instantly discover your next movie with a visually immersive experience that makes browsing feel as cinematic as watching.
**Current focus:** Phase 3 - Core Features

## Current Position

Phase: 3 of 8 (Core Features) -- IN PROGRESS
Plan: 1 of 5 in current phase (complete)
Status: Phase 3 In Progress
Last activity: 2026-02-18 — Plan 03-01 complete (movie display components + shared infrastructure)

Progress: [██████████░] 31%

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 3.4 min
- Total execution time: 0.65 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Status |
|-------|-------|-------|----------|--------|
| 01-foundation-design-system | 6 | 24 min | 4 min | Complete |
| 02-data-layer | 5/5 | 13 min | 2.6 min | Complete |
| 03-core-features | 1/5 | 4 min | 4 min | In Progress |

**Recent Trend:**
- Last 5 plans: 02-02 (2 min), 02-03 (3 min), 02-04 (2 min), 02-05 (5 min), 03-01 (4 min)
- Trend: Stable

*Updated after each plan completion*

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

Last session: 2026-02-18
Stopped at: Completed 03-01-PLAN.md (movie display components + shared infrastructure)
Resume file: .planning/phases/03-core-features/03-01-SUMMARY.md
Dev server: http://localhost:5173/
