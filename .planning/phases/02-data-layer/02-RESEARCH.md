# Phase 2: Data Layer - Research

**Researched:** 2026-02-17
**Domain:** API service layer, state management, offline caching, TMDB/OMDB/IPInfo integration
**Confidence:** HIGH

## Summary

Phase 2 builds the headless data foundation for the movie discovery app: typed API clients for TMDB, OMDB, and IPInfo; Zustand stores with localStorage persistence (preferences) and IndexedDB caching (API responses); and React hooks that feature phases (3+) consume. No UI components are built -- only services, stores, types, and hooks.

The core architectural challenge is bridging the existing vanilla JS patterns (60+ hardcoded provider URLs, 100-retry brute-force loops, global mutable state) into a typed, cache-aware, offline-friendly React data layer. The existing app stores seven distinct localStorage keys (`watchedMovies`, `lovedMovies`, `notInterestedMovies`, `shownMovies`, `preferredProvider`, `preferredGenre`, `theme`) that must be auto-migrated into new Zustand stores on first load, then deleted.

**Primary recommendation:** Use multiple focused Zustand stores (not slices) with `persist` middleware for user preferences in localStorage, and a separate `idb` (Jake Archibald, v8) cache layer for API response caching with TTL-based stale-while-revalidate. Keep stores small, purpose-specific, and independently testable.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Caching Strategy
- Stale-while-revalidate pattern: show cached data immediately, refresh silently in background
- Mixed TTLs by data type: trending/now-playing = 30 min, movie details = 24h, search results = 1h
- Offline depth: Claude's discretion -- practical level of offline browsing with cached content
- Storage engine: Claude's discretion -- choose between IndexedDB and localStorage based on data volume and access patterns

#### API Retry & Error Handling
- Smart retry: 3 retries for network/server errors, but if no movie matches filters, automatically relax filters (genre -> any genre, rating threshold -> lower) before giving up -- mirrors current app's discovery loop
- Error UX: inline error state replacing content area with clear message + retry button for critical failures
- Rate limiting approach: Claude's discretion -- proactive throttle or reactive backoff for TMDB's 40 req/10s limit
- OMDB enrichment timing: Claude's discretion -- lazy load after card appears vs wait for all ratings

#### State Shape & Persistence
- Auto-migrate existing localStorage data: detect old keys (watchedMovies, lovedMovies, notInterestedMovies, shownMovies, preferredProvider, preferredGenre, theme), import into new Zustand stores, delete old keys
- Movie history limit: Claude's discretion -- practical cap to prevent repeat movies
- Store architecture: Claude's discretion -- multiple stores vs single store with slices
- Enhanced taste learning: track loved + not-interested signals across genres, decades, and directors to build a taste profile that influences discovery weighting

#### Region & Provider Logic
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

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISC-05 | Movie history tracking preventing repeats (last 1,000 movies in localStorage) | Zustand `persist` middleware with `partialize` stores shownMovies array in localStorage; `hasMovieBeenShown()` checks union of shown + watched + notInterested; cap at 2,000 with FIFO eviction |
| DISC-06 | IP geolocation for regional content filtering (default: DE) | IPInfo.io free tier (unauthenticated: 1,000 req/day shared limit; sufficient for client-side SPA), cached result in Zustand regionStore, manual override support, fallback to navigator.language |

</phase_requirements>

## Discretion Recommendations

### Storage Engine: IndexedDB (via `idb`) for API cache, localStorage for preferences

**Recommendation:** Use a **hybrid approach**.

- **localStorage** (via Zustand `persist`): User preferences, theme, movie history (shownMovies, lovedMovies, watchedMovies, notInterestedMovies, preferredProvider, preferredGenre, taste profile). These are small JSON objects (< 100KB even at 2,000 movie IDs) and need synchronous hydration to avoid UI flash.
- **IndexedDB** (via `idb` v8): API response cache (movie details, search results, trending data, provider lists). These are larger, more numerous, and benefit from structured storage with TTL metadata. IndexedDB has no practical size limit (typically 50%+ of disk), vs localStorage's 5-10MB cap.

**Why not IndexedDB for everything:** Zustand's persist middleware works best with synchronous storage. IndexedDB is async, which means the store hydrates in a microtask -- during initial render, persisted values are unavailable. For preferences that affect first paint (theme, region), localStorage is essential. The existing `themeStore.ts` already uses `createJSONStorage(() => localStorage)`, establishing this pattern.

**Why not localStorage for API cache:** Movie detail responses are ~2-5KB each. Caching 500 movie details = 1-2.5MB. Add search results, provider lists, and trending data, and we could exceed localStorage's ~5MB limit. IndexedDB scales to gigabytes.

**Confidence:** HIGH -- this is the standard hybrid pattern for offline-first SPAs.

### Rate Limiting: Reactive backoff (not proactive throttle)

**Recommendation:** Use **reactive exponential backoff** on 429 responses.

TMDB's original 40 req/10s rate limit was **disabled in December 2019**. Current limits sit around 50 req/s with CDN-level DDOS protection. For a client-side SPA making sequential user-initiated requests, hitting rate limits is virtually impossible. A proactive token-bucket throttle would add complexity for zero benefit.

