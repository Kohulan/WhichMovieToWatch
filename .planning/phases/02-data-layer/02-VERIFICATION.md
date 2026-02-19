---
phase: 02-data-layer
verified: 2026-02-18T00:00:00Z
status: passed
score: 5/5 success criteria verified
re_verification: false
---

# Phase 2: Data Layer Verification Report

**Phase Goal:** Build offline-first API service layer with TMDB, OMDB, and IPInfo integrations, Zustand state management, and caching strategy.
**Verified:** 2026-02-18
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Success Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | API client fetches movie data from TMDB with rate limiting protection (max 40 req/10s) | VERIFIED | `tmdbFetch` in `src/services/tmdb/client.ts` handles 429 with exponential backoff (up to 30s) and retries network errors 3 times. Research doc (line 90-94) confirms TMDB's 40 req/10s limit was disabled in Dec 2019; reactive 429 backoff is the correct and specified approach. |
| 2 | OMDB integration enriches TMDB data with IMDb ratings and Rotten Tomatoes scores | VERIFIED | `fetchOmdbRatings` in `src/services/omdb/client.ts` fetches from `omdbapi.com`, extracts `imdbRating`, Rotten Tomatoes from `Ratings` array, and `Metascore`. `useOmdbRatings` hook wires it to React. |
| 3 | IP geolocation detects user region and defaults to DE for content filtering | VERIFIED | `detectCountry()` in `src/services/ipinfo/client.ts` calls `ipinfo.io/json`, falls back to `navigator.language` locale extraction, and returns `DEFAULT_COUNTRY = 'DE'` on any failure. `useRegion` hook auto-detects on first load. |
| 4 | API responses are cached in IndexedDB, subsequent requests load from cache before network fallback | VERIFIED | `src/services/cache/db.ts` opens an IndexedDB `wmtw-cache` DB with `api-cache` store via `idb`. `cache-manager.ts` exports `getCached`/`setCache` with TTL-based staleness. All 6 TMDB services, OMDB client, and trending service follow cache-check -> fetch -> cache-store pattern. |
| 5 | Zustand store persists user preferences to localStorage and hydrates on page load | VERIFIED | Three persisted stores: `preferencesStore` (key `wmtw-preferences`), `movieHistoryStore` (key `wmtw-movie-history`), `regionStore` (key `wmtw-region`) all use `persist` + `createJSONStorage(() => localStorage)`. `useMigration` hook imports legacy vanilla app data on first load. |

**Score:** 5/5 criteria verified

---

### Observable Truths from Plan Must-Haves

#### Plan 02-01: Types and Cache Layer

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | TypeScript types exist for TMDB movie responses, watch providers with pricing tiers, regions, and user preferences | VERIFIED | `src/types/movie.ts` exports `TMDBMovie`, `TMDBMovieDetails`, `WatchProvider`, `WatchProviderCountry`, `EnrichedMovie`, `TMDBDiscoverResponse`. `src/types/provider.ts` exports `ProviderTier`, `ProviderInfo`, `MovieProviders`, `RegionProvider`. `src/types/region.ts` exports `RegionInfo`, `IPInfoResponse`. `src/types/preferences.ts` exports `TasteProfile`, `TasteSignal`, `MovieInteraction`. |
| 2 | IndexedDB database initializes with an api-cache object store and by-cached-at index | VERIFIED | `db.ts` calls `openDB<MovieCacheDB>('wmtw-cache', 1)` with upgrade handler creating `api-cache` store with `keyPath: 'key'` and `by-cached-at` index on `cachedAt`. |
| 3 | Cache manager can store, retrieve, and check staleness of cached entries using TTL | VERIFIED | `getCached` calculates `age = Date.now() - entry.cachedAt`, returns `{ value, isStale: age > entry.ttl }`. `setCache` puts entry with `cachedAt: Date.now()` and `ttlMs`. |
| 4 | Stale entries return their value with isStale=true instead of null | VERIFIED | `getCached` returns `{ value: entry.value as T, isStale }` whether stale or not — only returns `null` value when entry is missing entirely. |

