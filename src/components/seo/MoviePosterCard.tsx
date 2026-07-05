import { Link } from "react-router";
import { getPosterUrl } from "@/services/tmdb/client";
import { tmdbPosterSrcSet, posterSizes } from "@/hooks/useResponsiveImage";
import { moviePath } from "@/lib/movie-url";
import type { TMDBMovie } from "@/types/movie";

interface MoviePosterCardProps {
  movie: TMDBMovie;
  /** Optional query suffix, e.g. "?source=trending" */
  search?: string;
}

export function MoviePosterCard({ movie, search = "" }: MoviePosterCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, "w185");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const ratingPercent = Math.round(movie.vote_average * 10);

  let ratingColor = "bg-red-500/80 text-white";
  if (ratingPercent >= 70) ratingColor = "bg-green-500/80 text-white";
  else if (ratingPercent >= 50) ratingColor = "bg-yellow-500/80 text-white";

  return (
    <Link
      role="listitem"
      to={`${moviePath(movie)}${search}`}
      className="w-full flex flex-col gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl contain-card cv-auto"
      aria-label={`${movie.title}${year ? `, ${year}` : ""}, rated ${ratingPercent}%`}
    >
      <div className="w-40 md:w-full h-60 rounded-2xl overflow-hidden bg-white/[0.05] border border-white/10 relative transition-all duration-300 group-hover:border-white/20 group-hover:shadow-lg group-hover:shadow-accent/10">
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
          <div className="w-full h-full flex items-center justify-center bg-clay-surface">
            <span className="text-clay-text-muted text-xs text-center px-2">
              No poster
            </span>
          </div>
        )}
        <div
          className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-md ${ratingColor}`}
          aria-hidden="true"
        >
          {ratingPercent}%
        </div>
      </div>
      <div className="px-0.5">
        <p className="text-clay-text text-sm font-semibold leading-tight line-clamp-2 group-hover:text-clay-accent transition-colors">
          {movie.title}
        </p>
        {year && <p className="text-clay-text-muted text-xs mt-0.5">{year}</p>}
      </div>
    </Link>
  );
}
