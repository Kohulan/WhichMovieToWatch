import { getPosterUrl } from '@/services/tmdb/client';
import { ClaySkeletonCard } from '@/components/ui';
import { MetalButton } from '@/components/ui';
import { LoadingQuotes } from '@/components/animation/LoadingQuotes';
import type { TMDBMovie } from '@/types/movie';

interface SearchResultsProps {
  results: TMDBMovie[];
  onSelectMovie: (movieId: number) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * SearchResults — Responsive grid of movie cards from search/discover results.
 *
 * Renders poster, title, year, and colored rating badge per card.
 * Supports click-to-view navigation (SRCH-04) and keyboard access via tabIndex+Enter (A11Y-03).
 * Shows ClaySkeletonCard placeholders during initial load.
 * "Load More" MetalButton at bottom when hasMore (ADVS-06).
 * Empty state shown when not loading and results are empty.
 */
export function SearchResults({
  results,
  onSelectMovie,
  isLoading,
  hasMore,
  onLoadMore,
}: SearchResultsProps) {
  function getRatingColor(voteAverage: number): string {
    const pct = Math.round(voteAverage * 10);
    if (pct >= 70) return 'bg-green-500/80 text-white';
    if (pct >= 50) return 'bg-yellow-500/80 text-white';
    return 'bg-red-500/80 text-white';
  }

  // Loading state — movie-themed quotes with film-reel spinner (ANIM-06)
  if (isLoading && results.length === 0) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading search results"
      >
        <LoadingQuotes size="sm" />
      </div>
    );
  }

  // Empty state
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
      {/* Results grid */}
      <ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
        role="list"
        aria-label="Search results"
      >
        {results.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, 'w185');
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPct = Math.round(movie.vote_average * 10);
          const ratingColor = getRatingColor(movie.vote_average);

          return (
            <li key={movie.id} role="listitem">
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
                aria-label={`${movie.title}${year ? `, ${year}` : ''}, rated ${ratingPct}%`}
                className="
                  w-full text-left group
                  rounded-clay overflow-hidden
                  bg-clay-surface clay-shadow-md clay-texture
                  transition-all duration-200
                  hover:clay-shadow-lg hover:-translate-y-0.5
                  outline-none focus-visible:ring-2 focus-visible:ring-accent
                "
              >
                {/* Poster */}
                <div className="relative w-full aspect-[2/3] bg-clay-base overflow-hidden">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-clay-text-muted text-xs text-center px-2">
                        No poster
                      </span>
                    </div>
                  )}

                  {/* Rating badge overlay */}
                  <div
                    className={`absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${ratingColor}`}
                    aria-hidden="true"
                  >
                    {ratingPct}%
                  </div>
                </div>

                {/* Title + year */}
                <div className="p-2">
                  <p className="text-clay-text text-xs font-semibold leading-tight line-clamp-2">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-clay-text-muted text-xs mt-0.5">{year}</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Load More button (ADVS-06) */}
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
