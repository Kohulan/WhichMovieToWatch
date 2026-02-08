"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { SwipeStack } from "@/components/movie/SwipeStack";
import { GenrePill } from "@/components/ui/GenrePill";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { useDiscover } from "@/hooks/useMovie";
import { useUI } from "@/stores/ui";
import { GENRES } from "@/types/movie";

export default function DiscoverPage() {
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const setMovieDetail = useUI((s) => s.setMovieDetail);

  const { data, isLoading } = useDiscover({
    page,
    genre: selectedGenre,
  });

  const movies = data?.results || [];

  const handleNeedMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const handleSelectMovie = useCallback(
    (id: number) => {
      setMovieDetail(id);
    },
    [setMovieDetail]
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      {/* Header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
          <Compass size={32} className="inline mr-2 text-[var(--accent-primary)]" />
          Discover Movies
        </h1>
        <p className="text-[var(--text-secondary)]">
          Swipe right to love, left to skip. Find your next favorite film.
        </p>
      </motion.div>

      {/* Genre filters */}
      <motion.div
        className="flex gap-2 flex-wrap justify-center mb-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GenrePill
          name="All"
          active={!selectedGenre}
          onClick={() => setSelectedGenre(undefined)}
        />
        {GENRES.slice(0, 12).map((genre) => (
          <GenrePill
            key={genre.id}
            name={genre.name}
            active={selectedGenre === String(genre.id)}
            onClick={() =>
              setSelectedGenre(
                selectedGenre === String(genre.id) ? undefined : String(genre.id)
              )
            }
          />
        ))}
      </motion.div>

      {/* Swipe stack */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className="max-w-sm mx-auto">
            <MovieCardSkeleton />
          </div>
        ) : movies.length > 0 ? (
          <SwipeStack
            movies={movies}
            onSelect={handleSelectMovie}
            onNeedMore={handleNeedMore}
          />
        ) : (
          <div className="text-center py-20 text-[var(--text-muted)]">
            No movies found. Try a different genre.
          </div>
        )}
      </motion.div>
    </div>
  );
}
