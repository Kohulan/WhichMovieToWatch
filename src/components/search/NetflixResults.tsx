import { useMemo } from 'react';
import { getPosterUrl } from '@/services/tmdb/client';
import { tmdbPosterSrcSet, posterSizes } from '@/hooks/useResponsiveImage';
import { MetalButton } from '@/components/ui';
import { LoadingQuotes } from '@/components/animation/LoadingQuotes';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import { useNetflixAvailability } from '@/hooks/useNetflixAvailability';
import { getCountryName } from '@/lib/country-names';
import type { TMDBMovie } from '@/types/movie';

interface NetflixResultsProps {
  results: TMDBMovie[];
  query: string;
  onSelectMovie: (movieId: number) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function getRatingColor(voteAverage: number): string {
  const pct = Math.round(voteAverage * 10);
  if (pct >= 70) return 'bg-green-500/80 text-white';
  if (pct >= 50) return 'bg-yellow-500/80 text-white';
  return 'bg-red-500/80 text-white';
}

function sortWithExactMatchFirst(movies: TMDBMovie[], query: string): TMDBMovie[] {
  if (!query.trim()) return movies;
  const q = query.toLowerCase();
  const exact: TMDBMovie[] = [];
  const rest: TMDBMovie[] = [];
  for (const movie of movies) {
    if (movie.title.toLowerCase() === q) {
      exact.push(movie);
    } else {
      rest.push(movie);
    }
  }
  return [...exact, ...rest];
}

const MAX_VISIBLE_COUNTRIES = 6;

function NetflixCard({
  movie,
  onSelectMovie,
}: {
  movie: TMDBMovie;
  onSelectMovie: (movieId: number) => void;
}) {
  const { countries, isLoading: countriesLoading } = useNetflixAvailability(movie.id);
  const posterUrl = getPosterUrl(movie.poster_path, 'w185');
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const ratingPct = Math.round(movie.vote_average * 10);
  const ratingColor = getRatingColor(movie.vote_average);
  const hasNetflix = countries.length > 0;
  const visibleCountries = countries.slice(0, MAX_VISIBLE_COUNTRIES);
  const overflow = countries.length - MAX_VISIBLE_COUNTRIES;

  return (
    <button
      type="button"
      tabIndex={0}
      onClick={() => onSelectMovie(movie.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectMovie(movie.id);
        }
      }}
      aria-label={`${movie.title}${year ? `, ${year}` : ''}, rated ${ratingPct}%${hasNetflix ? `, on Netflix in ${countries.length} countries` : ''}`}
      className={`
        w-full text-left group
        rounded-clay overflow-hidden
        bg-clay-surface clay-shadow-md clay-texture
        transition-all duration-200
        hover:clay-shadow-lg hover:-translate-y-0.5
        outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/60
        ${hasNetflix ? 'ring-1 ring-[#E50914]/20' : ''}
      `}
    >
      <div className="relative w-full aspect-[2/3] bg-clay-base overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-clay-text-muted text-xs text-center px-2">
              No poster
            </span>
          </div>
        )}
        <div
          className={`absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${ratingColor}`}
          aria-hidden="true"
        >
          {ratingPct}%
        </div>
      </div>

      <div className="p-2">
        <p className="text-clay-text text-xs font-semibold leading-tight line-clamp-2">
          {movie.title}
        </p>
        {year && (
          <p className="text-clay-text-muted text-xs mt-0.5">{year}</p>
        )}

        {/* Netflix availability */}
        <div className="mt-1.5">
          {countriesLoading ? (
            <div className="flex gap-1">
              <span className="inline-block w-6 h-4 bg-clay-base/60 rounded animate-pulse" />
              <span className="inline-block w-6 h-4 bg-clay-base/60 rounded animate-pulse" />
            </div>
          ) : hasNetflix ? (
            <div className="flex flex-wrap gap-1">
              {visibleCountries.map((code) => (
                <span
                  key={code}
                  title={getCountryName(code)}
                  className="
                    inline-block px-1 py-px text-[10px] font-bold
                    bg-[#E50914]/15 text-[#E50914] rounded
                    border border-[#E50914]/20
                  "
                >
                  {code}
                </span>
              ))}
              {overflow > 0 && (
                <span className="inline-block px-1 py-px text-[10px] font-medium text-clay-text-muted">
                  +{overflow} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-clay-text-muted text-[10px] italic">
              Not on Netflix
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function NetflixResults({
  results,
  query,
  onSelectMovie,
  isLoading,
  hasMore,
  onLoadMore,
}: NetflixResultsProps) {
  const sorted = useMemo(
    () => sortWithExactMatchFirst(results, query),
    [results, query],
  );

  if (isLoading && results.length === 0) {
    return (
      <div aria-busy="true" aria-label="Loading search results">
        <LoadingQuotes size="sm" />
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
        <p className="text-clay-text-muted text-sm">
          No movies found. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <StaggerContainer
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
        stagger={0.05}
        role="list"
        aria-label="Netflix search results"
      >
        {sorted.map((movie) => (
          <StaggerItem key={movie.id}>
            <div role="listitem">
              <NetflixCard movie={movie} onSelectMovie={onSelectMovie} />
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {hasMore && (
        <div className="flex justify-center px-4">
          <MetalButton
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            disabled={isLoading}
            aria-label="Load more search results"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </MetalButton>
        </div>
      )}
    </div>
  );
}
