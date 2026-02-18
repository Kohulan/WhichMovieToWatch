// Discovery hook with filter relaxation and taste scoring

import { useCallback } from 'react';
import { discoverMovie } from '@/services/tmdb/discover';
import { fetchMovieDetails } from '@/services/tmdb/details';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRegionStore } from '@/stores/regionStore';
import { scoreTasteMatch } from '@/lib/taste-engine';

export function useRandomMovie() {
  const currentMovie = useDiscoveryStore((s) => s.currentMovie);
  const isLoading = useDiscoveryStore((s) => s.isLoading);
  const error = useDiscoveryStore((s) => s.error);
  const relaxationStep = useDiscoveryStore((s) => s.relaxationStep);

  const discover = useCallback(async () => {
    const discoveryState = useDiscoveryStore.getState();
    const historyState = useMovieHistoryStore.getState();
    const regionState = useRegionStore.getState();
    const prefsState = usePreferencesStore.getState();

    const excludeIds = historyState.getExcludeSet();
    const filters = discoveryState.filters;
    const region = regionState.effectiveRegion();

    // Set loading state
    discoveryState.setLoading(true);
    discoveryState.setError(null);

    try {
      const result = await discoverMovie(
        {
          ...filters,
          region,
        },
        excludeIds,
      );

      if (result.movie) {
        // Fetch full details for the discovered movie
        const details = await fetchMovieDetails(result.movie.id);

        // Apply taste scoring (informational — log for now, sorting in Phase 3)
        const tasteScore = scoreTasteMatch(prefsState.tasteProfile, details);
        if (tasteScore !== 0) {
          console.debug(
            `[taste] Movie "${details.title}" scored ${tasteScore.toFixed(2)}`,
          );
        }

        // Track as shown to prevent repeats
        historyState.trackShown(result.movie.id);

        // Update discovery store with full details
        discoveryState.setCurrentMovie(details as Record<string, unknown>);
        discoveryState.setRelaxationStep(result.relaxationStep);
      } else {
        discoveryState.setError(
          'No movies found matching your filters. Try different criteria.',
        );
        discoveryState.setRelaxationStep(result.relaxationStep);
      }
    } catch (err) {
      discoveryState.setError(
        err instanceof Error ? err.message : 'Failed to discover movie',
      );
    } finally {
      discoveryState.setLoading(false);
    }
  }, []);

  return { discover, isLoading, error, currentMovie, relaxationStep };
}
