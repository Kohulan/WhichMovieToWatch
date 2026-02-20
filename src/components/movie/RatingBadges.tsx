// Triple rating display — TMDB, IMDb, Rotten Tomatoes, Metacritic as colored clay badges

import { Star } from "lucide-react";
import { ClayBadge } from "@/components/ui";

interface RatingBadgesProps {
  tmdbRating: number;
  imdbRating: string | null;
  rottenTomatoes: string | null;
  metascore?: string | null;
}

/** Parse a numeric rating value from a string like "7.4" or "74%" */
function parseRating(raw: string | null): number | null {
  if (!raw || raw === "N/A") return null;
  return parseFloat(raw.replace("%", ""));
}

/** Get Tailwind color classes based on a 0-100 score (light/dark adaptive) */
function getScoreColor(score: number): string {
  if (score >= 70) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (score >= 50)
    return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
  return "bg-red-500/20 text-red-700 dark:text-red-400";
}

/** Get Tailwind color classes for a 0-10 IMDB/TMDB score (light/dark adaptive) */
function get10ScoreColor(score: number): string {
  if (score >= 7.0) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (score >= 5.0)
    return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
  return "bg-red-500/20 text-red-700 dark:text-red-400";
}

/**
 * RatingBadges — Colored clay badges for each rating source.
 *
 * Displays TMDB, IMDb, Rotten Tomatoes, and Metacritic ratings as
 * color-coded badges (green/yellow/red based on score thresholds).
 * Hides any rating that is null or N/A. (DISP-02)
 */
export function RatingBadges({
  tmdbRating,
  imdbRating,
  rottenTomatoes,
  metascore,
}: RatingBadgesProps) {
  // TMDB — displayed as percentage (multiply by 10, round)
  const tmdbPercent = Math.round(tmdbRating * 10);
  const tmdbColor = getScoreColor(tmdbPercent);

  // IMDb — displayed as X.X/10
  const imdbScore = parseRating(imdbRating);
  const imdbColor = imdbScore !== null ? get10ScoreColor(imdbScore) : "";

  // Rotten Tomatoes — displayed as XX%
  const rtScore = parseRating(rottenTomatoes);
  const rtColor = rtScore !== null ? getScoreColor(rtScore) : "";

  // Metacritic — displayed as percentage
  const mcScore = parseRating(metascore);
  const mcColor = mcScore !== null ? getScoreColor(mcScore) : "";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Movie ratings"
    >
      {/* TMDB */}
      <ClayBadge size="sm" className={tmdbColor}>
        <Star className="w-3 h-3 mr-1" aria-hidden="true" />
        <span className="sr-only">TMDB: </span>
        {tmdbPercent}%
      </ClayBadge>

      {/* IMDb */}
      {imdbScore !== null && (
        <ClayBadge size="sm" className={imdbColor}>
          <span className="font-bold mr-1 text-xs" aria-hidden="true">
            IMDb
          </span>
          <span className="sr-only">IMDb: </span>
          {imdbScore.toFixed(1)}/10
        </ClayBadge>
      )}

      {/* Rotten Tomatoes */}
      {rtScore !== null && (
        <ClayBadge size="sm" className={rtColor}>
          <span className="mr-1" aria-hidden="true">
            🍅
          </span>
          <span className="sr-only">Rotten Tomatoes: </span>
          {rtScore}%
        </ClayBadge>
      )}

      {/* Metacritic */}
      {mcScore !== null && (
        <ClayBadge size="sm" className={mcColor}>
          <span className="font-bold mr-1 text-xs" aria-hidden="true">
            MC
          </span>
          <span className="sr-only">Metacritic: </span>
          {mcScore}
        </ClayBadge>
      )}
    </div>
  );
}
