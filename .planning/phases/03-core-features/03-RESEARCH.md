# Phase 3: Core Features - Research

**Researched:** 2026-02-18
**Domain:** React component composition, movie discovery UI, search/filter patterns, accessibility
**Confidence:** HIGH

## Summary

Phase 3 is a **composition phase** -- it builds feature screens and interactions by wiring together Phase 1 UI components (ClayCard, ClayModal, MetalButton, MetalSlider, etc.) with Phase 2 data hooks (useRandomMovie, useMovieDetails, useSearchMovies, useTrending, useWatchProviders, useOmdbRatings) and Zustand stores (discovery, search, preferences, movieHistory, region, ui). All 50 requirements map directly to existing infrastructure.

**Only one new dependency is needed:** `sonner` (~3KB) for toast notifications. Everything else composes what already exists. The primary challenge is faithful feature parity with the vanilla JS app while maintaining clean React patterns (no direct DOM manipulation, proper state flow, accessibility-first).

**Primary recommendation:** Build features in dependency order -- Discovery flow first (core loop), then Display/Interactions, then Search/Advanced Search, then special modes (Trending, Dinner Time, Free Movies), and finally cross-cutting concerns (Accessibility, Security). Each feature is a page-level component that composes UI primitives and data hooks.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISC-01 | Random movie discovery with "Surprise Me" | useRandomMovie hook + discoveryStore (needs type fix) |
| DISC-02 | Progressive filter relaxation (5 steps) | Already in tmdb/discover.ts service |
| DISC-03 | Genre + provider + rating filters | discoveryStore filters + MetalDropdown/MetalSlider |
| DISC-04 | Exclude watched/not-interested | movieHistoryStore.getExcludeSet() |
| DISC-05 | Taste-based scoring | taste-engine.ts scoreTasteMatch() |
| DISP-01 | Movie card: poster, title, year, rating | ClayCard + TMDBMovie type |
| DISP-02 | Full details modal with trailer | ClayModal + useMovieDetails + videos array |
| DISP-03 | Streaming availability by provider tier | useWatchProviders + ProviderTier sections |
| DISP-04 | OMDB ratings (IMDb, RT, Metascore) | useOmdbRatings (lazy, single movie only) |
| DISP-05 | Provider deep links (TMDB/JustWatch) | provider-registry.ts getProviderDeepLink() |
| INTR-01 | Love movie action | movieHistoryStore.addLoved() |
| INTR-02 | Not interested action | movieHistoryStore.addNotInterested() |
| INTR-03 | Mark as watched | movieHistoryStore.addWatched() |
| INTR-04 | Similar movie recommendations on love | TMDB /movie/{id}/similar endpoint (needs hook) |
| INTR-05 | Share movie (native share / clipboard) | Navigator.share API with clipboard fallback |
| PREF-01 | Preferred streaming service selection | preferencesStore.preferredProvider + useRegionProviders |
| PREF-02 | Genre preference learning | preferencesStore.recordLove() updates tasteProfile |
| PREF-03 | Region override setting | regionStore.setManualRegion() |
| PREF-04 | My streaming services list | preferencesStore.myServices[] |
| PREF-05 | Import legacy localStorage data | preferencesStore.importLegacy() |
| SRCH-01 | Movie title search | useSearchMovies.search() |
| SRCH-02 | Search results with pagination | useSearchMovies.loadMore() + hasMore |
| SRCH-03 | Search result click to details | Navigate or modal open on click |
| SRCH-04 | 300ms debounce on input | Custom useDebouncedValue hook |
| SRCH-05 | Voice search (Chrome) | Web Speech API with feature detection |
| ADVS-01 | Multi-genre filter | searchStore extension + genre checkboxes |
| ADVS-02 | Year range filter (dual slider) | Composed DualRangeSlider from MetalSlider |
| ADVS-03 | Rating range filter (dual slider) | Composed DualRangeSlider from MetalSlider |
| ADVS-04 | Runtime filter | MetalSlider or dropdown |
| ADVS-05 | Language filter | MetalDropdown with TMDB language list |
| ADVS-06 | Streaming service filter | MetalCheckbox group from useRegionProviders |
| ADVS-07 | Sort options (popularity, rating, date, title) | searchStore.sortBy + TMDB sort_by param |
| ADVS-08 | Filter presets (trending, 90s classics, etc.) | Preset definitions applied to searchStore |
| ADVS-09 | Active filter chips with remove | ClayBadge with dismiss handler |
| ADVS-10 | Clear all filters | searchStore.resetFilters() |
| TRND-01 | Now playing grid | useTrending + movie card grid |
| TRND-02 | 30-minute auto-refresh | Already in useTrending hook (setInterval) |
| TRND-03 | Region-aware with popular fallback | Already in useTrending hook |
| TRND-04 | Click to details | Navigate/modal on card click |
| TRND-05 | Manual refresh button | useTrending.refresh() |
| DINR-01 | Dinner Time mode toggle | UI toggle + discoveryStore filter preset |
| DINR-02 | Family-friendly filters (PG/G rated) | certification filter in TMDB discover |
| DINR-03 | Netflix/Prime/Disney+ only | Provider IDs 8, 9, 337 filter |
| DINR-04 | Service-specific branding and URLs | provider-registry + custom branding |
| DINR-05 | Like/dislike within Dinner Time | movieHistoryStore needs dinnerTimeLikes/Dislikes |
| FREE-01 | Free YouTube movies section | Parse data/movies.txt + YouTube embed |
| FREE-02 | Free movie details from TMDB search | searchMovies(title) to find TMDB match |
| FREE-03 | Free provider indicators | isFreeProvider() from provider-registry |
| A11Y-01 | Keyboard navigation for all interactive elements | tabIndex, onKeyDown, focus management |
| A11Y-02 | Screen reader announcements for state changes | ARIA live regions |
| A11Y-03 | Skip navigation link | Skip-to-main-content link in AppShell |
| A11Y-04 | Focus trap in modals | ClayModal already handles Escape + backdrop |
| SECU-01 | Sanitize all user input display | React JSX auto-escapes by default |
| SECU-02 | Secure external links | rel="noopener noreferrer" target="_blank" |
| SECU-03 | No raw HTML rendering | Use React JSX exclusively, never bypass escaping |
| SECU-04 | API key protection (env vars only) | Already in Vite env config from Phase 1 |
</phase_requirements>

