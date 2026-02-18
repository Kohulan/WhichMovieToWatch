// Free Movies page — YouTube movies discovery with TMDB metadata (FREE-01, FREE-02, FREE-03, FREE-04)

import { Youtube, SkipForward, AlertCircle, Film } from 'lucide-react';
import { useFreeMovies } from '@/hooks/useFreeMovies';
import { useOmdbRatings } from '@/hooks/useOmdbRatings';
import { MetalButton } from '@/components/ui/MetalButton';
import { ClaySkeletonCard } from '@/components/ui/ClaySkeletonCard';
import { RatingBadges } from '@/components/movie/RatingBadges';
import { GenreBadges } from '@/components/movie/GenreBadges';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { getPosterUrl } from '@/services/tmdb/client';

/**
 * FreeMoviesPage — One-at-a-time discovery of free YouTube movies.
 *
 * Loads movies from the 2000+ entry movies.txt file, enriches with TMDB metadata
 * when available, and provides Watch on YouTube + Next Suggestion actions. (FREE-01–FREE-04)
 */
export function FreeMoviesPage() {
  const { movie, isLoading, error, nextMovie } = useFreeMovies();

  const imdbId = movie?.tmdbDetails?.imdb_id ?? null;
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(imdbId);

  const youtubeUrl = movie
    ? `https://www.youtube.com/watch?v=${movie.youtubeId}`
    : '#';

  const tmdb = movie?.tmdbDetails ?? null;
  const posterUrl = tmdb ? getPosterUrl(tmdb.poster_path, 'w342') : null;

  const year = tmdb?.release_date
    ? new Date(tmdb.release_date).getFullYear()
    : null;
  const runtime = tmdb?.runtime;
  const displayTitle = tmdb?.title ?? movie?.title ?? '';

  return (
    <div className="min-h-full flex flex-col">
      {/* Page header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-clay-text">
          Free Movies
        </h1>
        <p className="text-sm text-clay-text-muted mt-0.5">
          Over 2,000 free movies to discover
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center gap-4 px-4 pb-6">
          <ClaySkeletonCard className="w-full max-w-sm" hasImage lines={4} />
          <p className="text-clay-text-muted text-sm animate-pulse">
            Finding a free movie...
          </p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" aria-hidden="true" />
          <div>
            <p className="text-clay-text font-semibold mb-1">
              Could not load free movies
            </p>
            <p className="text-clay-text-muted text-sm">{error}</p>
          </div>
          <MetalButton variant="secondary" size="sm" onClick={nextMovie}>
            Try again
          </MetalButton>
        </div>
      )}

      {/* Movie display */}
      {!isLoading && !error && movie && (
        <div className="flex-1 flex flex-col items-center gap-4 px-4 pb-6">
          {/* Poster */}
          <div className="w-48 aspect-[2/3] rounded-clay overflow-hidden clay-shadow-lg flex-shrink-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${displayTitle} poster`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-clay-base flex flex-col items-center justify-center gap-2">
                <Film className="w-10 h-10 text-clay-text-muted" aria-hidden="true" />
                <span className="text-clay-text-muted text-xs text-center px-3">
                  {movie.title}
                </span>
              </div>
            )}
          </div>

          {/* Movie info */}
          <div className="w-full max-w-sm space-y-3 text-center">
            {/* Title */}
            <h2 className="text-xl font-display font-bold text-clay-text leading-tight">
              {displayTitle}
            </h2>

            {/* Metadata row */}
            {(year || runtime) && (
              <div className="flex items-center justify-center gap-3 text-sm text-clay-text-muted">
                {year && <span>{year}</span>}
                {year && runtime && <span aria-hidden="true">·</span>}
                {runtime && (
                  <span>
                    {Math.floor(runtime / 60)}h {runtime % 60}m
                  </span>
                )}
              </div>
            )}

            {/* Ratings — shown only when TMDB details available */}
            {tmdb && (
              <div className="flex justify-center">
                <RatingBadges
                  tmdbRating={tmdb.vote_average}
                  imdbRating={imdbRating}
                  rottenTomatoes={rottenTomatoes}
                  metascore={metascore}
                />
              </div>
            )}

            {/* Genres */}
            {tmdb?.genres && tmdb.genres.length > 0 && (
              <div className="flex justify-center">
                <GenreBadges genres={tmdb.genres} maxVisible={4} />
              </div>
            )}

            {/* Overview */}
            {tmdb?.overview && (
              <p className="text-clay-text-muted text-sm leading-relaxed line-clamp-4 text-left">
                {tmdb.overview}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {/* Watch on YouTube button (FREE-03) */}
            <ExternalLink href={youtubeUrl} className="w-full">
              <MetalButton
                variant="primary"
                size="lg"
                className="w-full gap-2"
                style={{ backgroundColor: '#FF0000' }}
                aria-label={`Watch ${displayTitle} on YouTube`}
              >
                <Youtube className="w-5 h-5" aria-hidden="true" />
                Watch on YouTube
              </MetalButton>
            </ExternalLink>

            {/* Next Suggestion button (FREE-03) */}
            <MetalButton
              variant="secondary"
              size="md"
              onClick={nextMovie}
              className="w-full gap-2"
              aria-label="Load next free movie suggestion"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
              Next Suggestion
            </MetalButton>
          </div>

          {/* Regional availability disclaimer (FREE-04) */}
          <p className="text-xs text-clay-text-muted text-center max-w-sm leading-relaxed opacity-70">
            Availability may vary by region. Some movies may not be accessible in all countries.
          </p>
        </div>
      )}
    </div>
  );
}
