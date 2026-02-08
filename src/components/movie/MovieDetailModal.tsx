"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Clock, Calendar, Star, ExternalLink } from "lucide-react";
import { useMovieDetail } from "@/hooks/useMovie";
import { useUI } from "@/stores/ui";
import { RatingRing } from "@/components/ui/RatingRing";
import { StreamingBadges } from "@/components/ui/StreamingBadge";
import { ClayButton } from "@/components/ui/ClayButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { tmdbImage, tmdbBackdrop } from "@/lib/constants";
import { formatYear, formatRuntime, getTrailerUrl } from "@/lib/utils";

export function MovieDetailModal() {
  const movieId = useUI((s) => s.movieDetailId);
  const setMovieDetail = useUI((s) => s.setMovieDetail);
  const { data: movie, isLoading } = useMovieDetail(movieId);

  useEffect(() => {
    if (movieId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movieId]);

  const providers =
    movie?.["watch/providers"]?.results?.US?.flatrate || [];
  const providerLink = movie?.["watch/providers"]?.results?.US?.link;
  const trailerUrl = movie?.videos?.results
    ? getTrailerUrl(movie.videos.results)
    : null;
  const director = movie?.credits?.crew?.find((c) => c.job === "Director");
  const topCast = movie?.credits?.cast?.slice(0, 6) || [];

  return (
    <AnimatePresence>
      {movieId !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMovieDetail(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto clay-card mx-4"
            layoutId={movieId ? `movie-card-${movieId}` : undefined}
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {isLoading || !movie ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-64 w-full rounded-t-[var(--clay-radius)]" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                {/* Backdrop image */}
                <div className="relative h-64 md:h-80 overflow-hidden rounded-t-[var(--clay-radius)]">
                  {movie.backdrop_path && (
                    <Image
                      src={tmdbBackdrop(movie.backdrop_path)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-clay)] via-[var(--bg-clay)]/50 to-transparent" />

                  {/* Close button */}
                  <button
                    onClick={() => setMovieDetail(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>

                  {/* Poster overlay */}
                  <div className="absolute bottom-4 left-6 flex items-end gap-4">
                    <div className="relative w-24 h-36 md:w-32 md:h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 flex-shrink-0">
                      <Image
                        src={tmdbImage(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Title & meta */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                        {movie.title}
                      </h2>
                      {movie.tagline && (
                        <p className="text-sm text-[var(--accent-primary)] italic mt-1">
                          &ldquo;{movie.tagline}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatYear(movie.release_date)}
                        </span>
                        {movie.runtime && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatRuntime(movie.runtime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <RatingRing
                      rating={movie.vote_average}
                      size={64}
                      strokeWidth={4}
                    />
                  </div>

                  {/* Genres */}
                  <div className="flex gap-2 flex-wrap">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Overview */}
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {movie.overview}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    {trailerUrl && (
                      <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                        <ClayButton variant="accent" size="md">
                          <Play size={16} className="mr-2 inline" />
                          Watch Trailer
                        </ClayButton>
                      </a>
                    )}
                    {providerLink && (
                      <a href={providerLink} target="_blank" rel="noopener noreferrer">
                        <ClayButton variant="secondary" size="md">
                          <ExternalLink size={16} className="mr-2 inline" />
                          Where to Watch
                        </ClayButton>
                      </a>
                    )}
                  </div>

                  {/* Streaming */}
                  {providers.length > 0 && (
                    <StreamingBadges providers={providers} link={providerLink} />
                  )}

                  {/* Director & Cast */}
                  {director && (
                    <p className="text-sm text-[var(--text-muted)]">
                      Directed by{" "}
                      <span className="text-[var(--text-primary)] font-medium">
                        {director.name}
                      </span>
                    </p>
                  )}

                  {topCast.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                        Cast
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {topCast.map((person) => (
                          <div
                            key={person.id}
                            className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
                          >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
                              {person.profile_path ? (
                                <Image
                                  src={tmdbImage(person.profile_path, "w185")}
                                  alt={person.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-lg">
                                  {person.name[0]}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] text-center line-clamp-1">
                              {person.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
