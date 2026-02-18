// Main discovery screen — cinematic hero, ratings, providers, actions, similar movies

import { useEffect, useState, useCallback } from 'react';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { useRandomMovie } from '@/hooks/useRandomMovie';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { useOmdbRatings } from '@/hooks/useOmdbRatings';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { useSimilarMovies } from '@/hooks/useSimilarMovies';
import { useDeepLink } from '@/hooks/useDeepLink';
import { useAnnounce } from '@/components/shared/ScreenReaderAnnouncer';
import { MovieHero } from '@/components/movie/MovieHero';
import { RatingBadges } from '@/components/movie/RatingBadges';
import { ProviderSection } from '@/components/movie/ProviderSection';
import { TrailerLink } from '@/components/movie/TrailerLink';
import { MovieActions } from '@/components/movie/MovieActions';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClaySkeletonCard } from '@/components/ui/ClaySkeletonCard';
import { MetalButton } from '@/components/ui';
import { getPosterUrl } from '@/services/tmdb/client';
import type { TMDBMovieDetails } from '@/types/movie';

/**
 * DiscoveryPage — Main cinematic discovery screen.
 *
 * Composes MovieHero, RatingBadges, ProviderSection, TrailerLink, MovieActions.
 * Handles deep links (?movie=ID), loading/error states, and the "You might also like"
 * similar movies section triggered by Love action. (DISC-01 through DISC-04, INTR-01 through INTR-04)
 */
