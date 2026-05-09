import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";

import "@fontsource-variable/jetbrains-mono";

import "./styles/app.css";
import App from "./App";
import { HomePage } from "./pages/HomePage";

const DiscoverPage = lazy(() =>
  import("./pages/DiscoverPage").then((m) => ({ default: m.DiscoverPage })),
);
const Showcase = lazy(() =>
  import("./pages/Showcase").then((m) => ({ default: m.Showcase })),
);
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const DinnerTimePage = lazy(() => import("./pages/DinnerTimePage"));
const FreeMoviesPage = lazy(() => import("./pages/FreeMoviesPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

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

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "discover", element: withSuspense(<DiscoverPage />) },
      { path: "browse", element: withSuspense(<BrowsePage />) },
      { path: "trending", element: withSuspense(<TrendingPage />) },
      { path: "dinner-time", element: withSuspense(<DinnerTimePage />) },
      { path: "free-movies", element: withSuspense(<FreeMoviesPage />) },
      { path: "showcase", element: withSuspense(<Showcase />) },
      { path: "privacy", element: withSuspense(<PrivacyPage />) },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
