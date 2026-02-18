// Cinematic hero with full-bleed backdrop, poster, and metadata overlay

import { useState } from 'react';
import { Film } from 'lucide-react';
import { getBackdropUrl, getPosterUrl } from '@/services/tmdb/client';
import type { TMDBMovieDetails } from '@/types/movie';
import { GenreBadges } from './GenreBadges';

interface MovieHeroProps {
  movie: TMDBMovieDetails;
}

/** Format runtime from minutes to "Xh Ym" */
function formatRuntime(minutes: number | null): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Extract 4-digit year from release_date (e.g. "2023-05-15" → "2023") */
function extractYear(releaseDate: string): string {
  return releaseDate ? releaseDate.slice(0, 4) : '';
}

/**
 * MovieHero — Cinematic full-bleed hero for a movie.
 *
 * Full-width backdrop with gradient overlay, poster thumbnail,
 * title, year, runtime, overview, and genre badges.
 * Uses lazy loading and ARIA attributes for accessibility (DISP-01, A11Y-02).
 */
export function MovieHero({ movie }: MovieHeroProps) {
  const [posterError, setPosterError] = useState(false);

  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'w1280');
  const posterUrl = getPosterUrl(movie.poster_path, 'w342');
  const year = extractYear(movie.release_date);
  const runtime = formatRuntime(movie.runtime);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Backdrop image */}
      {backdropUrl ? (
        <div
          className="relative w-full"
          role="img"
          aria-label={`Backdrop image for ${movie.title}`}
        >
          <img
            src={backdropUrl}
            alt=""
            loading="lazy"
            className="w-full h-64 sm:h-80 object-cover"
          />
          {/* Gradient overlay — fades to clay surface at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-clay-base via-clay-base/80 to-transparent" />
        </div>
      ) : (
        <div
          className="w-full h-64 sm:h-80 bg-clay-surface flex items-center justify-center"
          role="img"
          aria-label={`No backdrop available for ${movie.title}`}
        >
          <Film className="w-16 h-16 text-clay-text-muted opacity-30" />
        </div>
      )}

      {/* Content overlay — poster + metadata */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-4 items-end">
        {/* Poster */}
        <div className="flex-shrink-0">
          {posterUrl && !posterError ? (
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              onError={() => setPosterError(true)}
              className="w-20 sm:w-28 rounded-lg shadow-xl object-cover aspect-[2/3]"
            />
          ) : (
            <div
              className="w-20 sm:w-28 rounded-lg shadow-xl bg-clay-surface flex items-center justify-center aspect-[2/3]"
              aria-label={`${movie.title} poster placeholder`}
            >
              <Film className="w-8 h-8 text-clay-text-muted opacity-50" />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 pb-1">
          <h1 className="font-heading text-2xl font-bold text-clay-text leading-tight truncate">
            {movie.title}
          </h1>

          {/* Year + runtime */}
          <div className="flex items-center gap-2 mt-1 text-sm text-clay-text-muted">
            {year && <span>{year}</span>}
            {runtime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{runtime}</span>
              </>
            )}
          </div>

          {/* Genre badges */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mt-2">
              <GenreBadges genres={movie.genres} />
            </div>
          )}
        </div>
      </div>

      {/* Overview — below the hero */}
      {movie.overview && (
        <div className="px-4 pt-3 pb-4">
          <p className="text-clay-text text-sm leading-relaxed line-clamp-4">
            {movie.overview}
          </p>
        </div>
      )}
    </div>
  );
}
