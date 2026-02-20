# Phase 8: Polish & Optimization - Research

**Researched:** 2026-02-19
**Domain:** Accessibility, Performance, Social Sharing, Security, Analytics, Deployment
**Confidence:** HIGH (multi-domain phase with well-established patterns)

## Summary

Phase 8 covers six distinct work streams: (1) social sharing (story cards, OG/Twitter meta tags, share buttons), (2) accessibility audit to WCAG 2.1 AA, (3) performance optimization (images, bundle size, caching), (4) Content Security Policy, (5) Simple Analytics + privacy policy page, and (6) deployment refinement. The project already has strong foundations: 148 ARIA attributes across 45 files, a skip navigation link in AppShell, focus-visible rings on interactive elements, IndexedDB + Workbox caching, and an existing vanilla JS story card generator to reference. The main technical challenges are (a) TMDB CORS for canvas-based story cards, (b) OG/Twitter meta tag limitations in client-side SPAs, and (c) the GitHub Pages vs Cloudflare Pages decision for CSP headers.

**Primary recommendation:** Stay on GitHub Pages with meta-tag CSP (simpler migration, existing infrastructure works); use React 19 native metadata hoisting for dynamic OG/Twitter tags (client-side only, sufficient for link sharing); replicate the existing canvas-based story card approach from `scripts/story-card.js` using a CORS proxy for TMDB poster images.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Instagram story card (1080x1920): **Movie poster dominant** -- large poster image with title, rating, and app branding at bottom
- Story card branding: **Theme-aware** -- gradient and accent colors match user's current theme preset (Cinema Gold/Ocean Blue/Neon Purple)
- OG/Twitter Card preview: **Generated branded card** -- landscape format with poster + ratings + app logo (not raw poster)
- Share button: **Floating share button** -- fixed position, opens share sheet
- Share options: **Both with fallback** -- Native Web Share API on mobile (if supported), custom share menu on desktop (copy link, Instagram story, Twitter/X, WhatsApp)
- Story card download: **Match existing vanilla JS implementation** -- reference `scripts/story-card.js` for the current canvas-based approach and replicate in React
- Analytics level: **Page views only** -- minimal tracking with Simple Analytics, no event tracking
- Privacy policy: **Dedicated route** at `/privacy` -- full page, not a modal
- Privacy link: **Update existing footer link** to point to the new `/privacy` route
- Skip navigation link: Required (A11Y-07 from requirements) -- already exists in AppShell

### Claude's Discretion
- Dynamic meta tags approach (client-side SPA limitations)
- Share button visibility scope (all pages vs movie view only)
- Hosting platform final decision
- CI/CD pipeline additions
- All accessibility implementation specifics (screen reader target, keyboard shortcuts, color contrast level, 3D scene accessibility)
- Consent model for Simple Analytics

### Deferred Ideas (OUT OF SCOPE)
- Home page "Discover your next movie" hero should show what streaming movies are trending now -- this is a feature change to homepage content, not polish/optimization scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SOCL-01 | Instagram story card generator (canvas-based, 1080x1920) | Canvas API with CORS proxy for TMDB images; reference `scripts/story-card.js` for existing implementation pattern |
| SOCL-02 | Dynamic Open Graph meta tags per movie | React 19 native `<meta>` JSX hoisting (client-side); limitations with crawlers documented |
| SOCL-03 | Dynamic Twitter Card meta tags per movie | Same React 19 metadata approach; Twitter falls back to OG tags when twitter: tags missing |
| SOCL-04 | Share buttons on movie cards | Web Share API (`navigator.share`) on mobile, custom share menu on desktop with fallback |
| A11Y-01 | WCAG 2.1 AA compliance across all components | Existing 148 ARIA attributes, skip link, focus rings; needs audit pass for color contrast, keyboard traps, live regions |
| SECU-01 | Content Security Policy headers configured | Meta-tag CSP in `index.html` (GitHub Pages); or `_headers` file (Cloudflare Pages) |
| PERF-02 | Image optimization: WebP, responsive srcset, lazy loading | TMDB serves JPEG only (no WebP); use responsive srcset with w185/w342/w500 sizes; lazy loading already present |
| PERF-03 | Bundle size under 500KB gzipped (excluding lazy-loaded 3D) | Current build has TS errors preventing analysis; manual chunks already configured; needs rollup-plugin-visualizer |
| PERF-05 | API response caching to minimize TMDB/OMDB requests | IndexedDB TTL cache + Workbox runtime caching already in place; needs verification/tuning |
| PRIV-01 | Privacy policy page | New React route at `/privacy`; existing `privacy.html` as content reference |
| PRIV-02 | Simple Analytics integration (privacy-focused) | `@simpleanalytics/react` package with `data-mode="hash"` for HashRouter support |
</phase_requirements>

