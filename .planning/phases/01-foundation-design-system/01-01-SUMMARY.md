---
phase: 01-foundation-design-system
plan: 01
subsystem: infra
tags: [react, vite, typescript, tailwindcss, react-router, motion, zustand, lucide-react, fontsource]

# Dependency graph
requires: []
provides:
  - "React 19 + Vite 6 + TypeScript 5.7 project scaffold"
  - "Tailwind CSS v4 CSS-first configuration with @theme inline tokens"
  - "HashRouter setup for GitHub Pages SPA routing"
  - "Manual code-splitting (react-vendor, animation-vendor chunks)"
  - "Build-time env vars pattern (VITE_TMDB_API_KEY, VITE_OMDB_API_KEY)"
  - "Self-hosted Righteous and Poppins fonts"
  - "Lucide React icon system"
  - "Motion (Framer Motion) integration"
affects: [01-02, 01-03, 01-04, 01-05, 01-06, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: [react@19, react-dom@19, vite@6.4.1, typescript@5.7.3, tailwindcss@4, "@tailwindcss/vite@4", "@vitejs/plugin-react@4", motion@11, zustand@5, react-router@7, lucide-react, "@fontsource/righteous", "@fontsource/poppins"]
  patterns: ["CSS-first Tailwind v4 via @theme inline", "HashRouter with createHashRouter from react-router", "Manual chunks in vite.config.ts for vendor splitting", "oklch color space for design tokens", "import from motion/react not framer-motion", "import from react-router not react-router-dom"]

key-files:
  created: [package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, index.html, src/main.tsx, src/App.tsx, src/vite-env.d.ts, src/styles/app.css, .env.example, index.old.html]
  modified: [.gitignore]

key-decisions:
  - "Preserved old vanilla JS app as index.old.html during rewrite"
  - "strict: false in tsconfig for incremental migration"
  - "base: '/' in vite.config.ts (custom domain active via CNAME)"
  - "No tailwind.config.js or postcss.config.js (Tailwind v4 CSS-first)"

patterns-established:
  - "@theme inline for design tokens that reference runtime CSS variables"
  - "oklch color space for perceptually uniform theme colors"
  - "createHashRouter for SPA routing on GitHub Pages"
  - "motion/react imports (not framer-motion)"
  - "react-router imports (not react-router-dom)"
  - "VITE_ prefix for build-time env variable replacement"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 1 Plan 01: Project Scaffold Summary

**React 19 + Vite 6 + TypeScript 5.7 scaffold with Tailwind CSS v4 CSS-first tokens, HashRouter, code-split vendor chunks, self-hosted fonts, and Lucide icons**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T07:44:12Z
- **Completed:** 2026-02-15T07:48:19Z
- **Tasks:** 1
- **Files modified:** 14

## Accomplishments
- Complete React 19 + Vite 6 + TypeScript 5.7 project foundation with all dependencies installed
- Tailwind CSS v4 configured via @theme inline with oklch Cinema Gold Light color tokens
- Production build creates separate react-vendor (282KB) and animation-vendor (112KB) chunks
- HashRouter configured via createHashRouter for GitHub Pages SPA routing
- Self-hosted Righteous and Poppins fonts via @fontsource packages
- Lucide React Film icon and motion spring animation rendering in placeholder App component
- Dev server starts in ~175ms with HMR, production build in ~1.6s

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite + React + TypeScript project with all dependencies** - `a822b7f` (feat)

## Files Created/Modified
- `package.json` - Project manifest with all dependencies and build scripts
- `vite.config.ts` - Vite build config with Tailwind v4 plugin, React plugin, manual chunks, and path alias
- `tsconfig.json` - Root TypeScript config with project references
- `tsconfig.app.json` - App TypeScript config (ES2020, JSX react-jsx, strict:false, @/* path alias)
- `tsconfig.node.json` - Node TypeScript config for vite.config.ts
- `index.html` - Vite entry HTML with React mount point and theme flash prevention placeholder
- `src/main.tsx` - React entry with createHashRouter, font imports, and StrictMode
- `src/App.tsx` - Placeholder component with Righteous heading, Poppins body text, Lucide icon, motion animation
- `src/vite-env.d.ts` - Vite client types with TMDB/OMDB env var declarations
- `src/styles/app.css` - Tailwind v4 import with @theme inline tokens and :root Cinema Gold Light defaults
- `.env.example` - Template for TMDB and OMDB API keys
- `.gitignore` - Added node_modules/, dist/, .env.local entries
- `index.old.html` - Preserved original vanilla JS app HTML

## Decisions Made
- **Preserved old index.html as index.old.html:** The plan requires the new React app to coexist with old code during Phase 1. Renaming (not deleting) the old HTML preserves it for reference and eventual deprecation.
- **strict: false in TypeScript config:** Per project decisions, start relaxed and tighten incrementally to avoid migration chaos.
- **base: '/' in Vite config:** Custom domain whichmovieto.watch is active (CNAME file present), so root base path is correct.
- **No tailwind.config.js or postcss.config.js:** Tailwind v4 CSS-first approach via @tailwindcss/vite plugin eliminates these files entirely.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added motion import to App.tsx for animation-vendor chunk**
- **Found during:** Task 1 verification (build output check)
- **Issue:** The plan requires animation-vendor chunk to exist in production build, but motion was not imported in any code, so Vite tree-shook it out
- **Fix:** Added `motion` import and a spring animation wrapper in App.tsx placeholder, which ensures the animation-vendor chunk is created
- **Files modified:** src/App.tsx
- **Verification:** `npm run build` now outputs animation-vendor-N31zTqIi.js (111.53 kB)
- **Committed in:** a822b7f (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to meet the explicit verification requirement. The motion import also demonstrates the library works correctly with React 19.

## Issues Encountered
- `react-router@7.13.0` warns about requiring Node >= 20 (project has Node 18.20.8), but installs and works correctly at build time and runtime. No functional impact.

## User Setup Required
None - no external service configuration required. API keys are optional (.env.example provided for future use).

## Next Phase Readiness
- Project foundation complete, ready for Plan 02 (Theme System) to build on @theme tokens
- All Tailwind v4 design tokens defined as CSS custom properties, ready for theme preset overrides
- HashRouter configured, ready for route additions in later plans
- motion library integrated, ready for clay animation components
- Zustand installed, ready for theme store in Plan 02

## Self-Check: PASSED

All 13 files verified present. Commit a822b7f verified in git log. Both react-vendor and animation-vendor chunks verified in dist/assets/.

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-15*
