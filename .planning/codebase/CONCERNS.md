# Codebase Concerns

**Analysis Date:** 2026-02-15

## Tech Debt

**API Key Exposure in Code:**
- Issue: API keys are hardcoded as placeholders (`__API_KEY__`, `__OMDB_API_KEY__`) in `scripts/api.js` lines 4-5. While GitHub Actions replaces these, local development requires a separate `api-config.js` file (which is .gitignored but not automatically created).
- Files: `scripts/api.js`, `.github/workflows/deploy.yml`
- Impact: Developers new to the project must manually create api-config.js; deployment could fail if GitHub Secrets aren't configured correctly
- Fix approach: Create a template `api-config.example.js` file; add pre-commit validation script

**Duplicated Genre and Provider Mappings:**
- Issue: Genre IDs (28, 12, 16...) and streaming provider IDs are hardcoded in multiple files: `scripts/api.js`, `scripts/search-manager.js`, and `scripts/utils.js`. Same data repeated 3+ times without DRY principle.
- Files: `scripts/api.js` (lines 438-457), `scripts/search-manager.js` (lines 32-80), `scripts/utils.js` (lines 6-65)
- Impact: Maintenance burden; if TMDB IDs change, three files must be updated simultaneously
- Fix approach: Create a single `scripts/constants.js` file with genre/provider maps; import in all consumers

**Hardcoded Country Default:**
- Issue: Default country is hardcoded as `'DE'` (Germany) in `scripts/api.js` line 11 and referenced in comments in CLAUDE.md line 98. No configuration system for changing default region.
- Files: `scripts/api.js` line 11
- Impact: Users in other regions see incorrect default streaming availability until geolocation completes
- Fix approach: Move to configuration object; respect browser locale as fallback

**Provider ID Magic Numbers:**
- Issue: Provider IDs (8 for Netflix, 9 for Prime, 337 for Disney+) are repeated throughout code as magic numbers without explanation.
- Files: `scripts/api.js` (lines 108-115, 364-375), `scripts/search-manager.js` (lines 71-80), `scripts/utils.js` (lines 9-25)
- Impact: Hard to understand intent; error-prone when updating provider lists
- Fix approach: Use named constants (NETFLIX_ID = 8, PRIME_ID = 9, etc.)

**Uncontrolled Retry Limits:**
- Issue: `fetchRandomMovie()` in `scripts/api.js` accepts `maxRetries` parameter (default 100, line 21) with no validation. Deep recursion can cause stack overflow on slow connections.
- Files: `scripts/api.js` lines 21, 69-73, 110-112, 141
- Impact: Poor error handling on unreliable networks; potential performance degradation
- Fix approach: Implement tail recursion or convert to iterative loop; add explicit stack depth check

## Known Bugs

**Netflix Search Autocomplete XSS Vulnerability:**
- Symptoms: Inline `onclick` handlers built with template literals in `scripts/utils.js` line 987 use unescaped movie titles. Movie titles with quotes/apostrophes break the HTML attribute.
- Files: `scripts/utils.js` lines 987
- Trigger: Search for a movie with apostrophe in title (e.g., "It's a Wonderful Life")
- Workaround: Avoid apostrophes in search queries; use double-quote escape manually
- Example: `onclick="selectNetflixMovie(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')"` — the replace is present but insufficient for complex titles
- Fix approach: Use dataset attributes instead of inline onclick; bind event listeners in JavaScript

**Movie Cache Corruption on Browser Storage Quota Exceeded:**
- Symptoms: `loadFreeMovies()` in `scripts/api.js` caches all 1000+ movies in memory (line 313) without checking storage limits. If localStorage is full, streaming provider filtering fails silently.
- Files: `scripts/api.js` lines 299-329, `scripts/preferences.js` (localStorage writes)
- Trigger: User adds many loved/watched movies → localStorage fills → subsequent free movie loads return stale/incomplete data
- Workaround: Clear browser cache manually
- Fix approach: Implement quota check before cache write; use IndexedDB for large datasets

**Country Detection Fallback Chain Issues:**
- Symptoms: `detectCountry()` in `scripts/api.js` (lines 273-296) uses IPInfo.io as primary, falls back to browser locale. If both fail, `userCountry` becomes undefined, breaking all streaming availability checks.
- Files: `scripts/api.js` lines 273-296
- Trigger: User behind VPN or in region with IP geolocation blocked; navigator.language is 'zh' or similar non-region code
- Workaround: Manually set country in browser localStorage
- Fix approach: Add explicit fallback to 'US'; validate country code format; provide manual country selection UI