## Standard Stack

### Core (No New Libraries Needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | ^19.0.0 | Native `<title>`, `<meta>`, `<link>` in JSX with automatic head hoisting | Built-in, no extra dependency for dynamic meta tags |
| Canvas API | Browser built-in | Story card generation (1080x1920 PNG) | Already used in `scripts/story-card.js`; no library needed |
| Web Share API | Browser built-in | Native mobile share sheet | Supported on iOS Safari, Chrome Android, Chrome desktop; feature-detect with `navigator.share` |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@simpleanalytics/react` | latest | Privacy-focused analytics | Page view tracking, hash mode for HashRouter |

### Supporting (Already Installed)
| Library | Version | Purpose | Phase 8 Use |
|---------|---------|---------|-------------|
| `motion` | ^11.0.0 | Share button entrance animation | Floating button reveal |
| `lucide-react` | ^0.469.0 | Share, Copy, Download icons | Share menu UI |
| `zustand` | ^5.0.0 | Theme preset access for story card branding | Read current preset for gradient colors |
| `idb` | ^8.0.3 | IndexedDB cache | Already handles PERF-05 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React 19 native meta | react-helmet-async / @dr.pogodin/react-helmet | Adds dependency; React 19 handles client-side hoisting natively |
| Manual canvas API | html2canvas | html2canvas cannot handle cross-origin images either; manual canvas is simpler and already proven in the codebase |
| corsproxy.io (CORS proxy) | Backend proxy | No backend exists; corsproxy.io is used in existing `scripts/story-card.js` and works for this use case |

**Installation:**
```bash
npm install @simpleanalytics/react
```

## Architecture Patterns

### Recommended Structure for Phase 8
```
src/
├── components/
│   ├── share/
│   │   ├── ShareButton.tsx          # Floating share FAB
│   │   ├── ShareMenu.tsx            # Desktop fallback share menu
│   │   └── StoryCardGenerator.ts    # Canvas-based story card (replaces scripts/story-card.js)
│   └── privacy/
│       └── PrivacyPage.tsx          # Full privacy policy page
├── hooks/
│   ├── useShare.ts                  # Web Share API + fallback logic
│   └── useMetaTags.ts              # Dynamic OG/Twitter meta tag management
└── pages/
    └── PrivacyPage.tsx              # Route wrapper (or inline in main.tsx)
```

### Pattern 1: React 19 Native Metadata Hoisting
**What:** Render `<title>`, `<meta>`, and `<link>` directly in JSX components. React 19 automatically hoists them to `<head>`.
**When to use:** When movie details change and meta tags need updating.
**Confidence:** HIGH -- verified in official React 19 docs.
```tsx
// Inside DiscoveryPage or a MovieMetaTags component
function MovieMetaTags({ movie }: { movie: TMDBMovieDetails }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w1200${movie.poster_path}`
    : '/assets/images/preview.png';
  const pageUrl = `https://www.whichmovieto.watch/?movie=${movie.id}`;
  const description = `${movie.title} (${movie.release_date?.slice(0, 4)}) - ${movie.overview?.slice(0, 150)}...`;

  return (
    <>
      <title>{movie.title} - Which Movie To Watch</title>
      <meta property="og:title" content={`${movie.title} - Which Movie To Watch`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={posterUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="video.movie" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${movie.title} - Which Movie To Watch`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={posterUrl} />
    </>
  );
}
```

**Critical SPA limitation:** Social media crawlers (Facebook, Twitter/X, LinkedIn) do NOT execute JavaScript. Client-side meta tags will NOT be visible to crawlers. This is an inherent limitation of all client-side SPAs. The meta tags WILL work for:
- Browser tab title
- When users copy/paste URLs into messaging apps that do client-side rendering
- Prerender services (if added later)
The decision to use React 19 client-side metadata is pragmatic given no backend exists.

### Pattern 2: Canvas Story Card with CORS Proxy
**What:** Generate 1080x1920 PNG story cards using Canvas API, loading TMDB posters via CORS proxy.
**When to use:** When user taps "Share to Instagram Story" button.
**Reference:** Existing `scripts/story-card.js` lines 27-55 show the CORS proxy pattern.
```tsx
async function loadPosterImage(posterPath: string): Promise<HTMLImageElement> {
  const posterUrl = `https://image.tmdb.org/t/p/w780${posterPath}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(posterUrl)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load poster'));
    img.src = proxyUrl;
  });
}
```

### Pattern 3: Web Share API with Desktop Fallback
**What:** Use `navigator.share()` on supporting browsers, show custom share menu on others.
**When to use:** When user taps floating share button.
```tsx
function useShare() {
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async (data: { title: string; text: string; url: string }) => {
    if (canNativeShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return false; // User cancelled
        // Fall through to custom menu
      }
    }
    return false; // Indicate native share was not available/failed
  };

  return { canNativeShare, share };
}
```

### Pattern 4: Simple Analytics with Hash Mode
**What:** Privacy-focused page view tracking that respects hash-based routing.
**When to use:** App-wide, mounted once in App.tsx.
**Confidence:** HIGH -- verified in Simple Analytics docs.
```tsx
// In App.tsx
import { SimpleAnalytics } from '@simpleanalytics/react';

