// Discovery hook with filter relaxation, taste scoring, and provider verification

import { useCallback } from "react";
import { discoverCandidates } from "@/services/tmdb/discover";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useRegionStore } from "@/stores/regionStore";
import { scoreTasteMatch } from "@/lib/taste-engine";
import { getGenreName } from "@/lib/genre-map";
import type { TMDBMovieDetails } from "@/types/movie";

/**
 * Safety-net: verify the user's services appear in streaming tiers
 * (flatrate/free/ads) for the given region. TMDB discover is ~100%
 * consistent with per-movie data when using flatrate monetization,
 * so this should almost always pass on the first candidate.
 */
function verifyProviderMatch(
  details: TMDBMovieDetails,
  userServiceIds: number[],
  region: string,
): boolean {
  if (userServiceIds.length === 0) return true;

  const regionData = details["watch/providers"]?.results?.[region];
  if (!regionData) return false;

  const userSet = new Set(userServiceIds);
  const streamingTiers = [regionData.flatrate, regionData.free, regionData.ads];

  for (const tier of streamingTiers) {
    if (tier?.some((p) => userSet.has(p.provider_id))) return true;
  }

  return false;
}

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

    const filters = discoveryState.filters;
    const region = regionState.effectiveRegion();

    // Capture prev movie so we can guarantee it's excluded
    const prevMovieId = discoveryState.currentMovie?.id ?? null;

    // Clear old movie so loading state is visible and errors aren't hidden
    // behind a stale movie. DiscoveryPage shows LoadingQuotes when isLoading.
    discoveryState.setCurrentMovie(null);
    discoveryState.setLoading(true);
    discoveryState.setError(null);

    // Build exclude set: history + current movie (belt-and-suspenders)
    const excludeIds = new Set(historyState.getExcludeSet());
    if (prevMovieId) excludeIds.add(prevMovieId);

    // Lock provider/genre filters when user has explicitly set them via onboarding/settings
    const hasUserFilters =
      prefsState.hasCompletedOnboarding &&
      (prefsState.myServices.length > 0 ||
        prefsState.preferredProvider !== null ||
        prefsState.preferredGenre !== null);

    // User's selected streaming service IDs for provider verification
    const userServiceIds =
      prefsState.myServices.length > 0
        ? prefsState.myServices
        : prefsState.preferredProvider
          ? [Number(prefsState.preferredProvider)]
          : [];

    try {
      const result = await discoverCandidates(
        { ...filters, region },
        excludeIds,
        { lockUserFilters: hasUserFilters },
      );

      if (result.candidates.length > 0) {
        // Verify candidates against user's streaming services.
        // With flatrate-only discover, this is ~100% consistent —
        // the loop is a safety net for rare TMDB data lag.
        let verifiedDetails: TMDBMovieDetails | null = null;
        let firstDetails: TMDBMovieDetails | null = null;

        for (const candidate of result.candidates) {
          const details = await fetchMovieDetails(candidate.id);
          if (!firstDetails) firstDetails = details;

          if (verifyProviderMatch(details, userServiceIds, region)) {
            verifiedDetails = details;
            break;
          }
        }

        // Use verified match, or fall back to first candidate (best effort)
        const chosen = verifiedDetails ?? firstDetails!;

        // Apply taste scoring (informational — log for now, sorting in Phase 3)
        const tasteScore = scoreTasteMatch(prefsState.tasteProfile, chosen);
        if (tasteScore !== 0) {
          console.debug(
            `[taste] Movie "${chosen.title}" scored ${tasteScore.toFixed(2)}`,
          );
        }

        // Track as shown to prevent repeats
        historyState.trackShown(chosen.id);

        // Update discovery store with full details
        discoveryState.setCurrentMovie(chosen);
        discoveryState.setRelaxationStep(result.relaxationStep);
      } else {
        // Build a descriptive error so the user knows what to change
        const genreLabel = filters.genreId
          ? getGenreName(Number(filters.genreId))
          : null;
        const hasProviders = filters.providerIds.length > 0;

        let msg: string;
        if (genreLabel && hasProviders) {
          msg = `No ${genreLabel} movies available on these streaming services in your region.`;
        } else if (genreLabel) {
          msg = `No ${genreLabel} movies available for streaming in your region.`;
        } else if (hasProviders) {
          msg =
            "No movies available on these streaming services in your region.";
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
