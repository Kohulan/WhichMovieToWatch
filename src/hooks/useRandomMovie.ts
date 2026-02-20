// Discovery hook with filter relaxation and taste scoring

import { useCallback } from "react";
import { discoverMovie } from "@/services/tmdb/discover";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useRegionStore } from "@/stores/regionStore";
import { scoreTasteMatch } from "@/lib/taste-engine";
import { getGenreName } from "@/lib/genre-map";

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

    discoveryState.setLoading(true);
    discoveryState.setError(null);

    // Lock provider/genre filters when user has explicitly set them via onboarding/settings
    const hasUserFilters =
      prefsState.hasCompletedOnboarding &&
      (prefsState.preferredProvider !== null ||
        prefsState.preferredGenre !== null);

    try {
      const result = await discoverMovie(
        {
          ...filters,
          region,
        },
        excludeIds,
        0,
        { lockUserFilters: hasUserFilters },
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
        discoveryState.setCurrentMovie(details);
        discoveryState.setRelaxationStep(result.relaxationStep);
      } else {
        // Build a descriptive error so the user knows what to change
        const genreLabel = filters.genreId
          ? getGenreName(Number(filters.genreId))
          : null;
        const hasProvider = filters.providerId !== null;

        let msg: string;
        if (genreLabel && hasProvider) {
          msg = `No ${genreLabel} movies available on this streaming service in your region.`;
        } else if (genreLabel) {
          msg = `No ${genreLabel} movies available for streaming in your region.`;
        } else if (hasProvider) {
          msg = "No movies available on this streaming service in your region.";
        } else {
          msg = "No movies found matching your filters.";
        }

        discoveryState.setError(
          `${msg} Pick a different service or genre below.`,
        );
        discoveryState.setRelaxationStep(result.relaxationStep);
      }
    } catch (err) {
      discoveryState.setError(
        err instanceof Error ? err.message : "Failed to discover movie",
      );
    } finally {
      discoveryState.setLoading(false);
    }
  }, []);

  return { discover, isLoading, error, currentMovie, relaxationStep };
}