// The @simpleanalytics/react component renders a script tag.
// For hash mode, we need to ensure the script gets data-mode="hash".
// If the React component doesn't support this prop, use manual script injection.

// Option A: If component supports mode prop
<SimpleAnalytics mode="hash" />

// Option B: Manual script tag in index.html
// <script data-mode="hash" async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
// <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
```

### Pattern 5: Meta-Tag CSP for GitHub Pages
**What:** Content Security Policy via `<meta>` tag in `index.html` since GitHub Pages cannot set HTTP headers.
**When to use:** If staying on GitHub Pages (recommended).
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://scripts.simpleanalyticscdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://image.tmdb.org data: blob: https://*.simpleanalyticscdn.com;
  font-src 'self';
  connect-src 'self' https://api.themoviedb.org https://www.omdbapi.com https://ipinfo.io https://corsproxy.io https://queue.simpleanalyticscdn.com https://prod.spline.design;
  media-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
">
```

**Note:** `'unsafe-inline'` is required for `style-src` because:
1. Tailwind v4 and Framer Motion inject inline styles at runtime
2. The FOUC prevention inline `<script>` block in `<head>` appears BEFORE the CSP meta tag, so it is not blocked by CSP (meta-tag CSP only applies to content after it in the document)

**`script-src 'self'` without `'unsafe-inline'`:** The FOUC inline script in `<head>` appears BEFORE the CSP meta tag, so it is not blocked. All other scripts are module-type loaded by Vite. This is secure.

### Anti-Patterns to Avoid
- **Don't use react-helmet for React 19 projects:** React 19 hoists `<title>`, `<meta>`, `<link>` natively. Adding react-helmet adds unnecessary complexity and bundle size.
- **Don't assume social crawlers execute JavaScript:** Client-side rendered OG/Twitter tags will NOT be seen by Facebook/Twitter crawlers. Accept this limitation or add server-side rendering (out of scope).
- **Don't use `'unsafe-eval'` in CSP:** The existing `privacy.html` has `'unsafe-eval'` in script-src. The React app does not need it and it weakens security.
- **Don't create a 404.html if migrating to Cloudflare Pages:** Cloudflare Pages auto-detects SPAs only when no 404.html exists at root. An `offline.html` is fine.
- **Don't draw TMDB images to canvas without CORS proxy:** Canvas becomes "tainted" and `toBlob()` / `toDataURL()` throw SecurityError.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Document metadata management | Custom DOM manipulation hooks | React 19 native `<meta>` / `<title>` in JSX | React 19 handles hoisting, deduplication, cleanup automatically |
| Analytics script loading | Manual `<script>` injection | `@simpleanalytics/react` component | Handles SPA lifecycle, cleanup, prevents double-loading |
| Share sheet UI on mobile | Custom share modal for all platforms | `navigator.share()` with fallback | Native OS share sheet has more share targets and better UX |
| CORS image proxying | Custom proxy server | `corsproxy.io` (existing pattern from `scripts/story-card.js`) | No backend needed; proven in the codebase already |
| Accessibility audit tooling | Manual ARIA review only | Browser devtools (Lighthouse, axe) + manual keyboard testing | Automated tools catch 30-50% of issues; combination is standard |

