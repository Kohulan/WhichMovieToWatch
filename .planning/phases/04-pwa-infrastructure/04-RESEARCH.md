# Phase 4: PWA Infrastructure - Research

**Researched:** 2026-02-18
**Domain:** Progressive Web App — service workers, caching strategies, install prompts, manifest
**Confidence:** HIGH (primary sources: vite-plugin-pwa official docs, npm registry, MDN)

---

## Summary

Phase 4 adds PWA infrastructure to the React/Vite rewrite using `vite-plugin-pwa` v1.2.0 (the current stable release as of research date). The plugin wraps Google's Workbox library and provides zero-config service worker generation, manifest injection, and virtual React hooks (`virtual:pwa-register/react`) for update prompts and offline-ready notifications.

The app already has an IndexedDB-based cache layer (from Phase 2) for API response TTL management. The service worker adds a complementary layer: static asset precaching (cache-first via Workbox) and runtime caching for TMDB images (cache-first) and API routes (network-first). These operate in separate cache namespaces — the IndexedDB layer handles structured app-level data with TTL logic while the service worker's Cache Storage handles HTTP-level response caching for offline resilience. They do not conflict.

The existing vanilla app's `service-worker.js`, `site.webmanifest`, and `pwa-installer.js` serve as exact behavioral specifications for what this phase must reproduce. The icons (`public/favicon_io/`) and offline page design (`offline.html`) can be adapted directly into the Vite build. The main new work is: wiring `vite-plugin-pwa` into `vite.config.ts`, creating a `ReloadPrompt` React component using `useRegisterSW`, building a `useInstallPrompt` hook for `beforeinstallprompt` + iOS detection, and authoring an `offline.html` in `public/`.

**Primary recommendation:** Use `generateSW` strategy (not `injectManifest`) — it provides all required caching behaviors via declarative `runtimeCaching` config without requiring a hand-rolled service worker file. Switch to `injectManifest` only if custom service worker logic becomes necessary later.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-01 | Service worker with offline support via Vite PWA plugin + Workbox | `vite-plugin-pwa` v1.2.0 + `workbox-window` v7.4.0; `generateSW` strategy handles this automatically |
| PWA-02 | Offline fallback page | `workbox.navigateFallback: '/offline.html'` + `offline.html` in `public/` + `includeAssets: ['offline.html']` |
| PWA-03 | Install prompts (including iOS-specific instructions) | Custom `useInstallPrompt` hook: `beforeinstallprompt` for Chrome/Edge/Android, separate iOS UA detection for Safari |
| PWA-04 | Update notifications when new version available | `useRegisterSW` from `virtual:pwa-register/react`; `registerType: 'prompt'`; `ReloadPrompt` component uses `needRefresh` state |
| PWA-05 | Multi-layer caching: static assets (cache-first), API responses (network-first), images (cache-first) | Workbox `runtimeCaching` with `handler: 'CacheFirst'` and `handler: 'NetworkFirst'` per URL pattern |
| PWA-06 | Web app manifest with icons, theme color, standalone display | `manifest` option in `VitePWA()` config; icons already exist in `public/favicon_io/` |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vite-plugin-pwa` | 1.2.0 | Vite plugin that generates service worker + injects manifest | Industry standard for Vite PWA; wraps Workbox; provides React virtual modules |
| `workbox-window` | 7.4.0 (bundled) | Client-side SW lifecycle management | Bundled as dependency of `vite-plugin-pwa`; powers `useRegisterSW` |
| `workbox-build` | 7.4.0 (bundled) | Build-time SW generation | Bundled as dependency of `vite-plugin-pwa`; handles `generateSW` / `injectManifest` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vite-pwa/assets-generator` | 1.0.2 | CLI to generate all icon sizes from single SVG source | Use if existing icons need to be regenerated or are missing sizes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `generateSW` strategy | `injectManifest` | `injectManifest` gives full control over SW code but requires maintaining a custom `sw.ts` file; not needed here since the existing vanilla SW logic maps directly to Workbox `runtimeCaching` config |
| `registerType: 'prompt'` | `registerType: 'autoUpdate'` | `autoUpdate` silently reloads tabs mid-session — dangerous for users filling in the onboarding form; `prompt` mode (default) is always safer |

**Installation:**
```bash
npm install -D vite-plugin-pwa
```
Note: `workbox-window` and `workbox-build` are installed automatically as dependencies. No separate install needed.

