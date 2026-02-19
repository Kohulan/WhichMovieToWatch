// RatingShowcaseCell — Displays the rating of the currently featured movie.
//
// Subscribes to featuredStore index so the rating stays in sync with
// DiscoverHeroCell and TrendingPreviewCell.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { useTopStreaming } from '@/hooks/useTopStreaming';
import { useFeaturedStore } from '@/stores/featuredStore';

const ANIMATION_DURATION_MS = 600;
const ANIMATION_STEPS = 20;
const STEP_INTERVAL_MS = ANIMATION_DURATION_MS / ANIMATION_STEPS;

export function RatingShowcaseCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTopStreaming();
  const featuredIndex = useFeaturedStore((s) => s.index);

  const movie = movies[featuredIndex] ?? movies[0];
  const targetRating = movie?.vote_average ?? 0;
  const [displayRating, setDisplayRating] = useState(0);
  const prevTarget = useRef(0);

  // Animated count from current value to new target when featured movie changes
  useEffect(() => {
    if (targetRating === 0) return;
    const from = prevTarget.current;
    prevTarget.current = targetRating;

    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / ANIMATION_STEPS;
      const eased = 1 - (1 - progress) ** 3;
      setDisplayRating(from + (targetRating - from) * eased);
      if (step >= ANIMATION_STEPS) clearInterval(timer);
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [targetRating]);

  return (
    <div
      className="w-full h-full flex flex-col justify-center p-4 gap-1"
      onClick={() => navigate('/trending')}
    >
      {/* Label */}
      <span className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide">
        Audience Score
      </span>

      {/* Large rating number + star */}
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-accent fill-accent drop-shadow-[0_0_6px_var(--accent)]" aria-hidden="true" />
        {isLoading ? (
          <div className="clay-shimmer h-9 w-16 rounded-md" />
        ) : (
          <span className="font-heading text-4xl font-bold text-clay-text leading-none tabular-nums">
            {displayRating.toFixed(1)}
          </span>
        )}
        <span className="text-sm text-clay-text-muted font-medium">/10</span>
      </div>

      {/* Movie title — animates when it changes */}
      <AnimatePresence mode="wait">
        {!isLoading && movie && (
          <motion.p
            key={movie.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-clay-text-muted truncate"
          >
            {movie.title}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