**Key insight:** This phase is mostly about applying existing browser APIs and established patterns, not building custom infrastructure. The biggest risk is over-engineering solutions when simple approaches exist.

## Common Pitfalls

### Pitfall 1: Canvas CORS Taint with TMDB Images
**What goes wrong:** Drawing a TMDB-hosted image to canvas without proper CORS handling taints the canvas, making `toBlob()` throw `SecurityError`.
**Why it happens:** `image.tmdb.org` does not always set `Access-Control-Allow-Origin` headers consistently.
**How to avoid:** Use `corsproxy.io` proxy as the existing `scripts/story-card.js` already does. Set `img.crossOrigin = 'anonymous'` before setting `img.src`. Always have a fallback gradient placeholder if the proxy fails.
**Warning signs:** `SecurityError: The operation is insecure` in browser console when calling `canvas.toBlob()`.

### Pitfall 2: Meta Tag CSP Inline Script Ordering
**What goes wrong:** The FOUC prevention inline script in `<head>` gets blocked by CSP.
**Why it happens:** CSP meta tag placed before the inline script blocks it.
**How to avoid:** Place the CSP `<meta>` tag AFTER the inline FOUC script. Meta-tag CSP only applies to content that appears after it in the document.
**Warning signs:** Theme flashes on page load, console shows CSP violation for inline script.

### Pitfall 3: Simple Analytics Not Tracking Hash Routes
**What goes wrong:** Page views only register for the initial page load, not for SPA navigation.
**Why it happens:** Simple Analytics overrides `pushState` by default, but HashRouter uses `hashchange` events instead.
**How to avoid:** Use `data-mode="hash"` attribute on the script tag, or verify the `@simpleanalytics/react` component supports hash mode configuration.
**Warning signs:** Analytics dashboard shows only 1 page view per session regardless of navigation.

### Pitfall 4: OG Meta Tags Not Appearing in Social Previews
**What goes wrong:** Sharing a movie URL on Facebook/Twitter shows the default preview instead of movie-specific info.
**Why it happens:** Social media crawlers don't execute JavaScript; they parse the initial HTML response only.
**How to avoid:** Accept this as an inherent SPA limitation. Set good default OG tags in `index.html` for the app's homepage. Dynamic tags will work for users copying links into apps that do client-side preview rendering.
**Warning signs:** Facebook Sharing Debugger shows generic app info instead of movie data.

### Pitfall 5: Bundle Size Regression from New Dependencies
**What goes wrong:** Adding dependencies pushes gzipped bundle over 500KB.
**Why it happens:** `@simpleanalytics/react` is tiny (~2KB), but other changes during the phase (accessibility wrappers, new components) can add up.
**How to avoid:** Run `npx vite-bundle-visualizer` after each significant addition. Track the main chunk (excluding lazy-loaded 3D) separately.
**Warning signs:** Vite build output shows chunk warnings for files over 500KB.

### Pitfall 6: Color Contrast Failures in oklch Theme System
**What goes wrong:** WCAG AA 4.5:1 contrast check fails for some text/background combinations.
**Why it happens:** oklch perceptual uniformity doesn't guarantee sufficient contrast ratios between arbitrary color pairs. The `clay-text-muted` on `clay-surface` combinations are most at risk.
**How to avoid:** Test all 6 theme variants (3 presets x 2 modes) with a contrast checker. The theme system uses CSS custom properties, so fixes propagate globally.
**Warning signs:** Lighthouse accessibility score drops; text appears washed out on certain theme combinations.

### Pitfall 7: CSP Blocking Spline Runtime
**What goes wrong:** 3D scene fails to load after CSP is applied.
**Why it happens:** Spline runtime loads `.splinecode` files from `prod.spline.design` CDN and may use dynamic code evaluation patterns internally.
**How to avoid:** Add `prod.spline.design` to `connect-src`. Test 3D scene after CSP is applied. If Spline runtime needs looser CSP, document the trade-off or accept ParallaxFallback under strict CSP.
**Warning signs:** 3D scene shows ParallaxFallback on capable devices after CSP deployment.

## Code Examples

