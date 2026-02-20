// Search with pagination hook — debouncing is a UI concern (Phase 3)

import { useCallback } from "react";
import { searchMovies } from "@/services/tmdb/search";
import { useSearchStore } from "@/stores/searchStore";

export function useSearchMovies() {
  const query = useSearchStore((s) => s.query);
  const results = useSearchStore((s) => s.results);
  const totalResults = useSearchStore((s) => s.totalResults);
  const currentPage = useSearchStore((s) => s.currentPage);
  const totalPages = useSearchStore((s) => s.totalPages);
  const isLoading = useSearchStore((s) => s.isLoading);
  const error = useSearchStore((s) => s.error);

  const search = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      useSearchStore.getState().reset();
      return;
    }

    const store = useSearchStore.getState();
    store.setQuery(trimmed);
    store.setLoading(true);
    store.setError(null);

    try {
      const response = await searchMovies(trimmed, 1);
      useSearchStore
        .getState()
        .setResults(
          response.results,
          response.total_results,
          response.total_pages,
          response.page,
        );
    } catch (err) {
      useSearchStore
        .getState()
        .setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      useSearchStore.getState().setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const store = useSearchStore.getState();

    if (store.currentPage >= store.totalPages) return;

    store.setLoading(true);

    try {
      const response = await searchMovies(store.query, store.currentPage + 1);
      useSearchStore.getState().appendResults(response.results, response.page);
    } catch (err) {
      useSearchStore
        .getState()
        .setError(
          err instanceof Error ? err.message : "Failed to load more results",
        );
    } finally {
      useSearchStore.getState().setLoading(false);
    }
  }, []);

  const hasMore = currentPage < totalPages;

  return {
    search,
    loadMore,
    query,
    results,
    isLoading,
    error,
    totalResults,
    hasMore,
  };
}