#### Plan 02-02: Zustand Stores

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Movie history store tracks shown, watched, loved, and not-interested movies with 2000-entry FIFO eviction on shownMovies | VERIFIED | `MAX_SHOWN_HISTORY = 2000`. `trackShown` appends then slices `updated.slice(-MAX_SHOWN_HISTORY)` when over limit. |
| 2 | hasBeenShown checks union of shown + watched + notInterested lists | VERIFIED | `hasBeenShown` creates `new Set([...shownMovies, ...watchedMovies, ...notInterestedMovies])` and calls `.has(movieId)`. |
| 3 | Preferences store persists provider, genre, myServices, and taste profile to localStorage | VERIFIED | `usePreferencesStore` uses `persist` with key `wmtw-preferences`. All four fields present in state. |
| 4 | Region store persists detected country and manual override with effectiveRegion getter | VERIFIED | `useRegionStore` persists `detectedCountry`, `manualOverride`, `lastDetected`. `effectiveRegion()` returns `manualOverride || detectedCountry`. |
| 5 | Legacy localStorage keys are auto-migrated into Zustand stores and deleted | VERIFIED | `useMigration` reads 6 old keys, calls `importLegacy` on both stores, deletes all except `theme`, sets `wmtw-v2-migrated` flag. Idempotent. |
| 6 | Discovery and search stores hold runtime state without persistence | VERIFIED | `discoveryStore.ts` and `searchStore.ts` use plain `create()` with no `persist` middleware. |

#### Plan 02-03: Utility Modules

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Genre map provides bidirectional lookup between TMDB genre IDs and genre names | VERIFIED | `GENRE_MAP` has all 19 TMDB genres. `getGenreName(id)` and `getGenreId(name)` (case-insensitive via `REVERSE_MAP`) both exported. |
| 2 | Country names map provides ISO 3166-1 alpha-2 code to country name lookup for 200+ countries | VERIFIED | `country-names.ts` is 259 lines with ~200+ entries confirmed by line count and quote count (246). |
| 3 | Provider registry maps known providers to deep link URL patterns and free-provider detection | VERIFIED | `KNOWN_FREE_PROVIDERS` Set with 10 provider IDs. `isFreeProvider(id)` exported. Deep link returns tmdbLink as reliable fallback per research recommendation. |
| 4 | Taste engine scores movies based on accumulated signals across genres, decades, and directors | VERIFIED | `scoreTasteMatch` returns `genreScore + decadeScore + directorScore * 2`. Handles both `genre_ids` and `genres[]` input shapes. |

#### Plan 02-04: API Service Clients

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | TMDB client fetches data with API key from import.meta.env and retries 3 times with exponential backoff on 429 | VERIFIED | `tmdbFetch` reads `import.meta.env.VITE_TMDB_API_KEY`. Loop with `retries=3`. 429 triggers `Math.min(2^attempt * 1000, 30000)` delay. Network errors retry with linear backoff. |
| 2 | Discover service finds random movies with progressive filter relaxation (5 steps) | VERIFIED | `RELAXATION_STEPS` array has 5 elements (steps 0-4). Cumulative overrides applied. Recurses to `relaxationStep + 1` when no results available. |
| 3 | Movie details service fetches full details with credits, videos, and watch/providers in a single call | VERIFIED | `fetchMovieDetails` calls `/movie/${movieId}` with `append_to_response: 'watch/providers,credits,videos'`. |
| 4 | OMDB client fetches IMDb/RT ratings by IMDB ID with aggressive caching | VERIFIED | Returns any cached value regardless of staleness. Only fetches if cache value is null AND isStale is true. Caches null results to avoid re-fetching. |
| 5 | IPInfo client detects user country code, defaults to DE on failure | VERIFIED | Three-tier fallback: ipinfo.io -> navigator.language -> `'DE'`. |

