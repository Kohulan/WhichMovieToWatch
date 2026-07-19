import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import seoContent from "./src/seo/seo-content.json";

// Serves `virtual:seo-eager`: just the site block + the "/" route extracted
// from src/seo/seo-content.json (which stays the single source of truth) at
// build time. The always-eager entry graph (HomePage, <Seo>) imports this via
// src/seo/site.ts instead of src/seo/meta.ts, so the other ~34 routes' worth
// of titles/descriptions/intros (~12 kB gzip) stays out of the eager index
// chunk. Lazy pages keep importing the full JSON through src/seo/meta.ts.
// The JSON is imported as a config dependency, so editing it restarts the
// dev server / re-runs the build with fresh values.
function seoEagerContent(): Plugin {
  const virtualId = "virtual:seo-eager";
  const resolvedId = "\0" + virtualId;
  return {
    name: "seo-eager-content",
    resolveId(id) {
      return id === virtualId ? resolvedId : undefined;
    },
    load(id) {
      if (id !== resolvedId) return;
      const home = seoContent.routes.find((r) => r.path === "/");
      return [
        `export const site = ${JSON.stringify(seoContent.site)};`,
        `export const homeRoute = ${JSON.stringify(home)};`,
      ].join("\n");
    },
  };
}

// Injects <link rel="preload" as="font"> for the JetBrains Mono "latin"
// subset — the subset backing nearly all visible text on every route. The
// font is otherwise only discovered after the vendor CSS downloads and
// parses, costing a sequential round trip before text can swap off the
// fallback font. The filename is content-hashed, so it's resolved from the
// emitted bundle at build time (transformIndexHtml receives it in ctx).
// The match must not catch the separate latin-ext subset. Prerendered
// per-route HTML inherits the tag since tools/prerender.mjs rewrites the
// built dist/index.html in place.
function fontPreload(): Plugin {
  return {
    name: "font-preload",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        if (!ctx.bundle) return; // dev server — no hashed assets to resolve
        const latin = Object.keys(ctx.bundle).find(
          (f) =>
            f.includes("jetbrains-mono-latin-wght-normal") &&
            f.endsWith(".woff2"),
        );
        if (!latin) return;
        return [
          {
            tag: "link",
            attrs: {
              rel: "preload",
              as: "font",
              type: "font/woff2",
              // Required even for same-origin font preloads, or the browser
              // re-fetches the font a second time in CORS mode.
              crossorigin: true,
              href: `/${latin}`,
            },
            injectTo: "head",
          },
        ];
      },
    },
  };
}