### Story Card Generator (React/TypeScript port from scripts/story-card.js)
```tsx
// StoryCardGenerator.ts -- canvas-based, theme-aware story card
import { type ColorPreset } from '@/stores/themeStore';

interface StoryCardMovie {
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genres?: Array<{ id: number; name: string }>;
  id: number;
}

const THEME_GRADIENTS: Record<ColorPreset, [string, string]> = {
  'warm-orange': ['#1a1a2e', '#0f3460'],
  'gold':        ['#1a1520', '#2d1810'],
  'clean-white': ['#1a1a2e', '#0a1628'],
};

export async function generateStoryCard(
  movie: StoryCardMovie,
  preset: ColorPreset,
  mode: 'light' | 'dark',
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw gradient background using theme preset colors
  const [colorStart, colorEnd] = THEME_GRADIENTS[preset];
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Load poster via CORS proxy (same approach as scripts/story-card.js)
  if (movie.poster_path) {
    try {
      const img = await loadCorsImage(
        `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      );
      // Draw poster centered, large
      const posterW = 800;
      const posterH = 1200;
      const posterX = (1080 - posterW) / 2;
      const posterY = 200;

      ctx.save();
      roundRect(ctx, posterX, posterY, posterW, posterH, 20);
      ctx.clip();
      ctx.drawImage(img, posterX, posterY, posterW, posterH);
      ctx.restore();
    } catch {
      // Fallback: draw title text in poster area
    }
  }

  // ... rating, title, branding at bottom ...

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}

function loadCorsImage(url: string): Promise<HTMLImageElement> {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Poster load failed'));
    img.src = proxyUrl;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
```

### Floating Share Button Component
```tsx
// ShareButton.tsx -- fixed-position FAB with share sheet
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2 } from 'lucide-react';

