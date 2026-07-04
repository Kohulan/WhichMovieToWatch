// Shared movie-URL slug utilities.
// Imported by BOTH the React app (via src/lib/movie-url.ts) and the
// prerender script — keep this file dependency-free ESM.

/**
 * Build a URL slug like "inception-27205". The numeric TMDB id is always
 * the trailing segment so title changes never break existing links.
 */
export function movieSlug(movie) {
  const base = movie.title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return `${base || "movie"}-${movie.id}`;
}

/** Parse the TMDB id back out of a slug. Returns null if absent. */
export function parseMovieIdFromSlug(slug) {
  const match = /-?(\d+)$/.exec(slug ?? "");
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}