**Modal Focus Trap Infinite Loop:**
- Symptoms: `accessibility-manager.js` line 327 checks for modal visibility every 500ms with setInterval, never clears if modal is stuck in display:flex state.
- Files: `scripts/accessibility-manager.js` lines 284-328
- Trigger: Close modal via keyboard ESC while focus trap is active; reopen same modal
- Workaround: Refresh page
- Fix approach: Clear interval on modal destroy; use MutationObserver instead of polling

**Search Manager Cache Memory Leak:**
- Symptoms: `searchManager.searchCache` in `scripts/search-manager.js` is a Map (line 25) with no size limit. After many searches, cache grows unbounded.
- Files: `scripts/search-manager.js` lines 25, 156-162, 238
- Trigger: User performs 100+ different search queries
- Impact: High memory usage; search results take longer to serialize/deserialize
- Workaround: Manual browser cache clear
- Fix approach: Implement LRU eviction (max 50 cached queries); add cache.size() check with purge

## Security Considerations

**OMDB API Key Exposure on Client:**
- Risk: OMDB API key (`window.OMDB_API_KEY`) is exposed in browser's global scope, visible in DevTools. Rate limits can be exhausted by attackers.
- Files: `scripts/api.js` line 5
- Current mitigation: GitHub Actions deplaces key at build time; local dev requires separate file
- Recommendations:
  - Move OMDB calls to a backend proxy (new service)
  - Implement CORS-enabled wrapper on a cheap serverless platform (AWS Lambda, Netlify Functions)
  - Or: Remove OMDB ratings entirely and display only TMDB scores

**Missing Subresource Integrity (SRI) for CDN Resources:**
- Risk: Font Awesome, GSAP, and Lottie are loaded from CDN without SRI hashes. A CDN breach or MITM attack could inject malicious code.
- Files: `index.html` lines 57-64
- Current mitigation: None
- Recommendations:
  - Add `integrity="sha384-..."` attributes to all `<script>` and `<link>` tags from CDNs
  - Use https://www.srihash.org to generate SRI hashes
  - Document in security policy

**Insufficient Content Security Policy (CSP):**
- Risk: CSP in `index.html` lines 47-55 uses `'unsafe-inline'` and `'unsafe-eval'` for scripts, defeating most XSS protections.
- Files: `index.html` lines 47-55
- Current mitigation: No DOM sanitization; inline onclick handlers throughout codebase
- Recommendations:
  - Remove `'unsafe-eval'` (not needed for vanilla JS)
  - Minimize `'unsafe-inline'` use; externalize inline styles to CSS classes
  - Add nonce-based CSP for unavoidable inline scripts
  - Use template escaping for all user-generated HTML

**Unencrypted LocalStorage User Data:**
- Risk: Watched/loved/not-interested movie lists stored in plaintext localStorage; can be read by any script with document.domain access.
- Files: `scripts/preferences.js` (localStorage access throughout), `scripts/api.js` line 11 (userCountry)
- Current mitigation: No user authentication (fully anonymous app)
- Recommendations:
  - Document privacy stance clearly (user data never leaves browser)
  - Use sessionStorage for sensitive filters (cleared on tab close)
  - Consider IndexedDB encryption library if feature expands

**Geolocation via Third-Party IP Service:**
- Risk: IPInfo.io call sends user IP to external service; privacy concern in EU/GDPR context.
- Files: `scripts/api.js` lines 275
- Current mitigation: Fallback to browser locale if IP service fails
- Recommendations:
  - Add privacy policy notice before geolocation attempt
  - Provide manual country override UI
  - Use browser Geolocation API (if granted) instead of IP-based detection

## Performance Bottlenecks

**N+1 API Calls in Movie Discovery Flow:**
- Problem: `fetchRandomMovie()` in `scripts/api.js` fetches initial movie list (1 call), then loops through each movie to check watch providers (up to 20 calls per page). For 50 movies shown, up to 50 sequential API calls.
- Files: `scripts/api.js` lines 79-97
- Cause: TMDB discover endpoint doesn't include provider data; must fetch separately per movie
- Improvement path: Batch provider checks; implement parallel Promise.all() for up to 5 concurrent requests; cache provider data for 1 hour

**Inefficient Search Result Rendering:**
- Problem: `searchManager.displayResults()` in `scripts/search-manager.js` generates HTML for ALL results (potentially 500 movies) as a single string (line 642), then sets as innerHTML. DOM is parsed and rendered at once.
- Files: `scripts/search-manager.js` lines 583-652
- Cause: No pagination on display; all results rendered even if user only sees first 10
- Improvement path: Implement virtual scrolling (IntersectionObserver-based lazy rendering); render only visible items + buffer