---

## Architecture Patterns

### Recommended Project Structure
```
public/
├── offline.html          # Offline fallback — plain HTML, no React, self-contained CSS
├── favicon_io/           # Already exists — icons referenced by manifest
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── apple-touch-icon.png
└── ...

src/
├── components/
│   └── pwa/
│       ├── ReloadPrompt.tsx     # Update notification toast (useRegisterSW)
│       └── InstallBanner.tsx    # Install prompt (beforeinstallprompt + iOS)
├── hooks/
│   └── useInstallPrompt.ts     # beforeinstallprompt event + iOS detection
└── vite-env.d.ts               # Add: /// <reference types="vite-plugin-pwa/react" />

vite.config.ts                  # VitePWA() plugin added here
```

### Pattern 1: Vite Plugin Configuration (generateSW)
**What:** Configure `VitePWA()` in `vite.config.ts` with manifest, runtime caching, and offline fallback
**When to use:** Always — this is the entry point for all PWA behavior

```typescript
// Source: https://vite-pwa-org.netlify.app/guide/
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['offline.html', 'favicon_io/*.png', 'favicon_io/favicon.ico'],
      manifest: {
        name: 'Which Movie To Watch',
        short_name: 'MovieWatch',
        description: 'Find your next favorite movie with personalized recommendations',
        theme_color: '#0E0E12',
        background_color: '#0E0E12',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['entertainment', 'movies', 'lifestyle'],
        icons: [
          {
            src: 'favicon_io/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // TMDB API — network-first with cache fallback (PWA-05)
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tmdb-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          // OMDB API — network-first (ratings data)
          {
            urlPattern: /^https:\/\/www\.omdbapi\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'omdb-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days (ratings rarely change)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          // TMDB images — cache-first (posters don't change) (PWA-05)
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-images-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,            // Enable SW in dev for testing
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  base: '/',
  // ... rest of existing config
})
```

### Pattern 2: Update Prompt Component (PWA-04)
**What:** React component that uses `useRegisterSW` to show a toast when a new SW version is available
**When to use:** Mount once in `App.tsx` root — appears on top of all routes

```typescript
// Source: https://vite-pwa-org.netlify.app/frameworks/react
// src/components/pwa/ReloadPrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Optional: check for updates periodically
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000) // hourly
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    // Toast positioned bottom-right, uses existing Sonner or custom clay toast
    <div className="fixed bottom-4 right-4 z-50 ...">
      <p>
        {offlineReady
          ? 'App ready to work offline'
          : 'New version available — click to update'}
      </p>
      {needRefresh && (
        <button onClick={() => updateServiceWorker(true)}>Reload</button>
      )}
      <button onClick={close}>Dismiss</button>
    </div>
  )
}
```

**TypeScript setup** — add to `src/vite-env.d.ts`:
```typescript
/// <reference types="vite-plugin-pwa/react" />
```

### Pattern 3: Install Prompt Hook (PWA-03)
**What:** Custom hook that captures `beforeinstallprompt` for Chromium browsers and separately detects iOS for manual instructions
**When to use:** `beforeinstallprompt` fires on Chrome/Edge/Samsung Internet on Android and desktop. iOS Safari never fires it — must detect via UA.

```typescript
// Source: MDN + blog.wick.technology/pwa-install-prompt
// src/hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react'

const INSTALL_DISMISSED_KEY = 'wmtw-pwa-install-dismissed'
const DAYS_BEFORE_REPROMPT = 7

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (standalone) {
      setIsInstalled(true)
      return
    }

    // iOS detection — beforeinstallprompt never fires on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    // Check if recently dismissed
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY)
    if (dismissed) {
      const days = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
      if (days < DAYS_BEFORE_REPROMPT) return
    }

    if (ios) {
      // Show iOS instructions after delay
      setTimeout(() => setShowPrompt(true), 3000)
      return
    }

    // Chromium: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!installEvent) return
    installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'dismissed') dismiss()
    setInstallEvent(null)
    setShowPrompt(false)
  }

  const dismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()))
    setShowPrompt(false)
  }

  return { showPrompt, isIOS, isInstalled, install, dismiss }
}
```

### Anti-Patterns to Avoid

- **Using `registerType: 'autoUpdate'`** without considering forms: auto-update silently reloads the browser window, which loses any in-progress form state (e.g., the onboarding modal). Use `'prompt'` instead.

