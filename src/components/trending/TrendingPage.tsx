// Trending (Now Playing) page — horizontal scroll strip with auto-refresh (TRND-01, TRND-02, TRND-03, TRND-04)

import { useNavigate } from 'react-router';
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { getPosterUrl } from '@/services/tmdb/client';
import { tmdbPosterSrcSet, posterSizes } from '@/hooks/useResponsiveImage';
import { ClaySkeletonCard } from '@/components/ui';
import { LoadingQuotes } from '@/components/animation/LoadingQuotes';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';

/**
 * TrendingPage — Horizontal scroll row of now-playing movies with auto-refresh.
 *
 * Shows region-aware Now Playing movies from TMDB. Automatically falls back to
 * popular movies if now_playing returns empty for the current region.
 * Auto-refreshes every 30 minutes. Supports manual refresh via refresh button.
 * Tapping a movie navigates to /#/?movie={id} for full discovery view. (TRND-04)
 */
export function TrendingPage() {
  const { movies, isLoading, error, refresh } = useTrending();
  const navigate = useNavigate();

  function handleMovieClick(movieId: number) {
    // Navigate to discovery page with deep-link to load full movie details
    navigate(`/discover?movie=${movieId}`);
  }

  if (isLoading && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-clay-text">
            Now Playing
          </h2>
        </div>
        <div aria-busy="true" aria-label="Loading now playing movies">
          <LoadingQuotes />
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-heading font-semibold text-clay-text">
          Now Playing
        </h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
          <p className="text-clay-text-muted text-sm">{error}</p>
          <button
            onClick={refresh}
            className="text-sm text-clay-text underline underline-offset-2 hover:opacity-80 transition-opacity"
            aria-label="Retry loading now playing movies"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-3 p-4" aria-labelledby="trending-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          id="trending-heading"
          className="text-xl font-heading font-semibold text-clay-text"
        >
          Now Playing
        </h2>
        <div className="flex items-center gap-2">
          {/* Last updated indicator */}
          {!isLoading && movies.length > 0 && (
            <span className="text-xs text-clay-text-muted flex items-center gap-1" aria-live="polite">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Live
            </span>
          )}
          {/* Manual refresh button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-clay-text-muted hover:text-clay-text hover:bg-clay-base/30 transition-colors disabled:opacity-50"
            aria-label="Refresh now playing movies"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Responsive grid — horizontal scroll on mobile, grid on desktop */}
      {/* StaggerContainer staggers card entrances with 50ms between each (ANIM-02) */}
      <StaggerContainer
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:overflow-visible md:mx-0 md:px-0"
        stagger={0.05}
        direction="up"
        role="list"
        aria-label="Now playing movies"
      >
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, 'w185');
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPercent = Math.round(movie.vote_average * 10);

          let ratingColor = 'bg-red-500/80 text-white';
          if (ratingPercent >= 70) {
            ratingColor = 'bg-green-500/80 text-white';
          } else if (ratingPercent >= 50) {
            ratingColor = 'bg-yellow-500/80 text-white';
          }

          return (
            <StaggerItem key={movie.id} direction="up" className="flex-shrink-0 snap-start w-40 md:w-full">
              <button
                role="listitem"
                onClick={() => handleMovieClick(movie.id)}
                className="w-full flex flex-col gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
                aria-label={`${movie.title}${year ? `, ${year}` : ''}, rated ${ratingPercent}%`}
              >
                {/* Poster */}
                <div className="w-40 md:w-full h-60 rounded-2xl overflow-hidden bg-white/[0.05] border border-white/10 relative transition-all duration-300 group-hover:border-white/20 group-hover:shadow-lg group-hover:shadow-accent/10">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      srcSet={movie.poster_path ? tmdbPosterSrcSet(movie.poster_path) : undefined}
                      sizes={posterSizes}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-clay-surface">
                      <span className="text-clay-text-muted text-xs text-center px-2">
                        No poster
                      </span>
                    </div>
                  )}

                  {/* Rating badge overlay */}
                  <div
                    className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-md ${ratingColor}`}
                    aria-hidden="true"
                  >
                    {ratingPercent}%
                  </div>
                </div>

                {/* Title + year */}
                <div className="px-0.5">
                  <p className="text-clay-text text-sm font-semibold leading-tight line-clamp-2 group-hover:text-clay-accent transition-colors">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-clay-text-muted text-xs mt-0.5">{year}</p>
                  )}
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