Implementation: If a 429 is received, wait `Math.min(2^attempt * 1000, 30000)ms` before retrying, up to 3 attempts. Log the event for monitoring.

**Confidence:** HIGH -- verified via TMDB official docs and community discussions.

### OMDB Enrichment: Lazy load after card render

**Recommendation:** Use **lazy loading** -- fetch OMDB ratings after the movie card is visible.

Rationale:
1. OMDB free tier is limited to **1,000 requests/day**. Blocking on OMDB before showing a movie wastes budget on movies the user might immediately skip.
2. TMDB's own `vote_average` is sufficient for initial display. IMDb/RT ratings are enrichment, not essential.
3. Lazy loading matches the stale-while-revalidate philosophy: show what you have immediately, enrich in background.
4. The existing vanilla app already fetches OMDB ratings independently via `fetchExternalRatings()` after the movie card renders.

Implementation: Expose a `useOmdbRatings(tmdbMovieId)` hook that returns `{ imdbRating, rottenTomatoes, isLoading }`. Cache results in IndexedDB with 24h TTL (ratings rarely change).

**Confidence:** HIGH -- aligns with existing app behavior and OMDB rate limits.

### Movie History Limit: 2,000 entries

**Recommendation:** Cap `shownMovies` at **2,000** entries with FIFO eviction.

Rationale: The existing app uses 1,000. With the enhanced taste learning (tracking across genres, decades, directors), each movie interaction stores more metadata. 2,000 gives excellent repeat-prevention coverage while keeping localStorage usage under 50KB for the history array (2,000 numeric IDs * ~10 bytes = ~20KB). The `watchedMovies`, `lovedMovies`, and `notInterestedMovies` arrays are uncapped but naturally grow slower (user must explicitly act).

**Confidence:** MEDIUM -- reasonable estimate, but actual user behavior may vary. Easy to adjust later.

### Store Architecture: Multiple focused stores

**Recommendation:** Use **4 separate Zustand stores** rather than a single store with slices.

| Store | Persisted | Storage | Purpose |
|-------|-----------|---------|---------|
| `useThemeStore` | Yes | localStorage | Already exists from Phase 1. Theme mode + preset. |
| `usePreferencesStore` | Yes | localStorage | preferredProvider, preferredGenre, myServices[], taste profile |
| `useMovieHistoryStore` | Yes | localStorage | shownMovies, watchedMovies, lovedMovies, notInterestedMovies |
| `useRegionStore` | Yes | localStorage | detectedCountry, manualOverride, lastDetected timestamp |

Additionally, non-persisted runtime stores:
| Store | Persisted | Purpose |
|-------|-----------|---------|
| `useDiscoveryStore` | No | Current movie, loading/error state, filter relaxation state |
| `useSearchStore` | No | Search query, results, pagination, active filters |

**Why multiple stores over slices:**
1. The Zustand docs state: "If two things are totally isolated, multiple stores would be good." Our stores are independent domains -- theme, preferences, history, region.
2. Each store has its own `persist` configuration (name, version, migrate). Applying persist to a combined store means serializing/deserializing everything on every change.
3. Multiple stores are marginally more performant than slices (components subscribe to specific stores, not the entire state tree).
4. Easier to test, migrate, and reason about independently.
5. Phase 1 already established the `useThemeStore` pattern -- extending it is natural.

**Confidence:** HIGH -- verified against Zustand official docs and community consensus.

### Offline Depth: Practical minimal

**Recommendation:** Cache **last-viewed movie details and last search results** for offline browsing. Do not proactively cache movies the user hasn't seen.

Rationale:
1. Movie discovery is inherently online (random selection requires API access).
2. Caching movie details the user has viewed enables offline access to their recently browsed content.
3. Provider availability is region-specific and changes daily -- stale provider data is misleading.
4. The stale-while-revalidate pattern already provides "offline-ish" behavior: cached data shows while the app attempts to refresh.

What gets cached in IndexedDB:
- Movie details (with poster URL): 24h TTL, up to ~200 entries (LRU eviction)
- Trending/now-playing list: 30min TTL, single entry per region
- Search results: 1h TTL, keyed by query+filters hash
- Provider list per region: 24h TTL, single entry per region
- OMDB ratings: 24h TTL, keyed by TMDB movie ID

