# Technology Stack

**Analysis Date:** 2026-02-15

## Languages

**Primary:**
- JavaScript (ES6+) - Frontend application code, all interactive features
- HTML5 - Document structure and semantic markup
- CSS3 - Styling, animations, theme system

**Secondary:**
- Bash - GitHub Actions deployment scripts
- Plain text - Local data storage (`data/movies.txt`)

## Runtime

**Environment:**
- Browser (vanilla JavaScript, no Node.js or build step)

**Package Manager:**
- None (zero npm dependencies)
- Lockfile: Empty `package.json` with no dependencies

## Frameworks

**Core:**
- Vanilla JavaScript (ES6+) - No framework required, class-based OOP pattern used where needed

**Animation:**
- GSAP 3.12.2 (via CDN) - Advanced animations, ScrollTrigger, TextPlugin plugins
- Lottie Web 5.12.2 (via CDN) - Animated graphics and vector animations

**Icons:**
- Font Awesome 6.0.0 (via CDN) - Icon library

**Build/Dev:**
- None - No build process, no bundler, no transpilation
- Static file server for development (`python3 -m http.server` or VS Code Live Server)
- GitHub Actions for CI/CD deployment

## Key Dependencies

**External Libraries (CDN-based):**
- GSAP 3.12.2 (`https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/`)
  - Core library for DOM animations and scroll-based effects
  - ScrollTrigger plugin for viewport-triggered animations
  - TextPlugin for animated text effects
- Lottie Web 5.12.2 (`https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js`)
  - Renders Bodymovin animations and interactive graphics
- Font Awesome 6.0.0 (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/`)
  - Icon system for buttons, navigation, and UI elements

**No server-side dependencies:**
- No Express, Django, Rails, or similar
- No database ORM (uses localStorage only)
- No authentication library (fully client-side, anonymous)
- No build tools (Webpack, Parcel, Vite, etc.)

## Configuration

**Environment:**
- API keys injected via:
  - Local development: `api-config.js` file (gitignored) with `window.TMDB_API_KEY` and `window.OMDB_API_KEY`
  - Production: GitHub Actions replaces `__API_KEY__` and `__OMDB_API_KEY__` placeholders in `scripts/api.js` with secrets

**Build:**
- No build configuration files (no `webpack.config.js`, `vite.config.js`, `tsconfig.json`, etc.)
- GitHub Actions workflow at `.github/workflows/deploy.yml`:
  - Triggered on push to `main`
  - Replaces API key placeholders
  - Deploys to GitHub Pages using `peaceiris/actions-gh-pages@v4`

**Development:**
- No linter configuration (no `.eslintrc`, `.prettierrc`)
- No test configuration (no `jest.config.js`, `vitest.config.json`)
- Static files served directly with no transformation

## Platform Requirements

**Development:**
- Any modern browser with JavaScript ES6+ support
- Static file server (built-in or via `python3 -m http.server`)
- Git for version control
- GitHub account for GitHub Actions CI/CD

**Production:**
- Deployment target: GitHub Pages (static hosting)
- Requires GitHub repository with Actions enabled
- No server infrastructure required (entirely client-side)
- Browser requirement: Modern browser with:
  - Fetch API support
  - Service Worker support (for PWA offline functionality)
  - localStorage API
  - CSS Custom Properties (CSS variables)

## Security

**Content Security Policy:**
Configured in `index.html` `<meta http-equiv="Content-Security-Policy">`:
- `script-src`: Allows inline scripts, CDNJS, Font Awesome CDN, Simple Analytics CDN
- `style-src`: Allows inline styles, CDNJS, Google Fonts
- `img-src`: Allows images from TMDB, placeholder services, Simple Analytics
- `font-src`: Allows fonts from Google Fonts, CDNJS
- `connect-src`: Allows API calls to TMDB, OMDB, IPInfo.io, YouTube, RapidAPI
- `worker-src`: Service worker from same origin only

**API Key Security:**
- API keys never committed to git (`.gitignore` includes `api-config.js`)
- GitHub Secrets used for deployment-time placeholder replacement
- No backend to hide keys; front-end keys are visible but read-only (API keys have limited scope)

## Offline Support

**Service Worker:**
- Cached at `service-worker.js`
- Caches: static assets (`moviewatch-v1.0.0`), API responses (`movie-data-v1`), images (`movie-images-v1`)
- Network-first strategy for TMDB API calls
- Cache-first strategy for images and static assets
- Graceful degradation with `offline.html` fallback

## Performance

**Critical CSS:**
- Injected inline during load (via `performance-manager.js`)
- Prevents render-blocking for above-the-fold content

**Image Optimization:**
- Lazy loading via `image-optimizer.js`
- Responsive TMDB image URLs (width preset `w500`)
- Placeholder images while loading

**Caching Strategies:**
- Service Worker multi-cache approach for different resource types
- LocalStorage for user preferences (up to ~1000 movie IDs stored)

---

*Stack analysis: 2026-02-15*
