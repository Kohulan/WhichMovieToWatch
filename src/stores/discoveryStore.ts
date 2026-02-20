import { create } from "zustand";
import type { TMDBMovieDetails } from "@/types/movie";

interface DiscoveryFilters {
  genreId: string | null;
  providerId: number | null;
  minRating: number;
  minVoteCount: number;
}

interface DiscoveryState {
  currentMovie: TMDBMovieDetails | null;
  isLoading: boolean;
  error: string | null;
  relaxationStep: number;
  filters: DiscoveryFilters;

  setCurrentMovie: (movie: TMDBMovieDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRelaxationStep: (step: number) => void;
  setFilters: (filters: Partial<DiscoveryFilters>) => void;
  reset: () => void;
}

const DEFAULT_FILTERS: DiscoveryFilters = {
  genreId: null,
  providerId: null,
  minRating: 6.0,
  minVoteCount: 500,
};

export const useDiscoveryStore = create<DiscoveryState>()((set) => ({
  currentMovie: null,
  isLoading: false,
  error: null,
  relaxationStep: 0,
  filters: { ...DEFAULT_FILTERS },

  setCurrentMovie: (movie) => set({ currentMovie: movie }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setRelaxationStep: (step) => set({ relaxationStep: step }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  reset: () =>
    set({
      currentMovie: null,
      isLoading: false,
      error: null,
      relaxationStep: 0,
      filters: { ...DEFAULT_FILTERS },
    }),
}));
