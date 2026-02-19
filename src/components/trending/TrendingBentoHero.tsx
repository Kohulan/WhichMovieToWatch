// TrendingBentoHero — Compact bento hero for the Trending page (BENT-03)
//
// Compact 2-cell bento layout using BentoGrid(columns=6) placed above the
// existing TrendingPageComponent. Additive — does not modify existing trending content.
//
// Cells:
//   Cell 1 (glass, col-span 3): First trending movie backdrop + title + "Now Playing" badge + rating
//   Cell 2 (clay, col-span 3): Stats — movie count, trending icon, auto-refresh note
//
// Wrapped in StaggerContainer for scroll-entry stagger animation.

import { TrendingUp } from 'lucide-react';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { BentoCell } from '@/components/bento/BentoCell';
import {
  StaggerContainer,
  StaggerItem,
} from '@/components/animation/StaggerContainer';
import { useTrending } from '@/hooks/useTrending';
import { getBackdropUrl } from '@/services/tmdb/client';

export function TrendingBentoHero() {
  const { movies, isLoading } = useTrending();

  const featuredMovie = movies[0] ?? null;
  const movieCount = movies.length;

  const backdropUrl =
    featuredMovie?.backdrop_path
      ? getBackdropUrl(featuredMovie.backdrop_path, 'w780')
      : null;

  const ratingDisplay = featuredMovie
    ? (featuredMovie.vote_average * 10).toFixed(0) + '%'
    : null;

  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — Highlight: featured movie backdrop + title + rating */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px] overflow-hidden"
          >
            {/* Background backdrop image */}
            {backdropUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backdropUrl})` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </div>
            )}

            {/* Content overlay */}
            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Now Playing badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
                  Now Playing
                </span>
              </div>

              {/* Movie title + rating */}
              {isLoading && !featuredMovie ? (
                <div className="space-y-2">
                  <div className="h-5 w-2/3 rounded bg-white/20 animate-pulse" />
                  <div className="h-4 w-1/3 rounded bg-white/10 animate-pulse" />
                </div>
              ) : featuredMovie ? (
                <div>
                  <p className="text-white font-heading font-semibold text-lg leading-tight line-clamp-2 drop-shadow-md">
                    {featuredMovie.title}
                  </p>
                  {ratingDisplay && (
                    <p className="text-white/70 text-sm mt-1 font-medium">
                      {ratingDisplay} audience score
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Stats: movie count + trending icon + auto-refresh note */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 flex flex-col justify-between h-full gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-clay-text font-heading font-semibold text-base">
                  Now Playing
                </h2>
                <TrendingUp className="w-5 h-5 text-clay-text-muted" aria-hidden="true" />
              </div>

              {/* Movie count */}
              <div>
                {isLoading && movieCount === 0 ? (
                  <div className="h-8 w-24 rounded bg-white/20 animate-pulse mb-1" />
                ) : (
                  <p className="text-3xl font-heading font-bold text-clay-text leading-none">
                    {movieCount > 0 ? `${movieCount}` : '—'}
                  </p>
                )}
                <p className="text-clay-text-muted text-sm mt-1">
                  {movieCount === 1 ? 'movie in theaters' : 'movies in theaters'}
                </p>
              </div>

              {/* Auto-refresh note */}
              <p className="text-clay-text-muted text-xs opacity-60">
                Updated every 30 min
              </p>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