**Accessibility Manager Poll Overhead:**
- Problem: `setupModalFocusManagement()` in `scripts/accessibility-manager.js` line 327 uses `setInterval(checkModals, 500)` globally, checking all 5 modals every 500ms, even when none are visible.
- Files: `scripts/accessibility-manager.js` lines 289-327
- Cause: Constant polling; no event-driven approach
- Improvement path: Replace with MutationObserver on DOM; only check specific modals when visibility changes

**Service Worker Cache Strategy Inefficiency:**
- Problem: `service-worker.js` uses stale-while-revalidate pattern for static assets (line 102-106), but updates cache synchronously on every page load, blocking main thread.
- Files: `service-worker.js` lines 95-123
- Cause: No cache versioning; cache.put() happens in main fetch handler
- Improvement path: Move cache update to background sync; use versioned cache names; implement TTL

**Unoptimized Image Loading:**
- Problem: `image-optimizer.js` creates blur-up placeholders for every TMDB image but doesn't throttle requests. If 20 movie posters load simultaneously, 20 parallel image requests + 20 placeholder generation tasks.
- Files: `scripts/image-optimizer.js` lines 166-186
- Cause: No request throttling; no lazy load intersection observer
- Improvement path: Implement request queue (max 3 concurrent); use native `loading="lazy"` attribute; defer placeholder generation until image near viewport

## Fragile Areas

**Streaming Provider Availability Logic (Complex Conditional Nesting):**
- Files: `scripts/api.js` lines 76-127, `scripts/search-manager.js` lines 220-224
- Why fragile: Multiple nested try-catch blocks, fallback logic with genre override, provider matching with both ID and name comparison. Hard to trace execution path.
- Safe modification: Add unit tests for each branch (provider found, no provider, genre fallback, no provider after fallback); document intent above each nested block
- Test coverage: Manual testing only; no automated tests for retry logic variations

**Netflix Search Autocomplete State Management:**
- Files: `scripts/utils.js` lines 917-1090
- Why fragile: Multiple global timeouts (`netflixAutocompleteTimeout`), manual DOM manipulation, event listener cleanup incomplete. If user opens/closes Netflix modal rapidly, listeners accumulate.
- Safe modification: Encapsulate in class with proper cleanup; use AbortController for fetch cancellation
- Test coverage: No tests; relies on manual browser testing

**Modal Focus Trap with Dynamic Content:**
- Files: `scripts/accessibility-manager.js` lines 338-351
- Why fragile: `createFocusTrap()` queries focusable elements at creation time (line 342). If modal content updates dynamically (search results added), trap references stale elements.
- Safe modification: Re-run trap creation on MutationObserver event; document modal structure assumptions
- Test coverage: Manual keyboard navigation testing only

**Movie History Tracking with Circular References:**
- Files: `scripts/preferences.js` (not shown but referenced in `scripts/api.js` line 72, 93, etc.)
- Why fragile: `shownMovies` array stored in localStorage, can grow unbounded. If localStorage serialization encounters circular reference, JSON.stringify fails silently.
- Safe modification: Add explicit circular reference check; implement history rotation (keep only last 1000); add data validation on load
- Test coverage: None

## Scaling Limits

**LocalStorage Quota Exhaustion:**
- Current capacity: ~5-10MB depending on browser (most allocate 5MB per origin)
- Limit: With ~20 movies per key (watchedMovies, lovedMovies, shownMovies, searchHistory, preferences), total size approaches 500KB+. If user saves 100+ searches, quota fills quickly.
- Scaling path: Migrate to IndexedDB (typically 50MB+ quota); implement compression for large datasets; add explicit quota management UI

**TMDB API Rate Limiting:**
- Current capacity: 40 requests/second (standard tier) or 4 requests/second (low tier)
- Limit: With N users fetching movies simultaneously, concurrent requests quickly hit limit. Errors cascade across users.
- Scaling path: Implement backend caching layer; batch TMDB calls; add client-side request debouncing; upgrade TMDB tier or migrate to cached data source

**Search Cache Memory Growth:**
- Current capacity: Map with no size limit; typical search result: 20 movies × 1KB = 20KB per result
- Limit: 1000 cached results = 20MB memory per user; multiple tabs = 40MB+
- Scaling path: LRU cache with max 50 results; session-based cache (cleared on tab close); backend search API with persistent cache