## Standard Stack

### Core (Already Installed - Phase 1/2)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | Component framework | Phase 1 decision |
| react-router-dom | 7.x | HashRouter for GH Pages | Phase 1 decision |
| zustand | 5.x | State management | Phase 2 decision |
| framer-motion | 12.x | Animations | Phase 1 decision |
| idb | 8.x | IndexedDB cache | Phase 2 decision |
| tailwindcss | 4.x | Styling | Phase 1 decision |

### New Dependency (Phase 3)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sonner | ~2.x | Toast notifications | ~3KB, unstyled/customizable, used by shadcn ecosystem, zero config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sonner | react-hot-toast | Both are ~3KB; sonner has better stacking, action buttons, promise toasts |
| sonner | custom toast | Toast edge cases (stacking, auto-dismiss, swipe-to-dismiss) are deceptively complex |
| Web Speech API (direct) | react-speech-recognition | Library adds 8KB for a ~30-line custom hook; overkill |
| Composed DualRangeSlider | @radix-ui/react-slider | Already have MetalSlider; composition avoids new dependency |

**Installation:**
```bash
npm install sonner
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/                    # Phase 1 design system (existing)
│   ├── layout/                # AppShell, Navbar (existing)
│   ├── movie/                 # Movie display components
│   │   ├── MovieCard.tsx      # Poster + title + rating
│   │   ├── MovieDetails.tsx   # Full details view
│   │   ├── MovieActions.tsx   # Love/Watch/Skip/Share buttons
│   │   ├── ProviderSection.tsx # Streaming tiers display
│   │   ├── RatingBadges.tsx   # OMDB ratings display
│   │   └── TrailerPlayer.tsx  # YouTube trailer embed
│   ├── discovery/             # Discovery flow
│   │   ├── DiscoveryPage.tsx  # Main discovery screen
│   │   ├── DiscoveryFilters.tsx
│   │   └── RelaxationIndicator.tsx
│   ├── search/                # Search feature
│   │   ├── SearchPage.tsx
│   │   ├── SearchBar.tsx      # Input + voice + debounce
│   │   ├── SearchResults.tsx
│   │   ├── AdvancedFilters.tsx
│   │   ├── FilterChips.tsx
│   │   └── FilterPresets.tsx
│   ├── trending/              # Trending section
│   │   └── TrendingPage.tsx
│   ├── dinner-time/           # Dinner Time mode
│   │   ├── DinnerTimePage.tsx
│   │   └── ServiceBranding.tsx
│   ├── free-movies/           # Free YouTube movies
│   │   ├── FreeMoviesPage.tsx
│   │   └── YouTubeEmbed.tsx
│   ├── settings/              # User preferences
│   │   ├── SettingsPage.tsx
│   │   ├── ServiceSelector.tsx
│   │   └── RegionSelector.tsx
│   └── shared/                # Shared components
│       ├── DualRangeSlider.tsx
│       ├── VoiceSearchButton.tsx
│       └── ScreenReaderAnnouncer.tsx
├── hooks/                     # Phase 2 hooks (existing) + new
│   ├── useDebouncedValue.ts   # NEW: generic debounce
│   ├── useDeepLink.ts         # NEW: ?movie=ID handling
│   ├── useVoiceSearch.ts      # NEW: Web Speech API
│   ├── useSimilarMovies.ts    # NEW: /movie/{id}/similar
│   ├── useFreeMovies.ts       # NEW: movies.txt parser
│   └── useShare.ts            # NEW: Navigator.share wrapper
├── stores/                    # Phase 2 stores (existing, some extended)
├── services/                  # Phase 2 services (existing)
├── lib/                       # Phase 2 utilities (existing)
└── types/                     # Phase 2 types (existing)
```

