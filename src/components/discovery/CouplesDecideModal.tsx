// Offline / 2-Player "Couples Quick-Decide" mode for two people to agree on a movie without accounts

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, Sparkles, Users, RefreshCw, ArrowRight, Film, Frown } from "lucide-react";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { fetchPopular } from "@/services/tmdb/trending";
import { getPosterUrl } from "@/services/tmdb/client";
import { useHaptics } from "@/hooks/useHaptics";
import { MetalButton } from "@/components/ui";
import { formatRuntime } from "@/lib/format-runtime";
import { showToast } from "@/components/shared/Toast";
import type { TMDBMovie, TMDBMovieDetails } from "@/types/movie";

interface CouplesDecideModalProps {
  open: boolean;
  onClose: () => void;
  candidateMovies: (TMDBMovie | TMDBMovieDetails)[];
  onSelectMovie: (movie: TMDBMovieDetails) => void;
}

export function CouplesDecideModal({
  open,
  onClose,
  candidateMovies,
  onSelectMovie,
}: CouplesDecideModalProps) {
  const { trigger: triggerHaptics } = useHaptics();

  const [deck, setDeck] = useState<(TMDBMovie | TMDBMovieDetails)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [personAVotes, setPersonAVotes] = useState<Record<number, boolean>>({});
  const [personBVotes, setPersonBVotes] = useState<Record<number, boolean>>({});
  const [matchedMovie, setMatchedMovie] = useState<TMDBMovie | TMDBMovieDetails | null>(null);
  const [hasNoMatch, setHasNoMatch] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<"Person 1" | "Person 2">("Person 1");
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);

  // Initialize or load fresh deck
  const loadFreshDeck = useCallback(async (initialCandidates: (TMDBMovie | TMDBMovieDetails)[]) => {
    setIsLoadingDeck(true);
    setHasNoMatch(false);
    setMatchedMovie(null);
    setPersonAVotes({});
    setPersonBVotes({});
    setCurrentTurn("Person 1");
    setCurrentIndex(0);

    try {
      if (initialCandidates.length >= 10) {
        setDeck(initialCandidates.slice(0, 10));
      } else {
        // Fetch popular movies to fill up a full 10-card deck
        const res = await fetchPopular(Math.floor(Math.random() * 3) + 1);
        const combined = [...initialCandidates];
        for (const m of res.results || []) {
          if (!combined.some((c) => c.id === m.id)) {
            combined.push(m);
          }
          if (combined.length >= 10) break;
        }
        setDeck(combined);
      }
    } catch {
      setDeck(initialCandidates.slice(0, 10));
    } finally {
      setIsLoadingDeck(false);
    }
  }, []);

  // Reset and load deck whenever modal opens
  useEffect(() => {
    if (open) {
      loadFreshDeck(candidateMovies);
    }
  }, [open, candidateMovies, loadFreshDeck]);

  const activeMovie = deck[currentIndex];

  function handleVote(liked: boolean) {
    if (!activeMovie) return;

    if (liked) {
      triggerHaptics("medium");
    } else {
      triggerHaptics("light");
    }

    if (currentTurn === "Person 1") {
      const newVotes = { ...personAVotes, [activeMovie.id]: liked };
      setPersonAVotes(newVotes);

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Person 1 finished! Pass phone to Person 2
        triggerHaptics("success");
        setCurrentTurn("Person 2");
        setCurrentIndex(0);
        showToast("Person 1 done! Hand phone to Person 2", "success");
      }
    } else {
      // Person 2 voting
      const newVotes = { ...personBVotes, [activeMovie.id]: liked };
      setPersonBVotes(newVotes);

      // Check for immediate match: Person 2 liked it AND Person 1 also liked it
      if (liked && personAVotes[activeMovie.id]) {
        triggerHaptics("success");
        setMatchedMovie(activeMovie);
        setHasNoMatch(false);
        return;
      }

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Person 2 finished all cards — evaluate mutual matches
        const matches = deck.filter((m) => personAVotes[m.id] && newVotes[m.id]);
        if (matches.length > 0) {
          triggerHaptics("success");
          setMatchedMovie(matches[0]);
          setHasNoMatch(false);
        } else {
          // Zero mutual matches — display No Match screen
          triggerHaptics("warning");
          setMatchedMovie(null);
          setHasNoMatch(true);
        }
      }
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-sm bg-clay-surface/95 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-sm text-clay-text">
                  Couples Quick-Decide
                </h2>
                {!matchedMovie && !hasNoMatch && (
                  <p className="text-2xs text-accent font-medium">
                    {currentTurn} Voting • Card {currentIndex + 1} of {deck.length}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-clay-text-muted hover:text-clay-text flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading State */}
          {isLoadingDeck ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
              <p className="text-xs text-clay-text-muted">Dealing 10 fresh movies...</p>
            </div>
          ) : matchedMovie ? (
            /* Matched Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-clay-text">
                  It's a Match! 🎉
                </h3>
                <p className="text-xs text-clay-text-muted mt-0.5">
                  Both of you agree on tonight's film.
                </p>
              </div>

              <div className="bg-clay-base/70 p-3 rounded-2xl border border-white/10 flex gap-3 text-left">
                {matchedMovie.poster_path ? (
                  <img
                    src={getPosterUrl(matchedMovie.poster_path, "w185") || ""}
                    alt={matchedMovie.title}
                    className="w-16 h-24 object-cover rounded-xl shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-24 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6 text-clay-text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-heading font-semibold text-sm text-clay-text truncate">
                    {matchedMovie.title}
                  </h4>
                  <p className="text-xs text-clay-text-muted mt-0.5">
                    {(matchedMovie.release_date || "").slice(0, 4)}
                    {matchedMovie.runtime ? ` • ${formatRuntime(matchedMovie.runtime)}` : ""}
                  </p>
                  <p className="text-2xs text-clay-text-muted/80 line-clamp-2 mt-1">
                    {matchedMovie.overview}
                  </p>
                </div>
              </div>

              <MetalButton
                variant="primary"
                size="md"
                onClick={async () => {
                  if ("imdb_id" in matchedMovie) {
                    onSelectMovie(matchedMovie as TMDBMovieDetails);
                  } else {
                    const details = await fetchMovieDetails(matchedMovie.id);
                    onSelectMovie(details);
                  }
                  onClose();
                }}
                className="w-full"
              >
                Watch Movie Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </MetalButton>
            </motion.div>
          ) : hasNoMatch ? (
            /* No Mutual Match Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Frown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-clay-text">
                  No Mutual Match 🍿
                </h3>
                <p className="text-xs text-clay-text-muted mt-1 max-w-xs mx-auto">
                  Neither of you agreed on any of the 10 movies. Let's deal a fresh batch and try again!
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <MetalButton
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </MetalButton>
                <MetalButton
                  variant="primary"
                  size="sm"
                  onClick={() => loadFreshDeck(candidateMovies)}
                  className="flex-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Deal 10 More
                </MetalButton>
              </div>
            </motion.div>
          ) : activeMovie ? (
            /* Swiping Card UI */
            <div className="space-y-4 py-1">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-clay-base">
                {activeMovie.poster_path ? (
                  <img
                    src={getPosterUrl(activeMovie.poster_path, "w500") || ""}
                    alt={activeMovie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Film className="w-12 h-12 text-clay-text-muted" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
                  <h3 className="font-heading font-bold text-base line-clamp-1">
                    {activeMovie.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    {(activeMovie.release_date || "").slice(0, 4)}
                    {activeMovie.vote_average > 0 ? ` • ★ ${activeMovie.vote_average.toFixed(1)}` : ""}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleVote(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-clay-text font-medium text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-red-400" />
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => handleVote(true)}
                  className="flex-1 py-3 rounded-2xl bg-accent text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  Like
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
