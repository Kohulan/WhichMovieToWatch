// DiscoverHeroCell — Large glassmorphism hero cell with movie backdrop and CTA.
//
// Designed as col-span-6, row-span-2 on desktop.
// Fetches a trending movie backdrop from useTrending() and renders it as
// a full-bleed background. Glassmorphism overlay preserves legibility.
// CTA button navigates to /discover.

import { useNavigate } from 'react-router';
import { Play } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { MetalButton } from '@/components/ui/MetalButton';

export function DiscoverHeroCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTrending();

  const firstMovie = movies[0];
  const backdropUrl = firstMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${firstMovie.backdrop_path}`
    : null;

  return (
    <div className="relative w-full h-full min-h-[200px] flex flex-col justify-end p-5">
      {/* Movie backdrop image — absolute fill */}
      {backdropUrl && !isLoading ? (
        <img
          src={backdropUrl}
          alt={firstMovie?.title ?? 'Movie backdrop'}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        /* Gradient placeholder while loading */
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-clay-base to-black/80" />
      )}

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Content — sits above the overlay */}
      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
            Discover Your Next Movie
          </h2>
          <p className="mt-1 text-sm text-white/75 drop-shadow-sm">
            Smart recommendations powered by your taste
          </p>
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
