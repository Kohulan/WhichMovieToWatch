import { create } from 'zustand';
import type { TMDBMovie } from '@/types/movie';

interface SearchState {
  query: string;
  results: TMDBMovie[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  sortBy: string;

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
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  results: [],
  totalResults: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  sortBy: 'popularity.desc',

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
      query: '',
      results: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
      isLoading: false,
      error: null,
      sortBy: 'popularity.desc',
    }),
}));
