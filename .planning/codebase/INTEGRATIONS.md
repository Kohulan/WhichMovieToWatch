# External Integrations

**Analysis Date:** 2026-02-15

## APIs & External Services

**Movie Database (Primary):**
- TMDB (The Movie Database)
  - What it's used for: Comprehensive movie metadata, posters, genres, ratings, streaming availability by region, video/trailer data, search, discover endpoints
  - SDK/Client: Vanilla fetch (no SDK)
  - Base URL: `https://api.themoviedb.org/3`
  - Image host: `https://image.tmdb.org/t/p/w500`
  - API Key: `window.TMDB_API_KEY` (environment variable)
  - Key endpoints used:
    - `GET /discover/movie` - Random movie discovery with genre/rating filters (primary discovery function)
    - `GET /movie/{id}` - Movie details with `append_to_response=watch/providers` for streaming availability
    - `GET /movie/{id}/videos` - Trailer and video data (YouTube)
    - `GET /movie/{id}/external_ids` - IMDb ID lookup
    - `GET /movie/{id}/similar` - Recommendation suggestions
    - `GET /search/movie` - Title-based search
    - `GET /configuration` - API validation endpoint

**External Ratings:**
- OMDB (Open Movie Database)
  - What it's used for: IMDb ratings and Rotten Tomatoes scores (fetched via IMDb ID)
  - SDK/Client: Vanilla fetch
  - Base URL: `https://www.omdbapi.com/`
  - API Key: `window.OMDB_API_KEY` (environment variable)
  - Endpoint: `GET /?i={imdbId}&apikey={apiKey}` - Ratings from IMDb and Rotten Tomatoes

## Data Storage

**Client-Side Storage:**
- LocalStorage (browser)
  - User preferences: `preferredProvider`, `preferredGenre`
  - Movie history: `watchedMovies`, `lovedMovies`, `notInterestedMovies`, `shownMovies` (up to 1000 IDs each)
  - Dinner time ratings: `dinnerTimeLikes`, `dinnerTimeDislikes`
  - UI state: `theme` (dark/light), accessibility settings (`fontSize`, `highContrast`, `reducedMotion`, etc.)
  - Timestamp: `lastUpdate`, `preferencesLastUpdated`
  - No sensitive data stored (movie IDs only)

**Service Worker Caches:**
- Static assets: `moviewatch-v1.0.0`
- API responses: `movie-data-v1`
- Images: `movie-images-v1`
- Runtime: `runtime-cache-v1`

**Flat File Data:**
- `data/movies.txt` - 1000+ free YouTube movies
  - Format: Tab-separated values (YouTube_ID\tTitle)
  - Used for: "Free Movies" section
  - Updated manually, committed to repository

**No traditional database:**
- No SQL database
- No NoSQL database
- Entirely browser-based state management

## Geolocation & Localization

**IP Geolocation:**
- IPInfo.io
  - What it's used for: Detect user's country code for regional streaming availability filtering
  - Base URL: `https://ipinfo.io/json`
  - Response fields used: `country`, `country_code`
  - Fallback: If IPInfo.io fails, uses browser language (`navigator.language`) to determine region
  - Implementation: Called in `detectCountry()` function in `scripts/api.js`
  - Default region: Germany (`'DE'`) if detection fails

**Streaming Provider Mapping:**
- Hardcoded in `scripts/preferences.js`:
  - Netflix: `8`
  - Amazon Prime Video: `9`
  - Disney+: `337`
  - Hulu: `15`
  - HBO Max: `384`
  - Apple TV+: `350`
  - Paramount+: `531`
  - Peacock: `386`
- Maps user-selected provider name to TMDB provider ID for watch/providers API filtering

## Authentication & Identity

**Auth Approach:**
- No authentication system
- Fully anonymous, client-side only
- No user accounts, login, or signup
- No session tokens or cookies for auth
- API keys have read-only access to movie data

## Monitoring & Observability

