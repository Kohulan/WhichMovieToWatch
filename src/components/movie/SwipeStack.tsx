"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { Heart, X, Play, Star } from "lucide-react";
import { tmdbImage } from "@/lib/constants";
import { formatYear } from "@/lib/utils";
import type { Movie } from "@/types/movie";
import { GENRES } from "@/types/movie";
import { useHistory } from "@/stores/history";
import { ClayButton } from "@/components/ui/ClayButton";
import { RatingRing } from "@/components/ui/RatingRing";

interface SwipeStackProps {
  movies: Movie[];
  onSelect?: (id: number) => void;
  onNeedMore?: () => void;
}

export function SwipeStack({ movies, onSelect, onNeedMore }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { loveMovie, skipMovie, markShown } = useHistory();

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const movie = movies[currentIndex];
      if (!movie) return;

      if (direction === "right") {
        loveMovie(movie.id);
      } else {
        skipMovie(movie.id);
      }
      markShown(movie.id);

      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= movies.length - 2) {
          onNeedMore?.();
        }
        return next;
      });
    },
    [currentIndex, movies, loveMovie, skipMovie, markShown, onNeedMore]
  );

  const visibleMovies = movies.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: 520 }}>
      <AnimatePresence>
        {visibleMovies.map((movie, i) => (
          <SwipeCard
            key={movie.id}
            movie={movie}
            isTop={i === 0}
            stackIndex={i}
            onSwipe={handleSwipe}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <ClayButton
          variant="secondary"
          size="lg"
          className="rounded-full !p-4"
          onClick={() => handleSwipe("left")}
          aria-label="Skip"
        >
          <X size={24} className="text-[var(--accent-rose)]" />
        </ClayButton>
        <ClayButton
          variant="accent"
          size="lg"
          className="rounded-full !p-4"
          onClick={() => handleSwipe("right")}
          aria-label="Love"
        >
          <Heart size={24} fill="currentColor" />
        </ClayButton>
      </div>
    </div>
  );
}

function SwipeCard({
  movie,
  isTop,
  stackIndex,
  onSwipe,
  onSelect,
}: {
  movie: Movie;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (dir: "left" | "right") => void;
  onSelect?: (id: number) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 1, 1, 1, 0.5]
  );

  // Overlay indicators
  const loveOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const genreNames = movie.genre_ids
    .slice(0, 3)
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale: 1 - stackIndex * 0.05,
        y: stackIndex * 8,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120) {
          onSwipe(info.offset.x > 0 ? "right" : "left");
        }
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1 - stackIndex * 0.05,
        opacity: 1,
        y: stackIndex * 8,
      }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="clay-card h-full overflow-hidden relative">
        {/* Poster */}
        <div className="relative h-[65%]">
          <Image
            src={tmdbImage(movie.poster_path, "w780")}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="400px"
            priority={isTop}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-clay)] via-transparent to-transparent" />

          {/* Swipe indicators */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-green-500/90 text-white font-bold text-lg rotate-12 border-2 border-white"
                style={{ opacity: loveOpacity }}
              >
                LOVE
              </motion.div>
              <motion.div
                className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-red-500/90 text-white font-bold text-lg -rotate-12 border-2 border-white"
                style={{ opacity: skipOpacity }}
              >
                NOPE
              </motion.div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] line-clamp-1">
                {movie.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {formatYear(movie.release_date)}
              </p>
            </div>
            <RatingRing rating={movie.vote_average} size={48} strokeWidth={3} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {genreNames.map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
              >
                {name}
              </span>
            ))}
          </div>

          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            {movie.overview}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
