---
phase: 01-foundation-design-system
plan: 06
subsystem: ui
tags: [showcase, responsive-grid, deploy-workflow, vite-build, github-pages, component-gallery, visual-verification, splash-screen]

# Dependency graph
requires:
  - phase: 01-05
    provides: "RotaryDial, ThemeToggle, Navbar, AppShell, barrel export for all 12 UI components"
  - phase: 01-03
    provides: "5 clay surface components"
  - phase: 01-04
    provides: "5 metal hardware components"
provides:
  - "Showcase page: comprehensive component gallery at /src/pages/Showcase.tsx"
  - "Responsive grid layout: 1-col mobile, 2-col tablet, 3-col desktop, max-w container at large"
  - "GitHub Actions deploy workflow for Vite build with TMDB/OMDB env var injection"
  - "Route-based App.tsx with Outlet pattern for future page additions"
  - "CNAME preserved in build output via public/ directory"
  - "Splash screen with animated logo reveal and progress bar"
affects: [02-discovery-engine, 03-feature-parity, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route-based rendering: App.tsx uses Outlet, pages live in src/pages/"
    - "Showcase page as index route for design system verification"
    - "GitHub Pages deploy via actions/deploy-pages@v4 with Vite build"
    - "CNAME in public/ directory for automatic inclusion in dist/"
    - "Splash screen pattern: AnimatePresence wrap in App.tsx, auto-dismiss on progress complete"

key-files:
  created:
    - src/pages/Showcase.tsx
    - src/components/SplashScreen.tsx
    - public/CNAME
  modified:
    - src/App.tsx
    - src/main.tsx
    - .github/workflows/deploy.yml
    - src/styles/app.css
    - src/styles/metal.css
    - src/components/ui/MetalButton.tsx
    - src/components/ui/MetalDropdown.tsx
    - src/components/layout/AppShell.tsx
    - src/components/layout/Navbar.tsx

key-decisions:
  - "Route-based App.tsx with Outlet over inline component rendering for scalability"
  - "Showcase as index route (/) during Phase 1 for easy visual verification"
  - "CNAME placed in public/ rather than build-step copy for simplicity"
  - "Deploy workflow uses actions/deploy-pages@v4 (official GitHub Pages action)"
  - "Neutral warm-gray backgrounds (oklch hue 60, low chroma) instead of yellowish hue 85"
  - "Cool dark bases for dark modes (hue 250/245/290) — inspired by Linear/Vercel"
  - "Simple 3-stop top-to-bottom metal gradient (shine→base→dark) over stripy 7-stop"
  - "Multi-directional layered box-shadows for metal buttons (pre-iOS7 Apple style)"
  - "Smooth opacity crossfade for theme transitions instead of scale animation"
  - "Staggered children animation for dropdown with spring physics"

patterns-established:
  - "Pages pattern: pages live in src/pages/, imported in router definition in main.tsx"
  - "App.tsx as layout wrapper: AppShell + Outlet"
  - "Deploy pipeline: npm ci -> npm run build -> upload dist/ -> deploy pages"
  - "Splash screen auto-dismissed via onComplete callback after progress bar fills"
  - "Metal gradient: linear-gradient(to bottom, shine, base, dark) + border: dark"

# Metrics
duration: 3min + visual feedback iteration
completed: 2026-02-16
---

# Phase 1 Plan 06: Showcase Page, Deploy Workflow & Visual Polish

**Responsive component showcase, deploy workflow, splash screen, and visual feedback fixes**

## Performance

- **Duration:** ~15 min (including visual feedback iteration)
- **Tasks:** 2/2 complete (Task 2 visual verification passed with fixes)
- **Files modified:** 11
- **Feedback iterations:** 2 (color/metal/transition fixes, then metal gradient redesign)

## Accomplishments

- Comprehensive Showcase page with responsive grid (1/2/3-column at mobile/tablet/desktop)
- All 12 components demonstrated in 6 labeled sections
- App.tsx refactored to route-based Outlet pattern
- GitHub Actions deploy workflow replaced with Vite build pipeline
- CNAME preserved in build output via public/ directory

### Visual Feedback Fixes (post-checkpoint)

- **Colors:** Replaced yellowish Cinema Gold backgrounds (oklch hue 85) with neutral warm grays (hue 60, low chroma). Dark modes use cool near-black bases.
- **Metal buttons:** Redesigned from kiddish 7-stop stripy gradient to elegant 3-stop top-to-bottom gradient with multi-directional layered box-shadows (pre-iOS7 Apple style).
- **Theme transitions:** Replaced clunky scale animation with smooth 250ms opacity crossfade. Background uses `transition-colors duration-500`.
- **Dropdown:** Added staggered children animation with spring physics, clay texture, reverse stagger on exit.
- **Splash screen:** New SplashScreen component with Film icon spring-in, staggered word reveal with blur-to-focus, tagline fade, progress bar, and scale+blur exit.

## Task Commits

1. **Task 1: Showcase page + deploy workflow** — `440e022`
2. **Visual feedback fixes (colors, metal, transitions, dropdown, splash)** — `768b21a`
3. **Metal button gradient redesign** — `ffe7c9e`

## Files Created/Modified

- `src/pages/Showcase.tsx` — Component gallery with responsive grid
- `src/components/SplashScreen.tsx` — Animated splash with staggered logo reveal
- `src/App.tsx` — AppShell + Outlet + SplashScreen integration
- `src/main.tsx` — Showcase as index route
- `src/styles/app.css` — All 6 theme variants with neutral colors, wider metal contrast
- `src/styles/metal.css` — 3-stop gradient, multi-directional shadows, dark-mode text emboss
- `src/components/ui/MetalButton.tsx` — Multi-directional shadow animation values
- `src/components/ui/MetalDropdown.tsx` — Staggered children animation, clay texture panel
- `src/components/layout/AppShell.tsx` — Smooth opacity crossfade for theme changes
- `src/components/layout/Navbar.tsx` — Matching transition-colors duration
- `.github/workflows/deploy.yml` — Vite build + GitHub Pages deploy
- `public/CNAME` — Custom domain in build output

## Deviations from Plan

- Added SplashScreen component (not in original plan — user request during verification)
- Multiple visual polish iterations on metal gradient and color palette (user feedback driven)
- Theme transition changed from scale-based clay reshape to opacity crossfade (user found scale clunky)

## Next Phase Readiness

- Complete Phase 1 design system visually verified and approved
- Deploy workflow ready for CI/CD on push to main
- Route-based architecture established for Phase 2 page additions
- All 12 components + splash screen build correctly

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-16*