**Analytics:**
- Simple Analytics
  - What it's used for: Privacy-focused usage analytics
  - Script source: `https://scripts.simpleanalyticscdn.com`
  - Integration point: Included in CSP and loaded in `index.html`
  - No personal data collection (privacy-first)
  - Called via `window.analytics.track()` in performance-manager.js and pwa-installer.js

**Error Tracking:**
- Browser console logging (`console.error()`, `console.warn()`, `console.log()`)
- No centralized error tracking service (Sentry, Rollbar, etc.)

**Logging:**
- Console-based only
- Debug logs for API calls, state changes, feature interactions
- Performance metrics reported to Simple Analytics when available

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static site hosting)
- Repository: `https://github.com/Kohulan/WhichMovieToWatch`
- Domain: `whichmovieto.watch` (custom domain via CNAME)

**CI Pipeline:**
- GitHub Actions
  - File: `.github/workflows/deploy.yml`
  - Trigger: Push to `main` branch
  - Steps:
    1. Checkout code
    2. Replace `__API_KEY__` and `__OMDB_API_KEY__` placeholders in `scripts/api.js` with GitHub Secrets
    3. Deploy to GitHub Pages using `peaceiris/actions-gh-pages@v4`
  - Secrets used: `TMDB_API_KEY`, `OMDB_API_KEY`

**No staging environment:**
- Direct push-to-deploy model
- Main branch is production
- No separate staging or preview deployments

## Environment Configuration

**Required environment variables (GitHub Secrets):**
- `TMDB_API_KEY` - The Movie Database API key (must be obtained from https://www.themoviedb.org/settings/api)
- `OMDB_API_KEY` - Open Movie Database API key (must be obtained from http://www.omdbapi.com/)

**Local development configuration:**
Create `api-config.js` in project root (gitignored):
```javascript
window.TMDB_API_KEY = 'your_tmdb_key_here';
window.OMDB_API_KEY = 'your_omdb_key_here';
```

**Default values:**
- `userCountry`: Defaults to `'DE'` (Germany) if geolocation fails

## Webhooks & Callbacks

**Incoming Webhooks:**
- None

**Outgoing Webhooks:**
- None

**Callbacks:**
- YouTube embeds for trailers (player.youtube.com)
  - User clicks trailer button
  - Opens YouTube video player in modal
  - No data sent to YouTube beyond standard analytics

## External CDN Resources

**CSS Libraries:**
- Font Awesome 6.0.0: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/`
- Custom fonts: `https://fonts.googleapis.com`, `https://fonts.gstatic.com`

**JavaScript Libraries:**
- GSAP 3.12.2: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/`
  - Core library, ScrollTrigger, TextPlugin plugins
- Lottie Web 5.12.2: `https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/`

**All external resources allowed in CSP (Content Security Policy)**

## CORS & Cross-Origin Requests

**Same-Origin Requests:**
- All local scripts and stylesheets (same origin as index.html)
- localStorage API (same origin)
- Service Worker (same origin)

**Cross-Origin Requests (via CORS):**
- TMDB API (`api.themoviedb.org`) - GET requests only, CORS enabled
- OMDB API (`omdbapi.com`) - GET requests only, CORS enabled
- IPInfo.io (`ipinfo.io`) - GET requests only, CORS enabled
- TMDB Images (`image.tmdb.org`) - Image resources, CORS enabled
- YouTube (`youtube.com`) - Trailer embeds only, loaded in iframe
- Simple Analytics CDN (`simpleanalyticscdn.com`) - CORS enabled
- Proxy service: `https://corsproxy.io` - Listed in CSP for potential CORS issues

## Rate Limiting & Quotas

**TMDB API:**
- Rate limit: 40 requests per 10 seconds per IP address (v3 API standard)
- Retry logic: Up to 100 retries with different parameters (in `fetchRandomMovie()`)
- No explicit backoff implementation; relies on request timing

**OMDB API:**
- Rate limit: Depends on subscription tier (usually 1000 requests per day for free tier)
- Fetched only when IMDb ID is available (secondary enrichment)

**IPInfo.io:**
- Free tier: 50,000 requests per month
- Called once per session on load

---

*Integration audit: 2026-02-15*