- **Setting `purpose: 'any maskable'` on a single icon**: Google recommends separate icons for `any` and `maskable` purposes. A maskable icon with safe-zone content looks wrong as a regular icon. Have two separate icon entries at 512x512.

- **Forgetting `html` in `globPatterns`**: If you override `globPatterns`, you MUST include `**/*.html`. Omitting it causes `WorkboxError: non-precached-url index.html` in production.

- **Relying on the offline fallback for SPA routes**: `navigateFallback: '/offline.html'` is the offline case. For online navigation to hash routes, `HashRouter` already handles this client-side. Do not use `navigateFallback` for normal SPA routing — it only fires when the network request fails.

- **Testing only in dev mode**: `devOptions.enabled: true` runs an SW in dev but its behavior differs from production. Always run `npm run build && npm run preview` to test actual offline behavior.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Custom `sw.js` with `install`/`activate`/`fetch` handlers | `vite-plugin-pwa` `generateSW` | Handles precache manifest versioning, cache busting on deploy, Workbox strategies, and cleanup of old caches automatically |
| Cache versioning | Manual cache name bumping | Workbox (via `vite-plugin-pwa`) | Workbox generates content-hashed manifests; old caches are automatically cleaned up on SW activation |
| Update detection | `registration.addEventListener('updatefound')` polling | `useRegisterSW` from `virtual:pwa-register/react` | Handles the full lifecycle: detecting, waiting, and activating the new SW with correct `skipWaiting` messaging |
| Manifest generation | Hardcoded `manifest.json` in `public/` | `manifest` option in `VitePWA()` | Plugin injects the manifest into `<head>` automatically; handles `application/manifest+json` MIME type |

**Key insight:** The vanilla `service-worker.js` (230 lines) implements exactly what Workbox's `generateSW` + `runtimeCaching` config produces in ~40 lines of declarative config. The hand-rolled version doesn't add value and misses edge cases Workbox handles (opaque responses, cache size limits, network timeout fallback).

---

## Common Pitfalls

### Pitfall 1: Missing globPatterns entries cause WorkboxError in production
**What goes wrong:** After deploying, users see `WorkboxError: non-precached-url index.html` in the console. The app fails to load offline.
**Why it happens:** If you override `workbox.globPatterns`, the plugin stops using defaults. Forgetting `**/*.html` means `index.html` is not in the precache manifest.
**How to avoid:** Always include `['**/*.{js,css,html,ico,png,svg,woff2}']` when overriding `globPatterns`. Verify the generated SW file after build to confirm `index.html` is listed.
**Warning signs:** SW registers but offline fallback never works; browser console shows WorkboxError.

### Pitfall 2: iOS PWA install prompt approach is completely different from Android/desktop
**What goes wrong:** Developer tests install prompt on Chrome/desktop, ships it, then discovers iOS users see nothing because `beforeinstallprompt` never fires on any iOS browser.
**Why it happens:** Apple does not support `beforeinstallprompt`. Chrome and Edge on iOS are required to use WebKit's rendering engine, so they also don't support it. Only Safari on iOS supports "Add to Home Screen" via the share sheet.
**How to avoid:** Detect iOS via UA string (`/iPad|iPhone|iPod/.test(navigator.userAgent)`), then show a separate modal with step-by-step instructions ("Tap the Share button → Add to Home Screen").
**Warning signs:** Install button works on Android but silently does nothing on iPhones.

### Pitfall 3: autoUpdate mode causes data loss during onboarding
**What goes wrong:** A user opens the onboarding modal (provider/genre selection), a new SW version deploys while they're filling it out, the page auto-reloads, losing their selections.
**Why it happens:** `registerType: 'autoUpdate'` calls `self.skipWaiting()` immediately and reloads all open tabs.
**How to avoid:** Use `registerType: 'prompt'` (the default). Show a non-intrusive toast asking the user to refresh. The user controls when the update takes effect.
**Warning signs:** Users report the app "randomly refreshes."

### Pitfall 4: Service worker not tested in production-equivalent build
**What goes wrong:** PWA features (offline, install) appear to work in dev but fail after deployment.
**Why it happens:** `devOptions.enabled` runs a different SW configuration than the production build. The SW generated in dev mode handles fewer routes and doesn't enforce HTTPS.
**How to avoid:** Test with `npm run build && npm run preview` before deploying. Chrome DevTools → Application → Service Workers shows the registered SW and lets you test offline mode.
**Warning signs:** Everything works locally but the Lighthouse PWA audit fails after deploy.

