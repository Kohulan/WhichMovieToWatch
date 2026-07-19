import { create } from "zustand";
import type { TMDBMovie } from "@/types/movie";

export interface AdvancedFilters {
  genres: number[]; // TMDB genre IDs
  yearRange: [number, number]; // [1900, currentYear]
  ratingRange: [number, number]; // [0, 10]
  runtimeRange: [number, number]; // [0, 300] minutes
  language: string | null; // ISO 639-1 code
  providerId: number | null; // streaming provider
}

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  genres: [],
  yearRange: [1900, new Date().getFullYear()],
  ratingRange: [0, 10],
  runtimeRange: [0, 300],
  language: null,
  providerId: null,
};

interface SearchState {
  query: string;
  results: TMDBMovie[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  advancedFilters: AdvancedFilters;

  setQuery: (query: string) => void;
  setResults: (
    results: TMDBMovie[],
    totalResults: number,
    totalPages: number,
    currentPage: number,
  ) => void;
  appendResults: (results: TMDBMovie[], currentPage: number) => void;
  setSortBy: (sortBy: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Advanced filter actions
  setAdvancedFilters: (filters: Partial<AdvancedFilters>) => void;
  resetAdvancedFilters: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: "",
  results: [],
  totalResults: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  sortBy: "popularity.desc",
  advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },

  setQuery: (query) => set({ query }),
  setResults: (results, totalResults, totalPages, currentPage) =>
    set({ results, totalResults, totalPages, currentPage }),
  appendResults: (results, currentPage) =>
    set((state) => ({
      results: [...state.results, ...results],
      currentPage,
    })),
  setSortBy: (sortBy) => set({ sortBy }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      query: "",
      results: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
      isLoading: false,
      error: null,
      sortBy: "popularity.desc",
    }),

  setAdvancedFilters: (filters) =>
    set((state) => ({
      advancedFilters: { ...state.advancedFilters, ...filters },
    })),

  resetAdvancedFilters: () =>
    set({ advancedFilters: { ...DEFAULT_ADVANCED_FILTERS } }),
}));
