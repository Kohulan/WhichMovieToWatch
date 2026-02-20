import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";

import "@fontsource-variable/jetbrains-mono";

import "./styles/app.css";
import App from "./App";
import { HomePage } from "./pages/HomePage";
import { Showcase } from "./pages/Showcase";
import { DiscoverPage } from "./pages/DiscoverPage";
import TrendingPage from "./pages/TrendingPage";
import DinnerTimePage from "./pages/DinnerTimePage";
import FreeMoviesPage from "./pages/FreeMoviesPage";
import PrivacyPage from "./pages/PrivacyPage";

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

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "discover", element: <DiscoverPage /> },
      { path: "trending", element: <TrendingPage /> },
      { path: "dinner-time", element: <DinnerTimePage /> },
      { path: "free-movies", element: <FreeMoviesPage /> },
      { path: "showcase", element: <Showcase /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
