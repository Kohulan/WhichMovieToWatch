import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AlertCircle, RefreshCcw } from "lucide-react";

import "@fontsource-variable/jetbrains-mono";

import "./styles/app.css";
import App from "./App";
import { HomePage } from "./pages/HomePage";

const DiscoverPage = lazy(() =>
  import("./pages/DiscoverPage").then((m) => ({ default: m.DiscoverPage })),
);
const MoviePage = lazy(() =>
  import("./pages/MoviePage").then((m) => ({ default: m.MoviePage })),
);
const Showcase = lazy(() =>
  import("./pages/Showcase").then((m) => ({ default: m.Showcase })),
);
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const DinnerTimePage = lazy(() => import("./pages/DinnerTimePage"));
const FreeMoviesPage = lazy(() => import("./pages/FreeMoviesPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TonightPage = lazy(() => import("./pages/TonightPage"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const ProviderPage = lazy(() => import("./pages/ProviderPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// One-shot DevTools welcome for the curious. Production-only so dev HMR
// reloads aren't noisy. Uses the project accent color literal so the styled
// log doesn't depend on theme tokens that are stripped out of the bundle.
if (
  typeof window !== "undefined" &&
  import.meta.env.PROD &&
  !window.sessionStorage.getItem("__wmtw_console_seen__")
) {
  window.sessionStorage.setItem("__wmtw_console_seen__", "1");
  // eslint-disable-next-line no-console
  console.log(
    "%cWhich Movie To Watch%c\nReact 19, Vite, custom Clay+Metal design system.\nSource: github.com/Kohulan/WhichMovieToWatch",
    "font: 700 18px/1.2 'JetBrains Mono', monospace; color: oklch(0.7 0.22 38); padding: 4px 0;",
    "font: 12px/1.5 'JetBrains Mono', monospace; color: #888;",
  );
}

// Unregister any legacy service workers (from the pre-React vanilla JS app)
// that may intercept navigation requests and serve stale cached responses.
// The modern Vite PWA plugin registers its own Workbox-based SW; legacy SWs
// conflict with it and can cause blank screens.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      // Only unregister legacy SWs — the Workbox SW is re-registered by the
      // vite-plugin-pwa auto-injected code after this runs.
      const swUrl = registration.active?.scriptURL ?? "";
      if (!swUrl.includes("sw.js") && !swUrl.includes("workbox")) {
        registration.unregister();
      }
    }
  });
}

// Delete legacy caches from the pre-React vanilla JS app. Long-stuck
// browsers that never picked up a Workbox SW can still be holding these
// open, serving stale cached responses indefinitely. The modern Workbox
// caches (workbox-*, pages-cache, tmdb-*, omdb-*) are intentionally left
// alone — cleanupOutdatedCaches in vite.config.ts already manages those.
if ("caches" in window) {
  const legacyCachePrefixes = [
    "moviewatch-",
    "runtime-cache",
    "movie-data",
    "movie-images",
  ];
  caches
    .keys()
    .then((cacheNames) => {
      for (const cacheName of cacheNames) {
        if (
          legacyCachePrefixes.some((prefix) => cacheName.startsWith(prefix))
        ) {
          caches.delete(cacheName);
        }
      }
    })
    .catch(() => {});
}

/**
 * Small inline fallback while the lazy page chunk downloads. Kept in the
 * eager main bundle so it appears immediately instead of waiting for any
 * additional JS. Matches the AppShell padding so the layout doesn't jump.
 */
function PageSuspenseFallback() {
  return (
    <div
      className="flex items-center justify-center gap-3 min-h-[60vh] px-4 text-clay-text-muted text-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
      <span>Loading…</span>
    </div>
  );
}

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<PageSuspenseFallback />}>{node}</Suspense>
);

/**
 * RouteErrorBoundary — createBrowserRouter `errorElement` for the root route.
 * Catches errors react-router itself surfaces (loader/render throws that
 * happen before or outside AppShell's own PageErrorBoundary, failed lazy
 * chunk imports, etc.) so they never fall through to the browser's default
 * unstyled error screen. Kept inline (not in NotFoundPage.tsx) so that
 * page's default export stays a clean, standalone lazy chunk — this
 * component is statically referenced by the router config below.
 */
function RouteErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-clay-base">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-clay-text mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-clay-text-muted mb-6">
        This page encountered an error. Please try again.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
      >
        <RefreshCcw className="w-4 h-4" aria-hidden="true" />
        Reload
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "discover", element: withSuspense(<DiscoverPage />) },
      { path: "movie/:slug", element: withSuspense(<MoviePage />) },
      { path: "browse", element: withSuspense(<BrowsePage />) },
      { path: "trending", element: withSuspense(<TrendingPage />) },
      { path: "dinner-time", element: withSuspense(<DinnerTimePage />) },
      { path: "free-movies", element: withSuspense(<FreeMoviesPage />) },
      {
        path: "what-to-watch-tonight",
        element: withSuspense(<TonightPage />),
      },
      {
        path: "movies/genre/:genreSlug",
        element: withSuspense(<GenrePage />),
      },
      {
        path: "streaming/:providerSlug",
        element: withSuspense(<ProviderPage />),
      },
      ...(import.meta.env.DEV
        ? [{ path: "showcase", element: withSuspense(<Showcase />) }]
        : []),
      { path: "privacy", element: withSuspense(<PrivacyPage />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
]);

// Prerendered pages ship a static JSON-LD <script data-prerender> block baked
// in by tools/prerender.mjs so crawlers see structured data before hydration.
// Once React hydrates and mounts its own <Seo> (with live, always-current
// data), the static block is redundant and — if ever left stale relative to
// the fetched-at-runtime content — would leave two divergent JSON-LD blocks
// on the page. Remove it so hydrated pages own their JSON-LD exclusively.
document
  .querySelectorAll('script[type="application/ld+json"][data-prerender]')
  .forEach((el) => el.remove());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Signal to the boot watchdog (inline script in index.html) that the app
// bundle downloaded and executed. This runs at module-eval time right after
// the render() call is issued — it proves the JS actually ran, which is the
// failure mode the watchdog guards against (a broken/stale SW serving a
// bundle that never loads at all). A component that throws during render is
// a separate concern already handled by RouteErrorBoundary/error boundaries;
// this flag only needs to prove the bundle executed, not that render
// succeeded end-to-end.
window.__WMTW_MOUNTED = true;
