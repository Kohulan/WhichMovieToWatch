# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- kebab-case: `search-manager.js`, `filter-panel.js`, `accessibility-manager.js`, `pwa-installer.js`, `meta-tags.js`, `visual-enhancements.js`, `professional-animations.js`, `advanced-animations.js`, `story-card.js`, `performance-manager.js`, `image-optimizer.js`
- Descriptive and functional naming - file name describes what module does
- Example: `utils.js` (provider utilities), `api.js` (API integration), `ui.js` (DOM rendering), `app.js` (main controller)

**Functions:**
- camelCase: `fetchRandomMovie()`, `displayMovie()`, `savePreferences()`, `searchMovies()`, `trackShownMovie()`, `getProviderId()`, `hasMovieBeenShown()`
- Descriptive verbs as prefix: `fetch*`, `display*`, `search*`, `track*`, `get*`, `has*`, `save*`, `load*`, `create*`
- Async functions clearly marked with `async` keyword
- Private utility functions prefixed with lowercase: `debounce()` in `search.js`

**Variables:**
- camelCase for all variables: `movieCard`, `preferredProvider`, `preferredGenre`, `userCountry`, `streamingProviders`, `availableMovies`, `shownMovies`, `notInterestedMovies`, `loadingAnimation`
- Constants in UPPER_SNAKE_CASE: `API_KEY`, `OMDB_API_KEY`, `BASE_URL`, `IMAGE_BASE_URL`, `MAJOR_STREAMING_SERVICES`
- Boolean variables prefixed with `is` or `has`: `isLoading`, `hasMovieBeenShown()`, `isMobile`, `isOpen`
- Single-letter loop variables acceptable: `i`, `p` in `for...of` loops

**Classes:**
- PascalCase: `MovieApp`, `SearchManager`, `FilterPanel`, `AccessibilityManager`, `PWAInstaller`, `LoadingManager`
- Class properties use camelCase: `this.filters`, `this.searchHistory`, `this.activeFilters`, `this.debounceTimer`
- Private properties follow same convention (no underscore prefix used)

## Code Style

**Formatting:**
- No automated formatter enforced (no ESLint/Prettier config found)
- 4-space indentation observed in most files (inconsistent in some edge cases)
- Semicolons used throughout
- Double quotes for strings in most cases; template literals for HTML generation
- Trailing commas in object/array literals vary

**Linting:**
- No ESLint or linting configuration found
- Code follows vanilla JavaScript ES6+ conventions without strict linting rules

## Import Organization

**Order:**
- N/A: No ES modules used. All code uses global namespace via `window` object
- Global variable declaration at top of files: constants like `API_KEY`, `BASE_URL`
- State/cache variables declared early: `moviesCache = null`, `userCountry = 'DE'`
- Class definitions and function definitions follow

**Global Objects:**
- `window.TMDB_API_KEY`, `window.OMDB_API_KEY` - externally injected for API auth
- All module instances expose to window: `window.metaTagsManager`, `window.loadingManager`, `window.accessibilityManager`
- Class instances instantiated globally: `const app = new MovieApp()`, `const searchManager = new SearchManager()`, `const filterPanel = new FilterPanel()`

## Error Handling

**Patterns:**
- Try-catch blocks used for all async operations and DOM manipulations
- Errors logged to console: `console.error('Error message:', error)`
- User-facing errors via toast notifications: `showToast('User-friendly message')`
- Fallback behavior on error (e.g., retry logic in `fetchRandomMovie()`)
- API failures trigger retry mechanism with exponential backoff (up to 100 retries in some cases)

**Error Recovery Examples:**
- In `api.js` `fetchRandomMovie()`: retries with different parameters or genres if initial fetch fails
- In `app.js` `validateAndFetch()`: catches API validation error and retries after 2s delay
- In `ui.js` `displayMovie()`: wraps in try-catch, shows error message via `displayError()`
- In `preferences.js` `showPreferenceModal()`: handles modal display errors gracefully

## Logging

**Framework:** Console object (no logging library used)

**Patterns:**
- `console.log()` for informational messages: `console.log('Initializing Movie Application...')`
- `console.log()` for debug info: `console.log('Fetching movie with preferences:', {...})`
- `console.error()` for errors: `console.error('Error fetching movie:', error)`
- No structured logging format enforced
- High frequency of console logs observed (855+ occurrences across 20 files)

**Where logging appears:**
- API call initialization and completion
- Movie discovery/fetch operations
- User preference changes
- Error conditions
- Deep linking operations (`?movie=123`)
- Development debug info

## Comments

**When to Comment:**
- Block comments above function definitions explaining purpose
- Inline comments explaining complex logic or non-obvious behavior
- Comments for commented-out code explaining why it exists
- Section headers: `// Main movie fetching function`, `// Event listener setup`, `// API validation and initial fetch`

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- Some classes use block comment headers: `/** SearchManager - Advanced Search & Filtering System */`
- Most functions documented via inline comments rather than JSDoc
- Example in `search-manager.js` line 1-4: `/** * SearchManager - Advanced Search & Filtering System * Implements PRD-003 requirements for comprehensive movie search */`

## Function Design

**Size:**
- Functions generally 10-50 lines for utility functions
- Async handlers can reach 100+ lines (e.g., `fetchRandomMovie()` is 150+ lines)
- Methods in classes range 20-80 lines on average
- Large functions often have clear section breaks via comments

**Parameters:**
- Most functions take 0-3 parameters
- Optional parameters with default values: `async function fetchRandomMovie(retryCount = 0, maxRetries = 100, temporaryGenreOverride = null)`
- Object parameters passed for complex configurations: `SearchManager` uses object-based filter structure
- Functions avoid parameter-heavy signatures; prefer object destructuring for multiple related params

**Return Values:**
- Async functions return Promises (implicit via async)
- Utility functions return values: `getProviderURL()` returns string, `hasMovieBeenShown()` returns boolean
- Event handlers typically return undefined (void functions)
- Template functions return HTML strings for DOM insertion

## Module Design

**Exports:**
- Classes exported implicitly via global namespace: `class MovieApp { }` accessible as `new MovieApp()`
- Functions exported via window: `window.searchMovies`, `window.displayMovie`, `window.fetchRandomMovie`
- No explicit export statements (no module system)

**Barrel Files:**
- N/A: No barrel files or re-export patterns used
- Each script file loads independently via `<script>` tag in `index.html`
- Script load order matters (dependencies must appear before dependents)

**File Organization Pattern:**
- One main class per file (e.g., `SearchManager` in `search-manager.js`)
- Related utility functions grouped: `utils.js` contains provider mapping functions
- Supporting modules organized by concern: animations, accessibility, performance, PWA features

**Inline HTML in JavaScript:**
- Template literals extensively used for HTML generation
- Classes and functions generate HTML strings with interpolation
- Example in `search.js` lines 32-51: map array to HTML strings with embedded data attributes
- Example in `ui.js` lines 53-78: conditional HTML blocks for streaming sections

**Event Handling Patterns:**
- Mixed approach: Both `addEventListener` and inline `onclick` attributes used
- Class-based handlers attach listeners in `init()` or constructor: `document.addEventListener('DOMContentLoaded', () => this.init())`
- Inline handlers in generated HTML: `<button onclick="filterPanel.togglePanel()">`
- Method binding in constructor: `this.handleError = this.handleError.bind(this)` to preserve context

---

*Convention analysis: 2026-02-15*
