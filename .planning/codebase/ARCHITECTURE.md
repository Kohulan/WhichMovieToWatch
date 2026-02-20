# Architecture

**Analysis Date:** 2026-02-15

## Pattern Overview

**Overall:** Event-driven, modular single-page application (SPA) with layered separation of concerns.

**Key Characteristics:**
- Vanilla JavaScript (ES6+) with class-based component architecture
- Horizontal module organization by feature/concern (API, UI, Search, Preferences, etc.)
- Progressive Web App (PWA) with offline-first service worker caching strategy
- Client-side state management via localStorage and in-memory state
- Asynchronous data flows with streaming provider availability detection

## Layers

**API Integration Layer:**
- Purpose: Abstracts external API calls and data fetching
- Location: `scripts/api.js`
- Contains: TMDB API configuration, movie fetching, provider lookups, external rating fetches
- Depends on: Global constants (BASE_URL, API_KEY, OMDB_API_KEY)
- Used by: All feature modules

**Data Management Layer:**
- Purpose: User preferences, watched history, ratings, and local caching
- Location: `scripts/preferences.js`
- Contains: localStorage operations, preference validation, movie history tracking
- Depends on: API layer for movie data
- Used by: App core, search, filter modules

**Search & Discovery Layer:**
- Purpose: Advanced movie search, filtering, and recommendations
- Location: `scripts/search-manager.js`, `scripts/search.js`, `scripts/filter-panel.js`
- Contains: Search caching, filter state management, preset filters, pagination
- Depends on: API layer, data management
- Used by: UI layer

**Display & Rendering Layer:**
- Purpose: DOM manipulation, movie card rendering, modal management
- Location: `scripts/ui.js`, `scripts/story-card.js`
- Contains: HTML generation, event binding, dynamic content injection
- Depends on: All data layers
- Used by: App core and feature modules

**Enhancement Layers:**
- **Accessibility:** `scripts/accessibility-manager.js` - WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Performance:** `scripts/performance-manager.js` - Lazy loading, image optimization, animation control
- **Meta/SEO:** `scripts/meta-tags.js` - Dynamic meta tag updates for social sharing
- **Animations:** `scripts/advanced-animations.js`, `scripts/professional-animations.js` - Visual effects
- **Theme:** `scripts/theme.js` - Dark/light mode management
- **Loading States:** `scripts/loading.js` - Loading indicator management

**Core Application Layer:**
- Purpose: Application orchestration and initialization
- Location: `scripts/app.js` - MovieApp class
- Contains: Lifecycle management, event delegation, routing via URL parameters
- Depends on: All other layers
- Used by: index.html entry point

**PWA & Offline Layer:**
- Purpose: Service worker management, installation prompts, offline support
- Location: `scripts/pwa-installer.js` (client-side), `service-worker.js` (worker thread)
- Contains: Service worker registration, update checks, install tracking
- Depends on: Service worker fetch strategies
- Used by: Bootstrap initialization

## Data Flow

**Movie Discovery Flow:**

1. User opens app or clicks "Get Recommendation"
2. `app.js:validateAndFetch()` initializes TMDB API validation
3. `api.js:fetchRandomMovie()` builds query with user preferences from localStorage
4. Provider filtering in `api.js` checks watch/providers data for streaming availability
5. External ratings fetched via `api.js:fetchExternalRatings()` (OMDB, IMDb data)
6. `ui.js:displayMovie()` renders full card with provider links, ratings, trailer
7. Movie ID tracked in `preferences.js:trackShownMovie()` to prevent repeats
8. Analytics fired (Simple Analytics via external script)

**Advanced Search Flow:**

1. User opens advanced search modal
2. `filter-panel.js:FilterPanel` renders filter UI with preset options
3. `search-manager.js:SearchManager.executeSearch()` builds API query from filters
4. Results paginated and cached in `SearchManager.searchCache`
5. Results rendered via `ui.js:displaySearchResults()`
6. User interactions update filters triggering debounced re-search

**Preference Management Flow:**

1. User opens preferences modal or skips it
2. `preferences.js:savePreferences()` stores streaming provider and genre to localStorage
3. `api.js:fetchRandomMovie()` reads stored preferences on next recommendation
4. Movie tracking prevents showing same movie twice (up to 1000-movie history)

**State Management:**

- **MovieApp.state:** In-memory app state (isLoading, currentMovie, lastUpdate, moviesCache)
- **localStorage:** Persistent user preferences, watch history, app settings
- **Module-level cache:** SearchManager.searchCache, API response caching
- **URL parameters:** Deep linking via `?movie=ID` for direct movie viewing