**Confidence:** MEDIUM -- reasonable for a movie discovery app. Full offline-first (like a note-taking app) would require proactive caching that doesn't match the use case.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | ^5.0.0 | State management with persist middleware | Already in project (Phase 1). Lightweight, TypeScript-first, persist middleware built-in. |
| `idb` | ^8.0.3 | IndexedDB wrapper with Promises | ~1.19KB brotli. Mirrors IndexedDB API with small usability improvements. TypeScript-typed databases via `DBSchema`. Industry standard by Jake Archibald. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zustand/middleware` | (bundled) | `persist`, `devtools` | All persisted stores |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `idb` | `idb-keyval` (~600B) | Simpler key-value only API, no object stores/indexes/cursors. Sufficient if we never need to query by TTL. idb is more future-proof. |
| `idb` | `zustand-indexeddb` (v0.1.1) | Purpose-built for Zustand but only 9 GitHub stars, v0.1.1 released Dec 2025. Too immature for production. |
| `idb` | raw IndexedDB API | No library needed, but verbose callback-heavy API. idb adds 1.19KB for dramatically better DX. |
| Custom SWR | `swr` or `@tanstack/react-query` | Full-featured data fetching libraries. But we already have Zustand for state and want fine control over TMDB-specific retry/filter relaxation logic. Adding another state layer creates confusion. |

**Installation:**
```bash
npm install idb
```

Note: `zustand` is already installed (^5.0.0 in package.json).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/           # API clients (no React, pure async functions)
│   ├── tmdb/
│   │   ├── client.ts          # Base TMDB HTTP client with retry logic
│   │   ├── discover.ts        # Discover/random movie with filter relaxation
│   │   ├── details.ts         # Movie details, credits, videos
│   │   ├── search.ts          # Search movies by query
│   │   ├── trending.ts        # Now playing / popular
│   │   ├── providers.ts       # Watch providers by region
│   │   └── types.ts           # TMDB response types
│   ├── omdb/
│   │   ├── client.ts          # OMDB HTTP client
│   │   └── types.ts           # OMDB response types
│   ├── ipinfo/
│   │   └── client.ts          # IPInfo geolocation client
│   └── cache/
│       ├── db.ts              # IndexedDB schema + connection (idb)
│       ├── cache-manager.ts   # TTL-based get/set/evict with SWR
│       └── types.ts           # Cache entry types (value + metadata)
├── stores/             # Zustand stores (React state)
│   ├── themeStore.ts          # [EXISTS] Theme mode + preset
│   ├── preferencesStore.ts    # Provider, genre, taste profile
│   ├── movieHistoryStore.ts   # Shown/watched/loved/notInterested
│   ├── regionStore.ts         # Detected country, manual override
│   ├── discoveryStore.ts      # Current movie, loading, error (non-persisted)
│   └── searchStore.ts         # Search state (non-persisted)
├── hooks/              # React hooks consuming stores + services
│   ├── useTheme.ts            # [EXISTS] Theme hook
│   ├── useRandomMovie.ts      # Discovery with filter relaxation
│   ├── useMovieDetails.ts     # Movie details with SWR cache
│   ├── useOmdbRatings.ts      # Lazy OMDB enrichment
│   ├── useSearchMovies.ts     # Search with pagination
│   ├── useTrending.ts         # Trending/now-playing with auto-refresh
│   ├── useWatchProviders.ts   # Providers for movie + region
│   ├── useRegion.ts           # Region detection + override
│   └── useMigration.ts        # One-time localStorage migration
├── types/              # Shared TypeScript types
│   ├── movie.ts               # Unified movie type (TMDB + OMDB enrichment)
│   ├── provider.ts            # Provider with URLs, pricing tiers, free badge
│   ├── region.ts              # Region types
│   └── preferences.ts         # User preference types
└── lib/                # Pure utility functions
    ├── provider-registry.ts   # Typed provider URL/logo/deep-link mapping
    ├── genre-map.ts           # Genre ID <-> name mapping
    ├── country-names.ts       # ISO country code <-> name
    └── taste-engine.ts        # Taste profile scoring algorithm
```

### Pattern 1: TMDB API Client with Typed Responses

**What:** A base HTTP client that handles authentication, error mapping, and retry logic for all TMDB endpoints.
**When to use:** Every TMDB API call.

```typescript
// src/services/tmdb/client.ts
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBError {
  status_code: number;
  status_message: string;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
  retries = 3
): Promise<T> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url.toString());

      if (response.status === 429) {
        // Rate limited -- exponential backoff
        const delay = Math.min(2 ** attempt * 1000, 30_000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const error: TMDBError = await response.json();
        throw new Error(`TMDB ${response.status}: ${error.status_message}`);
      }

      return await response.json() as T;
    } catch (err) {
      if (attempt === retries) throw err;
      // Network error -- retry after delay
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error('TMDB request failed after retries');
}
```

### Pattern 2: IndexedDB Cache with TTL and SWR

**What:** A cache layer that stores API responses in IndexedDB with per-entry TTL, supporting stale-while-revalidate reads.
**When to use:** All API responses that should be cached.

