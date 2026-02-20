// Two-column movie hero — poster left, info right on desktop; stacked on mobile

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Film } from "lucide-react";
import { getPosterUrl } from "@/services/tmdb/client";
import { tmdbPosterSrcSet, posterSizes } from "@/hooks/useResponsiveImage";
import type { TMDBMovieDetails } from "@/types/movie";
import { GenreBadges } from "./GenreBadges";

interface MovieHeroProps {
  movie: TMDBMovieDetails;
  /** Content rendered below the poster (e.g. trailer button) */
  posterFooter?: ReactNode;
  /** Extra content rendered below the overview inside the info column */
  children?: ReactNode;
  /**
   * Optional movie ID for layoutId — connects this hero poster to the similar-movie
   * thumbnail via Framer Motion's shared layout animation (hero expand effect).
   * Uses prefix `similar-poster-{movieId}` to match the thumbnail layoutId.
   */
  movieId?: number;
}

/** Format runtime from minutes to "Xh Ym" */
function formatRuntime(minutes: number | null): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Extract 4-digit year from release_date (e.g. "2023-05-15" → "2023") */
function extractYear(releaseDate: string): string {
  return releaseDate ? releaseDate.slice(0, 4) : "";
}

/**
 * MovieHero — Two-column layout with poster + info.
 *
 * Desktop: poster left (280px), info right in a grid.
 * Mobile: single column, poster centered on top.
 * posterFooter renders below the poster (trailer button).
 * children render below the overview in the info column.
 */
export function MovieHero({
  movie,
  posterFooter,
  children,
  movieId,
}: MovieHeroProps) {
  const [posterError, setPosterError] = useState(false);

  const posterUrl = getPosterUrl(movie.poster_path, "w342");
  const year = extractYear(movie.release_date);
  const runtime = formatRuntime(movie.runtime);

  // layoutId connects this hero poster to the similar-movie thumbnail for hero expand animation
  const posterLayoutId = movieId ? `similar-poster-${movieId}` : undefined;

  return (
    <div
      role="region"
      aria-label={`Movie details: ${movie.title}`}
      className="w-full md:grid md:grid-cols-[280px_1fr] md:gap-8"
    >
      {/* Poster column */}
      <div className="flex-shrink-0 mx-auto md:mx-0 mb-4 md:mb-0">
        {posterUrl && !posterError ? (
          <motion.img
            layoutId={posterLayoutId}
            src={posterUrl}
            srcSet={tmdbPosterSrcSet(movie.poster_path)}
            sizes={posterSizes}
            alt={`${movie.title} poster`}
            loading="lazy"
            decoding="async"
            onError={() => setPosterError(true)}
            className="w-48 md:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 object-cover mx-auto md:mx-0 border border-white/10"
          />
        ) : (
          <motion.div
            layoutId={posterLayoutId}
            className="w-48 md:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto md:mx-0"
            aria-label={`${movie.title} poster placeholder`}
          >
            <Film className="w-12 h-12 text-clay-text-muted opacity-50" />
          </motion.div>
        )}

        {/* Below-poster slot (trailer button) */}
        {posterFooter && (
          <div className="mt-3 flex justify-center md:justify-start">
            {posterFooter}
          </div>
        )}
      </div>

      {/* Info column */}
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="font-heading font-semibold text-2xl md:text-3xl text-clay-text leading-tight">
          {movie.title}
        </h1>

        {/* Year + runtime meta pills */}
        <div className="flex items-center gap-2 mt-3">
          {year && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-clay-surface/80 backdrop-blur-sm border border-white/15 text-sm text-clay-text font-medium">
              {year}
            </span>
          )}
          {runtime && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-clay-surface/80 backdrop-blur-sm border border-white/15 text-sm text-clay-text font-medium">
              {runtime}
            </span>
          )}
        </div>

        {/* Genre badges */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-3">
            <GenreBadges genres={movie.genres} />
          </div>
        )}

        {/* Overview with left border accent */}
        {movie.overview && (
          <div className="mt-4 border-l-2 border-accent pl-4">
            <p className="text-clay-text font-light leading-relaxed text-sm line-clamp-5">
              {movie.overview}
            </p>
          </div>
        )}

        {/* Slotted content — actions, ratings, providers, etc. */}
        {children && <div className="mt-4 space-y-4">{children}</div>}
      </div>
    </div>
  );
}