### Pitfall 5: Manifest icons using combined `purpose: 'any maskable'`
**What goes wrong:** Icons appear with extra padding on Android adaptive icon shapes, making the logo look smaller than intended.
**Why it happens:** Maskable icons require content to be within a 40% radius safe zone. A non-maskable icon used as maskable gets padded, which makes it tiny in the circle.
**How to avoid:** Use two separate icon entries at 512x512 — one without `purpose` (defaults to `any`) and one with `purpose: 'maskable'`. The existing icons in `public/favicon_io/` work for both; they just need separate manifest entries.
**Warning signs:** Lighthouse warns "Manifest doesn't have a maskable icon" or icons look tiny on Android home screen.

### Pitfall 6: HashRouter + navigateFallback interaction
**What goes wrong:** After going offline, navigating to any hash route (`/#/discovery`) shows the offline page even if the route was previously visited.
**Why it happens:** The service worker's `navigateFallback` intercepts ALL navigation requests when offline. Hash routing is client-side, but navigation still triggers a fetch for the HTML shell.
**How to avoid:** The `navigateFallback: '/offline.html'` only triggers when the network is unavailable. When offline, the SW should serve the cached `index.html` for hash routes — configure `navigateFallbackDenylist` properly and ensure the app shell (`index.html`) is in the precache manifest. Workbox will serve cached `index.html` for hash routes when online, and `offline.html` only when `index.html` is also not in cache (first-time offline user).
**Warning signs:** Users who visited the app while online see the offline page even on cached routes.

---

## Code Examples

### Complete vite.config.ts with VitePWA (verified pattern)
```typescript
// Source: https://vite-pwa-org.netlify.app/guide/ + https://vite-pwa-org.netlify.app/workbox/generate-sw.html
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['offline.html', 'favicon_io/*.png'],
      manifest: { /* ... see Pattern 1 above ... */ },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [ /* ... see Pattern 1 above ... */ ],
      },
    }),
  ],
  base: '/',
  resolve: { alias: { '@': '/src' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor'
          if (id.includes('node_modules/motion')) return 'animation-vendor'
        },
      },
    },
  },
})
```

### ReloadPrompt mounted in App.tsx
```typescript
// Source: https://vite-pwa-org.netlify.app/frameworks/react
// src/App.tsx
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt'

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ReloadPrompt />   {/* Mounted outside router — always present */}
    </>
  )
}
```

### offline.html in public/ (self-contained, no React)
The existing `offline.html` in the root of the project can be copied directly to `public/offline.html`. It is already well-designed (branded, has retry logic, shows offline status). The Vite build copies `public/` contents to `dist/` automatically. No changes needed to the content — only the location changes from root to `public/`.