```typescript
// src/services/cache/db.ts
import { openDB, type DBSchema } from 'idb';

interface CacheEntry<T = unknown> {
  value: T;
  cachedAt: number;    // Date.now() when cached
  ttl: number;         // milliseconds
  key: string;
}

interface MovieCacheDB extends DBSchema {
  'api-cache': {
    key: string;
    value: CacheEntry;
    indexes: {
      'by-cached-at': number;
    };
  };
}

const DB_NAME = 'wmtw-cache';
const DB_VERSION = 1;

function getDB() {
  return openDB<MovieCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('api-cache', { keyPath: 'key' });
      store.createIndex('by-cached-at', 'cachedAt');
    },
  });
}

// src/services/cache/cache-manager.ts
export async function getCached<T>(key: string): Promise<{
  value: T | null;
  isStale: boolean;
}> {
  const db = await getDB();
  const entry = await db.get('api-cache', key);

  if (!entry) return { value: null, isStale: true };

  const age = Date.now() - entry.cachedAt;
  const isStale = age > entry.ttl;

  return { value: entry.value as T, isStale };
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlMs: number
): Promise<void> {
  const db = await getDB();
  await db.put('api-cache', {
    key,
    value,
    cachedAt: Date.now(),
    ttl: ttlMs,
  });
}

// TTL constants
export const TTL = {
  TRENDING: 30 * 60 * 1000,       // 30 minutes
  MOVIE_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_RESULTS: 60 * 60 * 1000,     // 1 hour
  PROVIDER_LIST: 24 * 60 * 60 * 1000, // 24 hours
  OMDB_RATINGS: 24 * 60 * 60 * 1000,  // 24 hours
} as const;
```

### Pattern 3: SWR Hook Pattern (Cache + Background Refresh)

**What:** A React hook that returns cached data immediately while refreshing in the background.
**When to use:** Any data-fetching hook.

```typescript
// src/hooks/useMovieDetails.ts
import { useState, useEffect, useCallback } from 'react';
import { getCached, setCache, TTL } from '@/services/cache/cache-manager';
import { fetchMovieDetails } from '@/services/tmdb/details';
import type { MovieDetails } from '@/types/movie';

export function useMovieDetails(movieId: number | null) {
  const [data, setData] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithSWR = useCallback(async (id: number) => {
    const cacheKey = `movie-details-${id}`;

    // 1. Show cached data immediately
    const cached = await getCached<MovieDetails>(cacheKey);
    if (cached.value) {
      setData(cached.value);
      // If not stale, we're done
      if (!cached.isStale) return;
    }

    // 2. Fetch fresh data (in background if we had cached data)
    if (!cached.value) setIsLoading(true);

    try {
      const fresh = await fetchMovieDetails(id);
      setData(fresh);
      await setCache(cacheKey, fresh, TTL.MOVIE_DETAILS);
    } catch (err) {
      // Only set error if we had no cached fallback
      if (!cached.value) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (movieId) fetchWithSWR(movieId);
  }, [movieId, fetchWithSWR]);

  return { data, isLoading, error };
}
```

### Pattern 4: localStorage Migration

**What:** One-time migration of existing vanilla app localStorage keys into Zustand stores.
**When to use:** On first app load after the React rewrite ships.

```typescript
// src/hooks/useMigration.ts
const OLD_KEYS = [
  'watchedMovies', 'lovedMovies', 'notInterestedMovies',
  'shownMovies', 'preferredProvider', 'preferredGenre', 'theme'
] as const;

const MIGRATION_FLAG = 'wmtw-v2-migrated';

export function useMigration() {
  useEffect(() => {
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    // Read old data
    const oldData = {
      watchedMovies: safeParseJSON<number[]>(localStorage.getItem('watchedMovies'), []),
      lovedMovies: safeParseJSON<number[]>(localStorage.getItem('lovedMovies'), []),
      notInterestedMovies: safeParseJSON<number[]>(localStorage.getItem('notInterestedMovies'), []),
      shownMovies: safeParseJSON<number[]>(localStorage.getItem('shownMovies'), []),
      preferredProvider: localStorage.getItem('preferredProvider'),
      preferredGenre: localStorage.getItem('preferredGenre'),
    };

    // Import into Zustand stores
    const historyStore = useMovieHistoryStore.getState();
    historyStore.importLegacy(oldData);

    const preferencesStore = usePreferencesStore.getState();
    preferencesStore.importLegacy(oldData);

    // Delete old keys
    for (const key of OLD_KEYS) {
      localStorage.removeItem(key);
    }

    // Mark migration complete
    localStorage.setItem(MIGRATION_FLAG, String(Date.now()));
  }, []);
}
```

### Pattern 5: Smart Discovery with Filter Relaxation

**What:** Movie discovery that relaxes filters progressively instead of brute-force retrying.
**When to use:** The main "find me a movie" flow.

```typescript
// src/services/tmdb/discover.ts
interface DiscoverFilters {
  genreId?: string;
  providerId?: number;
  minRating: number;
  minVoteCount: number;
  region: string;
}

const RELAXATION_STEPS: Array<Partial<DiscoverFilters>> = [
  {},                                          // Step 0: Original filters
  { minRating: 5.5, minVoteCount: 200 },       // Step 1: Lower quality bar
  { genreId: undefined },                      // Step 2: Remove genre
  { minRating: 5.0, minVoteCount: 50 },        // Step 3: Further lower bar
  { providerId: undefined },                   // Step 4: Remove provider filter
];

async function discoverMovie(
  filters: DiscoverFilters,
  excludeIds: Set<number>,
  relaxationStep = 0
): Promise<TMDBMovieResult | null> {
  const relaxed = { ...filters, ...RELAXATION_STEPS[relaxationStep] };

  // Build TMDB discover URL with relaxed filters
  const results = await tmdbFetch<TMDBDiscoverResponse>('/discover/movie', {
    sort_by: 'popularity.desc',
    'vote_count.gte': relaxed.minVoteCount,
    'vote_average.gte': relaxed.minRating,
    include_adult: 'false',
    page: String(Math.floor(Math.random() * 20) + 1),
    ...(relaxed.genreId && { with_genres: relaxed.genreId }),
    ...(relaxed.providerId && {
      with_watch_providers: String(relaxed.providerId),
      watch_region: relaxed.region,
    }),
  });

  // Filter out already-shown movies
  const available = results.results.filter(m => !excludeIds.has(m.id));

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Relax filters if more steps available
  if (relaxationStep < RELAXATION_STEPS.length - 1) {
    return discoverMovie(filters, excludeIds, relaxationStep + 1);
  }

  return null; // No movie found even after full relaxation
}
```

