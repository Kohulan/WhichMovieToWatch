// Deep link hook — reads ?movie=ID, ?providers=all, and ?source=trending from URL

import { useSearchParams } from "react-router";

/**
 * useDeepLink — Reads the ?movie=ID deep link param from URL.
 *
 * Works with HashRouter URL format: /#/discover?movie=123
 * Also reads ?providers=all to signal global availability display (Netflix search flow).
 * Also reads ?source=trending to indicate the movie came from the trending page.
 * Call clearDeepLink() to remove all params without triggering navigation.
 *
 * @returns { deepLinkMovieId, showAllProviders, isTrendingSource, clearDeepLink }
 */
export function useDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawId = searchParams.get("movie");
  const parsed = rawId !== null ? parseInt(rawId, 10) : NaN;
  const deepLinkMovieId = Number.isFinite(parsed) ? parsed : null;

  const showAllProviders = searchParams.get("providers") === "all";
  const isTrendingSource = searchParams.get("source") === "trending";

  function clearDeepLink() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("movie");
        next.delete("providers");
        next.delete("source");
        return next;
      },
      { replace: true },
    );
  }

  return { deepLinkMovieId, showAllProviders, isTrendingSource, clearDeepLink };
}
