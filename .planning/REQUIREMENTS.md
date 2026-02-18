# Requirements: WhichMovieToWatch React Rewrite

**Defined:** 2026-02-15
**Core Value:** Instantly discover your next movie with a visually immersive experience that makes browsing feel as cinematic as watching.

## v1 Requirements

Requirements for the complete React rewrite. Each maps to roadmap phases.

### Foundation

- [ ] **FOUN-01**: Project scaffolded with React 19 + Vite 6 + TypeScript 5.7
- [ ] **FOUN-02**: Tailwind CSS v4 configured with claymorphism design tokens (shadows, radii, borders)
- [ ] **FOUN-03**: Zustand store initialized with localStorage hydration for all user preferences
- [ ] **FOUN-04**: HashRouter configured for GitHub Pages SPA routing
- [ ] **FOUN-05**: Build-time environment variables (VITE_TMDB_API_KEY, VITE_OMDB_API_KEY) working
- [ ] **FOUN-06**: GitHub Actions deploy workflow updated for Vite build + env injection
- [ ] **FOUN-07**: Code-splitting configured with manual chunks (react-vendor, three-vendor, animation-vendor)

### Design System

- [ ] **DSGN-01**: Claymorphism component library: cards, buttons, modals, inputs, badges with soft 3D depth (inner+outer shadows, 16-24px radii, 3-4px borders)
- [ ] **DSGN-02**: Dark mode with claymorphism adapted for dark backgrounds
- [ ] **DSGN-03**: Light mode with claymorphism on light backgrounds
- [ ] **DSGN-04**: Animated theme toggle transitions between light and dark modes
- [ ] **DSGN-05**: 2-3 curated color scheme presets (e.g., Cinema Gold, Ocean Blue, Neon Purple)
- [ ] **DSGN-06**: Color scheme switcher with animated transitions, claymorphism auto-adapts
- [ ] **DSGN-07**: Responsive layout system functioning at 375px, 768px, 1024px, 1440px breakpoints
- [ ] **DSGN-08**: Skeleton loading states with clay-styled placeholders for all async content
- [ ] **DSGN-09**: Typography system: Righteous (headings) + Poppins (body) with responsive sizing
- [ ] **DSGN-10**: SVG icon system (Lucide React) — no emoji icons in UI
- [ ] **DSGN-11**: System color scheme preference detection (prefers-color-scheme)

### Bento Grids

- [ ] **BENT-01**: Bento grid layout component with variable column/row spanning
- [ ] **BENT-02**: Animated bento grid hero section displaying trending movies, ratings, and providers
- [ ] **BENT-03**: Bento grid for feature showcase sections (discovery, dinner mode, free movies, search)
- [ ] **BENT-04**: Responsive bento grids that stack on mobile, 2-col on tablet, full on desktop
- [ ] **BENT-05**: Hover scale effects and staggered reveal animations on bento cards

### Animation

- [ ] **ANIM-01**: Framer Motion page transitions between routes (fade, slide, scale variants)
- [ ] **ANIM-02**: Scroll-triggered reveal animations for sections (whileInView, staggered children)
- [ ] **ANIM-03**: Micro-interactions: button hover/tap feedback, card tilt, toggle animations
- [ ] **ANIM-04**: Layout animations for dynamic content changes (AnimatePresence, layoutId)
- [ ] **ANIM-05**: prefers-reduced-motion fully respected — all animations disabled when set
- [ ] **ANIM-06**: Loading animations with movie-themed content (quotes, film reel)
- [ ] **ANIM-07**: Smooth animated transitions when switching color scheme presets

### 3D Experience

- [ ] **3DXP-01**: React Three Fiber 3D hero scene with floating movie posters in 3D space
- [ ] **3DXP-02**: Interactive 3D movie poster gallery with parallax depth and camera movement
- [ ] **3DXP-03**: 3D transitions between movie views (cinematic camera movements)
- [ ] **3DXP-04**: 3D background effects (particle systems, ambient motion)
- [ ] **3DXP-05**: Graceful degradation on low-end devices (detect WebGL capability, fallback to 2D)
- [ ] **3DXP-06**: Mobile-optimized 3D (<100 draw calls, LOD, instancing)
- [ ] **3DXP-07**: Lazy-loaded 3D scenes (not in main bundle, loaded on demand)

