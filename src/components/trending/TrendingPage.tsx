// Trending (Now Playing) page — horizontal scroll strip with auto-refresh (TRND-01, TRND-02, TRND-03, TRND-04)

import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { getPosterUrl } from '@/services/tmdb/client';
import { ClaySkeletonCard } from '@/components/ui';

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

  function handleMovieClick(movieId: number) {
    // Navigate to discovery page with deep-link to load full movie details
    window.location.hash = `/?movie=${movieId}`;
  }

  if (isLoading && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-clay-text">
            Now Playing
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4" aria-busy="true" aria-label="Loading now playing movies">
          {Array.from({ length: 5 }, (_, i) => (
            <ClaySkeletonCard
              key={i}
              className="flex-shrink-0 w-40"
              hasImage
              lines={2}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-display font-bold text-clay-text">
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
          className="text-xl font-display font-bold text-clay-text"
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

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
        role="list"
        aria-label="Now playing movies"
      >
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, 'w185');
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPercent = Math.round(movie.vote_average * 10);

          // Rating badge color
          const ratingColor =
            ratingPercent >= 70
              ? 'bg-green-500/80 text-white'
              : ratingPercent >= 50
                ? 'bg-yellow-500/80 text-white'
                : 'bg-red-500/80 text-white';

          return (
            <button
              key={movie.id}
              role="listitem"
              onClick={() => handleMovieClick(movie.id)}
              className="flex-shrink-0 snap-start w-40 flex flex-col gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-text rounded-clay"
              aria-label={`${movie.title}${year ? `, ${year}` : ''}, rated ${ratingPercent}%`}
            >
              {/* Poster */}
              <div className="w-40 h-60 rounded-clay overflow-hidden bg-clay-base relative clay-shadow-md group-hover:clay-shadow-lg transition-shadow">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
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
          );
        })}
      </div>
    </section>
  );
}
