// NotFoundPage — branded 404 for unmatched routes (wildcard "*" route).
//
// Reuses the visual language of AppShell's PageErrorBoundary (the runtime
// crash fallback) so unmatched routes never show the unstyled default
// screen. (See main.tsx's RouteErrorBoundary for the router-level errorElement
// sibling of this component — kept in a separate file/module so this default
// export stays a clean, standalone lazy chunk.)

import { Link } from "react-router";
import { AlertCircle, Home } from "lucide-react";

/**
 * NotFoundPage — rendered for any path that doesn't match a route.
 * Deliberately does NOT use <Seo> — a 404 has no canonical URL to advertise;
 * it only needs a noindex signal so crawlers don't index the wildcard path.
 */
export default function NotFoundPage() {
  return (
    <>
      <title>Page Not Found — Which Movie To Watch</title>
      <meta name="robots" content="noindex" />
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <AlertCircle
          className="w-12 h-12 text-red-400 mb-4"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold text-clay-text mb-2">
          Page not found
        </h2>
        <p className="text-sm text-clay-text-muted mb-6">
          This page doesn't exist — but great movies do.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </>
  );
}
