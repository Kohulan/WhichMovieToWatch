// Deep link hook — reads ?movie=ID from URL and provides clear function

import { useSearchParams } from 'react-router';

/**
 * useDeepLink — Reads the ?movie=ID deep link param from URL.
 *
 * Works with HashRouter URL format: /#/?movie=123
 * Call clearDeepLink() to remove the param without triggering navigation.
 *
 * @returns { deepLinkMovieId, clearDeepLink }
 */
export function useDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawId = searchParams.get('movie');
  const deepLinkMovieId = rawId !== null ? parseInt(rawId, 10) : null;
  const validDeepLinkMovieId =
    deepLinkMovieId !== null && !isNaN(deepLinkMovieId)
      ? deepLinkMovieId
      : null;

  function clearDeepLink() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('movie');
        return next;
      },
      { replace: true },
    );
  }

  return { deepLinkMovieId: validDeepLinkMovieId, clearDeepLink };
}