export function ShareButton({ movie }: { movie: TMDBMovieDetails }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on Which Movie To Watch!`,
          url: `${window.location.origin}/#/discover?movie=${movie.id}`,
        });
        return;
      } catch { /* User cancelled or API failed */ }
    }
    setMenuOpen(true);
  };

  return (
    <>
      <motion.button
        onClick={handleShare}
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full bg-accent text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Share this movie"
      >
        <Share2 className="w-5 h-5 mx-auto" />
      </motion.button>

      <AnimatePresence>
        {menuOpen && <ShareMenu movie={movie} onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
```

### Responsive TMDB Image with srcset
```tsx
// TMDB serves JPEG only -- WebP not available from their CDN.
// Use responsive srcset for bandwidth optimization.
function ResponsivePoster({ posterPath, alt }: { posterPath: string; alt: string }) {
  return (
    <img
      src={`https://image.tmdb.org/t/p/w342${posterPath}`}
      srcSet={`
        https://image.tmdb.org/t/p/w185${posterPath} 185w,
        https://image.tmdb.org/t/p/w342${posterPath} 342w,
        https://image.tmdb.org/t/p/w500${posterPath} 500w,
        https://image.tmdb.org/t/p/w780${posterPath} 780w
      `}
      sizes="(max-width: 640px) 185px, (max-width: 1024px) 342px, 500px"
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full aspect-[2/3] object-cover rounded-2xl"
    />
  );
}
```

### CSP Domain Inventory (from codebase analysis)
```
External domains the app connects to:
- api.themoviedb.org       -- TMDB API (movie data)
- image.tmdb.org           -- TMDB images (posters, backdrops, provider logos)
- www.omdbapi.com          -- OMDB API (IMDb/RT ratings)
- ipinfo.io                -- IP geolocation
- prod.spline.design       -- Spline 3D scene files
- corsproxy.io             -- CORS proxy for canvas story cards
- scripts.simpleanalyticscdn.com  -- Simple Analytics script
- queue.simpleanalyticscdn.com    -- Simple Analytics data endpoint

Navigation-only external links (not CSP relevant for connect-src):
- youtube.com, netflix.com, amazon.com, disneyplus.com
- google.com (ticket search)
- kohulanr.com, github.com (footer links)
```

## Claude's Discretion Recommendations

### 1. Hosting Platform: Stay on GitHub Pages (RECOMMENDED)
**Reasoning:**
- The app already deploys to GitHub Pages with working CI/CD (`.github/workflows/deploy.yml`).
- Migrating to Cloudflare Pages would require: changing from HashRouter to BrowserRouter, updating deploy workflow, moving DNS, removing `offline.html` / reconfiguring SPA fallback. This is significant effort for one benefit (HTTP CSP headers vs meta-tag CSP).
- Meta-tag CSP provides adequate protection for a client-side app with no authentication or sensitive data. The main limitation (no `frame-ancestors` directive) is acceptable since the app has no framing concerns.
- The inline FOUC prevention script runs before the CSP meta tag, so it is not blocked.
- **Trade-off:** CSP via meta tag cannot use `report-uri` / `report-to` directives. For this app (no auth, no PII), this is acceptable.

### 2. Dynamic Meta Tags: React 19 Native Metadata
**Reasoning:**
- React 19 natively hoists `<title>`, `<meta>`, `<link>` from JSX to `<head>`. No library needed.
- Client-side limitation with crawlers is acknowledged. Set good defaults in `index.html` for the homepage.
- If crawler support becomes important later, add a Cloudflare Worker or prerender.io -- but that is v2 scope.

### 3. Share Button Visibility: Movie View Only (Discover Page)
**Reasoning:**
- Share makes sense when a specific movie is displayed. The floating button on Home/Trending/Free Movies pages with no single movie context would be confusing.
- Show the floating share button only on DiscoveryPage when `currentMovie` is loaded.
- The Dinner Time page already has its own service-specific sharing pattern.

### 4. Screen Reader Testing: VoiceOver (macOS/iOS)
**Reasoning:**
- Development is on macOS (Darwin 25.3.0 per environment info).
- VoiceOver is built-in, free, and represents the iOS/Mac user base.
- NVDA (Windows) is the other major target but requires Windows.
- Test with VoiceOver, validate ARIA patterns match NVDA expectations via documentation.

### 5. Keyboard Shortcuts: No Custom Shortcuts
**Reasoning:**
- Custom shortcuts (N for next, L for love, W for watched) risk conflicting with browser shortcuts and screen reader commands.
- Standard Tab/Enter/Space/Escape navigation is sufficient.
- Focus management (auto-focus on movie load, trap focus in modals) is more impactful than custom shortcuts.

### 6. Color Contrast: Target 4.5:1 AA Minimum, 7:1 Where Practical
**Reasoning:**
- WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
- The oklch-based theme system should be checked across all 6 variants. The `clay-text-muted` values are the most likely to fail.
- Aim for 7:1 (AAA) on primary content text where it does not compromise the design aesthetic.

### 7. 3D Scene Accessibility: Mark as Decorative
**Reasoning:**
- The Spline 3D scene and ParallaxFallback are purely decorative. The `aria-hidden="true"` is already set on the container div in AppShell.
- No additional accessibility work needed for the 3D layer.
- Focus should be on ensuring the 3D scene does not trap keyboard focus or interfere with screen reader navigation.

### 8. CI/CD: Add Lighthouse CI as a Non-Blocking Check
**Reasoning:**
- `@lhci/cli` or the `treosh/lighthouse-ci-action` GitHub Action can run Lighthouse on the built output.
- Make it a non-blocking check (report only, no PR gate) initially. The 90+ target is a goal, not a hard gate for CI.
- This provides performance regression visibility without blocking deployments.

### 9. Consent Model: No Consent Banner Needed
**Reasoning:**
- Simple Analytics is cookieless, GDPR-compliant by design, and does not track personal data.
- The analytics script does not set cookies, does not use localStorage, and does not fingerprint users.
- A link to the privacy policy in the footer is sufficient transparency.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-helmet for `<head>` management | React 19 native `<title>`, `<meta>`, `<link>` hoisting | React 19 (Dec 2024) | No library needed for document metadata |
| Google Analytics / GA4 | Privacy-focused alternatives (Simple Analytics, Plausible, Fathom) | 2023-2024 trend | No cookies, no consent banner, GDPR by design |
| Custom share button implementations | Web Share API (`navigator.share`) | Widely supported 2023+ | Native OS share sheet, better UX on mobile |
| `toDataURL()` for canvas export | `toBlob()` for canvas export | Chrome 50+ | Async, lower memory, no string encoding overhead |
| Manual CSP header configuration | Framework-integrated CSP (meta tag or _headers) | Ongoing | Meta tag CSP sufficient for static hosting |

**Deprecated/outdated:**
- `react-helmet`: Unmaintained since 2020. `@dr.pogodin/react-helmet` is a fork but unnecessary with React 19.
- `react-ga` (Google Analytics): Deprecated by Google themselves. GA4 is the replacement, but Simple Analytics is the user's choice.
- `navigator.clipboard.writeText()` without user gesture: Modern browsers now require transient activation for clipboard access.

## Open Questions

1. **Does `@simpleanalytics/react` support `data-mode="hash"` as a component prop?**
   - What we know: The script tag supports `data-mode="hash"`. The React component wraps the script tag.
   - What's unclear: Whether the React component exposes a `mode` or `data-mode` prop.
   - Recommendation: Check the npm package source during implementation. If not supported, fall back to manual `<script>` tag in `index.html` with `data-mode="hash"`.

2. **Does the Spline runtime require relaxed CSP?**
   - What we know: Spline loads `.splinecode` from `prod.spline.design`. The runtime decompresses and executes scene data.
   - What's unclear: Whether the decompression/execution path uses dynamic code evaluation patterns.
   - Recommendation: Test CSP without relaxed settings first. If 3D breaks, scope the relaxation narrowly or accept the fallback to ParallaxFallback under strict CSP.

3. **Current build has TypeScript errors preventing bundle analysis**
   - What we know: `tsc -b && vite build` fails with TS errors in `DinnerTimePage.tsx` and `AppShell.tsx`.
   - What's unclear: Whether these are pre-existing from Phase 7 or introduced by uncommitted changes.
   - Recommendation: Fix TS errors as a prerequisite step before performance optimization.

4. **TMDB image format: WebP availability**
   - What we know: TMDB CDN serves JPEG images at `image.tmdb.org/t/p/`. The format is not configurable via URL parameters.
   - What's unclear: Whether TMDB supports content negotiation (Accept: image/webp) for automatic WebP serving.
   - Recommendation: PERF-02 should focus on responsive `srcset` with multiple TMDB sizes rather than format conversion. The browser already uses efficient decode for JPEG.

## Sources

### Primary (HIGH confidence)
- Official React 19 docs: `<meta>` reference at react.dev/reference/react-dom/components/meta -- native metadata hoisting
- Simple Analytics React docs: docs.simpleanalytics.com/install-simple-analytics-with-react -- React component usage
- Simple Analytics hash mode: docs.simpleanalytics.com/hash-mode -- `data-mode="hash"` for HashRouter
- MDN Web Share API: developer.mozilla.org/en-US/docs/Web/API/Navigator/share -- share() method, canShare()
- MDN CORS-enabled images: developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image -- canvas taint prevention
- Cloudflare Pages headers docs: developers.cloudflare.com/pages/configuration/headers/ -- _headers file format
- GitHub community CSP discussion: github.com/orgs/community/discussions/54257 -- GitHub Pages cannot set HTTP headers
- Existing codebase: `scripts/story-card.js` -- proven canvas + CORS proxy pattern
- Existing codebase: `scripts/meta-tags.js` -- OG/Twitter tag patterns to replicate
- Existing codebase: `privacy.html` -- existing CSP and privacy policy content reference

### Secondary (MEDIUM confidence)
- Cloudflare Pages vs GitHub Pages comparison: bejamas.com/compare/cloudflare-pages-vs-github-pages
- Lighthouse CI GitHub Action: github.com/GoogleChrome/lighthouse-ci
- React 19 metadata blog: blog.logrocket.com/guide-react-19-new-document-metadata-feature/
- Bundle size optimization: frontendtools.tech/blog/reduce-javascript-bundle-size-2025
- WCAG 2.1 AA checklist: accessible.org/wcag/
- TMDB CORS forum thread: themoviedb.org/talk/65948c7146f3547172531f3c

### Tertiary (LOW confidence)
- `@simpleanalytics/react` hash mode prop support -- needs source code verification during implementation
- Spline runtime CSP compatibility -- needs empirical testing with strict CSP

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries are either already installed or well-documented with stable APIs
- Architecture: HIGH -- patterns are proven (canvas API, Web Share API, React 19 metadata), existing codebase provides reference implementations
- Pitfalls: HIGH -- CORS taint, CSP ordering, SPA crawler limitations are well-documented known issues
- Discretion recommendations: MEDIUM -- hosting platform decision involves trade-offs; recommendation is pragmatic but could be revisited

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- all APIs and libraries are stable)