### Pattern 1: Page Component Composition
**What:** Each page composes UI primitives + data hooks + store selectors
**When to use:** Every feature page (Discovery, Search, Trending, etc.)
**Example:**
```typescript
// DiscoveryPage.tsx
import { useRandomMovie } from '@/hooks/useRandomMovie';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { ClayCard, ClayModal, MetalButton } from '@/components/ui';

export function DiscoveryPage() {
  const { discover, currentMovie, isLoading, relaxationStep } = useRandomMovie();
  const { data: details } = useMovieDetails(currentMovie?.id ?? null);
  const { providers } = useWatchProviders(currentMovie?.id ?? null);

  return (
    <div className="discovery-page">
      {currentMovie && (
        <MovieCard movie={currentMovie} providers={providers} />
      )}
      <MetalButton onClick={discover} disabled={isLoading}>
        Surprise Me
      </MetalButton>
      {relaxationStep > 0 && (
        <RelaxationIndicator step={relaxationStep} />
      )}
    </div>
  );
}
```

### Pattern 2: Debounced Search Input
**What:** Debounce user input to avoid excessive API calls
**When to use:** Search bar, any text input triggering API calls
**Example:**
```typescript
// hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage in SearchBar.tsx
function SearchBar() {
  const [input, setInput] = useState('');
  const debouncedQuery = useDebouncedValue(input, 300);
  const { search } = useSearchMovies();

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery, search]);

  return <ClayInput value={input} onChange={(e) => setInput(e.target.value)} />;
}
```

### Pattern 3: Feature Detection for Voice Search
**What:** Check browser support before enabling voice features
**When to use:** Voice search button visibility and functionality
**Example:**
```typescript
// hooks/useVoiceSearch.ts
import { useState, useCallback, useRef } from 'react';

type SpeechRecognitionType = typeof window.SpeechRecognition;

export function useVoiceSearch(onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, start, stop };
}
```

