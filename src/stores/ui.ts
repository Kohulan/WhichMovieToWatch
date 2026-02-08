"use client";

import { create } from "zustand";

interface UIState {
  commandPaletteOpen: boolean;
  movieDetailId: number | null;
  theme: "dark" | "light" | "system";
  clayHue: number;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setMovieDetail: (id: number | null) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  setClayHue: (hue: number) => void;
}

export const useUI = create<UIState>()((set) => ({
  commandPaletteOpen: false,
  movieDetailId: null,
  theme: "dark",
  clayHue: 260,

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setMovieDetail: (id) => set({ movieDetailId: id }),
  setTheme: (theme) => set({ theme }),
  setClayHue: (hue) => set({ clayHue: hue }),
}));
