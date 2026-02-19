// RatingShowcaseCell — Displays a live TMDB rating number in large font.
//
// Designed as col-span-3, row-span-1 on desktop.
// Uses first trending movie's vote_average via useTrending() hook.
// Clay material cell. Click navigates to /trending.

import { useNavigate } from 'react-router';
import { Star } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';

export function RatingShowcaseCell() {
  const navigate = useNavigate();
  const { movies, isLoading } = useTrending();

  // Find first movie with a meaningful vote average
  const featuredMovie = movies.find((m) => m.vote_average > 0) ?? movies[0];
  const rating = featuredMovie?.vote_average?.toFixed(1) ?? '--';

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
        <Star className="w-5 h-5 text-accent fill-accent" aria-hidden="true" />
        {isLoading ? (
          <div className="clay-shimmer h-9 w-16 rounded-md" />
        ) : (
          <span className="font-heading text-4xl font-bold text-clay-text leading-none">
            {rating}
          </span>
        )}
      </div>

      {/* Movie title */}
      {!isLoading && featuredMovie && (
        <p className="text-xs text-clay-text-muted truncate">
          {featuredMovie.title}
        </p>
      )}
    </div>
  );
}