### Pattern 4: DualRangeSlider Composition
**What:** Compose two MetalSlider instances for range selection
**When to use:** Year range, rating range, runtime range in advanced filters
**Example:**
```typescript
// components/shared/DualRangeSlider.tsx
import { MetalSlider } from '@/components/ui';

interface DualRangeSliderProps {
  min: number;
  max: number;
  valueLow: number;
  valueHigh: number;
  onChangeLow: (v: number) => void;
  onChangeHigh: (v: number) => void;
  step?: number;
  label: string;
  formatValue?: (v: number) => string;
}

export function DualRangeSlider({
  min, max, valueLow, valueHigh,
  onChangeLow, onChangeHigh,
  step = 1, label, formatValue = String,
}: DualRangeSliderProps) {
  return (
    <fieldset className="dual-range-slider">
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center gap-3">
        <span className="text-sm">{formatValue(valueLow)}</span>
        <MetalSlider
          min={min}
          max={valueHigh}
          value={valueLow}
          onChange={onChangeLow}
          step={step}
          aria-label={`${label} minimum`}
        />
        <span className="text-sm">to</span>
        <MetalSlider
          min={valueLow}
          max={max}
          value={valueHigh}
          onChange={onChangeHigh}
          step={step}
          aria-label={`${label} maximum`}
        />
        <span className="text-sm">{formatValue(valueHigh)}</span>
      </div>
    </fieldset>
  );
}
```

### Pattern 5: Deep Link Handling
**What:** Parse `?movie=ID` from URL and load that movie on app start
**When to use:** App initialization, shared movie links
**Example:**
```typescript
// hooks/useDeepLink.ts
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useDeepLink(onMovieId: (id: number) => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const movieParam = searchParams.get('movie');
    if (movieParam) {
      const id = parseInt(movieParam, 10);
      if (!isNaN(id) && id > 0) {
        onMovieId(id);
      }
      // Clean up URL after processing
      setSearchParams({}, { replace: true });
    }
  }, []); // Run once on mount only
}
```

### Pattern 6: Secure External Links
**What:** All external links open safely with proper attributes
**When to use:** Every `<a>` tag pointing outside the app (provider links, TMDB, YouTube)
**Example:**
```typescript
// components/shared/ExternalLink.tsx
interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children, ...props }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
```

### Pattern 7: Screen Reader Announcer
**What:** ARIA live region for dynamic state changes
**When to use:** Discovery results, search results count, filter changes, errors
**Example:**
```typescript
// components/shared/ScreenReaderAnnouncer.tsx
import { useEffect, useRef } from 'react';

export function ScreenReaderAnnouncer({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      // Clear and re-set to force re-announcement
      ref.current.textContent = '';
      requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = message;
      });
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
```

### Anti-Patterns to Avoid
- **Direct DOM manipulation:** Never use `document.querySelector`, `element.style`, or raw HTML string injection in React components. Always use JSX and React state.
- **Bypassing React's JSX escaping:** Never use React's escape-bypass APIs. All user-facing text must go through JSX which auto-escapes. This covers SECU-01 and SECU-03.
- **OMDB in lists:** Never call useOmdbRatings for multiple movies in a list. It is for single displayed movie only (rate-limited API).
- **Uncontrolled store access in render:** Always use Zustand selectors (`useStore(s => s.field)`), never `useStore.getState()` in render path.
- **Missing cleanup in effects:** Always return cleanup functions from useEffect when setting up timers, event listeners, or async operations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | `sonner` | Stacking, auto-dismiss timing, swipe-to-dismiss, accessible announcements |
| Debounce | Manual setTimeout tracking | `useDebouncedValue` hook (15 lines) | Cleanup on unmount, generic typing, reusable |
| Focus trap in modals | Manual focus management | ClayModal (already built) | Edge cases: tabbing, shift-tab, nested focusables |
| Dual range slider | Two native inputs + sync | DualRangeSlider composing MetalSlider | Min/max constraint sync, accessible labels |
| Provider logos/links | Hardcoded URL mapping | provider-registry.ts (already built) | 60+ services, isFree detection, deep links |
| Taste scoring | Custom recommendation algo | taste-engine.ts (already built) | Genre/decade/director weighting, normalized scoring |
| Cache with SWR | Custom stale-while-revalidate | cache-manager.ts (already built) | TTL management, IndexedDB, stale detection |

**Key insight:** Phase 3 should almost never create new utilities or services. If you find yourself writing data-fetching or caching logic, it probably already exists in Phase 2.

## Common Pitfalls