### Movie Discovery (Feature Parity)

- [ ] **DISC-01**: Random movie recommendation with smart filtering (genre, provider, rating >=6.0, popularity)
- [ ] **DISC-02**: Retry logic with relaxed filters (up to 100 retries, genre fallback)
- [ ] **DISC-03**: "Next Movie" action to discover another recommendation
- [ ] **DISC-04**: Deep linking via ?movie=ID URL parameter
- [x] **DISC-05**: Movie history tracking preventing repeats (last 1,000 movies in localStorage)
- [x] **DISC-06**: IP geolocation for regional content filtering (default: DE)

### Movie Display (Feature Parity)

- [x] **DISP-01**: Movie poster with lazy loading and error fallback placeholder
- [x] **DISP-02**: Movie metadata: title, year, runtime, genres, overview
- [x] **DISP-03**: Triple ratings display: TMDB percentage, IMDb rating, Rotten Tomatoes score
- [x] **DISP-04**: Streaming availability: Stream/Rent/Buy sections with provider logos (60+ services)
- [x] **DISP-05**: "Find Movie" cross-region availability search when not available locally
- [x] **DISP-06**: YouTube trailer link
- [x] **DISP-07**: Genre badges

### User Interactions (Feature Parity)

- [ ] **INTR-01**: "Love it" action — saves movie, fetches and displays similar recommendations
- [ ] **INTR-02**: "Watched" action — marks movie as seen, never shown again, fetches next
- [ ] **INTR-03**: "Not Interested" action — skips movie, avoids similar, fetches next
- [ ] **INTR-04**: Genre preference learning from Love interactions (weighted tracking)
- [x] **INTR-05**: Toast notification system for all user actions

### Preferences (Feature Parity)

- [ ] **PREF-01**: First-visit preference modal (streaming provider + genre selection)
- [ ] **PREF-02**: Skip preferences option
- [ ] **PREF-03**: Provider selection: Netflix, Disney+, Prime, Hulu, HBO Max, Apple TV+, Paramount+, Peacock
- [ ] **PREF-04**: Genre selection with "Any" option
- [ ] **PREF-05**: Preferences persisted in localStorage, applied to all discovery queries

### Search (Feature Parity)

- [ ] **SRCH-01**: Basic movie search with debounced text input (300ms)
- [ ] **SRCH-02**: Voice search via Web Speech API with visual feedback
- [ ] **SRCH-03**: Search results with poster, title, year, rating
- [ ] **SRCH-04**: Click search result to view full movie details
- [ ] **SRCH-05**: Search modal with close on outside click and Escape key

### Advanced Search (Feature Parity)

- [ ] **ADVS-01**: Multi-criteria filters: genre, year range, rating range, runtime range
- [ ] **ADVS-02**: Language and streaming service filters
- [ ] **ADVS-03**: Sort options (popularity, rating, release date) with asc/desc
- [ ] **ADVS-04**: Quick filter presets (90s classics, trending, short films, etc.)
- [ ] **ADVS-05**: Search caching with Map for repeat queries
- [ ] **ADVS-06**: Pagination for search results
- [ ] **ADVS-07**: Dual-range sliders for year, rating, runtime filters

### Trending (Feature Parity)

- [x] **TRND-01**: "Now Playing" in theaters section, region-aware
- [x] **TRND-02**: Auto-refresh every 30 minutes
- [x] **TRND-03**: Movie links with poster, title, rating
- [x] **TRND-04**: Fallback to popular movies if now_playing fails

### Dinner Time Mode (Feature Parity)

- [x] **DINR-01**: Family-friendly movie finder for Netflix/Prime/Disney+
- [x] **DINR-02**: Dedicated modal experience with movie details
- [x] **DINR-03**: Direct "Watch on [Service]" button linking to service search
- [x] **DINR-04**: Like/dislike preference tracking for dinner time recommendations

### Free Movies (Feature Parity)

- [x] **FREE-01**: 1,000+ legally free YouTube movies from data/movies.txt
- [x] **FREE-02**: TMDB metadata + OMDB ratings fetched for free movies
- [x] **FREE-03**: "Watch on YouTube" button + "Next Suggestion" button
- [x] **FREE-04**: Regional availability disclaimer

### Social Sharing (Feature Parity)

