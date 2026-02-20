// Responsive TMDB image utilities
//
// Pure utility functions for building TMDB image URLs with responsive srcset.
// Named with `use` prefix per codebase convention but are NOT React hooks
// (no state, no effects — safe to call anywhere).
//
// TMDB does not serve WebP natively. Responsive srcset with multiple resolution
// breakpoints is the correct PERF-02 implementation strategy.

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Build a TMDB image URL for a given size.
 *
 * @param path  TMDB image path (e.g. "/abc123.jpg")
 * @param size  TMDB size string (e.g. "w342", "w1280", "original")
 */
export function tmdbImageUrl(path: string, size: string): string {
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Generate a responsive srcSet string for TMDB poster images.
 *
 * Covers the standard poster width breakpoints:
 *   w185 → 185w (mobile small)
 *   w342 → 342w (mobile large / tablet)
 *   w500 → 500w (desktop small)
 *   w780 → 780w (desktop large / retina tablet)
 *
 * @param path  TMDB poster path (e.g. "/abc123.jpg")
 */
export function tmdbPosterSrcSet(path: string): string {
  return [
    `${TMDB_IMAGE_BASE}/w185${path} 185w`,
    `${TMDB_IMAGE_BASE}/w342${path} 342w`,
    `${TMDB_IMAGE_BASE}/w500${path} 500w`,
    `${TMDB_IMAGE_BASE}/w780${path} 780w`,
  ].join(", ");
}

/**
 * Generate a responsive srcSet string for TMDB backdrop images.
 *
 * Covers the standard backdrop width breakpoints:
 *   w300  → 300w  (mobile thumbnail)
 *   w780  → 780w  (tablet / background)
 *   w1280 → 1280w (desktop full-width)
 *
 * @param path  TMDB backdrop path (e.g. "/xyz789.jpg")
 */
export function tmdbBackdropSrcSet(path: string): string {
  return [
    `${TMDB_IMAGE_BASE}/w300${path} 300w`,
    `${TMDB_IMAGE_BASE}/w780${path} 780w`,
    `${TMDB_IMAGE_BASE}/w1280${path} 1280w`,
  ].join(", ");
}

/**
 * The `sizes` attribute for poster images.
 * - ≤640px viewport: 185px wide poster
 * - ≤1024px viewport: 342px wide poster
 * - Otherwise: 500px wide poster
 */
export const posterSizes =
  "(max-width: 640px) 185px, (max-width: 1024px) 342px, 500px";

/**
 * The `sizes` attribute for backdrop images.
 * - ≤640px viewport: 300px wide backdrop
 * - ≤1024px viewport: 780px wide backdrop
 * - Otherwise: 1280px wide backdrop
 */
export const backdropSizes =
  "(max-width: 640px) 300px, (max-width: 1024px) 780px, 1280px";