### Anti-Patterns to Avoid

- **Storing API responses in Zustand:** Zustand is for UI state, not API cache. API responses go in IndexedDB via the cache layer. Zustand stores only hold references (movie IDs) and derived state (current movie to display).
- **100-retry loop:** The existing vanilla app retries up to 100 times with the same parameters. The new system uses at most 3 network retries + 5 filter relaxation steps = 15 max API calls per discovery attempt.
- **Hardcoded provider lists:** The existing `preferences.js` has 8 hardcoded providers. The new system fetches the provider list dynamically from TMDB's `/watch/providers/movie` endpoint per region.
- **Global mutable state:** The existing app uses `let userCountry = 'DE'` and a `preferences` object mutated everywhere. All state moves into Zustand stores with immutable updates.
- **Blocking on OMDB before render:** OMDB has a 1,000 req/day limit. Never block the movie card on OMDB data -- show TMDB data immediately, enrich lazily.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB wrapper | Custom Promise wrapper around IDBRequest | `idb` v8 | IndexedDB's raw API is callback-based with ~20 edge cases around transaction auto-closing, version upgrades, and error handling. idb handles all of these in 1.19KB. |
| JSON serialization for IndexedDB | Custom serializer | `idb` direct storage | IndexedDB natively stores structured-clone-compatible objects. No JSON.stringify/parse needed -- just put/get objects directly. |
| Zustand persistence | Custom localStorage sync | `zustand/middleware` `persist` | Handles hydration timing, version migration, selective field persistence (partialize), and storage abstraction. |
| Provider deep links | Manual URL construction | Typed provider registry with TMDB logo_path | TMDB provides logo_path for all providers. Deep links follow predictable patterns per provider. Build a typed registry once. |
| Country name lookup | Inline country code map | Reuse existing `countryNames` object from utils.js | The existing app has a complete 200+ country ISO-to-name mapping. Convert to a TypeScript module. |

**Key insight:** The most dangerous hand-roll temptation is building a custom SWR/React Query clone. Resist it. The cache-manager + hook pattern above gives us exactly what we need without the abstraction overhead. Each hook is 30-50 lines and completely transparent.

## Common Pitfalls

### Pitfall 1: Zustand Async Hydration Flash

**What goes wrong:** With async storage (IndexedDB), Zustand stores hydrate in a microtask. Components render with default state first, then re-render with persisted state, causing a visible flash.
**Why it happens:** IndexedDB reads are asynchronous. The store's initial state is used during the first synchronous render.
**How to avoid:** Use localStorage (synchronous) for all stores that affect first paint (theme, preferences). Use IndexedDB only for the API cache layer, which is accessed via hooks that handle loading states.
**Warning signs:** Theme flickering on page load, preferences resetting momentarily.

### Pitfall 2: OMDB Daily Limit Exhaustion

**What goes wrong:** The free OMDB API key allows only 1,000 requests per day. Aggressive fetching (e.g., fetching ratings for all 20 search results simultaneously) can exhaust the daily quota within minutes of active use.
**Why it happens:** Each movie card triggers an OMDB lookup if not cached.
**How to avoid:** Lazy-load OMDB only for the currently displayed movie. Cache aggressively with 24h TTL in IndexedDB. Never fetch OMDB for movie lists (search results, trending) -- only for the detail view.
**Warning signs:** OMDB returns 401 errors, ratings show "N/A" for all movies.

### Pitfall 3: TMDB `with_watch_providers` Without `watch_region`

