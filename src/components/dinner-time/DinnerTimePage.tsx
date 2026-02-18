// Dinner Time — family-friendly movie finder with service selector and like/dislike tracking (DINR-02, DINR-03, DINR-04)

import { ThumbsUp, ThumbsDown, SkipForward, AlertCircle } from 'lucide-react';
import {
  useDinnerTime,
  DINNER_TIME_SERVICES,
  type DinnerTimeServiceId,
} from '@/hooks/useDinnerTime';
import { useOmdbRatings } from '@/hooks/useOmdbRatings';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { ServiceBranding, getServiceConfig } from './ServiceBranding';
import { MetalButton } from '@/components/ui/MetalButton';
import { ClaySkeletonCard } from '@/components/ui/ClaySkeletonCard';
import { RatingBadges } from '@/components/movie/RatingBadges';
import { GenreBadges } from '@/components/movie/GenreBadges';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { showToast } from '@/components/shared/Toast';
import { getPosterUrl } from '@/services/tmdb/client';

const SERVICES = [
  { id: DINNER_TIME_SERVICES.NETFLIX, label: 'Netflix' },
  { id: DINNER_TIME_SERVICES.PRIME, label: 'Prime' },
  { id: DINNER_TIME_SERVICES.DISNEY_PLUS, label: 'Disney+' },
] as const;

/**
 * DinnerTimePage — Dedicated full-page experience for finding family-friendly movies.
 *
 * Provides:
 * - Service selector (Netflix / Prime Video / Disney+)
 * - Single-movie focused display with poster, metadata, ratings
 * - "Watch on [Service]" button linking to service search
 * - Like/Dislike preference tracking with auto-advance to next movie
 * (DINR-02, DINR-03, DINR-04)
 */
export function DinnerTimePage() {
  const { movie, isLoading, error, nextMovie, setService, currentService } =
    useDinnerTime();

  const markDinnerLike = useMovieHistoryStore((s) => s.markDinnerLike);
  const markDinnerDislike = useMovieHistoryStore((s) => s.markDinnerDislike);

  const imdbId = movie?.imdb_id ?? null;
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(imdbId);

  const serviceConfig = getServiceConfig(currentService);

  function handleGreatPick() {
    if (!movie) return;
    markDinnerLike(movie.id);
    showToast(`Loved "${movie.title}"! Loading next...`, 'success');
    nextMovie();
  }

  function handleNotThis() {
    if (!movie) return;
    markDinnerDislike(movie.id);
    nextMovie();
  }

  const posterUrl = movie ? getPosterUrl(movie.poster_path, 'w342') : null;
  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const runtime = movie?.runtime;

  const watchUrl = movie ? serviceConfig.watchUrl(movie.title) : '#';

  return (
    <div
      className={`min-h-full flex flex-col bg-gradient-to-b ${serviceConfig.gradientFrom} ${serviceConfig.gradientTo} transition-colors duration-500`}
    >
      {/* Page header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-clay-text">
          Dinner Time
        </h1>
        <p className="text-sm text-clay-text-muted mt-0.5">
          Family-friendly movies for everyone
        </p>
      </div>

      {/* Service selector */}
      <div className="px-4 pb-4">
        <div className="flex gap-2" role="group" aria-label="Select streaming service">
          {SERVICES.map((service) => {
            const isActive = currentService === service.id;
            return (
              <MetalButton
                key={service.id}
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setService(service.id as DinnerTimeServiceId)}
                aria-pressed={isActive}
                className={isActive ? 'flex-1' : 'flex-1 opacity-70'}
              >
                {service.label}
              </MetalButton>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center gap-4 px-4 pb-6">
          <ClaySkeletonCard className="w-full max-w-sm" hasImage lines={4} />
          <p className="text-clay-text-muted text-sm animate-pulse">
            Finding the perfect family movie...
          </p>
        </div>
      )}

      {/* Error/empty state */}
      {!isLoading && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400" aria-hidden="true" />
          <div>
            <p className="text-clay-text font-semibold mb-1">
              No movies found on {serviceConfig.name}
            </p>
            <p className="text-clay-text-muted text-sm">{error}</p>
          </div>
          <MetalButton variant="secondary" size="sm" onClick={nextMovie}>
            Try another
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
                alt={`${movie.title} poster`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-clay-base flex items-center justify-center">
                <span className="text-clay-text-muted text-xs text-center px-3">
                  No poster available
                </span>
              </div>
            )}
          </div>

          {/* Movie info */}
          <div className="w-full max-w-sm space-y-3 text-center">
            {/* Title */}
            <h2 className="text-xl font-display font-bold text-clay-text leading-tight">
              {movie.title}
            </h2>

            {/* Metadata row */}
            <div className="flex items-center justify-center gap-3 text-sm text-clay-text-muted">
              {year && <span>{year}</span>}
              {year && runtime && <span aria-hidden="true">·</span>}
              {runtime && (
                <span>
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              )}
            </div>

            {/* Service badge */}
            <div className="flex justify-center">
              <ServiceBranding serviceId={currentService} />
            </div>

            {/* Ratings */}
            <div className="flex justify-center">
              <RatingBadges
                tmdbRating={movie.vote_average}
                imdbRating={imdbRating}
                rottenTomatoes={rottenTomatoes}
                metascore={metascore}
              />
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex justify-center">
                <GenreBadges genres={movie.genres} maxVisible={4} />
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="text-clay-text-muted text-sm leading-relaxed line-clamp-4 text-left">
                {movie.overview}
              </p>
            )}
          </div>

          {/* Watch on Service button */}
          <ExternalLink href={watchUrl} className="w-full max-w-sm">
            <MetalButton
              variant="primary"
              size="lg"
              className="w-full"
              style={{ backgroundColor: serviceConfig.color }}
              aria-label={`Watch ${movie.title} on ${serviceConfig.name}`}
            >
              Watch on {serviceConfig.name}
            </MetalButton>
          </ExternalLink>

          {/* Action row — Like / Dislike / Next */}
          <div className="flex gap-3 w-full max-w-sm" role="group" aria-label="Movie actions">
            <MetalButton
              variant="secondary"
              size="md"
              onClick={handleGreatPick}
              className="flex-1 gap-1.5"
              aria-label="Great pick — mark as liked and load next"
            >
              <ThumbsUp className="w-4 h-4" aria-hidden="true" />
              Great Pick
            </MetalButton>

            <MetalButton
              variant="secondary"
              size="md"
              onClick={handleNotThis}
              className="flex-1 gap-1.5"
              aria-label="Not this one — mark as disliked and load next"
            >
              <ThumbsDown className="w-4 h-4" aria-hidden="true" />
              Not This
            </MetalButton>

            <MetalButton
              variant="ghost"
              size="md"
              onClick={nextMovie}
              className="px-3"
              aria-label="Skip to next movie"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
            </MetalButton>
          </div>
        </div>
      )}
    </div>
  );
}
