"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "@/types/movie";
import { ANIMATION_CONFIG } from "@/lib/constants";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onSelectMovie?: (id: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.fast,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

export function MovieCarousel({
  title,
  movies,
  onSelectMovie,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!movies?.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <motion.div
        ref={scrollRef}
        className="snap-carousel px-4 md:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {movies.map((movie, i) => (
          <motion.div
            key={movie.id}
            variants={itemVariants}
            className="w-[180px] md:w-[220px] flex-shrink-0"
          >
            <MovieCard
              movie={movie}
              size="small"
              onSelect={onSelectMovie}
              showActions={false}
              index={i}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