#### Plan 02-05: React Hooks

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | useRandomMovie discovers a random movie excluding already-shown IDs with taste-weighted selection | VERIFIED | Calls `historyState.getExcludeSet()`, passes to `discoverMovie`. Calls `scoreTasteMatch` and `historyState.trackShown`. |
| 2 | useMovieDetails returns cached movie details immediately and refreshes stale data in background (SWR) | VERIFIED | Shows `setData(cached.value)` immediately if cached, then only shows loading indicator if no cache exists. Refreshes stale data without blocking UI. |
| 3 | useOmdbRatings lazily fetches OMDB data only for the currently displayed movie | VERIFIED | Hook fetches on `imdbId` change. Returns individual rating fields. Designed for single-movie use. |
| 4 | useSearchMovies searches TMDB with pagination | VERIFIED | `search()` calls page 1, `loadMore()` increments page and appends results. `hasMore = currentPage < totalPages`. |
| 5 | useTrending returns now-playing movies with 30-min auto-refresh | VERIFIED | `REFRESH_INTERVAL = 30 * 60 * 1000`. `setInterval(refresh, REFRESH_INTERVAL)` in useEffect. Falls back to `fetchPopular` if now_playing is empty. |
| 6 | useWatchProviders returns providers categorized by tier for a movie in the user's region | VERIFIED | Fetches `fetchMovieProviders(movieId, region)`, categorizes into flatrate/rent/buy/free/ads. Derives `myProviders` filtered by `myServices` Set. |
| 7 | useRegion detects country on first use, persists it, and supports manual override with provider cache invalidation | VERIFIED | `needsDetection()` check on mount. `setOverride` calls `invalidateByPrefix('providers-')` after updating store. |

---

### Required Artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| `src/types/movie.ts` | VERIFIED | Exports TMDBMovie, TMDBMovieDetails, WatchProvider, WatchProviderCountry, EnrichedMovie, TMDBDiscoverResponse, TMDBSearchResponse |
| `src/types/provider.ts` | VERIFIED | Exports ProviderTier, ProviderInfo, MovieProviders, RegionProvider |
| `src/types/region.ts` | VERIFIED | Exports RegionInfo, IPInfoResponse |
| `src/types/preferences.ts` | VERIFIED | Exports TasteProfile, TasteSignal, MovieInteraction |
| `src/services/cache/types.ts` | VERIFIED | Exports CacheEntry<T> interface |
| `src/services/cache/db.ts` | VERIFIED | Exports getDB() singleton, MovieCacheDB schema |
| `src/services/cache/cache-manager.ts` | VERIFIED | Exports getCached, setCache, invalidateByPrefix, evictExpired, TTL |
| `src/services/tmdb/client.ts` | VERIFIED | Exports tmdbFetch, getPosterUrl, getBackdropUrl |
| `src/services/tmdb/discover.ts` | VERIFIED | Exports discoverMovie, DiscoverFilters |
| `src/services/tmdb/details.ts` | VERIFIED | Exports fetchMovieDetails |
| `src/services/tmdb/search.ts` | VERIFIED | Exports searchMovies |
| `src/services/tmdb/trending.ts` | VERIFIED | Exports fetchNowPlaying, fetchPopular |
| `src/services/tmdb/providers.ts` | VERIFIED | Exports fetchRegionProviders, fetchMovieProviders, fetchAvailableRegions |
| `src/services/omdb/client.ts` | VERIFIED | Exports fetchOmdbRatings, OmdbRatings |
| `src/services/ipinfo/client.ts` | VERIFIED | Exports detectCountry, DEFAULT_COUNTRY |
| `src/stores/preferencesStore.ts` | VERIFIED | Exports usePreferencesStore, TasteProfile |
| `src/stores/movieHistoryStore.ts` | VERIFIED | Exports useMovieHistoryStore |
| `src/stores/regionStore.ts` | VERIFIED | Exports useRegionStore |
| `src/stores/discoveryStore.ts` | VERIFIED (with note) | Exports useDiscoveryStore. Has a TODO comment — uses local `Record<string, unknown>` alias for TMDBMovieDetails instead of importing from types. TypeScript compiles clean (tsc --noEmit passes). Functionality not impaired. |
| `src/stores/searchStore.ts` | VERIFIED (with note) | Exports useSearchStore. Has a TODO comment — defines a local TMDBMovie interface instead of importing from types. TypeScript compiles clean. Functionality not impaired. |
| `src/hooks/useMigration.ts` | VERIFIED | Exports useMigration |
| `src/hooks/useRandomMovie.ts` | VERIFIED | Exports useRandomMovie |
| `src/hooks/useMovieDetails.ts` | VERIFIED | Exports useMovieDetails |
| `src/hooks/useOmdbRatings.ts` | VERIFIED | Exports useOmdbRatings |
| `src/hooks/useSearchMovies.ts` | VERIFIED | Exports useSearchMovies |
| `src/hooks/useTrending.ts` | VERIFIED | Exports useTrending |
| `src/hooks/useWatchProviders.ts` | VERIFIED | Exports useWatchProviders, useRegionProviders |
| `src/hooks/useRegion.ts` | VERIFIED | Exports useRegion |
| `src/lib/genre-map.ts` | VERIFIED | Exports GENRE_MAP (19 genres), getGenreName, getGenreId, getAllGenres |
| `src/lib/country-names.ts` | VERIFIED | Exports COUNTRY_NAMES (200+ entries, 259 lines), getCountryName, getAllCountryCodes |
| `src/lib/provider-registry.ts` | VERIFIED | Exports PROVIDER_LOGOS_BASE, getProviderLogoUrl, isFreeProvider, getProviderDeepLink |
| `src/lib/taste-engine.ts` | VERIFIED | Exports scoreTasteMatch, getDecadeFromYear, getDecadeFromReleaseDate |