### Pitfall 1: discoveryStore Type Mismatch
**What goes wrong:** `currentMovie` in discoveryStore is typed as `Record<string, unknown>` (placeholder). Components will need unsafe type assertions everywhere.
**Why it happens:** Phase 2 used a placeholder type that was meant to be fixed.
**How to avoid:** First task of Phase 3 must fix `discoveryStore.currentMovie` to `TMDBMovieDetails | null`. This is a prerequisite for all discovery components.
**Warning signs:** TypeScript errors about missing properties on `Record<string, unknown>`.

### Pitfall 2: Missing movieHistoryStore Fields
**What goes wrong:** Dinner Time like/dislike tracking has no store support.
**Why it happens:** Phase 2 implemented core history but Dinner Time was Phase 3 scope.
**How to avoid:** Extend movieHistoryStore with `dinnerTimeLikes: number[]` and `dinnerTimeDislikes: number[]` arrays (persisted) before building Dinner Time feature.
**Warning signs:** Dinner Time likes/dislikes not persisting across sessions.

### Pitfall 3: searchStore Missing Advanced Filter Fields
**What goes wrong:** Advanced search filters have nowhere to store state.
**Why it happens:** Phase 2 searchStore only has query, results, pagination, sortBy. No genre array, year range, rating range, runtime, language, streaming services, or sort order.
**How to avoid:** Extend searchStore with all advanced filter fields before building AdvancedFilters component. Add `resetFilters()` action.
**Warning signs:** Filter UI with local state that desyncs from store.

### Pitfall 4: Free Movies BASE_URL for GitHub Pages
**What goes wrong:** `fetch('data/movies.txt')` works in dev but 404s on GitHub Pages where the app is at `/WhichMovieToWatch/`.
**Why it happens:** Relative paths resolve against the page URL, not the repo root.
**How to avoid:** Use Vite's `import.meta.env.BASE_URL` prefix: `fetch(\`${import.meta.env.BASE_URL}data/movies.txt\`)`. Verify `base` is set in vite.config.ts.
**Warning signs:** Free movies section empty in production but works in dev.

### Pitfall 5: Voice Search Browser Compatibility
**What goes wrong:** Voice search crashes or silently fails on non-Chrome browsers.
**Why it happens:** Web Speech API is non-standard; only Chrome and Edge have full support. Safari has partial support. Firefox has none.
**How to avoid:** Feature detection before showing voice button. Graceful degradation -- hide button entirely on unsupported browsers. Never assume `webkitSpeechRecognition` exists.
**Warning signs:** "SpeechRecognition is not defined" runtime errors.

### Pitfall 6: HashRouter and Deep Links
**What goes wrong:** `?movie=123` deep links may not work with HashRouter since query params go inside the hash fragment.
**Why it happens:** HashRouter puts everything after `#`, so URL becomes `/#/?movie=123` not `/?movie=123`.
**How to avoid:** Use `useSearchParams` from react-router-dom which handles hash-based query params correctly. Test deep links in both dev and production. The vanilla app used `?movie=123` directly, so shared links from the old app need to still work -- may need a redirect handler.
**Warning signs:** Deep links work in dev (BrowserRouter-like behavior) but break in production.

### Pitfall 7: OMDB Rate Limiting
**What goes wrong:** OMDB returns errors or empty responses when called too frequently.
**Why it happens:** Free OMDB tier has 1000 requests/day limit. If ratings are fetched for every movie in search results or trending grid, quota burns fast.
**How to avoid:** useOmdbRatings is already designed for single-movie use. Enforce this pattern: only call when showing movie details modal/page, NEVER in list views. The comment in the hook file is explicit about this.
**Warning signs:** OMDB ratings showing as null for many movies, especially later in the day.

## Code Examples

### Navigator Share with Clipboard Fallback
```typescript
// hooks/useShare.ts
import { useCallback } from 'react';

export function useShare() {
  const share = useCallback(async (title: string, url: string) => {
    const shareData = { title, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return 'shared';
      } catch (err) {
        if ((err as Error).name === 'AbortError') return 'cancelled';
        // Fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }, []);

  return { share };
}
```