### TypeScript reference for virtual modules
```typescript
// src/vite-env.d.ts — add this line
/// <reference types="vite-plugin-pwa/react" />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-written service worker with manual cache versioning | `vite-plugin-pwa` + Workbox `generateSW` with content-hashed precache manifest | ~2020, mainstream by 2022 | Eliminates need to maintain SW code; cache busting is automatic |
| Inline `<script>` SW registration | `injectRegister: 'auto'` with virtual module | vite-plugin-pwa v0.14+ | Cleaner, deferred loading, works with tree-shaking |
| Manual `beforeinstallprompt` banner in vanilla JS | `useInstallPrompt` custom hook + `InstallBanner` component | React adoption of PWA pattern | State management and rendering handled by React lifecycle |
| `purpose: "any maskable"` combined | Separate `any` and `maskable` icon entries | 2022 web.dev recommendation | Correct display on adaptive icon shapes without padding artifacts |
| Checking for SW update via `setInterval` on `registration.update()` | `useRegisterSW` hook handles lifecycle via `workbox-window` | vite-plugin-pwa v0.12+ | No manual polling needed; lifecycle events abstracted |

**Deprecated/outdated from the existing vanilla app:**
- `service-worker.js` at root: Replace with Workbox-generated SW via `vite-plugin-pwa`. The existing file's logic is correct but should not be committed alongside the Workbox-generated version (causes confusion about which SW is active).
- `site.webmanifest` at root: Vite copies files from `public/` but the manifest should be declared in `VitePWA()` config so the plugin manages injection. Keep `public/favicon_io/` icons but remove `site.webmanifest` from root to avoid duplicate manifest serving.
- `pwa-installer.js` (vanilla class): Replaced entirely by `useInstallPrompt` hook + `InstallBanner` component.

---

## Open Questions

1. **Icon `maskable` safe zone compliance**
   - What we know: Existing icons at `public/favicon_io/` have been in production. They display fine in the current app.
   - What's unclear: Whether they were designed with the 40% radius safe zone for maskable purpose (i.e., does the logo extend to the icon edges?).
   - Recommendation: Run a Lighthouse PWA audit after Phase 4 completes and check the maskable icon audit result. If it fails, use `maskable.app` to preview and `@vite-pwa/assets-generator` to regenerate from SVG source.

2. **Service worker in development mode (`devOptions.enabled`)**
   - What we know: Setting `devOptions.enabled: true` allows testing SW in dev but uses a different (lighter) SW.
   - What's unclear: Whether the dev SW might interfere with Vite HMR in unexpected ways.
   - Recommendation: Enable `devOptions.enabled: true` initially; if HMR breaks, set to `false` and test offline behavior only via `npm run preview`.

3. **Interaction between IndexedDB cache layer and service worker network-first strategy**
   - What we know: Phase 2 built a `cache-manager` using IndexedDB with TTL. The SW will also cache TMDB API responses in Cache Storage via `NetworkFirst`.
   - What's unclear: Whether double-caching (IndexedDB TTL + SW Cache Storage) causes user confusion or stale data.
   - Recommendation: The two layers serve different purposes and don't conflict: IndexedDB TTL is the app's SWR layer (returns cached data, fetches fresh in background); the SW cache is the last-resort offline fallback (returns whatever it has when the network is completely unavailable). Accept the double-cache — it provides deeper offline resilience without logic conflicts.

---

## Sources

### Primary (HIGH confidence)
- `https://vite-pwa-org.netlify.app/guide/` — Plugin overview, registerType, injectRegister options
- `https://vite-pwa-org.netlify.app/frameworks/react` — useRegisterSW hook, ReloadPrompt component, TypeScript setup
- `https://vite-pwa-org.netlify.app/workbox/generate-sw.html` — runtimeCaching configuration, CacheFirst/NetworkFirst handlers
- `https://vite-pwa-org.netlify.app/guide/static-assets.html` — globPatterns, includeAssets, non-precached-url pitfall
- `https://vite-pwa-org.netlify.app/guide/register-service-worker.html` — injectRegister modes
- `https://vite-pwa-org.netlify.app/guide/prompt-for-update` — prompt vs autoUpdate behavior, virtual module API
- `https://vite-pwa-org.netlify.app/assets-generator/` — Icon generation from SVG
- npm registry (`npm info vite-plugin-pwa`) — Version 1.2.0 confirmed, peer deps: workbox-build ^7.4.0, workbox-window ^7.4.0
- `https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event` — beforeinstallprompt spec, iOS non-support confirmed
- `https://web.dev/articles/maskable-icon` — Maskable icon safe zone, separate purpose recommendation

### Secondary (MEDIUM confidence)
- `https://blog.wick.technology/pwa-install-prompt/` — React hook pattern for useInstallPrompt (verified against MDN spec)
- `https://www.chapimaster.com/programming/vite/create-custom-offline-page-react-pwa` — navigateFallback + public/offline.html setup (verified against official docs)
- `https://vinova.sg/navigating-safari-ios-pwa-limitations/` — iOS Safari PWA limitations (consistent with MDN)

### Tertiary (LOW confidence — noted for awareness)
- `https://github.com/vite-pwa/vite-plugin-pwa/issues/706` — Reports of issues on Safari 15.6.1; not reproducible on current Safari. Monitor but don't pre-optimize.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry confirms v1.2.0 current; official docs verified all patterns
- Architecture: HIGH — Patterns sourced directly from official vite-pwa docs and verified React examples
- Pitfalls: HIGH — Most from official documentation warnings; iOS behavior from MDN spec

**Research date:** 2026-02-18
**Valid until:** 2026-05-18 (vite-plugin-pwa releases frequently; re-verify if >3 months pass before implementation)
