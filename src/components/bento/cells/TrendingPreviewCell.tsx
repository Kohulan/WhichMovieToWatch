// TrendingPreviewCell — Rotating poster fan that shuffles through trending movies.
//
// Shows a sliding window of 3 posters from the full trending list.
// Subscribes to featuredStore index so it cycles in sync with
// DiscoverHeroCell and RatingShowcaseCell.

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { useFeaturedStore } from '@/stores/featuredStore';
import { tmdbPosterSrcSet, posterSizes } from '@/hooks/useResponsiveImage';

// Gradient fallbacks for cards without poster images
const POSTER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
] as const;

// Position configs for the 3-card fan: [left, center, right]
const POSITIONS = [
  { x: -28, rotate: -10, scale: 0.82, z: 0, opacity: 0.7 },  // left
  { x: 0,   rotate: 0,   scale: 1,    z: 3, opacity: 1 },    // center
  { x: 28,  rotate: 10,  scale: 0.82, z: 0, opacity: 0.7 },  // right
] as const;

// Maps each movie in the 3-item window to a visual slot: center, right, left
const SLOT_ASSIGNMENT = [1, 2, 0] as const;

export function TrendingPreviewCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTrending();
  const featuredIndex = useFeaturedStore((s) => s.index);

  // Sliding window: show 3 consecutive movies starting at featuredIndex
  const visibleMovies = useMemo(() => {
    if (movies.length === 0) return [];
    const len = movies.length;
    return [
      movies[featuredIndex % len],
      movies[(featuredIndex + 1) % len],
      movies[(featuredIndex + 2) % len],
    ];
  }, [movies, featuredIndex]);

  return (
    <div
      className="w-full h-full min-h-[180px] flex flex-col p-4 gap-3"
      onClick={() => navigate('/trending')}
    >
      {/* Label with live dot */}
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide">
          Now Playing
        </span>
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-accent ml-auto"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      </div>

      {/* Poster fan carousel */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-lg clay-shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {visibleMovies.map((movie, i) => {
                if (!movie) return null;
                const pos = POSITIONS[SLOT_ASSIGNMENT[i]];
                const posterUrl = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                  : null;

                return (
                  <motion.div
                    key={movie.id}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0.6, x: 0 }}
                    animate={{
                      x: pos.x,
                      rotate: pos.rotate,
                      scale: pos.scale,
                      zIndex: pos.z,
                      opacity: pos.opacity,
                    }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 22,
                      mass: 0.8,
                    }}
                    style={{ width: '55%', maxWidth: '90px' }}
                  >
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        srcSet={movie.poster_path ? tmdbPosterSrcSet(movie.poster_path) : undefined}
                        sizes={posterSizes}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="w-full aspect-[2/3] rounded-lg shadow-lg flex items-center justify-center"
                        style={{ background: POSTER_GRADIENTS[i] }}
                      >
                        <span className="text-white/80 text-[10px] font-bold text-center px-1 leading-tight">
                          {movie.title}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Current center movie title */}
      <AnimatePresence mode="wait">
        {visibleMovies[0] && (
          <motion.p
            key={visibleMovies[0].id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-medium text-clay-text-muted text-center truncate"
          >
            {visibleMovies[0].title}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
