"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HistoryState {
  lovedMovies: number[];
  watchedMovies: number[];
  skippedMovies: number[];
  shownMovies: number[];

  loveMovie: (id: number) => void;
  watchMovie: (id: number) => void;
  skipMovie: (id: number) => void;
  markShown: (id: number) => void;
  isShown: (id: number) => boolean;
  isLoved: (id: number) => boolean;
  clearHistory: () => void;
}

const MAX_SHOWN = 500;

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      lovedMovies: [],
      watchedMovies: [],
      skippedMovies: [],
      shownMovies: [],

      loveMovie: (id) =>
        set((s) => ({
          lovedMovies: s.lovedMovies.includes(id)
            ? s.lovedMovies
            : [...s.lovedMovies, id],
        })),

      watchMovie: (id) =>
        set((s) => ({
          watchedMovies: s.watchedMovies.includes(id)
            ? s.watchedMovies
            : [...s.watchedMovies, id],
        })),

      skipMovie: (id) =>
        set((s) => ({
          skippedMovies: s.skippedMovies.includes(id)
            ? s.skippedMovies
            : [...s.skippedMovies, id],
        })),

      markShown: (id) =>
        set((s) => {
          const updated = [...s.shownMovies, id];
          return { shownMovies: updated.slice(-MAX_SHOWN) };
        }),

      isShown: (id) => get().shownMovies.includes(id),
      isLoved: (id) => get().lovedMovies.includes(id),

      clearHistory: () =>
        set({ lovedMovies: [], watchedMovies: [], skippedMovies: [], shownMovies: [] }),
    }),
    { name: "wmtw-history" }
  )
);