---

### Key Link Verification

| From | To | Via | Status | Evidence |
|------|-----|-----|--------|----------|
| `cache-manager.ts` | `db.ts` | `import { getDB }` | WIRED | Line 3: `import { getDB } from './db'` |
| `cache-manager.ts` | `types.ts` | `CacheEntry type` | WIRED | Line 4: `import type { CacheEntry } from './types'` |
| `useMigration.ts` | `movieHistoryStore.ts` | `getState().importLegacy()` | WIRED | Line 51: `useMovieHistoryStore.getState().importLegacy({...})` |
| `useMigration.ts` | `preferencesStore.ts` | `getState().importLegacy()` | WIRED | Line 58: `usePreferencesStore.getState().importLegacy({...})` |
| `movieHistoryStore.ts` | localStorage | `persist` key `wmtw-movie-history` | WIRED | Line 115: `name: 'wmtw-movie-history'` |
| `taste-engine.ts` | `types/preferences.ts` | `TasteProfile type` | WIRED | Line 1: `import type { TasteProfile } from '@/types/preferences'` |
| `provider-registry.ts` | (no dependency on types/provider.ts) | N/A | VERIFIED | Registry is self-contained with no type imports needed; types are inlined or primitives |
| `discover.ts` | `client.ts` | `tmdbFetch` | WIRED | Line 3: `import { tmdbFetch } from './client'` |
| `discover.ts` | `cache-manager.ts` | `getCached/setCache` | WIRED | Line 4: `import { getCached, setCache, TTL } from '@/services/cache/cache-manager'` |
| `omdb/client.ts` | `cache-manager.ts` | `TTL.OMDB_RATINGS` | WIRED | Line 3: `import { getCached, setCache, TTL }` — `TTL.OMDB_RATINGS` used on line 60 |
| `ipinfo/client.ts` | `types/region.ts` | `IPInfoResponse` | WIRED | Line 3: `import type { IPInfoResponse } from '@/types/region'` |
| `useRandomMovie.ts` | `discover.ts` | `discoverMovie` | WIRED | Line 4: `import { discoverMovie } from '@/services/tmdb/discover'` |
| `useRandomMovie.ts` | `movieHistoryStore.ts` | `getExcludeSet()` | WIRED | Line 6: `import { useMovieHistoryStore }`, used on line 24 |
| `useRandomMovie.ts` | `discoveryStore.ts` | `setCurrentMovie, setLoading` | WIRED | Line 7: `import { useDiscoveryStore }`, all setters called |
| `useRegion.ts` | `ipinfo/client.ts` | `detectCountry()` | WIRED | Line 4: `import { detectCountry } from '@/services/ipinfo/client'` |
| `useRegion.ts` | `regionStore.ts` | `effectiveRegion, setDetectedCountry` | WIRED | Line 5: `import { useRegionStore }`, all methods used |
| `useRegion.ts` | `cache-manager.ts` | `invalidateByPrefix` | WIRED | Line 6: `import { invalidateByPrefix }`, called on line 52 |
| `useOmdbRatings.ts` | `omdb/client.ts` | `fetchOmdbRatings` | WIRED | Line 3: `import { fetchOmdbRatings } from '@/services/omdb/client'` |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DISC-05 | 02-01, 02-02, 02-03, 02-04, 02-05 | Movie history tracking preventing repeats (last 1,000 movies in localStorage) | SATISFIED | `movieHistoryStore` caps `shownMovies` at 2000 entries (exceeds 1,000 requirement) with FIFO eviction. `hasBeenShown` prevents repeats. `useRandomMovie` calls `getExcludeSet()` before every discovery call. |
| DISC-06 | 02-01, 02-03, 02-04, 02-05 | IP geolocation for regional content filtering (default: DE) | SATISFIED | `detectCountry()` fetches from ipinfo.io, falls back to navigator.language, defaults to `'DE'`. `regionStore` persists detected country. `useRegion` auto-detects on first load. Provider cache keys always include region. |

