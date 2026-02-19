# Codebase Structure

**Analysis Date:** 2026-02-15

## Directory Layout

```
whichmovietowatch/
├── index.html                      # Main HTML entry point, PWA manifest registration
├── offline.html                    # Fallback page for offline scenarios
├── service-worker.js               # PWA service worker with offline caching
├── site.webmanifest                # PWA manifest (icons, app name, theme)
├── privacy.html                    # Privacy policy page
├── CHANGELOG.md                    # Version history and release notes
├── CITATION.cff                    # Citation metadata for academic references
├── CLAUDE.md                       # Development and orchestration guide
├── README.md                       # Main project documentation
├── LICENSE                         # MIT Commons Clause license
├── package.json                    # Minimal npm config (no dependencies)
├── package-lock.json               # Lock file for npm
├── .gitignore                      # Git exclusion rules
├── .github/
│   └── workflows/                  # GitHub Actions CI/CD
├── .planning/
│   └── codebase/                   # Codebase analysis documents
├── .claude/                        # Claude Code configuration
├── assets/
│   ├── images/                     # Project and promotional images
│   └── favicon_io/                 # Favicon assets in multiple formats
├── css/
│   ├── styles.css                  # Main stylesheet (66KB, core UI)
│   ├── themes.css                  # Theme colors (dark/light mode)
│   ├── advanced-search.css         # Advanced search/filter modal styles
│   ├── visual-enhancements.css     # UI improvements and polish
│   ├── professional-animations.css # Polished animation effects
│   ├── netflix-modal-enhanced.css  # Netflix search modal styling
│   ├── loading.css                 # Loading state animations
│   └── light-mode-fixes.css        # Light mode specific corrections
├── scripts/
│   ├── app.js                      # Core MovieApp class, lifecycle management
│   ├── api.js                      # TMDB API integration, movie discovery
│   ├── ui.js                       # DOM manipulation, movie card rendering
│   ├── utils.js                    # Utilities: provider URLs, country mapping
│   ├── preferences.js              # localStorage management, user preferences
│   ├── search-manager.js           # Advanced search, filtering, pagination
│   ├── search.js                   # Basic search functionality
│   ├── filter-panel.js             # Filter UI component management
│   ├── story-card.js               # Canvas-based social media card generator
│   ├── meta-tags.js                # Dynamic meta tag updates (SEO, social)
│   ├── trending.js                 # Trending movies section management
│   ├── accessibility-manager.js    # WCAG 2.1 AA compliance (31KB)
│   ├── pwa-installer.js            # PWA installation and update prompts
│   ├── theme.js                    # Dark/light mode switching
│   ├── professional-animations.js  # Professional animation effects
│   ├── advanced-animations.js      # Advanced visual effects (18KB)
│   ├── visual-enhancements.js      # UI enhancement utilities
│   ├── performance-manager.js      # Lazy loading, image optimization
│   ├── image-optimizer.js          # Image loading and caching
│   └── loading.js                  # Loading indicator state management
└── data/
    └── movies.txt                  # Static free movies list (seed data)
```

## Directory Purposes

**Root Directory:**
- Purpose: Entry point and core application files
- Contains: HTML, service worker, manifest, configuration files
- Key files: `index.html` (main entry), `service-worker.js` (offline support), `site.webmanifest` (PWA)

**css/:**
- Purpose: All stylesheets for UI rendering and theming
- Contains: Global styles, component styles, animations, responsive design
- Key files: `styles.css` (66KB core), `advanced-search.css` (21KB), `themes.css` (light/dark colors)
- Pattern: Each feature or concern typically has dedicated CSS file (not inlined)

**scripts/:**
- Purpose: All application logic organized by feature/concern
- Contains: 20+ modules, total ~500KB of vanilla JavaScript
- Organization: Feature modules (search, trending), Core app (app.js), Utilities (utils.js), Managers (AccessibilityManager, PWAInstaller, etc.)
- No bundler: All scripts loaded sequentially via <script> tags; no npm build step

**assets/:**
- Purpose: Static media and resources
- Contains: Favicon in multiple sizes/formats (browser tab icon), promotional images
- Key files: `favicon.ico`, `apple-touch-icon.png` (iOS home screen)

**data/:**
- Purpose: Static data files
- Contains: `movies.txt` - list of free/legal movie streaming sources (used for "free movies" feature)

## Key File Locations

**Entry Points:**
- `/index.html`: Initial HTML page loaded by browser. DOM structure, script loading, PWA manifest link
- `/service-worker.js`: Registered by PWA installer, handles offline caching and fetch interception

**Configuration:**
- `scripts/api.js`: TMDB API key, OMDB key, BASE_URL configuration (lines 1-7)
- `site.webmanifest`: PWA name, icons, theme colors, start URL

**Core Logic:**
- `scripts/app.js`: MovieApp class - central application state and lifecycle
- `scripts/api.js`: All external API calls (TMDB, OMDB, geolocation, streaming-availability)
- `scripts/ui.js`: DOM manipulation, rendering movies, modals, components
- `scripts/preferences.js`: localStorage operations, user state persistence

**Feature Modules:**
- `scripts/search-manager.js`: Advanced search implementation (SearchManager class)
- `scripts/filter-panel.js`: Filter UI and interaction (FilterPanel class)
- `scripts/search.js`: Basic search functionality (separate from SearchManager)
- `scripts/trending.js`: Trending movies section (separate component)
- `scripts/story-card.js`: Canvas-based social sharing cards (StoryCardGenerator class)