### Free Movies Parser
```typescript
// hooks/useFreeMovies.ts
import { useState, useEffect } from 'react';

interface FreeMovie {
  youtubeId: string;
  title: string;
}

export function useFreeMovies() {
  const [movies, setMovies] = useState<FreeMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const base = import.meta.env.BASE_URL;
        const res = await fetch(`${base}data/movies.txt`);
        const text = await res.text();
        const lines = text.trim().split('\n');

        // Skip header line ("YouTube ID\tTitle")
        const parsed = lines.slice(1).map((line) => {
          const [youtubeId, title] = line.split('\t');
          return { youtubeId: youtubeId.trim(), title: title.trim() };
        }).filter((m) => m.youtubeId && m.title);

        if (!cancelled) setMovies(parsed);
      } catch (err) {
        console.warn('[free-movies] Failed to load:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { movies, isLoading };
}
```

### Provider Section Display
```typescript
// components/movie/ProviderSection.tsx
import type { MovieProviders, ProviderInfo } from '@/types/provider';
import { ExternalLink } from '@/components/shared/ExternalLink';

const TIER_LABELS: Record<string, string> = {
  flatrate: 'Stream',
  rent: 'Rent',
  buy: 'Buy',
  free: 'Free',
  ads: 'Free with Ads',
};

function ProviderRow({ tier, providers }: { tier: string; providers: ProviderInfo[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium w-20">{TIER_LABELS[tier]}:</span>
      <div className="flex gap-1.5">
        {providers.map((p) => (
          <ExternalLink
            key={p.provider_id}
            href={p.deep_link}
            title={p.provider_name}
          >
            <img
              src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
              alt={p.provider_name}
              className="w-8 h-8 rounded"
              loading="lazy"
            />
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}

export function ProviderSection({ providers }: { providers: MovieProviders }) {
  const tiers = ['flatrate', 'free', 'ads', 'rent', 'buy'] as const;
  const available = tiers.filter(
    (tier) => providers[tier] && providers[tier]!.length > 0
  );

  if (available.length === 0) {
    return <p className="text-muted">No streaming info available</p>;
  }

  return (
    <div className="space-y-2">
      {available.map((tier) => (
        <ProviderRow key={tier} tier={tier} providers={providers[tier]!} />
      ))}
    </div>
  );
}
```

### Dinner Time Service-Specific URLs
```typescript
// Dinner Time provider config
const DINNER_TIME_SERVICES = [
  {
    providerId: 8,
    name: 'Netflix',
    searchUrl: (title: string) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    color: '#E50914',
  },
  {
    providerId: 9,
    name: 'Amazon Prime Video',
    searchUrl: (title: string) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
    color: '#00A8E1',
  },
  {
    providerId: 337,
    name: 'Disney+',
    searchUrl: (title: string) =>
      `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
    color: '#113CCF',
  },
] as const;
```

### Filter Presets
```typescript
// Search filter preset definitions (matches vanilla JS SearchManager)
export const FILTER_PRESETS = {
  trending: {
    label: 'Trending Now',
    filters: { sortBy: 'popularity.desc' },
  },
  '90s-classics': {
    label: '90s Classics',
    filters: { yearRange: [1990, 1999], minRating: 7.0, sortBy: 'vote_average.desc' },
  },
  'short-films': {
    label: 'Short Films',
    filters: { maxRuntime: 40, sortBy: 'popularity.desc' },
  },
  'award-winners': {
    label: 'Award Winners',
    filters: { minRating: 8.0, minVoteCount: 1000, sortBy: 'vote_average.desc' },
  },
  'family-friendly': {
    label: 'Family Friendly',
    filters: { genres: [16, 10751], sortBy: 'popularity.desc' },
  },
  'action-packed': {
    label: 'Action Packed',
    filters: { genres: [28], sortBy: 'popularity.desc' },
  },
} as const;
```

## State of the Art

| Old Approach (Vanilla JS) | Current Approach (React) | Impact |
|---------------------------|--------------------------|--------|
| Global window functions + onclick handlers | Component composition + event handlers | Encapsulation, testability |
| Template literal HTML strings | JSX with auto-escaping | Security by default (SECU-01, SECU-03) |
| Manual DOM updates (querySelector + mutation) | React state -> automatic re-render | Consistency, no stale DOM |
| localStorage direct reads/writes | Zustand persist middleware | Type safety, subscriptions, devtools |
| Map-based in-memory cache | IndexedDB with TTL + SWR | Survives page reload, larger capacity |
| Class-based managers (SearchManager, FilterPanel) | Hooks + stores + components | Composable, tree-shakeable |
| GSAP + manual scroll handlers | framer-motion AnimatePresence | Declarative, exit animations |
| document.createElement for toasts | sonner library | Accessible, stackable, swipe-dismiss |

**Deprecated/outdated approaches to avoid:**
- `webkitSpeechRecognition` prefix: Still needed for Chrome, but check standard `SpeechRecognition` first
- `window.open` for sharing: Use `navigator.share` API (supported in all modern mobile browsers)
- Inline onclick in HTML strings: Use React event handlers exclusively

## Open Questions

1. **HashRouter Deep Link Compatibility**
   - What we know: Vanilla app uses `?movie=123` query params. HashRouter puts routes after `#`.
   - What is unclear: Whether old shared links (`whichmovieto.watch/?movie=123`) will work with the new HashRouter (`whichmovieto.watch/#/?movie=123`).
   - Recommendation: Build deep link handler using `useSearchParams`. Test in production. May need a small redirect script in index.html that converts `?movie=X` to `#/?movie=X` for backward compatibility.

