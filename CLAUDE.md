# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Which Movie To Watch** is a movie-discovery PWA at [whichmovietowatch.online](https://whichmovietowatch.online). React 19 + TypeScript + Vite 8 + Tailwind CSS 4, react-router 7 (`createBrowserRouter`), Zustand stores, motion (Framer Motion successor) animations, optional Spline 3D hero. Version 2.x replaced the old vanilla-JS app entirely.

## Development

```bash
npm install
npm run dev        # Vite dev server on :5173
npm run build      # tsc -b && vite build → dist/
npm test           # node --test tools/ (prerender + SEO unit tests)
npm run prerender  # SSG-lite: rewrites dist/ with per-route HTML (needs VITE_TMDB_API_KEY)
npm run preview    # serve the built dist/
```

API keys: create `.env.local` with `VITE_TMDB_API_KEY=…` and `VITE_OMDB_API_KEY=…`.

## Architecture

- `src/main.tsx` — `createBrowserRouter` route table; pages lazy-loaded except HomePage.
- `src/pages/` — thin route components; heavy UI lives in `src/components/<feature>/`.
- Routes: `/` (bento home), `/discover`, `/movie/:slug`, `/browse`, `/trending`, `/what-to-watch-tonight`, `/movies/genre/:genreSlug`, `/streaming/:providerSlug`, `/dinner-time`, `/free-movies`, `/privacy` (+ `/showcase` dev-only).
- `src/services/tmdb/` — TMDB API client (`tmdbFetch`) + endpoint modules; `src/services/cache/cache-manager.ts` — IndexedDB cache with TTLs.
- `src/stores/` — Zustand stores (browse, discovery, region, theme, preferences…). Persisted state lives in localStorage/IndexedDB; no backend, no accounts.
- `src/seo/seo-content.json` — single source of truth for all SEO routes (titles, descriptions, intros). `src/seo/meta.ts` is the typed accessor for lazy pages; it inlines the whole JSON, so eager modules (HomePage, `<Seo>`) must import from `src/seo/site.ts` instead, which gets just the site block + home route via the `virtual:seo-eager` plugin in vite.config.ts. `<Seo>` (`src/components/seo/Seo.tsx`) sets head tags via React 19 metadata hoisting.
- `tools/` — dependency-free Node prerender pipeline (`tools/prerender.mjs` + `tools/lib/*.mjs`, tested with `node --test`). Runs after `vite build` in CI; writes per-route HTML with JSON-LD + static content, `sitemap.xml`, `robots.txt`. Shared modules (`slug.mjs`, `jsonld.mjs`) are imported by BOTH the app and the pipeline — keep them dependency-free.
- PWA: vite-plugin-pwa (generateSW, registerType autoUpdate — SW updates activate immediately; never reintroduce "prompt", it pins users to stale builds); navigations are NetworkFirst with /offline.html fallback (navigateFallback must stay explicitly null — the plugin defaults it to index.html); the Spline chunk is never precached.

## SEO invariants (do not break)

- Canonical origin is the apex: `https://whichmovietowatch.online` (www redirects to it).
- Every route must keep a real path URL (no hash routing) and a unique `<Seo>` block.
- Internal navigation uses `<Link>` (real anchors) — never bare `onClick={navigate}` for primary nav.
- Movie URLs: `/movie/<kebab-title>-<tmdbId>`; the ID is parsed from the trailing segment.
- New indexable routes must be added to `src/seo/seo-content.json` (the prerender script, sitemap, and React router all derive from it). Note: the SiteFooter link graph was removed at the user's request (2026-07-18) — genre/provider hub pages are now discoverable only via sitemap.xml; do not re-add the footer without asking.
- `public/404.html` + the boot script in `index.html` implement the GitHub Pages SPA fallback and legacy `/#/…` redirects.
- tools/lib/html.mjs uses function-based replacers everywhere dynamic text enters String.replace — $ sequences in movie titles corrupt output otherwise; keep it that way.

## Deployment

`.github/workflows/deploy.yml`: on push to `main`, daily cron (04:23 UTC), or manual dispatch → `npm ci && npm test && npm run build && npm run prerender` → deploy `dist/` to GitHub Pages. TMDB fetch failures fall back to a cached snapshot (`actions/cache`).

## Conventions

- Functions/hooks camelCase, components/classes PascalCase, CSS via Tailwind utilities + `--clay-*`/`--accent` theme tokens in `src/styles/app.css` (3 presets × light/dark).
- Formatter: `npx prettier --write`. TS `strict: false` (tighten incrementally). Path alias `@/*` → `src/*`.
- Default region `DE`, updated at runtime via IPinfo geolocation; provider hub pages pin `region: "US"` for stable content.
- Git commits: no Co-Authored-By trailers.
