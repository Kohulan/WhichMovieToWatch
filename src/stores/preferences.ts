"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  preferredProvider: string | null;
  preferredGenre: string | null;
  region: string;
  hasCompletedSetup: boolean;

  setProvider: (provider: string | null) => void;
  setGenre: (genre: string | null) => void;
  setRegion: (region: string) => void;
  completeSetup: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      preferredProvider: null,
      preferredGenre: null,
      region: "US",
      hasCompletedSetup: false,

      setProvider: (provider) => set({ preferredProvider: provider }),
      setGenre: (genre) => set({ preferredGenre: genre }),
      setRegion: (region) => set({ region }),
      completeSetup: () => set({ hasCompletedSetup: true }),
    }),
    { name: "wmtw-preferences" }
  )
);
