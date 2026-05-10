import { create } from "zustand";
import type { TMDBMovie } from "@/types/movie";
import type { BrowseFilters } from "@/services/tmdb/browse";
import { DEFAULT_FILTERS } from "@/services/tmdb/browse";

interface BrowseState {
  selectedProviderId: number | null;
  /**
   * True once the user has explicitly cleared the chip (or this session has
   * already auto-selected once). BrowsePage uses this to suppress the
   * one-time auto-select from myServices on subsequent ✕-clicks within the
   * same session, so the launcher stays open until the user picks again.
   */
  userDidClear: boolean;
  results: TMDBMovie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  filters: BrowseFilters;

  setProvider: (id: number | null) => void;
  setSortBy: (sortBy: string) => void;
  setFilters: (filters: Partial<BrowseFilters>) => void;
  resetFilters: () => void;
  setResults: (
    results: TMDBMovie[],
    totalResults: number,
    totalPages: number,
    currentPage: number,
  ) => void;
  appendResults: (results: TMDBMovie[], currentPage: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBrowseStore = create<BrowseState>()((set) => ({
  selectedProviderId: null,
  userDidClear: false,
  results: [],
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  isLoading: false,
  error: null,
  sortBy: "popularity.desc",
  filters: { ...DEFAULT_FILTERS },

  setProvider: (id) =>
    set({
      selectedProviderId: id,
      userDidClear: id === null,
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setSortBy: (sortBy) =>
    set({
      sortBy,
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    })),

  resetFilters: () =>
    set({
      filters: { ...DEFAULT_FILTERS },
      results: [],
      currentPage: 1,
      totalPages: 0,
      totalResults: 0,
      error: null,
    }),

  setResults: (results, totalResults, totalPages, currentPage) =>
    set({ results, totalResults, totalPages, currentPage }),

  appendResults: (newResults, currentPage) =>
    set((state) => {
      const existingIds = new Set(state.results.map((m) => m.id));
      const unique = newResults.filter((m) => !existingIds.has(m.id));
      return { results: [...state.results, ...unique], currentPage };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
