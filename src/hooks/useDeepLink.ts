// Deep link hook — reads /movie/:slug path params and legacy ?movie=ID,
// ?providers=all, ?source=trending query params.

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { parseMovieIdFromSlug } from "@/lib/movie-url";

/**
 * useDeepLink — resolves which movie (if any) the URL pins.
 *
 * Two supported URL shapes:
 *   /movie/inception-27205        (canonical, prerendered, shareable)
 *   /discover?movie=27205         (legacy deep link — still works)
 * Also reads ?providers=all (global availability) and ?source=trending|browse.
 * clearDeepLink() returns the user to plain /discover (random discovery).
 *
 * `isCanonicalMoviePath` lets callers (DiscoveryPage) know they're on the
 * canonical /movie/:slug URL so they can avoid auto-clearing it — clearing
 * navigates away and would both remount the page and destroy the shareable/
 * indexable URL right after load. Callers should only clear it in response
 * to an explicit user action (e.g. Next/Skip).
 */
export function useDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const slugId = slug ? parseMovieIdFromSlug(slug) : null;
  const rawId = searchParams.get("movie");
  const parsed = rawId !== null ? parseInt(rawId, 10) : NaN;
  const queryId = Number.isFinite(parsed) ? parsed : null;
  const deepLinkMovieId = slugId ?? queryId;

  const showAllProviders = searchParams.get("providers") === "all";
  const isTrendingSource = searchParams.get("source") === "trending";
  const isCanonicalMoviePath = location.pathname.startsWith("/movie/");

  function clearDeepLink() {
    if (isCanonicalMoviePath) {
      navigate("/discover", { replace: true });
      return;
    }
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

  return {
    deepLinkMovieId,
    showAllProviders,
    isTrendingSource,
    isCanonicalMoviePath,
    clearDeepLink,
  };
}
