import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "offline.html",
        "favicon_io/*.png",
        "favicon_io/favicon.ico",
      ],
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
        // with offline.html (precached separately via includeAssets) as the
        // last-resort fallback.
        globIgnores: [
          "**/spline-vendor-*.js",
          "**/SplineHero-*.js",
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/motion")) {
            return "animation-vendor";
          }
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three")
          ) {
            return "three-vendor";
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
          if (id.includes("node_modules/@splinetool")) {
            return "spline-vendor";
          }
        },
      },
    },
  },
});
