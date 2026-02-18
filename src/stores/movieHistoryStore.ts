import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_SHOWN_HISTORY = 2000;

interface MovieHistoryState {
  shownMovies: number[];
  watchedMovies: number[];
  lovedMovies: number[];
  notInterestedMovies: number[];

  hasBeenShown: (movieId: number) => boolean;
  trackShown: (movieId: number) => void;
  markWatched: (movieId: number) => void;
  markLoved: (movieId: number) => void;
  markNotInterested: (movieId: number) => void;
  removeWatched: (movieId: number) => void;
  removeLoved: (movieId: number) => void;
  removeNotInterested: (movieId: number) => void;
  importLegacy: (data: {
    shownMovies: number[];
    watchedMovies: number[];
    lovedMovies: number[];
    notInterestedMovies: number[];
  }) => void;
  getExcludeSet: () => Set<number>;
}

export const useMovieHistoryStore = create<MovieHistoryState>()(
  persist(
    (set, get) => ({
      shownMovies: [],
      watchedMovies: [],
      lovedMovies: [],
      notInterestedMovies: [],

      hasBeenShown: (movieId) => {
        const state = get();
        const excludeSet = new Set([
          ...state.shownMovies,
          ...state.watchedMovies,
          ...state.notInterestedMovies,
        ]);
        return excludeSet.has(movieId);
      },

      trackShown: (movieId) =>
        set((state) => {
          if (state.shownMovies.includes(movieId)) return state;
          const updated = [...state.shownMovies, movieId];
          return {
            shownMovies:
              updated.length > MAX_SHOWN_HISTORY
                ? updated.slice(-MAX_SHOWN_HISTORY)
                : updated,
          };
        }),

      markWatched: (movieId) =>
        set((state) =>
          state.watchedMovies.includes(movieId)
            ? state
            : { watchedMovies: [...state.watchedMovies, movieId] },
        ),

      markLoved: (movieId) =>
        set((state) =>
          state.lovedMovies.includes(movieId)
            ? state
            : { lovedMovies: [...state.lovedMovies, movieId] },
        ),

      markNotInterested: (movieId) =>
        set((state) =>
          state.notInterestedMovies.includes(movieId)
            ? state
            : { notInterestedMovies: [...state.notInterestedMovies, movieId] },
        ),

      removeWatched: (movieId) =>
        set((state) => ({
          watchedMovies: state.watchedMovies.filter((id) => id !== movieId),
        })),

      removeLoved: (movieId) =>
        set((state) => ({
          lovedMovies: state.lovedMovies.filter((id) => id !== movieId),
        })),

      removeNotInterested: (movieId) =>
        set((state) => ({
          notInterestedMovies: state.notInterestedMovies.filter(
            (id) => id !== movieId,
          ),
        })),

      importLegacy: (data) =>
        set({
          shownMovies: data.shownMovies.slice(-MAX_SHOWN_HISTORY),
          watchedMovies: data.watchedMovies,
          lovedMovies: data.lovedMovies,
          notInterestedMovies: data.notInterestedMovies,
        }),

      getExcludeSet: () => {
        const state = get();
        return new Set([
          ...state.shownMovies,
          ...state.watchedMovies,
          ...state.notInterestedMovies,
        ]);
      },
    }),
    {
      name: 'wmtw-movie-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        shownMovies: state.shownMovies,
        watchedMovies: state.watchedMovies,
        lovedMovies: state.lovedMovies,
        notInterestedMovies: state.notInterestedMovies,
      }),
    },
  ),
);
