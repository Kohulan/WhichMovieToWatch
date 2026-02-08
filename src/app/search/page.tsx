"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Search as SearchIcon } from "lucide-react";
import { MovieCard } from "@/components/movie/MovieCard";
import { GenrePill } from "@/components/ui/GenrePill";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { useSearch, useDiscover } from "@/hooks/useMovie";
import { useUI } from "@/stores/ui";
import { GENRES } from "@/types/movie";
import { ANIMATION_CONFIG } from "@/lib/constants";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: ANIMATION_CONFIG.stagger.fast },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: ANIMATION_CONFIG.spring.default,
  },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const setMovieDetail = useUI((s) => s.setMovieDetail);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchData, isLoading: searching } = useSearch(debouncedQuery);
  const { data: browseData, isLoading: browsing } = useDiscover({
    genre: selectedGenre,
    page: 1,
  });

  const movies = debouncedQuery
    ? searchData?.results || []
    : browseData?.results || [];
  const isLoading = debouncedQuery ? searching : browsing;

  const handleSelect = useCallback(
    (id: number) => setMovieDetail(id),
    [setMovieDetail]
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 lg:px-12">
      {/* Search header */}
      <motion.div
        className="max-w-2xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full clay-card-sm px-12 py-4 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-shadow"
          />
        </div>
      </motion.div>

      {/* Genre filters */}
      {!debouncedQuery && (
        <motion.div
          className="flex gap-2 flex-wrap justify-center mb-8 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GenrePill
            name="All"
            active={!selectedGenre}
            onClick={() => setSelectedGenre(undefined)}
          />
          {GENRES.map((genre) => (
            <GenrePill
              key={genre.id}
              name={genre.name}
              active={selectedGenre === String(genre.id)}
              onClick={() =>
                setSelectedGenre(
                  selectedGenre === String(genre.id)
                    ? undefined
                    : String(genre.id)
                )
              }
            />
          ))}
        </motion.div>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          key={debouncedQuery + (selectedGenre || "")}
        >
          {movies.map((movie, i) => (
            <motion.div key={movie.id} variants={cardVariants}>
              <MovieCard
                movie={movie}
                onSelect={handleSelect}
                index={i}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : debouncedQuery ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          No results for &ldquo;{debouncedQuery}&rdquo;
        </div>
      ) : null}
    </div>
  );
}
