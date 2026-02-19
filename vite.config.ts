import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

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
        // Exclude spline-vendor chunk from precaching — it's a 4+ MB lazy-loaded
        // 3D runtime that should only load on capable devices, not on every SW install.
        // It is served via NetworkFirst runtime caching instead (see runtimeCaching below).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/spline-vendor-*.js', '**/SplineHero-*.js'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tmdb-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/www\.omdbapi\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'omdb-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-images-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 2592000,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/motion')) {
            return 'animation-vendor';
          }
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          ) {
            return 'three-vendor';
          }
          // detect-gpu is separated from spline-vendor:
          //   - detect-gpu (~10 KB gzipped) runs at app startup to determine GPU tier.
          //     It MUST load before AppShell decides whether to mount SplineHero at all.
          //   - Bundling detect-gpu into spline-vendor would mean it only loads
          //     lazily (when SplineHero imports), but AppShell needs the result first.
          //   - A dedicated gpu-detect chunk loads early without bringing in the full
          //     Spline runtime (4+ MB), avoiding a circular lazy-load dependency.
          if (id.includes('node_modules/detect-gpu')) {
            return 'gpu-detect';
          }
          if (id.includes('node_modules/@splinetool')) {
            return 'spline-vendor';
          }
        },
      },
    },
  },
});
