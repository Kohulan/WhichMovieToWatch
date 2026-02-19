# Phase 2: Data Layer - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Build offline-first API service layer with TMDB, OMDB, and IPInfo integrations, Zustand state management, and caching strategy. This phase creates the data foundation that all feature phases (3+) consume. No UI components are built here — only services, stores, types, and hooks.

</domain>

<decisions>
## Implementation Decisions

### Caching Strategy
- Stale-while-revalidate pattern: show cached data immediately, refresh silently in background
- Mixed TTLs by data type: trending/now-playing = 30 min, movie details = 24h, search results = 1h
- Offline depth: Claude's discretion — practical level of offline browsing with cached content
- Storage engine: Claude's discretion — choose between IndexedDB and localStorage based on data volume and access patterns

### API Retry & Error Handling
- Smart retry: 3 retries for network/server errors, but if no movie matches filters, automatically relax filters (genre → any genre, rating threshold → lower) before giving up — mirrors current app's discovery loop
- Error UX: inline error state replacing content area with clear message + retry button for critical failures
- Rate limiting approach: Claude's discretion — proactive throttle or reactive backoff for TMDB's 40 req/10s limit
- OMDB enrichment timing: Claude's discretion — lazy load after card appears vs wait for all ratings

### State Shape & Persistence
- Auto-migrate existing localStorage data: detect old keys (watchedMovies, lovedMovies, notInterestedMovies, shownMovies, preferredProvider, preferredGenre, theme), import into new Zustand stores, delete old keys
- Movie history limit: Claude's discretion — practical cap to prevent repeat movies
- Store architecture: Claude's discretion — multiple stores vs single store with slices
- Enhanced taste learning: track loved + not-interested signals across genres, decades, and directors to build a taste profile that influences discovery weighting

### Region & Provider Logic
- Auto-detect via IPInfo.io + manual override in settings (useful for VPN users, expats)
- Default country: DE (Germany), updated at runtime
- Dynamic provider list fetched from TMDB per detected/selected region (not hardcoded)
- Both modes for provider display: show all providers by default, user can optionally set "My services" to highlight/prioritize theirs
- Deep links to provider: clicking a provider logo opens that service's page for the movie
- Show pricing tiers: separate Stream, Rent, Buy sections (like JustWatch)
- Highlight free providers: badge or visual indicator for free-with-ads services (Tubi, Pluto TV, etc.)
- Region change invalidates provider cache + movie availability data, triggers fresh fetch

### Claude's Discretion
- Offline browsing depth (full vs minimal)
- Storage engine choice (IndexedDB vs localStorage)
- Rate limiting implementation (proactive vs reactive)
- OMDB enrichment timing (lazy vs blocking)
- Movie history limit
- Store architecture (multiple stores vs slices)

</decisions>

<specifics>
## Specific Ideas

- "Make the whole website smooth and responsive" — data layer contributes via stale-while-revalidate (instant perceived load), optimistic UI updates, and background enrichment. Visual smoothness is Phase 5 (Animation Layer).
- Current vanilla app has 100-retry loop in api.js — replace with smart retry that relaxes filters instead of brute-forcing same request
- Provider mapping in current utils.js covers 60+ services with manual URL/logo mappings — convert to typed provider registry
- Enhanced learning goes beyond current genre-only learning: incorporate decades, directors, and negative signals (not-interested)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-data-layer*
*Context gathered: 2026-02-17*
