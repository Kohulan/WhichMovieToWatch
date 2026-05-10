/**
 * Shared-element layoutId conventions used by Framer Motion to bridge
 * matching elements across mount/unmount boundaries (FLIP morphs).
 *
 * Centralized so a typo can't silently break a morph by leaving one site's
 * string out of sync with another's. Grep-friendly.
 */

export const getProviderLayoutId = (providerId: number): string =>
  `browse-provider-${providerId}`;

export const getMoviePosterLayoutId = (movieId: number): string =>
  `movie-poster-${movieId}`;
