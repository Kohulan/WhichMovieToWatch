// TrendingPreviewCell — Shows live trending movie poster thumbnails.
//
// Designed as col-span-3, row-span-2 on desktop.
// Shows 3 movie posters in a stacked fan layout from useTrending() hook.
// Click navigates to /trending.

import { useNavigate } from 'react-router';
import { TrendingUp } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';

export function TrendingPreviewCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTrending();

  const topThree = movies.slice(0, 3);

  return (
    <div
      className="w-full h-full min-h-[180px] flex flex-col p-4 gap-3"
      onClick={() => navigate('/trending')}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        <span className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide">
          Now Playing
        </span>
      </div>

      {/* Poster thumbnails */}
      <div className="flex-1 relative">
        {isLoading ? (
          /* Loading skeleton */
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
          /* Poster fan layout — slight rotation on side cards */
          <div className="relative h-full flex items-center justify-center">
            {topThree.map((movie, i) => {
              const posterUrl = movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : null;

              // Fan positioning: center card on top, side cards behind
              const rotations = [-8, 0, 8];
              const offsets = [-28, 0, 28];
              const zIndexes = [0, 2, 0];
              const scales = [0.88, 1, 0.88];

              return (
                <div
                  key={movie.id}
                  className="absolute"
                  style={{
                    transform: `translateX(${offsets[i]}px) rotate(${rotations[i]}deg) scale(${scales[i]})`,
                    zIndex: zIndexes[i],
                    width: '55%',
                    maxWidth: '90px',
                  }}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-lg bg-clay-elevated" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs font-medium text-clay-text-muted text-center">
        Tap to see all trending
      </p>
    </div>
  );
}
