import type { TasteProfile } from '@/types/preferences';

interface MovieForScoring {
  genre_ids?: number[];
  genres?: Array<{ id: number }>;
  release_date?: string;
  credits?: { crew?: Array<{ id: number; job: string }> };
}

/** Extract decade string from a year number (e.g., 2024 -> "2020s") */
export function getDecadeFromYear(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

/** Extract decade string from a TMDB release_date ("YYYY-MM-DD" -> "2020s") */
export function getDecadeFromReleaseDate(releaseDate: string): string {
  const year = parseInt(releaseDate.slice(0, 4), 10);
  if (isNaN(year)) return 'unknown';
  return getDecadeFromYear(year);
}

/**
 * Score a movie against the user's accumulated taste profile.
 *
 * Positive scores indicate the movie matches preferences the user has "loved".
 * Negative scores indicate characteristics the user has marked "not interested".
 *
 * Scoring:
 * - Genre: average of profile weights for each movie genre (normalized)
 * - Decade: profile weight for the movie's release decade
 * - Director: profile weight for the movie's director (weighted 2x as a strong signal)
 */
export function scoreTasteMatch(profile: TasteProfile, movie: MovieForScoring): number {
  // Extract genre IDs
  const genreIds = movie.genre_ids ?? movie.genres?.map((g) => g.id) ?? [];

  // Genre score: average of profile weights across movie's genres
  let genreScore = 0;
  if (genreIds.length > 0) {
    const sum = genreIds.reduce((acc, id) => acc + (profile.genres[id] || 0), 0);
    genreScore = sum / genreIds.length;
  }

  // Decade score
  let decadeScore = 0;
  if (movie.release_date) {
    const decade = getDecadeFromReleaseDate(movie.release_date);
    decadeScore = profile.decades[decade] || 0;
  }

  // Director score (2x weight — strong preference signal)
  let directorScore = 0;
  if (movie.credits?.crew) {
    const director = movie.credits.crew.find((c) => c.job === 'Director');
    if (director) {
      directorScore = profile.directors[director.id] || 0;
    }
  }

  return genreScore + decadeScore + directorScore * 2;
}