export function DiscoveryPage() {
  const [announce, Announcer] = useAnnounce();
  const [lovedMovieId, setLovedMovieId] = useState<number | null>(null);

  const { discover, isLoading, error, currentMovie: discoveryMovie } = useRandomMovie();
  const setCurrentMovie = useDiscoveryStore((s) => s.setCurrentMovie);
  const markLoved = useMovieHistoryStore((s) => s.markLoved);
  const recordLove = usePreferencesStore((s) => s.recordLove);

  // Deep link support (DISC-04)
  const { deepLinkMovieId, clearDeepLink } = useDeepLink();
  const { data: deepLinkMovie, isLoading: deepLinkLoading } = useMovieDetails(deepLinkMovieId);

  // Use deep link movie or the randomly discovered movie
  const currentMovie: TMDBMovieDetails | null = deepLinkMovie ?? discoveryMovie;

  // OMDB ratings for current movie
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(
    currentMovie?.imdb_id ?? null,
  );

  // Watch providers for current movie
  const { providers } = useWatchProviders(currentMovie?.id ?? null);

  // Similar movies — only triggered after Love action (INTR-01)
  const { movies: similarMovies, isLoading: similarLoading } = useSimilarMovies(lovedMovieId);

  // Load a random movie on first render if no deep link
  useEffect(() => {
    if (!deepLinkMovieId && !discoveryMovie) {
      discover();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When deep link movie is loaded, set it as current movie in store and clear param
  useEffect(() => {
    if (deepLinkMovie) {
      setCurrentMovie(deepLinkMovie);
      clearDeepLink();
    }
  }, [deepLinkMovie]); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce movie title to screen readers when it changes (A11Y-04)
  useEffect(() => {
    if (currentMovie?.title) {
      announce(`Now showing: ${currentMovie.title}`);
    }
  }, [currentMovie?.id, announce]);

  // Handle Next action
  const handleNext = useCallback(() => {
    setLovedMovieId(null);
    discover();
  }, [discover]);

  // Handle Love action (INTR-01, INTR-04)
  const handleLove = useCallback(() => {
    if (!currentMovie) return;
    const genreIds = currentMovie.genres?.map((g) => g.id) ?? [];
    const decade = currentMovie.release_date
      ? `${currentMovie.release_date.slice(0, 3)}0s`
      : 'unknown';
    const director = currentMovie.credits?.crew?.find((c) => c.job === 'Director');

    markLoved(currentMovie.id);
    recordLove(genreIds, decade, director?.id);

    // Trigger similar movies fetch
    setLovedMovieId(currentMovie.id);
  }, [currentMovie, markLoved, recordLove]);

  // Click a similar movie to load it as current (INTR-01)
  const handleSimilarMovieClick = useCallback(
    async (movieId: number) => {
      // Import fetchMovieDetails inline to avoid circular hook dependency
      const { fetchMovieDetails } = await import('@/services/tmdb/details');
      try {
        const details = await fetchMovieDetails(movieId);
        setCurrentMovie(details);
        setLovedMovieId(null);
      } catch (err) {
        console.warn('[DiscoveryPage] Failed to load similar movie:', err);
      }
    },
    [setCurrentMovie],
  );

  // Determine TMDB find-movie link for cross-region search (DISP-05)
  const findMovieLink = currentMovie
    ? `https://www.themoviedb.org/movie/${currentMovie.id}`
    : undefined;

  const showLoading = isLoading || deepLinkLoading;

  // Loading state
  if (showLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <Announcer />
        <ClaySkeletonCard hasImage lines={4} className="w-full" />
      </div>
    );
  }

  // Error state
  if (error && !currentMovie) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <Announcer />
        <ClayCard>
          <div className="p-6 text-center">
            <p className="text-clay-text-muted mb-4">{error}</p>
            <MetalButton variant="primary" size="md" onClick={discover}>
              Try Again
            </MetalButton>
          </div>
        </ClayCard>
      </div>
    );
  }

  // Empty state (no movie loaded yet)
  if (!currentMovie) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        <Announcer />
        <ClayCard>
          <div className="p-6 text-center">
            <p className="text-clay-text-muted mb-4">
              No movie loaded yet. Discover something!
            </p>
            <MetalButton variant="primary" size="md" onClick={discover}>
              Discover a Movie
            </MetalButton>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Announcer />

      {/* Cinematic hero (DISP-01) */}
      <MovieHero movie={currentMovie} />

      {/* Rating badges (DISP-02) */}
      <RatingBadges
        tmdbRating={currentMovie.vote_average}
        imdbRating={imdbRating}
        rottenTomatoes={rottenTomatoes}
        metascore={metascore}
      />

      {/* Streaming providers (DISP-05) */}
      <ProviderSection providers={providers} findMovieLink={findMovieLink} />

      {/* Trailer link (DISP-03) */}
      <TrailerLink videos={currentMovie.videos} />

      {/* Action buttons (DISP-06) */}
      <MovieActions
        movieId={currentMovie.id}
        movieGenres={currentMovie.genres ?? []}
        releaseYear={currentMovie.release_date?.slice(0, 4) ?? ''}
        onNext={handleNext}
        onLove={handleLove}
      />

      {/* Similar movies — shown after Love action (INTR-01) */}
      {(lovedMovieId !== null) && (
        <section aria-label="Similar movies you might enjoy" className="mt-6">
          <h3 className="font-heading text-base font-semibold text-clay-text mb-3">
            You might also like
          </h3>

          {similarLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-28 h-44 bg-clay-surface rounded-lg clay-shadow-sm animate-pulse"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : similarMovies.length > 0 ? (
            <div
              className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
              role="list"
            >
              {similarMovies.slice(0, 10).map((movie) => {
                const posterUrl = getPosterUrl(movie.poster_path, 'w185');
                const year = movie.release_date?.slice(0, 4) ?? '';

                return (
                  <button
                    key={movie.id}
                    role="listitem"
                    className="flex-shrink-0 w-28 snap-start text-left rounded-lg overflow-hidden bg-clay-surface clay-shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-clay-accent"
                    onClick={() => handleSimilarMovieClick(movie.id)}
                    aria-label={`Load ${movie.title}${year ? ` (${year})` : ''}`}
                  >
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-clay-base flex items-center justify-center">
                        <span className="text-clay-text-muted text-xs text-center px-1">
                          {movie.title}
                        </span>
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-clay-text text-xs font-medium line-clamp-2 leading-tight">
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
          ) : null}
        </section>
      )}
    </div>
  );
}
