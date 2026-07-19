import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TasteProfile {
  genres: Record<number, number>;
  decades: Record<string, number>;
  directors: Record<number, number>;
  lastUpdated: number;
}

interface PreferencesState {
  preferredProvider: string | null;
  preferredGenre: string | null;
  myServices: number[];
  tasteProfile: TasteProfile;
  hasCompletedOnboarding: boolean;

  setPreferredProvider: (provider: string | null) => void;
  setPreferredGenre: (genre: string | null) => void;
  setMyServices: (services: number[]) => void;
  completeOnboarding: () => void;
  recordLove: (genres: number[], decade: string, directorId?: number) => void;
  recordNotInterested: (
    genres: number[],
    decade: string,
    directorId?: number,
  ) => void;
  importLegacy: (data: {
    preferredProvider: string | null;
    preferredGenre: string | null;
  }) => void;
}

const EMPTY_TASTE_PROFILE: TasteProfile = {
  genres: {},
  decades: {},
  directors: {},
  lastUpdated: 0,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferredProvider: null,
      preferredGenre: null,
      myServices: [],
      tasteProfile: { ...EMPTY_TASTE_PROFILE },
      hasCompletedOnboarding: false,

      setPreferredProvider: (provider) => set({ preferredProvider: provider }),
      setPreferredGenre: (genre) => set({ preferredGenre: genre }),
      setMyServices: (services) => set({ myServices: services }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      recordLove: (genres, decade, directorId) =>
        set((state) => {
          const tp: TasteProfile = {
            genres: { ...state.tasteProfile.genres },
            decades: { ...state.tasteProfile.decades },
            directors: { ...state.tasteProfile.directors },
            lastUpdated: Date.now(),
          };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) + 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) + 1;
          if (directorId != null) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) + 1;
          }
          return { tasteProfile: tp };
        }),

      recordNotInterested: (genres, decade, directorId) =>
        set((state) => {
          const tp: TasteProfile = {
            genres: { ...state.tasteProfile.genres },
            decades: { ...state.tasteProfile.decades },
            directors: { ...state.tasteProfile.directors },
            lastUpdated: Date.now(),
          };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) - 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) - 0.5;
          if (directorId != null) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) - 1;
          }
          return { tasteProfile: tp };
        }),

      importLegacy: (data) =>
        set({
          preferredProvider: data.preferredProvider,
          preferredGenre: data.preferredGenre,
        }),
    }),
    {
      name: "wmtw-preferences",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
