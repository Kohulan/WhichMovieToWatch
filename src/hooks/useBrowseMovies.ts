// Browse movies hook — orchestrates fetching with AbortController cleanup

import { useCallback, useEffect, useRef } from "react";
import { browseMovies } from "@/services/tmdb/browse";
import { useBrowseStore } from "@/stores/browseStore";
import { useRegionStore } from "@/stores/regionStore";

export function useBrowseMovies() {
  const selectedProviderId = useBrowseStore((s) => s.selectedProviderId);
  const results = useBrowseStore((s) => s.results);
  const currentPage = useBrowseStore((s) => s.currentPage);
  const totalPages = useBrowseStore((s) => s.totalPages);
  const totalResults = useBrowseStore((s) => s.totalResults);
  const isLoading = useBrowseStore((s) => s.isLoading);
  const error = useBrowseStore((s) => s.error);
  const sortBy = useBrowseStore((s) => s.sortBy);
  const filters = useBrowseStore((s) => s.filters);

  const region = useRegionStore((s) => s.effectiveRegion)();

  const abortRef = useRef<AbortController | null>(null);

  const browse = useCallback(async () => {
    if (selectedProviderId === null) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const store = useBrowseStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      const response = await browseMovies(
        {
          providerId: selectedProviderId,
          region,
          page: 1,
          sortBy,
          filters,
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .setResults(
            response.results,
            response.total_results,
            Math.min(response.total_pages, 500),
            response.page,
          );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .setError(
            err instanceof Error ? err.message : "Failed to load movies",
          );
      }
    } finally {
      if (!controller.signal.aborted) {
        useBrowseStore.getState().setLoading(false);
      }
    }
  }, [selectedProviderId, region, sortBy, filters]);

  const loadMore = useCallback(async () => {
    const store = useBrowseStore.getState();
    if (store.currentPage >= store.totalPages || store.isLoading) return;
    if (store.selectedProviderId === null) return;

    const controller = new AbortController();
    abortRef.current = controller;

    store.setLoading(true);

    try {
      const response = await browseMovies(
        {
          providerId: store.selectedProviderId,
          region,
          page: store.currentPage + 1,
          sortBy: store.sortBy,
          filters: store.filters,
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .appendResults(response.results, response.page);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        useBrowseStore
          .getState()
          .setError(
            err instanceof Error ? err.message : "Failed to load more movies",
          );
      }
    } finally {
      if (!controller.signal.aborted) {
        useBrowseStore.getState().setLoading(false);
      }
    }
  }, [region]);

  // Auto-fetch when provider, sort, or filters change
  useEffect(() => {
    browse();
  }, [browse]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const hasMore = currentPage < totalPages;

  return {
    browse,
    loadMore,
    results,
    isLoading,
    error,
    hasMore,
    totalResults,
    selectedProviderId,
  };
}
