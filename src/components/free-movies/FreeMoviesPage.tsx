// Free Movies — cinematic YouTube movie discovery with TMDB metadata (FREE-01 through FREE-04)

import { useEffect } from 'react';
import { Youtube, SkipForward, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useFreeMovies } from '@/hooks/useFreeMovies';
import { useOmdbRatings } from '@/hooks/useOmdbRatings';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { MovieHero } from '@/components/movie/MovieHero';
import { RatingBadges } from '@/components/movie/RatingBadges';
import { ProviderSection } from '@/components/movie/ProviderSection';
import { TrailerLink } from '@/components/movie/TrailerLink';
import { MetalButton } from '@/components/ui/MetalButton';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClaySkeletonCard } from '@/components/ui/ClaySkeletonCard';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { useAnnounce } from '@/components/shared/ScreenReaderAnnouncer';
import { getBackdropUrl } from '@/services/tmdb/client';
import { tmdbBackdropSrcSet, backdropSizes } from '@/hooks/useResponsiveImage';
import type { TMDBMovieDetails } from '@/types/movie';

export function FreeMoviesPage() {
  const { movie, isLoading, error, nextMovie } = useFreeMovies();
  const [announce, Announcer] = useAnnounce();

  const tmdb = movie?.tmdbDetails ?? null;
  const imdbId = tmdb?.imdb_id ?? null;
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(imdbId);

  const { providers } = useWatchProviders(tmdb?.id ?? null);

  const youtubeUrl = movie
    ? `https://www.youtube.com/watch?v=${movie.youtubeId}`
    : '#';

  const backdropUrl = tmdb?.backdrop_path
    ? getBackdropUrl(tmdb.backdrop_path, 'original')
    : null;

  const displayTitle = tmdb?.title ?? movie?.title ?? '';
  const findMovieLink = tmdb
    ? `https://www.themoviedb.org/movie/${tmdb.id}`
    : undefined;

  // A11Y-01: Announce movie title to screen readers when a new free movie loads (A11Y-04)
  useEffect(() => {
    if (displayTitle) {
      announce(`Now showing free movie: ${displayTitle}`);
    }
  }, [movie?.youtubeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build a TMDBMovieDetails-compatible object for MovieHero
  // When tmdb is null, create a minimal stub with the movie title
  const heroMovie: TMDBMovieDetails | null = tmdb ?? (movie ? {
    id: 0,
    title: movie.title,
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    runtime: null,
    vote_average: 0,
    vote_count: 0,
    genres: [],
    imdb_id: null,
    original_language: '',
    original_title: movie.title,
    popularity: 0,
    adult: false,
    video: false,
    budget: 0,
    revenue: 0,
    tagline: '',
    status: '',
    production_companies: [],
  } as TMDBMovieDetails : null);

  return (
    <div className="w-full">
      <Announcer />

      {/* Fixed full-screen backdrop — crossfades between movies */}
      {backdropUrl && tmdb && (
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.img
              key={tmdb.id}
              src={backdropUrl}
              srcSet={tmdb.backdrop_path ? tmdbBackdropSrcSet(tmdb.backdrop_path) : undefined}
              sizes={backdropSizes}
              alt=""
              loading="lazy"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-clay-base from-5% via-clay-base/80 via-35% to-clay-base/20" />
        </div>
      )}

      {/* Page header — once: header near top, only animates on first view (ANIM-02) */}
      <ScrollReveal travel={40} once className="relative z-10 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-heading font-semibold text-clay-text">
            Free Movies
          </h1>
          <p className="text-sm text-clay-text-muted font-light mt-0.5">
            Over 2,000 free movies to discover
          </p>
        </div>
      </ScrollReveal>

      {/* Loading state */}
      {isLoading && (
        <div className="relative z-10 w-full px-4 py-6">
          <ClaySkeletonCard hasImage lines={4} className="w-full max-w-7xl mx-auto" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="relative z-10 w-full px-4 py-6">
          <ClayCard className="max-w-7xl mx-auto">
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-clay-text font-semibold mb-1">
                Could not load free movies
              </p>
              <p className="text-clay-text-muted text-sm mb-4">{error}</p>
              <MetalButton variant="secondary" size="sm" onClick={nextMovie}>
                Try again
              </MetalButton>
            </div>
          </ClayCard>
        </div>
      )}

      {/* Movie hero — morph transition on Next Movie */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && movie && heroMovie && (
          <motion.section
            key={movie.youtubeId}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pt-4 pb-8"
          >
            <div className="max-w-7xl mx-auto w-full">
              <MovieHero
                movie={heroMovie}
                posterFooter={tmdb ? <TrailerLink videos={tmdb.videos} /> : undefined}
              >
                {/* Watch on YouTube */}
                <ExternalLink href={youtubeUrl} className="block">
                  <MetalButton
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto gap-2"
                    style={{ backgroundColor: '#FF0000' }}
                    aria-label={`Watch ${displayTitle} on YouTube`}
                  >
                    <Youtube className="w-5 h-5" aria-hidden="true" />
                    Watch on YouTube
                  </MetalButton>
                </ExternalLink>

                {/* Next Suggestion */}
                <MetalButton
                  variant="secondary"
                  size="sm"
                  onClick={nextMovie}
                  className="gap-2"
                  aria-label="Load next free movie suggestion"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  Next Suggestion
                </MetalButton>

                {/* Rating badges */}
                {tmdb && (
                  <RatingBadges
                    tmdbRating={tmdb.vote_average}
                    imdbRating={imdbRating}
                    rottenTomatoes={rottenTomatoes}
                    metascore={metascore}
                  />
                )}

                {/* Streaming providers */}
                <ProviderSection providers={providers} findMovieLink={findMovieLink} />

                {/* Regional disclaimer */}
                <p className="text-xs text-clay-text-muted leading-relaxed opacity-70">
                  Availability may vary by region. Some movies may not be accessible in all countries.
                </p>
              </MovieHero>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
