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

/** Reverse lookup: lowercase genre name to TMDB genre ID */
const REVERSE_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(GENRE_MAP).map(([id, name]) => [
    name.toLowerCase(),
    Number(id),
  ]),
);

/**
 * Get genre name by TMDB genre ID.
 * @returns The genre name, or undefined if not found.
 */
export function getGenreName(id: number): string | undefined {
  return GENRE_MAP[id];
}

/**
 * Get TMDB genre ID by genre name (case-insensitive).
 * @returns The genre ID, or undefined if not found.
 */
export function getGenreId(name: string): number | undefined {
  return REVERSE_MAP[name.toLowerCase()];
}

/**
 * Get all genres as a sorted array of { id, name } objects.
 * Sorted alphabetically by name.
 */
export function getAllGenres(): Array<{ id: number; name: string }> {
  return Object.entries(GENRE_MAP)
    .map(([id, name]) => ({ id: Number(id), name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
