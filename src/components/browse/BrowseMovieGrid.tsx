import { useNavigate } from "react-router";
import { getPosterUrl } from "@/services/tmdb/client";
import { tmdbPosterSrcSet, posterSizes } from "@/hooks/useResponsiveImage";
import { MetalButton } from "@/components/ui";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import type { TMDBMovie } from "@/types/movie";

interface BrowseMovieGridProps {
  results: TMDBMovie[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalResults: number;
  providerName: string | null;
  onClearFilters: () => void;
}

function getRatingColor(voteAverage: number): string {
  const pct = Math.round(voteAverage * 10);
  if (pct >= 70) return "bg-green-500/80 text-white";
  if (pct >= 50) return "bg-yellow-500/80 text-white";
  return "bg-red-500/80 text-white";
}

export function BrowseMovieGrid({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  totalResults,
  providerName,
  onClearFilters,
}: BrowseMovieGridProps) {
  const navigate = useNavigate();

  function handleMovieClick(movieId: number) {
    navigate(`/discover?movie=${movieId}&source=browse`);
  }

  // Initial loading state
  if (isLoading && results.length === 0) {
    return (
      <div aria-busy="true" aria-label="Loading movies">
        <LoadingQuotes size="sm" />
      </div>
    );
  }

  // Empty state
  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
        <p className="text-clay-text-muted text-sm">
          No movies found{providerName ? ` on ${providerName}` : ""}. Try
          adjusting your filters.
        </p>
        <MetalButton variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </MetalButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Results count */}
      {totalResults > 0 && providerName && (
        <p className="text-clay-text-muted text-xs px-4">
          {totalResults.toLocaleString()} movies on {providerName}
        </p>
      )}

      {/* Movie grid */}
      <StaggerContainer
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
        stagger={0.04}
        direction="up"
        role="list"
        aria-label="Browse movies"
      >
        {results.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, "w185");
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPct = Math.round(movie.vote_average * 10);
          const ratingColor = getRatingColor(movie.vote_average);

          return (
            <StaggerItem key={movie.id} direction="up">
              <button
                type="button"
                role="listitem"
                onClick={() => handleMovieClick(movie.id)}
                aria-label={`${movie.title}${year ? `, ${year}` : ""}, rated ${ratingPct}%`}
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
                      srcSet={
                        movie.poster_path
                          ? tmdbPosterSrcSet(movie.poster_path)
                          : undefined
                      }
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
                    <p className="text-clay-text-muted text-xs mt-0.5">
                      {year}
                    </p>
                  )}
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Load More button */}
      {hasMore && (
        <div className="flex justify-center px-4">
          <MetalButton
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            disabled={isLoading}
            aria-label="Load more movies"
          >
            {isLoading ? "Loading..." : "Load More"}
          </MetalButton>
        </div>
      )}
    </div>
  );
}