**What goes wrong:** Using `with_watch_providers` in the discover endpoint without `watch_region` returns unpredictable results (may use server's region or return no filtering at all).
**Why it happens:** TMDB requires both parameters together for meaningful provider filtering.
**How to avoid:** Always pair `with_watch_providers` with `watch_region` in discover queries. Validate at the API client level.
**Warning signs:** Movies shown as "available on Netflix" but the user can't find them on Netflix in their country.

### Pitfall 4: Stale Provider Data After Region Change

**What goes wrong:** User changes region (manual override), but cached movie availability data still reflects the old region. Movies show incorrect provider information.
**Why it happens:** Provider availability is region-specific. Cache keys must include the region.
**How to avoid:** Include region in all cache keys for provider-related data: `providers-${movieId}-${region}`. When region changes, invalidate all provider-related cache entries.
**Warning signs:** Provider logos don't match actual availability after region change.

### Pitfall 5: localStorage Migration Race Condition

**What goes wrong:** The migration hook reads old localStorage keys, but Zustand's persist middleware has already initialized with empty/default state and written to the same localStorage key prefix.
**Why it happens:** Migration and Zustand hydration run concurrently on first load.
**How to avoid:** Run migration synchronously before React renders (in an inline `<script>` or at the top of `main.tsx`), OR use Zustand's `onRehydrateStorage` callback to check for legacy data.
**Warning signs:** User's watched/loved lists are lost after the React rewrite ships.

### Pitfall 6: IndexedDB Transaction Auto-Close

**What goes wrong:** An `await` on a non-IndexedDB promise (like a fetch call) inside an IndexedDB transaction causes the transaction to auto-close, making subsequent operations fail.
**Why it happens:** IndexedDB transactions auto-commit when the event loop is idle. Awaiting an external promise yields control, letting the transaction close.
**How to avoid:** Never mix fetch calls and IndexedDB transactions. Fetch first, then write to IndexedDB in a separate operation.
**Warning signs:** "Transaction has already completed" errors in console.

## Code Examples

### TMDB Movie Details Type

```typescript
// src/types/movie.ts
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;        // "2024-01-15"
  runtime: number | null;       // minutes
  vote_average: number;         // 0-10
  vote_count: number;
  popularity: number;
  genres: Array<{ id: number; name: string }>;
  genre_ids?: number[];         // In list responses (discover/search)
  original_language: string;    // "en"
  adult: boolean;
}

export interface TMDBMovieDetails extends TMDBMovie {
  imdb_id: string | null;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
    crew: Array<{ id: number; name: string; job: string; department: string }>;
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string; // "Trailer" | "Teaser" | "Clip" etc
      name: string;
    }>;
  };
  'watch/providers'?: {
    results: Record<string, WatchProviderCountry>;
  };
}

export interface WatchProviderCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

// Unified movie with OMDB enrichment
export interface EnrichedMovie extends TMDBMovieDetails {
  omdb?: {
    imdbRating: string;        // "8.1"
    rottenTomatoes: string;    // "91%"
    metascore: string;         // "74"
  };
}
```

### Zustand Preferences Store with Migration

```typescript
// src/stores/preferencesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TasteProfile {
  genres: Record<number, number>;       // genreId -> weight (positive = liked, negative = disliked)
  decades: Record<string, number>;      // "2020s" -> weight
  directors: Record<number, number>;    // directorId -> weight
  lastUpdated: number;
}

interface PreferencesState {
  preferredProvider: string | null;
  preferredGenre: string | null;
  myServices: number[];                 // Provider IDs the user subscribes to
  tasteProfile: TasteProfile;

  setPreferredProvider: (provider: string | null) => void;
  setPreferredGenre: (genre: string | null) => void;
  setMyServices: (services: number[]) => void;
  recordLove: (genres: number[], decade: string, directorId?: number) => void;
  recordNotInterested: (genres: number[], decade: string, directorId?: number) => void;
  importLegacy: (data: {
    preferredProvider: string | null;
    preferredGenre: string | null;
  }) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferredProvider: null,
      preferredGenre: null,
      myServices: [],
      tasteProfile: {
        genres: {},
        decades: {},
        directors: {},
        lastUpdated: 0,
      },

      setPreferredProvider: (provider) => set({ preferredProvider: provider }),
      setPreferredGenre: (genre) => set({ preferredGenre: genre }),
      setMyServices: (services) => set({ myServices: services }),

      recordLove: (genres, decade, directorId) =>
        set((state) => {
          const tp = { ...state.tasteProfile };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) + 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) + 1;
          if (directorId) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) + 1;
          }
          tp.lastUpdated = Date.now();
          return { tasteProfile: tp };
        }),

      recordNotInterested: (genres, decade, directorId) =>
        set((state) => {
          const tp = { ...state.tasteProfile };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) - 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) - 0.5;
          if (directorId) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) - 1;
          }
          tp.lastUpdated = Date.now();
          return { tasteProfile: tp };
        }),

      importLegacy: (data) =>
        set({
          preferredProvider: data.preferredProvider,
          preferredGenre: data.preferredGenre,
        }),
    }),
    {
      name: 'wmtw-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
```

### Movie History Store

```typescript
// src/stores/movieHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_SHOWN_HISTORY = 2000;

interface MovieHistoryState {
  shownMovies: number[];
  watchedMovies: number[];
  lovedMovies: number[];
  notInterestedMovies: number[];

  hasBeenShown: (movieId: number) => boolean;
  trackShown: (movieId: number) => void;
  markWatched: (movieId: number) => void;
  markLoved: (movieId: number) => void;
  markNotInterested: (movieId: number) => void;
  importLegacy: (data: {
    shownMovies: number[];
    watchedMovies: number[];
    lovedMovies: number[];
    notInterestedMovies: number[];
  }) => void;
}

export const useMovieHistoryStore = create<MovieHistoryState>()(
  persist(
    (set, get) => ({
      shownMovies: [],
      watchedMovies: [],
      lovedMovies: [],
      notInterestedMovies: [],

      hasBeenShown: (movieId) => {
        const state = get();
        return (
          state.shownMovies.includes(movieId) ||
          state.watchedMovies.includes(movieId) ||
          state.notInterestedMovies.includes(movieId)
        );
      },

      trackShown: (movieId) =>
        set((state) => {
          if (state.shownMovies.includes(movieId)) return state;
          const updated = [...state.shownMovies, movieId];
          return {
            shownMovies: updated.length > MAX_SHOWN_HISTORY
              ? updated.slice(-MAX_SHOWN_HISTORY)
              : updated,
          };
        }),

      markWatched: (movieId) =>
        set((state) => ({
          watchedMovies: state.watchedMovies.includes(movieId)
            ? state.watchedMovies
            : [...state.watchedMovies, movieId],
        })),

      markLoved: (movieId) =>
        set((state) => ({
          lovedMovies: state.lovedMovies.includes(movieId)
            ? state.lovedMovies
            : [...state.lovedMovies, movieId],
        })),

      markNotInterested: (movieId) =>
        set((state) => ({
          notInterestedMovies: state.notInterestedMovies.includes(movieId)
            ? state.notInterestedMovies
            : [...state.notInterestedMovies, movieId],
        })),

      importLegacy: (data) =>
        set({
          shownMovies: data.shownMovies.slice(-MAX_SHOWN_HISTORY),
          watchedMovies: data.watchedMovies,
          lovedMovies: data.lovedMovies,
          notInterestedMovies: data.notInterestedMovies,
        }),
    }),
    {
      name: 'wmtw-movie-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
```

### Region Store with IPInfo Detection

```typescript
// src/stores/regionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RegionState {
  detectedCountry: string;
  manualOverride: string | null;
  lastDetected: number;

  effectiveRegion: () => string;
  setDetectedCountry: (country: string) => void;
  setManualOverride: (country: string | null) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      detectedCountry: 'DE',
      manualOverride: null,
      lastDetected: 0,

      effectiveRegion: () => {
        const state = get();
        return state.manualOverride || state.detectedCountry;
      },

      setDetectedCountry: (country) =>
        set({ detectedCountry: country, lastDetected: Date.now() }),

      setManualOverride: (country) =>
        set({ manualOverride: country }),
    }),
    {
      name: 'wmtw-region',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        detectedCountry: state.detectedCountry,
        manualOverride: state.manualOverride,
        lastDetected: state.lastDetected,
      }),
    },
  ),
);
```

### TMDB Key Endpoints Reference

```typescript
// Key TMDB API endpoints used in this phase

// Discover movies with filters
// GET /discover/movie?api_key=KEY&sort_by=popularity.desc&vote_count.gte=500
//   &vote_average.gte=6.0&with_genres=28&with_watch_providers=8
//   &watch_region=DE&page=1

// Movie details with providers
// GET /movie/{id}?api_key=KEY&append_to_response=watch/providers,credits,videos

// Search movies
// GET /search/movie?api_key=KEY&query=inception&page=1

// Now playing (region-aware)
// GET /movie/now_playing?api_key=KEY&region=DE&page=1

// Popular movies (fallback)
// GET /movie/popular?api_key=KEY&page=1

// Similar movies
// GET /movie/{id}/similar?api_key=KEY&page=1

// Watch provider list for region (dynamic, not hardcoded)
// GET /watch/providers/movie?api_key=KEY&watch_region=DE

// Available regions
// GET /watch/providers/regions?api_key=KEY

// External IDs (for OMDB lookup)
// GET /movie/{id}/external_ids?api_key=KEY

// Genre list
// GET /genre/movie/list?api_key=KEY
```

## State of the Art

| Old Approach (Vanilla App) | Current Approach (Phase 2) | Impact |
|---|---|---|
| Global `let userCountry = 'DE'` mutable var | Zustand `regionStore` with persist | Immutable, reactive, persisted across sessions |
| 100-retry brute-force loop | 3 retries + 5-step filter relaxation | Max 15 API calls vs 100+. Predictable behavior. |
| `preferences` object mutated directly + manual `localStorage.setItem` | Zustand persist middleware with automatic sync | No manual sync, no desync bugs, version migration |
| Genre-only taste learning (`likedGenres` counter) | Multi-signal taste profile (genres + decades + directors + negative signals) | Richer recommendations, avoids "stuck in one genre" |
| 8 hardcoded provider IDs in `getProviderId()` | Dynamic provider list from TMDB per region | Works globally, auto-updates when services launch/merge |
| `Map()` search cache (in-memory, lost on reload) | IndexedDB cache with 1h TTL | Survives page reloads, respects data freshness |
| Direct `fetch()` calls throughout codebase | Typed `tmdbFetch<T>()` client with retry + error mapping | Type-safe responses, consistent error handling |
| OMDB fetched for every movie display | OMDB lazy-loaded + cached 24h in IndexedDB | Conserves 1,000/day OMDB quota |

**Deprecated/outdated:**
- TMDB rate limit of 40 req/10s: Disabled since December 2019. Current effective limit is ~50 req/s at CDN level.
- `flatrate` as only provider type: TMDB now returns `flatrate`, `rent`, `buy`, `free`, `ads` -- all five monetization types should be typed and handled.

## Open Questions

1. **OMDB API key tier**
   - What we know: Free tier = 1,000 req/day. Patron tiers (starting $1/mo) offer higher limits.
   - What's unclear: Which tier is the project using? This affects how aggressively we can cache vs. conserve.
   - Recommendation: Assume free tier (1,000/day). If the project uses a paid tier, caching is less critical but still good practice. The lazy-loading approach works regardless.

2. **IPInfo.io authentication**
   - What we know: Unauthenticated requests share a 1,000/day limit across all users on the same IP. Authenticated (free account) gets unlimited.
   - What's unclear: Does the project use an API token? The existing code calls `https://ipinfo.io/json` without a token.
   - Recommendation: Continue without a token for now. The SPA makes one geolocation call per session (cached in regionStore). Even the shared 1,000/day limit is sufficient for a client-side app. Add token via env var if rate-limited.

3. **Free YouTube movies (data/movies.txt)**
   - What we know: The existing app loads a local `data/movies.txt` file with 1,000+ YouTube movie IDs.
   - What's unclear: Should this be typed and integrated into the data layer in Phase 2, or deferred to Phase 3 (Feature Parity)?
   - Recommendation: Defer to Phase 3. Phase 2 focuses on external API integration. The movies.txt file is a static asset, not an API service. Phase 3's FREE-01 through FREE-04 requirements cover this.

4. **Dinner Time mode data requirements**
   - What we know: The existing app has `dinnerTimeLikes` and `dinnerTimeDislikes` arrays.
   - What's unclear: Should these be part of `movieHistoryStore` or a separate concern?
   - Recommendation: Include in `movieHistoryStore` as additional arrays. They follow the same pattern as other preference lists.

## Sources

### Primary (HIGH confidence)
- Zustand official docs: [Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- persist middleware API, custom storage, migration
- Zustand official docs: [Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) -- multiple stores vs slices guidance
- `idb` GitHub README: [jakearchibald/idb](https://github.com/jakearchibald/idb) -- API reference, TypeScript DBSchema, version 8
- TMDB Official Docs: [Rate Limiting](https://developer.themoviedb.org/docs/rate-limiting) -- legacy 40 req/10s disabled, current ~50 req/s
- TMDB Official Docs: [Watch Providers](https://developer.themoviedb.org/reference/movie-watch-providers) -- flatrate/rent/buy/free/ads monetization types
- TMDB Official Docs: [Available Regions](https://developer.themoviedb.org/reference/watch-providers-available-regions) -- dynamic region list
- IPInfo.io: [Free Plan Limits](https://ipinfo.io/faq/article/61-usage-limit-free-plan) -- unauthenticated vs authenticated limits

### Secondary (MEDIUM confidence)
- Zustand GitHub Discussion [#2496](https://github.com/pmndrs/zustand/discussions/2496) -- multiple stores vs slices real-world advice
- Zustand GitHub Discussion [#1721](https://github.com/pmndrs/zustand/discussions/1721) -- IndexedDB with Zustand persist
- TMDB Community: [with_watch_providers + watch_region](https://www.themoviedb.org/talk/5fff4f4d420228003fe72f49) -- both params required together
- OMDB API: [Free tier 1,000 req/day](https://github.com/omdbapi/OMDb-API/issues/100)
- TkDodo's Blog: [Working with Zustand](https://tkdodo.eu/blog/working-with-zustand) -- expert patterns

### Tertiary (LOW confidence)
- `zustand-indexeddb` [v0.1.1](https://github.com/zustandjs/zustand-indexeddb) -- too immature, mentioned only for awareness

### Codebase (HIGH confidence -- direct inspection)
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/scripts/api.js` -- existing TMDB/OMDB integration, 100-retry loop, country detection
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/scripts/preferences.js` -- existing localStorage keys, movie history tracking, genre learning
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/scripts/utils.js` -- 60+ provider URL mappings, country name map
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/scripts/search-manager.js` -- SearchManager class, filter system, in-memory Map cache
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/scripts/trending.js` -- 30-min refresh, region fallback
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/src/stores/themeStore.ts` -- existing Zustand store pattern (Phase 1)
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/src/vite-env.d.ts` -- VITE_TMDB_API_KEY and VITE_OMDB_API_KEY typed
- `/Volumes/Data_Drive/Project/2026/WhichMovieToWatch/package.json` -- zustand ^5.0.0 already installed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zustand already in project, idb is the undisputed IndexedDB wrapper (12.8M weekly downloads)
- Architecture: HIGH -- multiple stores pattern validated by Zustand docs and community consensus; SWR cache pattern is well-established
- Pitfalls: HIGH -- identified from direct codebase inspection and API documentation
- TMDB API behavior: HIGH -- verified rate limiting status and watch provider endpoint requirements
- OMDB/IPInfo limits: MEDIUM -- older sources confirm limits, but exact current thresholds may differ

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- stable stack, unlikely to change)
