import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Film } from "lucide-react";
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
  if (pct >= 70) return "bg-green-500/90 text-white";
  if (pct >= 50) return "bg-yellow-500/90 text-white";
  return "bg-red-500/90 text-white";
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

  // Empty state — cinematic
  if (!isLoading && results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center gap-4 py-20 px-4 text-center"
      >
        <div className="p-3 rounded-2xl bg-clay-surface/50 clay-shadow-sm">
          <Film className="w-7 h-7 text-clay-text-muted" aria-hidden="true" />
        </div>
        <div>
          <p className="text-clay-text text-sm font-medium mb-1">
            No movies found
          </p>
          <p className="text-clay-text-muted text-xs max-w-xs">
            {providerName
              ? `No results on ${providerName} with current filters.`
              : "Try adjusting your filters or selecting a different platform."}
          </p>
        </div>
        <MetalButton variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </MetalButton>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Movie grid — responsive poster cards */}
      <StaggerContainer
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        stagger={0.035}
        direction="up"
        role="list"
        aria-label="Browse movies"
      >
        {results.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, "w342");
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const ratingPct = Math.round(movie.vote_average * 10);
          const ratingColor = getRatingColor(movie.vote_average);

          return (
            <StaggerItem key={movie.id} direction="up">
              <motion.button
                type="button"
                role="listitem"
                onClick={() => handleMovieClick(movie.id)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                aria-label={`${movie.title}${year ? `, ${year}` : ""}, rated ${ratingPct}%`}
                className="
                  w-full text-left group cursor-pointer
                  rounded-2xl overflow-hidden
                  bg-white/[0.06] backdrop-blur-sm
                  border border-white/[0.08]
                  transition-shadow duration-300
                  hover:border-white/[0.15]
                  hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.06)]
                  outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-clay-base
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
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-clay-surface">
                      <Film
                        className="w-8 h-8 text-clay-text-muted/30"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Rating badge — glass pill */}
                  <div
                    className={`
                      absolute top-2 right-2
                      text-[11px] font-bold
                      px-2 py-0.5 rounded-lg
                      backdrop-blur-md
                      ${ratingColor}
                    `}
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    aria-hidden="true"
                  >
                    {ratingPct}%
                  </div>

                  {/* Year badge — appears on hover */}
                  {year && (
                    <div className="absolute bottom-2 left-2 text-white/90 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">
                      {year}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="p-2.5">
                  <p className="text-clay-text text-xs font-semibold leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-200">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-clay-text-muted text-[11px] mt-0.5 group-hover:hidden">
                      {year}
                    </p>
                  )}
                </div>
              </motion.button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Load More — centered with accent styling */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-2 pb-4"
        >
          <MetalButton
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            disabled={isLoading}
            aria-label="Load more movies"
          >
            {isLoading ? "Loading..." : "Load More"}
          </MetalButton>
        </motion.div>
      )}
    </div>
  );
}
