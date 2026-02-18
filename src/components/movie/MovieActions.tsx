// Love/Watched/Not Interested/Next action buttons for the discovery flow

import { Heart, Eye, ThumbsDown, SkipForward } from 'lucide-react';
import { MetalButton } from '@/components/ui';
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
 * Responsive: 2x2 grid on mobile, single row on desktop. (DISP-06)
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

  function handleLove() {
    const genreIds = movieGenres.map((g) => g.id);
    // Compute decade from release year (e.g. "2023" → "2020s")
    const decade = releaseYear
      ? `${releaseYear.slice(0, 3)}0s`
      : 'unknown';

    markLoved(movieId);
    recordLove(genreIds, decade, directorId);
    showToast('Added to loved movies', 'success');
    onLove();
  }

  function handleWatched() {
    markWatched(movieId);
    showToast('Marked as watched', 'success');
    onNext();
  }

  function handleNotInterested() {
    const genreIds = movieGenres.map((g) => g.id);
    const decade = releaseYear
      ? `${releaseYear.slice(0, 3)}0s`
      : 'unknown';

    markNotInterested(movieId);
    recordNotInterested(genreIds, decade, directorId);
    showToast('Skipped');
    onNext();
  }

  function handleNext() {
    onNext();
  }

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3 mt-4"
      role="group"
      aria-label="Movie actions"
    >
      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleLove}
        aria-label="Love this movie"
      >
        <Heart className="w-4 h-4" aria-hidden="true" />
        Love it
      </MetalButton>

      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleWatched}
        aria-label="Mark as watched"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        Watched
      </MetalButton>

      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleNotInterested}
        aria-label="Not interested in this movie"
      >
        <ThumbsDown className="w-4 h-4" aria-hidden="true" />
        Not Interested
      </MetalButton>

      <MetalButton
        variant="secondary"
        size="sm"
        onClick={handleNext}
        aria-label="Show next movie"
      >
        <SkipForward className="w-4 h-4" aria-hidden="true" />
        Next
      </MetalButton>
    </div>
  );
}
