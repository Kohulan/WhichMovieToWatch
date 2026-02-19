// DiscoverHeroCell — Transparent hero cell that shuffles through trending movies.
//
// Subscribes to featuredStore index so the backdrop cycles in sync with
// RatingShowcaseCell and TrendingPreviewCell.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { useFeaturedStore } from '@/stores/featuredStore';
import { MetalButton } from '@/components/ui/MetalButton';
import { tmdbBackdropSrcSet, backdropSizes } from '@/hooks/useResponsiveImage';

export function DiscoverHeroCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTrending();
  const featuredIndex = useFeaturedStore((s) => s.index);

  const movie = movies[featuredIndex] ?? movies[0];
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  // Track which images have been loaded to avoid re-animating
  const loadedUrls = useRef(new Set<string>());
  const [ready, setReady] = useState(false);

  // Reset ready state when backdrop changes
  useEffect(() => {
    if (backdropUrl && loadedUrls.current.has(backdropUrl)) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [backdropUrl]);

  function handleLoad() {
    if (backdropUrl) loadedUrls.current.add(backdropUrl);
    setReady(true);
  }

  return (
    <div className="relative w-full h-full min-h-[220px] flex flex-col justify-end p-5 overflow-hidden">
      {/* Crossfading backdrops */}
      <AnimatePresence mode="popLayout">
        {backdropUrl && !isLoading && (
          <motion.img
            key={backdropUrl}
            src={backdropUrl}
            srcSet={movie?.backdrop_path ? tmdbBackdropSrcSet(movie.backdrop_path) : undefined}
            sizes={backdropSizes}
            alt={movie?.title ?? 'Movie backdrop'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            onLoad={handleLoad}
          />
        )}
      </AnimatePresence>

      {/* Gradient placeholder when no image */}
      {(!backdropUrl || isLoading) && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent/10 to-black/60 animate-pulse" />
      )}

      {/* Bottom-heavy gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, transparent 50%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPositionX: ['100%', '-100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-accent drop-shadow-[0_0_8px_var(--accent)]" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              For You
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Discover Your Next Movie
          </h2>

          {/* Current movie title — crossfades with backdrop */}
          <AnimatePresence mode="wait">
            {movie && (
              <motion.p
                key={movie.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mt-1 text-sm text-white/80 drop-shadow-sm"
              >
                {movie.title}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <MetalButton
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/discover');
          }}
          className="self-start"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          Start Discovering
        </MetalButton>
      </div>
    </div>
  );
}
