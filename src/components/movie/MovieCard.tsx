"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Heart, Eye, X } from "lucide-react";
import { ClayCard } from "@/components/ui/ClayCard";
import { RatingRing } from "@/components/ui/RatingRing";
import { tmdbImage } from "@/lib/constants";
import { formatYear } from "@/lib/utils";
import type { Movie } from "@/types/movie";
import { GENRES } from "@/types/movie";
import { useHistory } from "@/stores/history";

interface MovieCardProps {
  movie: Movie;
  size?: "default" | "small" | "large" | "wide" | "tall";
  onSelect?: (id: number) => void;
  showActions?: boolean;
  index?: number;
}

export function MovieCard({
  movie,
  size = "default",
  onSelect,
  showActions = true,
  index = 0,
}: MovieCardProps) {
  const { loveMovie, skipMovie, isLoved } = useHistory();
  const genreNames = movie.genre_ids
    .slice(0, 2)
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);

  const loved = isLoved(movie.id);

  return (
    <ClayCard
      size={size}
      glow
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelect?.(movie.id)}
      layoutId={`movie-card-${movie.id}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--clay-radius)]">
        <Image
          src={tmdbImage(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 4}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute top-3 right-3">
          <RatingRing rating={movie.vote_average} size={44} strokeWidth={3} />
        </div>

        {/* Quick actions */}
        {showActions && (
          <motion.div
            className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
          >
            <motion.button
              className={`p-2 rounded-full backdrop-blur-md ${
                loved
                  ? "bg-red-500/80 text-white"
                  : "bg-black/40 text-white/80 hover:text-white"
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                loveMovie(movie.id);
              }}
              aria-label="Love this movie"
            >
              <Heart size={16} fill={loved ? "currentColor" : "none"} />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                skipMovie(movie.id);
              }}
              aria-label="Skip this movie"
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 text-sm">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{formatYear(movie.release_date)}</span>
          {genreNames.length > 0 && (
            <>
              <span className="text-[var(--border-subtle)]">&bull;</span>
              <span>{genreNames.join(", ")}</span>
            </>
          )}
        </div>
        {(size === "large" || size === "wide") && movie.overview && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
            {movie.overview}
          </p>
        )}
      </div>
    </ClayCard>
  );
}