export default defineConfig({
  plugins: [
    seoEagerContent(),
    fontPreload(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // No includeAssets, no manifest-icon auto-precache: public/ files
      // (offline.html, favicon_io/*) are copied to dist/ by Vite and already
      // matched by workbox.globPatterns below — the extra mechanisms only
      // produced duplicate precache manifest entries.
      includeManifestIcons: false,
      manifest: {
        name: "Which Movie To Watch",
        short_name: "MovieWatch",
        description:
          "Find your next favorite movie with personalized recommendations",
        theme_color: "#0E0E12",
        background_color: "#0E0E12",
        display: "standalone",
        start_url: "/",
        orientation: "portrait-primary",
        categories: ["entertainment", "movies", "lifestyle"],
        icons: [
          {
            src: "favicon_io/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon_io/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "favicon_io/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Exclude spline-vendor chunk from precaching — it's a 4+ MB lazy-loaded
        // 3D runtime that should only load on capable devices, not on every SW install.
        // It is served via NetworkFirst runtime caching instead (see runtimeCaching below).
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // index.html/404.html are excluded from the precache manifest: the
        // manifest (and its content-hash revision) is computed here at
        // vite-build time, BEFORE tools/prerender.mjs rewrites dist/index.html
        // per-route. If either were precached, the service worker would pin
        // whatever content existed at the very first deploy forever — the
        // revision hash never changes on later deploys since this file's
        // bytes (pre-prerender) are identical every time. Navigations are
        // already served fresh via the NetworkFirst pages-cache rule below,
        // with offline.html (precached via globPatterns) as the
        // last-resort fallback.
        globIgnores: [
          "**/spline-vendor-*.js",
          "**/SplineHero-*.js",
          // The /showcase route only exists in dev builds (import.meta.env.DEV
          // guard in main.tsx), but its lazy() chunk is still emitted by the
          // bundler — keep the unreachable dev-only page out of every user's
          // SW install payload, same rationale as the Spline exclusions above.
          "**/Showcase-*.js",
          "**/index.html",
          "**/404.html",
        ],
        // vite-plugin-pwa defaults navigateFallback to "index.html" when the
        // key is absent from this object (app-shell SPA behavior). We rely on
        // NetworkFirst + precacheFallback below instead, so it must be
        // explicitly nulled out here or the plugin's default silently
        // reintroduces a NavigationRoute that shadows the runtimeCaching
        // route below for every navigation, online or not.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        // New SW activates immediately on install and takes control of any
        // open tabs, instead of waiting for a SKIP_WAITING message from the
        // (now-removed) update-prompt UI. Combined with registerType:
        // "autoUpdate" above, this is what makes updates apply automatically
        // — users are never stuck on a stale precached build.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // All page navigations: network first (real prerendered HTML),
            // cached copy when offline, branded offline page as last resort.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 7 },
              precacheFallback: { fallbackURL: "/offline.html" },
            },
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "tmdb-api-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400,
              },
              cacheableResponse: {
                statuses: [200],
              },
              networkTimeoutSeconds: 15,
            },
          },
          {
            urlPattern: /^https:\/\/www\.omdbapi\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "omdb-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800,
              },
              cacheableResponse: {
                statuses: [200],
              },
              networkTimeoutSeconds: 15,
            },
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tmdb-images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 2592000,
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Fonts must never be base64-inlined: the ~2 kB cyrillic-ext subset sat
    // under the default 4096-byte inline threshold and got embedded in the
    // eager vendor CSS, defeating its unicode-range on-demand fetch (every
    // visitor paid for it whether or not they ever saw Cyrillic text).
    // `undefined` falls through to Vite's size-based default for all other
    // asset types.
    assetsInlineLimit: (filePath) =>
      filePath.endsWith(".woff2") ? false : undefined,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Trailing slashes anchor the match to the package boundary —
          // a bare "node_modules/react" substring also captured unrelated
          // react-* packages (e.g. react-merge-refs, a Spline-only dep),
          // dragging them into this eager chunk.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router/")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/motion")) {
            return "animation-vendor";
          }
          // detect-gpu is separated from spline-vendor:
          //   - detect-gpu (~10 KB gzipped) runs at app startup to determine GPU tier.
          //     It MUST load before AppShell decides whether to mount SplineHero at all.
          //   - Bundling detect-gpu into spline-vendor would mean it only loads
          //     lazily (when SplineHero imports), but AppShell needs the result first.
          //   - A dedicated gpu-detect chunk loads early without bringing in the full
          //     Spline runtime (4+ MB), avoiding a circular lazy-load dependency.
          if (id.includes("node_modules/detect-gpu")) {
            return "gpu-detect";
          }
          // react-merge-refs is a top-level sibling package consumed only by
          // @splinetool/react-spline — bucket it with its sole consumer so it
          // rides the lazy spline chunk instead of an eager vendor chunk.
          if (
            id.includes("node_modules/@splinetool") ||
            id.includes("node_modules/react-merge-refs")
          ) {
            return "spline-vendor";
          }
          // Everything else from node_modules (zustand, idb, lucide-react,
          // @fontsource, detect-gpu deps, etc.) → one stable vendor chunk.
          // Keeps rarely-changing third-party code out of the app index chunk,
          // so app edits don't bust the vendor cache and vice versa.
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