## Key Abstractions

**MovieApp Class:**
- Purpose: Central application controller
- Examples: `scripts/app.js:MovieApp`
- Pattern: Singleton instance initialized once, methods bound to preserve context
- Responsibilities: Initialize, route, delegate to handlers, centralized error handling

**Manager Classes:**
- **SearchManager:** `scripts/search-manager.js` - Encapsulates search state, caching, and API orchestration
- **FilterPanel:** `scripts/filter-panel.js` - UI and interaction management for filtering
- **AccessibilityManager:** `scripts/accessibility-manager.js` - WCAG compliance utilities
- **PWAInstaller:** `scripts/pwa-installer.js` - PWA lifecycle management
- **StoryCardGenerator:** `scripts/story-card.js` - Canvas-based social sharing card generation

**Provider Abstraction:**
- Purpose: Normalize streaming service data across regions
- Pattern: `utils.js:getProviderURL()` maps normalized service names to platform URLs
- Handles: Netflix, Disney+, Prime Video, HBO Max, Hulu, etc. (50+ services)

**Genre/Language/Region Mapping:**
- Purpose: Translate API codes to human-readable labels
- Location: `search-manager.js` (genres, languages), `utils.js` (countries)
- Usage: Filter UI population, user-facing labels

## Entry Points

**index.html (Main Entry Point):**
- Location: `/index.html`
- Triggers: Browser navigation to domain root
- Responsibilities: DOM structure, CDN script loading, PWA manifest registration
- Load order: Style sheets → Libraries (GSAP, Lottie) → Feature modules → Core app → Deferred scripts

**Service Worker:**
- Location: `/service-worker.js`
- Triggers: PWA installer registration (beforeinstallprompt event)
- Responsibilities: Offline caching, fetch interception, update management
- Cache strategies: Static assets (cache-first), API calls (network-first), images (cache-first)

**URL-based Deep Linking:**
- Pattern: `?movie=MOVIEID` parameter
- Location: `app.js:initialize()` URL parsing
- Responsibilities: Skip random discovery, fetch specific movie directly
- Example: `https://whichmovieto.watch/?movie=550` (Fight Club)

## Error Handling

**Strategy:** Graceful degradation with user-facing notifications and retry mechanisms.

**Patterns:**

- **API Failures:** `api.js:retryWithDifferentParams()` - Automatic retry with relaxed filters (remove genre restriction, try different page)
- **Missing Data:** Fallback to generic data or placeholder UI
- **Network Errors:** Service worker serves cached content; offline.html as final fallback
- **User Notifications:** `ui.js:showToast()` for temporary messages, inline error states for critical flows
- **Logging:** console.error() for debugging, analytics integration for tracking issues

**Examples:**
- Movie not found on selected provider: Fall back to genre-less search
- Provider lookup failed: Show movie without provider data, allow manual search
- Streaming availability not available: Display availability search modal to user
- Service worker registration failed: App still functional, just without offline support

## Cross-Cutting Concerns

**Logging:**
- Pattern: console.log() for initialization, console.error() for failures
- All major functions log inputs and outputs for debugging
- Analytics: Simple Analytics integration for user behavior tracking

**Validation:**
- Preferences: `preferences.js:validatePreferences()` ensures provider + genre selected
- API responses: Check for data.results existence, validate required fields before rendering
- User input: Search queries trimmed, genre/provider dropdowns limited to predefined values

**Authentication:**
- Approach: API key-based (TMDB public API, no user authentication)
- Secure: API keys in configurable window.TMDB_API_KEY and window.OMDB_API_KEY
- Fallback: api-config.js optional local override file

**Caching & Performance:**
- API response caching in `SearchManager.searchCache` and module-level `moviesCache`
- Image optimization via lazy loading (native loading="lazy")
- Service worker implements multiple cache strategies per asset type
- Debounced search input (prevents excessive API calls during typing)

**Accessibility:**
- ARIA live regions for dynamic content announcements
- Keyboard navigation with focus management and skip links
- High contrast mode support
- Screen reader optimizations (semantic HTML, ARIA labels)
- Color-independent visual indicators

**Theme Management:**
- `scripts/theme.js` manages dark/light mode
- CSS custom properties (variables) for theme colors
- localStorage persists user theme preference
- Media query (prefers-color-scheme) provides system default

---

*Architecture analysis: 2026-02-15*
