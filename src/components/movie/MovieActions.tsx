// Love/Watched/Not Interested/Next action buttons for the discovery flow

import { useState } from 'react';
import { SkipForward } from 'lucide-react';
import { MetalButton } from '@/components/ui';
import { HeartPulseIcon, CheckDrawIcon, XSlideIcon } from '@/components/animation/AnimatedActionIcon';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { showToast } from '@/components/shared/Toast';

interface MovieActionsProps {
  movieId: number;
  movieGenres: Array<{ id: number; name: string }>;
  releaseYear: string;
  directorId?: number;
  onNext: () => void;
  onLove: () => void;
}

/**
 * MovieActions — Love/Watched/Not Interested/Next buttons.
 *
 * Integrates with movieHistoryStore and preferencesStore to record user actions.
 * Shows toast notifications for feedback.
 * Each action button plays a signature SVG path-draw animation before firing.
 * Responsive: 2x2 grid on mobile, single row on desktop. (DISP-06)
 * ANIM-03: Micro-interaction animations per action (heart pulse, checkmark draw, X slide).
 */
export function MovieActions({
  movieId,
  movieGenres,
  releaseYear,
  directorId,
  onNext,
  onLove,
}: MovieActionsProps) {
  const markWatched = useMovieHistoryStore((s) => s.markWatched);
  const markLoved = useMovieHistoryStore((s) => s.markLoved);
  const markNotInterested = useMovieHistoryStore((s) => s.markNotInterested);
  const recordLove = usePreferencesStore((s) => s.recordLove);
  const recordNotInterested = usePreferencesStore((s) => s.recordNotInterested);

  // Track which action button is animating — null when idle
  const [animatingAction, setAnimatingAction] = useState<'love' | 'watched' | 'skip' | null>(null);

  function handleLove() {
    const genreIds = movieGenres.map((g) => g.id);
    // Compute decade from release year (e.g. "2023" → "2020s")
    const decade = releaseYear
      ? `${releaseYear.slice(0, 3)}0s`
      : 'unknown';

    // Play heart pulse animation before firing the action
    setAnimatingAction('love');
    setTimeout(() => {
      setAnimatingAction(null);
      markLoved(movieId);
      recordLove(genreIds, decade, directorId);
      showToast('Added to loved movies', 'success');
      onLove();
    }, 600);
  }

  function handleWatched() {
    // Play checkmark draw animation before firing the action
    setAnimatingAction('watched');
    setTimeout(() => {
      setAnimatingAction(null);
      markWatched(movieId);
      showToast('Marked as watched', 'success');
      onNext();
    }, 500);
  }

  function handleNotInterested() {
    const genreIds = movieGenres.map((g) => g.id);
    const decade = releaseYear
      ? `${releaseYear.slice(0, 3)}0s`
      : 'unknown';

    // Play X slide animation before firing the action
    setAnimatingAction('skip');
    setTimeout(() => {
      setAnimatingAction(null);
      markNotInterested(movieId);
      recordNotInterested(genreIds, decade, directorId);
      showToast('Skipped');
      onNext();
    }, 400);
  }

  function handleNext() {
    onNext();
  }

  return (
    <div
      className="flex flex-wrap gap-2 mt-4"
      role="toolbar"
      aria-label="Movie actions"
    >
      <MetalButton
        variant="primary"
        size="sm"
        onClick={handleNext}
        aria-label="Show next movie"
      >
        <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
        Next
      </MetalButton>

      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleLove}
        aria-label="Love this movie"
      >
        <HeartPulseIcon animate={animatingAction === 'love'} className="w-3.5 h-3.5" />
        Love
      </MetalButton>

      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleWatched}
        aria-label="Mark as watched"
      >
        <CheckDrawIcon animate={animatingAction === 'watched'} className="w-3.5 h-3.5" />
        Watched
      </MetalButton>

      <MetalButton
        variant="ghost"
        size="sm"
        onClick={handleNotInterested}
        aria-label="Not interested in this movie"
      >
        <XSlideIcon animate={animatingAction === 'skip'} className="w-3.5 h-3.5" />
        Skip
      </MetalButton>
    </div>
  );
}