- [ ] **SOCL-01**: Instagram story card generator (canvas-based, 1080x1920)
- [ ] **SOCL-02**: Dynamic Open Graph meta tags per movie
- [ ] **SOCL-03**: Dynamic Twitter Card meta tags per movie
- [ ] **SOCL-04**: Share buttons on movie cards

### PWA (Feature Parity)

- [ ] **PWA-01**: Service worker with offline support via Vite PWA plugin + Workbox
- [ ] **PWA-02**: Offline fallback page
- [ ] **PWA-03**: Install prompts (including iOS-specific instructions)
- [ ] **PWA-04**: Update notifications when new version available
- [ ] **PWA-05**: Multi-layer caching: static assets (cache-first), API responses (network-first), images (cache-first)
- [ ] **PWA-06**: Web app manifest with icons, theme color, standalone display

### Accessibility

- [ ] **A11Y-01**: WCAG 2.1 AA compliance across all components
- [x] **A11Y-02**: ARIA labels on all interactive elements
- [ ] **A11Y-03**: Keyboard navigation with visible focus rings
- [x] **A11Y-04**: Screen reader optimized (semantic HTML, ARIA live regions)
- [ ] **A11Y-05**: prefers-reduced-motion disables all animations
- [ ] **A11Y-06**: Color contrast minimum 4.5:1 for text in both light and dark modes
- [ ] **A11Y-07**: Skip navigation link

### Security

- [ ] **SECU-01**: Content Security Policy headers configured
- [ ] **SECU-02**: Input sanitization for search queries
- [ ] **SECU-03**: API keys injected at build time only (never in source code)
- [x] **SECU-04**: Secure external links (rel="noopener noreferrer")

### Performance

- [ ] **PERF-01**: Three.js lazy loaded — not in initial bundle
- [ ] **PERF-02**: Image optimization: WebP format, responsive srcset, lazy loading
- [ ] **PERF-03**: Bundle size under 500KB gzipped (excluding lazy-loaded 3D)
- [ ] **PERF-04**: Lighthouse performance score >= 90 on desktop
- [ ] **PERF-05**: API response caching to minimize TMDB/OMDB requests

### Privacy & Analytics

- [ ] **PRIV-01**: Privacy policy page
- [ ] **PRIV-02**: Simple Analytics integration (privacy-focused)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Intelligence

- **INTL-01**: AI-powered natural language search ("family-friendly action from 2020s")
- **INTL-02**: Cross-device watchlist sync (requires backend)
- **INTL-03**: Push notifications for new releases matching preferences

### Social

