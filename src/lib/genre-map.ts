/**
 * TMDB Movie Genre Mapping
 *
 * Provides bidirectional lookup between TMDB genre IDs and genre names.
 * All 19 official TMDB movie genres as of 2026.
 *
 * @see https://developer.themoviedb.org/reference/genre-movie-list
 */

/** Complete TMDB movie genre ID to name mapping */
export const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
} as const;

/**
 * Get genre name by TMDB genre ID.
 * @returns The genre name, or undefined if not found.
 */
export function getGenreName(id: number): string | undefined {
  return GENRE_MAP[id];
}

/** Precomputed, alphabetically sorted genre list — GENRE_MAP is static and never mutates. */
const ALL_GENRES: Array<{ id: number; name: string }> = Object.entries(
  GENRE_MAP,
)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Get all genres as a sorted array of { id, name } objects.
 * Sorted alphabetically by name.
 */
export function getAllGenres(): Array<{ id: number; name: string }> {
  return ALL_GENRES;
}
