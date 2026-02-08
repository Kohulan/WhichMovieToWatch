"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Search, Film, Star, TrendingUp, Clock, X } from "lucide-react";
import { useUI } from "@/stores/ui";
import { useSearch, useTrending } from "@/hooks/useMovie";
import { tmdbImage } from "@/lib/constants";
import { formatYear } from "@/lib/utils";
import type { Movie } from "@/types/movie";

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, setMovieDetail } = useUI();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery);
  const { data: trending } = useTrending();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [commandPaletteOpen]);

  const handleSelect = useCallback(
    (movie: Movie) => {
      setMovieDetail(movie.id);
      closeCommandPalette();
    },
    [setMovieDetail, closeCommandPalette]
  );

  const displayMovies = debouncedQuery
    ? searchResults?.results?.slice(0, 8) || []
    : trending?.results?.slice(0, 6) || [];

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />

          {/* Palette */}
          <motion.div
            className="relative z-10 w-full max-w-xl mx-4 clay-card overflow-hidden"
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
              <Search size={18} className="text-[var(--text-muted)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, actors, directors..."
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="hidden md:flex items-center px-2 py-0.5 rounded bg-[var(--bg-base)] text-[10px] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {!debouncedQuery && (
                <div className="px-4 py-2">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Trending This Week
                  </p>
                </div>
              )}

              {isSearching && debouncedQuery && (
                <div className="px-5 py-8 text-center text-[var(--text-muted)]">
                  <div className="animate-spin w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full mx-auto mb-2" />
                  Searching...
                </div>
              )}

              {displayMovies.map((movie, i) => (
                <motion.button
                  key={movie.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left cursor-pointer"
                  onClick={() => handleSelect(movie)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0">
                    {movie.poster_path ? (
                      <Image
                        src={tmdbImage(movie.poster_path, "w92")}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={16} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {movie.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatYear(movie.release_date)}
                      {movie.vote_average > 0 && (
                        <span className="ml-2 inline-flex items-center gap-0.5">
                          <Star size={10} className="text-[var(--accent-warm)]" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.button>
              ))}

              {debouncedQuery && !isSearching && displayMovies.length === 0 && (
                <div className="px-5 py-8 text-center text-[var(--text-muted)]">
                  <Film size={24} className="mx-auto mb-2 opacity-50" />
                  No movies found for &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