**Service Worker Cache Staleness:**
- Current capacity: 4 named caches (static, runtime, movie, image) with no expiration
- Limit: Image cache can grow to 100MB+ if user views 1000+ movies
- Scaling path: Implement cache expiration (30-day TTL); add cache size limits; use versioned cache names for automatic purging

## Dependencies at Risk

**OMDB API Dependency:**
- Risk: Free tier has rate limits (1000 calls/day); API discontinued in some regions; paid tier required for production use
- Impact: IMDb and Rotten Tomatoes ratings fail to load; affects user decision-making
- Migration plan: Remove OMDB entirely; display only TMDB vote_average; or implement backend proxy to cache ratings; or integrate RottenTomatoes scraper (legal risk)

**GSAP Animation Library (3.12.2):**
- Risk: Heavy library (100+KB); not used for critical functionality (only animations/polish)
- Impact: Slower initial page load; cascading layout shift if GSAP loads late
- Migration plan: Remove GSAP; rewrite animations with native CSS + requestAnimationFrame; keep only if performance budget allows

**Lottie Web (5.12.2):**
- Risk: Large JSON animation files; single-point dependency on CDN; no fallback
- Impact: Slow load times; offline users see blank animations
- Migration plan: Replace with simple CSS spinners; cache Lottie JSON in service worker

**Font Awesome Icons (6.0.0):**
- Risk: Font file ~120KB; 400+ icons loaded even if only 20 used
- Impact: Significant bundle size; slow on 3G networks
- Migration plan: Use system fonts + emoji; or implement icon tree-shaking; or SVG sprite sheet

## Missing Critical Features

**No Rate Limiting/Error Recovery:**
- Problem: If TMDB API is down, app shows "try again" button with no backoff strategy. Rapid clicking overwhelms API further.
- Blocks: Users cannot recover gracefully from service outages
- Fix: Implement exponential backoff; add alert notification for known outages; show cached data as fallback

**No User Authentication/Sync:**
- Problem: All data stored in browser; user switches devices and loses all preferences
- Blocks: Personalization doesn't persist; features like "saved searches" are device-specific
- Fix: Add anonymous auth (Firebase, Supabase); sync preferences to backend; support device switching

**No Search Analytics:**
- Problem: No insight into what movies users search for, which recommendations are clicked, which features are used
- Blocks: Product decisions based on incomplete data; cannot prioritize improvements
- Fix: Add event logging (page view, search, movie click); respect DNT header; anonymize data

**No Offline Movie Discovery:**
- Problem: Without internet, app cannot fetch movies; service worker only caches already-viewed content
- Blocks: Airplane mode usage; unreliable networks
- Fix: Pre-cache trending movies on first load; implement client-side ML recommendation model; sync periodic data snapshots

## Test Coverage Gaps

**Untested Retry Logic:**
- What's not tested: `fetchRandomMovie()` with maxRetries=100; edge cases like hitting retry limit, genre fallback, provider fallback
- Files: `scripts/api.js` lines 21-143
- Risk: Retry logic can silently fail or loop indefinitely; no way to verify behavior without manual testing
- Priority: High — affects core feature stability

**No Automated Tests for Search Filtering:**
- What's not tested: Genre combinations, year range edge cases (1900 vs 2026), rating filters, runtime filters, streaming service availability filtering
- Files: `scripts/search-manager.js` lines 140-290
- Risk: Filter combinations can produce incorrect results; no regression detection
- Priority: High — affects core search UX

**No Tests for Accessibility Features:**
- What's not tested: Focus trap, keyboard navigation (Tab, Arrow keys, ESC), screen reader announcements, high contrast mode
- Files: `scripts/accessibility-manager.js` entire file
- Risk: Regressions in accessibility break user experience for keyboard/screen reader users
- Priority: Medium — affects subset of users but legally important (ADA compliance)

**No Caching Strategy Tests:**
- What's not tested: Search result caching, image caching, service worker cache strategies (cache-first vs network-first), cache eviction
- Files: `scripts/search-manager.js` lines 156-162, `service-worker.js` lines 94-123
- Risk: Cache bugs cause stale data or unbounded memory growth; no way to verify eviction works
- Priority: Medium — affects performance and reliability

**No Modal and UI State Tests:**
- What's not tested: Modal open/close transitions, focus trap setup/teardown, multiple modals open simultaneously, modal reopening
- Files: `scripts/utils.js` (modal functions), `scripts/accessibility-manager.js` (focus management)
- Risk: Modals can get stuck open, focus lost, unexpected behavior when reopening
- Priority: Medium — affects UX quality

---

*Concerns audit: 2026-02-15*