- **SOCV-01**: Share movie lists/collections with friends
- **SOCV-02**: Collaborative movie night decision making

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/server infrastructure | Stays fully client-side for simplicity and zero hosting cost |
| User accounts/authentication | Anonymous usage is a privacy feature, not a limitation |
| Database (beyond localStorage) | localStorage sufficient for single-device preference tracking |
| Native mobile app | PWA provides native-like experience without app store overhead |
| Paid features/monetization | Free tool, no business model complexity |
| AI/ML recommendation engine | TMDB's built-in similar movies + genre learning is sufficient |
| Real-time chat/social features | Not aligned with single-user movie discovery core value |
| Video streaming/playback | We link to platforms, not host content |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 1 | Pending |
| FOUN-04 | Phase 1 | Pending |
| FOUN-05 | Phase 1 | Pending |
| FOUN-06 | Phase 1 | Pending |
| FOUN-07 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |
| DSGN-04 | Phase 1 | Pending |
| DSGN-05 | Phase 1 | Pending |
| DSGN-06 | Phase 1 | Pending |
| DSGN-07 | Phase 1 | Pending |
| DSGN-08 | Phase 1 | Pending |
| DSGN-09 | Phase 1 | Pending |
| DSGN-10 | Phase 1 | Pending |
| DSGN-11 | Phase 1 | Pending |
| SECU-03 | Phase 1 | Pending |
| A11Y-06 | Phase 1 | Pending |
| DISC-05 | Phase 2 | Complete |
| DISC-06 | Phase 2 | Complete |
| DISC-01 | Phase 3 | Pending |
| DISC-02 | Phase 3 | Pending |
| DISC-03 | Phase 3 | Pending |
| DISC-04 | Phase 3 | Pending |
| DISP-01 | Phase 3 | Complete |
| DISP-02 | Phase 3 | Complete |
| DISP-03 | Phase 3 | Complete |
| DISP-04 | Phase 3 | Complete |
| DISP-05 | Phase 3 | Complete |
| DISP-06 | Phase 3 | Complete |
| DISP-07 | Phase 3 | Complete |
| INTR-01 | Phase 3 | Pending |
| INTR-02 | Phase 3 | Pending |
| INTR-03 | Phase 3 | Pending |
| INTR-04 | Phase 3 | Pending |
| INTR-05 | Phase 3 | Complete |
| PREF-01 | Phase 3 | Pending |
| PREF-02 | Phase 3 | Pending |
| PREF-03 | Phase 3 | Pending |
| PREF-04 | Phase 3 | Pending |
| PREF-05 | Phase 3 | Pending |
| SRCH-01 | Phase 3 | Pending |
| SRCH-02 | Phase 3 | Pending |
| SRCH-03 | Phase 3 | Pending |
| SRCH-04 | Phase 3 | Pending |
| SRCH-05 | Phase 3 | Pending |
| ADVS-01 | Phase 3 | Pending |
| ADVS-02 | Phase 3 | Pending |
| ADVS-03 | Phase 3 | Pending |
| ADVS-04 | Phase 3 | Pending |
| ADVS-05 | Phase 3 | Pending |
| ADVS-06 | Phase 3 | Pending |
| ADVS-07 | Phase 3 | Pending |
| TRND-01 | Phase 3 | Complete |
| TRND-02 | Phase 3 | Complete |
| TRND-03 | Phase 3 | Complete |
| TRND-04 | Phase 3 | Complete |
| DINR-01 | Phase 3 | Complete |
| DINR-02 | Phase 3 | Complete |
| DINR-03 | Phase 3 | Complete |
| DINR-04 | Phase 3 | Complete |
| FREE-01 | Phase 3 | Complete |
| FREE-02 | Phase 3 | Complete |
| FREE-03 | Phase 3 | Complete |
| FREE-04 | Phase 3 | Complete |
| A11Y-02 | Phase 3 | Complete |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 3 | Complete |
| A11Y-07 | Phase 3 | Pending |
| SECU-02 | Phase 3 | Pending |
| SECU-04 | Phase 3 | Complete |
| PWA-01 | Phase 4 | Pending |
| PWA-02 | Phase 4 | Pending |
| PWA-03 | Phase 4 | Pending |
| PWA-04 | Phase 4 | Pending |
| PWA-05 | Phase 4 | Pending |
| PWA-06 | Phase 4 | Pending |
| ANIM-01 | Phase 5 | Pending |
| ANIM-02 | Phase 5 | Pending |
| ANIM-03 | Phase 5 | Pending |
| ANIM-04 | Phase 5 | Pending |
| ANIM-05 | Phase 5 | Pending |
| ANIM-06 | Phase 5 | Pending |
| ANIM-07 | Phase 5 | Pending |
| A11Y-05 | Phase 5 | Pending |
| BENT-01 | Phase 6 | Pending |
| BENT-02 | Phase 6 | Pending |
| BENT-03 | Phase 6 | Pending |
| BENT-04 | Phase 6 | Pending |
| BENT-05 | Phase 6 | Pending |
| 3DXP-01 | Phase 7 | Pending |
| 3DXP-02 | Phase 7 | Pending |
| 3DXP-03 | Phase 7 | Pending |
| 3DXP-04 | Phase 7 | Pending |
| 3DXP-05 | Phase 7 | Pending |
| 3DXP-06 | Phase 7 | Pending |
| 3DXP-07 | Phase 7 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-04 | Phase 7 | Pending |
| SOCL-01 | Phase 8 | Pending |
| SOCL-02 | Phase 8 | Pending |
| SOCL-03 | Phase 8 | Pending |
| SOCL-04 | Phase 8 | Pending |
| A11Y-01 | Phase 8 | Pending |
| SECU-01 | Phase 8 | Pending |
| PERF-02 | Phase 8 | Pending |
| PERF-03 | Phase 8 | Pending |
| PERF-05 | Phase 8 | Pending |
| PRIV-01 | Phase 8 | Pending |
| PRIV-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 93 total
- Mapped to phases: 93
- Unmapped: 0

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after roadmap creation*