No orphaned requirements — only DISC-05 and DISC-06 are mapped to Phase 2 in REQUIREMENTS.md.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/stores/discoveryStore.ts` | 3-4 | TODO comment: "Import TMDBMovieDetails once types are defined" + local `Record<string, unknown>` alias | Info | The types ARE defined in `src/types/movie.ts`. The TODO is a stale artifact from the plan's contingency instruction ("or use `any` with TODO comment if types not available yet"). TypeScript compiles clean. The `useRandomMovie` hook casts to `Record<string, unknown>` when calling `setCurrentMovie`, which works at runtime but loses type safety for `currentMovie` consumers. No functional impact but should be cleaned up in the next phase. |
| `src/stores/searchStore.ts` | 3-17 | TODO comment: "Import TMDBMovie once types are defined" + local interface definition | Info | Same as above. The local `TMDBMovie` definition is a subset of the canonical type (missing `runtime`, `original_title`, `genres`, `adult`). Compiles clean. Should be replaced with the canonical import. |
| `src/services/omdb/client.ts` | 21, 33, 41, 49 | Multiple `return null` statements | Info | Not stubs — these are legitimate guard clauses and error paths in a function that can legitimately return null (movie not found in OMDB). No impact. |

---

### Human Verification Required

#### 1. IndexedDB Persistence in Browser

**Test:** Open the app, trigger a movie discovery (which fetches details), close the browser, reopen, trigger the same movie ID's details.
**Expected:** Details load instantly from IndexedDB cache without a network request visible in DevTools.
**Why human:** IndexedDB interaction requires a real browser environment. Cannot verify persistence round-trip programmatically.

#### 2. Region Detection Flow

**Test:** Open app with fresh localStorage (no `wmtw-region` key). Watch for automatic geolocation.
**Expected:** IP detection runs once, detected country appears in the UI, and subsequent reloads skip detection (lastDetected < 24h).
**Why human:** Requires live network request to ipinfo.io and browser localStorage state inspection.

#### 3. OMDB Quota Conservation

**Test:** Display a movie with a known IMDB ID, then navigate away and return to the same movie.
**Expected:** Only one OMDB API call is made (second visit serves from IndexedDB cache). Verify in DevTools Network tab.
**Why human:** Requires real browser DevTools network inspection to confirm cache hit vs. miss.

#### 4. Legacy Migration

**Test:** Seed old localStorage keys (`watchedMovies`, `lovedMovies`, etc. as JSON arrays), then load the app.
**Expected:** `wmtw-v2-migrated` flag is set, old keys are deleted, and the Zustand stores reflect the seeded data.
**Why human:** Requires manual localStorage manipulation before app load; timing-dependent on Zustand hydration.

---

### Gaps Summary

No gaps found. All 5 success criteria are verified. All 31 expected artifacts exist with substantive implementations and correct wiring. Both requirement IDs (DISC-05, DISC-06) are satisfied.

The two TODO comments in `discoveryStore.ts` and `searchStore.ts` are informational stale artifacts from the plan's contingency instructions — they do not affect functionality, TypeScript compilation passes clean, and they have no impact on the phase goal. They are flagged for cleanup in a future phase.

---

_Verified: 2026-02-18_
_Verifier: Claude (gsd-verifier)_