2. **movies.txt Deployment Path**
   - What we know: `data/movies.txt` needs to be accessible at runtime. Vite serves `public/` as static root.
   - What is unclear: Whether `data/` is currently inside `public/` or needs to be moved.
   - Recommendation: Verify `data/movies.txt` is inside `public/data/movies.txt` or add it there. Use `import.meta.env.BASE_URL` prefix for the fetch URL.

3. **Similar Movies Hook**
   - What we know: INTR-04 requires "similar movie recommendations on love." TMDB has `/movie/{id}/similar` and `/movie/{id}/recommendations` endpoints.
   - What is unclear: Whether to use `similar` (same genres/keywords) or `recommendations` (user-based collaborative filtering from TMDB).
   - Recommendation: Use `/movie/{id}/recommendations` as it provides better suggestions. Fall back to `/movie/{id}/similar` if recommendations returns empty.

4. **Trailer Playback Strategy**
   - What we know: DISP-02 requires trailer in details modal. `useMovieDetails` returns `videos` array with YouTube keys.
   - What is unclear: Whether to embed YouTube iframe directly or use a thumbnail-click-to-play pattern (better performance).
   - Recommendation: Use thumbnail-click-to-play. Show video thumbnail with play button overlay; on click, replace with YouTube iframe. This avoids loading YouTube embed JS until user requests it.

## Sources

### Primary (HIGH confidence)
- **Existing codebase** - All vanilla JS files (`scripts/*.js`) analyzed for feature parity requirements
- **Phase 2 code** - All hooks, stores, services, types, and utilities examined in `src/`
- **Phase 1 components** - All UI components in `src/components/ui/` verified for available props
- **REQUIREMENTS.md** - Full requirements matrix with 50 Phase 3 items

### Secondary (MEDIUM confidence)
- **sonner npm page** - Verified ~3KB size, API surface (toast, toast.success, toast.promise), Toaster component
- **Web Speech API MDN docs** - Browser compatibility matrix (Chrome full, Edge full, Safari partial, Firefox none)
- **Navigator.share MDN docs** - Browser support (all modern mobile, Chrome/Edge desktop, not Firefox desktop)

### Tertiary (LOW confidence)
- **HashRouter deep link behavior** - Based on react-router-dom docs, but not runtime-verified with production GitHub Pages deployment
- **movies.txt deployment path** - Needs verification of current file location relative to Vite's public directory

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Only 1 new dependency (sonner), everything else exists
- Architecture: HIGH - Direct composition of Phase 1 + Phase 2, patterns verified against existing code
- Pitfalls: HIGH - All pitfalls identified from code analysis of actual codebase gaps
- Code examples: MEDIUM - Patterns based on verified APIs but not runtime-tested

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable stack, all dependencies already locked)
