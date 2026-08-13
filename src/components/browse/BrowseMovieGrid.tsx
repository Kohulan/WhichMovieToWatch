import { Link } from "react-router";
import { motion } from "motion/react";
import { Film } from "lucide-react";
import { getPosterUrl } from "@/services/tmdb/client";
import { getMoviePosterLayoutId } from "@/lib/layout-ids";
import { moviePath } from "@/lib/movie-url";
import { tmdbPosterSrcSet, posterSizes } from "@/hooks/useResponsiveImage";
import { ratingColorClass, getMovieYear } from "@/lib/rating-color";
import { MetalButton } from "@/components/ui";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import type { TMDBMovie } from "@/types/movie";

// motion.create() wraps react-router's Link so cards are real <a href>
// elements (crawlable) while keeping the whileHover/whileTap micro-interactions.
const MotionLink = motion.create(Link);

interface BrowseMovieGridProps {
  results: TMDBMovie[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalResults: number;
  providerName: string | null;
  onClearFilters: () => void;
}

import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { useHaptics } from "@/hooks/useHaptics";
import { Heart } from "lucide-react";

export function BrowseMovieGrid({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  totalResults,
  providerName,
  onClearFilters,
}: BrowseMovieGridProps) {
  const lovedMovies = useMovieHistoryStore((s) => s.lovedMovies);
  const markLoved = useMovieHistoryStore((s) => s.markLoved);
  const { trigger: triggerHaptics } = useHaptics();

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
            Nothing matches.
          </p>
          <p className="text-clay-text-muted text-xs max-w-xs">
            {providerName
              ? `Loosen a filter to see more from ${providerName}.`
              : "Loosen a filter or try a different platform."}
          </p>
        </div>
        <MetalButton variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </MetalButton>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      <StaggerContainer
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-5"
        stagger={0.03}
        direction="up"
        role="list"
        aria-label="Browse movies"
      >
        {results.map((movie) => {
          const posterUrl = getPosterUrl(movie.poster_path, "w342");
          const year = getMovieYear(movie.release_date);
          const ratingPct = Math.round(movie.vote_average * 10);
          const ratingColor = ratingColorClass(movie.vote_average);
          const isLoved = lovedMovies.includes(movie.id);

          return (
            <StaggerItem key={movie.id} direction="up">
              <MotionLink
                to={moviePath(movie)}
                state={{ source: "browse" }}
                role="listitem"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                aria-label={`${movie.title}${year ? `, ${year}` : ""}, rated ${ratingPct}%`}
                className="w-full flex flex-col text-left group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
              >
                {/* Poster Board with fully rounded edges */}
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-clay-surface shadow-sm dark:shadow-none border border-black/[0.06] dark:border-white/[0.08] transition-all duration-300 group-hover:shadow-lg group-hover:border-black/[0.12] dark:group-hover:border-white/[0.16]">
                  {posterUrl ? (
                    <motion.img
                      layoutId={getMoviePosterLayoutId(movie.id)}
                      src={posterUrl}
                      srcSet={
                        movie.poster_path
                          ? tmdbPosterSrcSet(movie.poster_path)
                          : undefined
                      }
                      sizes={posterSizes}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <motion.div
                      layoutId={getMoviePosterLayoutId(movie.id)}
                      className="w-full h-full flex items-center justify-center bg-clay-surface"
                    >
                      <Film
                        className="w-8 h-8 text-clay-text-muted/30"
                        aria-hidden="true"
                      />
                    </motion.div>
                  )}

                  {/* Quick-Save Love Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markLoved(movie.id);
                      triggerHaptics("success");
                    }}
                    aria-label={isLoved ? "Saved to favorites" : "Save to favorites"}
                    className={`
                      absolute top-2 left-2 z-10
                      w-7 h-7 rounded-full flex items-center justify-center
                      backdrop-blur-md transition-all duration-200
                      ${
                        isLoved
                          ? "bg-accent text-white shadow-md shadow-accent/30 scale-105"
                          : "bg-black/40 text-white/80 hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100"
                      }
                    `}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isLoved ? "fill-white" : ""}`}
                    />
                  </button>

                  {/* Rating Badge */}
                  <div
                    className={`
                      absolute top-2 right-2
                      text-[11px] font-bold
                      px-2 py-0.5 rounded-lg
                      ${ratingColor}
                    `}
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    aria-hidden="true"
                  >
                    {ratingPct}%
                  </div>
                </div>

                {/* Movie Title & Info tight under poster */}
                <div className="mt-2 px-0.5">
                  <p className="text-clay-text text-xs sm:text-sm font-semibold leading-snug line-clamp-1 group-hover:text-accent transition-colors duration-200">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="text-clay-text-muted text-xs mt-0.5">
                      {year}
                    </p>
                  )}
                </div>
              </MotionLink>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

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
