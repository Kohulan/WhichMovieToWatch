---
phase: 08-polish-optimization
plan: 04
subsystem: ui
tags: [privacy, analytics, csp, security, react-router, simple-analytics]

# Dependency graph
requires:
  - phase: 08-01
    provides: accessibility and contrast fixes applied
  - phase: 08-02
    provides: image optimization complete
  - phase: 08-03
    provides: social sharing and metadata

provides:
  - /privacy route with comprehensive policy content
  - Simple Analytics cookieless page-view tracking with hash mode
  - Content Security Policy meta tag restricting resources to trusted domains
  - Footer privacy link updated to SPA route (no external navigation)

affects: [future phases adding new external domains must update CSP connect-src]

# Tech tracking
tech-stack:
  added: [Simple Analytics CDN (manual script injection, no npm package)]
  patterns:
    - useEffect script injection for third-party analytics (no React wrapper package)
    - CSP meta tag after FOUC inline script (meta-tag CSP only applies to subsequent content)
    - wasm-unsafe-eval narrowly scoped for Spline WebAssembly compilation

key-files:
  created:
    - src/pages/PrivacyPage.tsx
  modified:
    - src/main.tsx
    - src/App.tsx
    - src/components/layout/TabBar.tsx
    - index.html

key-decisions:
  - "Simple Analytics injected via useEffect manual script (not @simpleanalytics/react — not installed) with data-mode=hash for HashRouter"
  - "CSP meta tag placed AFTER inline FOUC script — meta-tag CSP only applies to content loaded after it in document"
  - "wasm-unsafe-eval added to script-src for Spline WebAssembly (deviation Rule 1 — required for correctness)"
  - "TabBar Privacy link changed from <a href=/privacy.html> to react-router Link to=/privacy"

patterns-established:
  - "Analytics script cleanup on React unmount guards against StrictMode double-invoke"
  - "CSP placement comment documents why tag is after inline script — preserves rationale for future editors"

requirements-completed: [PRIV-01, PRIV-02, SECU-01]

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 08 Plan 04: Privacy Policy, Simple Analytics, and CSP Summary

**Privacy policy React page at /privacy, cookieless Simple Analytics with hash mode, and CSP meta tag restricting scripts/connections to trusted domains**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-19T19:07:14Z
- **Completed:** 2026-02-19T19:12:19Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments

- Created full privacy policy page at `/#/privacy` route with comprehensive sections: data collection, third-party services, analytics, cookies, external links, children's privacy, user rights, changes, and contact
- Integrated Simple Analytics via manual `useEffect` script injection with `data-mode="hash"` for HashRouter navigation tracking — no npm package needed
- Added CSP meta tag to `index.html` placed after the FOUC prevention script, allowing inline script to run while restricting all subsequent resource loading to trusted domains
- Updated TabBar footer Privacy link from `<a href="/privacy.html">` to react-router `<Link to="/privacy">` keeping navigation within the SPA

## Task Commits

Each task was committed atomically:

1. **Task 1: Privacy page, Simple Analytics, footer link** - `3f7018a` (feat)
2. **Task 2: Content Security Policy meta tag** - `91ad29f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/pages/PrivacyPage.tsx` - Full privacy policy page with clay-styled layout, all required sections, back navigation via Link
- `src/main.tsx` - Added PrivacyPage import and `{ path: 'privacy', element: <PrivacyPage /> }` route in createHashRouter
- `src/App.tsx` - Added `useEffect` for Simple Analytics manual script injection with hash mode and cleanup on unmount
- `src/components/layout/TabBar.tsx` - Replaced `<a href="/privacy.html">` with react-router `<Link to="/privacy">`, imported Link
- `index.html` - Added CSP meta tag after FOUC script with all required directives

## Decisions Made

- **Simple Analytics via manual useEffect:** `@simpleanalytics/react` was not installed. Used manual DOM script injection per the plan's fallback instructions. `data-mode="hash"` attribute set on the script element for HashRouter navigation tracking. Cleanup function guards against React StrictMode double-invoke.
- **CSP placement after FOUC script:** Meta-tag CSP only applies to content loaded after it in the document. The FOUC theme initializer inline script is placed before the CSP tag so it runs unconstrained. This is by design.
- **`wasm-unsafe-eval` in script-src:** Spline runtime bundles WebAssembly modules (boolean.js, navmesh.js, physics.js). Without `wasm-unsafe-eval`, the 3D scene would fail to load on pages with CSP active. Added narrowly scoped per plan instructions.
- **`unsafe-inline` in style-src:** Required for Tailwind v4 (CSS-first, injects styles at runtime) and Framer Motion (injects transform styles). Cannot be eliminated without significant architectural changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `wasm-unsafe-eval` to CSP script-src**
- **Found during:** Task 2 (CSP implementation)
- **Issue:** Spline runtime uses WebAssembly compilation in `boolean.js`, `navmesh.js`, `physics.js`. CSP blocks WebAssembly evaluation by default without `wasm-unsafe-eval`. 3D scene would fail silently on devices where Spline loads.
- **Fix:** Added `'wasm-unsafe-eval'` to `script-src` directive. This is a narrow allowance (WASM only, not JS eval) specifically for the Spline WebAssembly modules.
- **Files modified:** `index.html`
- **Verification:** Build succeeded, TypeScript passed. Plan explicitly mentioned "If Spline runtime needs additional CSP relaxation (e.g., wasm-unsafe-eval), add it narrowly scoped."
- **Committed in:** `91ad29f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug/correctness)
**Impact on plan:** Required for 3D scene to load under CSP. Plan explicitly anticipated this case and authorized it.

## Issues Encountered

None — TypeScript compiled cleanly on both tasks. Vite build succeeded.

## User Setup Required

None - no external service configuration required. Simple Analytics tracking is automatic once the script loads. No dashboard or API key setup needed for anonymous page-view tracking.

## Next Phase Readiness

All three requirements completed: PRIV-01 (privacy page), PRIV-02 (analytics), SECU-01 (CSP).
Phase 08 plan 04 of 5 complete. One plan remaining in Phase 8.

If new external domains are added to the app in future (e.g., new CDN, new API), the CSP `connect-src` or `script-src` in `index.html` must be updated accordingly.

## Self-Check: PASSED

- FOUND: `src/pages/PrivacyPage.tsx` (verified via ls)
- FOUND: `src/main.tsx` with privacy route (grep count: 1)
- FOUND: `src/App.tsx` with simpleanalyticscdn (grep count: 2)
- FOUND: `src/components/layout/TabBar.tsx` updated with Link
- FOUND: `index.html` with CSP meta tag (grep count: 1)
- FOUND: commit `3f7018a` (Task 1)
- FOUND: commit `91ad29f` (Task 2)

---
*Phase: 08-polish-optimization*
*Completed: 2026-02-19*
