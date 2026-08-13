// Watchlist Roulette decision spinner for picking from saved/loved movies

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dices, X, Sparkles, Heart, Film, ArrowRight } from "lucide-react";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { getPosterUrl } from "@/services/tmdb/client";
import { useHaptics } from "@/hooks/useHaptics";
import { MetalButton } from "@/components/ui";
import { formatRuntime } from "@/lib/format-runtime";
import type { TMDBMovieDetails } from "@/types/movie";

interface WatchlistRouletteModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMovie: (movie: TMDBMovieDetails) => void;
}

export function WatchlistRouletteModal({
  open,
  onClose,
  onSelectMovie,
}: WatchlistRouletteModalProps) {
  const lovedMovies = useMovieHistoryStore((s) => s.lovedMovies);
  const { trigger: triggerHaptics } = useHaptics();

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovieDetails | null>(null);
  const [stepName, setStepName] = useState<string>("");

  // Reset state on open
  useEffect(() => {
    if (open) {
      setSelectedMovie(null);
      setIsSpinning(false);
      setStepName("");
    }
  }, [open]);

  async function handleSpin() {
    if (lovedMovies.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedMovie(null);
    triggerHaptics("medium");

    // Pick random loved movie ID
    const randomId = lovedMovies[Math.floor(Math.random() * lovedMovies.length)];

    // Play spinning steps
    const steps = ["Shuffling favorites...", "Filtering by mood...", "Finding the winner...", "Selected!"];
    for (let i = 0; i < steps.length; i++) {
      setStepName(steps[i]);
      triggerHaptics("light");
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      const details = await fetchMovieDetails(randomId);
      triggerHaptics("success");
      setSelectedMovie(details);
    } catch {
      triggerHaptics("warning");
    } finally {
      setIsSpinning(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-md bg-clay-surface/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-base text-clay-text">
                  Watchlist Roulette
                </h2>
                <p className="text-2xs text-clay-text-muted">
                  {lovedMovies.length} saved favorites ready to roll
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-clay-text-muted hover:text-clay-text flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {lovedMovies.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-10 h-10 text-clay-text-muted/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-clay-text mb-1">
                No saved movies yet
              </p>
              <p className="text-xs text-clay-text-muted mb-5 max-w-xs mx-auto">
                Tap "Love" on movies you want to watch later, then spin the roulette to break the tie!
              </p>
              <MetalButton variant="secondary" size="sm" onClick={onClose}>
                Browse & Save Movies
              </MetalButton>
            </div>
          ) : (
            <div className="space-y-4">
              {!selectedMovie ? (
                <div className="text-center py-6">
                  {isSpinning ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto animate-spin">
                        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-accent animate-pulse">
                        {stepName}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-clay-base border border-white/10 flex items-center justify-center mx-auto text-clay-text-muted">
                        <Dices className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-clay-text">
                          Can't decide what to pick from your list?
                        </p>
                        <p className="text-xs text-clay-text-muted mt-1">
                          Let fate choose one winner from your {lovedMovies.length} loved movies.
                        </p>
                      </div>
                      <MetalButton
                        variant="primary"
                        size="md"
                        onClick={handleSpin}
                        className="w-full"
                      >
                        <Dices className="w-4 h-4 mr-1.5" />
                        Spin Roulette
                      </MetalButton>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3 bg-clay-base/60 p-3 rounded-2xl border border-white/10">
                    {selectedMovie.poster_path ? (
                      <img
                        src={getPosterUrl(selectedMovie.poster_path, "w185") || ""}
                        alt={selectedMovie.title}
                        className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-24 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Film className="w-6 h-6 text-clay-text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider text-accent font-semibold mb-0.5">
                        <Sparkles className="w-3 h-3" /> Winner Selected
                      </div>
                      <h3 className="font-heading font-semibold text-sm text-clay-text truncate">
                        {selectedMovie.title}
                      </h3>
                      <p className="text-xs text-clay-text-muted mt-0.5">
                        {(selectedMovie.release_date || "").slice(0, 4)}
                        {selectedMovie.runtime ? ` • ${formatRuntime(selectedMovie.runtime)}` : ""}
                      </p>
                      {selectedMovie.vote_average > 0 && (
                        <span className="text-2xs text-amber-400 font-semibold mt-1">
                          ★ {selectedMovie.vote_average.toFixed(1)} TMDB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <MetalButton
                      variant="secondary"
                      size="sm"
                      onClick={handleSpin}
                      className="flex-1"
                    >
                      Spin Again
                    </MetalButton>
                    <MetalButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onSelectMovie(selectedMovie);
                        onClose();
                      }}
                      className="flex-1"
                    >
                      Watch This <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </MetalButton>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