**Enhancement Modules:**
- `scripts/accessibility-manager.js`: WCAG 2.1 compliance (AccessibilityManager class, 31KB)
- `scripts/pwa-installer.js`: PWA lifecycle (PWAInstaller class, 21KB)
- `scripts/meta-tags.js`: Dynamic SEO meta tags (21KB)
- `scripts/performance-manager.js`: Performance optimization, lazy loading (13KB)
- `scripts/advanced-animations.js`: GSAP-based animations (17KB)
- `scripts/visual-enhancements.js`: UI polish and enhancements (9KB)

**Testing:**
- No dedicated test directory - this is a production SPA with no automated test suite

**Utilities:**
- `scripts/utils.js`: Provider URL mapping, country name lookups, genre ID mapping, helper functions (37KB)
- `scripts/theme.js`: Dark/light mode toggle implementation (1.3KB)
- `scripts/loading.js`: Loading indicator state management (6KB)
- `scripts/image-optimizer.js`: Image lazy loading and optimization (10KB)

## Naming Conventions

**Files:**
- **Pattern:** kebab-case for all files (e.g., `search-manager.js`, `accessibility-manager.js`)
- **Classes:** PascalCase in files (e.g., `class SearchManager {}` in `search-manager.js`)
- **Utilities:** Single function or simple utilities (e.g., `getProviderURL()` in `utils.js`)

**Directories:**
- **Pattern:** lowercase with hyphens (e.g., `css/`, `scripts/`, `assets/`)
- **Grouped by type:** Not by feature domain (scripts not organized as scripts/search/, scripts/api/)

**HTML/CSS Classes:**
- **Pattern:** kebab-case (e.g., `movie-card`, `filter-panel`, `streaming-section`)
- **State classes:** `is-open`, `is-loading`, `is-active` (BEM-like modifier pattern)

**JavaScript Variables:**
- **Pattern:** camelCase for variables (e.g., `currentMovie`, `preferredProvider`, `searchCache`)
- **Constants:** UPPER_SNAKE_CASE for module-level constants (e.g., `CACHE_NAME`, `BASE_URL`, `API_KEY`)
- **Functions:** camelCase for both sync and async functions

**IDs & Data Attributes:**
- **Pattern:** kebab-case (e.g., `id="movieCard"`, `id="advancedSearchModal"`)
- **API data:** snake_case preserved from TMDB (e.g., `vote_average`, `release_date`, `watch/providers`)

## Where to Add New Code

**New Feature:**
- **Primary code:** Create new module in `scripts/feature-name.js`
- **Styling:** Create `css/feature-name.css` or add to existing module CSS
- **Integration:** Import in `index.html` <script> tag before `scripts/app.js`
- **Example:** For "watchlist" feature, create `scripts/watchlist.js` and `css/watchlist.css`

**New Component/Module:**
- **Implementation:** If reusable UI component (e.g., like StoryCardGenerator, FilterPanel), use class-based pattern
- **Pattern:** `class ComponentName { constructor() { ... }, methodOne() { ... } }`
- **Location:** `scripts/component-name.js`
- **Initialization:** Either instantiate in another module or expose globally for initialization in `app.js`

**Utilities & Helpers:**
- **Shared helpers:** Add to `scripts/utils.js` if general purpose (provider URLs, country mapping)
- **Feature-specific helpers:** Keep in feature module or create sibling utility file (e.g., `scripts/search-utils.js`)

**Styling:**
- **New component styles:** Create dedicated file (e.g., `css/watchlist.css`) for maintainability
- **Responsive design:** Use mobile-first approach, add breakpoints for tablets/desktop
- **CSS custom properties:** Use existing theme variables from `css/themes.css` for colors

**API Integration:**
- **New API calls:** Add to `scripts/api.js` following existing patterns
- **URL building:** Use BASE_URL constant, API_KEY configuration
- **Error handling:** Use try-catch with console.error(), fall back gracefully

## Special Directories

**`.github/workflows/`:**
- Purpose: CI/CD pipeline automation (GitHub Actions)
- Generated: Yes (automatically updated by workflow runs)
- Committed: Yes (contains workflow YAML files)
- Usage: Automated API key injection, deployment, build verification

**`.planning/codebase/`:**
- Purpose: Analysis and planning documents for development orchestration
- Generated: Yes (created by `/gsd:map-codebase` commands)
- Committed: Yes (part of project documentation)
- Usage: Referenced by `/gsd:plan-phase` and `/gsd:execute-phase` commands

**`assets/favicon_io/`:**
- Purpose: Multiple favicon formats for cross-browser support
- Generated: No (manually created/updated)
- Committed: Yes (part of app assets)
- Formats: .ico, .png (16x16, 32x32, 192x192), .webp variants

**`data/`:**
- Purpose: Static data files
- Generated: No (manually maintained)
- Committed: Yes (seed data for features)
- Usage: `movies.txt` loaded for "free movies" discovery feature

## Script Loading Order & Importance

**Load order matters for dependency resolution:**

1. **External Libraries (CDN):** GSAP, Lottie, Font Awesome (no dependencies)
2. **API Configuration:** `api.js` (must load before any module using API)
3. **Data Layer:** `preferences.js`, `utils.js` (used by all features)
4. **Feature Modules:** `search-manager.js`, `filter-panel.js`, `search.js`, `trending.js`, etc.
5. **Display Layer:** `ui.js` (depends on all data layers)
6. **App Core:** `app.js` (depends on all other modules, orchestrates initialization)
7. **Deferred Scripts:** `loading.js`, `pwa-installer.js`, `image-optimizer.js` (loaded with defer attribute)

**Script tags in index.html (lines 501-521):**
- Scripts without defer: Execute immediately in order (blocking)
- Scripts with defer: Execute after HTML parsing in order (non-blocking)

---

*Structure analysis: 2026-02-15*
