"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HeroSection } from "@/components/movie/HeroSection";
import { BentoGrid } from "@/components/movie/BentoGrid";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import { HeroSkeleton, BentoGridSkeleton } from "@/components/ui/Skeleton";
import { useDiscover, useTrending } from "@/hooks/useMovie";
import { useUI } from "@/stores/ui";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const setMovieDetail = useUI((s) => s.setMovieDetail);

  const { data: discover, isLoading: discoverLoading } = useDiscover({ page });
  const { data: trending, isLoading: trendingLoading } = useTrending();

  const movies = discover?.results || [];
  const trendingMovies = trending?.results || [];
  const heroMovie = movies[0];

  const handleShuffle = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const handleSelectMovie = useCallback(
    (id: number) => {
      setMovieDetail(id);
    },
    [setMovieDetail]
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <AnimatePresence mode="wait">
        {discoverLoading || !heroMovie ? (
          <motion.div key="hero-skeleton" exit={{ opacity: 0 }}>
            <HeroSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={heroMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection
              movie={heroMovie}
              onSelect={handleSelectMovie}
              onShuffle={handleShuffle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid — Discover */}
      {discoverLoading ? (
        <BentoGridSkeleton />
      ) : movies.length > 1 ? (
        <BentoGrid
          movies={movies.slice(1)}
          onSelectMovie={handleSelectMovie}
        />
      ) : null}

      {/* Trending Carousel */}
      {!trendingLoading && trendingMovies.length > 0 && (
        <MovieCarousel
          title="Trending This Week"
          movies={trendingMovies}
          onSelectMovie={handleSelectMovie}
        />
      )}

      {/* Second discover set as another carousel */}
      {movies.length > 10 && (
        <MovieCarousel
          title="More To Explore"
          movies={movies.slice(10)}
          onSelectMovie={handleSelectMovie}
        />
      )}
    </div>
  );
}
